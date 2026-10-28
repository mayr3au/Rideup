/**
 * Moteur du Spot Finder (fonctions pures, serveur et navigateur).
 * - Sports de vent (kitesurf, wingfoil, foil) : force, rafales, orientation, taille de matériel.
 * - Surf : hauteur et période de houle, direction, vent (offshore = propre).
 * - Wakeboard (téléski) : météo seulement (orage, pluie, température).
 * Vent en nœuds, houle en mètres et secondes, directions = d'où ça vient (degrés).
 */

import { SPORTS, type Level, type SportId } from "./sports";

export type HourForecast = {
  time: string;
  wind: number;
  gust: number;
  dir: number;
  code: number;
  temp: number;
  wave?: number | null;
  period?: number | null;
  swellDir?: number | null;
};

export type Rider = {
  sport: SportId;
  level: Level | null;
  weightKg: number | null;
  gear: number[]; // tailles d'aile ou de kite (m²)
};

export type SpotLike = { sea_bearing: number; min_level: "debutant" | "intermediaire" | "avance" };

const COMPASS = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSO", "SO", "OSO", "O", "ONO", "NO", "NNO"];
export function compass(deg: number) {
  return COMPASS[Math.round((((deg % 360) + 360) % 360) / 22.5) % 16];
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

const LEVEL_RANK = { debutant: 0, intermediaire: 1, avance: 2, expert: 3 } as const;

/* ───────────────────────── Sports de vent ───────────────────────── */

type WindRule = {
  limits: Record<Level, { min: number; max: number; gustSpread: number }>;
  /** Taille de matériel idéale (m²) */
  ideal: (weightKg: number, windKn: number) => number;
  /** Écart toléré entre l'idéal et le matériel du rider */
  tolerance: number;
  gearName: string;
};

const WIND_RULES: Partial<Record<SportId, WindRule>> = {
  kitesurf: {
    limits: {
      debutant: { min: 12, max: 22, gustSpread: 8 },
      intermediaire: { min: 12, max: 28, gustSpread: 12 },
      avance: { min: 11, max: 35, gustSpread: 15 },
      expert: { min: 10, max: 40, gustSpread: 18 },
    },
    ideal: (w, kn) => (w * 2.2) / kn,
    tolerance: 3,
    gearName: "kite",
  },
  wingfoil: {
    limits: {
      debutant: { min: 12, max: 22, gustSpread: 8 },
      intermediaire: { min: 11, max: 27, gustSpread: 11 },
      avance: { min: 10, max: 32, gustSpread: 14 },
      expert: { min: 9, max: 38, gustSpread: 16 },
    },
    ideal: (w, kn) => w / kn,
    tolerance: 1.5,
    gearName: "aile",
  },
  foil: {
    limits: {
      debutant: { min: 9, max: 18, gustSpread: 7 },
      intermediaire: { min: 8, max: 22, gustSpread: 9 },
      avance: { min: 7, max: 26, gustSpread: 11 },
      expert: { min: 6, max: 30, gustSpread: 13 },
    },
    ideal: (w, kn) => (w * 1.6) / kn,
    tolerance: 3,
    gearName: "kite",
  },
};

export type HourVerdict = {
  ok: boolean;
  score: number; // 0–100
  gear: number | null; // taille conseillée (m²) pour les sports de vent
  gearName: string | null;
  orientation: Orientation | null;
  warnings: string[];
};

const no = (orientation: Orientation | null, warning: string): HourVerdict => ({
  ok: false,
  score: 0,
  gear: null,
  gearName: null,
  orientation,
  warnings: [warning],
});

function rateWind(h: HourForecast, spot: SpotLike, rider: Rider, rule: WindRule): HourVerdict {
  const level = rider.level ?? "intermediaire";
  const lim = rule.limits[level];
  const weight = rider.weightKg ?? 75;
  const o = orientation(h.dir, spot.sea_bearing);
  const warnings: string[] = [];
  let score = 100;

  if (h.code >= 95) return no(o, "Orage prévu");
  if (o === "offshore") return no(o, "Vent offshore : dangereux");
  if (o === "side-off") {
    if (LEVEL_RANK[level] < 2) return no(o, "Side-off : réservé aux riders confirmés");
    warnings.push("Side-off : prévois une sécurité bateau");
    score -= 30;
  }
  if (o === "onshore") {
    warnings.push("Onshore : départs plus difficiles");
    score -= 15;
  }

  if (h.wind < lim.min) return no(o, "Pas assez de vent");
  if (h.wind > lim.max) return no(o, "Trop de vent pour ton niveau");

  const spread = h.gust - h.wind;
  if (spread > lim.gustSpread) return no(o, "Rafales trop fortes");
  score -= Math.max(0, spread - 5) * 3;
  if (spread > 8) warnings.push(`Rafales à ${Math.round(h.gust)} nœuds`);

  if (LEVEL_RANK[spot.min_level] > LEVEL_RANK[level]) {
    warnings.push("Spot exigeant pour ton niveau");
    score -= 25;
  }

  const ideal = rule.ideal(weight, h.wind);
  let gear: number | null = Math.round(ideal * 2) / 2;
  if (rider.gear.length) {
    const best = rider.gear.reduce((a, b) => (Math.abs(b - ideal) < Math.abs(a - ideal) ? b : a));
    const gap = Math.abs(best - ideal);
    if (gap > rule.tolerance) return no(o, `Il te faudrait une ${rule.gearName} de ${Math.round(ideal * 2) / 2} m²`);
    score -= (gap / rule.tolerance) * 25;
    gear = best;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { ok: score >= 40, score, gear, gearName: rule.gearName, orientation: o, warnings };
}

/* ───────────────────────── Surf ───────────────────────── */

const SURF_WAVES: Record<Level, { min: number; max: number }> = {
  debutant: { min: 0.3, max: 1.0 },
  intermediaire: { min: 0.5, max: 1.8 },
  avance: { min: 0.8, max: 3.0 },
  expert: { min: 1.0, max: 6.0 },
};

function rateSurf(h: HourForecast, spot: SpotLike, rider: Rider): HourVerdict {
  const level = rider.level ?? "intermediaire";
  const w = SURF_WAVES[level];
  const o = orientation(h.dir, spot.sea_bearing);
  const warnings: string[] = [];
  let score = 100;

  if (h.code >= 95) return no(o, "Orage prévu");
  if (h.wave == null) return no(o, "Pas de prévision de houle ici");
  if (h.swellDir != null && angleDiff(h.swellDir, spot.sea_bearing) > 85) return no(o, "Houle mal orientée pour ce spot");
  if (h.wave < w.min) return no(o, "Trop petit");
  if (h.wave > w.max) return no(o, "Trop gros pour ton niveau");

  const period = h.period ?? 0;
  if (period < 6) {
    warnings.push("Houle courte, vagues molles");
    score -= 30;
  } else if (period >= 10) score += 5;

  // Vent : offshore léger = vagues propres, onshore fort = vagues hachées
  if ((o === "onshore" || o === "side-on") && h.wind > 12) {
    warnings.push("Vent onshore, vagues hachées");
    score -= h.wind > 20 ? 50 : 30;
  } else if ((o === "offshore" || o === "side-off") && h.wind > 25) {
    warnings.push("Offshore très fort, difficile de rentrer dans les vagues");
    score -= 25;
  } else if (o === "offshore" || o === "side-off" || h.wind < 6) {
    score += 5;
  }

  if (LEVEL_RANK[spot.min_level] > LEVEL_RANK[level]) {
    warnings.push("Spot exigeant pour ton niveau");
    score -= 25;
  }

  score = Math.max(0, Math.min(100, Math.round(score)));
  return { ok: score >= 40, score, gear: null, gearName: null, orientation: o, warnings };
}

/* ───────────────────────── Wakeboard (téléski) ───────────────────────── */

function rateCable(h: HourForecast): HourVerdict {
  if (h.code >= 95) return no(null, "Orage prévu");
  const warnings: string[] = [];
  let score = 100;
  if (h.code >= 61) {
    warnings.push("Pluie");
    score -= 30;
  }
  if (h.temp < 12) {
    warnings.push("Frais, combinaison conseillée");
    score -= 15;
  }
  if (h.wind > 25) {
    warnings.push("Vent fort sur le plan d'eau");
    score -= 20;
  }
  return { ok: score >= 40, score: Math.max(0, score), gear: null, gearName: null, orientation: null, warnings };
}

export function rateHour(h: HourForecast, spot: SpotLike, rider: Rider): HourVerdict {
  const kind = SPORTS[rider.sport].spot;
  if (kind === "waves") return rateSurf(h, spot, rider);
  if (kind === "cable") return rateCable(h);
  return rateWind(h, spot, rider, WIND_RULES[rider.sport]!);
}

/* ───────────────────────── Résumé d'une journée ───────────────────────── */

export type DaySummary = {
  date: string; // YYYY-MM-DD
  goodHours: number;
  bestScore: number;
  window: { from: string; to: string } | null; // meilleure plage horaire continue
  avgWind: number | null;
  maxGust: number | null;
  dir: number | null;
  avgWave: number | null;
  period: number | null;
  gear: number | null;
  gearName: string | null;
  orientation: Orientation | null;
  warnings: string[];
};

/** Résumé d'une journée (8 h – 20 h, heure locale du spot). */
export function summarizeDay(hours: HourForecast[], date: string, spot: SpotLike, rider: Rider): DaySummary {
  const day = hours.filter((h) => h.time.startsWith(date) && Number(h.time.slice(11, 13)) >= 8 && Number(h.time.slice(11, 13)) <= 20);
  const rated = day.map((h) => ({ h, v: rateHour(h, spot, rider) }));

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
  const mid = best.length ? best[Math.floor(best.length / 2)] : null;
  const mean = (f: (h: HourForecast) => number | null | undefined) => {
    const vals = best.map((r) => f(r.h)).filter((x): x is number => x != null);
    return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : null;
  };

  return {
    date,
    goodHours: rated.filter((r) => r.v.ok).length,
    bestScore: rated.reduce((m, r) => Math.max(m, r.v.score), 0),
    // Fin du créneau = fin de la dernière heure ridable (une heure de 17:00 → « 17:00 – 18:00 »)
    window: best.length ? { from: best[0].h.time.slice(11, 16), to: endOfHour(best.at(-1)!.h.time) } : null,
    avgWind: best.length ? Math.round(mean((h) => h.wind)!) : null,
    maxGust: best.length ? Math.round(Math.max(...best.map((r) => r.h.gust))) : null,
    dir: mid?.h.dir ?? null,
    avgWave: mean((h) => h.wave) != null ? Math.round(mean((h) => h.wave)! * 10) / 10 : null,
    period: mean((h) => h.period) != null ? Math.round(mean((h) => h.period)!) : null,
    gear: best.length ? mode(best.map((r) => r.v.gear).filter((k): k is number => k != null)) : null,
    gearName: mid?.v.gearName ?? null,
    orientation: mid?.v.orientation ?? null,
    warnings: [...warnings].slice(0, 3),
  };
}

function endOfHour(time: string) {
  const h = Number(time.slice(11, 13)) + 1;
  return `${String(h).padStart(2, "0")}:00`;
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
