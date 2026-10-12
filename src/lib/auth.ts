import "server-only";
import { redirect } from "next/navigation";
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

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single<Profile>();

  return { supabase, user, profile };
}

export async function requireSession() {
  const session = await getSession();
  if (!session || !session.profile) redirect("/connexion");
  return session as NonNullable<typeof session> & { profile: Profile };
}

/** Plan réellement actif (un abonnement annulé ou impayé retombe en gratuit). */
export function effectivePlan(profile: Profile | null | undefined): Plan {
  if (!profile) return "free";
  if (profile.plan === "free") return "free";
  return isActive(profile.subscription_status) ? profile.plan : "free";
}
