"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { DISCIPLINES, LEVELS, TRICKS } from "@/lib/tricks";

export type ProfileState = { error?: string; saved?: boolean } | undefined;

const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Indique ton prénom.").max(80),
  level: z.enum(LEVELS.map((l) => l.id) as [string, ...string[]], { error: "Choisis ton niveau." }),
  discipline: z.enum(DISCIPLINES.map((d) => d.id) as [string, ...string[]], { error: "Choisis ta pratique." }),
  stance: z.enum(["regular", "goofy"], { error: "Choisis ta stance." }),
  home_spot: z.string().trim().max(120).optional().default(""),
  quiver: z.string().trim().max(400).optional().default(""),
  goals: z.string().trim().max(600).optional().default(""),
});

const LEVEL_ORDER: string[] = LEVELS.map((l) => l.id);

export async function saveProfile(_: ProfileState, formData: FormData): Promise<ProfileState> {
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const { supabase, user, profile } = await requireSession();
  const firstTime = !profile.onboarded;

  const { error } = await supabase
    .from("profiles")
    .update({ ...parsed.data, onboarded: true })
    .eq("id", user.id);
  if (error) return { error: "Enregistrement impossible. Réessaie." };

  // Premier passage : on valide d'office les figures des niveaux inférieurs.
  if (firstTime) {
    const levelIdx = LEVEL_ORDER.indexOf(parsed.data.level);
    const below = TRICKS.filter((t) => LEVEL_ORDER.indexOf(t.level) < levelIdx);
    if (below.length) {
      await supabase.from("trick_progress").upsert(
        below.map((t) => ({ user_id: user.id, trick_id: t.id, status: "valide", updated_at: new Date().toISOString() })),
      );
    }
    redirect("/coach");
  }

  revalidatePath("/coach");
  revalidatePath("/dashboard");
  return { saved: true };
}

export async function setTrickStatus(formData: FormData) {
  const trickId = String(formData.get("trick"));
  const status = String(formData.get("status"));
  if (!TRICKS.some((t) => t.id === trickId)) return;

  const { supabase, user } = await requireSession();
  if (status === "aucun") {
    await supabase.from("trick_progress").delete().eq("user_id", user.id).eq("trick_id", trickId);
  } else if (status === "en-cours" || status === "valide") {
    await supabase
      .from("trick_progress")
      .upsert({ user_id: user.id, trick_id: trickId, status, updated_at: new Date().toISOString() });
  }
  revalidatePath("/coach");
  revalidatePath("/dashboard");
}

export async function clearChat() {
  const { supabase, user } = await requireSession();
  await supabase.from("coach_messages").delete().eq("user_id", user.id);
  revalidatePath("/coach");
}
