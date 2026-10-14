"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

/**
 * En-tête du site : transparent par-dessus la photo d'accueil, puis verre dépoli dès qu'on défile
 * (et sur toutes les autres pages). Les enfants s'adaptent via `group-data-[solid=false]:…`.
 */
export function HeaderBar({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const overlay = path === "/" && !scrolled;

  return (
    <header
      data-solid={overlay ? "false" : "true"}
      className={`group fixed inset-x-0 top-0 z-40 transition-[background-color,box-shadow] duration-300 ${
        overlay ? "bg-transparent text-white" : "border-b border-line/60 bg-salt/80 text-deep backdrop-blur-xl"
      }`}
    >
      {children}
    </header>
  );
}
