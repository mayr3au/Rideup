import type { Metadata } from "next";
import Link from "next/link";
import { requireSession, effectivePlan } from "@/lib/auth";
import { FREE_LIMITS } from "@/lib/plans";
import { trickById } from "@/lib/tricks";
import type { VideoAnalysis } from "@/lib/types";
import { AnalyseUploader } from "@/components/analyse-uploader";

export const metadata: Metadata = { title: "Analyse vidéo" };

export default async function AnalysePage({ searchParams }: { searchParams: Promise<{ figure?: string }> }) {
  const { figure } = await searchParams;
  const { supabase, profile } = await requireSession();
  const plan = effectivePlan(profile);

  const { data: analyses } = await supabase
    .from("video_analyses")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50)
    .returns<VideoAnalysis[]>();

  return (
    <div className="grid gap-10 lg:grid-cols-[1.1fr_1fr]">
      <section>
        <h1 className="text-4xl font-bold sm:text-5xl">Analyse vidéo</h1>
        <p className="mt-3 text-slate">
          Envoie un clip de ta figure : tu reçois une note, les erreurs à corriger dans l&apos;ordre et les drills
          pour ta prochaine session.
          {plan === "free" && ` Ton essai gratuit inclut ${FREE_LIMITS.analyses} analyse.`}
        </p>
        <div className="mt-8">
          <AnalyseUploader defaultTrick={figure && trickById(figure) ? figure : undefined} />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Historique</h2>
        {analyses && analyses.length > 0 ? (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {analyses.map((a) => (
              <li key={a.id}>
                <Link href={`/analyse/${a.id}`} className="flex items-center justify-between gap-4 py-4 hover:text-lagoon">
                  <span className="min-w-0">
                    <span className="block truncate font-semibold">
                      {a.result?.figure ?? trickById(a.trick ?? "")?.name ?? "Figure à identifier"}
                    </span>
                    <span className="text-sm text-slate">
                      {new Date(a.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  </span>
                  <span className="shrink-0 font-display text-lg font-bold">
                    {a.status === "termine" && a.result ? `${a.result.note}/10` : a.status === "erreur" ? "Échec" : "En cours"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-4 text-slate">Tes analyses apparaîtront ici.</p>
        )}
      </section>
    </div>
  );
}
