import type { Metadata } from "next";
import Link from "next/link";
import { requireSession, effectivePlan } from "@/lib/auth";
import { getQuota, sweepStaleAnalyses } from "@/lib/usage";
import { activeSport, riderSports } from "@/lib/rider";
import { redirect } from "next/navigation";
import { AnalyseUploader } from "@/components/analyse-uploader";
import { REVIEW_DELAY_HOURS } from "@/lib/plans";
import { trickById } from "@/lib/sports";

export const metadata: Metadata = { title: "Analyse vidéo par un coach" };

export default async function AnalysePage({ searchParams }: { searchParams: Promise<{ figure?: string }> }) {
  const { figure } = await searchParams;
  const { supabase, profile } = await requireSession();
  if (!profile.onboarded) redirect("/profil");
  const plan = effectivePlan(profile);
  await sweepStaleAnalyses(profile.id);
  const sport = activeSport(profile);
  const quota = await getQuota(supabase, profile, plan, "analyses");
  const wanted = figure && trickById(figure) ? figure : undefined;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold sm:text-4xl">Fais analyser ta vidéo</h1>
      <p className="mt-2 text-slate">
        Envoie le passage de ta figure : un vrai coach RIDE&apos;UP la regarde image par image et te renvoie ses corrections,
        tes exercices et ta priorité pour la prochaine session, sous {REVIEW_DELAY_HOURS[plan]} h.
      </p>

      <div className="mt-8">
        {quota.allowed ? (
          <AnalyseUploader
            remaining={quota.remaining}
            sports={riderSports(profile)}
            defaultSport={sport}
            defaultTrick={wanted}
            delayHours={REVIEW_DELAY_HOURS[plan]}
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

      <div className="mt-10 border-t border-line pt-6">
        <Link href="/historique" className="text-lagoon hover:underline">
          Voir l&apos;historique de mes analyses
        </Link>
      </div>
    </div>
  );
}
