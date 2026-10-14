import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { SPORTS, trickById, tricksFor } from "@/lib/sports";
import { activeSport } from "@/lib/rider";
import type { VideoAnalysis } from "@/lib/types";

export const metadata: Metadata = { title: "Historique" };

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ figure?: string }> }) {
  const { figure } = await searchParams;
  const { supabase, profile } = await requireSession();
  const sport = activeSport(profile);

  let q = supabase
    .from("video_analyses")
    .select("id, trick, status, result, created_at, seg_start, seg_end, depth")
    .eq("sport", sport)
    .in("status", ["termine", "erreur"])
    .order("created_at", { ascending: false })
    .limit(100);
  if (figure) q = q.eq("trick", figure);
  const { data: analyses } = await q.returns<VideoAnalysis[]>();

  const { data: tricksUsed } = await supabase.from("video_analyses").select("trick").eq("sport", sport).not("trick", "is", null);
  const filterTricks = [...new Set((tricksUsed ?? []).map((t) => t.trick as string))]
    .map((id) => trickById(id))
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold sm:text-4xl">Historique {SPORTS[sport].name.toLowerCase()}</h1>

      {filterTricks.length > 1 && (
        <nav className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Filtrer par figure">
          <Link href="/historique" className={`min-h-10 whitespace-nowrap rounded-full px-4 py-2 text-[0.95rem] font-semibold ${!figure ? "bg-brand text-white" : "bg-raised"}`}>
            Toutes
          </Link>
          {tricksFor(sport).filter((t) => filterTricks.some((f) => f?.id === t.id)).map((t) => (
            <Link
              key={t.id}
              href={`/historique?figure=${t.id}`}
              className={`min-h-10 whitespace-nowrap rounded-full px-4 py-2 text-[0.95rem] font-semibold ${figure === t.id ? "bg-brand text-white" : "bg-raised"}`}
            >
              {t.name}
            </Link>
          ))}
        </nav>
      )}

      {analyses && analyses.length > 0 ? (
        <ul className="mt-6 space-y-2">
          {analyses.map((a) => (
            <li key={a.id}>
              <Link href={`/analyse/${a.id}`} className="panel flex items-center justify-between gap-4 px-4 py-3.5 hover:ring-2 hover:ring-brand">
                <span className="min-w-0">
                  <span className="block truncate font-semibold">
                    {a.result?.figure ?? trickById(a.trick ?? "")?.name ?? "Analyse"}
                  </span>
                  <span className="text-sm text-slate">
                    {new Date(a.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })}
                    {" · "}
                    {(Number(a.seg_end) - Number(a.seg_start)).toFixed(0)} s
                    {a.depth === "approfondie" && " · approfondie"}
                  </span>
                  {a.result?.priorite_session && (
                    <span className="mt-1 line-clamp-1 block text-sm text-slate">{a.result.priorite_session}</span>
                  )}
                </span>
                <span className={`shrink-0 text-xl font-extrabold ${a.status === "termine" && a.result ? "text-brand" : "text-sm font-semibold text-slate"}`}>
                  {a.status === "termine" && a.result ? `${a.result.note}/10` : a.status === "erreur" ? "Échec" : "En cours…"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="panel mt-6 p-6 text-center">
          <p className="text-lg font-bold">Aucune analyse pour l&apos;instant</p>
          <p className="mt-1 text-slate">Filme une figure, garde 20 secondes, et reçois ton premier retour de coach.</p>
          <Link href="/analyse" className="btn btn-primary mt-4">Analyser une figure</Link>
        </div>
      )}
    </div>
  );
}
