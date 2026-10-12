import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { periodStart } from "@/lib/auth";
import { DEFAULT_SETTINGS, type Plan, type PlanSettings } from "@/lib/plans";
import type { Profile, TrickProgress } from "@/lib/types";
import type { RiderHistory } from "@/lib/ai";

export async function getPlanSettings(db: SupabaseClient): Promise<Record<Plan, PlanSettings>> {
  const { data } = await db.from("plan_settings").select("plan, monthly_analyses, monthly_coach_messages");
  const out = { ...DEFAULT_SETTINGS };
  for (const row of (data ?? []) as PlanSettings[]) out[row.plan] = row;
  return out;
}

type Kind = "analyses" | "coachMessages";

/** Consommation de la période en cours et limite de la formule. */
export async function getQuota(db: SupabaseClient, profile: Profile, plan: Plan, kind: Kind) {
  const settings = (await getPlanSettings(db))[plan];
  const limit = kind === "analyses" ? settings.monthly_analyses : settings.monthly_coach_messages;

  let q =
    kind === "analyses"
      ? db.from("video_analyses").select("id", { count: "exact", head: true }).eq("user_id", profile.id).eq("counted", true).neq("status", "erreur")
      : db.from("coach_messages").select("id", { count: "exact", head: true }).eq("user_id", profile.id).eq("role", "user");

  // Essai gratuit : total à vie. Formules payantes : période en cours.
  const since = plan === "free" ? null : periodStart(profile);
  if (since) q = q.gte("created_at", since.toISOString());

  const { count } = await q;
  const used = count ?? 0;
  return { used, limit, remaining: Math.max(0, limit - used), allowed: used < limit, since };
}

/** Historique utile au coach : progression et erreurs récurrentes des 15 dernières analyses. */
export async function getRiderHistory(db: SupabaseClient, userId: string): Promise<RiderHistory> {
  const [{ data: progress }, { data: recent }] = await Promise.all([
    db.from("trick_progress").select("*").eq("user_id", userId).returns<TrickProgress[]>(),
    db
      .from("video_analyses")
      .select("id")
      .eq("user_id", userId)
      .eq("status", "termine")
      .order("created_at", { ascending: false })
      .limit(15),
  ]);
  const ids = (recent ?? []).map((r) => r.id);
  const counts = new Map<string, number>();
  if (ids.length) {
    const { data: errors } = await db.from("analysis_errors").select("code").in("analysis_id", ids);
    for (const e of errors ?? []) if (e.code !== "autre") counts.set(e.code, (counts.get(e.code) ?? 0) + 1);
  }
  const recurringErrors = [...counts.entries()]
    .filter(([, n]) => n >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([code, count]) => ({ code, count }));
  return { progress: progress ?? [], recurringErrors };
}
