import { NextResponse, type NextRequest } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { getSession, effectivePlan } from "@/lib/auth";
import { releaseAnalysis, reserveQuota, sweepStaleAnalyses } from "@/lib/usage";
import { createAdminClient } from "@/lib/supabase/admin";
import { ANALYSIS_DEPTH, MAX_SEGMENT_SECONDS } from "@/lib/plans";
import { isSport, trickById } from "@/lib/sports";

const body = z
  .object({
    sport: z.string().refine(isSport, "Sport inconnu."),
    trick: z.string(),
    notes: z.string().trim().max(500),
    extension: z.enum(["mp4", "mov", "webm"]),
    clipHash: z.string().regex(/^[a-f0-9]{64}$/),
    segStart: z.number().min(0),
    segEnd: z.number().positive(),
    crop: z.array(z.number().min(0).max(1)).length(3).nullish(), // x, y, largeur (fractions) si l'image est zoomée
  })
  .refine((b) => b.trick === "" || trickById(b.trick)?.sport === b.sport, { message: "Cette figure ne correspond pas au sport choisi." })
  .refine((b) => b.segEnd > b.segStart && b.segEnd - b.segStart <= MAX_SEGMENT_SECONDS + 0.2, {
    message: `Le passage doit durer ${MAX_SEGMENT_SECONDS} secondes maximum.`,
  });

/**
 * Étape 1 de l'analyse.
 * - Si le même passage du même clip a déjà été analysé (même figure, même profondeur) : on renvoie
 *   l'analyse existante, sans appel IA et sans décompter le quota.
 * - Sinon : réservation atomique du quota, création de l'analyse, et chemin d'upload du clip
 *   (réutilisé si ce clip a déjà été envoyé).
 */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.profile) return NextResponse.json({ error: "Connecte-toi pour analyser un clip." }, { status: 401 });
  const { supabase, user, profile } = session;

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Formulaire invalide." }, { status: 400 });
  }
  const b = parsed.data;
  const plan = effectivePlan(profile);
  await sweepStaleAnalyses(user.id);
  const depth = ANALYSIS_DEPTH[plan];

  const cacheKey = createHash("sha256")
    .update([b.clipHash, b.segStart.toFixed(1), b.segEnd.toFixed(1), b.sport, b.trick || "-", depth.depth, b.crop?.join(",") ?? "full"].join("|"))
    .digest("hex");

  // 1. Résultat déjà disponible ?
  const { data: cached } = await supabase
    .from("video_analyses")
    .select("id")
    .eq("cache_key", cacheKey)
    .eq("status", "termine")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (cached) return NextResponse.json({ reusedId: cached.id });

  // 2. Quota, réservé de façon atomique (pas de course possible entre deux requêtes)
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

  // 3. Clip déjà envoyé ? On réutilise le fichier.
  const { data: sameClip } = await supabase
    .from("video_analyses")
    .select("video_path")
    .eq("clip_hash", b.clipHash)
    .eq("status", "termine")
    .not("video_path", "is", null)
    .limit(1)
    .maybeSingle();

  const videoPath = sameClip?.video_path ?? `${user.id}/${b.clipHash.slice(0, 16)}-${id.slice(0, 8)}.${b.extension}`;

  const { error } = await createAdminClient().from("video_analyses").insert({
    id,
    user_id: user.id,
    sport: b.sport,
    trick: b.trick || null,
    notes: b.notes || null,
    video_path: videoPath,
    clip_hash: b.clipHash,
    seg_start: b.segStart,
    seg_end: b.segEnd,
    depth: depth.depth,
    cache_key: cacheKey,
    status: "en-attente",
  });
  if (error) {
    await releaseAnalysis(id);
    return NextResponse.json({ error: "Création de l'analyse impossible." }, { status: 500 });
  }

  return NextResponse.json({
    id,
    videoPath,
    needsUpload: !sameClip,
    sheets: depth.sheets,
  });
}
