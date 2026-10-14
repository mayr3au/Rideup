import type { Metadata } from "next";
import Link from "next/link";
import { COURSES, courseSport } from "@/lib/courses";
import { SPORT_IDS, SPORTS } from "@/lib/sports";

export const metadata: Metadata = {
  title: "Cours de glisse",
  description: "Cours en ligne figure par figure en kitesurf, wingfoil, foil, surf et wakeboard : étapes, erreurs courantes, exercices.",
};

export default function CoursesPage() {
  const groups = SPORT_IDS.map((sport) => ({ sport, list: COURSES.filter((c) => courseSport(c) === sport) })).filter((g) => g.list.length);

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-14">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Cours</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate">
        Les étapes, les erreurs courantes et les exercices pour chaque figure. Lis le cours, va sur l&apos;eau, puis fais
        analyser ta tentative.
      </p>

      <nav className="-mx-5 mt-6 flex gap-2 overflow-x-auto px-5 pb-1" aria-label="Sports">
        {groups.map((g) => (
          <a key={g.sport} href={`#${g.sport}`} className="min-h-10 whitespace-nowrap rounded-full bg-raised px-4 py-2 text-[0.95rem] font-semibold">
            {SPORTS[g.sport].name}
          </a>
        ))}
      </nav>

      {groups.map((g) => (
        <section key={g.sport} id={g.sport} className="mt-10 scroll-mt-24">
          <h2 className="text-2xl font-bold">{SPORTS[g.sport].name}</h2>
          <ul className="mt-3 space-y-3">
            {g.list.map((c) => (
              <li key={c.slug}>
                <Link href={`/cours/${c.slug}`} className="panel block p-4 hover:ring-2 hover:ring-brand">
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-lg font-bold">{c.title}</span>
                    <span className="shrink-0 rounded-full bg-raised px-2.5 py-1 text-xs font-semibold text-slate">{c.level} · {c.minutes} min</span>
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
