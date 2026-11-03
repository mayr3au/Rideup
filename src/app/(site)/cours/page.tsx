import type { Metadata } from "next";
import Link from "next/link";
import { Schema } from "@/components/schemas";
import { COURSES, courseSport } from "@/lib/courses";
import { LESSONS, LESSON_CATEGORIES } from "@/lib/lessons";
import { SPORT_IDS, SPORTS } from "@/lib/sports";
import Image from "next/image";
import { SITE_PHOTOS, SPORT_PHOTOS, SPORT_PHOTO_POS } from "@/lib/photos";
import { getSession, effectivePlan } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Cours de glisse",
  description:
    "Cours en ligne pour les abonnés RIDE'UP : fenêtre de vent, lecture du vent, sécurité, self-rescue, priorités, courants, et chaque figure étape par étape en kitesurf, wingfoil, foil, surf et wakeboard.",
};

function sportsLabel(ids: typeof SPORT_IDS | readonly string[]) {
  if (!ids.length) return "Tous sports";
  return ids.map((id) => SPORTS[id as keyof typeof SPORTS].name).join(" · ");
}

const LEVEL_DOT: Record<string, string> = {
  débutant: "bg-emerald-500",
  intermédiaire: "bg-amber-400",
  avancé: "bg-danger",
  expert: "bg-deep",
};

export default async function CoursesPage() {
  const session = await getSession();
  const unlocked = Boolean(session?.profile && (session.profile.is_admin || effectivePlan(session.profile) !== "free"));
  const groups = SPORT_IDS.map((sport) => ({ sport, list: COURSES.filter((c) => courseSport(c) === sport) })).filter((g) => g.list.length);

  return (
    <div className="mx-auto max-w-5xl overflow-x-clip px-5 py-8 sm:px-6 sm:py-12">
      {/* Bandeau : ce que contiennent les cours */}
      <section className="photo-card relative overflow-hidden">
        <Image src={SITE_PHOTOS.cours} alt="" fill priority sizes="(min-width: 1024px) 1000px, 100vw" quality={85} className="object-cover object-[50%_60%]" />
        <div className="absolute inset-0 bg-gradient-to-r from-deep/90 via-deep/65 to-deep/15" />
        <div className="relative p-5 text-white sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-white/80">Cours</p>
          <h1 className="mt-1 text-4xl font-extrabold leading-tight text-white sm:text-5xl">
            Comprendre, puis <em className="italic">rider</em>.
          </h1>
          <p className="mt-2 max-w-xl text-white/85">
            D&apos;abord le vent et la sécurité, ensuite chaque figure étape par étape. Lis, va sur l&apos;eau, puis envoie ta
            tentative à un coach.
          </p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-3">
            {[
              [`${LESSONS.length} fondamentaux`, "vent, fenêtre, sécurité, priorités"],
              [`${COURSES.length} figures`, "du water start au kiteloop, 5 sports"],
              ["Schémas, quiz, exercices", "pour retenir et pratiquer"],
            ].map(([t, d]) => (
              <li key={t} className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2.5 backdrop-blur">
                <p className="text-sm font-bold">{t}</p>
                <p className="text-xs text-white/75">{d}</p>
              </li>
            ))}
          </ul>
          <div className="mt-5">
            {unlocked ? (
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-3 py-1.5 text-sm font-bold">✓ Inclus dans ta formule</span>
            ) : (
              <Link href="/tarifs" className="btn btn-kite !min-h-11 !px-5 !py-2 !text-sm">
                Débloquer les {LESSONS.length + COURSES.length} cours
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Sommaire, toujours à portée de main */}
      <nav className="scroll-x -mx-5 mt-6 flex gap-2 px-5 pb-1 sm:mx-0 sm:px-0" aria-label="Sections">
        {LESSON_CATEGORIES.map((c) => (
          <a key={c.id} href={`#${c.id}`} className="min-h-10 whitespace-nowrap rounded-full bg-brand px-4 py-2 text-[0.95rem] font-semibold text-white">
            {c.title}
          </a>
        ))}
        {groups.map((g) => (
          <a key={g.sport} href={`#${g.sport}`} className="flex min-h-10 items-center gap-2 whitespace-nowrap rounded-full bg-raised py-1 pl-1 pr-4 text-[0.95rem] font-semibold">
            <span className="relative h-8 w-8 overflow-hidden rounded-full">
              <Image src={SPORT_PHOTOS[g.sport]} alt="" fill sizes="64px" className="object-cover" style={{ objectPosition: SPORT_PHOTO_POS[g.sport] }} />
            </span>
            {SPORTS[g.sport].name}
          </a>
        ))}
      </nav>

      {LESSON_CATEGORIES.map((cat) => {
        const list = LESSONS.filter((l) => l.category === cat.id);
        return (
          <section key={cat.id} id={cat.id} className="mt-10 scroll-mt-28">
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
                        <span className="shrink-0 rounded-full bg-raised px-2.5 py-1 text-xs font-semibold text-slate">{unlocked ? "" : "🔒 "}{l.minutes} min</span>
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
        <section key={g.sport} id={g.sport} className="mt-8 scroll-mt-28">
          <div className="photo-card relative flex h-24 items-end overflow-hidden sm:h-28">
            <Image src={SPORT_PHOTOS[g.sport]} alt="" fill sizes="(min-width: 1024px) 1000px, 100vw" className="object-cover" style={{ objectPosition: SPORT_PHOTO_POS[g.sport] }} />
            <div className="absolute inset-0 bg-gradient-to-r from-deep/85 to-deep/10" />
            <div className="relative flex w-full items-end justify-between p-4 text-white">
              <h3 className="text-2xl font-extrabold text-white">{SPORTS[g.sport].name}</h3>
              <span className="text-sm font-semibold text-white/85">{g.list.length} figures</span>
            </div>
          </div>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {g.list.map((c) => (
              <li key={c.slug}>
                <Link href={`/cours/${c.slug}`} className="panel block h-full p-4 transition-shadow hover:ring-2 hover:ring-brand">
                  <span className="flex items-center justify-between gap-3">
                    <span className="text-lg font-bold leading-tight">{c.title}</span>
                    <span className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-raised px-2.5 py-1 text-xs font-semibold text-slate">
                      <span aria-hidden="true" className={`h-2 w-2 rounded-full ${LEVEL_DOT[c.level.toLowerCase()] ?? "bg-slate"}`} />
                      {unlocked ? "" : "🔒 "}
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
