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
};

export const LESSONS: Lesson[] = [
  /* ───────────────────────── Fondamentaux ───────────────────────── */
  {
    slug: "fenetre-de-vent",
    category: "fondamentaux",
    sports: ["kitesurf", "foil"],
    trickId: "fenetre-vent",
    title: "Lire la fenêtre de vent",
    level: "Débutant",
    minutes: 6,
    intro: "Tout le kite tient dans ce quart de sphère. Comprendre où l'aile tire et où elle se pose, c'est la différence entre piloter et subir.",
    schema: "fenetre-vent",
    blocks: [
      { type: "p", text: "Tu es le centre. Le vent arrive dans ton dos. Le kite ne peut voler que dans une zone en forme de quart de sphère devant toi : la fenêtre de vent. Pour s'y repérer, on utilise les heures d'une horloge : 9 h à ta gauche, 12 h au-dessus de ta tête (le zénith), 3 h à ta droite." },
      { type: "schema", id: "fenetre-vent", caption: "Vue depuis derrière le rider, le vent dans le dos : 9 h à gauche, 3 h à droite. Plus le kite est près du centre de la fenêtre, plus il tire." },
      { type: "h", text: "Le bord de fenêtre : la zone neutre" },
      { type: "p", text: "Sur le pourtour (le trait pointillé), le kite est en équilibre : il vole, mais tire à peine. C'est là que tu le gares pour marcher, discuter, remettre ta planche. Au zénith (12 h), la traction est purement verticale : le kite te soulage mais ne te déplace pas." },
      { type: "h", text: "La zone de puissance" },
      { type: "p", text: "Dès que le kite quitte le bord et traverse l'intérieur de la fenêtre, il accélère et tire fort — très fort au centre, en bas. C'est ce qui te sort de l'eau au water start, et ce qui te fait décoller en saut. C'est aussi ce qui blesse les débutants qui font passer le kite au ras de l'eau par erreur." },
      { type: "h", text: "Pourquoi 11 h et 1 h reviennent tout le temps" },
      { type: "p", text: "Pour naviguer, on tient le kite entre 10 h et 11 h (ou 1 h et 2 h de l'autre côté) : assez bas pour tirer vers l'avant, assez haut pour rester stable. Pour un body drag ou un water start, on fait une passe : le kite plonge dans la zone de puissance puis remonte. L'amplitude de la passe règle la puissance." },
      { type: "list", items: ["Vent faible : le kite doit bouger beaucoup (grandes passes, sinusoïdes) pour créer de la traction.", "Vent fort : le kite reste calé près du bord de fenêtre ; une petite passe suffit.", "Plus les lignes sont longues, plus la fenêtre est grande et plus le kite génère de puissance."] },
      { type: "tip", text: "Exercice à terre avec une aile d'entraînement : dessine lentement le bord de fenêtre de 9 h à 3 h, puis fais de petites passes à 11 h. Sens la différence de traction sans jamais traverser le centre." },
      { type: "warning", text: "Ne lance jamais un kite dans la zone de puissance (face au vent, en bas). Il se lance toujours sur le bord de fenêtre, à 9 h ou 3 h." },
      { type: "quiz", items: [
        { q: "Où garer le kite pour attendre sans traction ?", a: "Au zénith (12 h) ou sur le bord de fenêtre. Jamais à l'intérieur." },
        { q: "Pourquoi le kite tire-t-il plus en bas de fenêtre ?", a: "Parce qu'il traverse l'air plus vite en descendant dans la zone de puissance : sa vitesse propre s'ajoute au vent." },
        { q: "Il y a 25 nœuds. Grandes passes ou kite calé ?", a: "Kite calé près du bord de fenêtre : il tire déjà assez. Les grandes passes, c'est pour le vent faible." },
      ] },
    ],
    retenir: ["Le kite ne vole que dans le quart de sphère devant toi", "Bord de fenêtre et zénith = zone neutre", "Centre et bas de fenêtre = puissance maximale", "Navigation : kite entre 10 h et 11 h (ou 1 h et 2 h)"],
  },
  {
    slug: "comprendre-le-vent",
    category: "fondamentaux",
    sports: [],
    title: "Comprendre le vent : direction, force, rafales",
    level: "Débutant",
    minutes: 8,
    intro: "Avant de regarder une appli météo, apprends à lire le vent sur place. Sa direction par rapport à la plage décide si tu sors ; sa force décide avec quoi.",
    schema: "directions-vent",
    blocks: [
      { type: "h", text: "La direction : la seule question qui compte" },
      { type: "p", text: "On nomme le vent par rapport à la plage. Side-shore : il souffle parallèlement au rivage. Onshore : de la mer vers la terre. Offshore : de la terre vers le large. Entre les deux, side-on et side-off." },
      { type: "schema", id: "directions-vent", caption: "Même spot, trois vents : seul le side (ou side-on) coche toutes les cases." },
      { type: "list", items: [
        "Side / side-on : idéal. Tu longes la plage, et si tu lâches tout, tu dérives vers le bord.",
        "Onshore plein : navigable, mais tu es constamment repoussé sur la plage : zone de lancement serrée, obstacles proches, vagues en bord. Pas pour un premier water start.",
        "Offshore : interdit pour toi. Si le vent faiblit ou que le matériel casse, tu pars au large. Même les pros sortent avec un bateau de sécurité.",
      ] },
      { type: "h", text: "La force : nœuds, ressenti, taille d'aile" },
      { type: "p", text: "Le vent se mesure en nœuds (1 nd ≈ 1,85 km/h). Les applis donnent le vent moyen et les rafales. Sur place, l'eau et les drapeaux te disent la vérité : des moutons épars = 12–15 nds, des moutons partout = 18 nds et plus." },
      { type: "schema", id: "echelle-vent", caption: "Ordre de grandeur pour un rider de 75 kg en twin-tip. Pour une aile de wing ou un foil, les tailles changent mais la logique est la même." },
      { type: "h", text: "Les rafales : le vrai danger" },
      { type: "p", text: "Un vent de 15 nds moyen avec des rafales à 25 est plus dangereux qu'un 20 nds régulier. L'écart entre moyen et rafale s'appelle le gust factor : au-delà de 8 nds d'écart, un débutant reste à terre. Les rafales viennent des nuages sombres (grains), des reliefs et des bâtiments, et du vent thermique de fin d'après-midi." },
      { type: "list", items: [
        "Regarde le vent sur l'eau 10 minutes avant de gréer : s'il change de direction ou de force, attends.",
        "Un vent qui tourne offshore au cours de la session t'oblige à rentrer tout de suite.",
        "Orage visible ou grondement = tout le monde sort de l'eau, kite posé et sécurisé.",
      ] },
      { type: "tip", text: "Le Spot Finder de RIDE'UP affiche vent moyen, rafales et orientation par rapport à chaque spot, heure par heure. Mais la dernière vérification se fait toujours sur la plage, avec tes yeux." },
      { type: "quiz", items: [
        { q: "Vent de terre annoncé, 18 nds réguliers. Tu sors ?", a: "Non. Offshore = tu dérives vers le large à la moindre panne. Peu importe la force." },
        { q: "15 nds moyen, rafales 26. Verdict ?", a: "Trop rafaleux pour apprendre (11 nds d'écart). Ton kite sera tantôt mou, tantôt violent." },
        { q: "Moutons partout sur l'eau, tu pèses 75 kg : quelle aile ?", a: "Moutons partout ≈ 18–22 nds : une aile de 9 à 10 m². Pas la 12." },
      ] },
    ],
    retenir: ["Side ou side-on : oui. Offshore : jamais", "Nœuds : moutons épars ≈ 12–15, partout ≈ 18+", "Écart moyen/rafales > 8 nds = on attend", "Le vent se vérifie sur place, pas seulement sur l'appli"],
  },
  {
    slug: "body-drag",
    category: "fondamentaux",
    sports: ["kitesurf"],
    trickId: "body-drag",
    title: "Le body drag",
    level: "Débutant",
    minutes: 5,
    intro: "Se laisser tirer dans l'eau sans planche. C'est le premier contact entre le kite et ton corps, et la technique qui te permettra toujours d'aller récupérer ta planche.",
    schema: "fenetre-vent",
    blocks: [
      { type: "p", text: "Le body drag sert à trois choses : sentir la traction du kite en sécurité, rejoindre une planche perdue, et rentrer à la plage si la planche est hors de portée. Un kiteur autonome le fait dans les deux sens, kite d'une main." },
      { type: "steps", items: [
        { titre: "Body drag sous le vent", texte: "Kite à 12 h, allonge-toi dans l'eau. Descends le kite à 11 h, puis fais de petites passes 11 h → 10 h → 11 h. Le kite te tire droit sous le vent. Corps détendu, jambes tendues en gouvernail." },
        { titre: "Body drag en travers (au près)", texte: "Garde le kite calé à 10 h–11 h d'une main. L'autre bras, tendu dans l'eau comme une dérive, pointe vers où tu veux aller. Épaule et hanche s'opposent au kite : tu avances en travers du vent, et même un peu contre." },
        { titre: "Récupérer la planche", texte: "Remonte au vent de la planche en body drag au près, puis laisse-toi descendre dessus. Attrape-la par un strap, kite au zénith, et remets-la aux pieds assis dans l'eau." },
      ] },
      { type: "schema", id: "fenetre-vent", caption: "En body drag, le kite reste haut dans la fenêtre (10 h–11 h) : juste assez de traction, zéro surprise." },
      { type: "list", items: ["Le kite ne descend jamais en dessous de 10 h en body drag : trop de puissance, et un risque de le poser sur l'eau.", "Deux mains sur la barre = tu vas tout droit. Une main + bras-dérive = tu vas où tu veux.", "Si tu te fais tirer trop vite, ne tire pas sur la barre : pousse-la pour choquer."] },
      { type: "tip", text: "Objectif avant de passer au water start : partir d'un point, faire 50 m en body drag au près de chaque côté, et revenir à ton point de départ." },
      { type: "quiz", items: [
        { q: "Ta planche est sous le vent, à 30 m. Que fais-tu ?", a: "Body drag sous le vent, kite en petites passes à 11 h. Facile : le kite te mène droit dessus." },
        { q: "Ta planche est au vent, à 30 m. Que fais-tu ?", a: "Body drag au près : remonte en zigzag au-dessus d'elle, puis redescends dessus." },
      ] },
    ],
    retenir: ["Kite entre 10 h et 11 h, jamais plus bas", "Bras tendu dans l'eau = dérive qui te fait remonter", "Toujours remonter au vent de la planche, puis descendre dessus"],
  },

  /* ───────────────────────── Sécurité ───────────────────────── */
  {
    slug: "checklist-securite",
    category: "securite",
    sports: [],
    title: "Avant d'aller à l'eau : la checklist",
    level: "Tous niveaux",
    minutes: 7,
    intro: "Neuf accidents sur dix se décident avant de mouiller les pieds : mauvais spot, mauvais vent, matériel pas vérifié. Cinq minutes de routine, à chaque session.",
    schema: "zone-securite",
    blocks: [
      { type: "h", text: "1. Le spot" },
      { type: "schema", id: "zone-securite", caption: "Ce qu'il te faut : une zone de lancement dégagée, 50 m libres sous le vent, et la baignade loin de ta trajectoire." },
      { type: "list", items: [
        "Marge sous le vent : au moins deux longueurs de lignes (≈ 50 m) sans personne, poteau, rocher ni digue.",
        "Zone de baignade, surfeurs, pêcheurs : repère-les et reste à distance. Beaucoup de spots ont un chenal dédié : utilise-le.",
        "Obstacles au vent (bâtiments, dunes, arbres) = vent turbulent près du bord : éloigne-toi du rivage pour un vent propre.",
        "Marée : à marée haute, la plage rétrécit et les rochers remontent. Regarde l'horaire.",
        "Demande aux locaux : courants, cailloux sous l'eau, règles du spot, numéro des secours.",
      ] },
      { type: "h", text: "2. La météo" },
      { type: "list", items: ["Direction side ou side-on (voir le cours sur le vent). Offshore : on ne sort pas.", "Force dans ta plage, écart moyen/rafales < 8 nds.", "Pas d'orage annoncé, pas de front qui arrive. Ciel qui noircit = sortie immédiate."] },
      { type: "h", text: "3. Le matériel" },
      { type: "list", items: [
        "Lignes : démêlées, longueurs égales, pas de ragage. Une ligne qui pète en l'air, c'est un kite en vrille.",
        "Largueur (quick release) : tu l'actionnes une fois à sec avant chaque session. Si tu hésites, c'est qu'il faut le refaire.",
        "Leash de sécurité attaché au bon point, et compatible avec ton largueur.",
        "Kite : pas de fuite (bord d'attaque gonflé dur), pas de déchirure, brides et poulies saines.",
        "Casque et gilet d'impact pour les débutants et pour les sauts ; combinaison adaptée à la température de l'eau, pas de l'air.",
      ] },
      { type: "h", text: "4. Toi" },
      { type: "list", items: ["Quelqu'un sait que tu es à l'eau et quand tu rentres.", "Tu connais ton self-rescue et tes signaux.", "Fatigue, froid, alcool, nouveau matériel : chacun retire une marge. Deux en même temps, tu restes au sec."] },
      { type: "warning", text: "Un doute = pas de session. Le vent reviendra. Un kite qui t'échappe sur une plage avec des gens ne te laisse pas de deuxième chance." },
      { type: "quiz", items: [
        { q: "Combien de place libre sous le vent au minimum ?", a: "Deux longueurs de lignes, soit environ 50 m, sans personne ni obstacle." },
        { q: "À quelle fréquence tester son largueur ?", a: "À chaque session, à sec, avant d'aller à l'eau." },
        { q: "Le vent est bon mais un orage est visible à l'horizon ?", a: "On ne sort pas. Un grain apporte des rafales violentes et un vent qui tourne." },
      ] },
    ],
    retenir: ["50 m libres sous le vent, baignade à distance", "Side ou side-on, rafales modérées, pas d'orage", "Lignes, largueur, leash vérifiés à chaque session", "Préviens quelqu'un, et pas de session si doute"],
  },
  {
    slug: "self-rescue",
    category: "securite",
    sports: ["kitesurf", "foil"],
    title: "Self-rescue : rentrer seul en kite",
    level: "Débutant",
    minutes: 9,
    intro: "Vent qui tombe, ligne cassée, kite qui ne redécolle plus : tu dois savoir rentrer sans aide, en transformant ton kite en voile. À apprendre avec un moniteur, puis à répéter chaque saison.",
    schema: "self-rescue",
    blocks: [
      { type: "p", text: "Le principe : neutraliser le kite, le rejoindre en enroulant les lignes, puis l'utiliser comme une voile pour te laisser pousser vers la plage. Avec un vent onshore ou side, ça marche toujours. Avec un vent offshore, ça ne marche pas : raison de plus pour ne jamais sortir par vent de terre." },
      { type: "schema", id: "self-rescue", caption: "Les quatre temps du self-rescue. Chaque geste se fait calmement : la panique fatigue plus que la nage." },
      { type: "steps", items: [
        { titre: "Tire le largueur", texte: "Pousse le largueur du chicken loop. Le kite part en drapeau sur une seule ligne (le leash) et perd toute sa puissance. Attends qu'il soit à plat sur l'eau. Si ton leash est sur une ligne avant, le kite peut encore bouger : garde une main sur le leash." },
        { titre: "Enroule les lignes", texte: "Tire-toi vers le kite en enroulant les lignes autour des flotteurs de la barre, main après main, sans jamais passer une ligne autour d'un doigt ou du cou. Prends ton temps : 25 m, ça fait une minute." },
        { titre: "Attrape le bord d'attaque", texte: "Arrivé au kite, saisis le bord d'attaque gonflé par une oreille (l'extrémité). Retourne-le pour qu'il repose sur le dos, bord d'attaque vers toi." },
        { titre: "Voile vers la plage", texte: "Allonge-toi dans l'eau, tiens l'oreille au vent du kite à bout de bras et laisse l'autre moitié se gonfler. Le kite fait voile et te pousse sous le vent. Oriente-toi en inclinant plus ou moins l'oreille. Si la planche est avec toi, cale-la sous ton bras ou dans le harnais." },
      ] },
      { type: "h", text: "Si ça ne suffit pas : le pack-down" },
      { type: "p", text: "Loin de la plage, par vent très faible ou pour attendre un bateau : dégonfle le bord d'attaque, roule le kite serré autour de la barre et des lignes, et nage avec le paquet. Le kite fait flotteur. Lève un bras bien droit et agite-le lentement : c'est le signal de détresse reconnu." },
      { type: "warning", text: "Ne te sépare jamais de ton kite dégonflé ni de ta planche : ils flottent, ils se voient de loin, et ils te sauvent du froid. Un kiteur sans matériel dans l'eau est invisible." },
      { type: "tip", text: "Entraîne-toi en conditions faciles, près du bord, par vent side-on de 12 nds, avec quelqu'un qui te regarde. Le jour où tu en auras besoin, ton corps saura quoi faire." },
      { type: "quiz", items: [
        { q: "Premier geste quand tout va mal ?", a: "Le largueur. Le kite en drapeau ne tire plus et tu peux réfléchir." },
        { q: "Comment enrouler les lignes sans danger ?", a: "Autour des flotteurs de la barre, main après main. Jamais autour d'un doigt, d'un poignet ou du cou." },
        { q: "Signal de détresse en mer ?", a: "Un bras levé, agité lentement de haut en bas. Reste avec ton matériel." },
      ] },
    ],
    retenir: ["Largueur → kite en drapeau → calme", "Enrouler autour des flotteurs, jamais autour du corps", "Oreille au vent à bout de bras : le kite fait voile", "Rester avec son matériel ; bras levé = détresse"],
  },
  {
    slug: "priorites-sur-l-eau",
    category: "securite",
    sports: ["kitesurf", "wingfoil", "foil"],
    title: "Priorités et règles sur l'eau",
    level: "Débutant",
    minutes: 6,
    intro: "Des lignes de 25 m, des ailes qui se croisent à 40 km/h : sans règles communes, le spot devient un billard. Elles tiennent en cinq points.",
    schema: "priorites",
    blocks: [
      { type: "schema", id: "priorites", caption: "Le croisement type : chacun écarte son aile de celle de l'autre, et le rider tribord amures (main droite devant) garde son cap." },
      { type: "steps", items: [
        { titre: "Main droite devant = priorité", texte: "Le rider tribord amures (main droite vers l'avant, kite sur sa droite) garde sa route. L'autre s'écarte, de préférence en passant sous le vent." },
        { titre: "Croisement : au vent kite bas, sous le vent kite haut", texte: "Quand vous vous croisez de près, le rider au vent descend son aile, celui sous le vent la monte. Les lignes ne se touchent jamais." },
        { titre: "Celui qui part de la plage a la priorité", texte: "Sur celui qui rentre : il est dans la zone la plus dangereuse (bord, baigneurs) et a besoin de place pour partir." },
        { titre: "Celui qui rattrape s'écarte", texte: "Le plus rapide contourne, par le côté sous le vent. On ne double pas entre un rider et sa vague, ni au vent de quelqu'un qui saute." },
        { titre: "Saut : 50 m libres sous le vent, et on regarde avant", texte: "Avant de sauter, un coup d'œil sous le vent et derrière. Un saut, c'est 20 à 30 m de déplacement latéral." },
      ] },
      { type: "h", text: "Et avec les autres usagers" },
      { type: "list", items: ["Surfeurs, nageurs, SUP : toujours prioritaires. Ils ne peuvent pas t'éviter, toi si.", "Bateaux et planches à voile : les règles de navigation classiques s'appliquent. Dans le doute, tu t'écartes.", "Sur un spot à vagues, le rider qui surfe la vague a la priorité sur celui qui remonte."] },
      { type: "tip", text: "Tu te rapproches d'un autre rider et tu hésites ? Monte ton kite au zénith et ralentis. Perdre dix secondes coûte moins cher qu'un emmêlage de lignes." },
      { type: "quiz", items: [
        { q: "Deux riders se croisent. Lequel monte son kite ?", a: "Celui qui est sous le vent (le plus près de la plage sur un vent side). Celui au vent descend le sien." },
        { q: "Tu rentres à la plage, un rider décolle devant toi. Qui a la priorité ?", a: "Celui qui part. Tu ralentis et tu le laisses s'éloigner." },
        { q: "Un nageur est sur ta trajectoire.", a: "Tu changes de route, toujours. Il est prioritaire quoi qu'il arrive." },
      ] },
    ],
    retenir: ["Main droite devant : je garde ma route", "Croisement : au vent kite bas, sous le vent kite haut", "Celui qui part de la plage passe en premier", "Nageurs et surfeurs : prioritaires sans discussion"],
  },
  {
    slug: "lancer-et-poser-a-deux",
    category: "securite",
    sports: ["kitesurf", "foil"],
    title: "Lancer et poser le kite à deux",
    level: "Débutant",
    minutes: 6,
    intro: "Le moment le plus dangereux d'une session, c'est sur la plage. Un lancement assisté bien fait prend trente secondes et trois signes de la main.",
    schema: "signaux",
    blocks: [
      { type: "schema", id: "signaux", caption: "Les trois signaux que tout le monde comprend, sur tous les spots du monde." },
      { type: "h", text: "Lancer" },
      { type: "steps", items: [
        { titre: "Placement", texte: "L'assistant tient le kite par le bord d'attaque, au bord de fenêtre (à 9 h ou 3 h de toi), ailes vers le ciel. Tu te places face à lui, lignes tendues, légèrement au vent de la ligne du kite." },
        { titre: "Tension et vérification", texte: "Recule d'un pas pour tendre les lignes. Regarde-les : elles doivent être claires, sans croisement. Vérifie le largueur et le leash." },
        { titre: "Le pouce", texte: "Pouce levé = « lance ». L'assistant lâche le kite, qui monte doucement vers le zénith. Si quelque chose cloche, pouce en bas : l'assistant garde le kite." },
      ] },
      { type: "h", text: "Poser" },
      { type: "steps", items: [
        { titre: "Demander", texte: "Tape le haut de ta tête avec la main : « pose-moi le kite ». Attends que ton assistant lève le pouce." },
        { titre: "Descendre au bord de fenêtre", texte: "Amène le kite doucement à 9 h ou 3 h, vers l'assistant, à hauteur d'homme. Il attrape le bord d'attaque, le retourne et le pose ailes au sol." },
        { titre: "Sécuriser", texte: "Lâche la barre dès qu'il tient le kite, et mets du sable ou la planche sur le bord d'attaque. Un kite posé non lesté peut redécoller seul." },
      ] },
      { type: "list", items: ["L'assistant tient toujours le kite par le bord d'attaque, jamais par une ligne.", "Personne ne lance ou ne pose dans la zone de puissance.", "Tu ne demandes pas d'aide à un passant qui n'a jamais tenu un kite : explique-lui, ou pose seul au bord de l'eau."] },
      { type: "warning", text: "Lignes emmêlées ou croisées au moment du lancement : pouce en bas, on dépose, on démêle. Un kite lancé avec des lignes inversées part en boucle immédiatement." },
      { type: "quiz", items: [
        { q: "Signal pour demander à poser ?", a: "Tape sur ta tête avec la main. L'autre répond pouce levé quand il est prêt." },
        { q: "Où l'assistant se place-t-il ?", a: "Au bord de la fenêtre, à 9 h ou 3 h du rider, kite tenu par le bord d'attaque." },
      ] },
    ],
    retenir: ["Pouce levé : lance / tape sur la tête : pose-moi / pouce en bas : attends", "Toujours au bord de fenêtre, par le bord d'attaque", "Lignes vérifiées avant le pouce", "Kite posé = kite lesté"],
  },
  {
    slug: "vagues-et-courants",
    category: "securite",
    sports: ["surf", "kitesurf", "wingfoil"],
    title: "Vagues et courants : lire la plage",
    level: "Débutant",
    minutes: 7,
    intro: "Sur une plage à vagues, l'eau qui arrive doit repartir. Elle le fait par des couloirs invisibles, les courants de baïne, qui emportent chaque année des nageurs et des riders. Savoir les repérer, c'est savoir où ne pas être.",
    schema: "baine",
    blocks: [
      { type: "schema", id: "baine", caption: "Les vagues cassent sur les bancs de sable. Entre deux bancs, un chenal d'eau plus sombre et plus calme : c'est là que l'eau ressort, parfois à 2 m/s." },
      { type: "h", text: "Reconnaître une baïne" },
      { type: "list", items: ["Une bande d'eau plate, sans vagues, entre deux zones où ça déferle.", "Une couleur plus sombre (plus profond) ou plus trouble (sable en suspension).", "De l'écume ou des débris qui partent vers le large.", "À marée descendante, le courant s'accélère : c'est l'heure la plus dangereuse."] },
      { type: "h", text: "Si tu es pris dedans" },
      { type: "steps", items: [
        { titre: "Ne lutte pas", texte: "Le courant va plus vite que toi. Nager contre, c'est s'épuiser sur place. Il ne t'entraîne pas vers le fond, seulement vers le large : il s'arrête derrière les vagues." },
        { titre: "Nage en travers", texte: "Parallèlement à la plage, vers la zone où les vagues cassent. Quelques dizaines de mètres suffisent pour sortir du couloir." },
        { titre: "Laisse-toi ramener", texte: "Dans la zone de vagues, l'eau pousse vers la plage. Nage ou laisse-toi porter, puis rentre en biais." },
        { titre: "Fais signe", texte: "Un bras levé, agité lentement : les sauveteurs et les autres riders comprennent. Garde ta planche : elle flotte." },
      ] },
      { type: "h", text: "En kite ou en wing" },
      { type: "p", text: "Avec une aile, la baïne est moins un piège qu'un courant à anticiper : si tu tombes dans le chenal, ton point de rentrée se décale vers le large pendant que tu remets ta planche. Fais ton water start vite, et ne traîne jamais dans l'eau dans la zone de shore break, où les vagues cassent sur le sable : c'est là que le matériel casse, et les corps aussi." },
      { type: "h", text: "Les vagues elles-mêmes" },
      { type: "list", items: ["Les séries : plusieurs grosses vagues, puis une accalmie. Observe cinq minutes avant d'entrer pour choisir ton moment.", "Shore break (la vague qui casse directement sur le sable) : on ne s'y tient pas debout, on ne s'y assoit pas face au large.", "Surf : canard ou passage par-dessus, jamais la planche lâchée devant une vague avec quelqu'un derrière toi."] },
      { type: "warning", text: "Plage non surveillée + courant + personne pour te voir = tu n'y vas pas seul. Les drapeaux rouges ne sont pas une suggestion." },
      { type: "quiz", items: [
        { q: "Une bande d'eau calme et sombre entre deux zones de vagues ?", a: "Une baïne. L'eau y ressort vers le large : on n'y entre pas, on n'y traîne pas." },
        { q: "Tu es emporté vers le large. Tu nages vers la plage ?", a: "Non : en travers, vers les vagues. Puis les vagues te ramènent." },
        { q: "Marée montante ou descendante, laquelle est la plus dangereuse pour les baïnes ?", a: "Descendante : l'eau se vide et le courant s'accélère." },
      ] },
    ],
    retenir: ["Eau plate et sombre entre les vagues = courant vers le large", "On en sort en nageant en travers, jamais contre", "Marée descendante = courant plus fort", "Garder sa planche, lever un bras"],
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
