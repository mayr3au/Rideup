"use client";

import { useEffect, useState } from "react";

/** En-tête fixe du site : blanc, avec une ombre légère dès qu'on défile. */
export function HeaderBar({ children }: { children: React.ReactNode }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header className={`fixed inset-x-0 top-0 z-40 bg-white/90 backdrop-blur-xl transition-shadow ${scrolled ? "shadow-[0_1px_0_var(--line),0_10px_30px_-20px_rgba(14,42,71,0.35)]" : ""}`}>
      {children}
    </header>
  );
}
