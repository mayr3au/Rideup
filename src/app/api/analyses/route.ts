import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession, effectivePlan } from "@/lib/auth";
import { checkQuota } from "@/lib/usage";
import { createAdminClient } from "@/lib/supabase/admin";
import { TRICKS } from "@/lib/tricks";

const body = z.object({
  trick: z.string().refine((t) => t === "" || TRICKS.some((x) => x.id === t)).optional(),
  notes: z.string().trim().max(500).optional(),
  extension: z.enum(["mp4", "mov", "webm"]),
});

/** Étape 1 : réserve une analyse (vérifie le quota) et renvoie le chemin d'upload du clip. */
export async function POST(request: NextRequest) {
  const session = await getSession();
  if (!session?.profile) return NextResponse.json({ error: "Connecte-toi pour analyser un clip." }, { status: 401 });
  const { supabase, user, profile } = session;

  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });

  const quota = await checkQuota(supabase, user.id, effectivePlan(profile), "analyses");
  if (!quota.allowed) {
    return NextResponse.json(
      {
        error:
          quota.reason === "free"
            ? "Ton analyse d'essai est utilisée. Passe au Standard pour des analyses illimitées."
            : "Limite quotidienne atteinte. Réessaie demain.",
        upgrade: quota.reason === "free",
      },
      { status: 429 },
    );
  }

  const id = crypto.randomUUID();
  const videoPath = `${user.id}/${id}.${parsed.data.extension}`;

  const { error } = await createAdminClient().from("video_analyses").insert({
    id,
    user_id: user.id,
    trick: parsed.data.trick || null,
    notes: parsed.data.notes || null,
    video_path: videoPath,
    status: "en-attente",
  });
  if (error) return NextResponse.json({ error: "Création de l'analyse impossible." }, { status: 500 });

  return NextResponse.json({ id, videoPath });
}
