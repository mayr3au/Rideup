import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { SportId } from "@/lib/sports";
import type { CoachMessage } from "@/lib/types";

type Msg = Pick<CoachMessage, "role" | "content">;

/**
 * Coach IA : une discussion par sport (colonne coach_messages.sport, migration 0007).
 * Tant que la migration n'est pas passée, on retombe sur l'ancienne discussion unique au lieu de casser le chat.
 */
const missingColumn = (e: { code?: string; message?: string } | null) => !!e && (e.code === "42703" || /sport/.test(e.message ?? ""));

/** Derniers messages de la discussion, du plus ancien au plus récent. */
export async function loadThread(db: SupabaseClient, sport: SportId, limit: number): Promise<Msg[]> {
  const query = (bySport: boolean) => {
    let q = db.from("coach_messages").select("role, content").order("created_at", { ascending: false }).limit(limit);
    if (bySport) q = q.eq("sport", sport);
    return q.returns<Msg[]>();
  };
  let { data, error } = await query(true);
  if (missingColumn(error)) ({ data, error } = await query(false));
  return (data ?? []).reverse();
}

export async function saveExchange(db: SupabaseClient, userId: string, sport: SportId, question: string, reply: string) {
  const now = Date.now();
  const rows = [
    { user_id: userId, role: "user", content: question, created_at: new Date(now).toISOString(), sport },
    { user_id: userId, role: "assistant", content: reply, created_at: new Date(now + 1).toISOString(), sport },
  ];
  const { error } = await db.from("coach_messages").insert(rows);
  if (missingColumn(error)) await db.from("coach_messages").insert(rows.map(({ sport: _s, ...r }) => r));
}

export async function clearThread(db: SupabaseClient, userId: string, sport: SportId) {
  const { error } = await db.from("coach_messages").delete().eq("user_id", userId).eq("sport", sport);
  if (missingColumn(error)) await db.from("coach_messages").delete().eq("user_id", userId);
}
