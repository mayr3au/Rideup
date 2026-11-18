/**
 * Cas réels relevés à l'audit du 18/11/2026 : le Spot Finder ne doit jamais donner « Go ! »
 * ni de taille d'aile quand le vent est irrégulier, et doit traiter le vent de terre selon le niveau.
 * Lancer : npm test
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { dayStatus, summarizeDay, type HourForecast, type Rider, type SpotLike } from "../src/lib/wind";

const MODELS = { meteofrance_seamless: 0, icon_seamless: 0, ecmwf_ifs025: 0, gfs_seamless: 0 };

/** Une journée de 8 h à 20 h au même vent. */
function day(wind: number, gust: number, dir: number, spread = 2): HourForecast[] {
  return Array.from({ length: 13 }, (_, k) => ({
    time: `2026-11-18T${String(8 + k).padStart(2, "0")}:00`,
    wind,
    gust,
    dir,
    code: 1,
    temp: 18,
    spread,
    models: Object.fromEntries(Object.keys(MODELS).map((m) => [m, wind])),
  }));
}

// Plage orientée plein sud (le large est au sud) : vent de S = onshore, de O = side-shore, de N = offshore
const beach: SpotLike = { sea_bearing: 180, min_level: "debutant", water: "chop" };
const rider = (level: Rider["level"]): Rider => ({ sport: "kitesurf", level, weightKg: 75, gear: [8, 10, 12] });

test("La Croisette, 18/11 : 19 nds rafales 32 → ni « Go ! » ni taille d'aile, même pour un rider avancé", () => {
  const d = summarizeDay(day(19, 32, 250), "2026-11-18", beach, rider("avance"));
  const s = dayStatus(d, "wind", 0);
  assert.notEqual(s.status, "go");
  assert.equal(d.gear, null);
  assert.equal(d.variable, true);
});

test("La Bocca, 18/11 : 17 nds rafales 32 → pas ridable pour un intermédiaire", () => {
  const d = summarizeDay(day(17, 32, 250), "2026-11-18", beach, rider("intermediaire"));
  assert.equal(d.goodHours, 0);
  assert.notEqual(dayStatus(d, "wind", 0).status, "go");
});

test("Vent régulier side-shore : « Go ! » avec une taille d'aile", () => {
  const d = summarizeDay(day(18, 22, 270), "2026-11-18", beach, rider("intermediaire"));
  assert.equal(dayStatus(d, "wind", 0).status, "go");
  assert.ok(d.gear != null);
});

test("Données insuffisantes (un seul modèle) : pas de taille d'aile, statut incertain", () => {
  const hours = day(18, 22, 270).map((h) => ({ ...h, models: { gfs_seamless: 18 }, spread: null }));
  const d = summarizeDay(hours, "2026-11-18", beach, rider("intermediaire"));
  assert.equal(d.gear, null);
  assert.equal(dayStatus(d, "wind", 0).label, "Incertain");
});

test("Vent de terre, débutant : « Déconseillé »", () => {
  const d = summarizeDay(day(18, 22, 0), "2026-11-18", beach, rider("debutant"));
  assert.equal(d.goodHours, 0);
  assert.equal(dayStatus(d, "wind", 0).label, "Déconseillé");
});

test("Vent de terre, expert autonome : « Technique », secours à confirmer, jamais « Go ! »", () => {
  const d = summarizeDay(day(18, 22, 0), "2026-11-18", beach, rider("expert"));
  assert.ok(d.goodHours > 0);
  assert.equal(d.landWind, true);
  assert.equal(dayStatus(d, "wind", 0).label, "Technique");
  assert.ok(d.slots.every((sl) => sl.landWind));
});

test("Vent de terre, intermédiaire (pas encore autonome) : « Déconseillé »", () => {
  const d = summarizeDay(day(18, 22, 20), "2026-11-18", beach, rider("intermediaire"));
  assert.equal(dayStatus(d, "wind", 0).label, "Déconseillé");
});
