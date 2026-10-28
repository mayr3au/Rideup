import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { SPORTS, trickById, tricksFor } from "@/lib/sports";
import { activeSport } from "@/lib/rider";

export const metadata: Metadata = { title: "Historique" };

type Row = {
  id: string;
  trick: string | null;
  status: "termine" | "erreur";
  created_at: string;
  seg_start: number | string;
  seg_end: number | string;
  figure: string | null;
  note: string | null;
  priorite: string | null;
  moment: string | null;
  mini: string | null;
  image: string | null;
};

export default async function HistoryPage({ searchParams }: { searchParams: Promise<{ figure?: string }> }) {
  const { figure } = await searchParams;
  const { supabase, profile } = await requireSession();
  const sport = activeSport(profile);

  // Seuls les champs utiles du rapport sont lus (pas tout le JSON)
  let q = supabase
    .from("video_analyses")
    .select(
      "id, trick, status, created_at, seg_start, seg_end, figure:result->>figure, note:result->>note, priorite:result->>priorite_session, moment:result->>moment, mini:result->>mini, image:result->>image",
    )
    .eq("sport", sport)
    .in("status", ["termine", "erreur"])
    .order("created_at", { ascending: false })
    .limit(100);
  if (figure) q = q.eq("trick", figure);
  const { data } = await q.returns<Row[]>();
  const analyses = data ?? [];

  const { data: tricksUsed } = await supabase.from("video_analyses").select("trick").eq("sport", sport).not("trick", "is", null);
  const filterTricks = [...new Set((tricksUsed ?? []).map((t) => t.trick as string))]
    .map((id) => trickById(id))
    .filter(Boolean);

  const notes = analyses.filter((a) => a.status === "termine" && a.note != null).map((a) => Number(a.note));
  const avg = notes.length ? notes.reduce((s, n) => s + n, 0) / notes.length : null;
  const best = notes.length ? Math.max(...notes) : null;

  // Regroupement par mois
  const groups = new Map<string, Row[]>();
  for (const a of analyses) {
    const key = new Date(a.created_at).toLocaleDateString("fr-FR", { month: "long", year: "numeric" });
    groups.set(key, [...(groups.get(key) ?? []), a]);
  }
  let shownImages = 0;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h1 className="text-3xl font-bold sm:text-4xl">Historique {SPORTS[sport].name.toLowerCase()}</h1>
        <Link href="/analyse" className="btn btn-primary !min-h-10 !px-4 !py-2 !text-sm">Nouvelle analyse</Link>
      </div>

      {notes.length > 0 && (
        <dl className="mt-5 grid grid-cols-3 gap-3">
          {[
            { label: "Analyses", value: String(notes.length) },
            { label: "Moyenne", value: avg!.toFixed(1).replace(".", ",") },
            { label: "Meilleure", value: `${best}/10` },
          ].map((s) => (
            <div key={s.label} className="panel px-4 py-3">
              <dt className="text-sm text-slate">{s.label}</dt>
              <dd className="text-2xl font-extrabold">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}

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

      {analyses.length > 0 ? (
        <div className="mt-6 space-y-6">
          {[...groups.entries()].map(([month, rows]) => (
            <section key={month}>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate">{month}</h2>
              <ul className="mt-2 space-y-2">
                {rows.map((a) => {
                  const ok = a.status === "termine" && a.note != null;
                  // Vignette : la petite si elle existe, sinon la miniature (limitée pour garder la page légère)
                  const thumb = a.mini ?? (a.image && shownImages < 12 ? a.image : null);
                  if (!a.mini && thumb) shownImages++;
                  const photo = Number(a.seg_end) - Number(a.seg_start) === 0;
                  return (
                    <li key={a.id}>
                      <Link href={`/analyse/${a.id}`} className="panel flex items-center gap-3 px-3 py-3 hover:ring-2 hover:ring-brand">
                        {thumb ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={thumb} alt="" className="h-14 w-14 shrink-0 rounded-xl object-cover" />
                        ) : (
                          <span aria-hidden="true" className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand-light text-brand">
                            <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                              {photo ? (
                                <>
                                  <path d="M4 8h3l2-3h6l2 3h3v11H4z" />
                                  <circle cx="12" cy="13" r="3.5" />
                                </>
                              ) : (
                                <path d="M3 6h12v12H3zM15 10l6-3v10l-6-3z" />
                              )}
                            </svg>
                          </span>
                        )}
                        <span className="min-w-0 flex-1">
                          <span className="block truncate font-semibold">{a.figure ?? trickById(a.trick ?? "")?.name ?? "Analyse"}</span>
                          <span className="block truncate text-sm text-slate">
                            {new Date(a.created_at).toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" })}
                            {photo ? (a.moment ? ` · ${a.moment}` : " · photo") : ` · vidéo ${(Number(a.seg_end) - Number(a.seg_start)).toFixed(0)} s`}
                          </span>
                          {a.priorite && <span className="mt-0.5 line-clamp-1 text-sm text-slate">{a.priorite}</span>}
                        </span>
                        <span className={`shrink-0 ${ok ? "text-xl font-extrabold text-brand" : "text-sm font-semibold text-slate"}`}>
                          {ok ? `${Number(a.note)}/10` : a.status === "erreur" ? "Échec" : "En cours…"}
                        </span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <div className="panel mt-6 p-6 text-center">
          <p className="text-lg font-bold">Aucune analyse pour l&apos;instant</p>
          <p className="mt-1 text-slate">Envoie une photo de ta figure et reçois ton premier retour de coach.</p>
          <Link href="/analyse" className="btn btn-primary mt-4">Analyser ma position</Link>
        </div>
      )}
    </div>
  );
}
