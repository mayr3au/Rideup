import type { SchemaId } from "@/components/schemas";
import type { SportId } from "./sports";

/**
 * Leçons théoriques : fondamentaux (vent, fenêtre, body drag…) et sécurité (checklist, self-rescue,
 * priorités, signaux, courants). Contenu en blocs, avec schémas. Les cours « figure par figure »
 * restent dans courses.ts.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h"; text: string }
  | { type: "list"; items: string[] }
  | { type: "steps"; items: { titre: string; texte: string }[] }
  | { type: "schema"; id: SchemaId; caption?: string }
  | { type: "tip"; text: string }
  | { type: "warning"; text: string }
  | { type: "quiz"; items: { q: string; a: string }[] };

export type LessonCategory = "fondamentaux" | "securite";

/** Suivi éditorial : qui a relu, quand, sur quelles sources, et ce qui reste à valider en vidéo. */
export type Editorial = {
  /** Date de la dernière révision (AAAA-MM-JJ) */
  revise: string;
  relecteur: string;
  sources: string[];
  /** Ce qu'un moniteur de la discipline doit encore valider (démonstration filmée, procédure…) */
  aValider?: string;
  /** Clip de démonstration filmé et validé (URL), quand il existe */
  clip?: string;
};

export type Lesson = {
  slug: string;
  category: LessonCategory;
  /** Sports concernés ; vide = tous. */
  sports: SportId[];
  /** Figure de la roadmap à valider après ce cours, le cas échéant. */
  trickId?: string;
  title: string;
  level: string;
  minutes: number;
  intro: string;
  schema: SchemaId;
  blocks: Block[];
  retenir: string[];
  /** Fondamentaux de sécurité : accessibles sans abonnement */
  libre?: boolean;
  editorial?: Editorial;
};

/** Sources de référence citées par les leçons de sécurité (audit avant lancement, 18/11/2026). */
const SRC = {
  iko: "IKO, Assistant Manual V7",
  rnliKite: "RNLI, sécurité kitesurf",
  rnliRip: "RNLI, courants sortants (rip currents)",
  mer: "Ministère chargé de la Mer, sécurité nautique et secours (CROSS, VHF 16, 196)",
  surfEngland: "Surfing England, règles de priorité et de comportement",
  rya: "RYA, Wingfoiling First Flights",
  iwwf: "IWWF, règles et documents de sécurité câble",
};
const REVU = { revise: "2026-11-18", relecteur: "Équipe pédagogique RIDE'UP (révision après audit)" };

export const LESSONS: Lesson[] = [
  /* ───────────────────────── Fondamentaux ───────────────────────── */
  {
    slug: "fenetre-de-vent",
    category: "fondamentaux",
    sports: ["kitesurf", "foil"],
    trickId: "fenetre-vent",
    title: "Lire la fenêtre de vent",
    level: "Débutant",
    minutes: 7,
    libre: true,
    intro: "Le kite ne vole que dans une zone précise, sous le vent de toi. Savoir où il tire, où il tire moins et pourquoi il accélère quand il bouge, c'est la différence entre piloter et subir.",
    schema: "fenetre-vent",
    blocks: [
      { type: "p", text: "Tu es au centre, le vent arrive dans ton dos. Le kite vole devant toi, sous le vent, dans un quart de sphère : la fenêtre de vent. On s'y repère avec les heures d'une horloge : 9 h à ta gauche, 12 h au-dessus de ta tête (le zénith), 3 h à ta droite." },
      { type: "schema", id: "fenetre-vent", caption: "Vue depuis derrière le rider, le vent dans le dos. La zone de puissance est devant toi, sous le vent, au centre de la fenêtre ; le bord de fenêtre tire moins." },
      { type: "h", text: "La zone de puissance : sous le vent, au centre" },
      { type: "p", text: "Plus le kite est près du centre de la fenêtre, face à toi et sous le vent, plus il tire. C'est ce qui te sort de l'eau au water start et ce qui te fait décoller en saut. C'est aussi ce qui arrache un débutant quand le kite traverse cette zone par erreur, surtout près de l'eau ou du sable." },
      { type: "h", text: "Le mouvement du kite crée de la puissance" },
      { type: "p", text: "Un kite immobile tire selon le vent. Un kite qui bouge traverse l'air plus vite : à la vitesse du vent s'ajoute sa propre vitesse, et la traction monte d'un coup. C'est pour ça qu'une passe (le kite plonge puis remonte) donne de la puissance, et qu'un kite qui « pique » sans contrôle peut te soulever ou te traîner." },
      { type: "list", items: ["Vent faible : il faut faire travailler le kite (passes, sinusoïdes) pour créer de la traction.", "Vent soutenu : le kite reste plus calme, près du bord de fenêtre, et une petite passe suffit.", "Lignes plus longues = fenêtre plus grande et kite plus puissant."] },
      { type: "h", text: "Le bord de fenêtre et le zénith : moins de traction, jamais zéro" },
      { type: "p", text: "Sur le pourtour de la fenêtre, le kite tire moins : c'est là qu'on le tient pour marcher ou se préparer. Mais la traction ne disparaît jamais : il reste une traction résiduelle, qui grimpe dès qu'une rafale arrive. Au zénith, la traction devient verticale : par vent fort ou en rafale, un kite à 12 h peut te soulever du sol et te déplacer sous le vent. Sur la plage, près d'obstacles ou de personnes, on ne garde pas le kite au zénith par réflexe : on le tient bas sur le bord de fenêtre, côté eau, et on choque la barre." },
      { type: "tip", text: "Exercice à terre avec une aile d'entraînement, accompagné d'un moniteur : dessine lentement le bord de fenêtre, puis fais de petites passes. Sens comme la traction monte dès que l'aile accélère." },
      { type: "warning", text: "Ne lance jamais un kite dans la zone de puissance. Il se lance sur le bord de fenêtre, avec un assistant ou un moniteur, et seulement si l'espace sous le vent est dégagé." },
      { type: "quiz", items: [
        { q: "Où le kite tire-t-il le plus ?", a: "Sous le vent, au centre de la fenêtre, quand il est en mouvement : sa vitesse s'ajoute au vent." },
        { q: "Kite au zénith par vent fort, rafale qui arrive : quel risque ?", a: "Être soulevé et déplacé sous le vent. Le zénith n'est pas une zone sans danger : près du sable ou d'obstacles, on garde le kite bas sur le bord de fenêtre, côté eau." },
        { q: "Pourquoi une passe donne-t-elle de la puissance ?", a: "Parce que le kite accélère en traversant la fenêtre : plus il va vite dans l'air, plus il tire." },
      ] },
    ],
    retenir: ["Zone de puissance : sous le vent, au centre de la fenêtre", "Un kite qui bouge tire plus qu'un kite immobile", "Bord de fenêtre = moins de traction, jamais zéro", "Zénith par vent fort = risque d'être soulevé"],
    editorial: { ...REVU, sources: [SRC.iko], aValider: "Exercices au sol à pratiquer avec un moniteur." },
  },
  {
    slug: "comprendre-le-vent",
    category: "fondamentaux",
    sports: [],
    title: "Comprendre le vent : direction, force, rafales",
    level: "Débutant",
    minutes: 9,
    libre: true,
    intro: "Avant de regarder une appli météo, apprends à lire le vent sur place. Sa direction par rapport à la plage décide si tu sors ; sa régularité décide si c'est raisonnable.",
    schema: "directions-vent",
    blocks: [
      { type: "h", text: "La direction par rapport à la plage" },
      { type: "p", text: "On nomme le vent par rapport au rivage. Il y a cinq cas, pas trois :" },
      { type: "list", items: [
        "Side-shore : parallèle à la plage. Tu longes le bord ; si tu t'arrêtes, tu dérives le long de la côte.",
        "Side-on : en biais, du large vers la plage. Le plus confortable pour apprendre : une panne te ramène vers le bord.",
        "Onshore : de la mer vers la terre. Navigable, mais tu es repoussé vers la plage, les obstacles et le shore break.",
        "Side-off : en biais, de la terre vers le large. La dérive t'éloigne du bord.",
        "Offshore : de la terre vers le large. À la moindre panne ou chute, tu pars au large.",
      ] },
      { type: "schema", id: "directions-vent", caption: "Même plage, cinq vents. Side-shore et side-on : idéal pour apprendre. Onshore : prudence. Side-off et offshore : vent de terre, la dérive t'emmène au large." },
      { type: "h", text: "Vent de terre : offshore et side-off" },
      { type: "p", text: "Par vent de terre, le vent est souvent plus irrégulier près du bord (il passe sur les dunes, les arbres, les bâtiments) et toute dérive t'éloigne de la plage. En kite comme en wing, c'est déconseillé aux débutants, sans exception. Un rider expérimenté et autonome peut y aller seulement s'il a vérifié avant de partir : les règles locales, la météo observée sur place, une sortie de repli praticable sous le vent en cas de panne ou une assistance nautique opérationnelle, et un moyen d'alerte sur lui. Sans solution vérifiée, il renonce." },
      { type: "h", text: "La force : en nœuds" },
      { type: "p", text: "Le vent se mesure en nœuds (1 nd ≈ 1,85 km/h). Les prévisions donnent le vent moyen et les rafales. Sur place, l'eau et les drapeaux donnent une idée de la force, mais ils ne suffisent pas pour choisir une taille d'aile : la bonne taille dépend aussi de ton poids, de ton niveau, de ta planche et du modèle d'aile. Demande à un moniteur ou aux riders du spot, et commence toujours par la taille la plus raisonnable." },
      { type: "schema", id: "echelle-vent", caption: "Ordre de grandeur de ce qu'on voit sur l'eau, et ce que ça veut dire pour un débutant. Ce n'est pas un tableau de tailles d'aile." },
      { type: "h", text: "Les rafales : repères" },
      { type: "list", items: [
        "Une rafale, c'est une hausse de vent de quelques secondes. Sur l'eau, elle se voit : une tache plus sombre et plus ridée qui avance vers toi.",
        "Ce qui compte, c'est l'écart entre le vent moyen et les rafales. Quand la rafale dépasse le vent moyen d'environ 40 % ou plus (exemple : 19 nds, rafales 27 et au-delà), le vent est irrégulier : ton aile sera tantôt molle, tantôt trop puissante.",
        "Pour un débutant, un écart de plus de 8 nds suffit à rester à terre.",
        "Les rafales viennent des nuages sombres (grains), des reliefs et des bâtiments au vent, et des changements de temps. Un grain qui arrive = on rentre.",
      ] },
      { type: "list", items: [
        "Observe le plan d'eau au moins 10 minutes avant de gréer : s'il change de direction ou de force, attends.",
        "Un vent qui tourne vers la terre pendant la session : tu rentres tout de suite.",
        "Orage visible ou grondement : tout le monde sort de l'eau, aile posée et sécurisée.",
      ] },
      { type: "tip", text: "Le Spot Finder de RIDE'UP affiche vent moyen, rafales et orientation par rapport à chaque spot, heure par heure, et n'affiche ni « Go ! » ni taille d'aile quand le vent est trop irrégulier. La dernière vérification se fait toujours sur la plage." },
      { type: "quiz", items: [
        { q: "Tu débutes, vent de terre (offshore) annoncé à 18 nds réguliers. Tu sors ?", a: "Non. Par vent de terre, la moindre panne t'emmène au large. C'est déconseillé aux débutants, quelle que soit la force." },
        { q: "Rider expérimenté, side-off annoncé. Que vérifie-t-il avant de partir ?", a: "Les règles locales, la météo sur place, une sortie de repli sous le vent ou une assistance nautique opérationnelle, et un moyen d'alerte. Sans solution vérifiée, il renonce au créneau." },
        { q: "15 nds moyen, rafales 26. Verdict pour apprendre ?", a: "Trop irrégulier : la rafale dépasse le vent moyen de plus de 70 %. Ton aile sera tantôt molle, tantôt violente. On attend." },
        { q: "Side-shore et side-on, c'est pareil ?", a: "Non. Side-shore souffle parallèle à la plage ; side-on arrive en biais du large et te ramène vers le bord en cas de panne." },
      ] },
    ],
    retenir: ["Cinq vents : side-shore, side-on, onshore, side-off, offshore", "Vent de terre : déconseillé aux débutants ; autonome = repli ou assistance vérifiés", "Rafale ≥ 40 % au-dessus du vent moyen = vent irrégulier", "La taille d'aile ne se déduit pas des moutons : demande, et commence raisonnable"],
    editorial: { ...REVU, sources: [SRC.iko, SRC.rnliKite, SRC.mer] },
  },
  {
    slug: "body-drag",
    category: "fondamentaux",
    sports: ["kitesurf"],
    trickId: "body-drag",
    title: "Le body drag",
    level: "Débutant",
    minutes: 6,
    libre: true,
    intro: "Se laisser tirer dans l'eau sans planche. C'est le premier contact entre le kite et ton corps, et la technique qui te permet d'aller récupérer ta planche.",
    schema: "body-drag",
    blocks: [
      { type: "p", text: "Le body drag sert à sentir la traction du kite dans l'eau, à rejoindre une planche perdue et à te rapprocher du bord. Il s'apprend avec un moniteur, dans une eau où tu as pied ou en zone surveillée, avec un espace libre sous le vent." },
      { type: "steps", items: [
        { titre: "Body drag sous le vent", texte: "Kite haut dans la fenêtre, allonge-toi dans l'eau. Fais de petites passes contrôlées : le kite te tire sous le vent. Corps détendu, jambes en gouvernail. La hauteur du kite se règle selon le vent et ta traction : assez haut pour rester maître, assez actif pour avancer." },
        { titre: "Body drag en travers", texte: "Kite tenu d'une main, assez haut dans la fenêtre. L'autre bras, tendu dans l'eau comme une dérive, pointe vers où tu veux aller. Ton corps s'oppose au kite : tu avances en travers du vent. Selon le vent et ta technique, tu tiendras ta hauteur ou tu perdras un peu de terrain : c'est normal au début." },
        { titre: "Sur les deux bords", texte: "Entraîne-toi kite à gauche puis kite à droite : la main qui pilote et le bras-dérive s'inversent. Tant que tu n'es pas à l'aise des deux côtés, tu n'es pas autonome pour récupérer ta planche." },
      ] },
      { type: "schema", id: "body-drag", caption: "Les deux bords du body drag : kite d'un côté, bras-dérive de l'autre. Le rider avance en travers du vent." },
      { type: "h", text: "Récupérer la planche : au vent ou sous le vent" },
      { type: "list", items: [
        "Planche sous le vent de toi : body drag sous le vent, en visant légèrement à côté d'elle pour ne pas la percuter, puis attrape-la par une poignée ou un strap.",
        "Planche au vent de toi : body drag en travers, en zigzag, pour remonter au-dessus d'elle, puis laisse-toi redescendre dessus. Si tu n'y arrives pas (vent, courant), rentre au bord en body drag et demande de l'aide : on ne s'épuise pas pour une planche.",
      ] },
      { type: "list", items: ["Si la traction devient trop forte, choque la barre et remonte doucement le kite.", "Garde de l'espace sous le vent : un body drag peut aller vite."] },
      { type: "tip", text: "Objectif avant le water start : te déplacer en travers sur les deux bords, et récupérer ta planche posée au vent et sous le vent de toi, avec un moniteur qui te regarde." },
      { type: "quiz", items: [
        { q: "Ta planche est sous le vent, à 30 m. Que fais-tu ?", a: "Body drag sous le vent en petites passes contrôlées, en visant légèrement à côté d'elle, puis tu l'attrapes." },
        { q: "Ta planche est au vent, à 30 m. Que fais-tu ?", a: "Body drag en travers, en zigzag, pour remonter au-dessus d'elle, puis tu redescends dessus. Si tu n'y arrives pas, tu rentres et demandes de l'aide." },
        { q: "Pourquoi s'entraîner sur les deux bords ?", a: "Parce que la planche ne tombe pas toujours du même côté : la main qui pilote et le bras-dérive s'inversent." },
      ] },
    ],
    retenir: ["Kite assez haut pour rester maître, assez actif pour avancer", "Bras tendu dans l'eau = dérive pour avancer en travers", "Planche au vent : remonter au-dessus, puis redescendre dessus", "S'entraîner sur les deux bords"],
    editorial: { ...REVU, sources: [SRC.iko], aValider: "Démonstration filmée sur les deux bords par un moniteur kite." },
  },

  /* ───────────────────────── Sécurité ───────────────────────── */
  {
    slug: "checklist-securite",
    category: "securite",
    sports: [],
    title: "Avant d'aller à l'eau : la checklist",
    level: "Tous niveaux",
    minutes: 8,
    libre: true,
    intro: "Beaucoup d'accidents se préparent avant de mouiller les pieds : spot mal choisi, vent pas adapté, matériel pas vérifié. Quelques minutes de routine, à chaque session, quel que soit ton sport.",
    schema: "zone-securite",
    blocks: [
      { type: "h", text: "Tronc commun : tous les sports" },
      { type: "h", text: "1. Le spot" },
      { type: "schema", id: "zone-securite", caption: "Une zone de mise à l'eau dégagée, de l'espace libre sous le vent, et la baignade loin de ta trajectoire." },
      { type: "list", items: [
        "Règles locales : zones autorisées, chenaux, horaires, interdictions. Elles priment sur la météo.",
        "Zone de baignade, surfeurs, pêcheurs, bateaux : repère-les et reste à distance.",
        "Marée : à marée haute, la plage rétrécit et des obstacles se retrouvent juste sous la surface (rochers, épis, piquets, bancs). Ils ne se voient plus mais sont toujours là : repère-les à marée basse ou demande aux locaux.",
        "Courants, fonds, accès et sorties possibles : demande aux locaux ou au club.",
      ] },
      { type: "h", text: "2. La météo" },
      { type: "list", items: ["Direction par rapport à la plage (voir le cours sur le vent). Vent de terre : déconseillé si tu n'es pas autonome.", "Force et rafales adaptées à ton niveau ; vent irrégulier = prudence.", "Pas d'orage annoncé ni de grain visible. Ciel qui noircit = sortie immédiate."] },
      { type: "h", text: "3. Toi" },
      { type: "list", items: ["Quelqu'un sait que tu es à l'eau, où, et quand tu rentres.", "Tu as un moyen d'alerte adapté (téléphone étanche, VHF) et tu connais les signaux.", "Fatigue, froid, alcool, matériel nouveau : chacun réduit ta marge. Deux en même temps, tu restes au sec.", "Combinaison adaptée à la température de l'eau, pas de l'air. Casque et gilet d'impact selon ta pratique."] },
      { type: "h", text: "Contrôles par sport" },
      { type: "steps", items: [
        { titre: "Kitesurf et kitefoil", texte: "Lignes démêlées, de longueur égale, sans usure. Largueur (quick release) actionné à sec et remonté. Leash de sécurité attaché au point prévu par le fabricant. Kite gonflé à la pression indiquée par le fabricant, sans fuite ni déchirure. 50 m libres sous le vent pour lancer." },
        { titre: "Wingfoil", texte: "Aile gonflée à la pression du fabricant, leash d'aile et leash de planche en bon état et bien fixés. Foil serré (vis, mât, fuselage), sans jeu. Profondeur suffisante pour le mât à la mise à l'eau." },
        { titre: "Surf", texte: "Leash adapté à la taille de la vague, attache solide, planche sans fissure. Observe les séries et les courants avant d'entrer." },
        { titre: "Wakeboard au câble", texte: "Briefing de l'opérateur suivi, gilet et casque comme demandé par le parc, chausses bien serrées, planche et ailerons en bon état. Repère le tracé autorisé et la sortie après chute." },
      ] },
      { type: "warning", text: "Un doute = pas de session. Le vent reviendra." },
      { type: "quiz", items: [
        { q: "Pourquoi la marée haute change-t-elle le spot ?", a: "La plage rétrécit et des obstacles (rochers, épis, piquets) passent juste sous la surface : on ne les voit plus, mais on peut les heurter." },
        { q: "À quelle pression gonfler son kite ou son aile ?", a: "À celle indiquée par le fabricant pour ce modèle." },
        { q: "Le vent est bon mais un grain arrive à l'horizon ?", a: "On ne sort pas. Un grain apporte des rafales violentes et un vent qui tourne." },
      ] },
    ],
    retenir: ["Règles locales, marée et obstacles cachés", "Direction et régularité du vent avant la force", "Contrôles propres à ton sport, à chaque session", "Quelqu'un sait où tu es ; un doute = pas de session"],
    editorial: { ...REVU, sources: [SRC.iko, SRC.rnliKite, SRC.rya, SRC.iwwf, SRC.mer] },
  },
  {
    slug: "self-rescue",
    category: "securite",
    sports: ["kitesurf", "foil"],
    title: "Self-rescue : rentrer seul en kite",
    level: "Débutant",
    minutes: 10,
    libre: true,
    intro: "Vent qui tombe, ligne cassée, kite qui ne redécolle plus : tu dois savoir neutraliser ton kite, alerter et rentrer. Cette procédure s'apprend avec un moniteur, sur l'eau, puis se répète chaque saison.",
    schema: "self-rescue",
    blocks: [
      { type: "p", text: "Le principe : neutraliser le kite, évaluer la situation et alerter si besoin, rejoindre le kite en enroulant les lignes, puis l'utiliser comme une voile pour te faire pousser vers le bord. Par vent de terre, le kite te pousse vers le large : c'est pour ça que ce vent est déconseillé tant que tu n'as pas de repli ou d'assistance vérifiés." },
      { type: "schema", id: "self-rescue", caption: "Les cinq temps : larguer, évaluer et alerter, enrouler, faire voile, arriver hors du shore break." },
      { type: "steps", items: [
        { titre: "1. Larguer", texte: "Actionne le largueur du chicken loop. Le kite part en drapeau sur la ligne reliée au leash et perd l'essentiel de sa puissance. Attention : il reste une traction résiduelle. Le kite peut encore tirer, traîner dans l'eau ou se remettre à voler si une rafale le prend ou si les lignes avant se tendent. Garde le contrôle du leash et éloigne-toi des autres. Si le kite te traîne vers un danger (rochers, shore break, bateau), largue aussi le leash : ta sécurité passe avant le matériel." },
        { titre: "2. Évaluer et alerter", texte: "Où est le bord ? Le vent te pousse-t-il vers la plage ? Es-tu loin, fatigué, en eau froide ? Si tu as un doute, alerte tout de suite, sans attendre d'être épuisé : VHF canal 16, ou le 196 depuis un téléphone (secours en mer en France, CROSS), ou le 112. Bras levé et agité lentement pour te faire voir." },
        { titre: "3. Enrouler les lignes", texte: "Rapproche-toi du kite en enroulant les lignes autour de la barre, main après main, en gardant en tension uniquement la ligne reliée au leash : les autres lignes restent molles pour que le kite ne reprenne pas de puissance. Jamais une ligne autour d'un doigt, d'un poignet ou du cou. Arrivé près du kite, sécurise la barre (lignes enroulées, coincée)." },
        { titre: "4. Faire voile", texte: "Attrape le kite par une extrémité du bord d'attaque, mets-le sur le côté, bord d'attaque vers toi. Tiens l'extrémité au vent : l'autre moitié se gonfle et te pousse sous le vent. Oriente-toi en inclinant le kite. Si ta planche est avec toi, garde-la." },
        { titre: "5. Arriver sans se faire piéger", texte: "Avant la zone où les vagues cassent sur le sable (shore break), ralentis. Ne te mets jamais entre le kite et la plage dans les vagues : une vague peut rouler le kite et les lignes sur toi. Si les vagues sont fortes, lâche le kite et sors seul ; tu le récupéreras sur le sable avec de l'aide." },
      ] },
      { type: "h", text: "En attendant un secours" },
      { type: "p", text: "Ne dégonfle pas ton kite en attendant un secours dont tu n'as pas la confirmation : gonflé, il flotte, il te soutient et il se voit de loin, et tu peux encore faire voile. Ne le dégonfle que si un secours confirmé te le demande. Reste avec ton matériel, garde un bras levé quand quelqu'un regarde vers toi, et économise tes forces." },
      { type: "warning", text: "Cette procédure ne s'improvise pas le jour où tu en as besoin. Fais-la avec un moniteur, en conditions faciles (vent side-on, près du bord, eau surveillée), puis répète-la chaque saison et à chaque nouveau matériel : les systèmes de largage diffèrent selon les marques." },
      { type: "quiz", items: [
        { q: "Après avoir largué, le kite peut-il encore tirer ?", a: "Oui : il reste une traction résiduelle. Il peut traîner ou se remettre à voler. On garde le contrôle du leash, et on largue le leash s'il nous entraîne vers un danger." },
        { q: "Qui appeler en mer, en France ?", a: "VHF canal 16, ou le 196 depuis un téléphone (CROSS), ou le 112. Et un bras levé, agité lentement, pour se faire voir." },
        { q: "Tu attends un bateau qui n'a pas confirmé qu'il venait. Tu dégonfles ton kite ?", a: "Non. Gonflé, il flotte, il se voit et il te permet encore de faire voile. On ne dégonfle que si un secours confirmé le demande." },
        { q: "Tu arrives au bord, il y a du shore break. Que fais-tu ?", a: "Tu ralentis, tu ne te mets jamais entre le kite et la plage, et si les vagues sont fortes, tu lâches le kite pour sortir seul." },
      ] },
    ],
    retenir: ["Larguer : traction résiduelle, garder le contrôle du leash", "Alerter tôt : VHF 16, 196, 112, bras levé", "Ne pas dégonfler sans secours confirmé", "Shore break : jamais entre le kite et la plage"],
    editorial: { ...REVU, sources: [SRC.iko, SRC.rnliKite, SRC.mer], aValider: "Procédure à refaire et filmer avec un moniteur kite (ticket prioritaire de l'audit)." },
  },
  {
    slug: "priorites-sur-l-eau",
    category: "securite",
    sports: ["kitesurf", "wingfoil", "foil"],
    title: "Priorités et règles sur l'eau",
    level: "Débutant",
    minutes: 7,
    libre: true,
    intro: "Des lignes de 20 m, des ailes qui se croisent vite : sans règles communes, le spot devient dangereux. La première règle, avant toutes les autres : prendre ses distances tôt.",
    schema: "priorites",
    blocks: [
      { type: "h", text: "D'abord : prendre ses distances" },
      { type: "p", text: "La meilleure priorité, c'est celle dont tu n'as pas besoin. Repère les autres riders de loin, anticipe leur trajectoire et écarte-toi bien avant d'être proche. En cas de doute, change de cap tôt et clairement, pour que l'autre comprenne ce que tu fais." },
      { type: "schema", id: "priorites", caption: "Le croisement type, vu depuis la plage : le rider au vent tient son aile haute, celui sous le vent la tient basse, pour que les lignes ne se touchent pas." },
      { type: "steps", items: [
        { titre: "Main droite devant = priorité", texte: "Le rider tribord amures (main droite vers l'avant, aile sur sa droite) garde sa route. L'autre s'écarte tôt, de préférence en passant sous le vent." },
        { titre: "Croisement : au vent aile haute, sous le vent aile basse", texte: "Quand deux kites se croisent, le rider au vent tient son kite haut, celui sous le vent tient le sien bas, pour que les lignes ne se touchent pas. Ce n'est pas un réflexe à appliquer au dernier moment : il complète l'écart pris tôt." },
        { titre: "Celui qui part de la plage passe en premier", texte: "Celui qui rentre lui laisse la place : celui qui part est dans la zone la plus délicate (bord, baigneurs) et a besoin d'espace." },
        { titre: "Celui qui rattrape s'écarte", texte: "Le plus rapide contourne largement. On ne double pas au vent de quelqu'un qui saute." },
        { titre: "Saut : l'espace avant tout", texte: "Avant de sauter, regarde sous le vent et derrière. Repère de l'IKO pour le kite : au moins 50 m libres sous le vent et 30 m au vent, à augmenter selon le vent, le niveau, la hauteur du saut et le monde sur l'eau." },
      ] },
      { type: "h", text: "Les exceptions à connaître" },
      { type: "list", items: [
        "Rider en difficulté (tombé, aile à l'eau, en train de remettre sa planche, en détresse) : il ne peut pas manœuvrer. C'est toi qui t'écartes, quelles que soient les règles, et tu l'aides ou tu alertes si besoin.",
        "Rider moins manœuvrant (débutant, matériel à l'eau, en water start) : on lui laisse de la place.",
        "Changement de direction (jibe, transition, virement) : celui qui change de direction s'assure d'abord que l'espace est libre ; pendant sa manœuvre, il n'a pas de priorité.",
        "Saut : celui qui saute est responsable de son espace, au vent comme sous le vent.",
        "Surfeurs, nageurs, SUP : ils ne peuvent pas t'éviter. Tu t'écartes toujours.",
        "Bateaux et autres engins : règles de navigation du lieu. Dans le doute, tu t'écartes.",
      ] },
      { type: "tip", text: "Tu te rapproches d'un autre rider et tu hésites ? Ralentis, change de cap tôt et franchement. Perdre dix secondes coûte moins cher qu'un emmêlage de lignes." },
      { type: "quiz", items: [
        { q: "Quelle est la première règle pour éviter un croisement dangereux ?", a: "Prendre ses distances tôt : anticiper et s'écarter bien avant d'être proche." },
        { q: "Deux kites se croisent. Lequel tient son aile haute ?", a: "Celui qui est au vent. Celui sous le vent tient la sienne basse, pour que les lignes ne se touchent pas." },
        { q: "Un rider vient de tomber, son kite est à l'eau sur ta trajectoire. Tu as la priorité ?", a: "Peu importe : il ne peut pas manœuvrer. Tu t'écartes, et tu l'aides ou tu alertes si besoin." },
        { q: "Quel espace pour sauter en kite ?", a: "Repère IKO : au moins 50 m libres sous le vent et 30 m au vent, à augmenter selon la situation." },
      ] },
    ],
    retenir: ["D'abord prendre ses distances, tôt", "Main droite devant : je garde ma route", "Au vent aile haute, sous le vent aile basse", "Rider en difficulté, nageurs, surfeurs : on s'écarte", "Saut kite : 50 m sous le vent, 30 m au vent, plus si besoin"],
    editorial: { ...REVU, sources: [SRC.iko, SRC.rnliKite] },
  },
  {
    slug: "lancer-et-poser-a-deux",
    category: "securite",
    sports: ["kitesurf", "foil"],
    title: "Lancer et poser le kite à deux",
    level: "Débutant",
    minutes: 7,
    libre: true,
    intro: "Le moment le plus délicat d'une session se passe souvent sur la plage. Un lancement assisté bien fait, c'est deux personnes qui savent où se placer, un contrôle complet, puis un signal clair.",
    schema: "signaux",
    blocks: [
      { type: "schema", id: "signaux", caption: "Les trois signaux les plus utilisés pour lancer et poser. Mets-toi d'accord avec ton assistant avant de commencer." },
      { type: "h", text: "Les rôles" },
      { type: "list", items: [
        "Le pilote (toi) tient la barre, choisit le moment et donne le signal. Il est responsable du lancement.",
        "L'assistant tient le kite par le bord d'attaque, au bord de la fenêtre, et ne lâche que sur le signal du pilote. Il ne tient jamais une ligne.",
        "Si l'assistant n'a jamais fait ça, explique-lui les gestes et les signaux avant. S'il n'est pas à l'aise, demande à quelqu'un d'expérimenté ou à un moniteur.",
      ] },
      { type: "h", text: "Lancer" },
      { type: "steps", items: [
        { titre: "Placement", texte: "L'assistant tient le kite debout sur une extrémité, bord d'attaque face au vent, au bord de la fenêtre. Le pilote se place de façon à ce que le kite soit sur le bord de fenêtre, jamais dans la zone de puissance. Ces positions dépendent du vent et du spot : fais-les valider par un moniteur la première fois." },
        { titre: "Contrôle avant le signal", texte: "Avant tout signal, le pilote vérifie : lignes claires et sans croisement jusqu'au kite, barre dans le bon sens, largueur armé, leash attaché, espace libre sous le vent (personne, obstacle), direction et force du vent. Si un point cloche, on ne lance pas." },
        { titre: "Le signal", texte: "Pouce levé = « lance ». L'assistant lâche le kite sans le pousser. Le pilote le monte doucement le long du bord de fenêtre. Si quelque chose ne va pas, signal d'arrêt : l'assistant garde le kite." },
      ] },
      { type: "h", text: "Poser" },
      { type: "steps", items: [
        { titre: "Demander", texte: "Tape le haut de ta tête : « pose-moi le kite ». Attends que ton assistant confirme et se place." },
        { titre: "Descendre sur le bord de fenêtre", texte: "Amène le kite doucement vers l'assistant, sur le bord de fenêtre, à hauteur d'homme. Il attrape le bord d'attaque et le retourne." },
        { titre: "Sécuriser", texte: "Le kite posé est retourné, lesté avec du sable ou la planche sur le bord d'attaque. Un kite posé non lesté peut redécoller seul." },
      ] },
      { type: "warning", text: "Pas d'assistant fiable ? Pas de lancement improvisé. Attends quelqu'un d'expérimenté ou demande à l'école du spot. Lignes croisées au moment du lancement : signal d'arrêt, on repose, on démêle." },
      { type: "quiz", items: [
        { q: "Qui donne le signal de lancement ?", a: "Le pilote, après avoir contrôlé lignes, barre, largueur, leash, espace sous le vent et vent." },
        { q: "Par où l'assistant tient-il le kite ?", a: "Par le bord d'attaque, jamais par une ligne, et il ne lâche que sur le signal du pilote." },
        { q: "Personne de fiable pour t'aider à lancer. Que fais-tu ?", a: "Tu ne lances pas. Tu attends quelqu'un d'expérimenté ou tu demandes à l'école du spot." },
      ] },
    ],
    retenir: ["Pilote responsable, assistant au bord d'attaque", "Contrôle complet avant le pouce levé", "Toujours sur le bord de fenêtre", "Kite posé = kite lesté ; pas d'assistant = pas de lancement"],
    editorial: { ...REVU, sources: [SRC.iko], aValider: "Positions pilote et assistant à valider et filmer avec un moniteur kite." },
  },
  {
    slug: "vagues-et-courants",
    category: "securite",
    sports: ["surf", "kitesurf", "wingfoil"],
    title: "Vagues et courants : lire la plage",
    level: "Débutant",
    minutes: 8,
    libre: true,
    intro: "Sur une plage à vagues, l'eau qui arrive doit repartir. Elle le fait par des couloirs, les courants sortants, qui emportent chaque année des nageurs et des riders. Les repérer, c'est savoir où ne pas aller.",
    schema: "baine",
    blocks: [
      { type: "h", text: "Baïne et courant de baïne : deux choses différentes" },
      { type: "p", text: "Une baïne, c'est une cuvette d'eau entre la plage et un banc de sable, qui se remplit à marée montante. Quand elle se vide, l'eau ressort vers le large par un chenal : c'est le courant de baïne, un courant sortant. On le retrouve sur beaucoup de plages, sous d'autres noms (rip current)." },
      { type: "schema", id: "baine", caption: "Les vagues cassent sur les bancs de sable. Dans le chenal entre deux bancs, l'eau ressort vers le large : moins de vagues, mais un courant qui peut être plus rapide qu'un bon nageur." },
      { type: "h", text: "Reconnaître un courant sortant" },
      { type: "list", items: ["Une bande d'eau où les vagues cassent moins, entre deux zones où ça déferle.", "Une couleur différente : plus sombre (plus profond) ou plus trouble (sable en suspension).", "De l'écume ou des débris qui partent vers le large.", "Le courant varie avec la marée, la houle et la forme des bancs : il peut changer d'un jour à l'autre. Les sauveteurs et les panneaux du poste de secours sont la meilleure info du jour."] },
      { type: "h", text: "Si tu es pris dedans" },
      { type: "steps", items: [
        { titre: "Flotte et garde ton matériel", texte: "Ne lutte pas contre le courant : il est souvent plus fort que toi. Ta planche flotte : garde-la, allonge-toi dessus, respire. Si tu n'as plus de planche, mets-toi sur le dos et flotte pour reprendre ton souffle." },
        { titre: "Alerte", texte: "Lève un bras et crie pour attirer l'attention des sauveteurs ou des autres usagers. En mer, VHF canal 16 ou 196 depuis un téléphone (France), ou 112." },
        { titre: "Sors sur le côté si tu peux", texte: "Si tu en as la force, nage ou rame en travers du courant, parallèlement à la plage, vers une zone où les vagues cassent. La distance pour sortir varie : ne t'épuise pas, et reviens à la flottaison si tu fatigues." },
        { titre: "Rentre en biais", texte: "Une fois sorti du couloir, rejoins le bord en biais, en profitant des vagues." },
      ] },
      { type: "h", text: "En kite ou en wing" },
      { type: "p", text: "Avec une aile, le courant décale ton point de rentrée pendant que tu remets ta planche. Évite de rester dans le chenal, et ne traîne pas dans le shore break, là où les vagues cassent sur le sable : c'est là que le matériel casse, et les corps aussi." },
      { type: "h", text: "Les vagues elles-mêmes" },
      { type: "list", items: ["Les séries : plusieurs grosses vagues, puis une accalmie. Observe au moins cinq minutes avant d'entrer.", "Shore break : on ne s'y tient pas debout face au large et on n'y reste pas.", "Surf : ne lâche pas ta planche quand quelqu'un est derrière toi."] },
      { type: "warning", text: "Débutant : on n'entre pas dans un courant sortant pour gagner le large, même si ça paraît plus facile. Plage non surveillée + courant + personne pour te voir = tu n'y vas pas seul. Les drapeaux et consignes des sauveteurs s'appliquent à toi." },
      { type: "quiz", items: [
        { q: "Baïne et courant de baïne, c'est la même chose ?", a: "Non. La baïne est la cuvette d'eau ; le courant de baïne est l'eau qui en ressort vers le large par un chenal." },
        { q: "Tu es emporté vers le large. Premier réflexe ?", a: "Ne pas lutter : flotter en gardant ta planche, alerter (bras levé, cri), puis sortir sur le côté si tu en as la force." },
        { q: "Le courant est-il le même tous les jours au même endroit ?", a: "Non : il dépend de la marée, de la houle et des bancs de sable. Renseigne-toi auprès des sauveteurs chaque jour." },
      ] },
    ],
    retenir: ["Baïne = cuvette ; courant de baïne = l'eau qui ressort au large", "Pris dedans : flotter, garder sa planche, alerter", "Sortir sur le côté si on peut, sans s'épuiser", "Débutant : jamais d'entrée par un courant sortant"],
    editorial: { ...REVU, sources: [SRC.rnliRip, SRC.surfEngland, SRC.mer] },
  },
];

export function lessonBySlug(slug: string) {
  return LESSONS.find((l) => l.slug === slug);
}

export function lessonForTrick(trickId: string) {
  return LESSONS.find((l) => l.trickId === trickId);
}

export const LESSON_CATEGORIES: { id: LessonCategory; title: string; text: string }[] = [
  { id: "fondamentaux", title: "Fondamentaux", text: "Le vent, la fenêtre, le pilotage : ce qu'il faut comprendre avant la première figure." },
  { id: "securite", title: "Sécurité", text: "Les réflexes qui évitent l'accident, à relire chaque saison." },
];
