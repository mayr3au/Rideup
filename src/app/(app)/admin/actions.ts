"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireAdmin as checkAdmin } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { SPORT_IDS } from "@/lib/sports";

async function requireAdmin() {
  await checkAdmin();
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

/** Nomme (ou retire) un coach, et choisit les sports qu'il analyse (aucun coché = tous). */
export async function setCoach(formData: FormData) {
  const db = await requireAdmin();
  const id = String(formData.get("id"));
  const isCoach = formData.get("is_coach") === "on";
  const sports = formData.getAll("coach_sports").map(String).filter((s) => (SPORT_IDS as string[]).includes(s));
  const text = (k: string, max: number) => String(formData.get(k) ?? "").trim().slice(0, max) || null;
  await db
    .from("profiles")
    .update({
      is_coach: isCoach,
      coach_sports: isCoach ? sports : [],
      coach_diploma: text("coach_diploma", 80),
      coach_bio: text("coach_bio", 300),
    })
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
  water: z.enum(["flat", "chop", "vagues", "lac"]),
  min_level: z.enum(["debutant", "intermediaire", "avance"]),
  notes: z.string().trim().max(400).optional().default(""),
  sports: z.array(z.enum(SPORT_IDS as [string, ...string[]])).min(1, "Coche au moins un sport."),
});

export async function saveSpot(_: AdminState, formData: FormData): Promise<AdminState> {
  const db = await requireAdmin();
  const parsed = spotSchema.safeParse({ ...Object.fromEntries(formData), sports: formData.getAll("sports") });
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

/** Ajoute les spots du catalogue livré avec le site qui manquent encore (les spots existants ne sont pas modifiés). */
export async function importSpotCatalogue() {
  const db = await requireAdmin();
  const { SPOT_CATALOGUE } = await import("@/lib/spot-catalogue");
  await db.from("spots").upsert(
    SPOT_CATALOGUE.map((s) => ({ ...s, sports: s.sports ?? ["kitesurf", "wingfoil", "foil"], active: true })),
    { onConflict: "id", ignoreDuplicates: true },
  );
  revalidatePath("/admin/spots");
  revalidatePath("/spots");
}

/**
 * Ajoute les spots cartographiés dans OpenStreetMap qui manquent (à plus de 1,5 km d'un spot existant).
 * L'orientation est calculée depuis le trait de côte ; le niveau reste « intermédiaire » par prudence.
 */
export async function importOsmSpots(_: AdminState, formData: FormData): Promise<AdminState> {
  const db = await requireAdmin();
  const country = String(formData.get("country") ?? "FR").toUpperCase().slice(0, 2);
  const { fetchOsmSpots } = await import("@/lib/osm-spots");
  const { distanceKm } = await import("@/lib/wind");
  let found;
  try {
    found = await fetchOsmSpots(country);
  } catch (e) {
    console.error("import OSM", e);
    return { error: "OpenStreetMap ne répond pas pour le moment. Réessaie dans quelques minutes." };
  }
  const { data: existing } = await db.from("spots").select("id, lat, lng");
  const known = existing ?? [];
  const fresh = found.filter(
    (f) => !known.some((k) => k.id === f.id || distanceKm(k.lat, k.lng, f.lat, f.lng) < 1.5),
  );
  // Doublons dans OSM même (plusieurs objets pour une même plage)
  const unique = fresh.filter((f, i) => !fresh.slice(0, i).some((g) => distanceKm(g.lat, g.lng, f.lat, f.lng) < 1.5));
  if (!unique.length) return { ok: `${found.length} spots trouvés dans OpenStreetMap, aucun nouveau.` };
  const COUNTRY_NAME: Record<string, string> = { FR: "France", ES: "Espagne", IT: "Italie", PT: "Portugal", BE: "Belgique", NL: "Pays-Bas" };
  const { error } = await db.from("spots").insert(
    unique.map((f) => ({
      id: f.id,
      name: f.name,
      sports: f.sports,
      country: COUNTRY_NAME[country] ?? country,
      region: null,
      lat: f.lat,
      lng: f.lng,
      sea_bearing: f.sea_bearing,
      water: f.sports.includes("surf") ? "vagues" : "chop",
      min_level: "intermediaire",
      notes: "Ajouté depuis OpenStreetMap : orientation calculée automatiquement, à vérifier.",
      active: true,
    })),
  );
  if (error) return { error: `Import impossible : ${error.message}` };
  revalidatePath("/admin/spots");
  revalidatePath("/spots");
  return { ok: `${unique.length} nouveaux spots ajoutés depuis OpenStreetMap (sur ${found.length} trouvés).` };
}
