import { NextResponse, type NextRequest } from "next/server";
import { getSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { releaseAnalysis } from "@/lib/usage";
import { notifyCoaches } from "@/lib/coaching";
import type { VideoAnalysis } from "@/lib/types";

/**
 * Actions du rider sur son analyse :
 * - "uploaded" : la vidéo est arrivée dans le stockage → l'analyse entre dans la file des coachs.
 * - "cancel"   : envoi raté, ou le rider retire sa vidéo tant qu'aucun coach ne l'a prise → quota rendu.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Non connecté." }, { status: 401 });

  const { action } = (await request.json().catch(() => ({}))) as { action?: string };
  const { data: a } = await session.supabase
    .from("video_analyses")
    .select("id, user_id, sport, status, video_path, priority")
    .eq("id", id)
    .maybeSingle<Pick<VideoAnalysis, "id" | "user_id" | "sport" | "status" | "video_path" | "priority">>();
  if (!a) return NextResponse.json({ error: "Analyse introuvable." }, { status: 404 });

  const db = createAdminClient();

  if (action === "uploaded") {
    if (a.status !== "envoi" || !a.video_path) return NextResponse.json({ ok: true });
    // On vérifie que le fichier est bien là avant de le mettre dans la file
    const slash = a.video_path.lastIndexOf("/");
    const { data: files } = await db.storage
      .from("clips")
      .list(a.video_path.slice(0, slash), { search: a.video_path.slice(slash + 1), limit: 1 });
    if (!files?.length) return NextResponse.json({ error: "La vidéo n'est pas arrivée. Réessaie." }, { status: 409 });

    const { data: queued } = await db
      .from("video_analyses")
      .update({ status: "en-attente", submitted_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "envoi")
      .select("id");
    if (queued?.length) await notifyCoaches(a.sport, a.priority === true).catch((e) => console.error("notif coachs", e));
    return NextResponse.json({ ok: true });
  }

  if (action === "cancel") {
    // Seulement tant qu'aucun coach ne l'a prise en charge
    const { data: cancelled } = await db
      .from("video_analyses")
      .update({ status: "erreur", counted: false, error: "Annulée" })
      .eq("id", id)
      .in("status", ["envoi", "en-attente"])
      .select("id");
    if (!cancelled?.length) {
      return NextResponse.json({ error: "Un coach est déjà en train d'analyser ta vidéo." }, { status: 409 });
    }
    await releaseAnalysis(id);
    if (a.video_path) await db.storage.from("clips").remove([a.video_path]);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Action inconnue." }, { status: 400 });
}
