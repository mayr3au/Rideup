"use server";

import { revalidatePath } from "next/cache";
import { requireSession, effectivePlan } from "@/lib/auth";
import { generateProgram } from "@/lib/ai";
import { getProgressData } from "@/lib/progress";
import { getRiderHistory } from "@/lib/usage";
import { createAdminClient } from "@/lib/supabase/admin";
import { activeSport, levelFor } from "@/lib/rider";
import { LEVEL_ORDER, tricksFor } from "@/lib/sports";

export type ProgramState = { error?: string } | undefined;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function createProgram(_prev: ProgramState): Promise<ProgramState> {
  const { supabase, user, profile } = await requireSession();
  const sport = activeSport(profile);
  if (effectivePlan(profile) !== "elite") return { error: "Le programme personnalisé est réservé à la formule Elite." };

  // Un programme par 24 h maximum
  const { data: last } = await supabase
    .from("programs")
    .select("created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (last && Date.now() - new Date(last.created_at).getTime() < 24 * 3600 * 1000) {
    return { error: "Tu as déjà généré un programme aujourd'hui. Suis-le, puis reviens demain pour le mettre à jour." };
  }

  try {
    const [history, data] = await Promise.all([getRiderHistory(supabase, user.id), getProgressData(supabase, user.id, sport)]);
    const program = await generateProgram(profile, sport, history, data.recentAttempts);
    await createAdminClient().from("programs").insert({ user_id: user.id, content: { ...program, sport } });
  } catch (e) {
    console.error("programme", e);
    return { error: "La génération a échoué. Réessaie dans un instant." };
  }
  revalidatePath("/progression");
  return undefined;
}

/**
 * Valide d'un coup toutes les figures des paliers inférieurs au niveau déclaré dans le profil
 * (utile quand on s'inscrit déjà intermédiaire ou avancé : la roadmap part de zéro sinon).
 */
export async function validateBelowDeclaredLevel() {
  const { supabase, user, profile } = await requireSession();
  const sport = activeSport(profile);
  const declared = levelFor(profile, sport);
  if (!declared) return;
  const toValidate = tricksFor(sport).filter((t) => LEVEL_ORDER.indexOf(t.level) < LEVEL_ORDER.indexOf(declared));
  if (!toValidate.length) return;
  await supabase.from("trick_progress").upsert(
    toValidate.map((t) => ({ user_id: user.id, trick_id: t.id, status: "valide", updated_at: new Date().toISOString() })),
    { onConflict: "user_id,trick_id", ignoreDuplicates: true },
  );
  revalidatePath("/", "layout");
}
