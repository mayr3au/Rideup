"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

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
    `flex-1 rounded-xl px-2 py-2.5 text-center text-sm font-semibold transition-colors ${on ? "bg-white text-deep shadow" : "text-slate hover:text-deep"} ${extra}`;

  return (
    <nav aria-label="Coach" className="mx-auto mb-6 flex max-w-lg gap-1 rounded-2xl bg-raised p-1">
      <Link href="/analyse" className={tab(onVideo)} aria-current={onVideo ? "page" : undefined}>
        Vidéo
      </Link>
      <Link href="/coach" className={tab(onCoach && !chat, onCoach && chat ? "lg:bg-white lg:text-deep lg:shadow" : "")} aria-current={onCoach && !chat ? "page" : undefined}>
        Roadmap<span className="hidden lg:inline"> et questions</span>
      </Link>
      <Link href="/coach?vue=chat" className={tab(onCoach && chat, "lg:hidden")} aria-current={onCoach && chat ? "page" : undefined}>
        Questions
      </Link>
    </nav>
  );
}
