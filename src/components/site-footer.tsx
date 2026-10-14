import Link from "next/link";
import { Logo } from "./logo";

const COLS = [
  {
    title: "Plateforme",
    links: [
      ["/tarifs", "Abonnements"],
      ["/cours", "Cours"],
      ["/week-end", "Spots du week-end"],
      ["/inscription", "Créer un compte"],
      ["/connexion", "Connexion"],
    ],
  },
  {
    title: "Légal",
    links: [
      ["/mentions-legales", "Mentions légales"],
      ["/cgu", "CGU"],
      ["/confidentialite", "Confidentialité"],
      ["/cookies", "Cookies"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-line bg-spray">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 sm:grid-cols-[2fr_1fr_1fr] sm:px-6">
        <div className="max-w-sm">
          <Logo height={64} />
          <p className="mt-4 text-slate">
            Coaching de glisse par IA (kitesurf, wingfoil, foil, surf, wakeboard) : analyse vidéo de tes figures, suivi de progression et Spot Finder selon le vent et la houle,
            ton niveau et ton matériel.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 sm:col-span-2">
          {COLS.map((c) => (
            <div key={c.title}>
              <p className="font-bold">{c.title}</p>
              <ul className="mt-2 text-slate">
                {c.links.map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className="block py-1.5 hover:text-deep">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
      <p className="mx-auto max-w-6xl px-4 pb-8 text-sm text-slate sm:px-6">© {new Date().getFullYear()} RIDE&apos;UP · Progress your ride</p>
    </footer>
  );
}
