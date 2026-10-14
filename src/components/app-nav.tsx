"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Item = { href: string; label: string; short?: string; icon: React.ReactNode };

const I = {
  home: <path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  video: <path d="M3 6h12v12H3zM15 10l6-3v10l-6-3z" />,
  coach: <path d="M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  map: <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />,
  more: <path d="M4 7h16M4 12h16M4 17h16" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
};

function Icon({ children, size = 24 }: { children: React.ReactNode; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

/** Les cinq fonctions principales, à portée de pouce sur téléphone. */
const MAIN: Item[] = [
  { href: "/dashboard", label: "Accueil", icon: <Icon>{I.home}</Icon> },
  { href: "/coach", label: "Coach", icon: <Icon>{I.coach}</Icon> },
  { href: "/analyse", label: "Analyser", icon: <Icon>{I.video}</Icon> },
  { href: "/progression", label: "Progression", short: "Progrès", icon: <Icon>{I.chart}</Icon> },
  { href: "/spots", label: "Spots", icon: <Icon>{I.map}</Icon> },
];

const SECONDARY = [
  { href: "/historique", label: "Historique des analyses" },
  { href: "/cours", label: "Cours" },
  { href: "/week-end", label: "Spots du week-end" },
  { href: "/profil", label: "Mon profil rider" },
  { href: "/compte", label: "Abonnement et compte" },
];

export function AppNav({ isAdmin, planLabel }: { isAdmin: boolean; planLabel: string }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const secondary = isAdmin ? [...SECONDARY, { href: "/admin", label: "Administration" }] : SECONDARY;
  const active = (href: string) => path === href || path.startsWith(href + "/");

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      {/* Bureau : tout dans l'en-tête */}
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
        {MAIN.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active(l.href) ? "page" : undefined}
            className={`whitespace-nowrap rounded-xl px-3.5 py-2 text-[0.95rem] font-medium ${active(l.href) ? "bg-brand text-white" : "hover:bg-raised"}`}
          >
            {l.label}
          </Link>
        ))}
        <details className="relative">
          <summary className="cursor-pointer list-none rounded-xl px-3.5 py-2 text-[0.95rem] font-medium hover:bg-raised">Plus</summary>
          <div className="panel absolute right-0 z-50 mt-2 w-60 p-2">
            {secondary.map((l) => (
              <Link key={l.href} href={l.href} className="block rounded-lg px-3 py-2 hover:bg-salt">
                {l.label}
              </Link>
            ))}
          </div>
        </details>
      </nav>

      {/* À droite : formule, déconnexion (bureau) et bouton menu (téléphone) */}
      <div className="flex items-center gap-2 sm:gap-3">
        <Link href="/compte" className="rounded-full bg-brand-light px-3 py-1 text-sm font-semibold text-lagoon">
          {planLabel}
        </Link>
        <form action="/auth/deconnexion" method="post" className="hidden lg:block">
          <button className="text-sm text-slate hover:text-deep">Déconnexion</button>
        </form>
        <button
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
          className="-mr-2 flex h-11 w-11 items-center justify-center rounded-xl hover:bg-raised lg:hidden"
        >
          <Icon>{open ? I.close : I.more}</Icon>
        </button>
      </div>

      {/* … et barre d'onglets en bas */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-spray/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        aria-label="Navigation principale"
      >
        <ul className="grid grid-cols-5">
          {MAIN.map((l) =>
            l.href === "/analyse" ? (
              /* Action principale : bouton rond surélevé au centre */
              <li key={l.href} className="relative">
                <Link
                  href={l.href}
                  aria-current={active(l.href) ? "page" : undefined}
                  className="flex flex-col items-center gap-0.5 pb-2 pt-1 text-[0.72rem] font-semibold text-lagoon"
                >
                  <span
                    aria-hidden="true"
                    className={`-mt-6 flex h-14 w-14 items-center justify-center rounded-full text-white shadow-[0_12px_24px_-8px_rgba(22,136,200,0.8)] ring-4 ring-spray transition-transform active:scale-95 ${active(l.href) ? "bg-lagoon-dark" : "bg-brand"}`}
                  >
                    <Icon size={26}>{I.video}</Icon>
                  </span>
                  {l.label}
                </Link>
              </li>
            ) : (
              <li key={l.href}>
                <Link
                  href={l.href}
                  aria-current={active(l.href) ? "page" : undefined}
                  className={`flex flex-col items-center gap-0.5 py-2 text-[0.72rem] font-medium ${active(l.href) ? "text-lagoon" : "text-slate"}`}
                >
                  {l.icon}
                  {l.short ?? l.label}
                </Link>
              </li>
            ),
          )}
        </ul>
      </nav>

      {open && (
        <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] rounded-t-3xl bg-spray p-3 pb-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <p className="px-4 pb-2 pt-1 text-sm font-semibold text-slate">Plus</p>
            {secondary.map((l) => (
              <Link key={l.href} href={l.href} className={`block rounded-xl px-4 py-3.5 text-lg ${active(l.href) ? "bg-salt font-semibold" : ""}`}>
                {l.label}
              </Link>
            ))}
            <form action="/auth/deconnexion" method="post" className="mt-1 border-t border-line pt-1">
              <button className="block w-full rounded-xl px-4 py-3.5 text-left text-lg text-slate">Se déconnecter</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
