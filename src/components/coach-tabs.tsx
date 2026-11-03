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
  questions: <path d="M4 5h16v11H9l-5 4zM9.5 9a2.5 2.5 0 1 1 3.3 2.4c-.5.2-.8.6-.8 1.1M12 14.5v.01" />,
};

function Icon({ name }: { name: keyof typeof ICONS }) {
  return (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px] shrink-0" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      {ICONS[name]}
    </svg>
  );
}

/**
 * Un seul espace « Coach » : la vidéo analysée par un vrai coach, la roadmap de figures
 * et les questions rapides (réponses instantanées). Mêmes onglets en haut de chaque page.
 */
export function CoachTabs() {
  const path = usePathname();
  const chat = useSearchParams().get("vue") === "chat";
  const onVideo = path.startsWith("/analyse") || path.startsWith("/historique");
  const onCoach = path === "/coach";

  const tab = (on: boolean, extra = "") =>
    `flex flex-1 items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 text-sm font-semibold transition-colors ${on ? "bg-white text-deep shadow" : "text-slate hover:text-deep"} ${extra}`;

  return (
    <nav aria-label="Coach" className="mx-auto mb-6 flex max-w-lg gap-1 rounded-2xl bg-raised p-1">
      <Link href="/analyse" className={tab(onVideo)} aria-current={onVideo ? "page" : undefined}>
        <span className={onVideo ? "text-brand" : ""}><Icon name="video" /></span>
        Vidéo
      </Link>
      <Link
        href="/coach"
        className={tab(onCoach && !chat, onCoach && chat ? "lg:bg-white lg:text-deep lg:shadow" : "")}
        aria-current={onCoach && !chat ? "page" : undefined}
      >
        <span className={onCoach ? (chat ? "lg:text-brand" : "text-brand") : ""}><Icon name="roadmap" /></span>
        Roadmap<span className="hidden lg:inline"> et questions</span>
      </Link>
      <Link href="/coach?vue=chat" className={tab(onCoach && chat, "lg:hidden")} aria-current={onCoach && chat ? "page" : undefined}>
        <span className={onCoach && chat ? "text-brand" : ""}><Icon name="questions" /></span>
        Questions
      </Link>
    </nav>
  );
}
