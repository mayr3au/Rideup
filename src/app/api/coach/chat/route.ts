import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession, effectivePlan } from "@/lib/auth";
import { streamCoachReply } from "@/lib/ai";
import { activeSport } from "@/lib/rider";
import { getRiderHistory, reserveQuota } from "@/lib/usage";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadThread, saveExchange } from "@/lib/coach-thread";

export const maxDuration = 60;

const body = z.object({ message: z.string().trim().min(1).max(2000), sport: z.string().optional() });

/** Message au coach : la réponse est envoyée au fil de l'écriture (texte brut en flux). */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.profile) return NextResponse.json({ error: "Connecte-toi pour parler au coach." }, { status: 401 });
  const { supabase, user, profile } = session;

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Message vide ou trop long (2000 caractères max)." }, { status: 400 });

  const plan = effectivePlan(profile);
  const ref = crypto.randomUUID();
  const quota = await reserveQuota(profile, plan, "coachMessages", ref);
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

  const sport = activeSport(profile, parsed.data.sport);
  // Une discussion par sport : le coach ne voit que l'historique du sport en cours
  const [past, history] = await Promise.all([loadThread(supabase, sport, 16), getRiderHistory(supabase, user.id)]);

  const messages = [...past];
  while (messages.length && messages[0].role !== "user") messages.shift();
  const db = createAdminClient();

  const stream = streamCoachReply(
    profile,
    sport,
    history,
    [...messages, { role: "user", content: parsed.data.message }],
    async (reply) => {
      if (!reply) {
        await db.from("usage_events").delete().eq("kind", "coach").eq("ref", ref);
        return;
      }
      await saveExchange(db, user.id, sport, parsed.data.message, reply);
    },
  );

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
