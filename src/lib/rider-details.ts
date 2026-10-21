import { z } from "zod";
import { LEVEL_LABELS, LEVEL_ORDER, type Level, type SportId } from "./sports";

/**
 * Profil rider détaillé, par sport : discipline pratiquée, quiver structuré, auto-évaluation.
 * Stocké dans profiles.details (jsonb). Tout est facultatif : un profil ancien reste valide.
 */

/* ───────────────────────── Disciplines ───────────────────────── */

export type Discipline = { id: string; name: string; hint: string };

export const DISCIPLINES: Record<SportId, Discipline[]> = {
  kitesurf: [
    { id: "freeride", name: "Freeride", hint: "Naviguer, sauter, se faire plaisir en twin-tip" },
    { id: "bigair", name: "Big air", hint: "Hauteur, kiteloops, vent fort" },
    { id: "freestyle", name: "Freestyle", hint: "Figures hookées et unhooked, handle passes" },
    { id: "vagues", name: "Vagues / strapless", hint: "Surf kite, directionnelle, sans straps" },
  ],
  wingfoil: [
    { id: "freeride", name: "Freeride", hint: "Voler, jiber, remonter au vent" },
    { id: "vagues", name: "Vagues", hint: "Surfer les vagues aile en drapeau" },
    { id: "freestyle", name: "Freestyle", hint: "Sauts, rotations, figures" },
    { id: "downwind", name: "Downwind / race", hint: "Longues distances, pumping, vitesse" },
  ],
  foil: [
    { id: "freeride", name: "Freeride", hint: "Voler tranquille, vent léger" },
    { id: "race", name: "Race", hint: "Vitesse, cap, foil de course" },
    { id: "freestyle", name: "Freestyle", hint: "Sauts, rotations, figures en vol" },
    { id: "vagues", name: "Vagues / strapless", hint: "Surfer les vagues en foil, sans straps" },
  ],
  surf: [
    { id: "shortboard", name: "Shortboard", hint: "Manœuvres, vagues creuses" },
    { id: "midlength", name: "Mid-length / fish", hint: "Glisse et vitesse, vagues molles à moyennes" },
    { id: "longboard", name: "Longboard", hint: "Noseride, style, petites vagues" },
  ],
  wakeboard: [
    { id: "cruising", name: "Cruising", hint: "Tours de câble, carre, surface tricks" },
    { id: "air", name: "Air tricks", hint: "Kickers, grabs, inverts, spins" },
    { id: "rails", name: "Rails & box", hint: "Modules : box, rails, slides" },
  ],
};

export function disciplineName(sport: SportId, id?: string | null) {
  return DISCIPLINES[sport].find((d) => d.id === id)?.name ?? null;
}

/* ───────────────────────── Quiver ───────────────────────── */

const num = (min: number, max: number) => z.number().min(min).max(max);
const str = (max = 60) => z.string().trim().max(max);

/** Foil complet : commun au wingfoil et au kitefoil. */
export const foilSchema = z.object({
  marque: str().optional(),
  aileAvantCm2: num(300, 3000).optional(),
  stabCm2: num(80, 600).optional(),
  matCm: num(40, 120).optional(),
  fuselageCm: num(40, 100).optional(),
});
export type FoilSpec = z.infer<typeof foilSchema>;

export const quiverSchema = z.object({
  /** Tailles de kites ou d'ailes de wing (m²) */
  ailes: z.array(num(2, 21)).max(8).optional(),
  /** Longueur de lignes (kite), en m */
  lignesM: num(10, 30).optional(),
  /** Planche(s) : type + taille libre (138 cm, 5'10, 95 L…) */
  planches: z.array(z.object({ type: str(30), taille: str(30) })).max(6).optional(),
  /** Planche de foil : volume et longueur */
  planche: z.object({ volumeL: num(20, 200).optional(), longueur: str(20).optional() }).optional(),
  foil: foilSchema.optional(),
  /** Wakeboard : chausses */
  chausses: z.enum(["ouvertes", "fermees"]).optional(),
  /** Précisions libres */
  notes: str(300).optional(),
});
export type Quiver = z.infer<typeof quiverSchema>;

export const assessmentSchema = z.object({
  score: num(0, 100),
  level: z.enum(["debutant", "intermediaire", "avance", "expert"]),
  at: z.string(),
  reponses: z.record(z.string(), z.number().int().min(0).max(3)),
});
export type Assessment = z.infer<typeof assessmentSchema>;

export const sportDetailsSchema = z.object({
  discipline: str(30).optional(),
  quiver: quiverSchema.optional(),
  evaluation: assessmentSchema.optional(),
});
export type SportDetails = z.infer<typeof sportDetailsSchema>;
export type RiderDetails = Partial<Record<SportId, SportDetails>>;

const fmt = (n: number) => String(n).replace(".", ",");

/** Résumé lisible du quiver (ce que lisent le coach et la page compte). */
export function summarizeQuiver(sport: SportId, q: Quiver | undefined): string {
  if (!q) return "";
  const parts: string[] = [];
  if (q.ailes?.length) {
    const label = sport === "wingfoil" ? "ailes" : "kites";
    parts.push(`${label} ${q.ailes.map(fmt).join(" / ")} m²`);
  }
  if (q.lignesM) parts.push(`lignes ${q.lignesM} m`);
  if (q.planches?.length) parts.push(q.planches.map((p) => [p.type, p.taille].filter(Boolean).join(" ")).join(", "));
  if (q.planche && (q.planche.volumeL || q.planche.longueur)) parts.push(`planche ${[q.planche.longueur, q.planche.volumeL ? `${q.planche.volumeL} L` : ""].filter(Boolean).join(" ")}`);
  if (q.foil) {
    const f = q.foil;
    const bits = [f.marque, f.aileAvantCm2 ? `aile avant ${f.aileAvantCm2} cm²` : "", f.stabCm2 ? `stab ${f.stabCm2} cm²` : "", f.matCm ? `mât ${f.matCm} cm` : "", f.fuselageCm ? `fuselage ${f.fuselageCm} cm` : ""].filter(Boolean);
    if (bits.length) parts.push(`foil ${bits.join(", ")}`);
  }
  if (q.chausses) parts.push(`chausses ${q.chausses === "fermees" ? "fermées" : "ouvertes"}`);
  if (q.notes) parts.push(q.notes);
  return parts.join(" · ");
}

/* ───────────────────────── Auto-évaluation (QCM) ───────────────────────── */

export type Question = {
  id: string;
  q: string;
  /** 4 réponses, de la moins avancée (0) à la plus avancée (3) */
  a: [string, string, string, string];
  /** Question de connaissance : une seule bonne réponse (index), les autres valent 0 */
  bonne?: number;
};

const COMMUN: Question[] = [
  { id: "freq", q: "Tu rides combien de fois par an ?", a: ["Moins de 5 sessions", "5 à 15 sessions", "15 à 40 sessions", "Plus de 40 sessions"] },
  { id: "auto", q: "Sur un spot inconnu, tu te débrouilles ?", a: ["Jamais seul, j'ai besoin d'un moniteur", "Seul si les conditions sont faciles", "Seul, je lis le spot et je choisis mon matériel", "Oui, et je conseille les autres"] },
];

export const ASSESSMENTS: Record<SportId, Question[]> = {
  kitesurf: [
    ...COMMUN,
    { id: "water", q: "Le water start ?", a: ["Pas encore", "Un départ sur trois", "Du premier coup, des deux côtés", "Je n'y pense plus"] },
    { id: "vent", q: "Remonter au vent et revenir à ton point de départ ?", a: ["Je marche sur la plage", "Parfois, avec de la marge", "Oui, dans les deux sens, avec transitions", "Oui, même en sous-puissance ou en vagues"] },
    { id: "saut", q: "Les sauts ?", a: ["Jamais", "Petits sauts, réceptions aléatoires", "Sauts propres, réceptions dans l'axe", "Hauts, avec grabs ou rotations"] },
    { id: "rotation", q: "Rotations et figures ?", a: ["Aucune", "Backroll en cours", "Backroll et frontroll validés", "Kiteloops, unhooked ou handle passes"] },
    { id: "secu", q: "Ton self-rescue ?", a: ["Je ne sais pas ce que c'est", "Je l'ai vu en cours", "Je l'ai déjà fait", "Je le refais chaque saison et je sais le pack-down"] },
    { id: "fenetre", q: "Où le kite tire-t-il le plus fort ?", a: ["Au zénith (12 h)", "Sur le bord de fenêtre", "Au centre, en bas de la fenêtre", "À 9 h ou 3 h"], bonne: 2 },
    { id: "plage", q: "Quelle plage de vent pour toi, avec ton quiver ?", a: ["Je ne sais pas", "12 à 18 nœuds, réguliers", "10 à 25 nœuds", "Tout, y compris rafaleux ou 30+ nœuds"] },
  ],
  wingfoil: [
    ...COMMUN,
    { id: "debout", q: "Te mettre debout et faire un bord ?", a: ["Pas encore, je suis à genoux", "Oui, sans voler", "Oui, et je remonte au vent sans voler", "Évidemment"] },
    { id: "vol", q: "Le vol ?", a: ["Jamais décollé", "Quelques secondes, puis touchette", "Je tiens le vol sur un bord entier", "Je vole en permanence, même en vent léger"] },
    { id: "manoeuvre", q: "Jibe et tack ?", a: ["Je m'arrête et je redémarre", "Jibe en touchant l'eau", "Jibe en vol validé", "Jibe et tack en vol, les deux côtés"] },
    { id: "pump", q: "Pumping et downwind ?", a: ["Je ne sais pas pomper", "Je pompe pour redécoller", "Je tiens le vol aile en drapeau quelques secondes", "Downwind aile neutre sur plusieurs vagues"] },
    { id: "assiette", q: "Le foil monte trop et ventile. Tu fais quoi ?", a: ["Je tire sur l'aile", "Je charge le pied arrière", "Je charge le pied avant, petite correction", "Je m'arrête"], bonne: 2 },
    { id: "plage", q: "Quelle plage de vent pour toi ?", a: ["Je ne sais pas", "15 à 20 nœuds", "10 à 25 nœuds", "Tout, du très léger au fort"] },
  ],
  foil: [
    ...COMMUN,
    { id: "kite", q: "Ton niveau en kitesurf classique ?", a: ["Pas autonome", "Autonome, je remonte au vent", "Transitions et sauts propres", "Avancé, figures validées"] },
    { id: "vol", q: "Le vol en kitefoil ?", a: ["Jamais décollé", "Quelques secondes, puis touchette", "Je tiens le vol sur un bord entier", "Je vole en permanence, kite stable"] },
    { id: "manoeuvre", q: "Les transitions ?", a: ["Je m'arrête", "En touchant l'eau", "Jibe en vol validé", "Jibe et tack en vol, toeside aussi"] },
    { id: "leger", q: "Vent minimum pour voler ?", a: ["Je ne vole pas encore", "15 nœuds", "10 à 12 nœuds", "8 nœuds avec le bon kite"] },
    { id: "assiette", q: "La planche pique du nez en vol. Tu fais quoi ?", a: ["Je charge le pied avant", "Je recule le poids, petite correction", "Je monte le kite", "Je saute"], bonne: 1 },
  ],
  surf: [
    ...COMMUN,
    { id: "rame", q: "Ramer et passer la barre ?", a: ["Je reste dans la mousse", "Je passe une petite barre", "Canard ou turtle roll, j'atteins le line-up", "Même par 1,5 m, sans me fatiguer"] },
    { id: "takeoff", q: "Le take-off ?", a: ["Pas encore debout", "Dans la mousse", "En vague verte, en diagonale", "Tard et en pente, sans hésiter"] },
    { id: "manoeuvre", q: "Les manœuvres ?", a: ["Aucune", "Je tiens la diagonale", "Bottom turn et premiers cutbacks", "Top turns, floaters, aerials ou tubes"] },
    { id: "lecture", q: "Lire une vague et choisir la bonne ?", a: ["Je prends ce qui vient", "Je reconnais une épaule", "Je me place au pic au bon moment", "Je lis les séries et les courants"] },
    { id: "baine", q: "Tu es pris dans un courant qui t'emmène au large. Tu fais quoi ?", a: ["Je nage vers la plage de toutes mes forces", "Je nage en travers, vers les vagues", "Je lâche ma planche", "J'attends sans bouger"], bonne: 1 },
  ],
  wakeboard: [
    ...COMMUN,
    { id: "tour", q: "Le tour de câble ?", a: ["Je tombe au départ ou au premier virage", "Un tour sur deux", "Je tourne sans tomber", "Je tourne switch aussi"] },
    { id: "carre", q: "Carre et surface tricks ?", a: ["Je vais tout droit", "Je change de carre", "Ollie et surface 180", "Surface 360, switch, pop propre"] },
    { id: "module", q: "Les modules ?", a: ["Jamais", "Petit kicker en straight air", "Kicker avec grab, 50-50 sur la box", "Backroll kicker, boardslides, gros modules"] },
    { id: "invert", q: "Les inverts ?", a: ["Aucun", "J'en tente", "Backroll validé", "Plusieurs inverts, en kicker et à plat"] },
    { id: "poignee", q: "Sur un kicker, ta poignée ?", a: ["Je tire dessus pour monter", "Je la lâche", "Je la garde basse, près des hanches", "Je la lève au-dessus de la tête"], bonne: 2 },
  ],
};

/** Score 0-100 et niveau suggéré à partir des réponses (index 0-3 par question). */
export function scoreAssessment(sport: SportId, reponses: Record<string, number>): { score: number; level: Level; label: string } {
  const qs = ASSESSMENTS[sport];
  let total = 0;
  let max = 0;
  for (const q of qs) {
    const r = reponses[q.id];
    if (r == null) continue;
    if (q.bonne != null) {
      total += r === q.bonne ? 3 : 0;
    } else {
      total += r;
    }
    max += 3;
  }
  const score = max ? Math.round((total / max) * 100) : 0;
  const level: Level = score < 35 ? "debutant" : score < 65 ? "intermediaire" : score < 85 ? "avance" : "expert";
  const i = LEVEL_ORDER.indexOf(level);
  const bornes = [0, 35, 65, 85, 101];
  const pos = (score - bornes[i]) / (bornes[i + 1] - bornes[i]);
  const nuance = pos < 0.35 ? "en construction" : pos < 0.7 ? "confirmé" : "solide";
  return { score, level, label: `${LEVEL_LABELS[level]} ${nuance}` };
}

export function assessmentLabel(a: Assessment | undefined) {
  if (!a) return null;
  return `${LEVEL_LABELS[a.level]} · ${a.score}/100`;
}
