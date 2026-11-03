import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession, effectivePlan } from "@/lib/auth";
import { releaseAnalysis, reserveQuota, sweepStaleAnalyses } from "@/lib/usage";
import { createAdminClient } from "@/lib/supabase/admin";
import { MAX_SEGMENT_SECONDS } from "@/lib/plans";
import { isSport, trickById } from "@/lib/sports";

const body = z
  .object({
    sport: z.string().refine(isSport, "Sport inconnu."),
    trick: z.string(),
    notes: z.string().trim().min(3, "Dis au coach ce que tu as voulu faire (ex. « mon premier saut », « un backroll »).").max(800),
    extension: z.enum(["mp4", "mov", "webm"]),
    clipHash: z.string().regex(/^[a-f0-9]{64}$/),
    segStart: z.number().min(0),
    segEnd: z.number().positive(),
  })
  .refine((b) => b.trick === "" || trickById(b.trick)?.sport === b.sport, { message: "Cette figure ne correspond pas au sport choisi." })
  .refine((b) => b.segEnd > b.segStart && b.segEnd - b.segStart <= MAX_SEGMENT_SECONDS + 0.2, {
    message: `Le passage doit durer ${MAX_SEGMENT_SECONDS} secondes maximum.`,
  });

/**
 * Étape 1 de l'envoi au coach : réservation atomique du quota et création de l'analyse.
 * Le navigateur envoie ensuite la vidéo dans le stockage privé, puis confirme (POST /api/analyses/[id], "uploaded") :
 * l'analyse entre alors dans la file des coachs.
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.profile) return NextResponse.json({ error: "Connecte-toi pour envoyer une vidéo." }, { status: 401 });
  const { user, profile } = session;

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Formulaire invalide." }, { status: 400 });
  }
  const b = parsed.data;
  const plan = effectivePlan(profile);
  await sweepStaleAnalyses(user.id);

  const id = crypto.randomUUID();
  const quota = await reserveQuota(profile, plan, "analyses", id);
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error:
          plan === "free"
            ? "Ton analyse d'essai est utilisée. Choisis une formule pour continuer."
            : `Tu as utilisé tes ${quota.limit} analyses de la période. ${plan === "progress" ? "Passe à Elite pour en avoir davantage, ou attends" : "Attends"} le renouvellement de ton abonnement.`,
        upgrade: plan !== "elite",
      },
      { status: 429 },
    );
  }

  const videoPath = `${user.id}/${b.clipHash.slice(0, 16)}-${id.slice(0, 8)}.${b.extension}`;
  const { error } = await createAdminClient().from("video_analyses").insert({
    id,
    user_id: user.id,
    sport: b.sport,
    trick: b.trick || null,
    notes: b.notes,
    video_path: videoPath,
    clip_hash: b.clipHash,
    seg_start: b.segStart,
    seg_end: b.segEnd,
    depth: plan === "elite" ? "approfondie" : "standard",
    priority: plan === "elite",
    status: "envoi",
  });
  if (error) {
    await releaseAnalysis(id);
    return NextResponse.json({ error: "Création de l'analyse impossible." }, { status: 500 });
  }

  return NextResponse.json({ id, videoPath });
}
