import Link from "next/link";
import { getSession } from "@/lib/auth";
import { HeaderBar } from "./header-bar";
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

  return (
    <HeaderBar>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5 sm:px-6">
        <span className="group-data-[solid=false]:hidden"><Logo height={30} /></span>
        <span className="hidden group-data-[solid=false]:block"><Logo height={30} light /></span>

        <nav className="hidden items-center gap-7 text-[0.95rem] font-semibold lg:flex" aria-label="Navigation principale">
          {SITE_LINKS.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className="text-deep/80 transition-colors hover:text-brand group-data-[solid=false]:text-white/85 group-data-[solid=false]:hover:text-white"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {session ? (
            <Link href="/dashboard" className="btn btn-primary !min-h-10 !rounded-xl !px-4 !py-2 !text-sm group-data-[solid=false]:!bg-white group-data-[solid=false]:!text-deep group-data-[solid=false]:!shadow-none">
              Mon espace
            </Link>
          ) : (
            <>
              <Link
                href="/connexion"
                className="whitespace-nowrap px-2 text-[0.95rem] font-semibold text-deep hover:text-brand group-data-[solid=false]:text-white/90 group-data-[solid=false]:hover:text-white"
              >
                Se connecter
              </Link>
              <Link
                href="/inscription"
                className="btn btn-primary hidden !min-h-10 !rounded-xl !px-4 !py-2 !text-sm group-data-[solid=false]:!bg-white group-data-[solid=false]:!text-deep group-data-[solid=false]:!shadow-none sm:inline-flex"
              >
                Essayer gratuitement
              </Link>
            </>
          )}
          <MobileMenu links={SITE_LINKS} loggedIn={Boolean(session)} />
        </div>
      </div>
    </HeaderBar>
  );
}
