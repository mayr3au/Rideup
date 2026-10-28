import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession, effectivePlan } from "@/lib/auth";
import { getQuota } from "@/lib/usage";
import { getProgressData } from "@/lib/progress";
import { PLANS } from "@/lib/plans";
import { courseForTrick } from "@/lib/courses";
import { activeSport, levelFor } from "@/lib/rider";
import { LEVEL_LABELS, SPORTS } from "@/lib/sports";
import { SPORT_PHOTOS } from "@/lib/photos";

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

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {abonnement === "ok" && (
        <p role="status" className="rounded-2xl bg-brand-light p-4 font-semibold text-lagoon">
          Ton abonnement est actif. S&apos;il n&apos;apparaît pas encore, recharge la page dans quelques secondes.
        </p>
      )}

      <div>
        <p className="text-slate">{firstName ? `Salut ${firstName}` : "Salut"}</p>
        <h1 className="text-3xl font-bold">Prêt pour ta session de {S.name.toLowerCase()} ?</h1>
      </div>

      {/* Action principale */}
      <Link href="/analyse" className="photo-card relative flex min-h-56 flex-col justify-end overflow-hidden">
        <Image src={SPORT_PHOTOS[sport]} alt="" fill sizes="(min-width: 768px) 768px, 100vw" className="object-cover" priority />
        <div className="photo-veil absolute inset-0" />
        <div className="relative flex items-end justify-between gap-4 p-5 text-white">
          <div>
            <p className="text-2xl font-bold">Analyser une figure</p>
            <p className="text-white/85">
              {quota.remaining} analyse{quota.remaining > 1 ? "s" : ""} restante{quota.remaining > 1 ? "s" : ""}
              {plan === "free" ? " (essai)" : ` ce mois-ci · ${PLANS[plan].name}`}
            </p>
          </div>
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white text-brand" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
        </div>
      </Link>
      {plan === "free" && (
        <p className="text-center text-sm text-slate">
          Plus d&apos;analyses ?{" "}
          <Link href="/tarifs" className="font-semibold text-lagoon">Voir les formules</Link>
        </p>
      )}

      {/* Premiers pas : tant qu'aucune analyse n'a été faite */}
      {data.recentAttempts.length === 0 && (
        <section className="panel p-5">
          <h2 className="text-xl font-bold">Bien démarrer</h2>
          <p className="mt-1 text-[0.95rem] text-slate">Trois étapes pour avoir ton premier retour de coach.</p>
          <ol className="mt-4 space-y-3">
            {[
              { done: true, title: "Ton profil rider est créé", text: `${S.name}${levelFor(profile, sport) ? `, niveau ${LEVEL_LABELS[levelFor(profile, sport)!].toLowerCase()}` : ""}.`, href: "/profil", cta: "Modifier" },
              { done: false, title: plan === "free" ? "Analyse ta première figure, c'est offert" : "Analyse ta première figure", text: "Une vidéo filmée de côté, 10 secondes de ta figure, et tu sais quoi corriger.", href: "/analyse", cta: "Analyser" },
              { done: false, title: "Pose une question au coach", text: "Sur ton matériel, une figure, ta prochaine session.", href: "/coach?vue=chat", cta: "Demander" },
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

      <div className="grid gap-4 sm:grid-cols-2">
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
        <section className="panel p-5">
          <p className="text-sm font-semibold text-brand">{S.spot === "cable" ? "Où rider" : "Conditions"}</p>
          <h2 className="mt-1 text-xl font-bold">Spot Finder</h2>
          <p className="mt-1 text-[0.95rem] text-slate">
            {S.spot === "cable"
              ? "Les téléskis nautiques autour de toi."
              : S.spot === "waves"
                ? "Les spots où il y a des vagues pour ton niveau, cette semaine."
                : "Les spots où il y a du vent pour ton niveau et ton matériel, cette semaine."}
          </p>
          <Link href={plan === "free" ? "/week-end" : "/spots"} className="mt-3 inline-flex min-h-10 items-center text-sm font-semibold text-lagoon">
            {plan === "free" ? "Voir les spots du week-end" : "Trouver un spot"}
          </Link>
        </section>
      </div>

      {data.recentAttempts.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold">Dernières analyses</h2>
            <Link href="/historique" className="text-sm font-semibold text-lagoon">Tout voir</Link>
          </div>
          <ul className="mt-3 space-y-2">
            {data.recentAttempts.slice(-3).reverse().map((a, i) => (
              <li key={i} className="panel flex items-center justify-between gap-4 px-4 py-3">
                <span>
                  <span className="font-semibold">{a.figure}</span>
                  <span className="block text-sm text-slate">{a.date}</span>
                </span>
                <span className="text-xl font-extrabold text-brand">{a.note}/10</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
