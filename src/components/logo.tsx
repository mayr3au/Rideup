import Image from "next/image";
import Link from "next/link";

/** Logo RIDE'UP (provisoire). `full` ajoute la signature « Progress your ride ». */
export function Logo({ href = "/", full = false, height = 34 }: { href?: string; full?: boolean; height?: number }) {
  const src = full ? "/logo-dark.png" : "/logo-wordmark-dark.png";
  const ratio = full ? 765 / 350 : 742 / 330;
  return (
    <Link href={href} className="inline-flex shrink-0 items-center" aria-label="RIDE'UP, accueil">
      <Image src={src} alt="RIDE'UP" width={Math.round(height * ratio)} height={height} priority />
    </Link>
  );
}
