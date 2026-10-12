import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { DAILY_FAIR_USE, FREE_LIMITS, type Plan } from "@/lib/plans";

type Kind = "analyses" | "coachMessages";

async function count(db: SupabaseClient, userId: string, kind: Kind, since?: Date) {
  let q =
    kind === "analyses"
      ? db.from("video_analyses").select("id", { count: "exact", head: true }).eq("user_id", userId).neq("status", "erreur")
      : db.from("coach_messages").select("id", { count: "exact", head: true }).eq("user_id", userId).eq("role", "user");
  if (since) q = q.gte("created_at", since.toISOString());
  const { count: n } = await q;
  return n ?? 0;
}

/** Vérifie si l'utilisateur peut encore utiliser la fonctionnalité. */
export async function checkQuota(db: SupabaseClient, userId: string, plan: Plan, kind: Kind) {
  if (plan === "free") {
    const used = await count(db, userId, kind);
    const limit = FREE_LIMITS[kind];
    return { allowed: used < limit, used, limit, reason: "free" as const };
  }
  const used = await count(db, userId, kind, new Date(Date.now() - 24 * 3600 * 1000));
  const limit = DAILY_FAIR_USE[kind];
  return { allowed: used < limit, used, limit, reason: "daily" as const };
}
