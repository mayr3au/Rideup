import type { Metadata } from "next";
import Link from "next/link";
import { requireSession, effectivePlan } from "@/lib/auth";
import { getQuota } from "@/lib/usage";
import { getProgressData } from "@/lib/progress";
import { PLANS } from "@/lib/plans";
import { courseForTrick } from "@/lib/courses";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ abonnement?: string }> }) {
  const { abonnement } = await searchParams;
  const { supabase, user, profile } = await requireSession();
  const plan = effectivePlan(profile);

  const [quota, data] = await Promise.all([getQuota(supabase, profile, plan, "analyses"), getProgressData(supabase, user.id)]);
  const firstName = profile.full_name?.split(" ")[0];
  const pct = quota.limit ? Math.min(100, (quota.used / quota.limit) * 100) : 100;
  const next = data.working[0] ?? data.nextTrick;
  const course = next ? courseForTrick(next.id) : undefined;

  return (
    <div className="space-y-8">
      {abonnement === "ok" && (
        <p role="status" className="rounded-xl border border-lagoon/40 bg-lagoon/10 p-4">
          Ton abonnement est actif. S&apos;il n&apos;apparaît pas encore, recharge la page dans quelques secondes.
        </p>
      )}

      <h1 className="text-4xl font-bold sm:text-5xl">{firstName ? `Salut ${firstName}` : "Salut"}</h1>

      {!profile.onboarded && (
        <section className="panel border-2 !border-kite p-5">
          <h2 className="text-2xl font-bold">Crée ton profil rider</h2>
          <p className="mt-1 text-slate">Niveau, poids, matériel : c&apos;est ce qui rend les analyses et le Spot Finder justes pour toi.</p>
          <Link href="/profil" className="btn btn-primary mt-4">Créer mon profil</Link>
        </section>
      )}

      <section className="rounded-2xl bg-deep p-5 text-salt sm:p-6">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-salt/70">{plan === "free" ? "Essai gratuit" : `${PLANS[plan].name} · cette période`}</p>
            <p className="mt-1 font-display text-4xl font-extrabold">
              {quota.remaining}
              <span className="text-xl font-semibold text-salt/70"> analyse{quota.remaining > 1 ? "s" : ""} restante{quota.remaining > 1 ? "s" : ""}</span>
            </p>
          </div>
          <Link href="/analyse" className="btn btn-kite">Analyser une figure</Link>
        </div>
        <div className="mt-4 h-2 overflow-hidden rounded-full bg-salt/15" role="progressbar" aria-valuenow={quota.used} aria-valuemin={0} aria-valuemax={quota.limit} aria-label="Analyses utilisées">
          <div className="h-full rounded-full bg-kite" style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-2 text-sm text-salt/70">
          {quota.used} sur {quota.limit} utilisée{quota.used > 1 ? "s" : ""}
          {plan === "free" && (
            <>
              {" · "}
              <Link href="/tarifs" className="underline">Passer à Progress</Link>
            </>
          )}
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Pour ta prochaine session</h2>
        {data.priorities.length ? (
          <ol className="mt-3 space-y-2">
            {data.priorities.map((p, i) => (
              <li key={i} className="panel p-4">
                <p className="font-semibold">{p.title}</p>
                <p className="mt-1 text-slate">{p.detail}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-slate">Analyse ta première figure : tes priorités apparaîtront ici.</p>
        )}
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        {next && (
          <section className="panel p-5">
            <p className="text-sm text-slate">{data.working.length ? "Figure en cours" : "Prochaine figure"}</p>
            <h2 className="mt-1 text-2xl font-bold">{next.name}</h2>
            <p className="mt-1 text-slate">{next.summary}</p>
            <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
              <Link href={`/analyse?figure=${next.id}`} className="text-lagoon underline">Analyser une tentative</Link>
              {course && <Link href={`/cours/${course.slug}`} className="text-lagoon underline">Lire le cours</Link>}
            </div>
          </section>
        )}
        <section className="panel p-5">
          <p className="text-sm text-slate">Où rider</p>
          <h2 className="mt-1 text-2xl font-bold">Spot Finder</h2>
          <p className="mt-1 text-slate">
            {plan === "free"
              ? "Le meilleur spot selon le vent, ton niveau et ton matériel, avec Progress."
              : "Les créneaux ridables autour de toi pour les 7 prochains jours."}
          </p>
          <Link href={plan === "free" ? "/week-end" : "/spots"} className="mt-4 inline-block text-lagoon underline">
            {plan === "free" ? "Voir les spots du week-end" : "Trouver un spot"}
          </Link>
        </section>
      </div>

      {data.recentAttempts.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-2xl font-bold">Dernières analyses</h2>
            <Link href="/historique" className="text-lagoon hover:underline">Historique</Link>
          </div>
          <ul className="mt-3 divide-y divide-line border-y border-line">
            {data.recentAttempts.slice(-3).reverse().map((a, i) => (
              <li key={i} className="flex items-center justify-between gap-4 py-3">
                <span>
                  <span className="font-semibold">{a.figure}</span>
                  <span className="ml-2 text-sm text-slate">{a.date}</span>
                </span>
                <span className="font-display text-lg font-bold">{a.note}/10</span>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
