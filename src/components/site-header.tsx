import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Logo } from "./logo";
import { MobileMenu } from "./mobile-menu";

export const SITE_LINKS = [
  { href: "/#analyse", label: "Analyse vidéo" },
  { href: "/#spots", label: "Spot Finder" },
  { href: "/cours", label: "Cours" },
  { href: "/week-end", label: "Week-end" },
  { href: "/tarifs", label: "Tarifs" },
];

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="sticky top-0 z-40 bg-salt/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
        <Logo height={30} />

        <nav className="hidden items-center gap-7 text-[0.95rem] font-semibold lg:flex" aria-label="Navigation principale">
          {SITE_LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-deep/80 hover:text-brand">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <Link href="/dashboard" className="btn btn-primary !min-h-10 !rounded-xl !px-4 !py-2 !text-sm">
              Mon espace
            </Link>
          ) : (
            <>
              <Link href="/connexion" className="hidden px-3 text-[0.95rem] font-semibold text-deep/80 hover:text-brand sm:inline">
                Connexion
              </Link>
              <Link href="/inscription" className="btn btn-primary !min-h-10 !rounded-xl !px-4 !py-2 !text-sm">
                Essai gratuit
              </Link>
            </>
          )}
          <MobileMenu links={SITE_LINKS} loggedIn={Boolean(session)} />
        </div>
      </div>
    </header>
  );
}
