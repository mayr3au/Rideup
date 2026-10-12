import type { Metadata } from "next";
import Link from "next/link";
import { requireSession, effectivePlan } from "@/lib/auth";
import { getQuota, sweepStaleAnalyses } from "@/lib/usage";
import { ANALYSIS_DEPTH } from "@/lib/plans";
import { trickById } from "@/lib/tricks";
import { AnalyseUploader } from "@/components/analyse-uploader";

export const metadata: Metadata = { title: "Analyse vidéo" };

export default async function AnalysePage({ searchParams }: { searchParams: Promise<{ figure?: string }> }) {
  const { figure } = await searchParams;
  const { supabase, profile } = await requireSession();
  const plan = effectivePlan(profile);
  await sweepStaleAnalyses(profile.id);
  const quota = await getQuota(supabase, profile, plan, "analyses");
  const deep = ANALYSIS_DEPTH[plan].depth === "approfondie";

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-4xl font-bold sm:text-5xl">Analyser une figure</h1>
      <p className="mt-2 text-slate">
        Importe ta vidéo, sélectionne le passage et reçois les corrections technique par technique.
        {deep && " Ton analyse Elite est approfondie et comparée à tes tentatives précédentes."}
      </p>

      <div className="mt-8">
        {quota.allowed ? (
          <AnalyseUploader
            defaultTrick={figure && trickById(figure) ? figure : undefined}
            remaining={quota.remaining}
            deep={deep}
            sheetCount={ANALYSIS_DEPTH[plan].sheets}
          />
        ) : (
          <div className="panel p-6">
            <h2 className="text-2xl font-bold">
              {plan === "free" ? "Ton analyse d'essai est utilisée" : "Quota de la période atteint"}
            </h2>
            <p className="mt-2 text-slate">
              {plan === "free"
                ? "Choisis une formule pour continuer à analyser tes sessions."
                : `Tu as utilisé tes ${quota.limit} analyses.${plan === "progress" ? " Elite en propose 60 par mois." : " Le compteur repart au renouvellement de ton abonnement."}`}
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
