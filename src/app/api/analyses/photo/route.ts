import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { getSession, effectivePlan } from "@/lib/auth";
import { analysePhoto, MODEL } from "@/lib/ai";
import { releaseAnalysis, reserveQuota, sweepStaleAnalyses } from "@/lib/usage";
import { createAdminClient } from "@/lib/supabase/admin";
import { ANALYSIS_DEPTH } from "@/lib/plans";
import { isSport } from "@/lib/sports";

export const maxDuration = 120;

const body = z.object({
  sport: z.string().refine(isSport, "Sport inconnu."),
  intention: z.string().trim().min(3, "Écris ce que tu fais sur la photo (ex. « premier saut, en l'air »).").max(300),
  image: z.string().startsWith("data:image/jpeg;base64,").max(2_500_000), // photo pour l'IA (≤ 1568 px)
  thumb: z.string().startsWith("data:image/jpeg;base64,").max(200_000), // miniature gardée avec le résultat
  mini: z.string().startsWith("data:image/jpeg;base64,").max(30_000).optional(), // vignette pour les listes
});

/** Analyse photo : une image + ce que fait le rider → retour sur sa position, en une seule requête. */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.profile) return NextResponse.json({ error: "Connecte-toi pour analyser une photo." }, { status: 401 });
  const { supabase, user, profile } = session;

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Formulaire invalide." }, { status: 400 });
  }
  const b = parsed.data;
  const plan = effectivePlan(profile);
  await sweepStaleAnalyses(user.id);

  // Même photo, même sport, même description : on ressort le résultat sans repayer
  const imageHash = createHash("sha256").update(b.image).digest("hex");
  const cacheKey = createHash("sha256").update(["photo-v1", imageHash, b.sport, b.intention.toLowerCase()].join("|")).digest("hex");
  const { data: cached } = await supabase
    .from("video_analyses")
    .select("id")
    .eq("cache_key", cacheKey)
    .eq("status", "termine")
    .limit(1)
    .maybeSingle();
  if (cached) return NextResponse.json({ id: cached.id });

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

  const db = createAdminClient();
  const { error: insertError } = await db.from("video_analyses").insert({
    id,
    user_id: user.id,
    sport: b.sport,
    notes: b.intention,
    clip_hash: imageHash,
    depth: ANALYSIS_DEPTH[plan].depth,
    cache_key: cacheKey,
    status: "en-cours",
  });
  if (insertError) {
    await releaseAnalysis(id);
    return NextResponse.json({ error: "Création de l'analyse impossible." }, { status: 500 });
  }

  try {
    const { result, cost } = await analysePhoto({
      userId: user.id,
      sport: b.sport as Parameters<typeof analysePhoto>[0]["sport"],
      image: b.image.replace(/^data:image\/jpeg;base64,/, ""),
      intention: b.intention,
    });
    result.image = b.thumb;
    if (b.mini) result.mini = b.mini;
    const trickId = result.figure_id;
    await db.from("video_analyses").update({ status: "termine", counted: true, result, model: MODEL, cost_usd: cost, trick: trickId }).eq("id", id);
    if (result.erreurs.length) {
      await db.from("analysis_errors").insert(result.erreurs.map((e) => ({ analysis_id: id, user_id: user.id, trick_id: trickId, code: e.code })));
    }
    if (trickId) {
      await supabase
        .from("trick_progress")
        .upsert(
          { user_id: user.id, trick_id: trickId, status: "en-cours", updated_at: new Date().toISOString() },
          { onConflict: "user_id,trick_id", ignoreDuplicates: true },
        );
    }
    return NextResponse.json({ id });
  } catch (e) {
    console.error("analyse photo", e);
    await db.from("video_analyses").update({ status: "erreur", counted: false, error: "Analyse impossible" }).eq("id", id);
    await releaseAnalysis(id);
    return NextResponse.json({ error: "L'analyse a échoué. Elle n'est pas décomptée : réessaie." }, { status: 502 });
  }
}
