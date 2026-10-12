import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { releaseAnalysis } from "@/lib/usage";

/**
 * Incidents côté navigateur :
 * - "cancel" : l'analyse n'a pas pu partir (lecture du clip impossible…) → non décomptée.
 * - "video-missing" : l'analyse a réussi mais l'envoi du clip a échoué → on retire le lien vidéo.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const { action } = (await request.json().catch(() => ({}))) as { action?: string };
  const { data: row } = await session.supabase.from("video_analyses").select("id").eq("id", id).maybeSingle();
  if (!row) return NextResponse.json({ error: "Analyse introuvable." }, { status: 404 });

  const db = createAdminClient();
  if (action === "cancel") {
    // Seulement si l'analyse n'a pas encore été prise en charge
    const { data: cancelled } = await db
      .from("video_analyses")
      .update({ status: "erreur", counted: false, error: "Annulée" })
      .eq("id", id)
      .eq("status", "en-attente")
      .select("id");
    if (cancelled?.length) await releaseAnalysis(id);
  } else if (action === "video-missing") {
    await db.from("video_analyses").update({ video_path: null }).eq("id", id);
  }
  return NextResponse.json({ ok: true });
}
