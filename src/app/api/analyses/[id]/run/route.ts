import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { analyseFrames } from "@/lib/ai";
import { createAdminClient } from "@/lib/supabase/admin";
import type { VideoAnalysis } from "@/lib/types";

export const maxDuration = 120;

const MAX_FRAME_B64 = 400_000; // ~300 Ko par image

const body = z.object({
  frames: z.array(z.string().max(MAX_FRAME_B64)).min(3).max(10),
});

/** Étape 2 : reçoit les images extraites du clip côté navigateur et lance l'analyse IA. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.profile) return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  const { supabase, profile } = session;

  // La RLS garantit que l'analyse appartient bien à l'utilisateur.
  const { data: analysis } = await supabase.from("video_analyses").select("*").eq("id", id).single<VideoAnalysis>();
  if (!analysis) return NextResponse.json({ error: "Analyse introuvable." }, { status: 404 });
  if (analysis.status !== "en-attente") return NextResponse.json({ error: "Analyse déjà traitée." }, { status: 409 });

  const db = createAdminClient();
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    await db.from("video_analyses").update({ status: "erreur", error: "Images invalides" }).eq("id", id);
    return NextResponse.json({ error: "Les images du clip n'ont pas pu être lues." }, { status: 400 });
  }

  try {
    const result = await analyseFrames({
      profile,
      frames: parsed.data.frames.map((f) => f.replace(/^data:image\/jpeg;base64,/, "")),
      trickId: analysis.trick,
      notes: analysis.notes,
    });
    await db.from("video_analyses").update({ status: "termine", result }).eq("id", id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("analyse", e);
    await db.from("video_analyses").update({ status: "erreur", error: "Échec de l'analyse IA" }).eq("id", id);
    return NextResponse.json(
      { error: "L'analyse a échoué. Elle n'est pas décomptée : réessaie avec le même clip." },
      { status: 502 },
    );
  }
}
