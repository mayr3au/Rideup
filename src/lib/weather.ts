import "server-only";
import type { HourForecast } from "@/lib/wind";

/**
 * Open-Meteo : gratuit pour un usage non commercial. Pour un site payant, prendre une clé
 * (open-meteo.com/en/pricing) et la mettre dans OPEN_METEO_API_KEY.
 */
const KEY = process.env.OPEN_METEO_API_KEY;
const BASE = KEY ? "https://customer-api.open-meteo.com/v1/forecast" : "https://api.open-meteo.com/v1/forecast";

/** `water: "lac"` (téléskis, plans d'eau intérieurs) → point de grille terrestre ; sinon point en mer. */
type Point = { lat: number; lng: number; water?: string | null };

/**
 * Prévisions croisées de 4 modèles, pour ne pas dépendre d'un seul :
 * - Météo-France AROME/ARPEGE (1,5 à 2,5 km sur la France : brises thermiques, effets de côte) ;
 * - DWD ICON (Allemagne) ; ECMWF IFS (centre européen) ; NOAA GFS (États-Unis).
 * Le vent retenu est une moyenne pondérée (AROME compte double quand il couvre la zone),
 * et l'écart entre modèles donne la fiabilité de la prévision.
 */
export const MODELS = [
  { id: "meteofrance_seamless", label: "Météo-France AROME", weight: 2 },
  { id: "icon_seamless", label: "DWD ICON", weight: 1 },
  { id: "ecmwf_ifs025", label: "ECMWF", weight: 1 },
  { id: "gfs_seamless", label: "NOAA GFS", weight: 1 },
] as const;
export type ModelId = (typeof MODELS)[number]["id"];

const VARS = ["wind_speed_10m", "wind_gusts_10m", "wind_direction_10m", "weather_code", "temperature_2m"] as const;

type ApiResult = {
  utc_offset_seconds: number;
  hourly: { time: string[] } & Record<string, (number | null)[] | string[]>;
};

/** Moyenne de directions (degrés) pondérée, sur le cercle : 350° et 10° donnent 0°, pas 180°. */
function circularMean(values: { v: number; w: number }[]) {
  let x = 0;
  let y = 0;
  for (const { v, w } of values) {
    x += Math.cos((v * Math.PI) / 180) * w;
    y += Math.sin((v * Math.PI) / 180) * w;
  }
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

/** Combine les modèles disponibles pour une heure. */
function consensus(r: ApiResult, k: number): Omit<HourForecast, "time"> {
  const get = (v: string, m: string) => {
    const arr = r.hourly[`${v}_${m}`] as (number | null)[] | undefined;
    const x = arr?.[k];
    return typeof x === "number" && Number.isFinite(x) ? x : null;
  };
  const wind: { v: number; w: number; m: ModelId }[] = [];
  const gust: { v: number; w: number }[] = [];
  const dir: { v: number; w: number }[] = [];
  for (const m of MODELS) {
    const ws = get("wind_speed_10m", m.id);
    if (ws == null) continue;
    wind.push({ v: ws, w: m.weight, m: m.id });
    const g = get("wind_gusts_10m", m.id);
    if (g != null) gust.push({ v: g, w: m.weight });
    const d = get("wind_direction_10m", m.id);
    if (d != null) dir.push({ v: d, w: m.weight });
  }
  const wavg = (l: { v: number; w: number }[]) => (l.length ? l.reduce((s, x) => s + x.v * x.w, 0) / l.reduce((s, x) => s + x.w, 0) : 0);
  const first = (v: string) => {
    for (const m of MODELS) {
      const x = get(v, m.id);
      if (x != null) return x;
    }
    return 0;
  };
  const speeds = wind.map((x) => x.v);
  const w = wavg(wind);
  return {
    wind: w,
    // Rafales jamais sous le vent moyen (certains modèles ne les fournissent pas)
    gust: Math.max(w, wavg(gust)),
    dir: dir.length ? circularMean(dir) : 0,
    code: first("weather_code"),
    temp: first("temperature_2m"),
    spread: speeds.length > 1 ? Math.max(...speeds) - Math.min(...speeds) : null,
    models: Object.fromEntries(wind.map((x) => [x.m, Math.round(x.v)])) as Partial<Record<ModelId, number>>,
  };
}

/** Prévisions horaires (7 jours) pour une liste de points, en heure locale de chaque point. */
export async function getForecasts(points: Point[]): Promise<HourForecast[][]> {
  const out: HourForecast[][] = new Array(points.length);
  const groups = [
    { cell: "sea", idx: points.map((p, i) => (p.water === "lac" ? -1 : i)).filter((i) => i >= 0) },
    { cell: "land", idx: points.map((p, i) => (p.water === "lac" ? i : -1)).filter((i) => i >= 0) },
  ];
  for (const g of groups) {
    for (let i = 0; i < g.idx.length; i += 25) {
      const ids = g.idx.slice(i, i + 25);
      const res = await fetchBatch(ids.map((k) => points[k]), g.cell);
      res.forEach((hours, k) => (out[ids[k]] = hours));
    }
  }
  return out;
}

async function fetchBatch(batch: Point[], cell: string): Promise<HourForecast[][]> {
  const params = new URLSearchParams({
    latitude: batch.map((p) => p.lat.toFixed(3)).join(","),
    longitude: batch.map((p) => p.lng.toFixed(3)).join(","),
    hourly: VARS.join(","),
    models: MODELS.map((m) => m.id).join(","),
    wind_speed_unit: "kn",
    timezone: "auto",
    forecast_days: "7",
    // En mer pour les spots côtiers : le vent du plan d'eau, pas celui de l'arrière-pays freiné par le relief
    cell_selection: cell,
  });
  if (KEY) params.set("apikey", KEY);

  const res = await fetch(`${BASE}?${params}`, { next: { revalidate: 1800 } });
  if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
  const json = (await res.json()) as ApiResult | ApiResult[];
  const list = Array.isArray(json) ? json : [json];
  return list.map((r) => r.hourly.time.map((t, k) => ({ time: t, ...consensus(r, k) })));
}

type MarineResult = {
  hourly: {
    time: string[];
    wave_height: (number | null)[];
    wave_period: (number | null)[];
    wave_direction: (number | null)[];
    swell_wave_period?: (number | null)[];
    swell_wave_direction?: (number | null)[];
  };
};

const MARINE = KEY ? "https://customer-marine-api.open-meteo.com/v1/marine" : "https://marine-api.open-meteo.com/v1/marine";

/** Houle horaire (7 jours), même découpage horaire que getForecasts. */
async function getMarine(points: Point[]) {
  const out: Map<string, { wave: number | null; period: number | null; swellDir: number | null }>[] = [];
  for (let i = 0; i < points.length; i += 50) {
    const batch = points.slice(i, i + 50);
    const params = new URLSearchParams({
      latitude: batch.map((p) => p.lat.toFixed(3)).join(","),
      longitude: batch.map((p) => p.lng.toFixed(3)).join(","),
      hourly: "wave_height,wave_period,wave_direction,swell_wave_period,swell_wave_direction",
      timezone: "auto",
      forecast_days: "7",
    });
    if (KEY) params.set("apikey", KEY);
    const res = await fetch(`${MARINE}?${params}`, { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error(`Open-Meteo Marine ${res.status}`);
    const json = (await res.json()) as MarineResult | MarineResult[];
    for (const r of Array.isArray(json) ? json : [json]) {
      const h = r.hourly;
      const m = new Map<string, { wave: number | null; period: number | null; swellDir: number | null }>();
      h.time.forEach((t, k) =>
        m.set(t, {
          wave: h.wave_height[k] ?? null,
          period: h.swell_wave_period?.[k] ?? h.wave_period[k] ?? null,
          swellDir: h.swell_wave_direction?.[k] ?? h.wave_direction[k] ?? null,
        }),
      );
      out.push(m);
    }
  }
  return out;
}

/** Prévisions complètes : vent et météo, plus la houle si `withWaves`. */
export async function getConditions(points: Point[], withWaves: boolean): Promise<HourForecast[][]> {
  if (!withWaves) return getForecasts(points);
  const [weather, marine] = await Promise.all([getForecasts(points), getMarine(points)]);
  return weather.map((hours, i) => hours.map((h) => ({ ...h, ...(marine[i]?.get(h.time) ?? { wave: null, period: null, swellDir: null }) })));
}

/** Ville → coordonnées. */
export async function geocode(name: string) {
  const params = new URLSearchParams({ name, count: "1", language: "fr", format: "json" });
  const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`, { next: { revalidate: 86400 } });
  if (!res.ok) return null;
  const json = (await res.json()) as { results?: { name: string; latitude: number; longitude: number; country?: string }[] };
  const r = json.results?.[0];
  return r ? { lat: r.latitude, lng: r.longitude, label: r.country ? `${r.name}, ${r.country}` : r.name } : null;
}

/** Dates (YYYY-MM-DD) du prochain week-end, ou du week-end en cours. */
export function weekendDates(now = new Date()) {
  const d = new Date(now);
  const day = d.getUTCDay(); // 0 dimanche, 6 samedi
  if (day === 0) d.setUTCDate(d.getUTCDate() - 1);
  else d.setUTCDate(d.getUTCDate() + ((6 - day + 7) % 7));
  const sat = d.toISOString().slice(0, 10);
  d.setUTCDate(d.getUTCDate() + 1);
  return [sat, d.toISOString().slice(0, 10)];
}
