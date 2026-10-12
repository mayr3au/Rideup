export type Course = {
  slug: string;
  trickId: string;
  title: string;
  level: string;
  minutes: number;
  intro: string;
  prerequis: string[];
  etapes: { titre: string; texte: string }[];
  erreurs: { erreur: string; correction: string }[];
  exercices: string[];
  securite: string;
};

export const COURSES: Course[] = [
  {
    slug: "water-start",
    trickId: "water-start",
    title: "Le water start",
    level: "Débutant",
    minutes: 8,
    intro: "Sortir de l'eau, c'est une seule passe de kite bien dosée et le poids au bon endroit. Pas de force dans les bras.",
    prerequis: ["Body drag dans les deux sens", "Pilotage du kite d'une main", "Remise en place de la planche dans l'eau"],
    etapes: [
      { titre: "Position de départ", texte: "Assis dans l'eau, planche en travers devant toi, pieds dans les straps, genoux pliés contre la poitrine. Kite au zénith, barre tenue à deux mains au centre." },
      { titre: "La passe", texte: "Descends le kite côté direction d'environ 45°, de manière franche mais sans le plonger au ras de l'eau. C'est cette passe qui te tire hors de l'eau." },
      { titre: "Se lever", texte: "Laisse le kite te tirer : pousse sur ta jambe avant pour orienter la planche vers ta direction et garde le poids sur le talon arrière." },
      { titre: "Stabiliser", texte: "Dès que tu glisses, remonte le kite vers 45° et garde-le stable. Regarde où tu vas, pas tes pieds." },
    ],
    erreurs: [
      { erreur: "Tu passes par-dessus la planche", correction: "La passe est trop forte ou trop basse : envoie plus doucement et garde les genoux pliés." },
      { erreur: "Tu te lèves puis tu retombes en arrière", correction: "Pas assez de traction : enchaîne une deuxième passe plus engagée ou vérifie que le kite est adapté au vent." },
      { erreur: "La planche part dans le vent", correction: "Trop de poids sur le pied avant : recule ton centre de gravité sur le talon arrière." },
    ],
    exercices: ["5 départs de chaque côté en ne faisant qu'une seule passe", "Départ, 20 m de glisse, arrêt contrôlé en remontant le kite"],
    securite: "Pratique sur un spot avec vent side ou side-on, loin des baigneurs, et avec un moniteur tant que tu n'es pas autonome.",
  },
  {
    slug: "premier-saut",
    trickId: "premier-saut",
    title: "Ton premier saut",
    level: "Intermédiaire",
    minutes: 10,
    intro: "Un saut propre vient de la carre et du timing, pas de la puissance du kite. Commence petit, en vent modéré.",
    prerequis: ["Remonter au vent sans difficulté", "Transitions maîtrisées", "Navigation stable à vitesse soutenue"],
    etapes: [
      { titre: "Prendre de la vitesse", texte: "Kite à 45°, accélère sur ta carre en gardant les jambes fléchies." },
      { titre: "Charger la carre", texte: "Juste avant l'envoi, appuie fort sur ta carre arrière pour créer de la tension dans les lignes." },
      { titre: "Envoyer le kite", texte: "Envoie le kite vers 11 h ou 13 h, pas au-delà du zénith. Garde la carre pendant l'envoi : c'est elle qui te fait décoller." },
      { titre: "En l'air", texte: "Ramène la barre vers toi et les genoux vers la poitrine." },
      { titre: "Réception", texte: "Renvoie le kite dans ta direction avant de toucher l'eau, atterris jambes fléchies et planche légèrement abattue." },
    ],
    erreurs: [
      { erreur: "Tu décolles à peine", correction: "Tu relâches la carre en envoyant le kite. Garde la pression sur le talon jusqu'au décollage." },
      { erreur: "Tu retombes sur les fesses", correction: "Le kite n'est pas renvoyé à temps. Renvoie-le dès que tu atteins le point haut." },
      { erreur: "Tu es arraché vers l'avant", correction: "Kite envoyé trop loin derrière. Arrête-le à 11 h ou 13 h." },
    ],
    exercices: ["10 petits sauts en ne travaillant que la carre", "Sauts en comptant 1-2-3 : carre, envoi, renvoi"],
    securite: "Laisse au moins 50 m de marge sous le vent. Jamais de saut près du bord, des obstacles ou d'autres riders.",
  },
  {
    slug: "backroll",
    trickId: "backroll",
    title: "Le backroll",
    level: "Avancé",
    minutes: 12,
    intro: "La première rotation : c'est le regard et les épaules qui la lancent, pas les jambes.",
    prerequis: ["Sauts réguliers et réceptions propres", "Navigation en toeside", "Kite stable pendant le saut"],
    etapes: [
      { titre: "Approche", texte: "Même approche qu'un saut, avec une carre un peu plus marquée." },
      { titre: "Lancer la rotation", texte: "Au moment de quitter l'eau, tourne la tête et regarde ton épaule arrière, puis par-dessus vers l'arrière." },
      { titre: "Pendant la rotation", texte: "Barre près des hanches, genoux ramenés. Le kite ne doit pas bouger." },
      { titre: "Finir", texte: "Quand tu revois l'horizon, ouvre le regard vers ta direction et renvoie le kite pour la réception." },
    ],
    erreurs: [
      { erreur: "Rotation incomplète", correction: "Ton regard arrive trop tard. Tourne la tête dès le décollage." },
      { erreur: "Le kite plonge pendant la rotation", correction: "Tu tires sur un côté de la barre. Garde les deux mains au centre et la barre stable." },
      { erreur: "Réception sur le dos", correction: "Kite trop haut. Envoie moins loin, autour de 11 h." },
    ],
    exercices: ["Sauts en tournant uniquement la tête, sans chercher la rotation", "Backrolls à faible hauteur, juste au ras de l'eau"],
    securite: "Commence avec peu de puissance. Si tu perds le repère en l'air, abandonne la rotation et renvoie le kite.",
  },
  {
    slug: "kiteloop",
    trickId: "kiteloop",
    title: "Le kiteloop",
    level: "Avancé",
    minutes: 12,
    intro: "Faire boucler le kite pendant le saut. Commence très petit, en vent modéré : la traction est violente.",
    prerequis: ["Sauts maîtrisés, hauts et stables", "Rotations maîtrisées", "Réflexe de largage acquis"],
    etapes: [
      { titre: "Préparer", texte: "Saut modéré, kite envoyé moins loin que pour un saut classique." },
      { titre: "Lancer la boucle", texte: "Au point haut, tire franchement et longtemps le côté de la barre dans le sens du loop." },
      { titre: "Accompagner", texte: "Garde la barre près du corps et laisse le kite faire sa boucle complète." },
      { titre: "Réception", texte: "Relâche dès que le kite remonte : il te pose dans le sens de la marche." },
    ],
    erreurs: [
      { erreur: "Le kite ne finit pas sa boucle", correction: "Tu relâches trop tôt. Tire jusqu'à ce que le kite remonte." },
      { erreur: "Tu es arraché sous le vent", correction: "Loop lancé trop bas ou trop tard. Lance-le au point haut." },
    ],
    exercices: ["Loops de kite seul, au sol puis en navigation", "Downloops en navigation pour sentir la traction"],
    securite: "Pratique avec beaucoup d'espace sous le vent et sans obstacle. Évite les vents rafaleux.",
  },
  {
    slug: "raley",
    trickId: "raley",
    title: "Le raley",
    level: "Expert",
    minutes: 12,
    intro: "La porte d'entrée du freestyle unhooked. Kite bas, carre explosive, corps en extension.",
    prerequis: ["Navigation unhooked confortable", "Pop sur la carre", "Kite stable à basse hauteur"],
    etapes: [
      { titre: "Approche", texte: "Kite bas, à 45° ou moins. Décroche-toi et prends de la vitesse." },
      { titre: "Charger", texte: "Abats légèrement, puis remonte au vent avec une carre très agressive." },
      { titre: "Pop", texte: "Saute sur ta carre, épaules en arrière : le kite t'étire à l'horizontale." },
      { titre: "Ramener", texte: "Au point haut, ramène les genoux et la barre vers toi, puis atterris dans le sens du kite." },
    ],
    erreurs: [
      { erreur: "Tu restes bloqué au sol", correction: "Kite trop haut ou carre trop faible. Descends le kite et charge plus fort." },
      { erreur: "Réception sur le nez de la planche", correction: "Tu ne ramènes pas les genoux. Prépare la réception plus tôt." },
    ],
    exercices: ["Pops unhooked sans extension", "Approches carre forte avec kite bas"],
    securite: "Utilise un leash adapté, vérifie ton système de largage, et commence avec un vent modéré.",
  },
];

export function courseBySlug(slug: string) {
  return COURSES.find((c) => c.slug === slug);
}

export function courseForTrick(trickId: string) {
  return COURSES.find((c) => c.trickId === trickId);
}
