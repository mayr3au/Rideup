"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

const ICONS = {
  video: <path d="M3 6h12v12H3zM15 10l6-3v10l-6-3z" />,
  roadmap: (
    <>
      <circle cx="6" cy="18" r="2" />
      <circle cx="18" cy="6" r="2" />
      <path d="M8 18h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7" />
    </>
  ),
  questions: <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />,
};

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

/**
 * Un seul espace « Coach » : la vidéo analysée par un vrai coach, le coach IA disponible 24 h/24
 * et la roadmap de figures. Mêmes onglets en haut de chaque page.
 */
export function CoachTabs() {
  const path = usePathname();
  const chat = useSearchParams().get("vue") === "chat";
  const onVideo = path.startsWith("/analyse") || path.startsWith("/historique");
  const onChat = path === "/coach" && chat;
  const onRoadmap = path === "/coach" && !chat;

  const tab = (on: boolean) =>
    `flex flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-xl px-1.5 py-2.5 text-sm font-semibold transition-colors ${on ? "bg-white text-deep shadow" : "text-slate hover:text-deep"}`;

  return (
    <nav aria-label="Coach" className="mx-auto mb-6 flex max-w-xl gap-1 rounded-2xl bg-raised p-1">
      <Link href="/analyse" className={tab(onVideo)} aria-current={onVideo ? "page" : undefined}>
        <span className={onVideo ? "text-brand" : ""}><Icon name="video" /></span>
        <span>Vidéo<span className="hidden sm:inline"> · vrai coach</span></span>
      </Link>
      <Link href="/coach?vue=chat" className={tab(onChat)} aria-current={onChat ? "page" : undefined}>
        <span className={onChat ? "text-brand" : "text-brand/80"}><Icon name="questions" /></span>
        Coach IA
        <span className="rounded-full bg-emerald-500 px-1.5 py-0.5 text-[0.65rem] font-bold leading-none text-white">24/7</span>
      </Link>
      <Link href="/coach" className={tab(onRoadmap)} aria-current={onRoadmap ? "page" : undefined}>
        <span className={onRoadmap ? "text-brand" : ""}><Icon name="roadmap" /></span>
        Roadmap
      </Link>
    </nav>
  );
}
