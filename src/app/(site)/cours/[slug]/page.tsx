import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Schema } from "@/components/schemas";
import type { Course } from "@/lib/course-types";
import { COURSES, courseBySlug, courseForTrick, courseSport } from "@/lib/courses";
import { LESSONS, LESSON_CATEGORIES, lessonBySlug, type Block, type Lesson } from "@/lib/lessons";
import { SPORTS, tricksFor } from "@/lib/sports";

export function generateStaticParams() {
  return [...LESSONS.map((l) => ({ slug: l.slug })), ...COURSES.map((c) => ({ slug: c.slug }))];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const l = lessonBySlug(slug);
  if (l) return { title: `${l.title} — cours RIDE'UP`, description: l.intro };
  const c = courseBySlug(slug);
  return c ? { title: `${c.title} — cours de ${SPORTS[courseSport(c)].name.toLowerCase()}`, description: c.intro } : {};
}

/* ───────────────────────── Leçon (blocs + schémas) ───────────────────────── */

function BlockView({ b }: { b: Block }) {
  switch (b.type) {
    case "p":
      return <p className="mt-4 text-[1.05rem] leading-relaxed">{b.text}</p>;
    case "h":
      return <h2 className="mt-10 text-2xl font-bold">{b.text}</h2>;
    case "list":
      return (
        <ul className="mt-4 space-y-2.5">
          {b.items.map((it) => (
            <li key={it} className="flex gap-3">
              <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
              <span>{it}</span>
            </li>
          ))}
        </ul>
      );
    case "steps":
      return (
        <ol className="mt-5 space-y-5">
          {b.items.map((e, i) => (
            <li key={e.titre} className="grid grid-cols-[2.5rem_1fr] gap-2">
              <span className="font-display text-3xl font-extrabold text-lagoon">{i + 1}</span>
              <div>
                <h3 className="text-lg font-bold">{e.titre}</h3>
                <p className="mt-1 text-slate">{e.texte}</p>
              </div>
            </li>
          ))}
        </ol>
      );
    case "schema":
      return (
        <div className="mt-6">
          <Schema id={b.id} caption={b.caption} />
        </div>
      );
    case "tip":
      return (
        <aside className="mt-6 rounded-2xl bg-brand-light p-4 sm:p-5">
          <p className="text-sm font-bold uppercase tracking-wider text-lagoon">Conseil</p>
          <p className="mt-1">{b.text}</p>
        </aside>
      );
    case "warning":
      return (
        <aside className="mt-6 rounded-2xl border-2 border-danger/50 bg-danger/5 p-4 sm:p-5">
          <p className="text-sm font-bold uppercase tracking-wider text-danger">Sécurité</p>
          <p className="mt-1">{b.text}</p>
        </aside>
      );
    case "quiz":
      return (
        <section className="mt-10 rounded-2xl border border-line bg-spray p-4 sm:p-6">
          <h2 className="text-xl font-bold">Vérifie que tu as compris</h2>
          <p className="mt-1 text-sm text-slate">Réponds dans ta tête, puis déplie.</p>
          <div className="mt-4 divide-y divide-line">
            {b.items.map((q) => (
              <details key={q.q} className="group py-3">
                <summary className="flex cursor-pointer list-none items-start justify-between gap-3 font-semibold">
                  {q.q}
                  <span aria-hidden="true" className="mt-1 shrink-0 text-lagoon transition-transform group-open:rotate-90">
                    ›
                  </span>
                </summary>
                <p className="mt-2 text-slate">{q.a}</p>
              </details>
            ))}
          </div>
        </section>
      );
  }
}

function LessonView({ l }: { l: Lesson }) {
  const cat = LESSON_CATEGORIES.find((c) => c.id === l.category)!;
  const related = LESSONS.filter((x) => x.slug !== l.slug && (x.category === l.category || x.sports.some((s) => l.sports.includes(s)))).slice(0, 3);
  const sports = l.sports.length ? l.sports.map((s) => SPORTS[s].name).join(", ") : "Tous les sports";

  return (
    <article className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
      <Link href="/cours" className="text-lagoon hover:underline">
        ← Tous les cours
      </Link>
      <div className="mt-6 lg:grid lg:grid-cols-[1fr_17rem] lg:gap-12">
        <div className="min-w-0">
          <p className="eyebrow">
            {cat.title} · {l.level} · {l.minutes} min
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">{l.title}</h1>
          <p className="mt-4 text-lg text-slate">{l.intro}</p>
          <p className="mt-2 text-sm font-semibold text-lagoon">{sports}</p>

          {l.blocks.map((b, i) => (
            <BlockView key={i} b={b} />
          ))}

          <section className="mt-10 rounded-2xl bg-deep p-6 text-white lg:hidden">
            <h2 className="text-xl font-bold">À retenir</h2>
            <ul className="mt-3 space-y-2">
              {l.retenir.map((r) => (
                <li key={r} className="flex gap-2">
                  <span aria-hidden="true" className="text-brand">✓</span>
                  {r}
                </li>
              ))}
            </ul>
          </section>

          <div className="mt-10 rounded-2xl bg-brand p-6 text-white">
            {l.trickId ? (
              <>
                <h2 className="text-2xl font-bold">C&apos;est acquis ?</h2>
                <p className="mt-2 text-white/80">Valide cette étape dans ta roadmap et passe à la suivante avec ton coach.</p>
                <Link href="/coach" className="btn btn-kite mt-5">
                  Voir ma roadmap
                </Link>
              </>
            ) : (
              <>
                <h2 className="text-2xl font-bold">Prêt pour l&apos;eau ?</h2>
                <p className="mt-2 text-white/80">Le Spot Finder te dit où le vent est bon pour ton niveau cette semaine.</p>
                <Link href="/spots" className="btn btn-kite mt-5">
                  Trouver un spot
                </Link>
              </>
            )}
          </div>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-6">
            <section className="rounded-2xl bg-deep p-5 text-white">
              <h2 className="text-lg font-bold">À retenir</h2>
              <ul className="mt-3 space-y-2 text-[0.95rem]">
                {l.retenir.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span aria-hidden="true" className="text-brand">✓</span>
                    {r}
                  </li>
                ))}
              </ul>
            </section>
            {related.length > 0 && (
              <section>
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate">À lire ensuite</h2>
                <ul className="mt-2 space-y-1">
                  {related.map((r) => (
                    <li key={r.slug}>
                      <Link href={`/cours/${r.slug}`} className="block rounded-xl px-3 py-2 font-semibold text-lagoon hover:bg-salt">
                        {r.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-12 lg:hidden">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate">À lire ensuite</h2>
          <ul className="mt-3 grid gap-3">
            {related.map((r) => (
              <li key={r.slug}>
                <Link href={`/cours/${r.slug}`} className="panel block p-4 font-semibold text-lagoon">
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}

/* ───────────────────────── Cours de figure ───────────────────────── */

function CourseView({ c }: { c: Course }) {
  const sportId = courseSport(c);
  const sport = SPORTS[sportId];
  const tricks = tricksFor(sportId);
  const idx = tricks.findIndex((t) => t.id === c.trickId);
  const nextTrick = idx >= 0 ? tricks[idx + 1] : undefined;
  const nextCourse = nextTrick ? courseForTrick(nextTrick.id) : undefined;
  const prevTrick = idx > 0 ? tricks[idx - 1] : undefined;
  const prevCourse = prevTrick ? courseForTrick(prevTrick.id) : undefined;
  const lessons = LESSONS.filter((l) => !l.sports.length || l.sports.includes(sportId)).slice(0, 3);

  return (
    <article className="mx-auto max-w-5xl px-5 py-10 sm:px-6 sm:py-14">
      <Link href={`/cours#${sportId}`} className="text-lagoon hover:underline">
        ← Cours de {sport.name.toLowerCase()}
      </Link>
      <div className="mt-6 lg:grid lg:grid-cols-[1fr_17rem] lg:gap-12">
        <div className="min-w-0">
          <p className="eyebrow">
            {sport.name} · {c.level} · {c.minutes} min
          </p>
          <h1 className="mt-2 text-3xl font-extrabold sm:text-5xl">{c.title}</h1>
          <p className="mt-4 text-lg text-slate">{c.intro}</p>
          {c.conditions && (
            <p className="mt-3 inline-flex items-start gap-2 rounded-xl bg-brand-light px-3 py-2 text-[0.95rem] text-lagoon">
              <span aria-hidden="true">◎</span>
              <span>
                <span className="font-bold">Conditions idéales : </span>
                {c.conditions}
              </span>
            </p>
          )}

          {c.phases && c.phases.length > 0 && (
            <section className="mt-8">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate">Le repère de chaque phase</h2>
              <ol className="mt-3 grid gap-2 sm:grid-cols-4">
                {c.phases.map((p, i) => (
                  <li key={p.phase} className="rounded-2xl border border-line bg-spray p-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-lagoon">
                      {i + 1}. {sport.phases[p.phase]}
                    </p>
                    <p className="mt-1 text-[0.95rem] font-semibold leading-snug">{p.cle}</p>
                  </li>
                ))}
              </ol>
              <p className="mt-2 text-sm text-slate">Les quatre phases clés de la figure, dans l&apos;ordre.</p>
            </section>
          )}

          {c.schema && (
            <div className="mt-8">
              <Schema id={c.schema} />
            </div>
          )}

          <section className="mt-10">
            <h2 className="text-2xl font-bold">Avant de commencer</h2>
            <ul className="mt-3 space-y-1.5">
              {c.prerequis.map((p) => (
                <li key={p} className="flex gap-2">
                  <span aria-hidden="true" className="text-lagoon">✓</span>
                  {p}
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold">Étape par étape</h2>
            <ol className="mt-4 space-y-6">
              {c.etapes.map((e, i) => (
                <li key={e.titre} className="grid grid-cols-[2.5rem_1fr] gap-2">
                  <span className="font-display text-3xl font-extrabold text-lagoon">{i + 1}</span>
                  <div>
                    <h3 className="text-xl font-bold">{e.titre}</h3>
                    <p className="mt-1 text-slate">{e.texte}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold">Erreurs courantes</h2>
            <ul className="mt-4 space-y-4">
              {c.erreurs.map((e) => (
                <li key={e.erreur} className="border-l-4 border-kite pl-4">
                  <p className="font-semibold">{e.erreur}</p>
                  <p className="mt-1 text-slate">{e.correction}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h2 className="text-2xl font-bold">Exercices</h2>
            <ul className="mt-3 space-y-2.5">
              {c.exercices.map((x) => (
                <li key={x} className="flex gap-3">
                  <span aria-hidden="true" className="mt-2.5 h-2 w-2 shrink-0 rounded-full bg-brand" />
                  <span>{x}</span>
                </li>
              ))}
            </ul>
          </section>

          {c.filmer && (
            <aside className="mt-8 rounded-2xl bg-brand-light p-4 sm:p-5">
              <p className="text-sm font-bold uppercase tracking-wider text-lagoon">Pour ton analyse</p>
              <p className="mt-1">{c.filmer}</p>
              <p className="mt-2 text-sm text-slate">
                Ensuite, fais une capture d&apos;écran au moment clé et envoie-la dans{" "}
                <Link href="/analyse" className="font-semibold text-lagoon">Analyser</Link> : tu reçois un retour sur ta position.
              </p>
            </aside>
          )}

          <aside className="mt-6 rounded-2xl border-2 border-danger/50 bg-danger/5 p-4 sm:p-5">
            <p className="text-sm font-bold uppercase tracking-wider text-danger">Sécurité</p>
            <p className="mt-1">{c.securite}</p>
          </aside>

          {c.retenir && (
            <section className="mt-10 rounded-2xl bg-deep p-6 text-white lg:hidden">
              <h2 className="text-xl font-bold">À retenir</h2>
              <ul className="mt-3 space-y-2">
                {c.retenir.map((r) => (
                  <li key={r} className="flex gap-2">
                    <span aria-hidden="true" className="text-brand">✓</span>
                    {r}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {c.quiz && c.quiz.length > 0 && <BlockView b={{ type: "quiz", items: c.quiz }} />}

          <div className="mt-10 rounded-2xl bg-brand p-6 text-white">
            <h2 className="text-2xl font-bold">Tu as essayé ?</h2>
            <p className="mt-2 text-white/80">Filme ta tentative et fais-la analyser : note par phase, erreurs, corrections, exercices.</p>
            <Link href={`/analyse?figure=${c.trickId}`} className="btn btn-kite mt-5">
              Analyser ma tentative
            </Link>
          </div>

          <nav className="mt-8 grid gap-3 sm:grid-cols-2" aria-label="Figures voisines">
            {prevTrick && (
              <Link href={prevCourse ? `/cours/${prevCourse.slug}` : "/cours"} className="panel block p-4 hover:ring-2 hover:ring-brand">
                <span className="text-xs font-bold uppercase tracking-wider text-slate">← Figure précédente</span>
                <span className="mt-1 block font-bold">{prevTrick.name}</span>
              </Link>
            )}
            {nextTrick && (
              <Link href={nextCourse ? `/cours/${nextCourse.slug}` : "/cours"} className="panel block p-4 text-right hover:ring-2 hover:ring-brand sm:col-start-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate">Figure suivante →</span>
                <span className="mt-1 block font-bold">{nextTrick.name}</span>
              </Link>
            )}
          </nav>
        </div>

        <aside className="hidden lg:block">
          <div className="sticky top-28 space-y-6">
            {c.retenir && (
              <section className="rounded-2xl bg-deep p-5 text-white">
                <h2 className="text-lg font-bold">À retenir</h2>
                <ul className="mt-3 space-y-2 text-[0.95rem]">
                  {c.retenir.map((r) => (
                    <li key={r} className="flex gap-2">
                      <span aria-hidden="true" className="text-brand">✓</span>
                      {r}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <section>
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate">Les bases</h2>
              <ul className="mt-2 space-y-1">
                {lessons.map((r) => (
                  <li key={r.slug}>
                    <Link href={`/cours/${r.slug}`} className="block rounded-xl px-3 py-2 font-semibold text-lagoon hover:bg-salt">
                      {r.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          </div>
        </aside>
      </div>
    </article>
  );
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lesson = lessonBySlug(slug);
  if (lesson) return <LessonView l={lesson} />;
  const c = courseBySlug(slug);
  if (!c) notFound();
  return <CourseView c={c} />;
}
