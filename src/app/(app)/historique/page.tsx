import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { TRICKS, trickById } from "@/lib/tricks";
import type { VideoAnalysis } from "@/lib/types";

export const metadata: Metadata = { title: "Historique" };

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ figure?: string }> }) {
  const { figure } = await searchParams;
  const { supabase } = await requireSession();

  let q = supabase
    .from("video_analyses")
    .select("id, trick, status, result, created_at, seg_start, seg_end, depth")
    .in("status", ["termine", "erreur"])
    .order("created_at", { ascending: false })
    .limit(100);
  if (figure) q = q.eq("trick", figure);
  const { data: analyses } = await q.returns<VideoAnalysis[]>();

  const { data: tricksUsed } = await supabase.from("video_analyses").select("trick").not("trick", "is", null);
  const filterTricks = [...new Set((tricksUsed ?? []).map((t) => t.trick as string))]
    .map((id) => trickById(id))
    .filter(Boolean);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-4xl font-bold sm:text-5xl">Historique</h1>

      {filterTricks.length > 1 && (
        <nav className="-mx-4 mt-6 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Filtrer par figure">
          <Link href="/historique" className={`whitespace-nowrap rounded-full px-4 py-2 text-[0.95rem] ${!figure ? "bg-deep text-salt" : "border border-line"}`}>
            Toutes
          </Link>
          {TRICKS.filter((t) => filterTricks.some((f) => f?.id === t.id)).map((t) => (
            <Link
              key={t.id}
              href={`/historique?figure=${t.id}`}
              className={`whitespace-nowrap rounded-full px-4 py-2 text-[0.95rem] ${figure === t.id ? "bg-deep text-salt" : "border border-line"}`}
            >
              {t.name}
            </Link>
          ))}
        </nav>
      )}

      {analyses && analyses.length > 0 ? (
        <ul className="mt-6 divide-y divide-line border-y border-line">
          {analyses.map((a) => (
            <li key={a.id}>
              <Link href={`/analyse/${a.id}`} className="flex items-center justify-between gap-4 py-4 hover:text-lagoon">
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
                <span className="shrink-0 font-display text-xl font-bold">
                  {a.status === "termine" && a.result ? `${a.result.note}/10` : "Échec"}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-line p-6">
          <p>Aucune analyse pour l&apos;instant.</p>
          <Link href="/analyse" className="btn btn-primary mt-4">Analyser une figure</Link>
        </div>
      )}
    </div>
  );
}
