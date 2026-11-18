"use client";

import { useId } from "react";

/**
 * Icônes maison RIDE'UP : trait arrondi de 1,9, même famille que le logo (planche + vagues).
 * Couleur = currentColor ; taille via className.
 */

type IconProps = { className?: string };

const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.9,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

/** Débloquer une figure : planche au centre d'une flèche de rotation. */
export function IconTrick({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M19.4 9.2A8 8 0 1 0 20 12" />
      <path d="M20.4 4.8l-.9 4.6-4.5-1" />
      <path d="M9 15c-.9-.9-.3-3.1 1.4-4.8s3.9-2.3 4.8-1.4.3 3.1-1.4 4.8S9.9 15.9 9 15z" />
    </svg>
  );
}

/** Choisir son matériel : aile de kite en arc, lignes vers la barre. */
export function IconKite({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M2.5 10C4.5 5.3 8 2.8 12 2.8s7.5 2.5 9.5 7.2c-.8.3-1.6.4-2.4.4C17.2 7.4 14.8 6 12 6S6.8 7.4 4.9 10.4c-.8 0-1.6-.1-2.4-.4z" />
      <path d="M3.7 10.4L9.6 20.4M20.3 10.4L14.4 20.4" />
      <path d="M8.4 20.6h7.2" />
    </svg>
  );
}

/** Rider en sécurité : bouclier avec une vague. */
export function IconSafety({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M12 3l7 2.6v5.6c0 4.4-2.9 7.8-7 9.3-4.1-1.5-7-4.9-7-9.3V5.6z" />
      <path d="M8 12.6c1.3-1.1 2.7-1.1 4 0s2.7 1.1 4 0" />
      <path d="M9.2 15.6c.9-.7 1.9-.7 2.8 0s1.9.7 2.8 0" />
    </svg>
  );
}

/** Préparer sa session : bloc-notes coché, vague en bas. */
export function IconSession({ className = "h-5 w-5" }: IconProps) {
  return (
    <svg {...base} className={className}>
      <path d="M9 4H7a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2h-2" />
      <rect x="9" y="2.8" width="6" height="2.6" rx="1" />
      <path d="M8.5 10.5l1.5 1.5 3-3M14.5 11h1.5" />
      <path d="M8 16.5c1.3-1 2.7-1 4 0s2.7 1 4 0" />
    </svg>
  );
}

/**
 * Avatar du coach IA : la planche du logo RIDE'UP (avec ses vagues) et une petite étincelle « IA ».
 * Dessiné en blanc, à poser sur le dégradé bleu de la marque.
 */
export function CoachAiMark({ className = "h-5 w-5" }: IconProps) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
      <defs>
        <mask id={`m${id}`}>
          <rect width="24" height="24" fill="#fff" />
          {/* Les deux vagues du logo, découpées dans la planche */}
          <path d="M6 14.1c1.6-1.3 3.2-1.3 4.8 0s3.2 1.3 4.8 0" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M6.6 16.6c1.4-1.1 2.8-1.1 4.2 0s2.8 1.1 4.2 0" stroke="#000" strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </mask>
      </defs>
      {/* Planche / voile, légèrement penchée comme dans le logo */}
      <path d="M12.6 2.2c-3.3 3.4-5 8.6-4.6 15.6l.1 1.3h5.9l.3-1.4c1.2-6.2.6-11.6-1.7-15.5z" fill="currentColor" mask={`url(#m${id})`} />
      {/* Ligne d'eau */}
      <path d="M4.5 21.3c2.4-.9 4.9-1.3 7.5-1.3s5.1.4 7.5 1.3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      {/* Étincelle IA */}
      <path d="M18.6 3.4l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" fill="currentColor" />
    </svg>
  );
}

/* ───────────────────────── Jeu d'icônes générique ───────────────────────── */

const PATHS = {
  fire: (
    <>
      <path d="M12 21c-3.9 0-6.5-2.6-6.5-6.2 0-3.4 2.4-5.4 3.6-8.3.4 1.6 1.3 2.7 2.4 3.2C11.6 6.6 13 4.3 15.2 3c-.4 2.7.6 4.6 1.8 6.3 1 1.4 1.5 2.9 1.5 4.6C18.5 18.1 15.9 21 12 21z" />
      <path d="M12 21c-1.6 0-2.8-1.2-2.8-2.8 0-1.7 1.4-2.5 2-4 .9.9 3.6 2.2 3.6 4 0 1.6-1.2 2.8-2.8 2.8z" />
    </>
  ),
  breeze: (
    <>
      <path d="M3 9h10.5a2.5 2.5 0 1 0-2.5-2.5" />
      <path d="M3 13h15a3 3 0 1 1-3 3" />
      <path d="M3 17h6" />
    </>
  ),
  gust: (
    <>
      <path d="M2 8h9a2.5 2.5 0 1 0-2.5-2.5" />
      <path d="M2 12.5h16a3 3 0 1 0-3-3" />
      <path d="M2 17h11a2.5 2.5 0 1 1-2.5 2.5" />
    </>
  ),
  leaf: (
    <>
      <path d="M5 19c0-8 5-13 14-14 0 9-5 14-13 14z" />
      <path d="M5 19l8-8" />
    </>
  ),
  calm: (
    <>
      <path d="M19.5 14.5A7.5 7.5 0 1 1 9.5 4.5a6 6 0 0 0 10 10z" />
      <path d="M15 3.5h3.5L15 7.5h3.5" />
    </>
  ),
  bolt: <path d="M13 2.5L5 13.5h6l-1 8 8-11h-6z" />,
  burst: (
    <>
      <path d="M12 2.8l1.7 4.3 4.2-1.8-1.8 4.2 4.3 1.7-4.3 1.7 1.8 4.2-4.2-1.8L12 21.2l-1.7-4.3-4.2 1.8 1.8-4.2-4.3-1.7 4.3-1.7-1.8-4.2 4.2 1.8z" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 15l-3-3c1.2-3.6 4.6-8.4 12-9-.6 7.4-5.4 10.8-9 12z" />
      <path d="M9 12H5.5L8 8.5h4" />
      <path d="M12 15v3.5L15.5 16v-4" />
      <path d="M6.5 17.5c-1.5.5-2.5 2-3 3.5 1.5-.5 3-1.5 3.5-3" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4.8" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="16" rx="2.5" />
      <path d="M8 3v4M16 3v4M4 10h16" />
      <path d="M8.5 14.5h2M13.5 14.5h2M8.5 17.5h2" />
    </>
  ),
  lock: (
    <>
      <rect x="5" y="11" width="14" height="10" rx="2.5" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),
  check: <path d="M5 12.5l4.5 4.5L19 7.5" />,
  checkCircle: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8 12.3l2.8 2.7L16 9.6" />
    </>
  ),
  cross: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  star: <path d="M12 3.2l2.7 5.5 6 .9-4.3 4.2 1 6-5.4-2.9-5.4 2.9 1-6L3.3 9.6l6-.9z" />,
  warning: (
    <>
      <path d="M10.3 4.3L2.9 17.5A2 2 0 0 0 4.6 20.5h14.8a2 2 0 0 0 1.7-3L13.7 4.3a2 2 0 0 0-3.4 0z" />
      <path d="M12 9.5v4.5M12 17.2v.1" />
    </>
  ),
  pin: (
    <>
      <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11z" />
      <circle cx="12" cy="10" r="2.3" />
    </>
  ),
  compass: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M15.5 8.5l-2 5-5 2 2-5z" />
    </>
  ),
  island: (
    <>
      <path d="M12.5 20.5c.4-4 0-7.6-1.6-11" />
      <path d="M10.9 9.5C9 7.3 6 7.1 4 8.8" />
      <path d="M10.9 9.5c-.3-2.8 1.6-4.9 4.3-5.2" />
      <path d="M10.9 9.5c2.3-1.2 5.1-.7 6.8 1.3" />
      <path d="M3 20.5c3.5-1.6 14.5-1.6 18 0" />
    </>
  ),
  wave: (
    <>
      <path d="M3 17.5c1.5 0 2.2-1.5 4.5-1.5s3 1.5 4.5 1.5 2.2-1.5 4.5-1.5 3 1.5 4.5 1.5" />
      <path d="M4 13.5C4.5 8.6 8 5 12.5 5c3 0 5 1.8 5 4.1 0 1.8-1.4 3.1-3.1 3.1-1.4 0-2.4-1-2.4-2.3" />
    </>
  ),
  video: (
    <>
      <rect x="3" y="6" width="13" height="12" rx="2.5" />
      <path d="M16 10.5l5-3v9l-5-3z" />
    </>
  ),
  chart: (
    <>
      <path d="M4 19.5h16" />
      <path d="M5 15l4.5-4.5 3.5 3.5L19 8" />
      <path d="M15 8h4v4" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6" />
      <path d="M15 15l5.5 5.5" />
    </>
  ),
  sparkles: (
    <>
      <path d="M10 3l1.6 4.4L16 9l-4.4 1.6L10 15l-1.6-4.4L4 9l4.4-1.6z" />
      <path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z" />
    </>
  ),
  trophy: (
    <>
      <path d="M8 4h8v5a4 4 0 0 1-8 0z" />
      <path d="M8 6H5.5A2.5 2.5 0 0 0 8 10M16 6h2.5A2.5 2.5 0 0 1 16 10" />
      <path d="M12 13v3.5M9 20.5h6M10 16.5h4v4h-4z" />
    </>
  ),
  sprout: (
    <>
      <path d="M12 21v-8.5" />
      <path d="M12 12.5C12 9 9.5 6.5 5.5 6.5c0 3.6 2.5 6 6.5 6z" />
      <path d="M12 10.5c0-3.4 2.3-6 6.5-6 0 3.6-2.4 6-6.5 6z" />
    </>
  ),
  crown: (
    <>
      <path d="M3.5 8l4 4 4.5-6 4.5 6 4-4-1.7 10H5.2z" />
      <path d="M5.5 21h13" />
    </>
  ),
  kite: (
    <>
      <path d="M2.5 10C4.5 5.3 8 2.8 12 2.8s7.5 2.5 9.5 7.2c-.8.3-1.6.4-2.4.4C17.2 7.4 14.8 6 12 6S6.8 7.4 4.9 10.4c-.8 0-1.6-.1-2.4-.4z" />
      <path d="M3.7 10.4L9.6 20.4M20.3 10.4L14.4 20.4" />
      <path d="M8.4 20.6h7.2" />
    </>
  ),
} as const;

export type IconName = keyof typeof PATHS;

/** Icône RIDE'UP par son nom. `filled` remplit la forme (étoile des favoris…). */
export function RIcon({ name, className = "h-4 w-4", filled = false, label }: { name: IconName; className?: string; filled?: boolean; label?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={`inline-block shrink-0 align-[-0.15em] ${className}`}
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={1.9}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? "img" : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {PATHS[name]}
    </svg>
  );
}
