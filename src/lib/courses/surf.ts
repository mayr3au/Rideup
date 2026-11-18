import type { Course } from "@/lib/course-types";
import type { Editorial } from "@/lib/lessons";

const ed = (aValider?: string): Editorial => ({
  revise: "2026-11-18",
  relecteur: "Équipe pédagogique RIDE'UP (révision après audit)",
  sources: ["Surfing England, règles de priorité et de comportement", "RNLI, courants sortants"],
  aValider,
});

/**
 * Cours « figure par figure » — SURF.
 * Un cours par figure de la roadmap surf (sports.ts), dans l'ordre de progression.
 * Schémas : surf-pic (anatomie de la vague), surf-canard (passer la barre),
 * surf-trajectoire (bottom turn → top turn → cutback), baine (courants).
 */
export const COURSES_SURF: Course[] = [
  /* ───────────────────────── Débutant ───────────────────────── */
  {
    slug: "surf-ramer-et-se-placer",
    trickId: "surf-rame",
    title: "Ramer et se placer",
    level: "Débutant",
    minutes: 7,
    intro: "Un surfeur passe l'essentiel de sa session à ramer. Une rame efficace et un bon placement te donnent des vagues ; le reste suit.",
    conditions: "Mousse ou petites vagues de 30 à 60 cm, beach break de sable sans courant, marée montante, vent nul ou offshore léger.",
    prerequis: [
      "Nager 50 m en mer sans planche",
      "Connaître les règles de priorité au pic",
      "Planche volumineuse (mousse, mini-malibu) avec leash",
      "Savoir si tu es regular (pied gauche devant) ou goofy",
    ],
    phases: [
      { phase: "approche", cle: "Centré sur la planche, nez juste hors de l'eau" },
      { phase: "appel", cle: "Tourne-toi assez tôt pour être lancé" },
      { phase: "vol", cle: "Rame longue, bras tendus, planche à plat" },
      { phase: "reception", cle: "Glisse couché, mains sur les rails" },
    ],
    schema: "surf-pic",
    etapes: [
      {
        titre: "Trouver ta position",
        texte: "Allonge-toi au centre de la planche et règle l'assiette du nez : il doit juste affleurer, sans plonger ni pointer vers le ciel. Trop en avant, le nez plonge ; trop en arrière, la planche se cabre et freine. Le bon point dépend de la planche : avance ou recule jusqu'à ce qu'elle glisse le plus vite pour le même effort. Poitrine légèrement relevée, regard loin devant.",
      },
      {
        titre: "La rame",
        texte: "Bras tendu devant toi, main en cuillère, doigts serrés. Tire l'eau le long du rail jusqu'à la hanche, puis l'autre bras. Des coups longs et réguliers, pas des petits battements. La planche ne doit pas rouler d'un côté à l'autre.",
      },
      {
        titre: "Lire le spot avant d'entrer",
        texte: "Observe 10 minutes depuis la plage. Repère où les vagues cassent, combien il y a de vagues par série et le temps entre deux séries. Choisis deux repères fixes sur la plage pour retrouver ta position dans l'eau.",
      },
      {
        titre: "Se placer et garder sa place",
        texte: "Rame jusqu'à la zone où la vague commence à se lever, pas là où elle a déjà cassé. Entre les séries, vérifie tes repères : le courant et le vent te font dériver, rame pour revenir. Regarde aussi le trafic : qui est au pic, qui rame vers où, et place-toi sans gêner ceux qui sont déjà en position.",
      },
      {
        titre: "Le timing de la rame",
        texte: "Tourne-toi vers la plage et commence à ramer assez tôt pour que la vague te rattrape alors que tu as déjà de la vitesse. La bonne distance dépend de la taille et de la vitesse de la vague, et de ta planche : une grosse planche part plus tôt. Première glisse couché, mains sur les rails, poitrine relevée.",
      },
    ],
    erreurs: [
      { erreur: "Le nez plonge à chaque mousse", correction: "Tu es trop en avant. Recule un peu et relève la poitrine jusqu'à voir le nez affleurer." },
      { erreur: "Tu rames fort mais tu n'avances pas", correction: "Coups trop courts et planche qui tangue. Allonge chaque coup du bout des doigts jusqu'à la hanche, bras tendu, et garde la planche à plat." },
      { erreur: "La vague te rattrape à l'arrêt", correction: "Tu te tournes trop tard. Retourne-toi plus tôt : tu dois déjà avoir de la vitesse quand elle arrive." },
    ],
    exercices: [
      "À sec : 3 séries d'une minute de rame allongé sur la planche, en comptant les coups et sans que le nez touche le sol",
      "À l'eau : 10 allers-retours entre deux repères, planche à plat ; moins de coups pour la même distance = rame plus efficace",
      "Prendre 10 mousses couché, en étant déjà lancé quand elle arrive",
    ],
    filmer: "Depuis la plage, de côté, zoom sur toi, 20 secondes : on doit voir ta position sur la planche, la régularité de la rame et le moment où tu te tournes face à la plage.",
    securite: "Leash attaché au pied arrière. Ne mets jamais la planche entre toi et la vague : tiens-la par le nez, sur le côté. Regarde les drapeaux et demande où sont les courants.",
    retenir: ["Assiette : nez qui affleure", "Coups de rame longs, planche à plat", "Repères sur la plage contre la dérive", "Être lancé quand la vague arrive"],
    quiz: [
      { q: "Comment régler l'assiette du nez quand tu rames ?", a: "Le nez affleure : ni enfoncé, ni pointé vers le ciel. Avance ou recule jusqu'à glisser le plus vite pour le même effort." },
      { q: "Quand te tourner vers la plage pour prendre une vague ?", a: "Assez tôt pour avoir déjà de la vitesse quand elle arrive ; la distance dépend de la vague et de ta planche." },
      { q: "Pourquoi garder des repères sur la plage ?", a: "Le courant et le vent te font dériver : les repères te disent quand ramer pour revenir à ta position." },
      { q: "Où tenir ta planche quand une mousse arrive et que tu marches ?", a: "Par le nez, sur le côté. Jamais entre toi et la vague." },
    ],
    editorial: ed(),
  },

  {
    slug: "surf-take-off-mousse",
    trickId: "surf-mousse",
    title: "Take-off dans la mousse",
    level: "Débutant",
    minutes: 7,
    intro: "Dans la mousse, la vague est déjà cassée : elle te pousse sans que tu aies à gérer le timing. Tu n'as qu'une chose à travailler, le lever en un seul mouvement.",
    conditions: "Mousse de 30 à 60 cm, beach break de sable, eau à hauteur de taille, peu de courant, marée montante.",
    prerequis: [
      "Glisser 20 m couché dans la mousse sans tomber",
      "Ramer droit et régulier",
      "Savoir quel pied va devant",
      "Lever à sec répété sur la plage",
    ],
    phases: [
      { phase: "approche", cle: "Dos à la mousse, déjà lancé quand elle arrive" },
      { phase: "appel", cle: "Mains sous la poitrine, un seul mouvement" },
      { phase: "vol", cle: "Genoux fléchis, regard sur la plage" },
      { phase: "reception", cle: "Descends sur le côté, récupère la planche" },
    ],
    schema: "surf-pic",
    etapes: [
      {
        titre: "Partir de debout dans l'eau",
        texte: "Eau à la taille, dos à la vague, planche à côté de toi tenue par le nez. Allonge-toi un peu avant que la mousse arrive et rame pour être déjà en mouvement. Elle te pousse : tu sens la planche accélérer.",
      },
      {
        titre: "Pousser et pivoter",
        texte: "Mains à plat sur la planche, sous la poitrine, pas sur les rails. Pousse sur les bras et, dans le même mouvement, amène le pied arrière sur l'arrière de la planche puis glisse le pied avant entre tes mains. Pousser, pivoter, poser : un seul geste.",
      },
      {
        titre: "La position de base",
        texte: "Pieds en travers de la planche, sur l'axe central, écartés d'environ la largeur des épaules. Repères de stabilité : sur une mousse ou un longboard, les pieds sont plutôt vers le centre ; sur une planche plus courte, le pied arrière recule vers les ailerons. Si le nez plonge, tu es trop en avant ; si la planche cabre et freine, trop en arrière. Genoux fléchis, buste droit, bras devant toi, regard sur la plage.",
      },
      {
        titre: "Tenir la glisse",
        texte: "Compte 5 secondes debout sans bouger. Si la planche ralentit, mets un peu plus de poids sur le pied avant. Si elle cabre, c'est que tu es trop en arrière.",
      },
      {
        titre: "Sortir",
        texte: "Avant d'arriver au bord, descends sur le côté de la planche, pas devant. Récupère-la par le nez et repars.",
      },
    ],
    erreurs: [
      { erreur: "Tu passes par les genoux avant de te lever", correction: "Le lever en deux temps te fait tomber. Répète le geste à sec jusqu'à ce que le pied arrière arrive directement sur la planche, sans poser le genou." },
      { erreur: "Tu regardes tes pieds", correction: "Le regard bas fait basculer le buste et tu tombes devant. Fixe un repère sur la plage (parasol, poste de secours) avant même de pousser." },
      { erreur: "Les pieds sont dans l'axe de la planche", correction: "Pieds en ligne = aucun équilibre latéral. Tourne les pieds en travers, écart des épaules, sur l'axe central." },
    ],
    exercices: [
      "À sec : 20 levers sur une ligne tracée dans le sable, pieds posés en travers à chaque fois, en moins d'une seconde",
      "À l'eau : 10 mousses, tenir debout 5 secondes sur au moins 6",
      "10 mousses d'affilée en gardant le regard sur le même repère de la plage jusqu'au bord",
    ],
    filmer: "Depuis la plage avec le zoom, ou dans l'eau à hauteur de taille, de côté, 20 secondes : on doit voir le lever complet et la position des pieds une fois debout.",
    securite: "Reste dans la zone débutant. Avant de partir, regarde devant toi : personne ne doit être dans ta trajectoire. Quand une mousse arrive et que tu es debout dans l'eau, planche sur le côté, jamais devant toi.",
    retenir: ["Mains sous la poitrine, pas sur les rails", "Un seul mouvement, pas de genou", "Pieds en travers, placés selon ta planche", "Regard sur la plage"],
    quiz: [
      { q: "Où poser les mains pour se lever ?", a: "À plat sur la planche, sous la poitrine. Pas sur les rails." },
      { q: "Quel pied arrive en premier sur la planche ?", a: "Le pied arrière, directement sur l'arrière de la planche, sans poser le genou." },
      { q: "Le nez plonge dès que tu es debout. Que corriges-tu ?", a: "Tu es trop en avant : recule les pieds. Le bon placement dépend de ta planche." },
      { q: "Pourquoi ne pas regarder ses pieds ?", a: "Le regard bas fait basculer le buste vers l'avant et tu tombes devant la planche." },
    ],
    editorial: ed(),
  },

  {
    slug: "surf-take-off",
    trickId: "surf-takeoff",
    title: "Le take-off en vague verte",
    level: "Débutant",
    minutes: 8,
    intro: "Réussir son take-off, c'est surtout partir assez tôt avec assez de vitesse. Le lever ne fait que finir le travail.",
    conditions: "Vagues de 40 à 80 cm qui déroulent lentement, beach break ou pointe douce, vent offshore léger, mi-marée.",
    prerequis: [
      "Se lever sans difficulté dans la mousse",
      "Ramer droit et longtemps",
      "Savoir passer la barre sur un petit spot",
      "Repérer où la vague commence à se lever",
    ],
    phases: [
      { phase: "approche", cle: "Juste à l'intérieur du pic, déjà en mouvement" },
      { phase: "appel", cle: "Deux coups de plus quand la vague te soulève" },
      { phase: "vol", cle: "Lève-toi dès que la planche glisse seule" },
      { phase: "reception", cle: "Regard et planche vers l'épaule" },
    ],
    schema: "surf-pic",
    etapes: [
      {
        titre: "Choisir la vague",
        texte: "Repère une vague qui monte sans encore casser. Le pic est l'endroit où elle va casser en premier. Place-toi « un peu à l'intérieur » : pas pile sous le pic où ça casse tout de suite, ni loin sur l'épaule où la vague est encore trop plate, mais à un ou deux mètres du pic, du côté où l'épaule va dérouler. Avant de ramer, vérifie que personne n'est déjà engagé sur la vague.",
      },
      {
        titre: "Se placer dans la pente",
        texte: "Tourne-toi vers la plage avant que la vague arrive et rame en légère diagonale, dans la direction de l'épaule. Tu dois être dans la pente, pas sur le plat devant elle.",
      },
      {
        titre: "Ramer fort",
        texte: "Rame franchement, coups longs. Quand tu sens la vague soulever l'arrière de la planche, rajoute 2 ou 3 coups rapides. Elle doit te prendre, pas te passer dessous.",
      },
      {
        titre: "Se lever",
        texte: "Dès que la planche glisse seule, mains sous la poitrine et monte en un seul mouvement. Pieds au centre, en travers, genoux fléchis. Buste droit, pas penché en avant.",
      },
      {
        titre: "Prendre l'angle",
        texte: "Regarde l'épaule de la vague et oriente tout de suite la planche dans sa direction. Le poids sur le pied avant te fait accélérer et sortir de la zone qui casse.",
      },
    ],
    erreurs: [
      { erreur: "La vague passe sous toi", correction: "Tu pars trop tard ou tu rames trop mollement : commence plus tôt et rame jusqu'à sentir la planche glisser seule." },
      { erreur: "Tu piques du nez", correction: "Tu es trop en avant sur la planche ou tu pars trop tard dans la pente. Recule un peu et prends la vague plus tôt, en diagonale." },
      { erreur: "Tu tombes en te levant", correction: "Tu montes en plusieurs temps (genoux). Entraîne le lever en un seul mouvement sur la plage et garde le regard sur l'épaule." },
    ],
    exercices: [
      "À sec : 20 levers sur la plage en un seul mouvement, chronométrés sous la seconde",
      "À l'eau : 5 vagues en ne cherchant qu'à partir en diagonale vers la droite (ou la gauche)",
      "5 vagues en comptant les coups de rame entre « la vague me soulève » et « je glisse » : objectif 2 à 3 coups",
    ],
    filmer: "Depuis la plage, de côté par rapport à ta trajectoire, zoom, 20 secondes : on doit voir la vague se lever, ta rame, le lever et ta sortie en angle.",
    securite: "Respecte la priorité : un surfeur déjà engagé garde la vague ; entre deux surfeurs qui rament, le plus proche du pic l'a. Reste dans ton niveau de vagues, et renseigne-toi sur les courants et les baïnes du spot.",
    retenir: ["Pars tôt, dans la pente", "2 ou 3 coups de plus quand ça soulève", "Un seul mouvement", "Angle immédiat vers l'épaule"],
    quiz: [
      { q: "Où te placer par rapport au pic ?", a: "Un peu à l'intérieur, du côté où l'épaule va dérouler." },
      { q: "À quel moment te lever ?", a: "Dès que la planche glisse seule, sans attendre le bas de la vague." },
      { q: "Un surfeur est déjà debout sur la vague, plus loin du pic que toi. Peux-tu partir ?", a: "Non. Un surfeur déjà engagé sur la vague la garde : on ne lui coupe pas la route (« drop in »)." },
      { q: "Deux surfeurs rament sur la même vague. Qui a la priorité ?", a: "Le plus proche du pic, là où elle casse en premier." },
    ],
    editorial: ed(),
  },

  /* ───────────────────────── Intermédiaire ───────────────────────── */
  {
    slug: "surf-glisser-en-diagonale",
    trickId: "surf-trim",
    title: "Glisser en diagonale",
    level: "Intermédiaire",
    minutes: 8,
    intro: "Le trim, c'est rester dans la partie de la vague qui pousse. Cette zone se déplace : elle avance avec la vague, monte quand la vague se creuse, descend quand elle mollit. C'est la vitesse de base de toutes les manœuvres.",
    conditions: "Vagues de 50 à 80 cm avec une épaule qui déroule lentement, beach break régulier ou pointe, vent offshore léger, mi-marée.",
    prerequis: [
      "Take-off en vague verte stable",
      "Partir en angle dès le take-off",
      "Savoir de quel côté tu surfes en frontside et en backside",
      "Lire où la vague va casser",
    ],
    phases: [
      { phase: "approche", cle: "Rame déjà orientée vers l'épaule" },
      { phase: "appel", cle: "Lève-toi avec l'angle déjà pris" },
      { phase: "vol", cle: "Mi-face comme repère, puis suivre la zone qui pousse" },
      { phase: "reception", cle: "Remonte et passe derrière avant que ça ferme" },
    ],
    schema: "surf-pic",
    etapes: [
      {
        titre: "Regarder loin",
        texte: "Ton regard est posé sur l'épaule, loin devant toi, jamais sur le nez de la planche. Tes épaules et ton bassin s'ouvrent dans la direction de la glisse. La planche va où tu regardes.",
      },
      {
        titre: "Trouver la bonne hauteur",
        texte: "Pour démarrer, vise la mi-face, juste devant la mousse : c'est un bon repère de départ. Mais la zone qui pousse évolue avec la vague : sur une section qui se creuse, elle monte ; sur une section molle, elle descend et s'éloigne. Trop bas sur le plat, la planche s'enfonce et ralentit. Trop haut, la lèvre t'attrape. Ajuste ta hauteur en continu.",
      },
      {
        titre: "Accélérer et freiner",
        texte: "Poids sur le pied avant pour accélérer, genoux fléchis, buste droit. Pour ralentir et laisser la vague revenir, poids sur le pied arrière : le tail freine.",
      },
      {
        titre: "Pomper sur une section molle",
        texte: "Quand la vague ralentit, fais de petits mouvements de compression-extension en montant et descendant sur la face. Chaque descente te redonne de la vitesse.",
      },
      {
        titre: "Frontside et backside",
        texte: "En frontside tu fais face à la vague : facile de la lire. En backside tu lui tournes le dos : tourne la tête par-dessus ton épaule avant pour la voir. En backside, tu passes des talons aux orteils selon ce que tu veux faire : talons pour tenir le rail côté vague et monter, orteils ou planche plus à plat pour descendre et relancer. Il n'y a pas d'appui talons permanent.",
      },
    ],
    erreurs: [
      { erreur: "Tu restes dans la mousse", correction: "Pas assez de vitesse dès le départ. Prends l'angle au take-off et charge le pied avant tout de suite." },
      { erreur: "Tu sors de la vague sur le plat", correction: "Tu es trop bas et trop vite. Remonte vers la zone qui pousse et dose avec le pied arrière." },
      { erreur: "Tu regardes tes pieds", correction: "Le regard bas te ramène dans la mousse. Fixe l'épaule loin devant, avec un repère sur la plage si besoin." },
    ],
    exercices: [
      "À sec : sur une planche posée au sol, enchaîne 10 fois poids avant / poids arrière et sens le tail s'enfoncer",
      "À l'eau : 5 vagues en comptant les secondes de glisse sur l'épaule, objectif plus de 5 secondes",
      "5 vagues avec deux montées-descentes contrôlées sur la face sans perdre la vague",
    ],
    filmer: "Depuis la plage, de côté, cadrage large pour voir la vague entière et ta hauteur sur la face, 20 secondes.",
    securite: "En trim tu avances vite : regarde devant toi, un surfeur peut ramer dans l'épaule. Celui qui est le plus proche du pic a la priorité ; les autres s'écartent.",
    retenir: ["Regard loin devant sur l'épaule", "Mi-face comme repère de départ", "La zone qui pousse se déplace : suis-la", "En backside, appuis qui alternent"],
    quiz: [
      { q: "Où est la vitesse sur la face de la vague ?", a: "Dans la zone qui pousse : la mi-face est un bon repère de départ, mais cette zone monte quand la vague se creuse et descend quand elle mollit." },
      { q: "Comment accélérer sans ramer ?", a: "Poids sur le pied avant, et petites compressions-extensions sur une section molle." },
    ],
    editorial: ed(),
  },

  {
    slug: "surf-passer-la-barre",
    trickId: "surf-canard",
    title: "Passer la barre",
    level: "Intermédiaire",
    minutes: 9,
    intro: "Passer la barre, c'est économiser ton énergie : lire la série, choisir le chenal et passer sous les vagues au bon moment. Le canard avec une petite planche, la tortue avec une grosse.",
    conditions: "Vagues de 50 cm à 1 m, beach break avec un chenal visible, accalmies nettes entre les séries, marée montante.",
    prerequis: [
      "Ramer 10 minutes sans t'arrêter",
      "Compter une série depuis la plage",
      "Take-off en vague verte",
      "Être à l'aise la tête sous l'eau",
    ],
    phases: [
      { phase: "approche", cle: "Lis la série, entre là où c'est conseillé" },
      { phase: "appel", cle: "Vitesse maximale, perpendiculaire à la vague" },
      { phase: "vol", cle: "Canard ou tortue juste avant la mousse" },
      { phase: "reception", cle: "Ressortir, regarder, repartir" },
    ],
    schema: "surf-canard",
    etapes: [
      {
        titre: "Lire avant d'entrer",
        texte: "Depuis la plage, compte les vagues par série et le temps entre deux séries. Repère les zones où ça casse moins. Attention : une zone sans mousse, à l'eau plus sombre, est souvent un courant sortant (baïne). Ne t'y engage pas si tu ne connais pas le spot : demande aux sauveteurs ou aux surfeurs locaux où entrer. Si tu te retrouves pris dans un courant, ne rame pas contre : rame en travers, parallèlement à la plage, pour en sortir sur le côté.",
      },
      {
        titre: "Arriver avec de la vitesse",
        texte: "Rame droit vers la vague, perpendiculaire à elle. Plus tu vas vite, plus la planche passe profond et propre. Ne t'arrête jamais juste devant une mousse.",
      },
      {
        titre: "Le canard (planches courtes)",
        texte: "Juste avant la mousse, mains sur les rails à hauteur de poitrine, bras tendus : enfonce le nez. Dans le même temps, genou ou pied arrière appuie sur le tail pour enfoncer l'arrière. Corps collé à la planche, tête basse. Une fois sous la vague, pousse sur le pied arrière et relève le nez : tu ressors derrière.",
      },
      {
        titre: "La tortue (pour les grosses planches)",
        texte: "Pour une planche trop volumineuse pour être enfoncée (mousse, longboard, mini-malibu). Juste avant la mousse, mains sur les rails, retourne la planche et toi avec : tu es sous la planche, nez face à la vague, bras tendus, en serrant les rails. Laisse la mousse passer, retourne la planche, remonte dessus.",
      },
      {
        titre: "Ressortir",
        texte: "Dès que tu émerges, regarde devant : la vague suivante, et les surfeurs qui glissent ou rament vers toi. Puis rame franchement. Si un surfeur glisse dans ta direction, c'est à toi de t'écarter : rame vers la mousse, derrière lui, pas vers l'épaule où il va passer.",
      },
    ],
    erreurs: [
      { erreur: "Tu canardes trop tôt", correction: "Tu remontes avant que la vague passe et elle t'emporte. Attends qu'elle soit juste devant toi, et enfonce-toi avec de la vitesse." },
      { erreur: "L'arrière de la planche reste en surface", correction: "Le tail accroche la mousse et t'arrache. Appuie fort avec le pied ou le genou arrière sur le tail, le corps collé à la planche." },
      { erreur: "Tu lâches ta planche", correction: "Évite-le : une planche lâchée, tirée par le leash, devient un projectile pour ceux qui sont autour, quelle que soit la distance. Si tu ne peux pas canarder, fais la tortue." },
    ],
    exercices: [
      "En eau plate, entre deux séries : 10 canards d'affilée en allant chercher le fond avec le nez",
      "Un jour à 50 cm : passer la barre en comptant les canards, objectif moins de 5 pour atteindre le line-up",
      "Entrer au line-up en choisissant le moment entre deux séries, avec le moins de canards possible",
    ],
    filmer: "Depuis la plage, de face avec le zoom, 20 secondes sur le moment du canard. Si possible, un pote dans l'eau derrière la vague filme ta sortie.",
    securite: "Ne lâche pas ta planche : avec le leash, elle peut blesser quelqu'un derrière toi, même à distance. Reste hors de la trajectoire des surfeurs qui glissent : c'est à celui qui rame vers le large de s'écarter. N'utilise pas un courant sortant pour sortir si tu ne connais pas le spot. Si un courant t'emporte : garde ta planche, rame en travers, parallèlement à la plage, et fais signe (bras levé) si tu n'y arrives pas.",
    retenir: ["Compte la série avant d'entrer", "Eau sombre sans mousse = souvent un courant", "Canard pour planche courte, tortue pour grosse planche", "En ressortant : regarder, puis s'écarter des surfeurs"],
    quiz: [
      { q: "Quand déclencher le canard ?", a: "Juste avant que la mousse arrive, en arrivant avec de la vitesse." },
      { q: "Une zone sans mousse, à l'eau plus sombre : qu'est-ce que c'est souvent ?", a: "Un courant sortant. On ne s'y engage pas sans connaître le spot ; si on y est pris, on rame en travers." },
      { q: "Un surfeur glisse vers toi pendant que tu rames vers le large. Qui s'écarte ?", a: "Toi : tu passes côté mousse, derrière lui, pas sur l'épaule où il va." },
      { q: "Quand utiliser la tortue plutôt que le canard ?", a: "Avec une planche trop volumineuse pour être enfoncée (mousse, longboard, mini-malibu)." },
    ],
    editorial: ed(),
  },

  {
    slug: "surf-bottom-turn",
    trickId: "surf-bottom",
    title: "Bottom turn",
    level: "Intermédiaire",
    minutes: 9,
    intro: "Le bottom turn transforme la vitesse de la descente en vitesse de remontée. Selon la section, il est profond (tu descends bas pour un virage serré vers une lèvre qui se lève) ou ouvert (plus haut sur la face, plus long, sur une section molle ou pour garder la vitesse).",
    conditions: "Vagues de 60 cm à 1 m avec une face ouverte et une épaule nette, pointe ou beach break régulier, vent offshore léger.",
    prerequis: [
      "Trim stable sur l'épaule",
      "Take-off avec angle",
      "Descendre volontairement jusqu'en bas de la vague",
      "Distinguer appui orteils (frontside) et talons (backside)",
    ],
    phases: [
      { phase: "approche", cle: "Take-off au pic, descente droite" },
      { phase: "appel", cle: "Choisir : courbe profonde ou ouverte" },
      { phase: "vol", cle: "Compresse, rail enfoncé, regard sur la lèvre" },
      { phase: "reception", cle: "Extension vers le haut de la face" },
    ],
    schema: "surf-trajectoire",
    etapes: [
      {
        titre: "Lire la section",
        texte: "Lis la section devant toi. Elle se lève et creuse : descends plus bas pour une courbe profonde et serrée, qui te renvoie vers la lèvre. Elle est molle ou longue : reste plus haut et fais une courbe ouverte, plus longue, qui garde ta vitesse. Dans les deux cas, genoux fléchis, regard déjà posé sur l'endroit où tu veux aller." },
      {
        titre: "Descendre assez bas",
        texte: "Pour une courbe profonde, descends vers le bas de la face, sans aller sur le plat où la vague ne pousse plus. Pour une courbe ouverte, tu peux tourner plus haut.",
      },
      {
        titre: "Compresser",
        texte: "En bas, fléchis fort les genoux. Le buste reste droit et bas : ce sont les hanches qui descendent, pas les épaules qui se penchent. Frontside, le poids va sur les orteils ; backside, sur les talons. Le rail intérieur s'enfonce dans l'eau.",
      },
      {
        titre: "Lancer avec la tête et les épaules",
        texte: "Tourne la tête vers la lèvre, puis les épaules suivent. Le bras avant pointe la direction. En frontside, la main arrière descend vers l'eau. En backside, regarde par-dessus l'épaule avant et ouvre le buste vers le haut de la vague.",
      },
      {
        titre: "Étendre",
        texte: "En sortant du virage, pousse sur les jambes pour te redresser. L'extension projette la planche vers le haut de la face. Tu arrives sur la lèvre avec de la vitesse, prêt pour la manœuvre suivante.",
      },
    ],
    erreurs: [
      { erreur: "Bottom turn sans puissance", correction: "Tu tournes sans compresser. Fléchis vraiment les genoux et enfonce le rail, et choisis une courbe adaptée à la section : profonde si elle se lève, ouverte si elle est molle." },
      { erreur: "Buste penché en avant", correction: "Tu compresses avec le dos au lieu des jambes. Descends les hanches, buste droit, bras avant levé." },
      { erreur: "Les épaules ne lancent pas le virage", correction: "La planche va tout droit. Tourne la tête vers la lèvre en premier, les épaules suivent, puis la planche." },
    ],
    exercices: [
      "À sec ou en surfskate : 20 compressions-extensions avec rotation de la tête puis des épaules, sans bouger les pieds",
      "À l'eau : 5 vagues en alternant une courbe profonde et une courbe ouverte, selon la section",
      "5 vagues : bottom turn puis remonter aux 3/4 de la face et redescendre, sans chercher de top turn",
    ],
    filmer: "Depuis la plage, de côté, zoom, 20 secondes, caméra le plus bas possible : on doit voir la compression en bas de la vague et la trajectoire de remontée.",
    securite: "Après le bottom turn tu remontes vite vers la lèvre : vérifie qu'aucun surfeur ne rame dans ta trajectoire. Priorité au pic, et ne surfe jamais une vague déjà prise.",
    retenir: ["Courbe profonde ou ouverte selon la section", "Compresse avec les hanches, buste droit", "Tête, épaules, puis planche", "Extension vers ta cible"],
    quiz: [
      { q: "Sur quel appui se fait un bottom turn frontside ?", a: "Sur les orteils, rail intérieur enfoncé." },
      { q: "Qu'est-ce qui lance le virage ?", a: "La tête, puis les épaules. La planche suit." },
      { q: "Faut-il toujours descendre tout en bas de la vague ?", a: "Non. Pour une section qui se lève, une courbe profonde ; sur une section molle, une courbe ouverte plus haut sur la face garde mieux la vitesse." },
    ],
    editorial: ed(),
  },

  /* ───────────────────────── Avancé ───────────────────────── */
  {
    slug: "surf-cutback",
    trickId: "surf-cutback",
    title: "Cutback",
    level: "Avancé",
    minutes: 10,
    intro: "Le cutback te ramène vers la zone de puissance quand tu es parti trop loin sur l'épaule. Deux versions : le cutback simple, un virage de retour sur le rail puis tu repars vers l'épaule ; le roundhouse cutback, un virage complet en forme de 8 qui se termine par un rebond sur la mousse.",
    conditions: "Vagues de 80 cm à 1,2 m avec une épaule longue et molle, pointe idéale, vent offshore léger.",
    prerequis: [
      "Bottom turn enchaîné avec une remontée",
      "Trim rapide sur une longue épaule",
      "Carving à 180° en surfskate",
      "Surfer frontside et backside",
    ],
    phases: [
      { phase: "approche", cle: "Trim rapide, loin sur l'épaule" },
      { phase: "appel", cle: "Petit bottom turn pour monter à mi-face" },
      { phase: "vol", cle: "Rail enfoncé, regard vers la mousse" },
      { phase: "reception", cle: "Repars vers l'épaule (rebond si roundhouse)" },
    ],
    schema: "surf-trajectoire",
    variante: "Cutback simple, puis roundhouse cutback",
    etapes: [
      {
        titre: "Repérer le moment",
        texte: "Quand l'épaule devient molle et que tu t'éloignes de la zone qui pousse, c'est le signal. La bonne distance dépend de la vague et de ta vitesse : trop loin, tu perds la vague ; trop près, tu n'as pas la place de tourner.",
      },
      {
        titre: "Monter sur l'épaule",
        texte: "Petit bottom turn pour monter aux deux tiers de la face avec toute ta vitesse. Genoux fléchis, planche à plat une fraction de seconde.",
      },
      {
        titre: "Lancer le virage",
        texte: "Tourne la tête vers la mousse, les épaules suivent, le bras avant mène. Frontside, bascule le poids sur les talons ; backside, sur les orteils. Le rail s'enfonce sur toute sa longueur.",
      },
      {
        titre: "Carver long",
        texte: "Le virage dure. Continue de tourner les épaules jusqu'à faire face à la mousse. Jambes compressées, buste droit, main arrière qui frôle l'eau en frontside. Si tu bloques les épaules, la planche dérape et tu perds toute ta vitesse.",
      },
      {
        titre: "Finir : simple ou roundhouse",
        texte: "Cutback simple : dès que tu es revenu vers la zone qui pousse, tourne la tête vers l'épaule et repars, sans aller jusqu'à la mousse. Roundhouse cutback : continue le virage jusqu'à la mousse, rebondis dessus (le rebond se fait avec le rail et le tail, en compressant) et repars vers l'épaule. Le rebond n'est pas systématique : il appartient au roundhouse.",
      },
    ],
    erreurs: [
      { erreur: "Tu perds toute ta vitesse dans le virage", correction: "Virage trop serré ou tail qui dérape. Allonge la courbe, enfonce le rail sur toute sa longueur et garde les épaules en rotation continue." },
      { erreur: "Tu tombes dans la mousse", correction: "Ton regard reste sur la mousse trop longtemps. Dès que tu y arrives, regarde l'épaule : c'est là que tu veux aller." },
      { erreur: "Tu déclenches trop tard", correction: "La mousse te rattrape avant que tu aies tourné. Lance le cutback dès que l'épaule mollit." },
    ],
    exercices: [
      "En surfskate : 10 carves à 180° enchaînés, tête et épaules en avance sur la planche",
      "À l'eau : 5 vagues avec un trim loin sur l'épaule puis un virage de retour sur le rail, sans chercher le rebond",
      "5 cutbacks simples, puis 5 roundhouse cutbacks avec rebond sur la mousse",
    ],
    filmer: "Depuis la plage, de côté, cadrage large pour voir toute la trajectoire : l'aller sur l'épaule, le virage et le retour sur la mousse, 20 secondes.",
    securite: "En revenant vers la mousse, tu traverses la zone où les surfeurs rament vers l'épaule. Si quelqu'un est dans ta trajectoire, abandonne le virage et passe derrière lui.",
    retenir: ["Déclenche quand l'épaule mollit", "Frontside = talons, backside = orteils", "Cutback simple ≠ roundhouse", "Le rebond appartient au roundhouse"],
    quiz: [
      { q: "Sur quel rail se fait un cutback frontside ?", a: "Sur le rail côté talons : tu tournes le dos à l'épaule pour revenir vers la mousse." },
      { q: "Quand déclencher un cutback ?", a: "Quand l'épaule devient molle et que tu t'éloignes de la zone qui pousse. La distance dépend de la vague." },
      { q: "Le rebond sur la mousse fait-il partie de tout cutback ?", a: "Non : il caractérise le roundhouse cutback. Le cutback simple repart vers l'épaule sans aller jusqu'à la mousse." },
    ],
    editorial: ed(),
  },

  {
    slug: "surf-top-turn",
    trickId: "surf-top",
    title: "Top turn",
    level: "Avancé",
    minutes: 9,
    intro: "Le top turn est le virage en haut de la vague. Deux trajectoires : le virage sous la lèvre, juste en dessous d'elle, qui garde de la vitesse ; et la version plus engagée qui monte jusqu'à la lèvre et la frappe (proche du snap ou du re-entry). Le bottom turn te donne l'angle ; en haut, ce sont les épaules et le tail qui font pivoter la planche.",
    conditions: "Vagues de 80 cm à 1,2 m avec des sections qui se lèvent, pointe ou beach break un peu creux, vent offshore léger.",
    prerequis: [
      "Bottom turn fort avec remontée vers la lèvre",
      "Cutback sur le rail",
      "Pivots sur le tail en surfskate",
      "Monter jusqu'à la lèvre sans tomber derrière",
    ],
    phases: [
      { phase: "approche", cle: "Repère une section qui se lève" },
      { phase: "appel", cle: "Bottom turn serré, trajectoire vers le haut" },
      { phase: "vol", cle: "Regard vers le bas, épaules pivotent, tail pousse" },
      { phase: "reception", cle: "Compresse, redescends, prépare le suivant" },
    ],
    schema: "surf-trajectoire",
    etapes: [
      {
        titre: "Préparer dans le bottom turn",
        texte: "Pendant la descente, repère une section de la lèvre qui se lève devant toi. Ton bottom turn vise ce point. L'angle de remontée dépend de la vague et de la variante : plus ouvert pour tourner sous la lèvre, plus vertical pour monter jusqu'à elle.",
      },
      {
        titre: "Monter",
        texte: "Sur la remontée, étends les jambes et garde le bras avant haut. Ne freine pas : la vitesse de la montée, c'est la puissance du virage.",
      },
      {
        titre: "Pivoter",
        texte: "Sous la lèvre (trajectoire 1) : tourne juste en dessous d'elle, sans la toucher. Jusqu'à la lèvre (trajectoire 2) : monte jusqu'à elle et tourne dedans, plus engagé. Dans les deux cas, tourne la tête vers le bas de la vague, puis les épaules. Poids sur le pied arrière, pousse le tail vers la lèvre : la planche pivote. Frontside, tu passes des orteils aux talons ; backside, des talons aux orteils.",
      },
      {
        titre: "Redescendre",
        texte: "Compresse les jambes pour absorber le changement de direction. Le nez redescend vers le bas de la vague. Regarde déjà l'endroit du prochain bottom turn.",
      },
    ],
    erreurs: [
      { erreur: "Tu tournes à mi-face", correction: "Le virage manque de puissance. Monte dans le haut de la face : sous la lèvre, ou jusqu'à elle selon la variante." },
      { erreur: "Pas de compression / extension", correction: "Jambes raides = planche qui ne pivote pas. Extension sur la montée, compression au pivot, extension en redescendant." },
      { erreur: "La planche part tout droit par-dessus la lèvre", correction: "Les épaules ne tournent pas assez tôt. Tourne la tête vers le bas de la vague avant d'arriver sous la lèvre." },
    ],
    exercices: [
      "En surfskate : 10 pivots sur le tail en haut d'une rampe, regard vers le bas avant le pivot",
      "À l'eau : 5 top turns sous la lèvre, puis 5 en montant jusqu'à elle",
      "5 top turns en comptant à voix haute : monte, pivote, compresse",
    ],
    filmer: "Depuis la plage, de côté, zoom serré sur la lèvre, 20 secondes : on doit voir la hauteur du virage et la rotation des épaules.",
    securite: "Un top turn envoie de la gerbe et de la planche vers le bas de la vague : vérifie que personne ne rame juste dessous. Priorité au pic, et un seul surfeur par vague.",
    retenir: ["Le bottom turn vise la section", "Deux trajectoires : sous la lèvre ou jusqu'à elle", "Tête vers le bas, pied arrière, tail", "Compresse pour redescendre"],
    quiz: [
      { q: "Où se fait un top turn sur la face ?", a: "Dans le haut de la face : juste sous la lèvre, ou dans la lèvre pour la version plus engagée." },
      { q: "Quel appui fait pivoter la planche ?", a: "Le pied arrière, qui pousse le tail vers la lèvre pendant que les épaules tournent vers le bas." },
    ],
    editorial: ed(),
  },

  {
    slug: "surf-floater",
    trickId: "surf-floater",
    title: "Floater",
    level: "Avancé",
    minutes: 9,
    intro: "Le floater, c'est passer par-dessus une section qui ferme en glissant sur la lèvre. Vitesse d'abord, planche à plat sur la mousse, et une réception souple.",
    conditions: "Vagues de 60 cm à 1 m qui ferment par sections, beach break, vent offshore léger, marée montante.",
    prerequis: [
      "Trim rapide",
      "Bottom turn et top turn",
      "Monter sur la lèvre sans hésiter",
      "Savoir tomber à plat, loin de la planche",
    ],
    phases: [
      { phase: "approche", cle: "Repère la section qui va fermer" },
      { phase: "appel", cle: "Bottom turn long, angle faible vers la lèvre" },
      { phase: "vol", cle: "Planche à plat sur la lèvre, poids centré" },
      { phase: "reception", cle: "Compresse, légèrement sur l'arrière" },
    ],
    schema: "surf-trajectoire",
    etapes: [
      {
        titre: "Lire la section",
        texte: "Repère une section qui va fermer devant toi, et vérifie la zone où tu vas redescendre : dégagée (personne, pas de rocher) et assez profonde. Si ce n'est pas le cas, renonce et sors de la vague. Sinon, charge le pied avant et prends de la vitesse en trim.",
      },
      {
        titre: "Bottom turn long",
        texte: "Un bottom turn ouvert, pour monter sur la lèvre avec une vitesse surtout horizontale. Si tu montes à la verticale, tu passes derrière la vague. L'angle exact dépend de la section.",
      },
      {
        titre: "Glisser sur la lèvre",
        texte: "Arrivé sur la mousse, mets la planche à plat : aucun rail enfoncé. Poids centré, genoux fléchis, bras ouverts pour l'équilibre. Regarde la zone d'atterrissage devant toi, pas tes pieds. La mousse te porte.",
      },
      {
        titre: "Redescendre",
        texte: "La lèvre tombe et toi avec. Compresse fort les jambes à l'impact, poids un peu sur le pied arrière pour que le nez ne plante pas. Dès que la planche glisse, redresse-toi et repars.",
      },
    ],
    erreurs: [
      { erreur: "Tu restes bloqué dans la mousse", correction: "Pas assez de vitesse en arrivant. Charge le pied avant dès que tu vois la section et garde un bottom turn ouvert." },
      { erreur: "La planche s'arrête sur la lèvre", correction: "Un rail est enfoncé. Sur la mousse, planche à plat, poids réparti sur les deux pieds." },
      { erreur: "Tu tombes en avant à la réception", correction: "Jambes tendues ou trop de poids avant. Compresse à l'impact et atterris légèrement sur l'arrière." },
    ],
    exercices: [
      "À l'eau : 5 vagues en montant sur une petite mousse avec un angle ouvert et en la traversant à plat, sans chercher la hauteur",
      "5 floaters courts sur une section de 2 m avec réception compressée",
      "5 floaters sur une section de 4 m ou plus, en comptant les secondes passées sur la lèvre",
    ],
    filmer: "Depuis la plage, de côté, cadrage large pour voir la section qui ferme, ta montée et la chute de la lèvre, 20 secondes.",
    securite: "Le floater te fait redescendre dans la zone où la vague casse, souvent sur peu d'eau : ne le tente que si la zone de réception est dégagée et assez profonde. Ne tombe jamais tête la première, protège ta tête, écarte-toi de ta planche.",
    retenir: ["Zone de réception dégagée et profonde", "Bottom turn ouvert, pas vertical", "Planche à plat sur la lèvre", "Compresse à la réception"],
    quiz: [
      { q: "Pourquoi un bottom turn ouvert plutôt que vertical ?", a: "Pour arriver sur la lèvre avec une vitesse horizontale et glisser dessus, au lieu de passer derrière la vague." },
      { q: "Quel rail enfoncer sur la lèvre ?", a: "Aucun : planche à plat, poids centré." },
      { q: "Que vérifies-tu avant de monter sur la section ?", a: "Que la zone de réception est dégagée et assez profonde. Sinon, je renonce." },
    ],
    editorial: ed(),
  },

  /* ───────────────────────── Expert ───────────────────────── */
  {
    slug: "surf-tube",
    trickId: "surf-tube",
    title: "Tube",
    level: "Expert",
    minutes: 11,
    intro: "Le tube, c'est rester sous la lèvre qui déferle, dans la partie creuse de la vague. Tout se joue dans la lecture, la ligne haute et le contrôle de la vitesse.",
    conditions: "Pour apprendre : petites vagues qui creusent sur un fond de sable, avec assez d'eau, vent offshore léger qui tient la lèvre. Les récifs et les marées basses où la vague casse sur peu d'eau ne sont pas des terrains d'apprentissage.",
    prerequis: [
      "Take-off tardif maîtrisé, sous la lèvre",
      "Freiner et accélérer à volonté en trim",
      "Bottom turn haut et serré",
      "Apnée tranquille et wipeouts en sécurité",
    ],
    phases: [
      { phase: "approche", cle: "Take-off au pic, section qui creuse" },
      { phase: "appel", cle: "Lecture de la section, reste haut sur la face" },
      { phase: "vol", cle: "Groupé, ligne haute, main dans la paroi" },
      { phase: "reception", cle: "Regard sur la sortie, accélère pied avant" },
    ],
    schema: "surf-trajectoire",
    etapes: [
      {
        titre: "Choisir la vague",
        texte: "Il te faut une vague qui creuse et dont la lèvre se jette en avant, avec une section qui reste ouverte assez longtemps pour en sortir. Lis la vague avant de partir : où elle va creuser, et si elle a une sortie ou si elle ferme d'un bloc. Une vague qui ferme sans sortie, tu la laisses passer.",
      },
      {
        titre: "Prendre la ligne haute",
        texte: "Pas de bottom turn complet. Reste dans le tiers supérieur de la face, trajectoire tendue vers la sortie. En frontside tu fais face à la paroi ; en backside, main arrière sur le rail extérieur, genoux ouverts (pig-dog).",
      },
      {
        titre: "Se grouper",
        texte: "Fléchis fort les genoux, buste droit, bras avant tendu vers la sortie. En frontside, la main arrière traîne dans la paroi : elle te stabilise et te freine. Regarde la sortie, jamais la lèvre.",
      },
      {
        titre: "Gérer la vitesse",
        texte: "Si la lèvre te dépasse, accélère : poids sur le pied avant, main arrière hors de l'eau. Si tu sors trop vite ou que la lèvre tarde, freine : main arrière dans la paroi, poids sur le pied arrière.",
      },
      {
        titre: "Sortir",
        texte: "Garde le regard sur la sortie. Quand l'ouverture s'élargit, pousse sur le pied avant et redresse légèrement vers l'épaule. Si elle se referme devant toi, renonce : sors de la vague par l'arrière si tu peux, ou prépare ta chute (voir sécurité)." },
      {
        titre: "Critères de renoncement",
        texte: "Ne pars pas, ou sors de la vague, si : elle ferme d'un bloc sans sortie visible ; la vague casse sur très peu d'eau ; quelqu'un est dans ta trajectoire ; tu ne vois plus la sortie. Renoncer fait partie de l'apprentissage du tube.",
      },
    ],
    erreurs: [
      { erreur: "Tu descends trop bas après le take-off", correction: "Le bottom turn t'éloigne de la lèvre et elle ferme devant toi. Prends l'angle dès le lever et reste dans le tiers supérieur." },
      { erreur: "Tu regardes la lèvre", correction: "Tu vas où tu regardes : vers la mousse. Fixe la sortie, la tache de lumière au bout du tube." },
      { erreur: "Tu sors trop vite ou trop tard", correction: "Mauvais dosage de vitesse. Freine avec la main arrière dans la paroi, accélère avec le pied avant. Travaille les deux séparément en trim." },
    ],
    exercices: [
      "À l'eau, hors tube : 10 vagues en trim groupé, main arrière dans la face, en freinant puis en accélérant sur commande",
      "10 vagues en prenant une ligne haute dès le take-off, sans chercher le tube",
      "Sur des petites sections creuses, sur sable profond : 5 passages sous la lèvre en gardant le regard sur la sortie",
    ],
    filmer: "Depuis la plage, de côté avec le zoom, 20 secondes dès le take-off : on doit voir ta hauteur sur la face, ta position groupée et le moment de la sortie.",
    securite: "Les vagues creuses cassent sur peu d'eau : apprends sur du sable avec de la profondeur, pas sur un récif ni à marée basse. En chute, tombe à plat ou les pieds en avant, jamais tête la première, et protège la tête avec les bras. Sous l'eau, reste détendu pour économiser ton air, laisse passer la turbulence, puis remonte en gardant les bras au-dessus de la tête. Prépare-toi à une deuxième vague en remontant.",
    retenir: ["Lecture de la section : y a-t-il une sortie ?", "Ligne haute, groupé, regard sur la sortie", "Main arrière = frein, pied avant = accélérateur", "Renoncer si ça ferme"],
    quiz: [
      { q: "Pourquoi ne pas faire de bottom turn complet avant un tube ?", a: "Il t'éloigne de la lèvre : tu descends sous la section creuse et elle ferme devant toi." },
      { q: "Comment freiner dans le tube ?", a: "Main arrière dans la paroi et poids sur le pied arrière." },
      { q: "Où poser le regard ?", a: "Sur la sortie, jamais sur la lèvre." },
      { q: "La section ferme devant toi sans sortie. Que fais-tu ?", a: "Je renonce : je sors par l'arrière si possible, sinon je prépare ma chute à plat, tête protégée." },
    ],
    editorial: ed("Lecture de section et critères de renoncement à relire par le coach surf."),
  },

  {
    slug: "surf-aerial",
    trickId: "surf-aerial",
    title: "Aerial",
    level: "Expert",
    minutes: 12,
    intro: "Un aerial, c'est décoller de la lèvre comme d'une rampe. Variante enseignée ici : air frontside droit avec grab de la main avant sur le rail côté orteils. Beaucoup de vitesse, une section qui ferme, et une planche gardée sous les pieds jusqu'à la réception.",
    conditions: "Vagues de 60 cm à 1,2 m avec des sections qui ferment net, beach break avec de la profondeur. Un petit vent onshore ou side-shore peut aider à garder la planche sous les pieds, mais ce n'est pas garanti : il peut aussi la déstabiliser.",
    prerequis: [
      "Top turn vertical, tail qui sort de l'eau",
      "Floater sur une longue section",
      "Ollie et grab en skate ou surfskate",
      "Réception compressée sans planter le nez",
    ],
    phases: [
      { phase: "approche", cle: "Beaucoup de vitesse, vise une section qui ferme" },
      { phase: "appel", cle: "Bottom turn orienté vers la réception, extension sur la lèvre" },
      { phase: "vol", cle: "Genoux remontés, planche parallèle à l'eau" },
      { phase: "reception", cle: "Centré, genoux fléchis, sur la mousse" },
    ],
    schema: "surf-trajectoire",
    variante: "Air frontside droit avec grab main avant (rail côté orteils)",
    etapes: [
      {
        titre: "Construire la rampe",
        texte: "Repère une section qui va fermer devant toi, avec une lèvre qui se lève. Pompe en trim, pied avant chargé : il te faut plus de vitesse que pour un top turn.",
      },
      {
        titre: "Bottom turn orienté",
        texte: "Ni plat, ni vertical. L'angle dépend de la section et de ta vitesse : il doit te faire monter vers la lèvre avec une trajectoire déjà orientée vers la zone de réception. Trop vertical, tu montes et retombes derrière ; trop plat, tu ne décolles pas.",
      },
      {
        titre: "Décoller",
        texte: "En haut de la lèvre, au moment où elle pousse, étends les jambes. La main avant attrape le rail côté orteils pour garder la planche. Regarde déjà la zone de réception : le creux devant la mousse.",
      },
      {
        titre: "En l'air",
        texte: "Ramène les genoux vers la poitrine, planche parallèle à l'eau, buste compact. Ne te redresse pas : plus tu es groupé, plus la planche reste sous toi.",
      },
      {
        titre: "Réception",
        texte: "Vise la mousse ou le haut de l'épaule, pas le plat. Nez légèrement vers le bas, poids centré voire un peu sur l'arrière, genoux qui absorbent. Lâche le grab juste avant l'impact.",
      },
    ],
    erreurs: [
      { erreur: "Tu décolles à la verticale", correction: "Bottom turn trop vertical. Ouvre l'angle pour que la trajectoire te fasse avancer en l'air au lieu de monter tout droit et retomber derrière." },
      { erreur: "La planche se décroche en l'air", correction: "Jambes tendues et buste ouvert. Genoux vers la poitrine, et le grab avec la main avant pour la garder sous toi." },
      { erreur: "Tu plantes le nez à la réception", correction: "Tu atterris sur le plat ou trop en avant. Vise la mousse, centre le poids et fléchis les genoux." },
    ],
    exercices: [
      "En surfskate : 20 ollies groupés avec grab, réception genoux fléchis",
      "À l'eau : 10 top turns en faisant sortir le tail hors de la lèvre",
      "5 aerials avec grab sur une section de 1 m, en visant la mousse à la réception",
    ],
    filmer: "Depuis la plage, de côté, zoom serré sur la lèvre, 20 secondes : on doit voir l'angle du bottom turn, la hauteur et la position de la planche en l'air, et la réception.",
    securite: "Les ailerons sont tranchants : en cas de chute, écarte-toi de la planche et tombe à plat. Vérifie la profondeur. Pas d'aerial fatigué, les genoux et les chevilles encaissent la réception.",
    retenir: ["Plus de vitesse qu'un top turn", "Bottom turn orienté vers la réception", "Genoux remontés, grab main avant", "Réception sur la mousse, centrée"],
    quiz: [
      { q: "Quel angle pour le bottom turn avant un aerial ?", a: "Il n'y a pas d'angle unique : assez pour monter vers la lèvre, pas au point de décoller à la verticale. Il dépend de la section et de ta vitesse." },
      { q: "Où atterrir ?", a: "Sur la mousse ou le haut de l'épaule, jamais sur le plat." },
      { q: "Un vent onshore aide-t-il toujours ?", a: "Non. Un petit vent de face peut aider à garder la planche sous les pieds, mais il peut aussi la déstabiliser : ce n'est pas garanti." },
    ],
    editorial: ed("Appel et réception à valider sur vidéo par le coach surf."),
  },
];
