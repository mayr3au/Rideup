import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { errorLabel, tricksFor, type SportId } from "@/lib/sports";
import type { AnalysisResult, TrickProgress, VideoAnalysis } from "@/lib/types";

type Row = Pick<VideoAnalysis, "id" | "trick" | "created_at" | "result">;

export type TrickStats = {
  trickId: string;
  name: string;
  attempts: number;
  best: number;
  last: number;
  first: number;
  notes: { date: string; note: number; id: string }[];
  status: TrickProgress["status"] | null;
};

export type ErrorTrend = {
  code: string;
  label: string;
  total: number;
  recent: number; // dans les 5 dernières analyses
  older: number; // dans les 5 précédentes
  trend: "en-baisse" | "en-hausse" | "stable" | "nouvelle";
  lastCorrection: string | null;
};

/** Toutes les données de la page Progression, calculées sans appel IA. */
/** Données de progression pour un sport donné. */
export async function getProgressData(db: SupabaseClient, userId: string, sport: SportId) {
  const TRICKS = tricksFor(sport);
  const [{ data: rows }, { data: progress }] = await Promise.all([
    db
      .from("video_analyses")
      .select("id, trick, created_at, result")
      .eq("user_id", userId)
      .eq("sport", sport)
      .eq("status", "termine")
      .order("created_at", { ascending: true })
      .limit(300)
      .returns<Row[]>(),
    db.from("trick_progress").select("*").eq("user_id", userId).returns<TrickProgress[]>(),
  ]);

  const analyses = (rows ?? []).filter((r) => r.result) as (Row & { result: AnalysisResult })[];
  const status = new Map((progress ?? []).map((p) => [p.trick_id, p.status]));

  // Statistiques par figure
  const byTrick = new Map<string, TrickStats>();
  for (const a of analyses) {
    const id = a.trick ?? a.result.figure_id;
    if (!id) continue;
    const t = TRICKS.find((x) => x.id === id);
    if (!t) continue;
    const s =
      byTrick.get(id) ??
      { trickId: id, name: t.name, attempts: 0, best: 0, last: 0, first: a.result.note, notes: [], status: status.get(id) ?? null };
    s.attempts++;
    s.best = Math.max(s.best, a.result.note);
    s.last = a.result.note;
    s.notes.push({ date: a.created_at, note: a.result.note, id: a.id });
    byTrick.set(id, s);
  }
  const tricks = [...byTrick.values()].sort((a, b) => b.notes.at(-1)!.date.localeCompare(a.notes.at(-1)!.date));

  // Évolution des erreurs : 5 dernières analyses vs 5 précédentes
  const recent = analyses.slice(-5);
  const older = analyses.slice(-10, -5);
  const count = (list: typeof analyses) => {
    const m = new Map<string, number>();
    for (const a of list) for (const e of new Set(a.result.erreurs.map((x) => x.code))) m.set(e, (m.get(e) ?? 0) + 1);
    return m;
  };
  const all = count(analyses.slice(-20));
  const r = count(recent);
  const o = count(older);
  const errors: ErrorTrend[] = [...all.entries()]
    .filter(([code]) => code !== "autre")
    .map(([code, total]) => {
      const rc = r.get(code) ?? 0;
      const oc = o.get(code) ?? 0;
      const trend: ErrorTrend["trend"] =
        older.length === 0 ? "stable" : oc === 0 && rc > 0 ? "nouvelle" : rc < oc ? "en-baisse" : rc > oc ? "en-hausse" : "stable";
      const last = [...analyses].reverse().find((a) => a.result.erreurs.some((e) => e.code === code));
      return {
        code,
        label: errorLabel(code),
        total,
        recent: rc,
        older: oc,
        trend,
        lastCorrection: last?.result.erreurs.find((e) => e.code === code)?.correction ?? null,
      };
    })
    .sort((a, b) => b.recent - a.recent || b.total - a.total);

  // Priorités pour la prochaine session
  const lastAnalysis = analyses.at(-1);
  const priorities: { title: string; detail: string }[] = [];
  const topRecurring = errors.find((e) => e.recent >= 2);
  if (topRecurring) {
    priorities.push({
      title: `Corriger : ${topRecurring.label.toLowerCase()}`,
      detail: topRecurring.lastCorrection ?? "Revois la correction proposée dans ta dernière analyse.",
    });
  }
  if (lastAnalysis?.result.priorite_session && !priorities.some((p) => p.detail === lastAnalysis.result.priorite_session)) {
    priorities.push({ title: `Sur ${lastAnalysis.result.figure}`, detail: lastAnalysis.result.priorite_session });
  }

  const validated = TRICKS.filter((t) => status.get(t.id) === "valide");
  const working = TRICKS.filter((t) => status.get(t.id) === "en-cours");
  const nextTrick = TRICKS.find((t) => !status.get(t.id));

  return {
    sport,
    totalTricks: TRICKS.length,
    analysesCount: analyses.length,
    average: analyses.length ? analyses.slice(-10).reduce((s, a) => s + a.result.note, 0) / Math.min(10, analyses.length) : null,
    tricks,
    errors,
    priorities,
    validated,
    working,
    nextTrick,
    recentAttempts: analyses.slice(-8).map((a) => ({
      date: new Date(a.created_at).toLocaleDateString("fr-FR"),
      figure: a.result.figure,
      note: a.result.note,
      codes: a.result.erreurs.map((e) => e.code),
      priorite: a.result.priorite_session,
    })),
  };
}
