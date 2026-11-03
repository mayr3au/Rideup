import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { requireSession, effectivePlan } from "@/lib/auth";
import { getQuota } from "@/lib/usage";
import { getProgressData } from "@/lib/progress";
import { hasSpotFinder } from "@/lib/plans";
import { COURSES, courseForTrick, courseSport } from "@/lib/courses";
import { activeSport, levelFor } from "@/lib/rider";
import { LEVEL_LABELS, SPORTS } from "@/lib/sports";
import { SITE_PHOTOS, SPORT_PHOTOS, SPORT_PHOTO_POS } from "@/lib/photos";
import { DashboardConditions, DashboardConditionsSkeleton } from "@/components/dashboard-conditions";

export const metadata: Metadata = { title: "Accueil" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ abonnement?: string }> }) {
  const { abonnement } = await searchParams;
  const { supabase, user, profile } = await requireSession();
  if (!profile.onboarded) redirect("/profil");

  const plan = effectivePlan(profile);
  const sport = activeSport(profile);
  const S = SPORTS[sport];

  const [quota, data] = await Promise.all([
    getQuota(supabase, profile, plan, "analyses"),
    getProgressData(supabase, user.id, sport),
  ]);
  const firstName = profile.full_name?.split(" ")[0];
  const next = data.working[0] ?? data.nextTrick;
  const course = next ? courseForTrick(next.id) : undefined;
  const showConditions = hasSpotFinder(plan) && S.spot !== "cable";
  const courseCount = COURSES.filter((c) => courseSport(c) === sport).length;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {abonnement === "ok" && (
        <p role="status" className="rounded-2xl bg-brand-light p-4 font-semibold text-lagoon">
          Ton abonnement est actif. S&apos;il n&apos;apparaît pas encore, recharge la page dans quelques secondes.
        </p>
      )}

      {/* Bandeau : où tu en es, en un coup d'œil */}
      <section className="photo-card relative overflow-hidden">
        <Image src={SPORT_PHOTOS[sport]} alt="" fill priority sizes="(min-width: 768px) 768px, 100vw" quality={85} className="object-cover" style={{ objectPosition: SPORT_PHOTO_POS[sport] ?? "50% 50%" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-deep/90 via-deep/65 to-deep/20" />
        <div className="relative p-5 text-white sm:p-7">
          <p className="text-sm font-bold uppercase tracking-wider text-white/80">{firstName ? `Salut ${firstName}` : "Salut"} 🤙</p>
          <h1 className="mt-1 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            Prêt pour ta session de <em className="italic">{S.name.toLowerCase()}</em> ?
          </h1>
          <ul className="mt-5 grid grid-cols-3 gap-2">
            {[
              [`${quota.remaining}`, `analyse${quota.remaining > 1 ? "s" : ""} coach ${plan === "free" ? "offerte" + (quota.remaining > 1 ? "s" : "") : "restante" + (quota.remaining > 1 ? "s" : "")}`],
              [`${data.validated.length}/${data.totalTricks}`, "figures validées"],
              [data.average != null ? `${data.average.toFixed(1).replace(".", ",")}` : "–", "note moyenne /10"],
            ].map(([v, l]) => (
              <li key={l} className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2.5 backdrop-blur">
                <p className="text-2xl font-extrabold leading-none">{v}</p>
                <p className="mt-1 text-xs leading-tight text-white/80">{l}</p>
              </li>
            ))}
          </ul>
          <Link href="/analyse" className="btn btn-kite mt-5 !min-h-11 !px-5 !py-2 !text-sm">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
              <circle cx="12" cy="13" r="3.5" />
            </svg>
            Envoyer une vidéo au coach
          </Link>
        </div>
      </section>

      {/* Les 4 services, ce que chacun t'apporte */}
      <section aria-label="Tes outils" className="grid grid-cols-2 gap-3">
        {[
          {
            href: "/analyse",
            photo: SITE_PHOTOS.coach,
            title: "Coach vidéo",
            line: "Un moniteur diplômé corrige ta figure.",
            badge: quota.remaining > 0 ? `${quota.remaining} dispo` : "Quota atteint",
            tone: quota.remaining > 0 ? "bg-emerald-500 text-white" : "bg-amber-400 text-deep",
          },
          {
            href: hasSpotFinder(plan) ? "/spots" : "/week-end",
            photo: SITE_PHOTOS.spots,
            title: "Spot Finder",
            line: S.spot === "cable" ? "Les téléskis autour de toi." : S.spot === "waves" ? "Où il y a des vagues pour toi." : "Où il y a du vent pour toi.",
            badge: hasSpotFinder(plan) ? "7 jours" : "Week-end",
            tone: "bg-white text-brand",
          },
          {
            href: "/cours",
            photo: SITE_PHOTOS.cours,
            title: "Cours",
            line: "Le vent, la sécurité, chaque figure.",
            badge: plan === "free" ? "🔒 Abonnés" : `${courseCount} cours`,
            tone: plan === "free" ? "bg-white/90 text-deep" : "bg-white text-brand",
          },
          {
            href: "/progression",
            photo: SITE_PHOTOS.progression,
            title: "Progrès",
            line: "Ta roadmap, figure par figure.",
            badge: `${Math.round((data.validated.length / Math.max(1, data.totalTricks)) * 100)} %`,
            tone: "bg-white text-brand",
          },
        ].map((t) => (
          <Link key={t.title} href={t.href} className="photo-card group relative flex min-h-36 flex-col justify-end overflow-hidden sm:min-h-40">
            <Image src={t.photo} alt="" fill sizes="(min-width: 768px) 380px, 50vw" quality={85} className="object-cover transition duration-500 group-hover:scale-105" />
            <div className="absolute inset-0 bg-gradient-to-t from-deep/90 via-deep/45 to-deep/5" />
            <span className={`absolute right-2.5 top-2.5 rounded-full px-2.5 py-1 text-xs font-bold shadow-sm ${t.tone}`}>{t.badge}</span>
            <div className="relative p-3.5 text-white sm:p-4">
              <p className="flex items-center gap-1 text-lg font-bold">
                {t.title}
                <span aria-hidden="true" className="transition group-hover:translate-x-0.5">→</span>
              </p>
              <p className="line-clamp-2 text-sm leading-snug text-white/85">{t.line}</p>
            </div>
          </Link>
        ))}
      </section>
      {plan === "free" && (
        <p className="text-center text-sm text-slate">
          Plus d&apos;analyses, les cours et le Spot Finder 7 jours ?{" "}
          <Link href="/tarifs" className="font-semibold text-lagoon">Voir les formules</Link>
        </p>
      )}

      {/* Coach IA : une question, une réponse tout de suite, 24 h/24 */}
      <section className="relative overflow-hidden rounded-[22px] bg-gradient-to-br from-brand to-lagoon p-5 text-white shadow-[var(--shadow-card)]">
        <div aria-hidden="true" className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/15 blur-2xl" />
        <div className="relative flex items-center gap-3">
          <span className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/20" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" />
            </svg>
            <span className="absolute -bottom-0.5 -right-0.5 h-3.5 w-3.5 rounded-full border-2 border-brand bg-emerald-400" />
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-2 text-lg font-bold">
              Ton coach IA
              <span className="rounded-full bg-white px-2 py-0.5 text-[0.7rem] font-bold text-brand">24h/24</span>
            </p>
            <p className="text-sm text-white/85">Entraîné pour coacher le {S.name.toLowerCase()}. Il connaît ton niveau et ta roadmap.</p>
          </div>
        </div>
        <form action="/coach" className="relative mt-4 flex gap-2">
          <input type="hidden" name="vue" value="chat" />
          <input type="hidden" name="go" value="1" />
          <label htmlFor="ask-ai" className="sr-only">Ta question au coach IA</label>
          <input
            id="ask-ai"
            name="q"
            required
            maxLength={500}
            placeholder={S.spot === "waves" ? "Ex. : je me lève trop tard, pourquoi ?" : "Ex. : quelle aile pour 18 nœuds ?"}
            className="min-h-12 min-w-0 flex-1 rounded-xl border-0 bg-white px-4 text-[0.95rem] text-deep placeholder:text-slate focus:outline-none focus:ring-4 focus:ring-white/40"
          />
          <button className="btn shrink-0 !min-h-12 bg-deep !px-4 text-white hover:bg-deep/90">Demander</button>
        </form>
      </section>

      {showConditions && (
        <Suspense fallback={<DashboardConditionsSkeleton />}>
          <DashboardConditions profile={profile} sport={sport} />
        </Suspense>
      )}

      {/* Premiers pas : tant qu'aucune analyse n'a été faite */}
      {data.recentAttempts.length === 0 && (
        <section className="panel p-5">
          <h2 className="text-xl font-bold">Bien démarrer</h2>
          <p className="mt-1 text-[0.95rem] text-slate">Trois étapes pour avoir ton premier retour de coach.</p>
          <ol className="mt-4 space-y-3">
            {[
              { done: true, title: "Ton profil rider est créé", text: `${S.name}${levelFor(profile, sport) ? `, niveau ${LEVEL_LABELS[levelFor(profile, sport)!].toLowerCase()}` : ""}.`, href: "/profil", cta: "Modifier" },
              { done: false, title: plan === "free" ? "Analyse ta première figure, c'est offert" : "Analyse ta première figure", text: "Envoie la vidéo de ta figure : un coach te dit quoi corriger.", href: "/analyse", cta: "Envoyer" },
              { done: false, title: "Pose une question au coach IA", text: "Il répond 24h/24 : matériel, figure, prochaine session.", href: "/coach?vue=chat", cta: "Demander" },
            ].map((s, i) => (
              <li key={i} className="flex items-start gap-3">
                <span aria-hidden="true" className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${s.done ? "bg-brand text-white" : "bg-brand-light text-brand"}`}>
                  {s.done ? "✓" : i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={`font-semibold ${s.done ? "text-slate line-through decoration-1" : ""}`}>{s.title}</p>
                  <p className="text-sm text-slate">{s.text}</p>
                </div>
                <Link href={s.href} className={`shrink-0 self-center ${s.done ? "text-sm font-semibold text-lagoon" : "btn btn-primary !min-h-10 !px-4 !py-2 !text-sm"}`}>
                  {s.cta}
                </Link>
              </li>
            ))}
          </ol>
        </section>
      )}

      {/* Priorités */}
      {data.recentAttempts.length > 0 && (
      <section>
        <h2 className="text-xl font-bold">À travailler à ta prochaine session</h2>
        {data.priorities.length ? (
          <ol className="mt-3 space-y-3">
            {data.priorities.map((p, i) => (
              <li key={i} className="panel flex gap-4 p-4">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-light font-extrabold text-brand">{i + 1}</span>
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="mt-0.5 text-[0.95rem] text-slate">{p.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="panel mt-3 p-4 text-slate">Analyse une nouvelle figure : tes priorités apparaîtront ici.</p>
        )}
      </section>
      )}

      <div>
        {next && (
          <section className="panel p-5">
            <p className="text-sm font-semibold text-brand">{data.working.length ? "Figure en cours" : "Prochaine figure"}</p>
            <h2 className="mt-1 text-xl font-bold">{next.name}</h2>
            <p className="mt-1 text-[0.95rem] text-slate">{next.summary}</p>
            <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1">
              <Link href="/coach" className="inline-flex min-h-10 items-center text-sm font-semibold text-lagoon">Voir ma roadmap</Link>
              {course && <Link href={`/cours/${course.slug}`} className="inline-flex min-h-10 items-center text-sm font-semibold text-lagoon">Lire le cours</Link>}
            </div>
          </section>
        )}
      </div>

      {data.recentAttempts.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold">Dernières analyses</h2>
            <Link href="/historique" className="text-sm font-semibold text-lagoon">Tout voir</Link>
          </div>
          <ul className="mt-3 space-y-2">
            {data.recentAttempts.slice(-3).reverse().map((a, i) => (
              <li key={i}>
                <Link href={`/analyse/${a.id}`} className="panel flex items-center gap-3 px-4 py-3 hover:ring-2 hover:ring-brand/30">
                  {a.image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={a.image} alt="" className="h-12 w-12 shrink-0 rounded-xl object-cover" />
                  ) : (
                    <span aria-hidden="true" className="h-12 w-12 shrink-0 rounded-xl bg-brand-light" />
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{a.figure}</span>
                    <span className="block truncate text-sm text-slate">{a.priorite || a.date}</span>
                  </span>
                  <span className="shrink-0 text-xl font-extrabold text-brand">{a.note}/10</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
