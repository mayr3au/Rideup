import Image from "next/image";
import Link from "next/link";

/**
 * Logo RIDE'UP (provisoire). `full` ajoute la signature « Progress your ride » ;
 * `light` : version claire pour les fonds sombres ou les photos.
 */
export function Logo({ href = "/", full = false, light = false, height = 34, className = "" }: { href?: string; full?: boolean; light?: boolean; height?: number; className?: string }) {
  const src = full ? (light ? "/brand-full-light.png" : "/brand-full-dark.png") : light ? "/brand-wordmark-light.png" : "/brand-wordmark-dark.png";
  const ratio = full ? 765 / 350 : 742 / 330;
  return (
    <Link href={href} className={`inline-flex shrink-0 items-center ${className}`} aria-label="RIDE'UP, accueil">
      <Image src={src} alt="RIDE'UP" width={Math.round(height * ratio)} height={height} priority />
    </Link>
  );
}
