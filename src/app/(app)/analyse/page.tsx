import type { Metadata } from "next";
import Link from "next/link";
import { requireSession, effectivePlan } from "@/lib/auth";
import { getQuota, sweepStaleAnalyses } from "@/lib/usage";
import { activeSport, riderSports } from "@/lib/rider";
import { redirect } from "next/navigation";
import { PhotoUploader } from "@/components/photo-uploader";

export const metadata: Metadata = { title: "Analyse de position" };

export default async function AnalysePage() {
  const { supabase, profile } = await requireSession();
  if (!profile.onboarded) redirect("/profil");
  const plan = effectivePlan(profile);
  await sweepStaleAnalyses(profile.id);
  const quota = await getQuota(supabase, profile, plan, "analyses");

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold sm:text-4xl">Analyse ta position</h1>
      <p className="mt-2 text-slate">
        Une photo de toi (ou une capture d&apos;écran de ta vidéo), une phrase pour dire ce que tu fais, et tu reçois tes
        corrections en quelques secondes.
      </p>

      <div className="mt-8">
        {quota.allowed ? (
          <PhotoUploader remaining={quota.remaining} sports={riderSports(profile)} defaultSport={activeSport(profile)} />
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
