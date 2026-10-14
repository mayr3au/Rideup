import Image from "next/image";
import Link from "next/link";

/**
 * Logo RIDEUP : monogramme R (rider groupé, jambe en planche) + nom.
 * `full` ajoute la signature « Progress your ride » (version verticale).
 * `light` : version crème pour les fonds sombres.
 */
export function Logo({ href = "/", full = false, light = false, height = 34 }: { href?: string; full?: boolean; light?: boolean; height?: number }) {
  const src = full ? (light ? "/logo.png" : "/logo-dark.png") : light ? "/logo-wordmark.png" : "/logo-wordmark-dark.png";
  const ratio = full ? 434 / 504 : 421 / 104;
  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label="RIDE'UP, accueil">
      <Image src={src} alt="RIDE'UP" width={Math.round(height * ratio)} height={height} priority />
    </Link>
  );
}
