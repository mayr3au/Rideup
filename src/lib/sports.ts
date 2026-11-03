/**
 * Les 5 sports de RIDE'UP. Tout ce qui dépend du sport vit ici :
 * figures (roadmap), erreurs typiques, libellés des phases, matériel, type de spot.
 */

import { ROADMAPS } from "./roadmaps";

export type SportId = "kitesurf" | "wingfoil" | "foil" | "surf" | "wakeboard";
export type Level = "debutant" | "intermediaire" | "avance" | "expert";
export type SpotKind = "wind" | "waves" | "cable";
export type Phase = "approche" | "appel" | "vol" | "reception";

export type Trick = {
  id: string;
  sport: SportId;
  name: string;
  level: Level;
  summary: string;
  keys: string[];
};

export type Sport = {
  id: SportId;
  name: string;
  short: string;
  spot: SpotKind;
  /** Libellés des 4 phases notées dans l'analyse */
  phases: Record<Phase, string>;
  levelHints: Record<Level, string>;
  gear: { label: string; placeholder: string; sizes?: { min: number; max: number; unit: string } };
  /** Spécialité du coach IA pour ce sport */
  expertise: string;
  /** Ce que l'analyse doit regarder */
  checklist: string;
  /** Codes d'erreur propres au sport (en plus des codes communs) */
  errors: Record<string, string>;
  tricks: Omit<Trick, "sport">[];
};

export const LEVEL_LABELS: Record<Level, string> = {
  debutant: "Débutant",
  intermediaire: "Intermédiaire",
  avance: "Avancé",
  expert: "Expert",
};
export const LEVEL_ORDER: Level[] = ["debutant", "intermediaire", "avance", "expert"];

/** Erreurs valables pour tous les sports */
export const COMMON_ERRORS: Record<string, string> = {
  "vitesse-insuffisante": "Pas assez de vitesse",
  "posture-cassee": "Posture cassée (fesses en arrière)",
  "jambes-tendues": "Jambes trop tendues",
  "poids-avant": "Poids trop sur l'avant",
  "poids-arriere": "Poids trop sur l'arrière",
  "regard": "Regard qui ne guide pas le mouvement",
  "epaules-ouvertes": "Épaules qui ouvrent trop tôt",
  "rotation-incomplete": "Rotation incomplète",
  "corps-etendu": "Corps trop étendu en l'air",
  "reception-arriere": "Réception en arrière",
  "reception-jambes-raides": "Réception jambes raides",
  "autre": "Autre point technique",
};

export const SPORTS: Record<SportId, Sport> = {
  /* ───────────────────────── Kitesurf ───────────────────────── */
  kitesurf: {
    id: "kitesurf",
    name: "Kitesurf",
    short: "Kite",
    spot: "wind",
    phases: { approche: "Approche", appel: "Appel", vol: "En l'air", reception: "Réception" },
    levelHints: {
      debutant: "Je découvre, water start en cours",
      intermediaire: "Je navigue, je remonte au vent, premiers sauts",
      avance: "Sauts maîtrisés, rotations, freestyle hooké",
      expert: "Unhooked, handle passes, gros kiteloops",
    },
    gear: { label: "Tes kites (tailles en m²)", placeholder: "Ex. 9 et 12, twin-tip 138", sizes: { min: 3, max: 21, unit: "m" } },
    expertise:
      "kitesurf : lecture de la fenêtre de vent, carre et vitesse, timing de l'envoi du kite, pop, position de la barre, rotations (backroll, frontroll, kiteloop), unhooked (raley, S-bend, passes), réceptions",
    checklist:
      "vitesse et carre à l'approche, timing et amplitude de l'envoi du kite, pop, position de la barre et des bras, regard et épaules pendant la rotation, position de la planche, renvoi du kite et réception",
    errors: {
      "carre-faible": "Carre insuffisante avant l'appel",
      "carre-relachee": "Carre relâchée au moment de l'envoi",
      "envoi-kite-tardif": "Kite envoyé trop tard",
      "envoi-kite-brutal": "Kite envoyé trop fort ou trop loin",
      "kite-trop-haut": "Kite trop haut / au zénith",
      "kite-trop-bas": "Kite trop bas pour la figure",
      "kite-pas-renvoye": "Kite pas renvoyé pour la réception",
      "pas-de-pop": "Pas de pop sur la carre",
      "barre-loin": "Barre trop loin du corps",
      "bras-tendus": "Bras tendus, barre qui pivote",
      "planche-mal-orientee": "Planche mal orientée",
    },
    tricks: ROADMAPS.kitesurf,
  },

  /* ───────────────────────── Wingfoil ───────────────────────── */
  wingfoil: {
    id: "wingfoil",
    name: "Wingfoil",
    short: "Wing",
    spot: "wind",
    phases: { approche: "Approche", appel: "Déclenchement", vol: "Exécution", reception: "Sortie" },
    levelHints: {
      debutant: "Je me mets debout, premiers bords sans voler",
      intermediaire: "Je décolle et je tiens le vol",
      avance: "Jibes et tacks en vol, pumping, downwind",
      expert: "Sauts, rotations, freestyle",
    },
    gear: { label: "Tes ailes (tailles en m²)", placeholder: "Ex. 4 et 5,5, foil 1200 cm²", sizes: { min: 2, max: 9, unit: "m" } },
    expertise:
      "wingfoil : maniement de l'aile, départ à genoux puis debout, décollage du foil, gestion de l'assiette (hauteur de vol), placement des pieds, pumping, jibes et tacks en vol, downwind, sauts",
    checklist:
      "position et hauteur de l'aile, bras (tendus ou fléchis), placement des pieds sur la planche, répartition du poids avant/arrière, hauteur de vol du foil (touchette, breach), rythme du pumping, regard, déroulé de la manœuvre et sortie en vol",
    errors: {
      "aile-trop-haute": "Aile tenue trop haut",
      "aile-trop-loin": "Aile trop loin du corps, bras tendus",
      "aile-pas-bordee": "Aile pas assez bordée (pas de traction)",
      "pieds-mal-places": "Pieds mal placés sur la planche",
      "foil-breach": "Foil qui sort de l'eau (trop de pression arrière)",
      "foil-touchette": "Foil qui retouche l'eau (trop de pression avant)",
      "pumping-desynchro": "Pumping désynchronisé aile / planche",
      "regard-bas": "Regard sur la planche au lieu de l'horizon",
      "changement-mains-tardif": "Changement de mains trop tardif",
    },
    tricks: ROADMAPS.wingfoil,
  },

  /* ───────────────────────── Foil (kitefoil) ───────────────────────── */
  foil: {
    id: "foil",
    name: "Foil",
    short: "Foil",
    spot: "wind",
    phases: { approche: "Approche", appel: "Déclenchement", vol: "Exécution", reception: "Sortie" },
    levelHints: {
      debutant: "Je navigue sur la planche de foil, premiers décollages",
      intermediaire: "Je vole et je remonte au vent",
      avance: "Transitions en vol, toeside, premiers sauts",
      expert: "Rotations, strapless, race",
    },
    gear: { label: "Tes kites pour le foil (tailles en m²)", placeholder: "Ex. 7 et 10, foil 900 cm²", sizes: { min: 3, max: 21, unit: "m" } },
    expertise:
      "kitefoil : départ et navigation en displacement, décollage, gestion de la hauteur de vol, placement des pieds, contrôle du kite en vol, jibes et tacks en vol, toeside, sauts",
    checklist:
      "position du kite, placement des pieds, répartition du poids avant/arrière, hauteur de vol (touchette, breach), posture et souplesse des jambes, déroulé de la manœuvre et sortie en vol",
    errors: {
      "pieds-mal-places": "Pieds mal placés sur la planche",
      "foil-breach": "Foil qui sort de l'eau (trop de pression arrière)",
      "foil-touchette": "Foil qui retouche l'eau (trop de pression avant)",
      "kite-instable": "Kite qui bouge trop pendant le vol",
      "kite-trop-bas": "Kite trop bas, trop de traction",
      "carre-trop-forte": "Trop de carre, la planche se couche",
      "regard-bas": "Regard sur la planche au lieu de l'horizon",
    },
    tricks: ROADMAPS.foil,
  },

  /* ───────────────────────── Surf ───────────────────────── */
  surf: {
    id: "surf",
    name: "Surf",
    short: "Surf",
    spot: "waves",
    phases: { approche: "Placement et rame", appel: "Take-off", vol: "Manœuvre", reception: "Sortie" },
    levelHints: {
      debutant: "Mousse, premiers take-offs",
      intermediaire: "Je prends des vagues vertes et je glisse en diagonale",
      avance: "Bottom turns, cutbacks, top turns",
      expert: "Tubes, aerials, grosses vagues",
    },
    gear: { label: "Tes planches", placeholder: "Ex. shortboard 5'10, mini-malibu 7'2" },
    expertise:
      "surf : placement au pic, rame, timing et technique du take-off, posture, lecture de la vague, trim, bottom turn, cutback, top turn, floater, tube, aerial",
    checklist:
      "placement et timing de la rame, take-off (en un mouvement ou en plusieurs temps), position des pieds et posture, regard, rotation des épaules et du buste dans les virages, compression/extension des jambes, utilisation de la vague (épaule, lèvre, creux) et sortie",
    errors: {
      "rame-tardive": "Rame trop tardive ou trop faible",
      "takeoff-lent": "Take-off en plusieurs temps (genoux, mains)",
      "mauvais-placement": "Mauvais placement sur la vague",
      "pieds-mal-places": "Pieds mal placés sur la planche",
      "regard-bas": "Regard sur la planche au lieu de la vague",
      "buste-penche": "Buste trop penché en avant",
      "bottom-trop-plat": "Bottom turn trop plat ou trop court",
      "epaules-figees": "Épaules qui ne lancent pas le virage",
      "pas-de-compression": "Pas de compression / extension des jambes",
    },
    tricks: ROADMAPS.surf,
  },

  /* ───────────────────────── Wakeboard (téléski) ───────────────────────── */
  wakeboard: {
    id: "wakeboard",
    name: "Wakeboard",
    short: "Wake",
    spot: "cable",
    phases: { approche: "Approche", appel: "Pop / appel", vol: "En l'air / module", reception: "Réception" },
    levelHints: {
      debutant: "Départ du ponton, premiers tours de câble",
      intermediaire: "Ollie, 180, premiers kickers et box",
      avance: "Grabs, rails, backroll sur kicker",
      expert: "Inverts, gros spins, modules avancés",
    },
    gear: { label: "Ta planche et tes chausses", placeholder: "Ex. planche 140 cm câble, chausses ouvertes" },
    expertise:
      "wakeboard au téléski nautique (câble) : départ du ponton, virages du câble, gestion de la poignée et de la tension, carre, ollie, surface 180, kickers, box et rails, grabs, inverts (backroll, frontflip, tantrum), spins",
    checklist:
      "position de la poignée (près des hanches ou bras tendus), tension du câble, carre et vitesse à l'approche du module, alignement avec le module, pop, position du corps et regard en l'air ou sur le module, réception jambes souples",
    errors: {
      "poignee-loin": "Poignée trop loin du corps",
      "poignee-lachee": "Poignée lâchée d'une main trop tôt",
      "carre-relachee": "Carre relâchée avant le module",
      "pas-de-pop": "Pas de pop",
      "approche-desaxee": "Approche désaxée par rapport au module",
      "tension-cable": "Tension du câble mal gérée",
      "planche-mal-orientee": "Planche mal orientée sur le module",
    },
    tricks: ROADMAPS.wakeboard,
  },
};

export const SPORT_IDS = Object.keys(SPORTS) as SportId[];

export const TRICKS: Trick[] = SPORT_IDS.flatMap((s) => SPORTS[s].tricks.map((t) => ({ ...t, sport: s })));

export function isSport(v: unknown): v is SportId {
  return typeof v === "string" && v in SPORTS;
}

export function tricksFor(sport: SportId) {
  return TRICKS.filter((t) => t.sport === sport);
}

export function trickById(id: string) {
  return TRICKS.find((t) => t.id === id);
}

export function errorsFor(sport: SportId): Record<string, string> {
  return { ...SPORTS[sport].errors, ...COMMON_ERRORS };
}

const ALL_ERRORS: Record<string, string> = Object.assign({}, ...SPORT_IDS.map((s) => SPORTS[s].errors), COMMON_ERRORS);
export function errorLabel(code: string) {
  return ALL_ERRORS[code] ?? "Autre point technique";
}

export function phaseLabel(sport: SportId | null | undefined, phase: Phase) {
  return SPORTS[sport && isSport(sport) ? sport : "kitesurf"].phases[phase];
}

/** Tailles extraites d'un texte libre selon le sport : « 4 et 5,5 » → [4, 5.5]. */
export function parseSizes(sport: SportId, text: string | null | undefined) {
  const range = SPORTS[sport].gear.sizes;
  if (!range || !text) return [];
  const out = new Set<number>();
  for (const m of text.matchAll(/(?<![\d.,])(\d{1,2}(?:[.,]\d)?)(?![\d])/g)) {
    const n = Number(m[1].replace(",", "."));
    if (n >= range.min && n <= range.max) out.add(n);
  }
  return [...out].sort((a, b) => a - b);
}
