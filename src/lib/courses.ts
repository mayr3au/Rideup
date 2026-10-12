import { trickById, type SportId } from "./sports";

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

  {
    slug: "wingfoil-decollage",
    trickId: "wing-decollage",
    title: "Décoller en wingfoil",
    level: "Intermédiaire",
    minutes: 8,
    intro: "Le décollage vient de la vitesse, pas d'un coup de pied arrière. Accélère d'abord, le foil fera le reste.",
    prerequis: ["Naviguer à plat sur les deux bords", "Gonfler et orienter l'aile sans effort", "Pieds placés sans regarder la planche"],
    etapes: [
      { titre: "Se placer", texte: "Pied avant au-dessus du mât ou légèrement devant, pied arrière entre le mât et l'arrière de la planche. Genoux fléchis." },
      { titre: "Prendre de la vitesse", texte: "Pars au travers ou légèrement abattu. Borde l'aile avec la main arrière et fais 2 ou 3 pompages de l'aile pour accélérer." },
      { titre: "Laisser monter", texte: "Quand la planche devient légère, mets juste un peu plus de poids sur le pied arrière. Le foil sort tout seul." },
      { titre: "Revenir neutre", texte: "Dès que tu voles, ramène le poids vers l'avant pour stabiliser à 20-30 cm. Garde l'aile haute et stable." },
    ],
    erreurs: [
      { erreur: "Le foil sort trop vite et tu retombes", correction: "Trop de pied arrière : dose la pression et reviens neutre dès les premiers centimètres." },
      { erreur: "La planche colle à l'eau", correction: "Pas assez de vitesse : abats davantage et pompe l'aile avant de charger l'arrière." },
      { erreur: "L'aile te tire vers l'avant", correction: "Aile trop bordée et trop basse : tiens-la plus haut, bras fléchis." },
    ],
    exercices: ["10 décollages courts en revenant volontairement à l'eau après 5 secondes", "Décollage sur chaque bord en comptant les pompages"],
    securite: "Le foil est tranchant : garde de la distance avec les autres pratiquants et porte un casque et un gilet d'impact.",
  },
  {
    slug: "foil-premier-decollage",
    trickId: "foil-decollage",
    title: "Premier décollage en kitefoil",
    level: "Débutant en foil",
    minutes: 8,
    intro: "En kitefoil, tout est petit : petites pressions, petits mouvements de kite. Les grands gestes te font tomber.",
    prerequis: ["Être autonome en kitesurf (remonter au vent, transitions)", "Naviguer à plat avec la planche de foil", "Un mât court ou un grand foil pour débuter"],
    etapes: [
      { titre: "Naviguer à plat", texte: "Pied avant au-dessus du mât, kite à 45°, barre près du corps. Avance en contrôle sans chercher à voler." },
      { titre: "Accélérer doucement", texte: "Fais une passe de kite douce pour gagner un peu de vitesse, sans traction brutale." },
      { titre: "Décoller", texte: "Mets un léger poids sur le pied arrière. Dès que la planche monte, reviens au centre." },
      { titre: "Redescendre en contrôle", texte: "Pour te poser, charge doucement le pied avant et laisse la planche toucher l'eau sans piquer." },
    ],
    erreurs: [
      { erreur: "Tu montes trop haut et le foil ventile", correction: "Réagis plus tôt : dès que tu décolles, reviens au centre." },
      { erreur: "Tu piques du nez", correction: "Trop de pied avant : reste centré et fais des corrections minimes." },
      { erreur: "Tu décroches au vent", correction: "Kite trop haut et trop bordé : garde-le à 45°, barre stable." },
    ],
    exercices: ["5 décollages de 10 secondes sur chaque bord", "Naviguer en touchant l'eau volontairement toutes les 10 secondes"],
    securite: "Commence en vent stable et modéré, loin des autres, avec casque et gilet d'impact. Le foil est dangereux en cas de chute dessus.",
  },
  {
    slug: "surf-take-off",
    trickId: "surf-takeoff",
    title: "Le take-off en vague verte",
    level: "Débutant",
    minutes: 7,
    intro: "Réussir son take-off, c'est surtout partir assez tôt avec assez de vitesse. Le lever ne fait que finir le travail.",
    prerequis: ["Se lever sans difficulté dans la mousse", "Ramer droit et longtemps", "Savoir passer la barre sur un petit spot"],
    etapes: [
      { titre: "Choisir la vague", texte: "Repère une vague qui monte sans encore casser, et place-toi un peu à l'intérieur de son pic." },
      { titre: "Ramer fort", texte: "Retourne-toi vers la plage et rame franchement. Rajoute 2 ou 3 coups de rame quand tu sens la vague te soulever." },
      { titre: "Se lever", texte: "Dès que la planche glisse seule, mains sous la poitrine et monte en un mouvement, pieds au centre." },
      { titre: "Prendre l'angle", texte: "Regarde l'épaule de la vague et oriente tout de suite la planche dans sa direction." },
    ],
    erreurs: [
      { erreur: "La vague passe sous toi", correction: "Tu pars trop tard ou tu rames trop mollement : commence plus tôt et rame jusqu'à glisser." },
      { erreur: "Tu piques du nez", correction: "Tu es trop en avant sur la planche ou tu pars trop tard dans la pente. Recule un peu et prends la vague plus tôt." },
      { erreur: "Tu tombes en te levant", correction: "Tu montes en plusieurs temps (genoux) : entraîne le lever en un seul mouvement sur la plage." },
    ],
    exercices: ["20 levers à sec sur la plage en un seul mouvement", "Prendre 5 vagues en ne cherchant qu'à partir à droite (ou à gauche)"],
    securite: "Respecte la priorité au pic, reste dans ton niveau de vagues et renseigne-toi sur les courants et les baïnes du spot.",
  },
  {
    slug: "wakeboard-premier-kicker",
    trickId: "wake-kicker",
    title: "Ton premier kicker au téléski",
    level: "Intermédiaire",
    minutes: 7,
    intro: "Un kicker se passe en restant passif : approche droite, vitesse constante, et surtout pas de traction sur la poignée.",
    prerequis: ["Faire le tour du téléski sans tomber", "Changer de carre", "Ollie sur le plat"],
    etapes: [
      { titre: "L'approche", texte: "Aligne-toi bien avant le module, planche à plat, poignée basse près des hanches." },
      { titre: "Sur le kicker", texte: "Garde les genoux souples et laisse le module te monter. Ne tire pas sur la poignée, ne pousse pas sur les jambes." },
      { titre: "En l'air", texte: "Reste groupé, regarde l'eau devant toi à l'endroit où tu veux atterrir." },
      { titre: "Réception", texte: "Atterris les deux pieds en même temps, genoux qui amortissent, poignée toujours basse." },
    ],
    erreurs: [
      { erreur: "Tu atterris sur l'arrière", correction: "Tu as tiré sur la poignée en l'air : garde-la au niveau des hanches." },
      { erreur: "Tu dévies sur le module", correction: "Approche trop en carre : arrive à plat et bien aligné." },
      { erreur: "Réception dure", correction: "Jambes tendues : plie les genoux pour amortir." },
    ],
    exercices: ["3 tours en passant le kicker sans décoller (rouler dessus)", "Straight air en ne travaillant que la poignée basse"],
    securite: "Porte un casque et un gilet, commence sur les plus petits modules et respecte les consignes du téléski.",
  },
];

export function courseBySlug(slug: string) {
  return COURSES.find((c) => c.slug === slug);
}

export function courseForTrick(trickId: string) {
  return COURSES.find((c) => c.trickId === trickId);
}

/** Sport d'un cours, déduit de la figure qu'il enseigne. */
export function courseSport(c: Course): SportId {
  return trickById(c.trickId)?.sport ?? "kitesurf";
}
