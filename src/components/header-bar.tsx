"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

function useScrolled(threshold = 12) {
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > threshold);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);
  return scrolled;
}

/**
 * En-tête flottant du site, façon appli : une capsule givrée détachée du bord,
 * qui se resserre légèrement quand on défile. L'annonce s'affiche dessous, en haut de page seulement.
 */
export function HeaderBar({ children, announce }: { children: React.ReactNode; announce?: React.ReactNode }) {
  const scrolled = useScrolled();

  return (
    <header className="pointer-events-none fixed inset-x-0 top-0 z-40 px-3 pt-[max(0.75rem,env(safe-area-inset-top))] sm:px-5">
      <div
        className={`pointer-events-auto mx-auto flex items-center justify-between gap-3 rounded-[1.4rem] border px-3 transition-all duration-300 ease-out sm:px-4 ${
          scrolled
            ? "h-14 max-w-5xl border-white/70 bg-white/85 backdrop-blur-2xl backdrop-saturate-150 shadow-[0_12px_40px_-12px_rgba(14,42,71,0.35)]"
            : "h-16 max-w-6xl border-white/70 bg-white/75 backdrop-blur-xl shadow-[0_10px_34px_-18px_rgba(14,42,71,0.30)]"
        }`}
      >
        {children}
      </div>
      {announce && (
        <div
          className={`mx-auto mt-2.5 flex justify-center transition-all duration-300 ${
            scrolled ? "pointer-events-none -translate-y-2 opacity-0" : "pointer-events-auto opacity-100"
          }`}
          aria-hidden={scrolled}
        >
          {announce}
        </div>
      )}
    </header>
  );
}

/** Liens du menu : la page en cours est surlignée par une pastille, comme un onglet d'appli. */
export function HeaderNav({ links }: { links: { href: string; label: string }[] }) {
  const path = usePathname();
  return (
    <nav className="hidden items-center gap-1 rounded-full bg-deep/[0.04] p-1 lg:flex" aria-label="Navigation principale">
      {links.map((l) => {
        const active = !l.href.includes("#") && (path === l.href || path.startsWith(`${l.href}/`));
        return (
          <Link
            key={l.href}
            href={l.href}
            aria-current={active ? "page" : undefined}
            className={`rounded-full px-4 py-2 text-[0.92rem] font-semibold transition-all duration-200 ${
              active ? "bg-white text-brand shadow-[0_2px_10px_-2px_rgba(14,42,71,0.18)]" : "text-deep/75 hover:bg-white/70 hover:text-deep"
            }`}
          >
            {l.label}
          </Link>
        );
      })}
    </nav>
  );
}
