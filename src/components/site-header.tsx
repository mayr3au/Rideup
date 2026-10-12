import Link from "next/link";
import { getSession } from "@/lib/auth";
import { Logo } from "./logo";

export async function SiteHeader() {
  const session = await getSession();

  return (
    <header className="border-b border-line">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <Logo />
        <nav className="flex items-center gap-1 text-[0.95rem] sm:gap-5">
          <Link href="/#analyse" className="hidden hover:text-lagoon md:inline">
            Analyse vidéo
          </Link>
          <Link href="/cours" className="hidden hover:text-lagoon md:inline">
            Cours
          </Link>
          <Link href="/week-end" className="hidden hover:text-lagoon md:inline">
            Week-end
          </Link>
          <Link href="/tarifs" className="px-2 hover:text-lagoon">
            Tarifs
          </Link>
          {session ? (
            <Link href="/dashboard" className="btn btn-primary !py-2.5">
              Mon espace
            </Link>
          ) : (
            <>
              <Link href="/connexion" className="px-2 hover:text-lagoon">
                Connexion
              </Link>
              <Link href="/inscription" className="btn btn-primary hidden !py-2.5 sm:inline-flex">
                Essayer gratuitement
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
