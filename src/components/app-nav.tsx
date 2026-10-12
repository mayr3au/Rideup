"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type Item = { href: string; label: string; icon: React.ReactNode };

const I = {
  home: <path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" />,
  video: <path d="M3 6h12v12H3zM15 10l6-3v10l-6-3z" />,
  chart: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  map: <path d="M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />,
  more: <path d="M4 7h16M4 12h16M4 17h16" />,
};

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {children}
    </svg>
  );
}

const MAIN: Item[] = [
  { href: "/dashboard", label: "Accueil", icon: <Icon>{I.home}</Icon> },
  { href: "/analyse", label: "Analyser", icon: <Icon>{I.video}</Icon> },
  { href: "/progression", label: "Progrès", icon: <Icon>{I.chart}</Icon> },
  { href: "/spots", label: "Spots", icon: <Icon>{I.map}</Icon> },
];

const SECONDARY = [
  { href: "/coach", label: "Coach et roadmap" },
  { href: "/historique", label: "Historique" },
  { href: "/cours", label: "Cours" },
  { href: "/week-end", label: "Spots du week-end" },
  { href: "/profil", label: "Profil" },
  { href: "/compte", label: "Abonnement" },
];

export function AppNav({ isAdmin }: { isAdmin: boolean }) {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  const secondary = isAdmin ? [...SECONDARY, { href: "/admin", label: "Administration" }] : SECONDARY;
  const active = (href: string) => path === href || path.startsWith(href + "/");

  useEffect(() => setOpen(false), [path]);

  return (
    <>
      {/* Bureau */}
      <nav className="hidden items-center gap-1 lg:flex" aria-label="Navigation principale">
        {[...MAIN, ...secondary.slice(0, 2)].map((l) => (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active(l.href) ? "page" : undefined}
            className={`whitespace-nowrap rounded-sm px-3.5 py-2 text-[0.95rem] font-medium ${active(l.href) ? "bg-brand text-white" : "hover:bg-raised"}`}
          >
            {"icon" in l && l.label === "Progrès" ? "Progression" : l.label}
          </Link>
        ))}
        <details className="relative">
          <summary className="cursor-pointer list-none rounded-sm px-3.5 py-2 text-[0.95rem] font-medium hover:bg-raised">Plus</summary>
          <div className="panel absolute right-0 z-50 mt-2 w-56 p-2">
            {secondary.slice(2).map((l) => (
              <Link key={l.href} href={l.href} className="block rounded-lg px-3 py-2 hover:bg-salt">
                {l.label}
              </Link>
            ))}
          </div>
        </details>
      </nav>

      {/* Mobile : barre d'onglets en bas, à portée de pouce */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-spray/95 pb-[env(safe-area-inset-bottom)] backdrop-blur lg:hidden"
        aria-label="Navigation principale"
      >
        <ul className="grid grid-cols-5">
          {MAIN.map((l) => (
            <li key={l.href}>
              <Link
                href={l.href}
                aria-current={active(l.href) ? "page" : undefined}
                className={`flex flex-col items-center gap-0.5 py-2 text-[0.72rem] font-medium ${active(l.href) ? "text-lagoon" : "text-slate"}`}
              >
                {l.icon}
                {l.label}
              </Link>
            </li>
          ))}
          <li>
            <button
              onClick={() => setOpen((o) => !o)}
              aria-expanded={open}
              className={`flex w-full flex-col items-center gap-0.5 py-2 text-[0.72rem] font-medium ${open ? "text-lagoon" : "text-slate"}`}
            >
              <Icon>{I.more}</Icon>
              Plus
            </button>
          </li>
        </ul>
      </nav>
      {open && (
        <div className="fixed inset-0 z-30 bg-black/70 lg:hidden" onClick={() => setOpen(false)}>
          <div className="absolute inset-x-0 bottom-[calc(64px+env(safe-area-inset-bottom))] rounded-t-lg bg-spray p-3" onClick={(e) => e.stopPropagation()}>
            {secondary.map((l) => (
              <Link key={l.href} href={l.href} className={`block rounded-md px-4 py-3.5 text-lg ${active(l.href) ? "bg-salt font-semibold" : ""}`}>
                {l.label}
              </Link>
            ))}
            <form action="/auth/deconnexion" method="post">
              <button className="block w-full rounded-md px-4 py-3.5 text-left text-lg text-slate">Se déconnecter</button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
