import type { Metadata } from "next";
import Link from "next/link";
import { requireSession, effectivePlan } from "@/lib/auth";
import { getQuota, sweepStaleAnalyses } from "@/lib/usage";
import { activeSport, riderSports } from "@/lib/rider";
import { redirect } from "next/navigation";
import { PhotoUploader } from "@/components/photo-uploader";
import { trickById, tricksFor } from "@/lib/sports";
import type { TrickProgress } from "@/lib/types";

export const metadata: Metadata = { title: "Analyse de position" };

export default async function AnalysePage({ searchParams }: { searchParams: Promise<{ figure?: string }> }) {
  const { figure } = await searchParams;
  const { supabase, profile } = await requireSession();
  if (!profile.onboarded) redirect("/profil");
  const plan = effectivePlan(profile);
  await sweepStaleAnalyses(profile.id);
  const sport = activeSport(profile);
  const [quota, { data: progress }] = await Promise.all([
    getQuota(supabase, profile, plan, "analyses"),
    supabase.from("trick_progress").select("trick_id, status").eq("user_id", profile.id).returns<Pick<TrickProgress, "trick_id" | "status">[]>(),
  ]);
  // Raccourcis pour « ce que tu fais » : figures en cours, puis la prochaine à débloquer
  const status = new Map((progress ?? []).map((p) => [p.trick_id, p.status]));
  const tricks = tricksFor(sport);
  const working = tricks.filter((t) => status.get(t.id) === "en-cours");
  const nextTrick = tricks.find((t) => status.get(t.id) !== "valide" && status.get(t.id) !== "en-cours");
  const shortcuts = [...working, ...(nextTrick ? [nextTrick] : [])].slice(0, 4).map((t) => t.name);
  const wanted = figure ? trickById(figure)?.name : undefined;

  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-3xl font-bold sm:text-4xl">Analyse ta position</h1>
      <p className="mt-2 text-slate">
        Une photo de toi (ou une capture d&apos;écran de ta vidéo), une phrase pour dire ce que tu fais, et tu reçois tes
        corrections en quelques secondes.
      </p>

      <div className="mt-8">
        {quota.allowed ? (
          <PhotoUploader
            remaining={quota.remaining}
            sports={riderSports(profile)}
            defaultSport={sport}
            shortcuts={shortcuts}
            defaultIntention={wanted}
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
