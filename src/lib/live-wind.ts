import "server-only";
import { distanceKm } from "@/lib/wind";

/**
 * Vent mesuré en direct par les balises proches d'un spot, via winds.mobi, qui agrège les réseaux
 * de stations (OpenWindMap/Pioupiou, METAR des aéroports, FFVL, Holfuy…).
 * On ne garde que les réseaux dont la licence permet un usage commercial avec attribution
 * (LIVE_WIND_PROVIDERS pour en ajouter, après avoir vérifié leurs conditions).
 */
const PROVIDERS = (process.env.LIVE_WIND_PROVIDERS ?? "openwindmap.org,aviationweather.gov")
  .split(",")
  .map((p) => p.trim())
  .filter(Boolean);

/** Une balise à plus de 12 km ou une mesure de plus de 75 min ne dit plus grand-chose du spot. */
const MAX_DISTANCE_KM = 12;
const MAX_AGE_MIN = 75;
const KMH_TO_KN = 1 / 1.852;

export type LiveWind = {
  station: string;
  provider: string;
  distanceKm: number;
  wind: number; // nœuds
  gust: number | null; // nœuds
  dir: number | null; // d'où vient le vent (degrés)
  minutesAgo: number;
};

type Station = {
  _id: string;
  short?: string;
  name?: string;
  "pv-name"?: string;
  peak?: boolean;
  status?: string;
  loc?: { coordinates?: [number, number] };
  last?: { _id?: number; "w-avg"?: number; "w-max"?: number; "w-dir"?: number };
};

/** Mesure la plus proche et la plus récente pour un point, ou null. */
export async function getLiveWind(lat: number, lng: number): Promise<LiveWind | null> {
  const params = new URLSearchParams({ "near-lat": lat.toFixed(4), "near-lon": lng.toFixed(4), limit: "12" });
  try {
    const res = await fetch(`https://winds.mobi/api/2.3/stations/?${params}`, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const stations = (await res.json()) as Station[];
    const now = Date.now() / 1000;
    for (const s of stations) {
      const provider = s["pv-name"] ?? "";
      const [slng, slat] = s.loc?.coordinates ?? [];
      const at = s.last?._id;
      const avg = s.last?.["w-avg"];
      if (!PROVIDERS.includes(provider) || s.peak || s.status === "red") continue;
      if (slat == null || slng == null || at == null || avg == null) continue;
      const d = distanceKm(lat, lng, slat, slng);
      const age = (now - at) / 60;
      if (d > MAX_DISTANCE_KM || age > MAX_AGE_MIN || age < -5) continue;
      return {
        station: s.short || s.name || s._id,
        provider,
        distanceKm: d,
        wind: Math.round(avg * KMH_TO_KN),
        gust: s.last?.["w-max"] != null ? Math.round(s.last["w-max"]! * KMH_TO_KN) : null,
        dir: s.last?.["w-dir"] ?? null,
        minutesAgo: Math.max(0, Math.round(age)),
      };
    }
  } catch {
    /* réseau indisponible : on affiche seulement la prévision */
  }
  return null;
}

/** Mesures pour plusieurs spots (les plus proches seulement, pour rester léger). */
export async function getLiveWinds(points: { id: string; lat: number; lng: number }[], max = 15) {
  const list = points.slice(0, max);
  const results = await Promise.all(list.map((p) => getLiveWind(p.lat, p.lng)));
  return new Map(list.map((p, i) => [p.id, results[i]]));
}

export const LIVE_ATTRIBUTION =
  "Mesures en direct : winds.mobi, réseau OpenWindMap (openwindmap.org) et METAR des aéroports (NOAA).";
export const FORECAST_ATTRIBUTION =
  "Prévisions : Météo-France AROME, DWD ICON, ECMWF et NOAA GFS via Open-Meteo. Spots : RIDE'UP et contributeurs OpenStreetMap (ODbL).";
