import { compass } from "@/lib/wind";

/** Flèche dans le sens où souffle le vent (le vent vient de `deg`). */
export function WindArrow({ deg, size = 18 }: { deg: number; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" role="img" aria-label={`Vent de ${compass(deg)}`} style={{ transform: `rotate(${deg + 180}deg)` }}>
      <path d="M12 2 L18 20 L12 16 L6 20 Z" fill="currentColor" />
    </svg>
  );
}
