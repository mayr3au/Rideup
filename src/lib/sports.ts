/**
 * Les 5 sports de RIDE'UP. Tout ce qui dépend du sport vit ici :
 * figures (roadmap), erreurs typiques, libellés des phases, matériel, type de spot.
 */

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
    tricks: [
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
    ],
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
    tricks: [
      { id: "wing-maniement", name: "Manier l'aile", level: "debutant", summary: "Tenir, gonfler et orienter l'aile sans se faire embarquer.", keys: ["Bras fléchis, aile au-dessus de la tête", "Border avec la main arrière", "Lâcher la main arrière pour choquer"] },
      { id: "wing-debout", name: "Se mettre debout", level: "debutant", summary: "Passer de genoux à debout avec l'aile qui tire.", keys: ["Pieds au centre de la planche", "Aile haute pendant la montée", "Se relever en un mouvement fluide"] },
      { id: "wing-bords", name: "Premiers bords sans voler", level: "debutant", summary: "Naviguer à plat et revenir à son point de départ.", keys: ["Regarder l'horizon", "Planche bien à plat", "Petits virages par l'avant de l'aile"] },
      { id: "wing-decollage", name: "Décoller sur le foil", level: "intermediaire", summary: "Prendre de la vitesse et monter sur le foil.", keys: ["Vitesse d'abord, pression ensuite", "Légère pression sur le pied arrière", "Revenir neutre dès que tu voles"] },
      { id: "wing-vol", name: "Tenir le vol", level: "intermediaire", summary: "Garder une hauteur de vol constante.", keys: ["Genoux souples", "Petites corrections de pieds", "Aile stable, pas de grands gestes"] },
      { id: "wing-remonter", name: "Remonter au vent", level: "intermediaire", summary: "Revenir au vent en volant.", keys: ["Aile bordée, épaules ouvertes", "Planche orientée au près", "Ne pas trop charger le pied arrière"] },
      { id: "wing-jibe", name: "Jibe en vol", level: "avance", summary: "Empanner sans retoucher l'eau.", keys: ["Abattre en gardant la vitesse", "Aile neutre au-dessus de la tête", "Changer de mains en sortie de virage"] },
      { id: "wing-tack", name: "Tack en vol", level: "avance", summary: "Virer de bord par le vent en volant.", keys: ["Lofer franchement", "Pas de pieds rapide", "Aile passée devant toi"] },
      { id: "wing-pumping", name: "Pumping", level: "avance", summary: "Décoller et rester en vol dans peu de vent.", keys: ["Pomper avec les jambes, pas les bras", "Synchroniser aile et planche", "Rythme régulier"] },
      { id: "wing-downwind", name: "Downwind", level: "avance", summary: "Surfer la houle sous le vent.", keys: ["Aile neutre sur les bosses", "Lire la houle devant toi", "Relancer au pumping entre deux bosses"] },
      { id: "wing-saut", name: "Premier saut", level: "expert", summary: "Décoller du plan d'eau et se reposer en vol.", keys: ["Vitesse et appel sur le pied arrière", "Aile qui accompagne la montée", "Réception sur les deux pieds, foil à plat"] },
      { id: "wing-backroll", name: "Backroll", level: "expert", summary: "Rotation arrière en wingfoil.", keys: ["Saut maîtrisé avant", "Regard qui lance la rotation", "Aile au-dessus de la tête pendant la rotation"] },
    ],
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
    tricks: [
      { id: "foil-displacement", name: "Naviguer sans voler", level: "debutant", summary: "Tenir la planche de foil à plat, en contrôle.", keys: ["Pied avant au-dessus du mât", "Kite à 45°, sans trop de traction", "Regarder loin devant"] },
      { id: "foil-decollage", name: "Premier décollage", level: "debutant", summary: "Monter sur le foil et redescendre en douceur.", keys: ["Petite pression sur le pied arrière", "Revenir neutre dès que tu décolles", "Redescendre en chargeant le pied avant"] },
      { id: "foil-vol", name: "Vol stable", level: "intermediaire", summary: "Garder la même hauteur sur tout un bord.", keys: ["Genoux souples", "Corrections minimes", "Kite stable, barre près du corps"] },
      { id: "foil-remonter", name: "Remonter au vent", level: "intermediaire", summary: "Remonter fort au vent en volant.", keys: ["Hanches vers l'avant", "Kite plus haut", "Planche orientée au près, peu de carre"] },
      { id: "foil-transition", name: "Transition en touchant l'eau", level: "intermediaire", summary: "Changer de bord en redescendant.", keys: ["Ralentir et poser la planche", "Kite au zénith", "Redécoller sur l'autre bord"] },
      { id: "foil-jibe", name: "Jibe en vol", level: "avance", summary: "Empanner sans retoucher l'eau.", keys: ["Abattre progressivement", "Changement de pieds rapide", "Kite qui accompagne le virage"] },
      { id: "foil-tack", name: "Tack en vol", level: "avance", summary: "Virer de bord par le vent en volant.", keys: ["Lofer franchement", "Kite au zénith au bon moment", "Pas de pieds fluide"] },
      { id: "foil-toeside", name: "Toeside en vol", level: "avance", summary: "Voler sur la carre avant.", keys: ["Épaules dans l'axe", "Pression sur les orteils", "Regarder par-dessus l'épaule"] },
      { id: "foil-saut", name: "Premier saut", level: "expert", summary: "Décoller du plan d'eau et se reposer en vol.", keys: ["Vitesse et envoi du kite doux", "Planche à plat en l'air", "Réception foil à plat, jambes souples"] },
      { id: "foil-backroll", name: "Backroll", level: "expert", summary: "Rotation arrière en kitefoil.", keys: ["Saut maîtrisé avant", "Regard qui lance la rotation", "Kite stable pendant la rotation"] },
    ],
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
    tricks: [
      { id: "surf-rame", name: "Ramer et se placer", level: "debutant", summary: "Être au bon endroit et prendre de la vitesse avant la vague.", keys: ["Corps bien centré sur la planche", "Rame longue et régulière", "Partir avant que la vague te rattrape"] },
      { id: "surf-mousse", name: "Take-off dans la mousse", level: "debutant", summary: "Se lever sur les vagues déjà cassées.", keys: ["Mains sous les épaules", "Se lever en un seul mouvement", "Regarder devant, pas ses pieds"] },
      { id: "surf-takeoff", name: "Take-off en vague verte", level: "debutant", summary: "Partir sur une vague qui n'a pas encore cassé.", keys: ["Quelques coups de rame de plus", "Se lever dès que la planche glisse", "Prendre l'angle tout de suite"] },
      { id: "surf-trim", name: "Glisser en diagonale", level: "intermediaire", summary: "Suivre l'épaule de la vague en gardant la vitesse.", keys: ["Regarder loin sur l'épaule", "Poids sur le pied avant pour accélérer", "Rester dans la partie qui pousse"] },
      { id: "surf-canard", name: "Passer la barre", level: "intermediaire", summary: "Traverser les vagues pour rejoindre le pic.", keys: ["Canard ou roll selon la planche", "Rame forte entre deux séries", "Repartir vite derrière la vague"] },
      { id: "surf-bottom", name: "Bottom turn", level: "intermediaire", summary: "Le virage du bas de la vague, base de tout.", keys: ["Compresser en bas de la vague", "Regard vers la lèvre", "Pousser sur la carre et s'étendre"] },
      { id: "surf-cutback", name: "Cutback", level: "avance", summary: "Revenir vers la partie qui casse.", keys: ["Partir de l'épaule avec de la vitesse", "Épaules qui lancent le virage", "Regard qui suit la mousse"] },
      { id: "surf-top", name: "Top turn", level: "avance", summary: "Virage en haut de la vague.", keys: ["Bon bottom turn avant", "Monter vers la lèvre", "Rotation des épaules franche"] },
      { id: "surf-floater", name: "Floater", level: "avance", summary: "Glisser sur la lèvre qui casse.", keys: ["Monter sur la section qui ferme", "Poids centré", "Redescendre en compressant"] },
      { id: "surf-tube", name: "Tube", level: "expert", summary: "Passer sous la lèvre qui déferle.", keys: ["Lire la section qui creuse", "Se grouper, main dans la paroi", "Regarder la sortie"] },
      { id: "surf-aerial", name: "Aerial", level: "expert", summary: "Décoller au-dessus de la lèvre.", keys: ["Beaucoup de vitesse", "Rampe sur une section qui ferme", "Planche sous les pieds, réception centrée"] },
    ],
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
    tricks: [
      { id: "wake-depart", name: "Départ du ponton", level: "debutant", summary: "Partir assis ou debout sans tomber.", keys: ["Bras tendus au départ, laisser tirer", "Genoux pliés, poids sur l'arrière", "Se relever doucement"] },
      { id: "wake-virages", name: "Prendre les virages", level: "debutant", summary: "Passer les poulies du câble sans tomber.", keys: ["Anticiper le virage", "Poignée près des hanches", "Garder de la tension sur la carre"] },
      { id: "wake-carre", name: "Changer de carre", level: "debutant", summary: "Traverser le sillage et tenir les deux carres.", keys: ["Regarder où tu vas", "Transfert du poids progressif", "Garder la poignée basse"] },
      { id: "wake-ollie", name: "Ollie", level: "intermediaire", summary: "Décoller la planche du plat.", keys: ["Charger le pied arrière", "Ramener les genoux", "Atterrir les deux pieds en même temps"] },
      { id: "wake-180", name: "Surface 180", level: "intermediaire", summary: "Passer en switch sur le plat.", keys: ["Poignée passée au niveau des hanches", "Épaules qui lancent", "Retrouver la carre en sortie"] },
      { id: "wake-kicker", name: "Premier kicker", level: "intermediaire", summary: "Straight air sur un kicker.", keys: ["Approche droite, vitesse constante", "Ne pas tirer sur la poignée", "Réception jambes souples"] },
      { id: "wake-box", name: "50-50 sur la box", level: "intermediaire", summary: "Glisser droit sur une box.", keys: ["Approche bien alignée", "Planche à plat, poids centré", "Regard sur la sortie du module"] },
      { id: "wake-grab", name: "Grab sur kicker", level: "avance", summary: "Attraper la planche en l'air.", keys: ["Ramener la planche vers la main", "Garder la poignée près du corps", "Lâcher le grab avant la réception"] },
      { id: "wake-boardslide", name: "Boardslide", level: "avance", summary: "Glisser en travers sur le module.", keys: ["Pop léger pour monter", "Épaules dans l'axe du module", "Planche à 90°"] },
      { id: "wake-backroll", name: "Backroll sur kicker", level: "avance", summary: "Premier invert sur kicker.", keys: ["Carre et pop franc", "Regard par-dessus l'épaule arrière", "Poignée au niveau des hanches"] },
      { id: "wake-frontflip", name: "Frontflip", level: "expert", summary: "Rotation avant sur kicker.", keys: ["Pop vers l'avant", "Rentrer le menton", "Poignée au nombril"] },
      { id: "wake-tantrum", name: "Tantrum", level: "expert", summary: "Rotation arrière depuis le plat.", keys: ["Carre arrière forte", "Pop vertical", "Regard par-dessus l'épaule"] },
    ],
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
