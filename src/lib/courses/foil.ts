import type { Course } from "@/lib/course-types";
import type { Editorial } from "@/lib/lessons";

const ed = (aValider?: string): Editorial => ({
  revise: "2026-11-18",
  relecteur: "Équipe pédagogique RIDE'UP (révision après audit)",
  sources: ["IKO, Assistant Manual V7"],
  aValider,
});

/**
 * Cours « figure par figure » du FOIL (kitefoil : kite + planche de foil).
 * Un cours par figure de la roadmap foil (sports.ts), dans l'ordre de progression.
 */
export const COURSES_FOIL: Course[] = [
  /* ───────────────────────── Débutant ───────────────────────── */
  {
    slug: "foil-naviguer-sans-voler",
    trickId: "foil-displacement",
    title: "Naviguer sans voler (displacement)",
    level: "Débutant",
    minutes: 7,
    intro:
      "Avant de voler, tu dois tenir la planche de foil à plat, collée à l'eau. C'est le displacement : tu apprivoises le mât et le poids sous tes pieds.",
    conditions:
      "10 à 14 nœuds réguliers, plan d'eau plat et plus profond que ton mât sur toute la zone, kite qui te donne une traction régulière sans surpuissance (souvent plus petit qu'en twin-tip : à choisir avec ton moniteur selon ton poids, le vent et le foil), grande aile avant.",
    prerequis: [
      "Autonome en kitesurf : remonter au vent, transitions, water start des deux côtés",
      "Pilotage du kite d'une main, sans le regarder",
      "Savoir remettre une planche dans l'eau et chausser des straps",
      "Casque et gilet d'impact portés systématiquement",
    ],
    phases: [
      { phase: "approche", cle: "Kite au zénith, planche en travers, pied avant chaussé" },
      { phase: "appel", cle: "Passe douce à 45°, lever en poussant la jambe avant" },
      { phase: "vol", cle: "Pied avant sur le mât, planche à plat, regard loin" },
      { phase: "reception", cle: "Kite qui remonte, s'asseoir sur le côté, loin du foil" },
    ],
    schema: "wing-pieds",
    etapes: [
      {
        titre: "Chausser dans l'eau",
        texte:
          "Kite au zénith, barre choquée. Mets le pied avant dans le strap juste au-dessus du mât, le pied arrière entre le mât et le tail. Le foil pend sous toi : garde les jambes loin de l'aile avant.",
      },
      {
        titre: "Water start en douceur",
        texte:
          "Fais une passe de kite plus douce qu'en twin-tip, vers 45°, puis pousse sur la jambe avant pour aligner la planche. Le foil pousse vers le haut dès 5 ou 6 nœuds de vitesse : ne te lève pas comme en twin-tip, laisse-toi tirer.",
      },
      {
        titre: "Bloquer la planche à plat",
        texte:
          "Dès que tu glisses, mets un peu plus de poids sur le pied avant, juste assez pour que la planche reste collée à l'eau sans chercher à monter. Genoux fléchis, bassin au-dessus du mât, barre près du corps. Le bon dosage dépend de la place des straps et de ton foil.",
      },
      {
        titre: "Caler le kite",
        texte:
          "Ramène le kite à 10-11 h (ou 13-14 h) et laisse-le immobile. Pas de va-et-vient : le foil n'a pas besoin de puissance, seulement de régularité. Choque légèrement la barre si ça tire trop.",
      },
      {
        titre: "Garder le cap et s'arrêter",
        texte:
          "Regarde un point à l'horizon, pas la planche. Pour t'arrêter, remonte le kite vers le zénith (vent modéré, espace libre), laisse la vitesse tomber et assieds-toi dans l'eau sur le côté arrière de la planche, loin du foil, jamais vers l'avant. Selon le montage, sors d'abord le pied arrière du strap (strap arrière fermé) ou garde les pieds en place (straps ouverts) : demande à ton moniteur la méthode adaptée à ta planche.",
      },
    ],
    erreurs: [
      {
        erreur: "La planche décolle toute seule et tu tombes",
        correction:
          "Trop de vitesse et pas assez de pied avant. Choque la barre, remonte le kite d'une demi-heure et charge franchement le pied avant.",
      },
      {
        erreur: "La planche se couche sur la carre et part au vent",
        correction:
          "Tu la tiens comme un twin-tip, sur les talons. Reste à plat : le mât fait déjà la dérive, tu n'as pas besoin de carre.",
      },
      {
        erreur: "Tu regardes tes pieds et tu perds l'équilibre",
        correction:
          "Fixe un repère sur la rive opposée. Tes pieds, tu les sens, tu ne les regardes pas.",
      },
    ],
    exercices: [
      "10 water starts (5 par côté) avec arrêt contrôlé assis en arrière, sans jamais laisser la planche décoller",
      "5 bords de 100 m à plat, kite immobile à 10-11 h : compte le nombre de fois où la planche a bougé en hauteur",
      "Un bord entier en choquant la barre à moitié : la vitesse doit rester constante",
    ],
    filmer:
      "Filme un water start suivi de 20 s de navigation à plat, de côté et en plein cadre, sous le vent du rider. On doit voir les pieds, le genou avant et la hauteur du kite.",
    securite:
      "Le foil est tranchant : en tombant, pousse la planche loin de toi avec les pieds et tombe sur le côté, jamais vers l'avant. Casque, gilet d'impact, combinaison longue, et 50 m de distance avec les autres.",
    retenir: [
      "Pied avant au-dessus du mât",
      "Juste assez de poids devant pour coller à l'eau",
      "Kite immobile à 10-11 h",
      "Regard à l'horizon, jamais sur la planche",
    ],
    quiz: [
      { q: "Où se place le pied avant ?", a: "Juste au-dessus du mât, parfois un peu devant." },
      { q: "Pourquoi n'as-tu pas besoin de carre ?", a: "Le mât joue le rôle de dérive : la planche reste à plat." },
      { q: "La planche se soulève sans que tu le veuilles : que fais-tu ?", a: "Je choque la barre, je charge le pied avant et je remonte un peu le kite." },
    ],
    editorial: ed("Arrêt assis et sortie des straps à valider selon les montages du parc."),
  },

  {
    slug: "foil-premier-decollage",
    trickId: "foil-decollage",
    title: "Premier décollage en kitefoil",
    level: "Débutant",
    minutes: 9,
    intro:
      "En kitefoil, tout est petit : petites pressions, petits mouvements de kite. Le premier décollage, c'est quelques centimètres de vol, puis une touchette volontaire.",
    conditions:
      "10 à 15 nœuds stables, eau plate et profonde, mât court (60-75 cm) et grande aile avant, kite calé sans surpuissance.",
    prerequis: [
      "Naviguer à plat sur les deux bords sans que la planche se soulève",
      "Kite calé à 10-11 h sans le regarder",
      "Arrêt contrôlé en s'asseyant vers l'arrière",
      "Casque et gilet d'impact",
    ],
    phases: [
      { phase: "approche", cle: "Vitesse régulière à plat, kite calé, barre bordée" },
      { phase: "appel", cle: "Planche légère : petit recul des hanches" },
      { phase: "vol", cle: "Revenir neutre dès que la planche décolle" },
      { phase: "reception", cle: "Charger le pied avant, planche posée à plat" },
    ],
    schema: "foil-assiette",
    etapes: [
      {
        titre: "Prendre la bonne vitesse",
        texte:
          "Navigue à plat, kite à 10-11 h, légèrement abattu pour gagner de la vitesse. Garde une traction régulière pendant toute l'accélération : barre bordée progressivement, kite stable, sans à-coup ni passe. Les signes que la vitesse suffit : la planche devient légère sous tes pieds, le bruit de l'eau change et le nez a tendance à monter tout seul.",
      },
      {
        titre: "Déclencher",
        texte:
          "Quand ces signes apparaissent, recule légèrement les hanches vers le pied arrière. Pas de coup de pied, pas de saut : une pression progressive, à doser jusqu'à sentir la planche se décoller de quelques centimètres.",
      },
      {
        titre: "Revenir neutre tout de suite",
        texte:
          "Dès que l'eau lâche la planche, ramène les hanches au-dessus du mât. Si tu attends, le foil continue de monter jusqu'au breach. Regard à l'horizon, genoux souples.",
      },
      {
        titre: "Tenir 3 secondes",
        texte:
          "Reste entre 10 et 20 cm au-dessus de l'eau. Le kite ne bouge pas. Si la planche monte, un peu de pied avant ; si elle descend, un peu de pied arrière. Les corrections se font aux chevilles, pas aux épaules.",
      },
      {
        titre: "Redescendre en contrôle",
        texte:
          "Charge doucement le pied avant jusqu'à ce que la planche touche l'eau. Elle doit se poser à plat, pas piquer. Reprends la navigation à plat, puis recommence.",
      },
    ],
    erreurs: [
      {
        erreur: "Tu montes trop haut et le foil ventile (breach)",
        correction:
          "Tu reviens neutre trop tard. Dès que tu sens la planche se décoller, hanches au-dessus du mât. Compte « décolle-neutre » en une seule respiration.",
      },
      {
        erreur: "Tu piques du nez à la redescente",
        correction:
          "Trop de pied avant d'un coup. Charge l'avant progressivement, genoux fléchis, et garde le kite stable."
      },
      {
        erreur: "Tu fais une passe de kite pour décoller",
        correction:
          "Pendant le décollage, le kite donne une traction régulière : garde-le stable. C'est la vitesse, puis la pression arrière, qui soulèvent la planche.",
      },
    ],
    exercices: [
      "10 décollages de 3 secondes avec retour volontaire à l'eau, 5 par bord",
      "Un bord de 200 m en alternant 5 secondes de vol et 5 secondes à plat",
      "Décollage avec le kite immobile à 11 h, en comptant tout haut : tu ne dois pas sentir la barre bouger",
    ],
    filmer:
      "20 s de côté, plein cadre, sur le bord où tu décolles. On doit voir les hanches reculer puis revenir, et la hauteur de la planche au-dessus de l'eau.",
    securite:
      "Vol bas, jamais plus de 20 cm au début : une chute d'un breach est violente. Casque, gilet, et pousse la planche loin de toi en tombant. Reste à 50 m minimum des autres riders.",
    retenir: [
      "La vitesse décolle, pas le pied arrière",
      "Planche légère = signal du décollage",
      "Neutre dès que l'eau lâche",
      "Redescendre en chargeant l'avant",
    ],
    quiz: [
      { q: "Qu'est-ce qui fait décoller la planche ?", a: "La vitesse. Le pied arrière ne fait que déclencher." },
      { q: "Quand reviens-tu neutre ?", a: "Dès que la planche quitte l'eau, pas une seconde après." },
      { q: "Que fait le kite pendant l'accélération et le décollage ?", a: "Il donne une traction régulière, sans à-coup : stable vers 10-11 h, barre bordée progressivement." },
      { q: "Comment sais-tu que tu as assez de vitesse ?", a: "La planche devient légère sous tes pieds, le bruit de l'eau change et le nez tend à monter." },
    ],
    editorial: ed(),
  },

  /* ───────────────────────── Intermédiaire ───────────────────────── */
  {
    slug: "foil-vol-stable",
    trickId: "foil-vol",
    title: "Vol stable sur tout un bord",
    level: "Intermédiaire",
    minutes: 8,
    intro:
      "Voler, c'est tenir la même hauteur pendant 200 m sans toucher ni breacher. Tout se joue dans les chevilles et la souplesse des genoux.",
    conditions:
      "8 à 14 nœuds réguliers, clapot faible, kite calé à 10-11 h, foil que tu connais déjà.",
    prerequis: [
      "Décollages réguliers avec retour neutre",
      "Touchette volontaire sans chute",
      "Kite immobile pendant 10 secondes de vol",
      "Au moins 5 sessions sur le foil",
    ],
    phases: [
      { phase: "approche", cle: "Décollage, hanches neutres, 20 cm d'eau sous la planche" },
      { phase: "appel", cle: "Choisir la hauteur : la moitié du mât" },
      { phase: "vol", cle: "Corrections aux chevilles, genoux qui respirent" },
      { phase: "reception", cle: "Touchette douce avant de ralentir" },
    ],
    schema: "foil-assiette",
    etapes: [
      {
        titre: "Fixer la hauteur de croisière",
        texte:
          "Vole à la moitié du mât : 30 cm sur un mât de 60, 45 cm sur un mât de 90. En dessous, le clapot te fait toucher ; au-dessus, l'aile avant approche la surface et ventile.",
      },
      {
        titre: "Corriger petit et tôt",
        texte:
          "La planche monte de 5 cm ? Pousse un peu sur les orteils du pied avant. Elle descend ? Relâche le pied avant. Ne bouge jamais les épaules ni les bras : ça décale ton poids d'un coup.",
      },
      {
        titre: "Laisser les genoux amortir",
        texte:
          "Sur le clapot, les genoux absorbent, la planche reste à la même hauteur. Jambes raides = planche qui suit chaque vague. Pense « genoux qui respirent ».",
      },
      {
        titre: "Kite calé, barre près du corps",
        texte:
          "Kite à 10-11 h, mains au centre. Deux choses distinctes : la traction se gère avec la barre et la position du kite (choquer un peu, ou ajuster la hauteur du kite si tu as l'espace) ; l'assiette (l'inclinaison de la planche, nez haut ou nez bas) se règle avec les pieds et les hanches. Une passe de kite change la traction et dérègle l'assiette : en vol stable, le kite bouge le moins possible. Monter le kite n'est pas un réflexe à avoir par vent fort : il peut te soulever."
      },
      {
        titre: "Regard et épaules",
        texte:
          "Regarde 50 m devant, épaules parallèles à la planche. Le regard bas fait pencher le buste et charge l'avant : c'est la première cause de touchette.",
      },
    ],
    erreurs: [
      {
        erreur: "Tu fais le yo-yo entre touchette et breach",
        correction:
          "Tes corrections sont trop grandes et trop tardives. Corrige à 2 cm d'écart, pas à 10, et uniquement avec les chevilles.",
      },
      {
        erreur: "Le kite bouge pendant le vol",
        correction:
          "Tu tiens la barre avec les bras tendus. Coudes pliés, mains au centre, et tiens la barre comme un verre plein.",
      },
      {
        erreur: "La planche touche l'eau à chaque clapot",
        correction:
          "Tu voles trop bas et trop raide. Monte à la moitié du mât et laisse les genoux absorber.",
      },
    ],
    exercices: [
      "Un bord de 200 m sans toucher ni breacher, puis 500 m, puis un bord complet jusqu'au bout du spot",
      "Vol à 3 hauteurs sur le même bord : 10 cm, moitié du mât, 10 cm, sans jamais ventiler",
      "Vol en comptant tout haut pendant 30 secondes avec le kite strictement immobile",
    ],
    filmer:
      "20 s de côté, caméra à hauteur d'eau, plein cadre. Le but : voir la planche à hauteur constante, les genoux qui travaillent et le kite qui ne bouge pas.",
    securite:
      "Un breach à vitesse de croisière te projette en avant, sur le foil. Casque et gilet obligatoires, et si l'aile avant sort, charge l'avant immédiatement plutôt que de te raidir.",
    retenir: [
      "Hauteur = moitié du mât",
      "Corrections aux chevilles, 2 cm",
      "Genoux qui respirent",
      "Traction à la barre, assiette aux pieds",
    ],
    quiz: [
      { q: "À quelle hauteur voles-tu en croisière ?", a: "À la moitié du mât." },
      { q: "La planche monte de 5 cm : quel geste ?", a: "Un peu d'orteils sur le pied avant, sans bouger les épaules." },
      { q: "Ça tire trop pendant le vol : que fais-tu ?", a: "Je gère la traction : je choque un peu la barre, progressivement. L'assiette, elle, se corrige avec les pieds." },
      { q: "Quelle différence entre traction et assiette ?", a: "La traction vient du kite et se règle à la barre ; l'assiette est l'inclinaison de la planche et se règle aux pieds et aux hanches." },
    ],
    editorial: ed(),
  },

  {
    slug: "foil-remonter-au-vent",
    trickId: "foil-remonter",
    title: "Remonter au vent en vol",
    level: "Intermédiaire",
    minutes: 8,
    intro:
      "Le kitefoil remonte très bien au vent : le foil fait office de dérive, il faut peu de carre. Mais l'angle reste un compromis avec la vitesse : trop serré, le foil ne porte plus.",
    conditions:
      "8 à 14 nœuds, kite plutôt petit, eau plate, un repère fixe au vent (bouée, cap) pour mesurer ton angle.",
    prerequis: [
      "Vol stable sur un bord complet",
      "Kite calé sans le regarder",
      "Transition en touchant l'eau (pour revenir au point de départ)",
      "Comprendre la fenêtre de vent et le près",
    ],
    phases: [
      { phase: "approche", cle: "Vol stable au travers, vitesse installée" },
      { phase: "appel", cle: "Kite à 11 h, hanches vers l'avant" },
      { phase: "vol", cle: "Nez au près, carre légère et dosée" },
      { phase: "reception", cle: "Abattre un peu pour garder la vitesse" },
    ],
    schema: "trajet-navigation",
    etapes: [
      {
        titre: "D'abord la vitesse",
        texte:
          "On ne remonte pas au vent lentement. Pars au travers, prends de la vitesse en vol stable, puis seulement commence à lofer.",
      },
      {
        titre: "Monter le kite",
        texte:
          "Place le kite à 11 h (ou 13 h). Plus haut, il tire moins vers le côté et davantage vers le haut : la planche remonte plus facilement. Barre bordée à 60-70 %.",
      },
      {
        titre: "Hanches vers l'avant, poitrine ouverte vers le vent",
        texte:
          "Avance les hanches au-dessus du pied avant, épaules tournées vers le kite. Le pied avant pousse la planche au près, le pied arrière suit. Ne te penche pas en arrière comme en twin-tip.",
      },
      {
        titre: "Peu de carre",
        texte:
          "Incline légèrement la planche côté talons : juste assez pour qu'elle ne dérape pas. L'angle dépend du foil, du vent et de ta vitesse. Le mât dérive pour toi : trop de carre couche la planche, le foil fait de la traînée et tu ralentis.",
      },
      {
        titre: "Trouver la limite",
        texte:
          "Lofe progressivement jusqu'à sentir la vitesse chuter ou le kite reculer dans la fenêtre. À ce moment, abats un peu et reprends de la vitesse. Ton bon cap est juste en dessous : celui où le foil porte encore bien.",
      },
    ],
    erreurs: [
      {
        erreur: "Tu loffes trop et tu retombes à l'eau",
        correction:
          "Tu perds la vitesse qui fait porter le foil. Abats un peu dès que la planche s'enfonce, kite stable, barre bordée.",
      },
      {
        erreur: "Tu te couches sur la carre arrière",
        correction:
          "C'est un réflexe twin-tip. Hanches en avant, planche quasi à plat : c'est le mât qui empêche de déraper.",
      },
      {
        erreur: "Le kite tombe dans la fenêtre au près",
        correction:
          "Le kite est trop bas. Monte-le à 11 h ou 11 h 30 et lofe plus doucement pour qu'il reste au bord de la fenêtre.",
      },
    ],
    exercices: [
      "Vise un repère fixe au vent : note à chaque aller-retour si tu reviens au vent de ton point de départ",
      "Un bord en loffant par petits paliers jusqu'à sentir la vitesse chuter, puis abattre légèrement",
      "Remonter 300 m au vent en 4 bords, puis en 3",
    ],
    filmer:
      "20 s de côté, caméra au vent du rider, plein cadre. On doit voir l'angle de la planche par rapport aux vagues, l'inclinaison de la carre et la hauteur du kite.",
    securite:
      "Au près, tu croises la route des autres riders. Règles d'évitement : celui qui a le vent sur la droite (tribord amures) est prioritaire ; quand deux riders se croisent, celui au vent monte son kite et celui sous le vent le baisse ; celui qui rattrape un autre s'écarte ; dans le doute, tu t'écartes tôt et franchement. Casque et gilet, chute sur le côté, loin du foil.",
    retenir: [
      "Vitesse avant angle",
      "Kite à 11 h, barre bordée",
      "Hanches vers l'avant",
      "Carre légère, compromis cap-vitesse",
    ],
    quiz: [
      { q: "Pourquoi monter le kite pour remonter au vent ?", a: "Il tire moins vers le côté et laisse la planche pointer au près." },
      { q: "Combien de carre ?", a: "Peu : juste assez pour ne pas déraper. Le mât fait la dérive, et l'angle dépend du foil et de la vitesse." },
      { q: "La planche s'enfonce au près : réflexe ?", a: "J'abats un peu pour relancer la vitesse." },
      { q: "Tu croises un rider sous le vent de toi : que fait ton kite ?", a: "Je le monte : le rider au vent monte son kite, celui sous le vent baisse le sien." },
    ],
    editorial: ed(),
  },

  {
    slug: "foil-transition",
    trickId: "foil-transition",
    title: "Transition en touchant l'eau",
    level: "Intermédiaire",
    minutes: 8,
    intro:
      "Avant de virer en vol, apprends à changer de bord en te posant proprement : ralentir, poser, changer de pieds, redécoller. C'est ta transition de sécurité.",
    conditions:
      "8 à 14 nœuds stables, eau plate, assez d'espace sous le vent pour poser et redécoller.",
    prerequis: [
      "Vol stable sur un bord complet",
      "Touchette volontaire sans chute",
      "Water start des deux côtés avec la planche de foil",
      "Kite au zénith sans le regarder",
    ],
    phases: [
      { phase: "approche", cle: "Lofer en vol, kite qui monte vers 12 h" },
      { phase: "appel", cle: "Poser la planche à plat, vitesse qui tombe" },
      { phase: "vol", cle: "Changer de pieds planche à l'arrêt, kite au zénith" },
      { phase: "reception", cle: "Passe douce, redécoller sur l'autre bord" },
    ],
    schema: "fenetre-vent",
    etapes: [
      {
        titre: "Ralentir en loffant",
        texte:
          "En vol, lofe progressivement et monte le kite vers 12 h. La vitesse tombe, la planche descend naturellement. Charge le pied avant pour la poser à plat, nez légèrement au vent.",
      },
      {
        titre: "S'arrêter sans tomber",
        texte:
          "Planche posée, kite au zénith, barre choquée. Reste debout si la planche est assez volumineuse, sinon assieds-toi vers l'arrière, pieds toujours dans les straps.",
      },
      {
        titre: "Changer de pieds selon ta configuration",
        texte:
          "Ça dépend de tes straps. Configuration 1, straps avant et arrière (un strap avant central) : sors d'abord le pied avant du strap, puis fais glisser le pied arrière vers l'avant pour qu'il prenne la place dans le strap avant ; l'ancien pied avant va dans le strap arrière. Les deux pieds ne sont jamais ensemble dans le strap avant. Configuration 2, deux straps avant (un par bord) : le pied arrière va dans le strap avant libre du nouveau bord, puis l'autre recule. Configuration 3, sans strap arrière : le pied arrière se place librement. Si tu n'y arrives pas debout, utilise la version avec retour à l'eau.",
      },
      {
        titre: "Version avec retour à l'eau",
        texte:
          "Plus simple pour commencer : pose la planche, assieds-toi dans l'eau sur le côté loin du foil, kite stable au zénith (vent modéré). Change de pieds assis, ou retourne la planche, puis repars d'un water start sur le nouveau bord.",
      },
      {
        titre: "Redécoller sur le nouveau bord",
        texte:
          "Passe de kite douce du nouveau côté, lève-toi en poussant la jambe avant, planche à plat. Reprends de la vitesse à plat puis décolle quand la planche s'allège.",
      },
    ],
    erreurs: [
      {
        erreur: "Tu poses la planche trop vite et le nez pique",
        correction:
          "Tu charges l'avant d'un coup avec encore de la vitesse. Lofe d'abord, laisse la vitesse tomber, puis pose.",
      },
      {
        erreur: "Le kite tombe pendant le changement de pieds",
        correction:
          "Il n'est pas au zénith ou tu bouges la barre en bougeant les pieds. Vérifie le kite à 12 h avant de toucher aux pieds, main au centre de la barre.",
      },
      {
        erreur: "Tu redécolles trop tôt et tu tombes",
        correction:
          "Tu n'as pas assez de vitesse à plat. Navigue 3 secondes à plat avant de déclencher le décollage.",
      },
    ],
    exercices: [
      "5 transitions par côté en te posant à plat sans tomber, kite au zénith à chaque arrêt",
      "Enchaîner 6 bords de 100 m avec 5 transitions posées, sans water start assis",
      "Chronomètre : poser, changer de pieds et redécoller en moins de 15 secondes",
    ],
    filmer:
      "20 s de côté, plein cadre, depuis le point de virage. On doit voir la pose à plat, le changement de pieds et la hauteur du kite au zénith.",
    securite:
      "À l'arrêt, le foil est sous toi et la planche flotte librement : garde les pieds dans les straps ou éloigne la planche avant de nager. Vérifie l'espace sous le vent avant de poser.",
    retenir: [
      "Lofer, kite à 12 h, poser à plat",
      "Pieds changés selon ta configuration de straps",
      "Retour à l'eau possible : c'est une vraie option",
      "Jamais de passe forte",
    ],
    quiz: [
      { q: "Où est le kite pendant le changement de pieds ?", a: "Au zénith, barre choquée." },
      { q: "Comment poser la planche sans piquer ?", a: "En loffant pour perdre la vitesse avant de charger l'avant." },
      { q: "Quand redécoller ?", a: "Après avoir repris de la vitesse à plat, quand la planche s'allège." },
      { q: "Avec un seul strap avant, les deux pieds y passent-ils en même temps ?", a: "Non. Le pied avant sort d'abord, puis le pied arrière prend sa place." },
    ],
    editorial: ed("Un schéma par configuration de straps à produire et filmer."),
  },

  /* ───────────────────────── Avancé ───────────────────────── */
  {
    slug: "foil-jibe",
    trickId: "foil-jibe",
    title: "Jibe en vol",
    level: "Avancé",
    minutes: 10,
    intro:
      "Empanner sans retoucher l'eau : tu abats, tu pilotes le kite de l'autre côté de la fenêtre, et tu changes de pieds pendant ou après la courbe. Variante enseignée ici : jibe heelside vers heelside, changement de pieds plein vent arrière.",
    conditions:
      "8 à 14 nœuds réguliers, eau plate, kite plutôt petit pour ne pas être surpuissant plein vent arrière, 100 m d'espace sous le vent.",
    prerequis: [
      "Vol stable et transition posée des deux côtés",
      "Naviguer en toeside quelques secondes en vol",
      "Changer de pieds en vol en ligne droite",
      "Kite au zénith sans le regarder",
    ],
    phases: [
      { phase: "approche", cle: "Vitesse moyenne, kite monte à 12 h" },
      { phase: "appel", cle: "Abattre, appui orteils, courbe large" },
      { phase: "vol", cle: "Pieds changés plein vent arrière, hauteur constante" },
      { phase: "reception", cle: "Kite redescend à 1 h, finir sur les talons" },
    ],
    schema: "wing-jibe",
    variante: "Jibe heelside vers heelside, changement de pieds plein vent arrière",
    etapes: [
      {
        titre: "Préparer",
        texte:
          "Vol stable au travers, hauteur de croisière, vitesse moyenne. Monte le kite à 12 h : plein vent arrière, un kite bas te tirerait trop fort. Regarde déjà la sortie du virage.",
      },
      {
        titre: "Abattre sur les orteils",
        texte:
          "Appuie sur les orteils des deux pieds, épaules tournées vers l'intérieur. La planche s'incline et dessine une courbe large. Le kite ne passe pas seul : pilote-le activement, d'un mouvement doux de la barre, de 12 h vers le nouveau côté de la fenêtre, au rythme de ta courbe.",
      },
      {
        titre: "Changer de pieds plein vent arrière",
        texte:
          "Quand le kite est au-dessus de toi et la planche plein vent arrière, recule le pied avant vers l'arrière et avance l'autre en un seul mouvement, hanches au-dessus du mât. C'est le moment où la planche est la moins chargée : ne lève pas les pieds trop haut.",
      },
      {
        titre: "Finir sur les talons",
        texte:
          "Les pieds en place, bascule sur les talons pour finir la courbe. Redescends le kite à 1 h (ou 11 h) progressivement pour reprendre de la traction sur le nouveau bord.",
      },
      {
        titre: "Variante : changer les pieds avant",
        texte:
          "Si le changement en courbe est trop instable : change de pieds en ligne droite avant d'abattre (tu passes en toeside, en switch), jibe sur les talons et sors en heelside sur le nouveau bord. Autre option : jibe sans changer de pieds et sortie en toeside, changement de pieds ensuite. À travailler sur les deux bords.",
      },
    ],
    erreurs: [
      {
        erreur: "La planche monte et breache dans le virage",
        correction:
          "Tu charges l'arrière en pivotant. Garde les hanches au-dessus du mât et le regard loin, le changement de pieds doit rester bas et rapide.",
      },
      {
        erreur: "Tu retouches l'eau plein vent arrière",
        correction:
          "Pas assez de vitesse à l'entrée ou kite trop haut trop tôt. Entre un peu plus vite et ne monte le kite à 12 h qu'au moment d'abattre.",
      },
      {
        erreur: "Le kite te tire vers l'avant à la sortie",
        correction:
          "Tu redescends le kite trop vite. Descends-le progressivement sur 2 secondes, barre bordée doucement.",
      },
    ],
    exercices: [
      "10 changements de pieds en vol, en ligne droite, sans variation de hauteur",
      "5 jibes avec une touchette autorisée plein vent arrière, puis 5 sans toucher",
      "Enchaîner 3 jibes en vol d'affilée en gardant la moitié du mât",
    ],
    filmer:
      "20 s de côté depuis l'extérieur de la courbe, plein cadre. On doit voir la hauteur de la planche pendant toute la courbe, le moment du changement de pieds et le kite qui passe.",
    securite:
      "Plein vent arrière, le kite peut se retrouver sans tension et tomber. Si tu tombes, garde le contrôle de la barre pour piloter le kite hors de l'eau, ou largue si la situation l'exige ; éloigne-toi du foil. Lâcher la barre ne fait pas monter le kite. 100 m libres sous le vent, casque et gilet.",
    retenir: [
      "Kite à 12 h avant d'abattre",
      "Courbe large sur les orteils",
      "Kite piloté activement d'un côté à l'autre",
      "Pieds changés plein vent arrière, hanches sur le mât",
    ],
    quiz: [
      { q: "Pourquoi monter le kite à 12 h avant le jibe ?", a: "Plein vent arrière, un kite bas tire trop fort." },
      { q: "Quand changer de pieds ?", a: "Dans cette variante, planche plein vent arrière, kite au-dessus de toi. Autre option : passer en toeside avant d'abattre." },
      { q: "Le kite passe-t-il seul de l'autre côté ?", a: "Non : tu le pilotes activement, d'un mouvement doux de la barre, au rythme de ta courbe." },
      { q: "La planche breache dans la courbe : cause ?", a: "Trop de pied arrière pendant le changement de pieds." },
    ],
    editorial: ed("Variante à filmer sur les deux bords, avec les options de changement de pieds."),
  },

  {
    slug: "foil-tack",
    trickId: "foil-tack",
    title: "Tack en vol",
    level: "Avancé",
    minutes: 10,
    intro:
      "Virer de bord par le vent sans toucher l'eau. Face au vent, le kite ne tire plus : c'est la vitesse de la planche qui entretient la portance du foil pendant le passage. Il en faut assez, sans arriver à fond.",
    conditions:
      "10 à 14 nœuds réguliers, eau plate, kite réactif, remontée au vent déjà efficace.",
    prerequis: [
      "Remonter au vent à 45° en vol",
      "Jibe en vol réussi",
      "Changement de pieds en vol rapide",
      "Kite passé d'un côté à l'autre par le zénith sans le regarder",
    ],
    phases: [
      { phase: "approche", cle: "Bonne vitesse au près, kite à 11 h" },
      { phase: "appel", cle: "Lofer franchement, kite envoyé au zénith" },
      { phase: "vol", cle: "Nez dans le vent, pieds changés, kite bascule" },
      { phase: "reception", cle: "Kite redescend à 13 h, abattre pour relancer" },
    ],
    schema: "wing-tack",
    etapes: [
      {
        titre: "Emmagasiner de la vitesse",
        texte:
          "Au près, hauteur de croisière, bonne vitesse, kite à 11 h. Pourquoi la vitesse compte : le foil porte tant que l'eau le traverse assez vite. Pendant le passage face au vent, la traction disparaît et la planche ralentit ; c'est la vitesse emmagasinée qui garde le foil porteur jusqu'à ce que le kite tire à nouveau. Pas besoin d'arriver à vitesse maximale : trop vite, le virage devient brutal et tu risques le breach.",
      },
      {
        titre: "Lofer franchement",
        texte:
          "Appuie sur les talons et pousse le nez de la planche vers le vent, en un mouvement net. En même temps, envoie le kite vers 12 h : il monte et réduit la traction qui te freinerait de côté.",
      },
      {
        titre: "Passer le vent et changer de pieds",
        texte:
          "Quand le nez pointe face au vent, change de pieds en un seul mouvement, hanches au-dessus du mât. La planche continue sur son élan : garde-la à plat, pas de carre, regard vers la sortie.",
      },
      {
        titre: "Basculer le kite",
        texte:
          "Dès que la planche passe le lit du vent, amène le kite de 12 h vers 13 h (ou 11 h) sur le nouveau bord, barre bordée doucement. La traction revient et la planche retrouve sa portance.",
      },
      {
        titre: "Relancer",
        texte:
          "Abats de 10 à 15° pour reprendre de la vitesse, puis remonte au près. Si la planche touche, c'est à cet instant : un peu de pied arrière le temps que la vitesse revienne.",
      },
    ],
    erreurs: [
      {
        erreur: "La planche s'arrête face au vent et tu tombes",
        correction:
          "Pas assez de vitesse à l'entrée ou loffade trop molle : la vitesse tombe sous le seuil de portance. Arrive un peu plus vite et pousse le nez dans le vent plus franchement.",
      },
      {
        erreur: "Le kite est passé trop tôt et te tire en arrière",
        correction:
          "Le kite ne doit basculer qu'une fois le nez passé dans le vent. Envoie-le à 12 h, attends, puis redescends-le.",
      },
      {
        erreur: "Tu changes de pieds trop tard et tu sors en toeside",
        correction:
          "Change de pieds pendant que le nez est face au vent, pas après. Répète les changements de pieds en vol rapides en ligne droite.",
      },
    ],
    exercices: [
      "10 loffades franches jusqu'à 10° du vent sans tack, pour sentir combien de vitesse il te reste",
      "5 tacks avec touchette autorisée dans le vent, kite au zénith à chaque passage",
      "3 tacks d'affilée sans toucher, kite qui bascule seulement après le passage du vent",
    ],
    filmer:
      "20 s de côté, caméra au vent, plein cadre. On doit voir la loffade, l'instant où le nez passe le vent, le changement de pieds et le kite qui bascule.",
    securite:
      "Face au vent, la planche perd toute portance : la chute est devant toi, sur le foil. Casque et gilet, et tombe sur le côté en poussant la planche. 50 m libres au vent et sous le vent.",
    retenir: [
      "Assez de vitesse pour garder la portance",
      "Kite au zénith pendant le passage",
      "Pieds changés nez dans le vent",
      "Kite redescend après, puis abattre",
    ],
    quiz: [
      { q: "Quand le kite bascule-t-il sur l'autre bord ?", a: "Une fois que le nez a passé le lit du vent, pas avant." },
      { q: "Pourquoi faut-il de la vitesse ?", a: "Face au vent, le kite ne tire plus : c'est la vitesse de la planche qui garde le foil porteur pendant le passage." },
      { q: "Faut-il arriver à vitesse maximale ?", a: "Non : une bonne vitesse suffit. Trop vite, le virage devient brutal." },
      { q: "La planche touche juste après le tack : réflexe ?", a: "Un peu de pied arrière et abattre pour relancer la vitesse." },
    ],
    editorial: ed(),
  },

  {
    slug: "foil-toeside",
    trickId: "foil-toeside",
    title: "Toeside en vol",
    level: "Avancé",
    minutes: 8,
    intro:
      "Trois notions à ne pas confondre. Le toeside : tu navigues sur la carre orteils, dos au kite, avec le même pied devant. Le switch (stance switch) : ton autre pied est devant, tu peux être en heelside ou en toeside. Le changement de pieds : le geste qui inverse les pieds. En foil, le toeside se tient presque à plat.",
    conditions:
      "8 à 14 nœuds réguliers, eau plate, kite calé un peu plus haut qu'en heelside (11 h 30).",
    prerequis: [
      "Vol stable sur un bord complet",
      "Changement de pieds en vol en ligne droite",
      "Toeside acquis en twin-tip ou en displacement",
      "Transition posée des deux côtés",
    ],
    phases: [
      { phase: "approche", cle: "Vol stable heelside, kite à 11 h 30" },
      { phase: "appel", cle: "Pivot du buste, planche qui passe sur les orteils" },
      { phase: "vol", cle: "Orteils, épaules dans l'axe, regard par-dessus l'épaule" },
      { phase: "reception", cle: "Rechanger de pieds ou finir en jibe" },
    ],
    schema: "wing-pieds",
    etapes: [
      {
        titre: "Passer en toeside",
        texte:
          "En vol stable, kite un peu plus haut qu'en heelside, abats légèrement et fais pivoter le buste : ta poitrine passe vers l'avant, la planche bascule sur la carre orteils. Tes pieds ne bougent pas. Une autre façon d'arriver dos au kite est de changer de pieds en vol : tu es alors en switch, ce qui est une autre position. La planche ne doit pas changer de hauteur.",
      },
      {
        titre: "Ouvrir les épaules dans l'axe",
        texte:
          "Tourne le buste pour que les épaules soient parallèles à la planche, poitrine vers l'avant. Le bras arrière est tendu vers le kite, le bras avant plié. Ne reste pas en travers.",
      },
      {
        titre: "Doser les orteils",
        texte:
          "Appuie légèrement sur les orteils des deux pieds, surtout le pied avant. Une petite inclinaison suffit : trop, la planche se couche et le foil peut ventiler.",
      },
      {
        titre: "Le regard tient le cap",
        texte:
          "Regarde par-dessus l'épaule avant, vers ta direction. Le regard bas ou vers le kite fait tourner les épaules et la planche abat toute seule.",
      },
      {
        titre: "Sortir",
        texte:
          "Pour revenir en heelside, refais le pivot du buste dans l'autre sens, ou abats et finis en jibe. Dans les deux cas, hanches sur le mât et kite immobile.",
      },
    ],
    erreurs: [
      {
        erreur: "La planche abat sans arrêt en toeside",
        correction:
          "Tes épaules restent en travers. Ouvre le buste dans l'axe de la planche et regarde par-dessus l'épaule avant.",
      },
      {
        erreur: "Breach en passant dos au kite",
        correction:
          "Si tu passes par un changement de pieds, tu lèves les pieds trop haut et tu charges l'arrière. Glisse les pieds au ras de la planche, hanches sur le mât.",
      },
      {
        erreur: "Le kite tire trop et te déséquilibre",
        correction:
          "Dos au kite, la traction te tire vers l'avant. Monte le kite à 11 h 30 et choque légèrement la barre.",
      },
    ],
    exercices: [
      "10 changements de pieds en vol sans variation de hauteur",
      "Tenir 5 s de toeside en vol, puis 10 s, puis 100 m, kite immobile",
      "Un bord entier en alternant 10 s de heelside et 10 s de toeside",
    ],
    filmer:
      "20 s de côté, plein cadre, en toeside. On doit voir la position des épaules, l'inclinaison de la planche et la hauteur de vol pendant le changement de pieds.",
    securite:
      "Dos au kite, une chute te projette vers l'avant sur le foil. Casque et gilet, et commence en vol bas (10 cm) pour que la chute soit courte.",
    retenir: [
      "Toeside ≠ switch ≠ changement de pieds",
      "Épaules dans l'axe de la planche",
      "Inclinaison légère sur les orteils",
      "Regard par-dessus l'épaule avant",
    ],
    quiz: [
      { q: "La planche abat toute seule en toeside : cause ?", a: "Les épaules restent en travers au lieu d'être dans l'axe." },
      { q: "Où est le kite en toeside ?", a: "Un peu plus haut qu'en heelside, vers 11 h 30." },
      { q: "Toeside et switch, c'est pareil ?", a: "Non. Toeside : carre orteils, même pied devant. Switch : l'autre pied devant, en heelside ou en toeside." },
    ],
    editorial: ed(),
  },

  /* ───────────────────────── Expert ───────────────────────── */
  {
    slug: "foil-premier-saut",
    trickId: "foil-saut",
    title: "Premier saut en kitefoil",
    level: "Expert",
    minutes: 10,
    intro:
      "Sauter en foil, c'est un envoi de kite doux et une planche à plat en l'air. Le danger, ce n'est pas la hauteur, c'est la réception : le foil doit retrouver l'eau à plat, en vol.",
    conditions:
      "12 à 18 nœuds réguliers, eau plate et profonde, straps réglés à ton pied (ni trop lâches, ni serrés au point de ne pas pouvoir sortir en chute), kite réactif, 100 m libres sous le vent et 50 m au vent. Matériel vérifié avant la session.",
    prerequis: [
      "Vol stable, toeside, jibe et tack en vol",
      "Sauts maîtrisés en twin-tip avec réception propre",
      "Vol à vitesse soutenue sans breach",
      "Pieds qui ne bougent pas dans les straps en vol",
    ],
    phases: [
      { phase: "approche", cle: "Vitesse soutenue, kite à 10 h 30, planche basse" },
      { phase: "appel", cle: "Envoi doux vers 12 h, légère carre talons" },
      { phase: "vol", cle: "Planche à plat, genoux pliés, barre bordée" },
      { phase: "reception", cle: "Kite renvoyé, foil posé à plat, repartir en vol" },
    ],
    schema: "trajet-saut",
    etapes: [
      {
        titre: "Approche basse et rapide",
        texte:
          "Vole bas (10-15 cm), vite, kite à 10 h 30. Pas de clapot sous la planche. Regarde la zone d'atterrissage, 100 m sous le vent doit être libre.",
      },
      {
        titre: "Envoyer doucement",
        texte:
          "Envoie le kite vers 12 h en 1 seconde, pas en un coup sec. Au même moment, lofe légèrement sur les talons et borde la barre. Tu n'as pas de carre à charger comme en twin-tip : le foil et le kite te soulèvent ensemble.",
      },
      {
        titre: "En l'air",
        texte:
          "Ramène les genoux, barre bordée près des hanches, planche à plat sous toi. Ne bouge pas les pieds : un foil en travers à la réception, c'est la chute garantie. Regarde l'eau devant.",
      },
      {
        titre: "Renvoyer le kite",
        texte:
          "Au point haut, renvoie le kite vers 10 h 30 pour qu'il te pose dans le sens de la marche. Trop tôt, tu retombes à plat sans vitesse ; trop tard, le kite te tire en arrière.",
      },
      {
        titre: "Réception en vol",
        texte:
          "Pose le foil à plat, planche légèrement abattue, jambes qui absorbent. Reste neutre sur les hanches : si tu charges l'avant, tu touches ; l'arrière, tu breaches. Objectif : reprendre le vol sans toucher l'eau.",
      },
    ],
    erreurs: [
      {
        erreur: "La planche part en travers en l'air",
        correction:
          "Tu bouges les pieds ou les hanches. Genoux ramenés, planche sous toi, regarde la zone d'atterrissage.",
      },
      {
        erreur: "Réception violente, le foil s'enfonce et pique",
        correction:
          "Kite renvoyé trop tard et poids à l'avant. Renvoie au point haut et atterris hanches neutres, jambes pliées.",
      },
      {
        erreur: "Envoi trop fort, tu es arraché vers l'arrière",
        correction:
          "Trop de kite pour un foil. Envoie plus lentement, et arrête-le à 12 h, jamais derrière.",
      },
    ],
    exercices: [
      "10 petits sauts, à la hauteur où tu restes à l'aise, en ne travaillant que l'envoi doux et la planche à plat",
      "Sauts en comptant : envoi (1 s), genoux, renvoi, et réception avec reprise du vol sans toucher",
      "5 sauts enchaînés sur le même bord avec reprise du vol à chaque fois",
    ],
    filmer:
      "20 s de côté, caméra sous le vent, plein cadre avec le kite visible. On doit voir l'envoi, la planche en l'air et surtout l'angle du foil à la réception.",
    securite:
      "Atterrir sur le foil incliné peut casser le matériel ou te blesser. Avant de sauter, fais vérifier par ton moniteur : visserie du mât et du foil, réglage des straps, leash, casque, gilet. Profondeur suffisante pour un foil qui plonge à la réception. Si tu perds le contrôle en l'air : abandonne, renvoie ou lâche le kite selon la situation, et éloigne-toi du foil en tombant. 100 m libres sous le vent, 50 m au vent, jamais près d'autres riders.",
    retenir: [
      "Envoi doux sur 1 seconde, pas plus loin que 12 h",
      "Planche à plat, pieds immobiles",
      "Renvoyer au point haut",
      "Réception hanches neutres, reprendre le vol",
    ],
    quiz: [
      { q: "Jusqu'où envoyer le kite ?", a: "À 12 h, jamais derrière, et doucement." },
      { q: "Qu'est-ce qui remplace la charge de carre du twin-tip ?", a: "La portance du foil et une légère loffade : pas de carre forte." },
      { q: "Comment doit arriver le foil à la réception ?", a: "À plat, hanches neutres, pour reprendre le vol directement." },
    ],
    editorial: ed("Matériel, straps, profondeur et conduite en cas de perte de contrôle à faire vérifier par le coach kitefoil."),
  },

  {
    slug: "foil-backroll",
    trickId: "foil-backroll",
    title: "Backroll en kitefoil",
    level: "Expert",
    minutes: 11,
    intro:
      "La première rotation en foil : la tête et les épaules lancent la rotation, le kite reste immobile, et la planche doit retrouver l'eau à plat exactement comme sur un saut droit.",
    conditions:
      "12 à 18 nœuds réguliers, eau plate et profonde, straps réglés, kite réactif et stable, 100 m libres sous le vent et 50 m au vent.",
    prerequis: [
      "Sauts en foil réguliers avec reprise du vol à la réception",
      "Backroll maîtrisé en twin-tip",
      "Kite immobile pendant tout un saut",
      "Planche à plat en l'air sans mouvement de pieds",
      "Démonstration vue sur place ou en vidéo avec ton coach",
    ],
    phases: [
      { phase: "approche", cle: "Même approche qu'un saut, un peu plus de vitesse" },
      { phase: "appel", cle: "Envoi doux, tête tournée vers l'épaule arrière" },
      { phase: "vol", cle: "Rotation lente, kite à 12 h, genoux ramenés" },
      { phase: "reception", cle: "Repérer l'eau, renvoyer, foil à plat" },
    ],
    schema: "trajet-saut",
    etapes: [
      {
        titre: "Approche comme un saut",
        texte:
          "Vol bas et rapide, kite à 10 h 30. Un peu plus de vitesse qu'un saut droit : la rotation en foil est lente, il te faut de la hauteur pour la finir.",
      },
      {
        titre: "Envoyer et tourner la tête",
        texte:
          "Envoi doux vers 12 h avec une légère loffade sur les talons. Au moment où la planche quitte l'eau, tourne la tête vers l'épaule arrière puis par-dessus. Pas d'impulsion violente : le foil fait la hauteur, la tête fait la rotation.",
      },
      {
        titre: "Pendant la rotation",
        texte:
          "Genoux ramenés, barre bordée près des hanches, mains au centre. Le kite ne bouge pas de 12 h : un coup de barre pendant la rotation le fait plonger et tu atterris sans traction. La planche reste à plat sous toi.",
      },
      {
        titre: "Repérer la réception",
        texte:
          "Quand tu revois l'horizon, ouvre le regard vers ta direction. Renvoie le kite vers 10 h 30 pour qu'il te pose dans le sens de la marche. Le renvoi arrête la rotation.",
      },
      {
        titre: "Poser le foil à plat",
        texte:
          "Jambes qui absorbent, hanches neutres, planche légèrement abattue. Reprends le vol si tu le peux ; toucher l'eau avec la planche à plat est aussi une bonne réception. Ne cherche jamais à finir une rotation en forçant.",
      },
    ],
    erreurs: [
      {
        erreur: "Rotation incomplète, réception en travers",
        correction:
          "Tête tournée trop tard ou pas assez de hauteur. Tourne la tête dès le décollage et prends un peu plus de vitesse.",
      },
      {
        erreur: "Le kite plonge pendant la rotation",
        correction:
          "Tu tires un côté de la barre en tournant. Mains au centre, barre bordée vers les hanches, pas vers une épaule.",
      },
      {
        erreur: "Sur-rotation, tu atterris sur le dos ou le foil part sur le côté",
        correction:
          "Regard qui continue de tourner. Dès que tu revois l'horizon, fixe la zone d'atterrissage et renvoie le kite.",
      },
    ],
    exercices: [
      "10 sauts droits en tournant seulement la tête vers l'épaule arrière, sans chercher la rotation",
      "5 backrolls à faible hauteur, rotation au ras de l'eau, touchette tolérée à la réception",
      "3 backrolls enchaînés avec reprise du vol sans toucher l'eau",
    ],
    filmer:
      "20 s de côté, caméra sous le vent, plein cadre avec le kite. On doit voir le moment où la tête tourne, la stabilité du kite et l'angle du foil à la réception.",
    securite:
      "Une rotation ne se finit pas toujours sur le foil. Si tu perds tes repères en l'air : groupe-toi, protège ta tête, et à la chute éloigne-toi du foil (pousse la planche loin de toi). Garde le contrôle du kite ou largue selon la situation. Casque, gilet, straps réglés, 100 m libres sous le vent et 50 m au vent.",
    retenir: [
      "C'est la tête qui lance, pas les jambes",
      "Kite immobile à 12 h, mains au centre",
      "Horizon retrouvé = renvoyer le kite",
      "Perte de repères : groupé, tête protégée, loin du foil",
    ],
    quiz: [
      { q: "Qu'est-ce qui lance la rotation ?", a: "La tête et les épaules, dès le décollage." },
      { q: "Pourquoi le kite ne doit-il pas bouger ?", a: "Un kite qui plonge te pose sans traction, en travers sur le foil." },
      { q: "Tu perds tes repères en l'air : que fais-tu ?", a: "Je me groupe, je protège ma tête, et à la chute je m'éloigne du foil en poussant la planche. Je garde le contrôle du kite ou je largue selon la situation." },
    ],
    editorial: ed("Démonstration à filmer et prérequis à préciser par le coach kitefoil."),
  },
];
