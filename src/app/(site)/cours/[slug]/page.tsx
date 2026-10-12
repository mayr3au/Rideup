import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { COURSES, courseBySlug } from "@/lib/courses";

export function generateStaticParams() {
  return COURSES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = courseBySlug((await params).slug);
  return c ? { title: `${c.title} — cours de kitesurf`, description: c.intro } : {};
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const c = courseBySlug((await params).slug);
  if (!c) notFound();

  return (
    <article className="mx-auto max-w-2xl px-4 py-14 sm:px-6">
      <Link href="/cours" className="text-lagoon hover:underline">Tous les cours</Link>
      <p className="mt-6 text-slate">{c.level} · {c.minutes} min de lecture</p>
      <h1 className="text-5xl font-extrabold">{c.title}</h1>
      <p className="mt-4 text-lg">{c.intro}</p>

      <section className="mt-10">
        <h2 className="text-2xl font-bold">Avant de commencer</h2>
        <ul className="mt-3 space-y-1.5">
          {c.prerequis.map((p) => (
            <li key={p} className="flex gap-2"><span aria-hidden="true" className="text-lagoon">✓</span>{p}</li>
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
        <ul className="mt-3 list-disc space-y-1.5 pl-5">
          {c.exercices.map((x) => <li key={x}>{x}</li>)}
        </ul>
      </section>

      <p className="mt-10 rounded-xl border-2 border-danger/50 bg-danger/5 p-4">
        <span className="font-bold text-danger">Sécurité : </span>
        {c.securite}
      </p>

      <div className="mt-10 rounded-2xl bg-deep p-6 text-salt">
        <h2 className="text-2xl font-bold">Tu as essayé ?</h2>
        <p className="mt-2 text-salt/75">Filme ta tentative et fais-la analyser pour savoir exactement quoi corriger.</p>
        <Link href={`/analyse?figure=${c.trickId}`} className="btn btn-kite mt-5">Analyser ma tentative</Link>
      </div>
    </article>
  );
}
