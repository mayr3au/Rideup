import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { periodStart } from "@/lib/auth";
import { DEFAULT_SETTINGS, type Plan, type PlanSettings } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Profile, TrickProgress } from "@/lib/types";
import type { RiderHistory } from "@/lib/ai";

export async function getPlanSettings(db: SupabaseClient): Promise<Record<Plan, PlanSettings>> {
  const { data } = await db.from("plan_settings").select("plan, monthly_analyses, monthly_coach_messages");
  const out = { ...DEFAULT_SETTINGS };
  for (const row of (data ?? []) as PlanSettings[]) out[row.plan] = row;
  return out;
}

type Kind = "analyses" | "coachMessages";
const LEDGER_KIND = { analyses: "analyse", coachMessages: "coach" } as const;

async function limitFor(plan: Plan, kind: Kind) {
  const settings = (await getPlanSettings(createAdminClient()))[plan];
  return kind === "analyses" ? settings.monthly_analyses : settings.monthly_coach_messages;
}

/** Essai gratuit : total à vie. Formules payantes : période d'abonnement en cours. */
function since(profile: Profile, plan: Plan) {
  return plan === "free" ? null : periodStart(profile);
}

/**
 * Consommation lue dans le registre usage_events, que l'utilisateur ne peut pas modifier :
 * supprimer une analyse ou effacer le chat ne rend pas de quota.
 */
export async function getQuota(_db: SupabaseClient, profile: Profile, plan: Plan, kind: Kind) {
  const db = createAdminClient();
  const limit = await limitFor(plan, kind);
  const from = since(profile, plan);
  let q = db
    .from("usage_events")
    .select("id", { count: "exact", head: true })
    .eq("user_id", profile.id)
    .eq("kind", LEDGER_KIND[kind]);
  if (from) q = q.gte("created_at", from.toISOString());
  const { count } = await q;
  const used = count ?? 0;
  return { used, limit, remaining: Math.max(0, limit - used), allowed: used < limit, since: from };
}

/** Réserve une unité de quota de façon atomique (fonction SQL avec verrou par utilisateur). */
export async function reserveQuota(profile: Profile, plan: Plan, kind: Kind, ref?: string) {
  const db = createAdminClient();
  const limit = await limitFor(plan, kind);
  const { data, error } = await db.rpc("reserve_usage", {
    p_user: profile.id,
    p_kind: LEDGER_KIND[kind],
    p_limit: limit,
    p_since: since(profile, plan)?.toISOString() ?? null,
    p_ref: ref ?? null,
  });
  if (error) throw new Error(`Réservation de quota impossible : ${error.message}`);
  return { allowed: data === true, limit };
}

/** Rend le quota d'une analyse qui a échoué ou a été annulée. */
export async function releaseAnalysis(analysisId: string) {
  await createAdminClient().from("usage_events").delete().eq("kind", "analyse").eq("ref", analysisId);
}

/** Analyses bloquées (onglet fermé, réseau coupé) depuis plus de 10 min : échec, quota rendu. */
export async function sweepStaleAnalyses(userId: string) {
  const db = createAdminClient();
  const { data } = await db
    .from("video_analyses")
    .update({ status: "erreur", counted: false, error: "Interrompue" })
    .eq("user_id", userId)
    .in("status", ["en-attente", "en-cours"])
    .lt("created_at", new Date(Date.now() - 10 * 60 * 1000).toISOString())
    .select("id");
  for (const row of data ?? []) await releaseAnalysis(row.id);
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
