import type { Course } from "@/lib/course-types";

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
    intro: "Un surfeur passe 80 % de sa session à ramer. Une rame efficace et un bon placement te donnent des vagues ; le reste suit.",
    conditions: "Mousse ou petites vagues de 30 à 60 cm, beach break de sable sans courant, marée montante, vent nul ou offshore léger.",
    prerequis: [
      "Nager 50 m en mer sans planche",
      "Connaître les règles de priorité au pic",
      "Planche volumineuse (mousse, mini-malibu) avec leash",
      "Savoir si tu es regular (pied gauche devant) ou goofy",
    ],
    phases: [
      { phase: "approche", cle: "Centré sur la planche, nez à 3 cm de l'eau" },
      { phase: "appel", cle: "Tourne-toi quand la vague est à 10 m" },
      { phase: "vol", cle: "Rame longue, bras tendus, planche à plat" },
      { phase: "reception", cle: "Glisse couché, mains sur les rails" },
    ],
    schema: "surf-pic",
    etapes: [
      {
        titre: "Trouver ta position",
        texte: "Allonge-toi au centre de la planche, le nez 2 à 3 cm au-dessus de l'eau. Trop en avant, le nez plonge ; trop en arrière, la planche freine. Poitrine légèrement relevée, regard loin devant.",
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
        texte: "Rame jusqu'à la zone où la vague commence à se lever, pas là où elle a déjà cassé. Entre les séries, vérifie tes repères et rame pour corriger : le courant te déplace toujours.",
      },
      {
        titre: "Le timing de la rame",
        texte: "Quand la vague est à 10 ou 15 m, tourne-toi vers la plage et commence à ramer. Elle doit te rattraper alors que tu as déjà de la vitesse. Première glisse couché, mains sur les rails, poitrine relevée.",
      },
    ],
    erreurs: [
      { erreur: "Le nez plonge à chaque mousse", correction: "Tu es trop en avant. Recule de 5 cm et relève la poitrine jusqu'à voir le nez sortir de l'eau." },
      { erreur: "Tu rames fort mais tu n'avances pas", correction: "Coups trop courts et planche qui tangue. Allonge chaque coup du bout des doigts jusqu'à la hanche, bras tendu, et garde la planche à plat." },
      { erreur: "La vague te rattrape à l'arrêt", correction: "Tu te tournes trop tard. Retourne-toi quand elle est à 10 m : tu dois avoir donné 5 ou 6 coups de rame quand elle arrive." },
    ],
    exercices: [
      "À sec : 3 séries d'une minute de rame allongé sur la planche, en comptant les coups et sans que le nez touche le sol",
      "À l'eau : 10 allers-retours de 30 m, planche à plat ; moins de coups pour la même distance = rame plus efficace",
      "Prendre 10 mousses couché, en commençant à ramer 5 coups avant qu'elle arrive",
    ],
    filmer: "Depuis la plage, de côté, zoom sur toi, 20 secondes : on doit voir ta position sur la planche, la régularité de la rame et le moment où tu te tournes face à la plage.",
    securite: "Leash attaché au pied arrière. Ne mets jamais la planche entre toi et la vague : tiens-la par le nez, sur le côté. Regarde les drapeaux et demande où sont les courants.",
    retenir: ["Nez à 3 cm de l'eau", "Coups de rame longs, planche à plat", "Deux repères sur la plage", "Tourne-toi à 10 m, pas à 3 m"],
    quiz: [
      { q: "À quelle hauteur doit être le nez de la planche quand tu rames ?", a: "2 à 3 cm au-dessus de l'eau : ni enfoncé, ni relevé." },
      { q: "Quand te tourner vers la plage pour prendre une vague ?", a: "Quand elle est à 10-15 m, pour avoir déjà de la vitesse quand elle arrive." },
      { q: "Où tenir ta planche quand une mousse arrive et que tu marches ?", a: "Par le nez, sur le côté. Jamais entre toi et la vague." },
    ],
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
      { phase: "approche", cle: "Dos à la mousse, 5 coups avant qu'elle arrive" },
      { phase: "appel", cle: "Mains sous la poitrine, un seul mouvement" },
      { phase: "vol", cle: "Genoux fléchis, regard sur la plage" },
      { phase: "reception", cle: "Descends sur le côté, récupère la planche" },
    ],
    schema: "surf-pic",
    etapes: [
      {
        titre: "Partir de debout dans l'eau",
        texte: "Eau à la taille, dos à la vague, planche à côté de toi tenue par le nez. Quand la mousse est à 3 m, allonge-toi et donne 4 ou 5 coups de rame. Elle te pousse : tu sens la planche accélérer.",
      },
      {
        titre: "Pousser et pivoter",
        texte: "Mains à plat sur la planche, sous la poitrine, pas sur les rails. Pousse sur les bras et, dans le même mouvement, amène le pied arrière au centre arrière de la planche puis glisse le pied avant entre tes mains. Pousser, pivoter, poser : un seul geste.",
      },
      {
        titre: "La position de base",
        texte: "Pieds perpendiculaires à la planche, écartés de la largeur des épaules. Pied avant au centre, pied arrière au-dessus des ailerons. Genoux fléchis, buste droit, bras devant toi, regard sur la plage.",
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
      { erreur: "Les pieds sont dans l'axe de la planche", correction: "Pieds en ligne = aucun équilibre latéral. Tourne les pieds en travers, écart des épaules, pied arrière au-dessus des ailerons." },
    ],
    exercices: [
      "À sec : 20 levers sur une ligne tracée dans le sable, pieds posés en travers à chaque fois, en moins d'une seconde",
      "À l'eau : 10 mousses, tenir debout 5 secondes sur au moins 6",
      "10 mousses d'affilée en gardant le regard sur le même repère de la plage jusqu'au bord",
    ],
    filmer: "Depuis la plage avec le zoom, ou dans l'eau à hauteur de taille, de côté, 20 secondes : on doit voir le lever complet et la position des pieds une fois debout.",
    securite: "Reste dans la zone débutant. Avant de partir, regarde devant toi : personne ne doit être dans ta trajectoire. Quand une mousse arrive et que tu es debout dans l'eau, planche sur le côté, jamais devant toi.",
    retenir: ["Mains sous la poitrine, pas sur les rails", "Un seul mouvement, pas de genou", "Pieds en travers, pied arrière sur les ailerons", "Regard sur la plage"],
    quiz: [
      { q: "Où poser les mains pour se lever ?", a: "À plat sur la planche, sous la poitrine. Pas sur les rails." },
      { q: "Quel pied arrive en premier sur la planche ?", a: "Le pied arrière, directement au centre arrière, sans poser le genou." },
      { q: "Pourquoi ne pas regarder ses pieds ?", a: "Le regard bas fait basculer le buste vers l'avant et tu tombes devant la planche." },
    ],
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
        texte: "Repère une vague qui monte sans encore casser. Le pic est l'endroit où elle va casser en premier ; place-toi un peu à l'intérieur, du côté où l'épaule va dérouler.",
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
    securite: "Respecte la priorité : le surfeur le plus proche du pic a la vague. Reste dans ton niveau de vagues, et renseigne-toi sur les courants et les baïnes du spot.",
    retenir: ["Pars tôt, dans la pente", "2 ou 3 coups de plus quand ça soulève", "Un seul mouvement", "Angle immédiat vers l'épaule"],
    quiz: [
      { q: "Où te placer par rapport au pic ?", a: "Un peu à l'intérieur, du côté où l'épaule va dérouler." },
      { q: "À quel moment te lever ?", a: "Dès que la planche glisse seule, sans attendre le bas de la vague." },
      { q: "Qui a la priorité sur une vague ?", a: "Le surfeur le plus proche du pic, là où elle casse en premier." },
    ],
  },

  /* ───────────────────────── Intermédiaire ───────────────────────── */
  {
    slug: "surf-glisser-en-diagonale",
    trickId: "surf-trim",
    title: "Glisser en diagonale",
    level: "Intermédiaire",
    minutes: 8,
    intro: "Le trim, c'est rester dans la partie de la vague qui pousse, juste devant la mousse, sur l'épaule. C'est la vitesse de base de toutes les manœuvres.",
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
      { phase: "vol", cle: "Mi-hauteur de la face, pied avant" },
      { phase: "reception", cle: "Remonte et passe derrière avant que ça ferme" },
    ],
    schema: "surf-pic",
    etapes: [
      {
        titre: "Regarder loin",
        texte: "Ton regard est posé sur l'épaule, à 10 m devant toi, jamais sur le nez de la planche. Tes épaules et ton bassin s'ouvrent dans la direction de la glisse. La planche va où tu regardes.",
      },
      {
        titre: "Trouver la bonne hauteur",
        texte: "La vitesse est au milieu de la face. Trop bas sur le plat, la planche s'enfonce et ralentit. Trop haut, la lèvre t'attrape. Vise la moitié de la face, juste devant la mousse.",
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
        texte: "En frontside tu fais face à la vague : facile de la lire. En backside tu lui tournes le dos : tourne la tête par-dessus ton épaule avant pour la voir, et garde le poids sur les talons.",
      },
    ],
    erreurs: [
      { erreur: "Tu restes dans la mousse", correction: "Pas assez de vitesse dès le départ. Prends l'angle au take-off et charge le pied avant tout de suite." },
      { erreur: "Tu sors de la vague sur le plat", correction: "Tu es trop bas et trop vite. Remonte à mi-face et dose avec le pied arrière pour rester dans la partie qui pousse." },
      { erreur: "Tu regardes tes pieds", correction: "Le regard bas te ramène dans la mousse. Fixe l'épaule 10 m devant, avec un repère sur la plage si besoin." },
    ],
    exercices: [
      "À sec : sur une planche posée au sol, enchaîne 10 fois poids avant / poids arrière et sens le tail s'enfoncer",
      "À l'eau : 5 vagues en comptant les secondes de glisse sur l'épaule, objectif plus de 5 secondes",
      "5 vagues avec deux montées-descentes contrôlées sur la face sans perdre la vague",
    ],
    filmer: "Depuis la plage, de côté, cadrage large pour voir la vague entière et ta hauteur sur la face, 20 secondes.",
    securite: "En trim tu avances vite : regarde devant toi, un surfeur peut ramer dans l'épaule. Celui qui est le plus proche du pic a la priorité ; les autres s'écartent.",
    retenir: ["Regard 10 m devant sur l'épaule", "Mi-hauteur de la face", "Pied avant = accélère, pied arrière = freine", "En backside, tête par-dessus l'épaule avant"],
    quiz: [
      { q: "Où est la vitesse sur la face de la vague ?", a: "Au milieu de la face, juste devant la mousse. Pas sur le plat." },
      { q: "Comment accélérer sans ramer ?", a: "Poids sur le pied avant, et petites compressions-extensions sur une section molle." },
    ],
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
      { phase: "approche", cle: "Lis la série, rame dans le chenal" },
      { phase: "appel", cle: "Vitesse maximale, perpendiculaire à la vague" },
      { phase: "vol", cle: "Nez sous l'eau à 2 m, pied sur le tail" },
      { phase: "reception", cle: "Trois coups de rame dès que tu ressors" },
    ],
    schema: "surf-canard",
    etapes: [
      {
        titre: "Lire avant d'entrer",
        texte: "Depuis la plage, compte les vagues par série et le temps entre deux séries. Repère le chenal : une zone sans mousse, à l'eau plus sombre, souvent où le courant ressort. Entre et rame dans ce chenal, pas dans les mousses.",
      },
      {
        titre: "Arriver avec de la vitesse",
        texte: "Rame droit vers la vague, perpendiculaire à elle. Plus tu vas vite, plus la planche passe profond et propre. Ne t'arrête jamais juste devant une mousse.",
      },
      {
        titre: "Le canard",
        texte: "À 2 m de la mousse, mains sur les rails à hauteur de poitrine, bras tendus : enfonce le nez. Dans le même temps, genou ou pied arrière appuie sur le tail pour enfoncer l'arrière. Corps collé à la planche, tête basse. Une fois sous la vague, pousse sur le pied arrière et relève le nez : tu ressors derrière.",
      },
      {
        titre: "La tortue (pour les grosses planches)",
        texte: "À 2 m de la mousse, mains sur les rails, retourne la planche vers toi. Tu es sous la planche, nez face à la vague, bras tendus, jambes vers le fond. Laisse la mousse passer, retourne la planche, remonte dessus.",
      },
      {
        titre: "Ressortir",
        texte: "Dès que tu émerges, donne 3 coups de rame avant même de regarder. La vague suivante arrive dans 8 à 12 secondes : chaque mètre gagné compte.",
      },
    ],
    erreurs: [
      { erreur: "Tu canardes trop tôt", correction: "Tu remontes avant que la vague passe et elle t'emporte. Attends qu'elle soit à 2 m, et enfonce-toi avec de la vitesse." },
      { erreur: "L'arrière de la planche reste en surface", correction: "Le tail accroche la mousse et t'arrache. Appuie fort avec le pied ou le genou arrière sur le tail, le corps collé à la planche." },
      { erreur: "Tu lâches ta planche", correction: "Jamais : elle devient un projectile pour ceux derrière toi. Si tu ne peux pas canarder, retourne-la en tortue ou prends la vague en travers de côté." },
    ],
    exercices: [
      "En eau plate, entre deux séries : 10 canards d'affilée en allant chercher le fond avec le nez",
      "Un jour à 50 cm : passer la barre en comptant les canards, objectif moins de 5 pour atteindre le line-up",
      "Entrer au line-up sans un seul canard en utilisant uniquement le chenal",
    ],
    filmer: "Depuis la plage, de face avec le zoom, 20 secondes sur le moment du canard. Si possible, un pote dans l'eau derrière la vague filme ta sortie.",
    securite: "Ne lâche jamais ta planche quand quelqu'un rame derrière toi à moins de 10 m. Reste dans le chenal mais hors de la trajectoire des surfeurs qui glissent. Si le courant t'emporte, rame en travers, pas contre.",
    retenir: ["Compte la série avant d'entrer", "Le chenal, pas les mousses", "Vitesse, puis nez et tail sous l'eau", "3 coups de rame en ressortant"],
    quiz: [
      { q: "À quelle distance de la mousse déclencher le canard ?", a: "À environ 2 m, en arrivant avec de la vitesse." },
      { q: "Comment reconnaître un chenal ?", a: "Zone sans mousse, eau plus sombre, souvent là où le courant ressort." },
      { q: "Quand utiliser la tortue plutôt que le canard ?", a: "Avec une planche trop volumineuse pour être enfoncée (mousse, longboard, mini-malibu)." },
    ],
  },

  {
    slug: "surf-bottom-turn",
    trickId: "surf-bottom",
    title: "Bottom turn",
    level: "Intermédiaire",
    minutes: 9,
    intro: "Le bottom turn transforme la vitesse de la descente en vitesse de remontée. Tous les virages sur la face commencent là : sans lui, pas de top turn, pas de cutback.",
    conditions: "Vagues de 60 cm à 1 m avec une face ouverte et une épaule nette, pointe ou beach break régulier, vent offshore léger.",
    prerequis: [
      "Trim stable sur l'épaule",
      "Take-off avec angle",
      "Descendre volontairement jusqu'en bas de la vague",
      "Distinguer appui orteils (frontside) et talons (backside)",
    ],
    phases: [
      { phase: "approche", cle: "Take-off au pic, descente droite" },
      { phase: "appel", cle: "Vitesse maximale en bas de la vague" },
      { phase: "vol", cle: "Compresse, rail enfoncé, regard sur la lèvre" },
      { phase: "reception", cle: "Extension vers le haut de la face" },
    ],
    schema: "surf-trajectoire",
    etapes: [
      {
        titre: "Descendre pour stocker de la vitesse",
        texte: "Après le take-off, descends vers le bas de la vague en ligne droite ou en légère diagonale. Genoux fléchis, regard déjà posé sur l'endroit de la lèvre où tu veux remonter.",
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
      { erreur: "Bottom turn trop plat ou trop court", correction: "Tu tournes à mi-face sans compresser. Descends jusqu'en bas, fléchis vraiment les genoux et enfonce le rail avant de regarder la lèvre." },
      { erreur: "Buste penché en avant", correction: "Tu compresses avec le dos au lieu des jambes. Descends les hanches, buste droit, bras avant levé." },
      { erreur: "Les épaules ne lancent pas le virage", correction: "La planche va tout droit. Tourne la tête vers la lèvre en premier, les épaules suivent, puis la planche." },
    ],
    exercices: [
      "À sec ou en surfskate : 20 compressions-extensions avec rotation de la tête puis des épaules, sans bouger les pieds",
      "À l'eau : 5 vagues en descendant volontairement jusqu'au plat avant de tourner",
      "5 vagues : bottom turn puis remonter aux 3/4 de la face et redescendre, sans chercher de top turn",
    ],
    filmer: "Depuis la plage, de côté, zoom, 20 secondes, caméra le plus bas possible : on doit voir la compression en bas de la vague et la trajectoire de remontée.",
    securite: "Après le bottom turn tu remontes vite vers la lèvre : vérifie qu'aucun surfeur ne rame dans ta trajectoire. Priorité au pic, et ne surfe jamais une vague déjà prise.",
    retenir: ["Descends jusqu'en bas", "Compresse avec les hanches, buste droit", "Tête, épaules, puis planche", "Extension vers la lèvre"],
    quiz: [
      { q: "Sur quel appui se fait un bottom turn frontside ?", a: "Sur les orteils, rail intérieur enfoncé." },
      { q: "Qu'est-ce qui lance le virage ?", a: "La tête, puis les épaules. La planche suit." },
      { q: "Pourquoi descendre jusqu'en bas de la vague ?", a: "Pour stocker un maximum de vitesse avant de la transformer en remontée." },
    ],
  },

  /* ───────────────────────── Avancé ───────────────────────── */
  {
    slug: "surf-cutback",
    trickId: "surf-cutback",
    title: "Cutback",
    level: "Avancé",
    minutes: 10,
    intro: "Le cutback te ramène vers la mousse quand tu es parti trop loin sur l'épaule. Un long virage sur le rail, presque un demi-tour, puis un rebond sur la mousse pour repartir.",
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
      { phase: "reception", cle: "Rebond sur la mousse, repars vers l'épaule" },
    ],
    schema: "surf-trajectoire",
    etapes: [
      {
        titre: "Repérer le moment",
        texte: "Quand l'épaule devient molle et que tu es 5 à 8 m devant la mousse, c'est le signal. Plus loin, tu perds la vague ; plus près, tu n'as pas la place.",
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
        titre: "Rebondir",
        texte: "Arrivé sur la mousse, frappe-la avec le tail et compresse pour absorber. Puis tourne la tête vers l'épaule : la planche se réoriente et tu repars avec la vitesse de la vague.",
      },
    ],
    erreurs: [
      { erreur: "Tu perds toute ta vitesse dans le virage", correction: "Virage trop serré ou tail qui dérape. Allonge la courbe, enfonce le rail sur toute sa longueur et garde les épaules en rotation continue." },
      { erreur: "Tu tombes dans la mousse", correction: "Ton regard reste sur la mousse trop longtemps. Dès que le tail la touche, regarde l'épaule : c'est là que tu veux aller." },
      { erreur: "Tu déclenches trop tard", correction: "La mousse te rattrape avant que tu aies tourné. Lance le cutback dès que l'épaule mollit, à 5-8 m de la mousse." },
    ],
    exercices: [
      "En surfskate : 10 carves à 180° enchaînés, tête et épaules en avance sur la planche",
      "À l'eau : 5 vagues avec un trim loin sur l'épaule puis un virage de retour sur le rail, sans chercher le rebond",
      "5 cutbacks complets avec rebond sur la mousse et retour sur l'épaule",
    ],
    filmer: "Depuis la plage, de côté, cadrage large pour voir toute la trajectoire : l'aller sur l'épaule, le virage et le retour sur la mousse, 20 secondes.",
    securite: "En revenant vers la mousse, tu traverses la zone où les surfeurs rament vers l'épaule. Si quelqu'un est dans ta trajectoire, abandonne le virage et passe derrière lui.",
    retenir: ["Déclenche quand l'épaule mollit", "Frontside = talons, backside = orteils", "Rotation continue des épaules", "Rebond, puis regard sur l'épaule"],
    quiz: [
      { q: "Sur quel rail se fait un cutback frontside ?", a: "Sur le rail côté talons : tu tournes le dos à l'épaule pour revenir vers la mousse." },
      { q: "Quand déclencher un cutback ?", a: "Quand l'épaule devient molle et que tu es 5 à 8 m devant la mousse." },
    ],
  },

  {
    slug: "surf-top-turn",
    trickId: "surf-top",
    title: "Top turn",
    level: "Avancé",
    minutes: 9,
    intro: "Le top turn est le virage tout en haut de la vague, sous la lèvre. Le bottom turn te donne l'angle ; en haut, ce sont les épaules et le tail qui font pivoter la planche vers le bas.",
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
        texte: "Pendant la descente, repère une section de la lèvre qui se lève à 5 m devant toi. Ton bottom turn vise ce point avec une trajectoire bien remontante, entre 45 et 70°.",
      },
      {
        titre: "Monter",
        texte: "Sur la remontée, étends les jambes et garde le bras avant haut. Ne freine pas : la vitesse de la montée, c'est la puissance du virage.",
      },
      {
        titre: "Pivoter sous la lèvre",
        texte: "Aux trois quarts de la face, tourne la tête vers le bas de la vague, puis les épaules. Poids sur le pied arrière, pousse le tail vers la lèvre : la planche pivote. Frontside, tu passes des orteils aux talons ; backside, des talons aux orteils.",
      },
      {
        titre: "Redescendre",
        texte: "Compresse les jambes pour absorber le changement de direction. Le nez redescend vers le bas de la vague. Regarde déjà l'endroit du prochain bottom turn.",
      },
    ],
    erreurs: [
      { erreur: "Tu tournes à mi-face", correction: "Le virage manque de puissance. Monte jusqu'à la lèvre : le top turn se fait dans le quart supérieur de la vague." },
      { erreur: "Pas de compression / extension", correction: "Jambes raides = planche qui ne pivote pas. Extension sur la montée, compression au pivot, extension en redescendant." },
      { erreur: "La planche part tout droit par-dessus la lèvre", correction: "Les épaules ne tournent pas assez tôt. Tourne la tête vers le bas de la vague avant d'arriver sous la lèvre." },
    ],
    exercices: [
      "En surfskate : 10 pivots sur le tail en haut d'une rampe, regard vers le bas avant le pivot",
      "À l'eau : 5 vagues avec un bottom turn qui remonte jusqu'à toucher la lèvre, sans tourner",
      "5 top turns en comptant à voix haute : monte, pivote, compresse",
    ],
    filmer: "Depuis la plage, de côté, zoom serré sur la lèvre, 20 secondes : on doit voir la hauteur du virage et la rotation des épaules.",
    securite: "Un top turn envoie de la gerbe et de la planche vers le bas de la vague : vérifie que personne ne rame juste dessous. Priorité au pic, et un seul surfeur par vague.",
    retenir: ["Le bottom turn vise la section", "Monte jusqu'à la lèvre", "Tête vers le bas, pied arrière, tail", "Compresse pour redescendre"],
    quiz: [
      { q: "Où se fait un top turn sur la face ?", a: "Dans le quart supérieur, juste sous la lèvre." },
      { q: "Quel appui fait pivoter la planche ?", a: "Le pied arrière, qui pousse le tail vers la lèvre pendant que les épaules tournent vers le bas." },
    ],
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
        texte: "Repère une section qui va fermer 5 à 10 m devant toi. C'est ton signal pour charger le pied avant et prendre un maximum de vitesse en trim.",
      },
      {
        titre: "Bottom turn long",
        texte: "Un bottom turn ouvert, à 30 ou 45°, pour monter sur la lèvre avec une vitesse horizontale. Si tu montes à la verticale, tu passes derrière la vague.",
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
      "À l'eau : 5 vagues en montant sur une mousse à 30° et en la traversant à plat, sans chercher la hauteur",
      "5 floaters courts sur une section de 2 m avec réception compressée",
      "5 floaters sur une section de 4 m ou plus, en comptant les secondes passées sur la lèvre",
    ],
    filmer: "Depuis la plage, de côté, cadrage large pour voir la section qui ferme, ta montée et la chute de la lèvre, 20 secondes.",
    securite: "La réception se fait souvent en eau peu profonde : ne tombe jamais tête la première. Écarte-toi de ta planche en tombant, surtout en beach break.",
    retenir: ["Vitesse avant tout", "Bottom turn ouvert, pas vertical", "Planche à plat sur la lèvre", "Compresse à la réception"],
    quiz: [
      { q: "Pourquoi un bottom turn ouvert plutôt que vertical ?", a: "Pour arriver sur la lèvre avec une vitesse horizontale et glisser dessus, au lieu de passer derrière la vague." },
      { q: "Quel rail enfoncer sur la lèvre ?", a: "Aucun : planche à plat, poids centré." },
    ],
  },

  /* ───────────────────────── Expert ───────────────────────── */
  {
    slug: "surf-tube",
    trickId: "surf-tube",
    title: "Tube",
    level: "Expert",
    minutes: 11,
    intro: "Le tube, c'est rester sous la lèvre qui déferle, dans la partie creuse de la vague. Tout se joue dans la lecture, la ligne haute et le contrôle de la vitesse.",
    conditions: "Vagues creuses de 1 à 1,5 m, beach break à marée basse ou pointe de récif, vent offshore léger qui tient la lèvre.",
    prerequis: [
      "Take-off tardif maîtrisé, sous la lèvre",
      "Freiner et accélérer à volonté en trim",
      "Bottom turn haut et serré",
      "Apnée tranquille et wipeouts en sécurité",
    ],
    phases: [
      { phase: "approche", cle: "Take-off au pic, section qui creuse" },
      { phase: "appel", cle: "Tardif, reste haut sur la face" },
      { phase: "vol", cle: "Groupé, ligne haute, main dans la paroi" },
      { phase: "reception", cle: "Regard sur la sortie, accélère pied avant" },
    ],
    schema: "surf-trajectoire",
    etapes: [
      {
        titre: "Choisir la vague",
        texte: "Il te faut une vague qui creuse et dont la lèvre se jette en avant. Place-toi exactement au pic et pars tard : plus tu pars haut, plus tu es déjà dans la bonne ligne.",
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
        texte: "Quand l'ouverture s'élargit, pousse sur le pied avant et redresse légèrement vers l'épaule. Si elle se referme, reste groupé, accélère et traverse la gerbe. Sortir dans la mousse compte aussi.",
      },
    ],
    erreurs: [
      { erreur: "Tu descends trop bas au take-off", correction: "Le bottom turn t'éloigne de la lèvre et elle ferme devant toi. Prends l'angle dès le lever et reste dans le tiers supérieur." },
      { erreur: "Tu regardes la lèvre", correction: "Tu vas où tu regardes : vers la mousse. Fixe la sortie, la tache de lumière au bout du tube." },
      { erreur: "Tu sors trop vite ou trop tard", correction: "Mauvais dosage de vitesse. Freine avec la main arrière dans la paroi, accélère avec le pied avant. Travaille les deux séparément en trim." },
    ],
    exercices: [
      "À l'eau, hors tube : 10 vagues en trim groupé, main arrière dans la face, en freinant puis en accélérant sur commande",
      "10 take-offs tardifs sous la lèvre avec ligne haute, sans chercher le tube",
      "Sur des petites sections creuses : 5 têtes sous la lèvre en gardant le regard sur la sortie, même si tu tombes",
    ],
    filmer: "Depuis la plage, de côté avec le zoom, 20 secondes dès le take-off : on doit voir ta hauteur sur la face, ta position groupée et le moment de la sortie.",
    securite: "Les vagues creuses cassent sur peu d'eau. Dans le wipeout, protège la tête avec les bras et attends que ça se calme avant de remonter. Jamais tête la première. Vérifie la profondeur et les rochers à marée basse.",
    retenir: ["Take-off tardif, ligne haute", "Groupé, buste droit", "Regard sur la sortie", "Main arrière = frein, pied avant = accélérateur"],
    quiz: [
      { q: "Pourquoi ne pas faire de bottom turn complet avant un tube ?", a: "Il t'éloigne de la lèvre : tu descends sous la section creuse et elle ferme devant toi." },
      { q: "Comment freiner dans le tube ?", a: "Main arrière dans la paroi et poids sur le pied arrière." },
      { q: "Où poser le regard ?", a: "Sur la sortie, jamais sur la lèvre." },
    ],
  },

  {
    slug: "surf-aerial",
    trickId: "surf-aerial",
    title: "Aerial",
    level: "Expert",
    minutes: 12,
    intro: "Un aerial, c'est décoller de la lèvre comme d'une rampe. Vitesse maximale, section qui ferme, et une planche qui reste collée sous les pieds jusqu'à la réception.",
    conditions: "Vagues de 60 cm à 1,2 m avec des sections qui ferment net, beach break, petit vent onshore ou side-shore qui plaque la planche sous les pieds.",
    prerequis: [
      "Top turn vertical, tail qui sort de l'eau",
      "Floater sur une longue section",
      "Ollie et grab en skate ou surfskate",
      "Réception compressée sans planter le nez",
    ],
    phases: [
      { phase: "approche", cle: "Vitesse maximale, vise une section qui ferme" },
      { phase: "appel", cle: "Bottom turn à 45°, extension sur la lèvre" },
      { phase: "vol", cle: "Genoux remontés, planche parallèle à l'eau" },
      { phase: "reception", cle: "Centré, genoux fléchis, sur la mousse" },
    ],
    schema: "surf-trajectoire",
    etapes: [
      {
        titre: "Construire la rampe",
        texte: "Repère une section qui va fermer 5 à 10 m devant toi, avec une lèvre qui se lève. Pompe en trim, pied avant chargé : il te faut plus de vitesse que pour un top turn.",
      },
      {
        titre: "Bottom turn à 45°",
        texte: "Ni plat, ni vertical. Un bottom turn à 45° te fait monter le long de la face vers la lèvre avec une trajectoire déjà orientée vers la zone d'atterrissage.",
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
      { erreur: "Tu décolles à la verticale", correction: "Bottom turn trop vertical. À 45°, la trajectoire te fait avancer en l'air au lieu de monter tout droit et retomber derrière." },
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
    retenir: ["Plus de vitesse qu'un top turn", "Bottom turn à 45°", "Genoux remontés, grab main avant", "Réception sur la mousse, centrée"],
    quiz: [
      { q: "Quel angle pour le bottom turn avant un aerial ?", a: "Environ 45° : assez pour monter, pas assez pour décoller à la verticale." },
      { q: "Où atterrir ?", a: "Sur la mousse ou le haut de l'épaule, jamais sur le plat." },
      { q: "Pourquoi un petit vent onshore aide ?", a: "Il plaque la planche sous les pieds pendant le vol." },
    ],
  },
];
