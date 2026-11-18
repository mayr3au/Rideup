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
