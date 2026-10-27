import Link from "next/link";
import { getSession } from "@/lib/auth";
import { HeaderBar, HeaderNav } from "./header-bar";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";

export const SITE_LINKS = [
  { href: "/#analyse", label: "Comment ça marche" },
  { href: "/cours", label: "Cours" },
  { href: "/week-end", label: "Spots du week-end" },
  { href: "/tarifs", label: "Tarifs" },
];

export async function SiteHeader() {
  const session = await getSession();

  const announce = (
    <Link
      href="/#sports"
      className="group inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 py-1 pl-1 pr-3 text-[0.8rem] font-semibold text-deep shadow-[0_6px_20px_-10px_rgba(14,42,71,0.35)] backdrop-blur-xl transition-colors hover:text-brand"
    >
      <span className="rounded-full bg-brand px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-white">Nouveau</span>
      <span className="hidden sm:inline">RIDE&apos;UP coache aussi le wing, le foil, le surf et le wake</span>
      <span className="sm:hidden">Wing, foil, surf et wake</span>
      <span aria-hidden="true" className="transition-transform group-hover:translate-x-0.5">→</span>
    </Link>
  );

  return (
    <HeaderBar announce={announce}>
      <div className="pl-1">
        <Logo height={28} />
      </div>

      <HeaderNav links={SITE_LINKS} />

      <div className="flex items-center gap-1.5">
        {session ? (
          <Link href="/dashboard" className="btn btn-primary !min-h-10 !rounded-full !px-5 !py-2 !text-sm">
            Mon espace
          </Link>
        ) : (
          <>
            <Link
              href="/connexion"
              className="whitespace-nowrap rounded-full px-3 py-2 text-[0.92rem] font-semibold text-deep transition-colors hover:bg-deep/[0.05] hover:text-brand"
            >
              Se connecter
            </Link>
            <Link
              href="/inscription"
              className="btn btn-primary hidden !min-h-10 !rounded-full !px-5 !py-2 !text-sm sm:inline-flex"
            >
              Essayer gratuitement
            </Link>
          </>
        )}
        <MobileMenu links={SITE_LINKS} loggedIn={Boolean(session)} />
      </div>
    </HeaderBar>
  );
}
