"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { geocode } from "@/lib/weather";
import { DISCIPLINES, LEVELS, TRICKS } from "@/lib/tricks";

export type ProfileState = { error?: string; saved?: boolean } | undefined;

const optionalNumber = (min: number, max: number) =>
  z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().min(min).max(max).nullable());

const profileSchema = z.object({
  full_name: z.string().trim().min(1, "Indique ton prénom.").max(80),
  level: z.enum(LEVELS.map((l) => l.id) as [string, ...string[]], { error: "Choisis ton niveau." }),
  discipline: z.enum(DISCIPLINES.map((d) => d.id) as [string, ...string[]], { error: "Choisis ta pratique." }),
  stance: z.enum(["regular", "goofy"], { error: "Choisis ta stance." }),
  weight_kg: optionalNumber(25, 200).refine((v) => v !== null, "Indique ton poids : il sert à choisir la bonne taille de kite."),
  quiver: z.string().trim().max(400).optional().default(""),
  goals: z.string().trim().max(600).optional().default(""),
  home_label: z.string().trim().max(120).optional().default(""),
  home_lat: optionalNumber(-90, 90),
  home_lng: optionalNumber(-180, 180),
  radius_km: z.coerce.number().int().min(5).max(2000).default(100),
  wind_alerts: z.preprocess((v) => v === "on", z.boolean()),
});

const LEVEL_ORDER: string[] = LEVELS.map((l) => l.id);

export async function saveProfile(_: ProfileState, formData: FormData): Promise<ProfileState> {
  const parsed = profileSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = { ...parsed.data };

  const { supabase, user, profile } = await requireSession();
  const firstTime = !profile.onboarded;

  // Ville saisie à la main : on la géolocalise.
  if (data.home_label && (data.home_lat == null || data.home_label !== profile.home_label) && data.home_label !== "Ma position") {
    const place = await geocode(data.home_label);
    if (!place) return { error: `Lieu « ${data.home_label} » introuvable. Essaie avec le nom d'une ville.` };
    data.home_lat = place.lat;
    data.home_lng = place.lng;
    data.home_label = place.label;
  }
  if (!data.home_label) {
    data.home_lat = null;
    data.home_lng = null;
  }

  const { error } = await supabase
    .from("profiles")
    .update({ ...data, onboarded: true })
    .eq("id", user.id);
  if (error) return { error: "Enregistrement impossible. Réessaie." };

  // Premier passage : on valide d'office les figures des niveaux inférieurs.
  if (firstTime) {
    const levelIdx = LEVEL_ORDER.indexOf(data.level);
    const below = TRICKS.filter((t) => LEVEL_ORDER.indexOf(t.level) < levelIdx);
    if (below.length) {
      await supabase.from("trick_progress").upsert(
        below.map((t) => ({ user_id: user.id, trick_id: t.id, status: "valide", updated_at: new Date().toISOString() })),
      );
    }
    redirect("/dashboard");
  }

  revalidatePath("/", "layout");
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
  revalidatePath("/", "layout");
}

export async function clearChat() {
  const { supabase, user } = await requireSession();
  await supabase.from("coach_messages").delete().eq("user_id", user.id);
  revalidatePath("/coach");
}
