"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { coachesSport, notifyRider, requireCoach } from "@/lib/coaching";
import { createAdminClient } from "@/lib/supabase/admin";
import { errorsFor, trickById } from "@/lib/sports";
import type { AnalysisResult, VideoAnalysis } from "@/lib/types";

type Row = Pick<VideoAnalysis, "id" | "user_id" | "sport" | "status" | "coach_id" | "trick">;

async function load(id: string) {
  const { data } = await createAdminClient()
    .from("video_analyses")
    .select("id, user_id, sport, status, coach_id, trick")
    .eq("id", id)
    .maybeSingle<Row>();
  return data;
}

/** Le coach prend une vidéo de la file (une seule personne peut la prendre). */
export async function claimAnalysis(formData: FormData) {
  const { profile } = await requireCoach();
  const id = String(formData.get("id"));
  const a = await load(id);
  if (!a || !coachesSport(profile, a.sport)) redirect("/espace-coach");

  if (a.status === "en-attente") {
    await createAdminClient()
      .from("video_analyses")
      .update({ status: "en-cours", coach_id: profile.id, claimed_at: new Date().toISOString() })
      .eq("id", id)
      .eq("status", "en-attente");
  }
  const after = await load(id);
  if (after?.coach_id !== profile.id) redirect("/espace-coach?prise=1");
  revalidatePath("/espace-coach");
  redirect(`/espace-coach/${id}`);
}

/** Le coach rend la vidéo à la file sans la traiter. */
export async function unclaimAnalysis(formData: FormData) {
  const { profile } = await requireCoach();
  const id = String(formData.get("id"));
  let q = createAdminClient()
    .from("video_analyses")
    .update({ status: "en-attente", coach_id: null, claimed_at: null })
    .eq("id", id)
    .eq("status", "en-cours");
  if (!profile.is_admin) q = q.eq("coach_id", profile.id);
  await q;
  revalidatePath("/espace-coach");
  redirect("/espace-coach");
}

const lines = (v: FormDataEntryValue | null) =>
  String(v ?? "")
    .split("\n")
    .map((l) => l.replace(/^\s*[-•·*]\s*/, "").trim())
    .filter(Boolean)
    .slice(0, 12);

const text = (max: number) => z.string().trim().max(max);
const reviewSchema = z.object({
  figure: text(80).min(2, "Indique la figure."),
  figure_id: z.string().optional(),
  note: z.coerce.number().min(0, "Note entre 0 et 10.").max(10, "Note entre 0 et 10."),
  resume: text(1500).min(10, "Écris un résumé de quelques phrases."),
  priorite_session: text(400).min(5, "Donne la priorité pour la prochaine session."),
  visibilite: z.enum(["bonne", "partielle", "faible"]),
  securite: text(600),
  evolution: text(800),
});

export type ReviewState = { error?: string } | undefined;

/** Publication du retour : l'analyse passe « terminée » et le rider est prévenu. */
export async function submitReview(_: ReviewState, formData: FormData): Promise<ReviewState> {
  const { profile } = await requireCoach();
  const id = String(formData.get("id"));
  const a = await load(id);
  if (!a || a.status !== "en-cours" || (a.coach_id !== profile.id && !profile.is_admin)) {
    return { error: "Cette vidéo n'est plus à ton nom. Recharge la page." };
  }

  const parsed = reviewSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? "Formulaire incomplet." };
  const f = parsed.data;

  const phases = (["approche", "appel", "vol", "reception"] as const)
    .map((phase) => ({
      phase,
      note: Number(formData.get(`phase_${phase}_note`)),
      commentaire: String(formData.get(`phase_${phase}_commentaire`) ?? "").trim().slice(0, 600),
    }))
    .filter((p) => p.commentaire && Number.isFinite(p.note) && p.note >= 0 && p.note <= 10);

  const codes = errorsFor(a.sport);
  const erreurs: AnalysisResult["erreurs"] = [];
  for (let i = 0; i < 6; i++) {
    const probleme = String(formData.get(`erreur_${i}_probleme`) ?? "").trim().slice(0, 600);
    const correction = String(formData.get(`erreur_${i}_correction`) ?? "").trim().slice(0, 800);
    if (!probleme && !correction) continue;
    if (!probleme || !correction) return { error: `Erreur n° ${i + 1} : écris le problème ET la correction.` };
    const code = String(formData.get(`erreur_${i}_code`) ?? "autre");
    const g = String(formData.get(`erreur_${i}_gravite`));
    erreurs.push({
      code: code in codes ? code : "autre",
      probleme,
      correction,
      gravite: g === "majeure" || g === "mineure" ? g : "moyenne",
    });
  }

  const figureId = f.figure_id && trickById(f.figure_id)?.sport === a.sport ? f.figure_id : a.trick;
  const result: AnalysisResult = {
    sport: a.sport,
    figure: f.figure,
    figure_id: figureId ?? null,
    note: Math.round(f.note * 10) / 10,
    resume: f.resume,
    visibilite: f.visibilite,
    phases,
    points_forts: lines(formData.get("points_forts")),
    erreurs,
    drills: lines(formData.get("drills")),
    rappels: lines(formData.get("rappels")),
    priorite_session: f.priorite_session,
    securite: f.securite || null,
    evolution: f.evolution || null,
  };

  const db = createAdminClient();
  const { data: saved } = await db
    .from("video_analyses")
    .update({ status: "termine", counted: true, result, trick: figureId, reviewed_at: new Date().toISOString(), coach_id: a.coach_id ?? profile.id })
    .eq("id", id)
    .eq("status", "en-cours")
    .select("id");
  if (!saved?.length) return { error: "Publication impossible. Recharge la page." };

  if (erreurs.length) {
    await db.from("analysis_errors").insert(erreurs.map((e) => ({ analysis_id: id, user_id: a.user_id, trick_id: figureId, code: e.code })));
  }
  // Une tentative sur une figure non suivie la passe « en cours » dans la roadmap du rider
  if (figureId) {
    await db
      .from("trick_progress")
      .upsert(
        { user_id: a.user_id, trick_id: figureId, status: "en-cours", updated_at: new Date().toISOString() },
        { onConflict: "user_id,trick_id", ignoreDuplicates: true },
      );
  }
  await notifyRider(a.user_id, id, result.figure).catch((e) => console.error("notif rider", e));

  revalidatePath("/espace-coach");
  redirect("/espace-coach?publie=1");
}
