export type Level = "debutant" | "intermediaire" | "avance" | "expert";

export const LEVELS: { id: Level; label: string; hint: string }[] = [
  { id: "debutant", label: "Débutant", hint: "Je découvre, water start en cours" },
  { id: "intermediaire", label: "Intermédiaire", hint: "Je navigue, je remonte au vent, premiers sauts" },
  { id: "avance", label: "Avancé", hint: "Sauts maîtrisés, rotations, freestyle hooké" },
  { id: "expert", label: "Expert", hint: "Unhooked, handle passes, gros kiteloops" },
];

export type Trick = {
  id: string;
  name: string;
  level: Level;
  summary: string;
  keys: string[];
};

/** Roadmap kitesurf, dans l'ordre de progression conseillé. */
export const TRICKS: Trick[] = [
  { id: "fenetre-vent", name: "Lire la fenêtre de vent", level: "debutant", summary: "Savoir où le kite tire fort et où il se pose.", keys: ["Zone neutre au zénith", "Puissance en bas de fenêtre", "Toujours regarder sous le vent"] },
  { id: "body-drag", name: "Body drag", level: "debutant", summary: "Se déplacer dans l'eau sans planche, et aller la récupérer.", keys: ["Kite à 11 h ou 1 h", "Bras tendu dans la direction", "Body drag au près pour remonter"] },
  { id: "water-start", name: "Water start", level: "debutant", summary: "Sortir de l'eau et tenir les premiers mètres.", keys: ["Planche en travers, genoux pliés", "Une seule passe de kite, pas trop haute", "Poids sur le talon arrière dès le départ"] },
  { id: "navigation", name: "Naviguer dans les deux sens", level: "debutant", summary: "Tenir une trajectoire stable bâbord comme tribord.", keys: ["Regarder où tu vas", "Kite stable à 45°", "Carre constante"] },
  { id: "remonter-vent", name: "Remonter au vent", level: "intermediaire", summary: "Revenir à son point de départ sans marcher.", keys: ["Hanches vers l'avant", "Mettre de la carre sur le talon", "Kite plus haut, moins de puissance"] },
  { id: "transition", name: "Transition", level: "intermediaire", summary: "Changer de bord sans s'arrêter.", keys: ["Ralentir en remontant", "Passer le kite au zénith", "Transférer le poids sur l'autre carre"] },
  { id: "premier-saut", name: "Premier saut", level: "intermediaire", summary: "Décoller proprement et se poser en douceur.", keys: ["Vitesse + carre avant l'envoi", "Envoi du kite franc, pas brutal", "Renvoyer le kite vers l'avant pour la réception"] },
  { id: "toeside", name: "Toeside", level: "intermediaire", summary: "Naviguer sur la carre avant.", keys: ["Épaules dans l'axe de déplacement", "Pression sur les orteils", "Regarder par-dessus l'épaule"] },
  { id: "backroll", name: "Backroll", level: "avance", summary: "Rotation arrière, la première vraie figure.", keys: ["Carre plus forte qu'un saut", "Regarder par-dessus l'épaule arrière", "Kite qui ne bouge pas pendant la rotation"] },
  { id: "frontroll", name: "Frontroll", level: "avance", summary: "Rotation avant, plus engagée visuellement.", keys: ["Envoi plus doux que pour un saut", "Tête et épaules lancent la rotation", "Barre près des hanches"] },
  { id: "board-off", name: "Board off", level: "avance", summary: "Sortir les pieds de la planche en l'air.", keys: ["Saut haut et stable d'abord", "Ramener la planche vers toi", "Remettre les pieds avant le pic"] },
  { id: "kiteloop", name: "Kiteloop", level: "avance", summary: "Boucler le kite pendant le saut.", keys: ["Commencer petit, vent modéré", "Tirer franc d'un côté de la barre", "Garder la barre près du corps"] },
  { id: "raley", name: "Raley", level: "expert", summary: "Le classique du freestyle unhooked.", keys: ["Kite bas à 45°", "Carre très forte, pop sur la carre", "Corps en extension, puis genoux ramenés"] },
  { id: "s-bend", name: "S-Bend", level: "expert", summary: "Raley avec rotation inversée.", keys: ["Raley maîtrisé avant", "Épaule avant qui ouvre la rotation", "Tenir la barre jusqu'au bout"] },
  { id: "handle-pass", name: "Handle pass", level: "expert", summary: "Passer la barre dans le dos en l'air.", keys: ["Ramener la barre au nombril", "Une main lâche, l'autre suit", "Rester compact"] },
];

export const DISCIPLINES = [
  { id: "freeride", label: "Freeride" },
  { id: "freestyle", label: "Freestyle" },
  { id: "big-air", label: "Big air" },
  { id: "wave", label: "Vague" },
] as const;

/**
 * Taxonomie des erreurs techniques. L'IA doit classer chaque erreur dans un de ces codes :
 * c'est ce qui permet de suivre les erreurs récurrentes d'une analyse à l'autre.
 */
export const ERROR_CODES = {
  "vitesse-insuffisante": { label: "Pas assez de vitesse à l'approche", phase: "approche" },
  "carre-faible": { label: "Carre insuffisante avant l'appel", phase: "approche" },
  "carre-relachee": { label: "Carre relâchée au moment de l'envoi", phase: "appel" },
  "envoi-kite-tardif": { label: "Kite envoyé trop tard", phase: "appel" },
  "envoi-kite-brutal": { label: "Kite envoyé trop fort ou trop loin", phase: "appel" },
  "kite-trop-haut": { label: "Kite trop haut / au zénith", phase: "vol" },
  "kite-trop-bas": { label: "Kite trop bas pour la figure", phase: "appel" },
  "pas-de-pop": { label: "Pas de pop sur la carre", phase: "appel" },
  "barre-loin": { label: "Barre trop loin du corps", phase: "vol" },
  "bras-tendus": { label: "Bras tendus, barre qui pivote", phase: "vol" },
  "regard": { label: "Regard qui ne guide pas la rotation", phase: "vol" },
  "epaules-ouvertes": { label: "Épaules qui ouvrent trop tôt", phase: "vol" },
  "rotation-incomplete": { label: "Rotation incomplète", phase: "vol" },
  "corps-etendu": { label: "Corps trop étendu en l'air", phase: "vol" },
  "jambes-tendues": { label: "Jambes tendues, planche loin du corps", phase: "vol" },
  "planche-mal-orientee": { label: "Planche mal orientée", phase: "vol" },
  "kite-pas-renvoye": { label: "Kite pas renvoyé pour la réception", phase: "reception" },
  "reception-arriere": { label: "Réception en arrière / sur les fesses", phase: "reception" },
  "reception-jambes-raides": { label: "Réception jambes raides", phase: "reception" },
  "reception-nose": { label: "Réception sur l'avant de la planche", phase: "reception" },
  "poids-avant": { label: "Poids trop sur l'avant", phase: "approche" },
  "posture-cassee": { label: "Posture cassée (fesses en arrière)", phase: "approche" },
  "autre": { label: "Autre point technique", phase: "vol" },
} as const;

export type ErrorCode = keyof typeof ERROR_CODES;

export function errorLabel(code: string) {
  return (ERROR_CODES as Record<string, { label: string }>)[code]?.label ?? "Autre point technique";
}

export function trickById(id: string) {
  return TRICKS.find((t) => t.id === id);
}
