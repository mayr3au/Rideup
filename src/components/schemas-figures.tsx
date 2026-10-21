/**
 * Schémas des cours « figure par figure » : trajectoires du kite dans la fenêtre,
 * pieds et assiette en foil, aile de wing, jibe/tack, vague, canard, kicker, box, câble.
 */
import { C, Frame, Kite, Rider, T } from "./schemas-base";

export type FigureSchemaId =
  | "trajet-water-start"
  | "trajet-navigation"
  | "trajet-transition"
  | "trajet-saut"
  | "trajet-kiteloop"
  | "trajet-unhooked"
  | "wing-pieds"
  | "wing-aile"
  | "wing-jibe"
  | "wing-tack"
  | "foil-assiette"
  | "surf-pic"
  | "surf-trajectoire"
  | "surf-canard"
  | "wake-kicker"
  | "wake-box"
  | "wake-cable";

/* ───────────────────────── Fenêtre réutilisable (vue de derrière le rider) ───────────────────────── */

const W = { cx: 200, cy: 215, R: 150 };
const pt = (deg: number, r = W.R) => [W.cx + r * Math.cos((Math.PI * deg) / 180), W.cy - r * Math.sin((Math.PI * deg) / 180)] as const;
/** Heure d'horloge → angle (9 h = gauche = 180°, 12 h = 90°, 3 h = droite = 0°). */
const hour = (h: number) => 180 - ((h - 9) / 6) * 180;

function Window({ children, label, dim = false }: { children: React.ReactNode; label: string; dim?: boolean }) {
  const { cx, cy, R } = W;
  return (
    <Frame label={label} viewBox="0 0 400 250">
      <path d={`M${cx - R * 0.72} ${cy} A${R * 0.72} ${R * 0.72} 0 0 1 ${cx + R * 0.72} ${cy} Z`} fill={C.brand} opacity={dim ? 0.08 : 0.14} />
      <path d={`M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke={C.lagoon} strokeWidth={2.5} strokeDasharray="6 5" opacity={0.8} />
      <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke={C.line} strokeWidth={1.5} />
      {[9, 10, 11, 12, 1 + 12, 2 + 12, 3 + 12].map((h) => {
        const deg = hour(h);
        const [x, y] = pt(deg);
        const [lx, ly] = pt(deg, R + 15);
        return (
          <g key={h}>
            <circle cx={x} cy={y} r={3} fill={C.lagoon} opacity={0.8} />
            <text x={lx} y={ly + 4} textAnchor="middle" fill={C.slate} fontSize="11" style={T}>
              {h > 12 ? h - 12 : h} h
            </text>
          </g>
        );
      })}
      <Rider x={cx} y={cy - 8} />
      {children}
    </Frame>
  );
}

/** Flèche courbe le long d'un arc de la fenêtre, d'une heure à une autre, à un rayon donné. */
function Arc({ from, to, r = W.R - 10, color = C.brand, width = 3, dashed = false }: { from: number; to: number; r?: number; color?: string; width?: number; dashed?: boolean }) {
  const a = hour(from);
  const b = hour(to);
  const [x1, y1] = pt(a, r);
  const [x2, y2] = pt(b, r);
  const sweep = b < a ? 1 : 0;
  return <path d={`M${x1} ${y1} A${r} ${r} 0 0 ${sweep} ${x2} ${y2}`} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dashed ? "6 5" : undefined} markerEnd="url(#arr-brand)" />;
}

function Note({ x, y, children, color = C.deep, size = 10.5, anchor = "middle" }: { x: number; y: number; children: React.ReactNode; color?: string; size?: number; anchor?: "start" | "middle" | "end" }) {
  return (
    <text x={x} y={y} textAnchor={anchor} fill={color} fontSize={size} style={T}>
      {children}
    </text>
  );
}

/* ───────────────────────── Kitesurf ───────────────────────── */

function TrajetWaterStart() {
  const k12 = pt(hour(12), W.R - 14);
  const k10 = pt(hour(10.3), W.R * 0.6);
  return (
    <Window label="Water start : kite au zénith, une passe franche vers 10 h dans la zone de puissance, puis remontée à 11 h">
      <Kite x={k12[0]} y={k12[1]} scale={0.8} color={C.slate} />
      <Arc from={12} to={10.3} r={W.R * 0.62} />
      <Kite x={k10[0]} y={k10[1]} rot={40} scale={0.9} />
      <Arc from={10.3} to={11} r={W.R * 0.78} color={C.lagoon} dashed />
      <Note x={W.cx} y={W.cy - W.R - 30}>
        1. Kite parqué au zénith, planche aux pieds
      </Note>
      <Note x={W.cx - 118} y={W.cy - 70} anchor="middle" color={C.brand}>
        2. Passe franche
      </Note>
      <Note x={W.cx - 118} y={W.cy - 57} anchor="middle" color={C.slate} size={9.5}>
        vers 10 h, pas plus bas
      </Note>
      <Note x={W.cx - 50} y={W.cy - 128} anchor="middle" color={C.lagoon}>
        3. Remonte à 11 h dès que tu glisses
      </Note>
      <Note x={W.cx} y={W.cy + 24} color={C.slate} size={10}>
        Poids sur le talon arrière, regard vers 10 h
      </Note>
    </Window>
  );
}

function TrajetNavigation() {
  const k = pt(hour(10.5), W.R - 12);
  const kHigh = pt(hour(11.5), W.R - 12);
  return (
    <Window label="Navigation : kite calé entre 10 h et 11 h ; plus haut pour ralentir et remonter au vent, plus bas pour accélérer">
      <Kite x={kHigh[0]} y={kHigh[1]} rot={15} scale={0.8} color={C.slate} />
      <Kite x={k[0]} y={k[1]} rot={35} scale={0.95} />
      <path d={`M${W.cx - 90} ${W.cy - 50} L${W.cx - 60} ${W.cy - 120}`} fill="none" stroke={C.brand} strokeWidth={2.5} strokeDasharray="5 4" markerEnd="url(#arr-brand)" />
      <Note x={W.cx - 150} y={W.cy - 30} anchor="start" color={C.brand}>
        Kite bas = puissance
      </Note>
      <Note x={W.cx - 150} y={W.cy - 17} anchor="start" color={C.slate} size={9.5}>
        pour accélérer, abattre
      </Note>
      <Note x={W.cx - 10} y={W.cy - 150} anchor="start" color={C.slate}>
        Kite haut = moins de traction
      </Note>
      <Note x={W.cx - 10} y={W.cy - 137} anchor="start" color={C.slate} size={9.5}>
        pour ralentir, remonter au vent
      </Note>
      {/* planche orientée au près */}
      <path d={`M${W.cx - 30} ${W.cy + 26} L${W.cx + 36} ${W.cy + 8}`} stroke={C.deep} strokeWidth={4} strokeLinecap="round" />
      <Note x={W.cx} y={W.cy + 44} color={C.slate} size={10}>
        Carre talon constante, hanches vers l&apos;avant, regard loin devant
      </Note>
    </Window>
  );
}

function TrajetTransition() {
  const kL = pt(hour(10.5), W.R - 12);
  const k12 = pt(hour(12), W.R - 12);
  const kR = pt(hour(13.5), W.R - 12);
  return (
    <Window label="Transition : on ralentit en montant le kite au zénith, on change de carre, puis on redescend le kite de l'autre côté">
      <Kite x={kL[0]} y={kL[1]} rot={35} scale={0.8} color={C.slate} />
      <Arc from={10.5} to={12} r={W.R - 12} color={C.lagoon} />
      <Kite x={k12[0]} y={k12[1]} scale={0.95} />
      <Arc from={12} to={13.5} r={W.R - 12} />
      <Kite x={kR[0]} y={kR[1]} rot={-35} scale={0.8} color={C.slate} />
      <Note x={W.cx - 150} y={W.cy - 60} anchor="start" color={C.slate}>
        1. Je remonte au vent,
      </Note>
      <Note x={W.cx - 150} y={W.cy - 47} anchor="start" color={C.slate}>
        je ralentis
      </Note>
      <Note x={W.cx} y={W.cy - W.R - 30} color={C.brand}>
        2. Zénith : arrêt, changement de carre
      </Note>
      <Note x={W.cx + 150} y={W.cy - 60} anchor="end" color={C.slate}>
        3. Kite envoyé de l&apos;autre
      </Note>
      <Note x={W.cx + 150} y={W.cy - 47} anchor="end" color={C.slate}>
        côté, nouveau bord
      </Note>
      <Note x={W.cx} y={W.cy + 24} color={C.slate} size={10}>
        Le poids passe sur l&apos;autre carre pendant que le kite est au zénith
      </Note>
    </Window>
  );
}

function TrajetSaut() {
  const k11 = pt(hour(10.8), W.R - 12);
  const k12 = pt(hour(12.3), W.R - 12);
  const k1 = pt(hour(11.2), W.R - 12);
  return (
    <Window label="Saut : envoi franc du kite de 11 h vers 12 h en gardant la carre, puis renvoi vers l'avant avant la réception">
      <Kite x={k11[0]} y={k11[1]} rot={35} scale={0.8} color={C.slate} />
      <Arc from={10.8} to={12.3} r={W.R - 12} />
      <Kite x={k12[0]} y={k12[1]} rot={-8} scale={0.95} />
      <Arc from={12.3} to={11.2} r={W.R - 34} color={C.lagoon} dashed />
      <Kite x={k1[0]} y={k1[1]} rot={25} scale={0.7} color={C.lagoon} />
      <Note x={W.cx - 152} y={W.cy - 40} anchor="start" color={C.slate}>
        1. Vitesse + carre
      </Note>
      <Note x={W.cx - 152} y={W.cy - 27} anchor="start" color={C.slate} size={9.5}>
        kite à 11 h
      </Note>
      <Note x={W.cx + 30} y={W.cy - W.R - 30} anchor="start" color={C.brand}>
        2. Envoi franc, stop au zénith
      </Note>
      <Note x={W.cx + 30} y={W.cy - W.R - 17} anchor="start" color={C.slate} size={9.5}>
        (jamais au-delà de 12 h)
      </Note>
      <Note x={W.cx - 152} y={W.cy - 120} anchor="start" color={C.lagoon}>
        3. Renvoi vers l&apos;avant
      </Note>
      <Note x={W.cx - 152} y={W.cy - 107} anchor="start" color={C.slate} size={9.5}>
        avant de toucher l&apos;eau
      </Note>
      <Note x={W.cx} y={W.cy + 24} color={C.slate} size={10}>
        En l&apos;air : barre vers toi, genoux à la poitrine
      </Note>
    </Window>
  );
}

function TrajetKiteloop() {
  const k12 = pt(hour(12), W.R - 12);
  // boucle : petit cercle sous le kite, dans la zone de puissance
  const lc = pt(hour(11.3), W.R * 0.55);
  return (
    <Window label="Kiteloop : au point haut du saut, le kite boucle complètement dans la zone de puissance puis remonte pour la réception">
      <Kite x={k12[0]} y={k12[1]} scale={0.85} color={C.slate} />
      <path d={`M${k12[0] - 6} ${k12[1] + 10} C ${lc[0] - 70} ${lc[1] - 40}, ${lc[0] - 70} ${lc[1] + 45}, ${lc[0]} ${lc[1] + 30} S ${lc[0] + 60} ${lc[1] - 30}, ${lc[0] + 10} ${lc[1] - 60}`} fill="none" stroke={C.brand} strokeWidth={3.5} markerEnd="url(#arr-brand)" />
      <Kite x={lc[0] + 4} y={lc[1] - 2} rot={200} scale={0.9} />
      <Note x={W.cx} y={W.cy - W.R - 30} color={C.slate}>
        1. Saut normal, kite au point haut
      </Note>
      <Note x={W.cx - 150} y={W.cy - 100} anchor="start" color={C.brand}>
        2. Tire franc et
      </Note>
      <Note x={W.cx - 150} y={W.cy - 87} anchor="start" color={C.brand}>
        long d&apos;un côté
      </Note>
      <Note x={W.cx - 150} y={W.cy - 74} anchor="start" color={C.slate} size={9.5}>
        barre aux hanches
      </Note>
      <Note x={W.cx + 150} y={W.cy - 100} anchor="end" color={C.lagoon}>
        3. Le kite remonte,
      </Note>
      <Note x={W.cx + 150} y={W.cy - 87} anchor="end" color={C.lagoon}>
        tu te poses dans
      </Note>
      <Note x={W.cx + 150} y={W.cy - 74} anchor="end" color={C.lagoon}>
        le sens de la marche
      </Note>
      <Note x={W.cx} y={W.cy + 24} color={C.danger} size={10}>
        La traction est violente : 50 m libres sous le vent, vent régulier
      </Note>
    </Window>
  );
}

function TrajetUnhooked() {
  const k = pt(hour(9.9), W.R - 12);
  return (
    <Window label="Unhooked : kite bas et stable vers 10 h, décroché, carre explosive pour le pop ; le kite ne bouge pas" dim>
      <Kite x={k[0]} y={k[1]} rot={50} scale={1} />
      <path d={`M${W.cx - 70} ${W.cy + 18} L${W.cx + 50} ${W.cy + 18}`} stroke={C.deep} strokeWidth={4} strokeLinecap="round" />
      <path d={`M${W.cx - 6} ${W.cy + 10} Q ${W.cx + 20} ${W.cy - 60} ${W.cx + 70} ${W.cy - 40}`} fill="none" stroke={C.brand} strokeWidth={3} markerEnd="url(#arr-brand)" />
      <Note x={W.cx - 150} y={W.cy - 110} anchor="start" color={C.brand}>
        Kite bas, à 45° ou moins
      </Note>
      <Note x={W.cx - 150} y={W.cy - 97} anchor="start" color={C.slate} size={9.5}>
        il ne bouge plus pendant la figure
      </Note>
      <Note x={W.cx + 75} y={W.cy - 50} anchor="start" color={C.brand}>
        Pop sur la carre
      </Note>
      <Note x={W.cx + 75} y={W.cy - 37} anchor="start" color={C.slate} size={9.5}>
        épaules en arrière
      </Note>
      <Note x={W.cx} y={W.cy + 40} color={C.slate} size={10}>
        Décroché : la traction vient des bras et de la carre, pas du kite
      </Note>
    </Window>
  );
}

/* ───────────────────────── Wing / foil ───────────────────────── */

function WingPieds() {
  return (
    <Frame label="Placement des pieds sur une planche de foil : pied avant au-dessus du mât ou juste devant, pied arrière entre le mât et l'arrière" viewBox="0 0 400 190">
      {/* planche vue de dessus */}
      <path d="M40 95 C 40 55, 120 40, 200 40 S 360 55, 360 95 S 280 150, 200 150 S 40 135, 40 95 Z" fill={C.salt} stroke={C.deep} strokeWidth={2} />
      {/* mât */}
      <rect x="212" y="78" width="14" height="34" rx="3" fill={C.deep} />
      <Note x={219} y={128} color={C.deep} size={10}>
        mât
      </Note>
      {/* pieds */}
      <ellipse cx="196" cy="88" rx="16" ry="24" fill={C.brand} opacity={0.85} transform="rotate(-20 196 88)" />
      <ellipse cx="290" cy="100" rx="15" ry="22" fill={C.lagoon} opacity={0.85} transform="rotate(-35 290 100)" />
      <Note x={196} y={30} color={C.brand}>
        Pied avant
      </Note>
      <Note x={196} y={20} color={C.slate} size={9.5}>
        au-dessus ou juste devant le mât
      </Note>
      <Note x={300} y={170} color={C.lagoon}>
        Pied arrière
      </Note>
      <Note x={300} y={182} color={C.slate} size={9.5}>
        entre le mât et l&apos;arrière, ~ largeur d&apos;épaules
      </Note>
      {/* sens de marche */}
      <path d="M60 170 H110" stroke={C.deep} strokeWidth={2} markerEnd="url(#arr-deep)" />
      <Note x={85} y={162} color={C.slate} size={9.5}>
        avant
      </Note>
      {/* vue de profil : foil */}
      <g transform="translate(40 0)">
        <line x1="310" y1="58" x2="340" y2="58" stroke={C.slate} strokeWidth={1} opacity={0} />
      </g>
    </Frame>
  );
}

function WingAile() {
  function WingShape({ x, y, rot, color = C.brand }: { x: number; y: number; rot: number; color?: string }) {
    return (
      <g transform={`translate(${x} ${y}) rotate(${rot})`}>
        <path d="M-34 8 Q0 -18 34 8 Q0 -2 -34 8 Z" fill={color} opacity={0.9} />
        <line x1="-10" y1="2" x2="12" y2="2" stroke={C.deep} strokeWidth={2.5} strokeLinecap="round" />
      </g>
    );
  }
  function Person({ x }: { x: number }) {
    return (
      <g transform={`translate(${x} 0)`} fill="none" stroke={C.deep} strokeWidth={2.2} strokeLinecap="round">
        <circle cx="0" cy="92" r="6" fill={C.deep} stroke="none" />
        <path d="M0 98 V122 M0 122 L-8 142 M0 122 L8 142" />
        <path d="M-18 150 H18" strokeWidth={3} />
      </g>
    );
  }
  return (
    <Frame label="Tenue de l'aile : neutre au-dessus de la tête pour se reposer, bordée avec la main arrière pour avancer, bras souples" viewBox="0 0 400 180">
      {[
        { x: 70, t: "Neutre", s: "aile en drapeau au-dessus", rot: 0, wy: 60, arms: "M0 102 L-6 76 M0 102 L8 76" },
        { x: 200, t: "Bordée", s: "main arrière tire, bras avant tendu", rot: -25, wy: 78, arms: "M0 102 L-16 84 M0 104 L18 96" },
        { x: 330, t: "Choquée", s: "main arrière relâche, puissance en moins", rot: -8, wy: 68, arms: "M0 102 L-14 80 M0 104 L16 92" },
      ].map((p) => (
        <g key={p.t}>
          <WingShape x={p.x} y={p.wy} rot={p.rot} color={p.t === "Neutre" ? C.slate : C.brand} />
          <Person x={p.x} />
          <path d={p.arms} transform={`translate(${p.x} 0)`} fill="none" stroke={C.deep} strokeWidth={2.2} strokeLinecap="round" />
          <Note x={p.x} y={168} color={C.deep}>
            {p.t}
          </Note>
          <Note x={p.x} y={179} color={C.slate} size={9}>
            {p.s}
          </Note>
        </g>
      ))}
      <path d="M20 20 H70" stroke={C.deep} strokeWidth={2.5} markerEnd="url(#arr-deep)" />
      <Note x={45} y={13} color={C.deep} size={10}>
        VENT
      </Note>
    </Frame>
  );
}

function TopTrack({ label, path, notes, wind = "VENT" }: { label: string; path: string; notes: { x: number; y: number; t: string; c?: string }[]; wind?: string }) {
  return (
    <Frame label={label} viewBox="0 0 400 230">
      <rect x="0" y="0" width="400" height="230" rx="12" fill={C.sea} />
      <g transform="translate(200 18)">
        <line x1="0" y1="-8" x2="0" y2="22" stroke={C.deep} strokeWidth={2.5} markerEnd="url(#arr-deep)" />
        <Note x={14} y={6} anchor="start" color={C.deep} size={11}>
          {wind}
        </Note>
      </g>
      <path d={path} fill="none" stroke={C.brand} strokeWidth={3.5} markerEnd="url(#arr-brand)" />
      {notes.map((n) => (
        <Note key={n.t} x={n.x} y={n.y} color={n.c ?? C.deep} size={10}>
          {n.t}
        </Note>
      ))}
    </Frame>
  );
}

function WingJibe() {
  return (
    <TopTrack
      label="Jibe en vol (vue de dessus) : on abat en gardant la vitesse, on passe l'aile devant soi au vent arrière, on change de pieds, on relance sur l'autre bord"
      path="M40 70 C 150 60, 230 90, 250 140 S 200 200, 120 180"
      notes={[
        { x: 70, y: 56, t: "1. Vitesse, vol stable" },
        { x: 300, y: 120, t: "2. Abats : aile neutre,", c: C.brand },
        { x: 300, y: 133, t: "passe-la devant toi", c: C.brand },
        { x: 250, y: 200, t: "3. Vent arrière : change de pieds" },
        { x: 90, y: 205, t: "4. Reborde, nouveau bord", c: C.lagoon },
      ]}
    />
  );
}

function WingTack() {
  return (
    <TopTrack
      label="Tack en vol (vue de dessus) : on lofe face au vent avec de la vitesse, l'aile passe par-dessus la tête, on relance sur l'autre bord"
      path="M60 190 C 120 150, 170 90, 200 50 S 250 90, 330 170"
      notes={[
        { x: 80, y: 212, t: "1. Vitesse, cap au près serré" },
        { x: 200, y: 36, t: "2. Face au vent : aile par-dessus la tête,", c: C.brand },
        { x: 200, y: 49, t: "change de pieds, regard sur le nouveau bord", c: C.brand },
        { x: 320, y: 195, t: "3. Reborde, le foil ne doit pas toucher", c: C.lagoon },
      ]}
    />
  );
}

function FoilAssiette() {
  function Board({ x, y, rot, label, sub, color }: { x: number; y: number; rot: number; label: string; sub: string; color: string }) {
    return (
      <g transform={`translate(${x} ${y})`}>
        <line x1="-60" y1="30" x2="60" y2="30" stroke={C.sea} strokeWidth={10} strokeLinecap="round" />
        <g transform={`rotate(${rot})`}>
          <rect x="-50" y="-6" width="100" height="10" rx="5" fill={C.deep} />
          <rect x="4" y="4" width="5" height="26" fill={C.deep} />
          <rect x="-16" y="28" width="46" height="5" rx="2" fill={C.brand} />
          <circle cx="-22" cy="-10" r="5" fill={C.brand} />
          <circle cx="22" cy="-10" r="5" fill={C.lagoon} />
        </g>
        <Note x={0} y={60} color={color}>
          {label}
        </Note>
        <Note x={0} y={72} color={C.slate} size={9}>
          {sub}
        </Note>
      </g>
    );
  }
  return (
    <Frame label="Assiette en foil : trop de pied arrière fait monter la planche jusqu'à la ventilation, trop de pied avant la fait toucher l'eau ; on vole à 20-30 cm avec des corrections minimes" viewBox="0 0 400 180">
      <Board x={70} y={50} rot={-14} label="Trop de pied arrière" sub="monte, le foil ventile → chute" color={C.danger} />
      <Board x={200} y={50} rot={0} label="Équilibre" sub="20-30 cm, corrections minimes" color={C.ok} />
      <Board x={330} y={50} rot={12} label="Trop de pied avant" sub="touchette, la planche colle" color={C.danger} />
      <circle cx="120" cy="150" r="5" fill={C.brand} />
      <Note x={132} y={154} anchor="start" color={C.slate} size={10}>
        pied avant
      </Note>
      <circle cx="220" cy="150" r="5" fill={C.lagoon} />
      <Note x={232} y={154} anchor="start" color={C.slate} size={10}>
        pied arrière
      </Note>
    </Frame>
  );
}

/* ───────────────────────── Surf ───────────────────────── */

function SurfPic() {
  return (
    <Frame label="Anatomie d'une vague : le pic où elle casse, l'épaule encore verte, la lèvre ; on se place au pic, légèrement à l'intérieur, et on part vers l'épaule" viewBox="0 0 400 220">
      <rect x="0" y="0" width="400" height="220" fill={C.sea} />
      {/* vague en coupe oblique */}
      <path d="M0 170 C 60 160, 90 90, 150 70 C 180 60, 200 60, 230 80 C 280 110, 330 140, 400 150 L400 220 L0 220 Z" fill={C.brand} opacity={0.35} />
      <path d="M0 170 C 60 160, 90 90, 150 70 C 180 60, 200 60, 230 80 C 280 110, 330 140, 400 150" fill="none" stroke={C.lagoon} strokeWidth={3} />
      {/* écume au pic */}
      <path d="M100 120 q 15 -30 45 -40 q -5 15 5 25" fill="#fff" opacity={0.9} />
      <Note x={120} y={62} color={C.deep}>
        Pic (ça casse ici)
      </Note>
      <Note x={200} y={46} color={C.deep}>
        Lèvre
      </Note>
      <Note x={320} y={118} color={C.deep}>
        Épaule (encore verte)
      </Note>
      <Note x={320} y={131} color={C.slate} size={9.5}>
        la vague s&apos;ouvre par là
      </Note>
      {/* zone de take-off */}
      <ellipse cx="185" cy="92" rx="30" ry="12" fill="none" stroke={C.ok} strokeWidth={2.5} strokeDasharray="5 4" />
      <Note x={185} y={122} color={C.ok}>
        Zone de take-off
      </Note>
      <Note x={185} y={134} color={C.slate} size={9.5}>
        juste à côté du pic, côté épaule
      </Note>
      <path d="M200 96 C 250 110, 290 125, 340 140" fill="none" stroke={C.ok} strokeWidth={3} markerEnd="url(#arr)" style={{ color: C.ok }} />
      <Note x={60} y={200} color={C.slate} size={10}>
        Mousse : zone d&apos;apprentissage
      </Note>
      <Note x={300} y={200} color={C.slate} size={10}>
        Trajectoire : en diagonale, vers l&apos;épaule
      </Note>
    </Frame>
  );
}

function SurfTrajectoire() {
  return (
    <Frame label="Trajectoire sur la face : bottom turn en bas de la vague, top turn ou cutback en haut, en enchaînant bas / haut" viewBox="0 0 400 220">
      <rect x="0" y="0" width="400" height="220" fill={C.sea} />
      <path d="M0 40 L400 20 L400 220 L0 220 Z" fill={C.brand} opacity={0.3} />
      <line x1="0" y1="40" x2="400" y2="20" stroke={C.lagoon} strokeWidth={3} />
      <line x1="0" y1="190" x2="400" y2="190" stroke={C.line} strokeWidth={2} strokeDasharray="6 5" />
      <Note x={60} y={34} color={C.deep} size={10}>
        Lèvre
      </Note>
      <Note x={60} y={205} color={C.slate} size={10}>
        Bas de la vague
      </Note>
      <path d="M20 90 C 60 170, 110 190, 150 150 C 180 120, 200 60, 230 50 C 250 44, 260 70, 240 100 C 220 130, 260 170, 320 180 C 350 184, 380 150, 395 110" fill="none" stroke={C.brand} strokeWidth={3.5} markerEnd="url(#arr-brand)" />
      <Note x={110} y={150} color={C.brand}>
        Bottom turn
      </Note>
      <Note x={110} y={162} color={C.slate} size={9.5}>
        appui rail, regard vers la lèvre
      </Note>
      <Note x={270} y={44} color={C.brand}>
        Top turn
      </Note>
      <Note x={290} y={57} color={C.slate} size={9.5}>
        épaules qui ouvrent, planche vers le bas
      </Note>
      <Note x={330} y={205} color={C.lagoon}>
        Cutback : revenir vers l&apos;écume
      </Note>
      <path d="M380 30 L380 60" stroke={C.deep} strokeWidth={2} markerEnd="url(#arr-deep)" />
      <Note x={380} y={75} color={C.slate} size={9}>
        la vague avance
      </Note>
    </Frame>
  );
}

function SurfCanard() {
  function Step({ x, n, t, children }: { x: number; n: number; t: string; children: React.ReactNode }) {
    return (
      <g transform={`translate(${x} 0)`}>
        <rect x="0" y="0" width="122" height="150" rx="12" fill={C.salt} stroke={C.line} />
        <circle cx="16" cy="16" r="11" fill={C.brand} />
        <text x="16" y="20" textAnchor="middle" fill="#fff" fontSize="11" style={T}>
          {n}
        </text>
        <g transform="translate(61 78)">{children}</g>
        <Note x={61} y={140} color={C.deep} size={9.5}>
          {t}
        </Note>
      </g>
    );
  }
  const wave = <path d="M-60 -10 q 20 -22 40 -8 q 15 10 30 -6" fill="none" stroke="#fff" strokeWidth={4} />;
  return (
    <Frame label="Le canard en trois temps : enfoncer le nez avec les bras, enfoncer l'arrière avec le genou ou le pied, ressortir derrière la vague" viewBox="0 0 400 150">
      <Step x={8} n={1} t="Nez enfoncé, bras tendus">
        {wave}
        <g transform="rotate(25)">
          <rect x="-40" y="-4" width="80" height="8" rx="4" fill={C.deep} />
        </g>
        <circle cx="12" cy="-18" r="5" fill={C.deep} />
      </Step>
      <Step x={139} n={2} t="Genou sur l'arrière">
        {wave}
        <rect x="-40" y="10" width="80" height="8" rx="4" fill={C.deep} />
        <circle cx="-6" cy="-6" r="5" fill={C.deep} />
        <path d="M-6 0 L10 12" stroke={C.deep} strokeWidth={3} strokeLinecap="round" />
      </Step>
      <Step x={270} n={3} t="Ressors derrière la vague">
        {wave}
        <g transform="rotate(-25)">
          <rect x="-40" y="-4" width="80" height="8" rx="4" fill={C.deep} />
        </g>
        <circle cx="-14" cy="-18" r="5" fill={C.deep} />
      </Step>
    </Frame>
  );
}

/* ───────────────────────── Wakeboard ───────────────────────── */

function WakeKicker() {
  return (
    <Frame label="Kicker : approche en ligne droite, carre progressive, poignée basse, pop à la lèvre sans tirer sur la poignée, réception genoux souples" viewBox="0 0 400 200">
      <rect x="0" y="130" width="400" height="70" fill={C.sea} />
      {/* kicker */}
      <path d="M170 130 L260 70 L262 130 Z" fill={C.deep} />
      <Note x={214} y={150} color={C.slate} size={10}>
        kicker
      </Note>
      {/* trajectoire */}
      <path d="M20 120 C 80 118, 130 112, 165 118" fill="none" stroke={C.brand} strokeWidth={3} strokeDasharray="6 5" />
      <path d="M260 66 C 290 30, 330 40, 360 120" fill="none" stroke={C.brand} strokeWidth={3.5} markerEnd="url(#arr-brand)" />
      <Rider x={100} y={100} scale={0.8} />
      <Rider x={310} y={40} scale={0.8} />
      {/* câble */}
      <line x1="100" y1="88" x2="60" y2="20" stroke={C.slate} strokeWidth={1.5} />
      <line x1="310" y1="28" x2="300" y2="-10" stroke={C.slate} strokeWidth={1.5} />
      <Note x={90} y={150} color={C.deep}>
        1. Ligne droite, à plat
      </Note>
      <Note x={90} y={163} color={C.slate} size={9.5}>
        poignée basse, genoux souples
      </Note>
      <Note x={230} y={54} color={C.brand} anchor="end">
        2. Carre progressive
      </Note>
      <Note x={230} y={67} color={C.slate} size={9.5} anchor="end">
        vitesse constante, on ne tire pas
      </Note>
      <Note x={330} y={160} color={C.deep}>
        3. Réception
      </Note>
      <Note x={330} y={173} color={C.slate} size={9.5}>
        deux pieds, genoux fléchis, poignée basse
      </Note>
      <Note x={200} y={190} color={C.danger} size={10}>
        Jamais de traction sur la poignée sur la rampe ni en l&apos;air
      </Note>
    </Frame>
  );
}

function WakeBox() {
  return (
    <Frame label="Box : approche à plat et bien alignée, montée sans carre, regard au bout du module, poignée basse, sortie sans à-coup" viewBox="0 0 400 200">
      <rect x="0" y="130" width="400" height="70" fill={C.sea} />
      <rect x="130" y="100" width="190" height="14" rx="3" fill={C.deep} />
      <path d="M100 130 L130 100 L130 114 L108 130 Z" fill={C.deep} />
      <Note x={225} y={150} color={C.slate} size={10}>
        box
      </Note>
      <path d="M20 122 C 60 120, 90 118, 104 118" fill="none" stroke={C.brand} strokeWidth={3} strokeDasharray="6 5" />
      <path d="M132 94 H318" fill="none" stroke={C.brand} strokeWidth={3} />
      <path d="M320 94 C 345 100, 360 118, 380 122" fill="none" stroke={C.brand} strokeWidth={3} markerEnd="url(#arr-brand)" />
      <Rider x={60} y={104} scale={0.8} />
      <Rider x={225} y={80} scale={0.8} />
      <Note x={72} y={160} color={C.deep}>
        1. Alignement tôt
      </Note>
      <Note x={72} y={173} color={C.slate} size={9.5}>
        planche à plat, pas de carre
      </Note>
      <Note x={225} y={46} color={C.brand}>
        2. Sur la box : jambes souples
      </Note>
      <Note x={225} y={59} color={C.slate} size={9.5}>
        regard au bout du module, poignée basse
      </Note>
      <Note x={340} y={160} color={C.deep}>
        3. Sortie
      </Note>
      <Note x={340} y={173} color={C.slate} size={9.5}>
        petit pop, à plat
      </Note>
      <Note x={200} y={190} color={C.danger} size={10}>
        Une carre sur la box = la planche part d&apos;un coup
      </Note>
    </Frame>
  );
}

function WakeCable() {
  const pts = [
    [70, 60],
    [330, 60],
    [360, 150],
    [120, 180],
    [40, 120],
  ];
  const d = pts.map((p, i) => `${i ? "L" : "M"}${p[0]} ${p[1]}`).join(" ") + " Z";
  return (
    <Frame label="Plan d'un téléski nautique : le câble tourne entre des pylônes ; dans chaque virage la tension chute puis revient d'un coup, on se replace et on plie les genoux" viewBox="0 0 400 230">
      <rect x="0" y="0" width="400" height="230" rx="12" fill={C.sea} />
      <path d={d} fill="none" stroke={C.deep} strokeWidth={3} strokeDasharray="8 6" />
      {pts.map((p, i) => (
        <g key={i}>
          <circle cx={p[0]} cy={p[1]} r="8" fill={C.deep} />
          <circle cx={p[0]} cy={p[1]} r="16" fill="none" stroke={C.danger} strokeWidth={2} strokeDasharray="3 3" />
        </g>
      ))}
      <Note x={200} y={48} color={C.deep}>
        Ligne droite : tension régulière, on ride
      </Note>
      <Note x={340} y={192} color={C.danger} size={10}>
        Virage : la tension
      </Note>
      <Note x={340} y={205} color={C.danger} size={10}>
        chute puis revient
      </Note>
      <Note x={60} y={200} color={C.slate} size={9.5}>
        pylône
      </Note>
      {/* ponton */}
      <rect x="150" y="190" width="60" height="14" rx="3" fill={C.sand} />
      <Note x={180} y={219} color={C.slate} size={9.5}>
        ponton de départ
      </Note>
      {/* rider */}
      <Rider x={200} y={85} scale={0.7} />
      <Note x={200} y={110} color={C.slate} size={9.5}>
        reste à l&apos;intérieur de la ligne du câble avant le virage
      </Note>
    </Frame>
  );
}

export const FIGURE_SCHEMAS: Record<FigureSchemaId, () => React.ReactElement> = {
  "trajet-water-start": TrajetWaterStart,
  "trajet-navigation": TrajetNavigation,
  "trajet-transition": TrajetTransition,
  "trajet-saut": TrajetSaut,
  "trajet-kiteloop": TrajetKiteloop,
  "trajet-unhooked": TrajetUnhooked,
  "wing-pieds": WingPieds,
  "wing-aile": WingAile,
  "wing-jibe": WingJibe,
  "wing-tack": WingTack,
  "foil-assiette": FoilAssiette,
  "surf-pic": SurfPic,
  "surf-trajectoire": SurfTrajectoire,
  "surf-canard": SurfCanard,
  "wake-kicker": WakeKicker,
  "wake-box": WakeBox,
  "wake-cable": WakeCable,
};
