"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./logo";

/** Menu plein écran du site public sur téléphone. */
export function MobileMenu({ links, loggedIn }: { links: { href: string; label: string }[]; loggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();

  useEffect(() => setOpen(false), [path]);
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="menu-mobile"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="-mr-2 flex h-11 w-11 items-center justify-center lg:hidden"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>

      {open && (
        <div id="menu-mobile" className="fixed inset-0 z-50 overflow-y-auto bg-salt px-5 pb-10 text-deep lg:hidden">
          <div className="flex h-16 items-center justify-between">
            <Logo height={30} />
            <button onClick={() => setOpen(false)} aria-label="Fermer le menu" className="-mr-2 flex h-11 w-11 items-center justify-center">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>
            </button>
          </div>
          <nav aria-label="Menu" className="mt-2">
            <ul className="divide-y divide-line border-b border-line">
              {links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} onClick={() => setOpen(false)} className="block py-4 text-2xl font-bold">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-8 grid gap-3">
            {loggedIn ? (
              <Link href="/dashboard" className="btn btn-primary w-full">Mon espace</Link>
            ) : (
              <>
                <Link href="/inscription" className="btn btn-primary w-full">Essayer gratuitement</Link>
                <Link href="/connexion" className="btn btn-ghost w-full">Se connecter</Link>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
