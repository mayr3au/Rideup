import "server-only";
import type { HourForecast } from "@/lib/wind";

/**
 * Open-Meteo : gratuit pour un usage non commercial. Pour un site payant, prendre une clé
 * (open-meteo.com/en/pricing) et la mettre dans OPEN_METEO_API_KEY.
 */
const KEY = process.env.OPEN_METEO_API_KEY;
const BASE = KEY ? "https://customer-api.open-meteo.com/v1/forecast" : "https://api.open-meteo.com/v1/forecast";

type Point = { lat: number; lng: number };

type ApiResult = {
  utc_offset_seconds: number;
  hourly: {
    time: string[];
    wind_speed_10m: number[];
    wind_gusts_10m: number[];
    wind_direction_10m: number[];
    weather_code: number[];
    temperature_2m: number[];
  };
};

/** Prévisions horaires (7 jours) pour une liste de points, en heure locale de chaque point. */
export async function getForecasts(points: Point[]): Promise<HourForecast[][]> {
  const out: HourForecast[][] = [];
  for (let i = 0; i < points.length; i += 50) {
    const batch = points.slice(i, i + 50);
    const params = new URLSearchParams({
      latitude: batch.map((p) => p.lat.toFixed(3)).join(","),
      longitude: batch.map((p) => p.lng.toFixed(3)).join(","),
      hourly: "wind_speed_10m,wind_gusts_10m,wind_direction_10m,weather_code,temperature_2m",
      wind_speed_unit: "kn",
      timezone: "auto",
      forecast_days: "7",
    });
    if (KEY) params.set("apikey", KEY);

    const res = await fetch(`${BASE}?${params}`, { next: { revalidate: 1800 } });
    if (!res.ok) throw new Error(`Open-Meteo ${res.status}`);
    const json = (await res.json()) as ApiResult | ApiResult[];
    const list = Array.isArray(json) ? json : [json];
    for (const r of list) {
      const h = r.hourly;
      out.push(
        h.time.map((t, k) => ({
          time: t,
          wind: h.wind_speed_10m[k] ?? 0,
          gust: h.wind_gusts_10m[k] ?? 0,
          dir: h.wind_direction_10m[k] ?? 0,
          code: h.weather_code[k] ?? 0,
          temp: h.temperature_2m[k] ?? 0,
        })),
      );
    }
  }
  return out;
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
