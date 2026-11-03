import "server-only";
import { distanceKm } from "@/lib/wind";

/**
 * Spots de glisse cartographiés dans OpenStreetMap (données © contributeurs OpenStreetMap, licence ODbL).
 * Pour chaque spot, l'orientation (direction plage → large) est calculée à partir du trait de côte le plus proche :
 * dans OSM, la terre est à gauche du sens de tracé d'une ligne de côte, la mer à droite.
 */
const OVERPASS = process.env.OVERPASS_URL ?? "https://overpass-api.de/api/interpreter";

type El = {
  type: "node" | "way" | "relation";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
  geometry?: { lat: number; lon: number }[];
};

export type OsmSpot = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  sports: string[];
  sea_bearing: number;
  coastDistanceKm: number;
};

const SPORT_MAP: Record<string, string[]> = {
  kitesurfing: ["kitesurf", "foil", "wingfoil"],
  windsurfing: ["wingfoil"],
  surfing: ["surf"],
};

async function overpass(query: string) {
  const res = await fetch(OVERPASS, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded", "User-Agent": "RIDEUP-spot-import/1.0" },
    body: new URLSearchParams({ data: query }),
    signal: AbortSignal.timeout(90_000),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Overpass ${res.status}`);
  return ((await res.json()) as { elements: El[] }).elements;
}

function bearing(lat1: number, lng1: number, lat2: number, lng2: number) {
  const r = Math.PI / 180;
  const y = Math.sin((lng2 - lng1) * r) * Math.cos(lat2 * r);
  const x = Math.cos(lat1 * r) * Math.sin(lat2 * r) - Math.sin(lat1 * r) * Math.cos(lat2 * r) * Math.cos((lng2 - lng1) * r);
  return ((Math.atan2(y, x) / r) + 360) % 360;
}

/** Orientation vers le large à partir du segment de côte le plus proche, ou null si pas de côte à moins de 3 km. */
function seaBearingFor(lat: number, lng: number, coasts: El[]) {
  let best: { d: number; b: number } | null = null;
  for (const w of coasts) {
    const g = w.geometry ?? [];
    for (let i = 0; i < g.length - 1; i++) {
      const mLat = (g[i].lat + g[i + 1].lat) / 2;
      const mLng = (g[i].lon + g[i + 1].lon) / 2;
      const d = distanceKm(lat, lng, mLat, mLng);
      if (!best || d < best.d) best = { d, b: (bearing(g[i].lat, g[i].lon, g[i + 1].lat, g[i + 1].lon) + 90) % 360 };
    }
  }
  return best && best.d <= 3 ? { bearing: Math.round(best.b), distance: best.d } : null;
}

/** Spots de kite, windsurf (→ wing) et surf d'un pays (code ISO, ex. « FR »). */
export async function fetchOsmSpots(country = "FR"): Promise<OsmSpot[]> {
  const els = await overpass(`
    [out:json][timeout:80];
    area["ISO3166-1"="${country.replace(/[^A-Z]/g, "")}"][admin_level=2]->.c;
    nwr["sport"~"kitesurfing|windsurfing|surfing"]["name"](area.c)->.s;
    .s out center tags;
    way(around.s:3000)["natural"="coastline"];
    out geom;
  `);
  const coasts = els.filter((e) => e.type === "way" && e.tags?.natural === "coastline");
  const spots: OsmSpot[] = [];
  for (const e of els) {
    const t = e.tags ?? {};
    if (!t.sport || !t.name || t.natural === "coastline") continue;
    const lat = e.lat ?? e.center?.lat;
    const lng = e.lon ?? e.center?.lon;
    if (lat == null || lng == null) continue;
    const sports = [...new Set(t.sport.split(";").flatMap((s) => SPORT_MAP[s.trim()] ?? []))];
    if (!sports.length) continue;
    const sea = seaBearingFor(lat, lng, coasts);
    if (!sea) continue; // lacs et spots intérieurs : orientation impossible à calculer, à ajouter à la main
    spots.push({ id: `osm-${e.type[0]}${e.id}`, name: t.name, lat, lng, sports, sea_bearing: sea.bearing, coastDistanceKm: sea.distance });
  }
  return spots;
}
