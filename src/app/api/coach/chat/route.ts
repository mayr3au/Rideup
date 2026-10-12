import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession, effectivePlan } from "@/lib/auth";
import { coachReply } from "@/lib/ai";
import { getQuota, getRiderHistory } from "@/lib/usage";
import { createAdminClient } from "@/lib/supabase/admin";
import type { CoachMessage } from "@/lib/types";

export const maxDuration = 60;

const body = z.object({ message: z.string().trim().min(1).max(2000) });

export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.profile) return NextResponse.json({ error: "Connecte-toi pour parler au coach." }, { status: 401 });
  const { supabase, user, profile } = session;

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Message vide ou trop long (2000 caractères max)." }, { status: 400 });

  const plan = effectivePlan(profile);
  const quota = await getQuota(supabase, profile, plan, "coachMessages");
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error:
          plan === "free"
            ? `Tu as utilisé tes ${quota.limit} messages d'essai. Choisis une formule pour continuer avec le coach.`
            : `Tu as atteint les ${quota.limit} messages de la période. Le compteur repart au renouvellement.`,
        upgrade: plan === "free",
      },
      { status: 429 },
    );
  }

  const [{ data: past }, history] = await Promise.all([
    supabase
      .from("coach_messages")
      .select("role, content")
      .order("created_at", { ascending: false })
      .limit(16)
      .returns<Pick<CoachMessage, "role" | "content">[]>(),
    getRiderHistory(supabase, user.id),
  ]);

  const messages = (past ?? []).reverse();
  while (messages.length && messages[0].role !== "user") messages.shift();

  let reply: string;
  try {
    reply = await coachReply(profile, history, [...messages, { role: "user", content: parsed.data.message }]);
  } catch (e) {
    console.error("coach", e);
    return NextResponse.json({ error: "Le coach ne répond pas pour le moment. Réessaie dans un instant." }, { status: 502 });
  }

  const now = Date.now();
  await createAdminClient().from("coach_messages").insert([
    { user_id: user.id, role: "user", content: parsed.data.message, created_at: new Date(now).toISOString() },
    { user_id: user.id, role: "assistant", content: reply, created_at: new Date(now + 1).toISOString() },
  ]);

  return NextResponse.json({ reply });
}
