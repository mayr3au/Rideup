import { LEVEL_LABELS, LEVEL_ORDER, tricksFor, type Level, type SportId, type Trick } from "./sports";
import type { TrickProgress } from "./types";

/**
 * Gamification de la progression : paliers (les 4 niveaux de la roadmap), XP, badges, régularité.
 * Tout est calculé à partir des figures validées et des analyses : rien de nouveau à stocker.
 */

export const PALIERS: Record<Level, { numero: number; titre: string; devise: string }> = {
  debutant: { numero: 1, titre: "Rookie", devise: "Les fondations : tout le reste se construit dessus." },
  intermediaire: { numero: 2, titre: "Rider", devise: "Autonome sur l'eau, les premières figures tombent." },
  avance: { numero: 3, titre: "Shredder", devise: "Rotations, modules, vol en continu : ça devient sérieux." },
  expert: { numero: 4, titre: "Légende", devise: "Le niveau que les autres regardent depuis la plage." },
};

const XP_TRICK: Record<Level, number> = { debutant: 100, intermediaire: 200, avance: 350, expert: 500 };
const XP_ANALYSE = 15;
const XP_BONUS_8 = 25;
const XP_BONUS_9 = 50;

export type AnalysisLite = { id: string; trickId: string | null; note: number; date: string };

export type PalierState = {
  level: Level;
  numero: number;
  titre: string;
  devise: string;
  total: number;
  valides: number;
  enCours: number;
  pct: number;
  etat: "termine" | "actuel" | "a-venir";
  tricks: { trick: Trick; status: TrickProgress["status"] | null }[];
};

export type Badge = {
  id: string;
  titre: string;
  texte: string;
  icone: string;
  obtenu: boolean;
  /** 0-1, pour la barre de progression des badges non obtenus */
  progression: number;
  detail?: string;
};

export type Gamification = {
  paliers: PalierState[];
  actuel: PalierState;
  /** Prochain palier à atteindre (null si tout est validé) */
  suivant: PalierState | null;
  xp: number;
  /** Position dans le palier, 0-100 (figures validées du palier) */
  pctPalier: number;
  pctTotal: number;
  badges: Badge[];
  /** 6 derniers mois : nombre d'analyses */
  mois: { label: string; count: number }[];
  forme: number[];
  meilleure: number | null;
  moyenne: number | null;
  serie: number;
};

const monthLabel = (d: Date) => d.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "");

export function computeGamification(opts: { sport: SportId; progress: TrickProgress[]; analyses: AnalysisLite[]; sportsCount: number; now?: Date }): Gamification {
  const { sport, progress, analyses, sportsCount } = opts;
  const now = opts.now ?? new Date();
  const tricks = tricksFor(sport);
  const status = new Map(progress.map((p) => [p.trick_id, p.status]));

  /* Paliers */
  const paliers: PalierState[] = LEVEL_ORDER.map((level) => {
    const list = tricks.filter((t) => t.level === level);
    const valides = list.filter((t) => status.get(t.id) === "valide").length;
    const enCours = list.filter((t) => status.get(t.id) === "en-cours").length;
    return {
      level,
      ...PALIERS[level],
      total: list.length,
      valides,
      enCours,
      pct: list.length ? Math.round((valides / list.length) * 100) : 0,
      etat: "a-venir" as PalierState["etat"],
      tricks: list.map((trick) => ({ trick, status: status.get(trick.id) ?? null })),
    };
  }).filter((p) => p.total > 0);

  // Palier actuel : le premier qui n'est pas entièrement validé.
  let actuelIdx = paliers.findIndex((p) => p.valides < p.total);
  if (actuelIdx === -1) actuelIdx = paliers.length - 1;
  paliers.forEach((p, i) => (p.etat = i < actuelIdx ? "termine" : i === actuelIdx ? "actuel" : "a-venir"));
  const actuel = paliers[actuelIdx];
  const suivant = paliers[actuelIdx + 1] ?? null;

  /* XP */
  let xp = 0;
  for (const t of tricks) if (status.get(t.id) === "valide") xp += XP_TRICK[t.level];
  for (const a of analyses) {
    xp += XP_ANALYSE;
    if (a.note >= 9) xp += XP_BONUS_9;
    else if (a.note >= 8) xp += XP_BONUS_8;
  }

  /* Forme et régularité */
  const sorted = [...analyses].sort((a, b) => a.date.localeCompare(b.date));
  const forme = sorted.slice(-10).map((a) => a.note);
  const meilleure = sorted.length ? Math.max(...sorted.map((a) => a.note)) : null;
  const moyenne = forme.length ? Math.round((forme.reduce((s, n) => s + n, 0) / forme.length) * 10) / 10 : null;
  // Série : analyses consécutives sans baisse de note (≥ 2 pour compter)
  let serie = 0;
  for (let i = sorted.length - 1; i > 0; i--) {
    if (sorted[i].note >= sorted[i - 1].note) serie++;
    else break;
  }
  if (sorted.length >= 2 && serie > 0) serie += 1;
  const mois: Gamification["mois"] = [];
  for (let k = 5; k >= 0; k--) {
    const d = new Date(now.getFullYear(), now.getMonth() - k, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    mois.push({ label: monthLabel(d), count: sorted.filter((a) => a.date.startsWith(key)).length });
  }
  const moisActifs = mois.filter((m) => m.count > 0).length;

  /* Badges */
  const totalValides = paliers.reduce((s, p) => s + p.valides, 0);
  const totalTricks = paliers.reduce((s, p) => s + p.total, 0);
  const n = analyses.length;
  const clamp = (v: number) => Math.max(0, Math.min(1, v));
  const notes8 = analyses.filter((a) => a.note >= 8).length;
  const figuresAnalysees = new Set(analyses.map((a) => a.trickId).filter(Boolean)).size;
  const badges: Badge[] = [
    { id: "first-analyse", titre: "Première analyse", texte: "Un clip envoyé, un premier retour du coach.", icone: "🎬", obtenu: n >= 1, progression: clamp(n / 1) },
    { id: "cinq-analyses", titre: "Régulier", texte: "5 analyses : le coach commence à te connaître.", icone: "📈", obtenu: n >= 5, progression: clamp(n / 5), detail: `${Math.min(n, 5)}/5` },
    { id: "quinze-analyses", titre: "Obsédé du détail", texte: "15 analyses. Tes erreurs n'ont plus de secret.", icone: "🔬", obtenu: n >= 15, progression: clamp(n / 15), detail: `${Math.min(n, 15)}/15` },
    { id: "first-trick", titre: "Première figure", texte: "Ta première figure validée dans la roadmap.", icone: "✅", obtenu: totalValides >= 1, progression: clamp(totalValides / 1) },
    { id: "note-8", titre: "Propre", texte: "Une analyse notée 8/10 ou plus.", icone: "✨", obtenu: notes8 >= 1, progression: clamp(notes8 / 1) },
    { id: "note-9", titre: "Quasi parfait", texte: "Une analyse notée 9/10 ou plus.", icone: "🏆", obtenu: (meilleure ?? 0) >= 9, progression: clamp((meilleure ?? 0) / 9) },
    { id: "serie", titre: "En progression", texte: "3 analyses d'affilée sans baisse de note.", icone: "🔥", obtenu: serie >= 3, progression: clamp(serie / 3), detail: `${Math.min(serie, 3)}/3` },
    { id: "trois-figures", titre: "Explorateur", texte: "3 figures différentes analysées.", icone: "🧭", obtenu: figuresAnalysees >= 3, progression: clamp(figuresAnalysees / 3), detail: `${Math.min(figuresAnalysees, 3)}/3` },
    ...paliers.map((p) => ({
      id: `palier-${p.level}`,
      titre: `Palier ${p.numero} : ${p.titre}`,
      texte: `Toutes les figures ${LEVEL_LABELS[p.level].toLowerCase()} validées.`,
      icone: ["🌱", "🌊", "⚡", "👑"][p.numero - 1],
      obtenu: p.valides === p.total,
      progression: clamp(p.valides / p.total),
      detail: `${p.valides}/${p.total}`,
    })),
    { id: "assidu", titre: "Assidu", texte: "Des analyses sur 3 mois différents.", icone: "📅", obtenu: moisActifs >= 3, progression: clamp(moisActifs / 3), detail: `${Math.min(moisActifs, 3)}/3` },
    { id: "multi", titre: "Multi-glisse", texte: "Deux sports dans ton profil.", icone: "🪁", obtenu: sportsCount >= 2, progression: clamp(sportsCount / 2) },
  ];

  return {
    paliers,
    actuel,
    suivant,
    xp,
    pctPalier: actuel.pct,
    pctTotal: totalTricks ? Math.round((totalValides / totalTricks) * 100) : 0,
    badges,
    mois,
    forme,
    meilleure,
    moyenne,
    serie,
  };
}
