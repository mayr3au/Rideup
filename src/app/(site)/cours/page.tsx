import type { Metadata } from "next";
import Link from "next/link";
import { COURSES } from "@/lib/courses";

export const metadata: Metadata = {
  title: "Cours de kitesurf",
  description: "Cours de kitesurf en ligne figure par figure : water start, premier saut, backroll, kiteloop, raley.",
};

export default function CoursesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="text-5xl font-extrabold">Cours de kitesurf</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate">
        Les étapes, les erreurs courantes et les exercices pour chaque figure. Lis le cours, va sur l&apos;eau, puis fais
        analyser ta tentative.
      </p>
      <ul className="mt-10 divide-y divide-line border-y border-line">
        {COURSES.map((c) => (
          <li key={c.slug}>
            <Link href={`/cours/${c.slug}`} className="flex items-center justify-between gap-4 py-5 hover:text-lagoon">
              <span>
                <span className="block font-display text-2xl font-bold">{c.title}</span>
                <span className="text-slate">{c.intro}</span>
              </span>
              <span className="shrink-0 text-right text-sm text-slate">
                {c.level}
                <br />
                {c.minutes} min
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
