import Link from "next/link";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-line">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-[2fr_1fr_1fr] sm:px-6">
        <div className="max-w-sm">
          <Logo />
          <p className="mt-3 text-slate">
            Coaching kitesurf en ligne : analyse vidéo de tes figures, roadmap de progression et coach disponible à
            toute heure.
          </p>
        </div>
        <div>
          <p className="font-semibold">Plateforme</p>
          <ul className="mt-3 space-y-2 text-slate">
            <li><Link href="/tarifs" className="hover:text-deep">Tarifs</Link></li>
            <li><Link href="/inscription" className="hover:text-deep">Créer un compte</Link></li>
            <li><Link href="/connexion" className="hover:text-deep">Connexion</Link></li>
          </ul>
        </div>
        <div>
          <p className="font-semibold">Légal</p>
          <ul className="mt-3 space-y-2 text-slate">
            <li><Link href="/mentions-legales" className="hover:text-deep">Mentions légales</Link></li>
            <li><Link href="/cgu" className="hover:text-deep">CGU</Link></li>
            <li><Link href="/confidentialite" className="hover:text-deep">Confidentialité</Link></li>
            <li><Link href="/cookies" className="hover:text-deep">Cookies</Link></li>
          </ul>
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-8 text-sm text-slate sm:px-6">© {new Date().getFullYear()} RIDE&apos;UP</p>
    </footer>
  );
}
