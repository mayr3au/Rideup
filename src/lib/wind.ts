/**
 * Logique du Spot Finder (fonctions pures, utilisables côté serveur et navigateur).
 * Vent en nœuds, directions en degrés (d'où vient le vent).
 */

export type HourForecast = { time: string; wind: number; gust: number; dir: number; code: number; temp: number };

export type Rider = {
  level: "debutant" | "intermediaire" | "avance" | "expert" | null;
  weightKg: number | null;
  kites: number[]; // tailles en m²
};

const COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
export function compass(deg: number) {
  return COMPASS[Math.round(((deg % 360) + 360) % 360 / 22.5) % 16];
}

export function angleDiff(a: number, b: number) {
  return Math.abs(((((a - b) % 360) + 540) % 360) - 180); // 0 = même direction, 180 = opposée
}

export type Orientation = "onshore" | "side-on" | "side" | "side-off" | "offshore";

/** Orientation du vent par rapport à la plage. seaBearing = direction plage → large. */
export function orientation(windFrom: number, seaBearing: number): Orientation {
  const a = angleDiff(windFrom, seaBearing); // 0 : le vent vient du large (onshore)
  if (a <= 25) return "onshore";
  if (a <= 65) return "side-on";
  if (a <= 105) return "side";
  if (a <= 135) return "side-off";
  return "offshore";
}

export const ORIENTATION_LABEL: Record<Orientation, string> = {
  onshore: "Onshore",
  "side-on": "Side-on",
  side: "Side-shore",
  "side-off": "Side-off",
  offshore: "Offshore",
};

/** Extrait les tailles de kite d'un texte libre : « 9 m, 12m et un 7 » → [7, 9, 12]. */
export function parseKites(quiver: string | null | undefined) {
  if (!quiver) return [];
  const out = new Set<number>();
  for (const m of quiver.matchAll(/(?<![\d.,])(\d{1,2}(?:[.,]\d)?)(?![\d])/g)) {
    const n = Number(m[1].replace(",", "."));
    if (n >= 3 && n <= 21) out.add(n);
  }
  return [...out].sort((a, b) => a - b);
}

/** Taille de kite idéale (règle usuelle twin-tip : poids × 2,2 / nœuds). */
export function idealKite(weightKg: number, windKn: number) {
  return (weightKg * 2.2) / windKn;
}

const LIMITS = {
  debutant: { min: 12, max: 22, gustSpread: 8 },
  intermediaire: { min: 12, max: 28, gustSpread: 12 },
  avance: { min: 11, max: 35, gustSpread: 15 },
  expert: { min: 10, max: 40, gustSpread: 18 },
} as const;

const LEVEL_RANK = { debutant: 0, intermediaire: 1, avance: 2, expert: 3 } as const;

export type HourVerdict = {
  ok: boolean;
  score: number; // 0–100
  kite: number | null; // taille conseillée dans le quiver (ou idéale)
  orientation: Orientation;
  warnings: string[];
};

export function rateHour(h: HourForecast, seaBearing: number, rider: Rider, spotMinLevel: keyof typeof LEVEL_RANK): HourVerdict {
  const level = rider.level ?? "intermediaire";
  const lim = LIMITS[level];
  const weight = rider.weightKg ?? 75;
  const o = orientation(h.dir, seaBearing);
  const warnings: string[] = [];
  let score = 100;

  if (o === "offshore") return { ok: false, score: 0, kite: null, orientation: o, warnings: ["Vent offshore : dangereux"] };
  if (o === "side-off") {
    if (LEVEL_RANK[level] < 2) return { ok: false, score: 0, kite: null, orientation: o, warnings: ["Side-off : réservé aux riders confirmés"] };
    warnings.push("Side-off : prévois une sécurité bateau");
    score -= 30;
  }
  if (o === "onshore") {
    warnings.push("Onshore : départs plus difficiles");
    score -= 15;
  }
  if (h.code >= 95) return { ok: false, score: 0, kite: null, orientation: o, warnings: ["Orage prévu"] };

  if (h.wind < lim.min) return { ok: false, score: 0, kite: null, orientation: o, warnings: ["Pas assez de vent"] };
  if (h.wind > lim.max) return { ok: false, score: 0, kite: null, orientation: o, warnings: ["Trop de vent pour ton niveau"] };

  const spread = h.gust - h.wind;
  if (spread > lim.gustSpread) return { ok: false, score: 0, kite: null, orientation: o, warnings: ["Rafales trop fortes"] };
  score -= Math.max(0, spread - 5) * 3;
  if (spread > 8) warnings.push(`Rafales à ${Math.round(h.gust)} nœuds`);

  if (LEVEL_RANK[spotMinLevel] > LEVEL_RANK[level]) {
    warnings.push("Spot exigeant pour ton niveau");
    score -= 25;
  }

  // Taille de kite : la plus proche de l'idéal dans le quiver
  const ideal = idealKite(weight, h.wind);
  let kite: number | null = Math.round(ideal);
  if (rider.kites.length) {
    const best = rider.kites.reduce((a, b) => (Math.abs(b - ideal) < Math.abs(a - ideal) ? b : a));
    const gap = Math.abs(best - ideal);
    if (gap > 3) return { ok: false, score: 0, kite: null, orientation: o, warnings: [`Il te faudrait un ${Math.round(ideal)} m`] };
    score -= gap * 8;
    kite = best;
  }

  // Bonus au cœur de la plage de vent
  if (h.wind >= 15 && h.wind <= 25) score += 5;

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { ok: score >= 40, score, kite, orientation: o, warnings };
}

export type DaySummary = {
  date: string; // YYYY-MM-DD
  goodHours: number;
  bestScore: number;
  window: { from: string; to: string } | null; // meilleure plage horaire continue
  avgWind: number | null; // sur la plage
  maxGust: number | null;
  dir: number | null;
  kite: number | null;
  orientation: Orientation | null;
  warnings: string[];
};

/** Résumé d'une journée (8 h – 20 h, heure locale du spot). */
export function summarizeDay(
  hours: HourForecast[],
  date: string,
  seaBearing: number,
  rider: Rider,
  spotMinLevel: keyof typeof LEVEL_RANK,
): DaySummary {
  const day = hours.filter((h) => h.time.startsWith(date) && Number(h.time.slice(11, 13)) >= 8 && Number(h.time.slice(11, 13)) <= 20);
  const rated = day.map((h) => ({ h, v: rateHour(h, seaBearing, rider, spotMinLevel) }));

  let best: typeof rated = [];
  let cur: typeof rated = [];
  for (const r of rated) {
    if (r.v.ok) {
      cur.push(r);
      if (cur.length > best.length || (cur.length === best.length && avg(cur) > avg(best))) best = [...cur];
    } else cur = [];
  }

  const warnings = new Set<string>();
  (best.length ? best : rated).forEach((r) => r.v.warnings.forEach((w) => warnings.add(w)));

  return {
    date,
    goodHours: rated.filter((r) => r.v.ok).length,
    bestScore: rated.reduce((m, r) => Math.max(m, r.v.score), 0),
    window: best.length ? { from: best[0].h.time.slice(11, 16), to: best.at(-1)!.h.time.slice(11, 16) } : null,
    avgWind: best.length ? Math.round(best.reduce((s, r) => s + r.h.wind, 0) / best.length) : null,
    maxGust: best.length ? Math.round(Math.max(...best.map((r) => r.h.gust))) : null,
    dir: best.length ? best[Math.floor(best.length / 2)].h.dir : null,
    kite: best.length ? mode(best.map((r) => r.v.kite).filter((k): k is number => k != null)) : null,
    orientation: best.length ? best[Math.floor(best.length / 2)].v.orientation : null,
    warnings: [...warnings].slice(0, 3),
  };
}

function avg(list: { v: HourVerdict }[]) {
  return list.length ? list.reduce((s, r) => s + r.v.score, 0) / list.length : 0;
}

function mode(values: number[]) {
  if (!values.length) return null;
  const m = new Map<number, number>();
  values.forEach((v) => m.set(v, (m.get(v) ?? 0) + 1));
  return [...m.entries()].sort((a, b) => b[1] - a[1])[0][0];
}

/** Distance en km entre deux points (haversine). */
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number) {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function weatherLabel(code: number) {
  if (code === 0) return "Grand soleil";
  if (code <= 3) return "Nuageux";
  if (code <= 48) return "Brouillard";
  if (code <= 67) return "Pluie";
  if (code <= 77) return "Neige";
  if (code <= 82) return "Averses";
  return "Orage";
}
