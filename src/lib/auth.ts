import "server-only";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isActive, type Plan } from "@/lib/plans";
import type { Profile } from "@/lib/types";

/** Utilisateur connecté + profil, ou null. */
export async function getSession() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single<Profile>();
  return { supabase, user, profile };
}

export async function requireSession() {
  const session = await getSession();
  if (!session || !session.profile) redirect("/connexion");
  return session as NonNullable<typeof session> & { profile: Profile };
}

/** Plan réellement actif : accès offert par l'admin, sinon abonnement Stripe en cours. */
export function effectivePlan(profile: Profile | null | undefined): Plan {
  if (!profile) return "free";
  if (profile.plan_override) return profile.plan_override;
  if (profile.plan === "free") return "free";
  return isActive(profile.subscription_status) ? profile.plan : "free";
}

/** Début de la période de quota : période Stripe en cours, sinon le 1er du mois. */
export function periodStart(profile: Profile) {
  const start = profile.current_period_start ? new Date(profile.current_period_start) : null;
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);
  if (start && !profile.plan_override && Date.now() - start.getTime() < 32 * 24 * 3600 * 1000) return start;
  return monthStart;
}

/** À appeler en tête de chaque page et action d'administration (ne pas se fier au seul layout). */
export async function requireAdmin() {
  const session = await requireSession();
  if (!session.profile.is_admin) notFound();
  return session;
}
