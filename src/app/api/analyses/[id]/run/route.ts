import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getSession } from "@/lib/auth";
import { analyseClip, MODEL, type PreviousAttempt } from "@/lib/ai";
import { getRiderHistory, releaseAnalysis } from "@/lib/usage";
import { ANALYSIS_DEPTH, FRAMES_PER_SHEET } from "@/lib/plans";
import { createAdminClient } from "@/lib/supabase/admin";
import type { AnalysisResult, VideoAnalysis } from "@/lib/types";

export const maxDuration = 120;

const MAX_SHEET_B64 = 900_000; // ~650 Ko par planche

const body = z.object({
  sheets: z.array(z.string().max(MAX_SHEET_B64)).min(1).max(4),
  frameTimes: z.array(z.number()).max(48),
});

/** Étape 2 : reçoit les planches d'images du passage choisi et lance l'analyse IA. */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session?.profile) return NextResponse.json({ error: "Non connecté." }, { status: 401 });
  const { supabase, user, profile } = session;
  const db = createAdminClient();

  // Prise en charge atomique : une seule exécution possible, et l'annulation n'est plus acceptée ensuite.
  const { data: claimed } = await db
    .from("video_analyses")
    .update({ status: "en-cours" })
    .eq("id", id)
    .eq("user_id", user.id)
    .eq("status", "en-attente")
    .select("*")
    .returns<VideoAnalysis[]>();
  const analysis = claimed?.[0];
  if (!analysis) return NextResponse.json({ error: "Analyse introuvable ou déjà traitée." }, { status: 409 });

  const fail = async (status: number, message: string, log?: unknown) => {
    if (log) console.error("analyse", log);
    await db.from("video_analyses").update({ status: "erreur", counted: false, error: message }).eq("id", id);
    await releaseAnalysis(id);
    return NextResponse.json({ error: message }, { status });
  };

  // Profondeur figée à la réservation (un changement de formule entre-temps ne casse rien)
  const depth = analysis.depth === "approfondie" ? ANALYSIS_DEPTH.elite : ANALYSIS_DEPTH.progress;
  const parsed = body.safeParse(await request.json().catch(() => null));
  if (!parsed.success || parsed.data.sheets.length !== depth.sheets || parsed.data.frameTimes.length !== depth.sheets * FRAMES_PER_SHEET) {
    return fail(400, "Les images du clip n'ont pas pu être lues. Réessaie : cette tentative n'est pas décomptée.");
  }

  const history = await getRiderHistory(supabase, user.id);

  // Elite : comparaison avec les tentatives précédentes de la même figure
  let previous: PreviousAttempt[] | undefined;
  if (depth.compare && analysis.trick) {
    const { data: past } = await supabase
      .from("video_analyses")
      .select("id, created_at, result")
      .eq("trick", analysis.trick)
      .eq("status", "termine")
      .neq("id", id)
      .order("created_at", { ascending: false })
      .limit(5)
      .returns<Pick<VideoAnalysis, "id" | "created_at" | "result">[]>();
    previous = (past ?? [])
      .filter((p) => p.result)
      .map((p) => ({
        date: new Date(p.created_at).toLocaleDateString("fr-FR"),
        note: p.result!.note,
        codes: p.result!.erreurs.map((e) => e.code),
        priorite: p.result!.priorite_session ?? "",
      }));
  }

  let result: AnalysisResult;
  let cost: number;
  try {
    ({ result, cost } = await analyseClip({
      profile,
      history,
      sheets: parsed.data.sheets.map((s) => s.replace(/^data:image\/jpeg;base64,/, "")),
      frameTimes: parsed.data.frameTimes,
      trickId: analysis.trick,
      notes: analysis.notes,
      deep: depth.depth === "approfondie",
      maxTokens: depth.maxTokens,
      previous,
    }));
  } catch (e) {
    return fail(502, "L'analyse a échoué. Elle n'est pas décomptée : réessaie avec le même clip.", e);
  }

  const trickId = analysis.trick ?? result.figure_id;
  await db
    .from("video_analyses")
    .update({ status: "termine", counted: true, result, model: MODEL, cost_usd: cost, trick: trickId })
    .eq("id", id)
    .eq("status", "en-cours");

  if (result.erreurs.length) {
    await db.from("analysis_errors").insert(
      result.erreurs.map((e) => ({ analysis_id: id, user_id: user.id, trick_id: trickId, code: e.code })),
    );
  }

  // Une tentative sur une figure non suivie la passe « en cours » dans la roadmap
  if (trickId) {
    await supabase
      .from("trick_progress")
      .upsert(
        { user_id: user.id, trick_id: trickId, status: "en-cours", updated_at: new Date().toISOString() },
        { onConflict: "user_id,trick_id", ignoreDuplicates: true },
      );
  }

  return NextResponse.json({ ok: true });
}
