"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { Logo } from "./logo";
import { Portal, useEscape, useScrollLock } from "./portal";

/** Menu plein écran du site public sur téléphone. */
export function MobileMenu({ links, loggedIn }: { links: { href: string; label: string }[]; loggedIn: boolean }) {
  const [open, setOpen] = useState(false);
  const path = usePathname();
  const first = useRef<HTMLAnchorElement>(null);
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => setOpen(false), [path]);
  useScrollLock(open);
  useEscape(open, close);
  useEffect(() => {
    if (open) first.current?.focus({ preventScroll: true });
  }, [open]);

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="menu-mobile"
        aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
        className="flex h-10 w-10 items-center justify-center rounded-full bg-deep/[0.05] active:bg-deep/10 lg:hidden"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>

      {open && (
        <Portal>
          <div className="fixed inset-0 z-[60] lg:hidden" role="dialog" aria-modal="true" aria-label="Menu">
            <button type="button" aria-label="Fermer le menu" onClick={close} className="fade-in absolute inset-0 bg-deep/40" />
            <div
              id="menu-mobile"
              className="slide-in-right absolute inset-y-0 right-0 flex w-[min(88vw,380px)] flex-col overflow-y-auto overscroll-contain bg-white px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[env(safe-area-inset-top)] text-deep shadow-2xl"
            >
              <div className="flex h-16 items-center justify-between">
                <Logo height={28} />
                <button onClick={close} aria-label="Fermer le menu" className="-mr-2 flex h-11 w-11 items-center justify-center rounded-xl active:bg-raised">
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
              <nav aria-label="Menu" className="mt-2">
                <ul className="divide-y divide-line border-b border-line">
                  {links.map((l, i) => (
                    <li key={l.href}>
                      <Link
                        ref={i === 0 ? first : undefined}
                        href={l.href}
                        onClick={close}
                        className="-mx-2 block rounded-xl px-2 py-4 text-[1.35rem] font-bold active:bg-salt"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
              <div className="mt-auto grid gap-3 pt-8">
                {loggedIn ? (
                  <Link href="/dashboard" onClick={close} className="btn btn-primary w-full">
                    Mon espace
                  </Link>
                ) : (
                  <>
                    <Link href="/inscription" onClick={close} className="btn btn-primary w-full">
                      Essayer gratuitement
                    </Link>
                    <Link href="/connexion" onClick={close} className="btn btn-ghost w-full">
                      Se connecter
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </Portal>
      )}
    </>
  );
}
