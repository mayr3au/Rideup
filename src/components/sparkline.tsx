/** Courbe des notes (1–10) d'une figure au fil des tentatives. */
export function Sparkline({ values, width = 140, height = 40 }: { values: number[]; width?: number; height?: number }) {
  if (values.length < 2) return null;
  const pad = 4;
  const x = (i: number) => pad + (i * (width - pad * 2)) / (values.length - 1);
  const y = (v: number) => height - pad - ((v - 1) / 9) * (height - pad * 2);
  const d = values.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const last = values.length - 1;
  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} role="img" aria-label={`Notes : ${values.join(", ")}`}>
      <line x1={pad} x2={width - pad} y1={y(8)} y2={y(8)} stroke="var(--line)" strokeDasharray="3 3" />
      <path d={d} fill="none" stroke="var(--lagoon)" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={x(last)} cy={y(values[last])} r="3.5" fill="var(--kite)" stroke="var(--deep)" strokeWidth="1" />
    </svg>
  );
}
