"use server";

import { revalidatePath } from "next/cache";
import { requireSession, effectivePlan } from "@/lib/auth";
import { generateProgram } from "@/lib/ai";
import { getProgressData } from "@/lib/progress";
import { getRiderHistory } from "@/lib/usage";
import { createAdminClient } from "@/lib/supabase/admin";

export type ProgramState = { error?: string } | undefined;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function createProgram(_prev: ProgramState): Promise<ProgramState> {
  const { supabase, user, profile } = await requireSession();
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
    const [history, data] = await Promise.all([getRiderHistory(supabase, user.id), getProgressData(supabase, user.id)]);
    const program = await generateProgram(profile, history, data.recentAttempts);
    await createAdminClient().from("programs").insert({ user_id: user.id, content: program });
  } catch (e) {
    console.error("programme", e);
    return { error: "La génération a échoué. Réessaie dans un instant." };
  }
  revalidatePath("/progression");
  return undefined;
}
