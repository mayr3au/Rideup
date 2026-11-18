"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { activeSport } from "@/lib/rider";
import { clearThread } from "@/lib/coach-thread";
import { geocode } from "@/lib/weather";
import { DISCIPLINES, sportDetailsSchema, summarizeQuiver, type RiderDetails } from "@/lib/rider-details";
import { isSport, LEVEL_ORDER, SPORTS, TRICKS, tricksBelowLevel, type Level, type SportId } from "@/lib/sports";

export type ProfileState = { error?: string; saved?: boolean } | undefined;

const optionalNumber = (min: number, max: number) =>
  z.preprocess((v) => (v === "" || v == null ? null : Number(v)), z.number().min(min).max(max).nullable());

const baseSchema = z.object({
  full_name: z.string().trim().min(1, "Indique ton prénom.").max(80),
  stance: z.enum(["regular", "goofy"], { error: "Choisis ton pied avant." }),
  weight_kg: optionalNumber(25, 200).refine((v) => v !== null, "Indique ton poids : il sert à choisir la bonne taille d'aile ou de kite."),
  goals: z.string().trim().max(600).optional().default(""),
  home_label: z.string().trim().max(120).optional().default(""),
  home_lat: optionalNumber(-90, 90),
  home_lng: optionalNumber(-180, 180),
  radius_km: z.coerce.number().int().min(5).max(2000).default(100),
  wind_alerts: z.preprocess((v) => v === "on", z.boolean()),
});

export async function saveProfile(_: ProfileState, formData: FormData): Promise<ProfileState> {
  const parsed = baseSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const data = { ...parsed.data };

  // Sports, niveau et matériel par sport
  const sports = [...new Set(formData.getAll("sports").map(String).filter(isSport))];
  if (!sports.length) return { error: "Choisis au moins un sport." };
  const wanted = String(formData.get("sport") ?? "");
  const sport: SportId = isSport(wanted) && sports.includes(wanted) ? wanted : sports[0];

  const levels: Partial<Record<SportId, Level>> = {};
  const gear: Partial<Record<SportId, string>> = {};
  const details: RiderDetails = {};
  for (const s of sports) {
    const lvl = String(formData.get(`level_${s}`) ?? "");
    if (!LEVEL_ORDER.includes(lvl as Level)) return { error: `Choisis ton niveau en ${SPORTS[s].name.toLowerCase()}.` };
    levels[s] = lvl as Level;

    // Discipline, quiver structuré, auto-évaluation (JSON construit par le formulaire)
    let raw: unknown = null;
    try {
      raw = JSON.parse(String(formData.get(`details_${s}`) ?? "null"));
    } catch {
      raw = null;
    }
    const parsedDetails = sportDetailsSchema.safeParse(raw ?? {});
    if (!parsedDetails.success) return { error: `Matériel en ${SPORTS[s].name.toLowerCase()} : une valeur est hors limites.` };
    const d = parsedDetails.data;
    // Plusieurs disciplines possibles ; l'ancien champ unique garde la première pour les écrans existants
    const ids = [...new Set(d.disciplines ?? (d.discipline ? [d.discipline] : []))].filter((id) => DISCIPLINES[s].some((x) => x.id === id));
    if (ids.length) {
      d.disciplines = ids;
      d.discipline = ids[0];
    } else {
      delete d.disciplines;
      delete d.discipline;
    }
    details[s] = d;

    // Résumé texte du matériel : ce que lisent le coach, la page compte et le Spot Finder.
    const legacy = String(formData.get(`gear_${s}`) ?? "").trim().slice(0, 300);
    const summary = summarizeQuiver(s, d.quiver) || legacy;
    if (summary) gear[s] = summary.slice(0, 400);
  }

  const { supabase, user, profile } = await requireSession();
  const previousLevels = profile.onboarded ? profile.levels ?? {} : {};

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
    .update({ ...data, sport, sports, levels, gear, details, onboarded: true })
    .eq("id", user.id);
  if (error) return { error: "Enregistrement impossible. Réessaie." };

  // Nouveau sport (ou premier profil) : les figures des niveaux inférieurs sont marquées « déjà pratiquées »
  // (pas validées : pas d'XP), et les fondamentaux de sécurité restent à valider un par un.
  const newly = sports.filter((s) => !previousLevels[s]);
  const toMark = newly.flatMap((s) => tricksBelowLevel(s, levels[s]!));
  if (toMark.length) {
    const { error: markError } = await supabase.from("trick_progress").upsert(
      toMark.map((t) => ({ user_id: user.id, trick_id: t.id, status: "deja-pratique", updated_at: new Date().toISOString() })),
      { onConflict: "user_id,trick_id", ignoreDuplicates: true },
    );
    // 23514 : migration 0010 (statut « deja-pratique ») pas encore appliquée.
    if (markError) console.error("déjà pratiqué", markError.code, markError.message);
  }

  if (!profile.onboarded) redirect("/dashboard");
  revalidatePath("/", "layout");
  return { saved: true };
}

/** Change le sport actif (sélecteur en haut de l'espace membre). */
export async function switchSport(formData: FormData) {
  const sport = String(formData.get("sport"));
  const back = String(formData.get("back") ?? "/dashboard");
  const { supabase, user, profile } = await requireSession();
  if (isSport(sport)) {
    const sports = profile.sports?.includes(sport) ? profile.sports : [...(profile.sports ?? []), sport];
    await supabase.from("profiles").update({ sport, sports }).eq("id", user.id);
  }
  revalidatePath("/", "layout");
  redirect(back.startsWith("/") && !back.startsWith("//") ? back : "/dashboard");
}

export async function setTrickStatus(formData: FormData) {
  const trickId = String(formData.get("trick"));
  const status = String(formData.get("status"));
  if (!TRICKS.some((t) => t.id === trickId)) return;

  const { supabase, user } = await requireSession();
  if (status === "aucun") {
    await supabase.from("trick_progress").delete().eq("user_id", user.id).eq("trick_id", trickId);
  } else if (status === "en-cours" || status === "valide" || status === "deja-pratique") {
    await supabase
      .from("trick_progress")
      .upsert({ user_id: user.id, trick_id: trickId, status, updated_at: new Date().toISOString() });
  }
  revalidatePath("/", "layout");
}

/** Efface la discussion du coach IA pour ce sport seulement. */
export async function clearChat(sport: string) {
  const { supabase, user, profile } = await requireSession();
  await clearThread(supabase, user.id, activeSport(profile, sport));
  revalidatePath("/coach");
}
