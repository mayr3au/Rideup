/**
 * Schémas pédagogiques des cours (SVG inline, couleurs de la charte).
 * Chaque schéma est une fonction pure : pas d'état, pas de dépendance client.
 */

export type SchemaId = "fenetre-vent" | "directions-vent" | "echelle-vent" | "zone-securite" | "self-rescue" | "priorites" | "signaux" | "baine";

const C = {
  brand: "var(--brand)",
  lagoon: "var(--lagoon)",
  deep: "var(--deep)",
  slate: "var(--slate)",
  line: "var(--line)",
  salt: "var(--salt)",
  raised: "var(--raised)",
  light: "var(--brand-light)",
  danger: "var(--danger)",
  sand: "#f1dfb4",
  sea: "#dceefb",
  ok: "#1f9d6a",
};

const T = { fontFamily: "inherit", fontWeight: 600 } as const;

function Frame({ children, viewBox = "0 0 400 260", label }: { children: React.ReactNode; viewBox?: string; label: string }) {
  return (
    <svg viewBox={viewBox} role="img" aria-label={label} className="h-auto w-full" style={{ fontSize: 12 }}>
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill="context-stroke" />
        </marker>
        <marker id="arr-deep" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={C.deep} />
        </marker>
        <marker id="arr-brand" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={C.brand} />
        </marker>
        <marker id="arr-danger" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0 0 L10 5 L0 10 z" fill={C.danger} />
        </marker>
      </defs>
      {children}
    </svg>
  );
}

/** Petit rider vu de face : tête + corps + planche. */
function Rider({ x, y, scale = 1, color = C.deep }: { x: number; y: number; scale?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="0" cy="-22" r="5" fill={color} stroke="none" />
      <path d="M0 -16 V0 M0 -12 L-9 -4 M0 -12 L9 -4 M0 0 L-6 10 M0 0 L6 10" />
      <path d="M-14 12 H14" strokeWidth={3} />
    </g>
  );
}

/** Aile de kite stylisée (arc) centrée sur (x,y), orientée par `rot`. */
function Kite({ x, y, rot = 0, scale = 1, color = C.brand }: { x: number; y: number; rot?: number; scale?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <path d="M-22 6 Q0 -14 22 6 Q0 -2 -22 6 Z" fill={color} />
    </g>
  );
}

/* ───────────────────────── 1. Fenêtre de vent ───────────────────────── */

function FenetreVent() {
  const cx = 200;
  const cy = 215;
  const R = 150;
  const pt = (deg: number, r = R) => [cx + r * Math.cos((Math.PI * deg) / 180), cy - r * Math.sin((Math.PI * deg) / 180)] as const;
  const clock: { h: string; deg: number }[] = [
    { h: "9 h", deg: 180 },
    { h: "10 h", deg: 150 },
    { h: "11 h", deg: 120 },
    { h: "12 h", deg: 90 },
    { h: "1 h", deg: 60 },
    { h: "2 h", deg: 30 },
    { h: "3 h", deg: 0 },
  ];
  return (
    <Frame label="La fenêtre de vent vue de derrière le rider : zone neutre sur le bord, zone de puissance au centre" viewBox="0 0 400 250">
      {/* zone de puissance (demi-disque intérieur) */}
      <path d={`M${cx - R * 0.72} ${cy} A${R * 0.72} ${R * 0.72} 0 0 1 ${cx + R * 0.72} ${cy} Z`} fill={C.brand} opacity={0.18} />
      <path d={`M${cx - R * 0.42} ${cy} A${R * 0.42} ${R * 0.42} 0 0 1 ${cx + R * 0.42} ${cy} Z`} fill={C.brand} opacity={0.3} />
      {/* bord de fenêtre */}
      <path d={`M${cx - R} ${cy} A${R} ${R} 0 0 1 ${cx + R} ${cy}`} fill="none" stroke={C.lagoon} strokeWidth={3} strokeDasharray="6 5" />
      <line x1={cx - R} y1={cy} x2={cx + R} y2={cy} stroke={C.line} strokeWidth={1.5} />
      {/* repères horaires */}
      {clock.map((c) => {
        const [x, y] = pt(c.deg);
        const [lx, ly] = pt(c.deg, R + 16);
        return (
          <g key={c.h}>
            <circle cx={x} cy={y} r={3.5} fill={C.lagoon} />
            <text x={lx} y={ly + 4} textAnchor="middle" fill={C.deep} style={T}>
              {c.h}
            </text>
          </g>
        );
      })}
      {/* kites en position */}
      <Kite x={pt(90, R - 14)[0]} y={pt(90, R - 14)[1]} scale={0.9} color={C.lagoon} />
      <Kite x={pt(145, R - 12)[0]} y={pt(145, R - 12)[1]} rot={55} scale={0.8} color={C.lagoon} />
      <Kite x={pt(110, R * 0.45)[0]} y={pt(110, R * 0.45)[1]} rot={20} scale={0.9} color={C.brand} />
      {/* rider */}
      <Rider x={cx} y={cy - 8} />
      {/* vent : dans le dos du rider, donc « vers le fond » du schéma */}
      <g transform="translate(22 30)">
        <circle cx="0" cy="0" r="9" fill="none" stroke={C.deep} strokeWidth={2} />
        <path d="M-5 -5 L5 5 M5 -5 L-5 5" stroke={C.deep} strokeWidth={2} />
        <text x="14" y="-1" fill={C.deep} style={T} fontSize="11">
          VENT
        </text>
        <text x="14" y="12" fill={C.slate} fontSize="9.5">
          dans ton dos
        </text>
      </g>
      {/* légendes */}
      <text x={cx} y={cy - R - 32} textAnchor="middle" fill={C.lagoon} style={T}>
        Zénith : zone neutre, le kite se pose
      </text>
      <text x={cx + 8} y={cy - 48} textAnchor="middle" fill={C.deep} style={T} fontSize="11">
        Zone de puissance
      </text>
      <text x={cx + 8} y={cy - 35} textAnchor="middle" fill={C.deep} fontSize="10">
        traction maximale
      </text>
      <text x={cx + R - 18} y={cy + 22} textAnchor="end" fill={C.lagoon} fontSize="10" style={T}>
        Bord de fenêtre = peu de traction
      </text>
      <text x={cx - R + 2} y={cy + 22} textAnchor="start" fill={C.slate} fontSize="10">
        Gauche du rider
      </text>
    </Frame>
  );
}

/* ───────────────────────── 2. Directions du vent ───────────────────────── */

function Beach({ x, w, title, verdict, color, arrowRot, note }: { x: number; w: number; title: string; verdict: string; color: string; arrowRot: number; note: [string, string] }) {
  const h = 150;
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x="0" y="22" width={w} height={h} rx="10" fill={C.sea} />
      <rect x="0" y="122" width={w} height="50" rx="10" fill={C.sand} />
      <rect x="0" y="118" width={w} height="10" fill={C.sand} />
      <text x={w / 2} y="14" textAnchor="middle" fill={C.deep} style={T}>
        {title}
      </text>
      <text x="8" y="164" fill={C.slate} fontSize="10">
        plage
      </text>
      <text x="8" y="38" fill={C.slate} fontSize="10">
        mer
      </text>
      <g transform={`translate(${w / 2} 80) rotate(${arrowRot})`}>
        <line x1="-28" y1="0" x2="28" y2="0" stroke={color} strokeWidth={3} markerEnd={color === C.danger ? "url(#arr-danger)" : "url(#arr-brand)"} />
      </g>
      <text x={w / 2} y="192" textAnchor="middle" fill={color} style={T}>
        {verdict}
      </text>
      <text x={w / 2} y="206" textAnchor="middle" fill={C.slate} fontSize="9.5">
        {note[0]}
      </text>
      <text x={w / 2} y="218" textAnchor="middle" fill={C.slate} fontSize="9.5">
        {note[1]}
      </text>
    </g>
  );
}

function DirectionsVent() {
  return (
    <Frame label="Directions du vent par rapport à la plage : side-shore idéal, onshore acceptable, offshore dangereux" viewBox="0 0 400 226">
      <Beach x={4} w={124} title="Side / side-on" verdict="✓ Idéal" color={C.ok} arrowRot={20} note={["tu longes la plage,", "tu rentres toujours"]} />
      <Beach x={138} w={124} title="Onshore" verdict="~ Prudence" color={C.brand} arrowRot={90} note={["repoussé au bord :", "obstacles, shore break"]} />
      <Beach x={272} w={124} title="Offshore" verdict="✗ Jamais" color={C.danger} arrowRot={-90} note={["une panne et tu pars", "au large, sans retour"]} />
    </Frame>
  );
}

/* ───────────────────────── 3. Échelle de vent ───────────────────────── */

function EchelleVent() {
  const rows = [
    { nds: "8–12", feel: "Léger : drapeau mou, petites rides", kite: "Trop peu pour débuter", w: 0.3, c: C.raised },
    { nds: "12–16", feel: "Bon vent : moutons épars", kite: "Grande aile (12–14 m²)", w: 0.5, c: C.light },
    { nds: "16–22", feel: "Soutenu : moutons partout", kite: "Aile moyenne (9–12 m²)", w: 0.72, c: C.brand },
    { nds: "22–28", feel: "Fort : embruns, vagues courtes", kite: "Petite aile (7–9 m²)", w: 0.9, c: C.lagoon },
    { nds: "28 +", feel: "Très fort : réservé aux experts", kite: "Reste au sec si tu débutes", w: 1, c: C.danger },
  ];
  return (
    <Frame label="Échelle de vent en nœuds, ressenti et taille d'aile conseillée pour 75 kg" viewBox="0 0 420 190">
      <text x="0" y="12" fill={C.slate} fontSize="10" style={T}>
        NŒUDS
      </text>
      <text x="70" y="12" fill={C.slate} fontSize="10" style={T}>
        SUR L&apos;EAU
      </text>
      <text x="420" y="12" textAnchor="end" fill={C.slate} fontSize="10" style={T}>
        AILE POUR 75 KG
      </text>
      {rows.map((r, i) => {
        const y = 24 + i * 32;
        return (
          <g key={r.nds} transform={`translate(0 ${y})`}>
            <rect x="60" y="0" width={200 * r.w} height="24" rx="6" fill={r.c} opacity={r.c === C.raised ? 1 : 0.35} />
            <text x="0" y="16" fill={C.deep} style={T}>
              {r.nds}
            </text>
            <text x="68" y="16" fill={C.deep} fontSize="10.5">
              {r.feel}
            </text>
            <text x="420" y="16" textAnchor="end" fill={C.deep} fontSize="10.5" style={T}>
              {r.kite}
            </text>
          </g>
        );
      })}
      <text x="0" y="186" fill={C.slate} fontSize="9.5">
        Repère : +10 kg ≈ +1 m² d&apos;aile. Sous 12 nds ou au-dessus de 25 nds, un débutant reste au sec.
      </text>
    </Frame>
  );
}

/* ───────────────────────── 4. Zone de sécurité ───────────────────────── */

function ZoneSecurite() {
  return (
    <Frame label="Zone de sécurité sur le spot : 50 m libres sous le vent, loin des baigneurs et des obstacles" viewBox="0 0 400 230">
      <rect x="0" y="0" width="400" height="160" fill={C.sea} />
      <rect x="0" y="160" width="400" height="70" fill={C.sand} />
      {/* baigneurs */}
      <rect x="300" y="110" width="100" height="50" fill="#ffe3a3" opacity={0.8} />
      <text x="350" y="138" textAnchor="middle" fill={C.deep} fontSize="10" style={T}>
        Zone baignade
      </text>
      <text x="350" y="151" textAnchor="middle" fill={C.danger} fontSize="10" style={T}>
        interdit
      </text>
      {/* obstacles */}
      <g fill={C.deep}>
        <rect x="20" y="166" width="6" height="40" />
        <rect x="40" y="172" width="6" height="34" />
        <text x="33" y="222" textAnchor="middle" fontSize="10" style={T}>
          Poteaux, arbres
        </text>
      </g>
      {/* vent */}
      <g transform="translate(200 24)">
        <line x1="-40" y1="0" x2="40" y2="0" stroke={C.deep} strokeWidth={2.5} markerEnd="url(#arr-deep)" />
        <text x="0" y="-8" textAnchor="middle" fill={C.deep} style={T} fontSize="11">
          VENT (side-shore)
        </text>
      </g>
      {/* rider et sa marge */}
      <Rider x={120} y={100} />
      <Kite x={160} y={44} rot={-30} />
      <g stroke={C.brand} strokeWidth={2} strokeDasharray="5 4" fill="none">
        <path d="M132 100 H262" markerEnd="url(#arr-brand)" />
      </g>
      <text x="197" y="92" textAnchor="middle" fill={C.brand} fontSize="10.5" style={T}>
        ≥ 50 m libres sous le vent
      </text>
      <text x="197" y="118" textAnchor="middle" fill={C.slate} fontSize="10">
        (2 longueurs de lignes, sans personne ni obstacle)
      </text>
      {/* zone de lancement */}
      <rect x="130" y="166" width="120" height="50" rx="8" fill="none" stroke={C.lagoon} strokeWidth={2} strokeDasharray="5 4" />
      <text x="190" y="188" textAnchor="middle" fill={C.lagoon} fontSize="10" style={T}>
        Zone de lancement
      </text>
      <text x="190" y="203" textAnchor="middle" fill={C.slate} fontSize="9.5">
        lignes dégagées, personne sous le kite
      </text>
    </Frame>
  );
}

/* ───────────────────────── 5. Self-rescue ───────────────────────── */

function Panel({ x, n, title, children }: { x: number; n: number; title: string; children: React.ReactNode }) {
  return (
    <g transform={`translate(${x} 0)`}>
      <rect x="0" y="0" width="92" height="150" rx="12" fill={C.salt} stroke={C.line} />
      <circle cx="16" cy="16" r="11" fill={C.brand} />
      <text x="16" y="20" textAnchor="middle" fill="#fff" fontSize="11" style={T}>
        {n}
      </text>
      <g transform="translate(46 70)">{children}</g>
      <text x="46" y="140" textAnchor="middle" fill={C.deep} fontSize="9.5" style={T}>
        {title}
      </text>
    </g>
  );
}

function SelfRescue() {
  return (
    <Frame label="Self-rescue en quatre étapes : largueur, enrouler les lignes, attraper le kite, rentrer en voile" viewBox="0 0 400 150">
      <Panel x={4} n={1} title="Largueur">
        <Rider x={0} y={30} scale={0.9} />
        <Kite x={-10} y={-40} rot={110} scale={0.7} color={C.slate} />
        <path d="M-4 10 L-6 -30" stroke={C.slate} strokeWidth={1} strokeDasharray="2 2" />
      </Panel>
      <Panel x={104} n={2} title="Enroule les lignes">
        <Rider x={-6} y={30} scale={0.9} />
        <Kite x={24} y={-28} rot={60} scale={0.65} color={C.slate} />
        <path d="M2 16 c 10 -8, 14 -10, 18 -30" stroke={C.lagoon} strokeWidth={2} fill="none" />
        <circle cx="4" cy="18" r="6" fill="none" stroke={C.lagoon} strokeWidth={2} />
      </Panel>
      <Panel x={204} n={3} title="Bord d'attaque">
        <Rider x={-8} y={30} scale={0.9} />
        <Kite x={14} y={10} rot={95} scale={0.8} />
      </Panel>
      <Panel x={304} n={4} title="Voile → plage">
        <Rider x={-16} y={30} scale={0.9} />
        <Kite x={14} y={-4} rot={70} scale={0.9} />
        <line x1="-14" y1="-52" x2="30" y2="-52" stroke={C.deep} strokeWidth={2} markerEnd="url(#arr-deep)" />
        <text x="8" y="-57" textAnchor="middle" fill={C.deep} fontSize="8.5" style={T}>
          vent
        </text>
      </Panel>
    </Frame>
  );
}

/* ───────────────────────── 6. Priorités ───────────────────────── */

function Priorites() {
  return (
    <Frame label="Règles de priorité : le rider tribord amures garde sa route ; en croisement, celui qui remonte au vent garde le kite bas et celui qui descend le monte" viewBox="0 0 400 230">
      <rect x="0" y="0" width="400" height="230" fill={C.sea} rx="12" />
      <g transform="translate(200 20)">
        <line x1="0" y1="-10" x2="0" y2="22" stroke={C.deep} strokeWidth={2.5} markerEnd="url(#arr-deep)" />
        <text x="14" y="4" fill={C.deep} style={T} fontSize="11">
          VENT
        </text>
      </g>
      {/* rider A : au vent, kite bas */}
      <g>
        <Rider x={120} y={150} />
        <Kite x={60} y={118} rot={-30} />
        <line x1="112" y1="140" x2="70" y2="124" stroke={C.slate} strokeWidth={1} />
        <path d="M135 140 L200 112" stroke={C.deep} strokeWidth={2} markerEnd="url(#arr-deep)" />
        <text x="120" y="182" textAnchor="middle" fill={C.deep} fontSize="10.5" style={T}>
          Rider au vent
        </text>
        <text x="120" y="196" textAnchor="middle" fill={C.lagoon} fontSize="10" style={T}>
          kite BAS
        </text>
      </g>
      {/* rider B : sous le vent, kite haut */}
      <g>
        <Rider x={290} y={112} />
        <Kite x={300} y={44} rot={10} />
        <line x1="292" y1="100" x2="300" y2="56" stroke={C.slate} strokeWidth={1} />
        <path d="M275 122 L210 150" stroke={C.deep} strokeWidth={2} markerEnd="url(#arr-deep)" />
        <text x="290" y="146" textAnchor="middle" fill={C.deep} fontSize="10.5" style={T}>
          Rider sous le vent
        </text>
        <text x="290" y="160" textAnchor="middle" fill={C.lagoon} fontSize="10" style={T}>
          kite HAUT
        </text>
      </g>
      <text x="200" y="218" textAnchor="middle" fill={C.deep} fontSize="10.5" style={T}>
        Chacun écarte son kite de celui de l&apos;autre.
      </text>
    </Frame>
  );
}

/* ───────────────────────── 7. Signaux ───────────────────────── */

function Signaux() {
  const items = [
    { t: "Pouce levé", s: "« Lance / je suis prêt »" },
    { t: "Tape sur la tête", s: "« Pose-moi le kite »" },
    { t: "Pouce vers le bas", s: "« Non, attends »" },
  ];
  return (
    <Frame label="Signaux universels pour lancer et poser un kite à deux : pouce levé, tape sur la tête, pouce vers le bas" viewBox="0 0 400 150">
      {items.map((it, i) => (
        <g key={it.t} transform={`translate(${8 + i * 130} 0)`}>
          <rect x="0" y="0" width="122" height="150" rx="12" fill={C.salt} stroke={C.line} />
          <g transform="translate(61 60)" fill="none" stroke={C.deep} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="0" cy="-22" r="7" fill={C.deep} stroke="none" />
            <path d="M0 -14 V12 M0 0 L-12 12 M0 12 L-6 30 M0 12 L6 30" />
            {i === 0 && <path d="M0 -4 L16 -20 M16 -20 L16 -30" stroke={C.brand} strokeWidth={3.2} />}
            {i === 1 && <path d="M0 -4 Q18 -14 6 -30" stroke={C.brand} strokeWidth={3.2} />}
            {i === 2 && <path d="M0 -4 L16 6 M16 6 L16 16" stroke={C.danger} strokeWidth={3.2} />}
          </g>
          <text x="61" y="118" textAnchor="middle" fill={C.deep} fontSize="11" style={T}>
            {it.t}
          </text>
          <text x="61" y="134" textAnchor="middle" fill={C.slate} fontSize="9.5">
            {it.s}
          </text>
        </g>
      ))}
    </Frame>
  );
}

/* ───────────────────────── 8. Courant de baïne ───────────────────────── */

function Baine() {
  return (
    <Frame label="Courant de baïne : l'eau ressort au large par un couloir sans vagues ; on en sort en nageant parallèlement à la plage" viewBox="0 0 400 230">
      <rect x="0" y="0" width="400" height="170" fill={C.sea} />
      <rect x="0" y="170" width="400" height="60" fill={C.sand} />
      {/* bancs de sable et vagues qui déferlent */}
      {[0, 1, 2].map((r) => (
        <g key={r}>
          <path d={`M10 ${70 + r * 32} q 20 -8 40 0 t 40 0 t 40 0`} fill="none" stroke="#fff" strokeWidth={3} />
          <path d={`M270 ${70 + r * 32} q 20 -8 40 0 t 40 0 t 40 0`} fill="none" stroke="#fff" strokeWidth={3} />
        </g>
      ))}
      {/* couloir sans vagues : le courant */}
      <rect x="160" y="30" width="80" height="140" fill={C.brand} opacity={0.12} />
      <path d="M200 160 V40" stroke={C.danger} strokeWidth={3} markerEnd="url(#arr-danger)" />
      <text x="200" y="26" textAnchor="middle" fill={C.danger} fontSize="10.5" style={T}>
        Courant vers le large
      </text>
      <text x="200" y="188" textAnchor="middle" fill={C.deep} fontSize="10" style={T}>
        Eau plate, sombre, sans vagues = méfiance
      </text>
      {/* sortie : nager en travers */}
      <path d="M208 108 H300" stroke={C.ok} strokeWidth={3} markerEnd="url(#arr)" style={{ color: C.ok }} />
      <text x="258" y="96" textAnchor="middle" fill={C.ok} fontSize="10.5" style={T}>
        Sortie : nage en travers
      </text>
      <text x="258" y="124" textAnchor="middle" fill={C.deep} fontSize="9.5">
        vers les vagues, puis rentre
      </text>
      <text x="80" y="140" textAnchor="middle" fill={C.deep} fontSize="10">
        Vagues = banc de sable
      </text>
      <text x="80" y="153" textAnchor="middle" fill={C.deep} fontSize="10">
        (l&apos;eau pousse vers la plage)
      </text>
      <text x="200" y="214" textAnchor="middle" fill={C.slate} fontSize="10">
        Ne jamais nager contre le courant : il est plus fort que toi.
      </text>
    </Frame>
  );
}

const SCHEMAS: Record<SchemaId, () => React.ReactElement> = {
  "fenetre-vent": FenetreVent,
  "directions-vent": DirectionsVent,
  "echelle-vent": EchelleVent,
  "zone-securite": ZoneSecurite,
  "self-rescue": SelfRescue,
  priorites: Priorites,
  signaux: Signaux,
  baine: Baine,
};

export function Schema({ id, caption, compact = false }: { id: SchemaId; caption?: string; compact?: boolean }) {
  const Draw = SCHEMAS[id];
  return (
    <figure className={compact ? "" : "panel overflow-hidden p-3 sm:p-5"}>
      <Draw />
      {caption && <figcaption className="mt-2 text-center text-sm text-slate">{caption}</figcaption>}
    </figure>
  );
}
