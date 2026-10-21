import type { Metadata } from "next";
import Link from "next/link";
import { Schema } from "@/components/schemas";
import { COURSES, courseSport } from "@/lib/courses";
import { LESSONS, LESSON_CATEGORIES } from "@/lib/lessons";
import { SPORT_IDS, SPORTS } from "@/lib/sports";

export const metadata: Metadata = {
  title: "Cours de glisse",
  description:
    "Cours en ligne gratuits : fenêtre de vent, lecture du vent, sécurité, self-rescue, priorités, courants, et chaque figure étape par étape en kitesurf, wingfoil, foil, surf et wakeboard.",
};

function sportsLabel(ids: typeof SPORT_IDS | readonly string[]) {
  if (!ids.length) return "Tous sports";
  return ids.map((id) => SPORTS[id as keyof typeof SPORTS].name).join(" · ");
}

export default function CoursesPage() {
  const groups = SPORT_IDS.map((sport) => ({ sport, list: COURSES.filter((c) => courseSport(c) === sport) })).filter((g) => g.list.length);
  const total = LESSONS.length + COURSES.length;

  return (
    <div className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
      <p className="eyebrow">Cours</p>
      <h1 className="mt-2 text-4xl font-extrabold sm:text-6xl">
        Comprendre, puis <em className="italic text-brand">rider</em>.
      </h1>
      <p className="mt-3 max-w-2xl text-lg text-slate">
        {total} cours gratuits avec schémas : d&apos;abord le vent et la sécurité, ensuite chaque figure étape par étape. Lis, va sur
        l&apos;eau, puis fais analyser ta tentative.
      </p>

      <nav className="scroll-x -mx-5 mt-6 flex gap-2 px-5 pb-1" aria-label="Sections">
        {LESSON_CATEGORIES.map((c) => (
          <a key={c.id} href={`#${c.id}`} className="min-h-10 whitespace-nowrap rounded-full bg-brand px-4 py-2 text-[0.95rem] font-semibold text-white">
            {c.title}
          </a>
        ))}
        {groups.map((g) => (
          <a key={g.sport} href={`#${g.sport}`} className="min-h-10 whitespace-nowrap rounded-full bg-raised px-4 py-2 text-[0.95rem] font-semibold">
            {SPORTS[g.sport].name}
          </a>
        ))}
      </nav>

      {LESSON_CATEGORIES.map((cat) => {
        const list = LESSONS.filter((l) => l.category === cat.id);
        return (
          <section key={cat.id} id={cat.id} className="mt-12 scroll-mt-24">
            <div className="flex items-end justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold sm:text-3xl">{cat.title}</h2>
                <p className="mt-1 text-slate">{cat.text}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-slate">{list.length} cours</span>
            </div>
            <ul className="mt-5 grid gap-4 sm:grid-cols-2">
              {list.map((l) => (
                <li key={l.slug}>
                  <Link href={`/cours/${l.slug}`} className="panel lift group flex h-full flex-col overflow-hidden transition-shadow hover:ring-2 hover:ring-brand">
                    <div className="bg-salt px-4 pt-4">
                      <div className="pointer-events-none -mb-2 origin-bottom scale-[0.96] transition-transform group-hover:scale-100" aria-hidden="true">
                        <Schema id={l.schema} compact />
                      </div>
                    </div>
                    <div className="flex flex-1 flex-col p-4">
                      <span className="flex items-center justify-between gap-3">
                        <span className="text-lg font-bold leading-tight">{l.title}</span>
                        <span className="shrink-0 rounded-full bg-raised px-2.5 py-1 text-xs font-semibold text-slate">{l.minutes} min</span>
                      </span>
                      <span className="mt-1.5 line-clamp-2 text-[0.95rem] text-slate">{l.intro}</span>
                      <span className="mt-3 text-xs font-semibold uppercase tracking-wider text-lagoon">{sportsLabel(l.sports)}</span>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        );
      })}

      <section className="mt-14">
        <h2 className="text-2xl font-bold sm:text-3xl">Figure par figure</h2>
        <p className="mt-1 text-slate">Les étapes, les erreurs courantes et les exercices pour chaque figure de ta roadmap.</p>
      </section>

      {groups.map((g) => (
        <section key={g.sport} id={g.sport} className="mt-8 scroll-mt-24">
          <h3 className="text-xl font-bold">{SPORTS[g.sport].name}</h3>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {g.list.map((c) => (
              <li key={c.slug}>
                <Link href={`/cours/${c.slug}`} className="panel block h-full p-4 transition-shadow hover:ring-2 hover:ring-brand">
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-lg font-bold leading-tight">{c.title}</span>
                    <span className="shrink-0 rounded-full bg-raised px-2.5 py-1 text-xs font-semibold text-slate">
                      {c.level} · {c.minutes} min
                    </span>
                  </span>
                  <span className="mt-1 block text-[0.95rem] text-slate">{c.intro}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
