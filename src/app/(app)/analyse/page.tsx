import type { Metadata } from "next";
import Link from "next/link";
import { CoachAvatars } from "@/components/coach-avatars";
import { CoachTabs } from "@/components/coach-tabs";
import { requireSession, effectivePlan } from "@/lib/auth";
import { getQuota, sweepStaleAnalyses } from "@/lib/usage";
import { activeSport, riderSports } from "@/lib/rider";
import { redirect } from "next/navigation";
import { AnalyseUploader } from "@/components/analyse-uploader";
import { REVIEW_DELAY_HOURS } from "@/lib/plans";
import { SPORTS, trickById } from "@/lib/sports";
import { SampleReport } from "@/components/sample-report";
import type { VideoAnalysis } from "@/lib/types";

export const metadata: Metadata = { title: "Analyse vidéo par un coach" };

export default async function AnalysePage({ searchParams }: { searchParams: Promise<{ figure?: string }> }) {
  const { figure } = await searchParams;
  const { supabase, profile } = await requireSession();
  if (!profile.onboarded) redirect("/profil");
  const plan = effectivePlan(profile);
  await sweepStaleAnalyses(profile.id);
  const sport = activeSport(profile);
  const [quota, { data: pending }] = await Promise.all([
    getQuota(supabase, profile, plan, "analyses"),
    supabase
      .from("video_analyses")
      .select("id, sport, trick, status, priority, submitted_at")
      .in("status", ["en-attente", "en-cours"])
      .order("created_at", { ascending: false })
      .limit(5)
      .returns<Pick<VideoAnalysis, "id" | "sport" | "trick" | "status" | "priority" | "submitted_at">[]>(),
  ]);
  const delay = REVIEW_DELAY_HOURS[plan];
  const wanted = figure && trickById(figure) ? figure : undefined;

  return (
    <div className="mx-auto max-w-2xl">
      <CoachTabs />
      <h1 className="text-3xl font-bold sm:text-4xl">Fais analyser ta vidéo</h1>
      <p className="mt-2 text-slate">
        Un moniteur diplômé d&apos;État regarde ta figure image par image et te dit exactement quoi corriger.
      </p>
      <CoachAvatars sport={sport} className="mt-4" />

      <ul className="mt-5 grid grid-cols-3 gap-2 text-center text-sm">
        {[
          ["Diplômé d'État", "BPJEPS ou DEJEPS"],
          [`Sous ${delay} h`, plan === "elite" ? "Elite : en priorité" : "e-mail dès que c'est prêt"],
          ["Retour complet", "phases, erreurs, exercices"],
        ].map(([t, d]) => (
          <li key={t} className="rounded-2xl bg-brand-light px-2 py-3">
            <p className="font-bold text-lagoon">{t}</p>
            <p className="mt-0.5 text-xs text-slate">{d}</p>
          </li>
        ))}
      </ul>

      {(pending?.length ?? 0) > 0 && (
        <section className="mt-6">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate">Chez ton coach</h2>
          <ul className="mt-2 space-y-2">
            {pending!.map((a) => (
              <li key={a.id}>
                <Link href={`/analyse/${a.id}`} className="panel flex items-center gap-3 px-4 py-3 hover:ring-2 hover:ring-brand">
                  <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${a.status === "en-cours" ? "animate-pulse bg-brand" : "bg-kite"}`} />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-semibold">{trickById(a.trick ?? "")?.name ?? "Figure libre"}</span>
                    <span className="block text-sm text-slate">
                      {SPORTS[a.sport].name} · {a.status === "en-cours" ? "le coach analyse ta vidéo" : "en attente d'un coach"}
                    </span>
                  </span>
                  <span className="text-sm font-semibold text-lagoon">Suivre</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <div className="mt-8">
        {quota.allowed ? (
          <AnalyseUploader
            remaining={quota.remaining}
            sports={riderSports(profile)}
            defaultSport={sport}
            defaultTrick={wanted}
            delayHours={delay}
          />
        ) : (
          <div className="panel p-6">
            <h2 className="text-2xl font-bold">
              {plan === "free" ? "Ton analyse d'essai est utilisée" : "Quota de la période atteint"}
            </h2>
            <p className="mt-2 text-slate">
              {plan === "free"
                ? "Choisis une formule pour continuer à analyser tes sessions."
                : `Tu as utilisé tes ${quota.limit} analyses.${plan === "progress" ? " Elite en propose davantage, avec un retour sous 24 h." : " Le compteur repart au renouvellement de ton abonnement."}`}
            </p>
            {plan !== "elite" && (
              <Link href="/tarifs" className="btn btn-primary mt-5">
                Voir les formules
              </Link>
            )}
          </div>
        )}
      </div>

      <section className="mt-12">
        <h2 className="text-2xl font-bold">Ce que tu reçois</h2>
        <p className="mt-1 text-slate">
          Un retour rédigé par ton coach, toujours dans la même structure, pour savoir exactement quoi faire sur l&apos;eau.
        </p>
        <ol className="mt-5 space-y-3">
          {[
            ["Une note globale et par phase", "Approche, appel, en l'air, réception : tu vois où tu perds des points."],
            ["Tes erreurs, dans l'ordre", "Classées de la plus importante à la moins grave, chacune avec sa correction."],
            ["Des exercices concrets", "À faire dès ta prochaine session, adaptés à ton niveau."],
            ["Une seule priorité", "Le point à travailler en premier, pour ne pas tout corriger en même temps."],
            ["Ta progression suivie", "Ton coach compare avec tes vidéos précédentes, tes erreurs sont suivies dans Progrès."],
          ].map(([t, d], i) => (
            <li key={t} className="grid grid-cols-[2rem_1fr] gap-2">
              <span className="font-display text-2xl font-extrabold text-lagoon">{i + 1}</span>
              <span>
                <span className="font-semibold">{t}</span>
                <span className="block text-[0.95rem] text-slate">{d}</span>
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-6">
          <SampleReport />
          <p className="mt-2 text-center text-sm text-slate">Exemple de retour de coach.</p>
        </div>
      </section>

      <div className="mt-10 border-t border-line pt-6">
        <Link href="/historique" className="text-lagoon hover:underline">
          Voir l&apos;historique de mes analyses
        </Link>
      </div>
    </div>
  );
}
