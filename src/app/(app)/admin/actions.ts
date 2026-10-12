"use server";

import { revalidatePath } from "next/cache";
import { notFound } from "next/navigation";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

async function requireAdmin() {
  const { profile } = await requireSession();
  if (!profile.is_admin) notFound();
  return createAdminClient();
}

export type AdminState = { error?: string; ok?: string } | undefined;

export async function setPlanOverride(formData: FormData) {
  const db = await requireAdmin();
  const id = String(formData.get("id"));
  const value = String(formData.get("override"));
  await db
    .from("profiles")
    .update({ plan_override: value === "progress" || value === "elite" ? value : null })
    .eq("id", id);
  revalidatePath("/admin/utilisateurs");
}

const planSchema = z.object({
  plan: z.enum(["free", "progress", "elite"]),
  monthly_analyses: z.coerce.number().int().min(0).max(10000),
  monthly_coach_messages: z.coerce.number().int().min(0).max(100000),
});

export async function savePlanSettings(_: AdminState, formData: FormData): Promise<AdminState> {
  const db = await requireAdmin();
  const rows = ["free", "progress", "elite"].map((plan) =>
    planSchema.safeParse({
      plan,
      monthly_analyses: formData.get(`${plan}_analyses`),
      monthly_coach_messages: formData.get(`${plan}_coach`),
    }),
  );
  const bad = rows.find((r) => !r.success);
  if (bad && !bad.success) return { error: "Valeurs invalides : nombres entiers positifs uniquement." };
  const { error } = await db
    .from("plan_settings")
    .upsert(rows.map((r) => ({ ...(r.success ? r.data : {}), updated_at: new Date().toISOString() })));
  if (error) return { error: error.message };
  revalidatePath("/admin/offres");
  return { ok: "Quotas enregistrés. Ils s'appliquent immédiatement." };
}

const spotSchema = z.object({
  id: z.string().trim().regex(/^[a-z0-9-]{2,60}$/, "Identifiant : minuscules, chiffres et tirets."),
  name: z.string().trim().min(2).max(100),
  country: z.string().trim().min(2).max(60),
  region: z.string().trim().max(80).optional().default(""),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  sea_bearing: z.coerce.number().int().min(0).max(359),
  water: z.enum(["flat", "chop", "vagues"]),
  min_level: z.enum(["debutant", "intermediaire", "avance"]),
  notes: z.string().trim().max(400).optional().default(""),
});

export async function saveSpot(_: AdminState, formData: FormData): Promise<AdminState> {
  const db = await requireAdmin();
  const parsed = spotSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { error } = await db
    .from("spots")
    .upsert({ ...parsed.data, region: parsed.data.region || null, notes: parsed.data.notes || null, active: true });
  if (error) return { error: error.message };
  revalidatePath("/admin/spots");
  return { ok: `Spot « ${parsed.data.name} » enregistré.` };
}

export async function toggleSpot(formData: FormData) {
  const db = await requireAdmin();
  await db.from("spots").update({ active: formData.get("active") === "true" }).eq("id", String(formData.get("id")));
  revalidatePath("/admin/spots");
}
