/** Briques communes des schémas : palette, cadre SVG, rider, kite. */

export const C = {
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

export const T = { fontFamily: "inherit", fontWeight: 600 } as const;

export function Frame({ children, viewBox = "0 0 400 260", label }: { children: React.ReactNode; viewBox?: string; label: string }) {
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
export function Rider({ x, y, scale = 1, color = C.deep }: { x: number; y: number; scale?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) scale(${scale})`} fill="none" stroke={color} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="0" cy="-22" r="5" fill={color} stroke="none" />
      <path d="M0 -16 V0 M0 -12 L-9 -4 M0 -12 L9 -4 M0 0 L-6 10 M0 0 L6 10" />
      <path d="M-14 12 H14" strokeWidth={3} />
    </g>
  );
}

/** Aile de kite stylisée (arc) centrée sur (x,y), orientée par `rot`. */
export function Kite({ x, y, rot = 0, scale = 1, color = C.brand }: { x: number; y: number; rot?: number; scale?: number; color?: string }) {
  return (
    <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${scale})`}>
      <path d="M-22 6 Q0 -14 22 6 Q0 -2 -22 6 Z" fill={color} />
    </g>
  );
}

