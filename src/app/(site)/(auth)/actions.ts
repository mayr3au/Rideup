"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

export type FormState = { error?: string; message?: string } | undefined;

async function siteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? "https";
  return `${proto}://${host}`;
}

function safeNext(next: FormDataEntryValue | null) {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") ? n : "/dashboard";
}

const credentials = z.object({
  email: z.email("Adresse e-mail invalide."),
  password: z.string().min(8, "Le mot de passe doit faire au moins 8 caractères."),
});

export async function signIn(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = credentials.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  if (error) {
    if (error.message.toLowerCase().includes("email not confirmed")) {
      return { error: "Confirme d'abord ton adresse : le lien est dans l'e-mail reçu à l'inscription." };
    }
    return { error: "E-mail ou mot de passe incorrect." };
  }
  redirect(safeNext(formData.get("next")));
}

export async function signUp(_: FormState, formData: FormData): Promise<FormState> {
  const parsed = credentials
    .extend({ full_name: z.string().trim().min(1, "Indique ton prénom.").max(80) })
    .safeParse({
      email: formData.get("email"),
      password: formData.get("password"),
      full_name: formData.get("full_name"),
    });
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (formData.get("cgu") !== "on") return { error: "Accepte les CGU pour créer ton compte." };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { full_name: parsed.data.full_name },
      emailRedirectTo: `${await siteUrl()}/auth/callback?next=/coach`,
    },
  });
  if (error) {
    if (error.message.toLowerCase().includes("registered")) {
      return { error: "Un compte existe déjà avec cette adresse. Connecte-toi." };
    }
    return { error: "Impossible de créer le compte pour le moment. Réessaie dans un instant." };
  }

  // Confirmation d'e-mail désactivée dans Supabase : la session existe déjà.
  if (data.session) redirect("/coach");

  return { message: `C'est presque fini : clique sur le lien envoyé à ${parsed.data.email} pour activer ton compte.` };
}

export async function requestPasswordReset(_: FormState, formData: FormData): Promise<FormState> {
  const email = z.email().safeParse(formData.get("email"));
  if (!email.success) return { error: "Adresse e-mail invalide." };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email.data, {
    redirectTo: `${await siteUrl()}/auth/callback?next=/nouveau-mot-de-passe`,
  });
  // Même message que le compte existe ou non, pour ne rien révéler.
  return { message: "Si un compte existe pour cette adresse, un lien de réinitialisation vient d'y être envoyé." };
}

export async function updatePassword(_: FormState, formData: FormData): Promise<FormState> {
  const password = String(formData.get("password") ?? "");
  if (password.length < 8) return { error: "Le mot de passe doit faire au moins 8 caractères." };
  if (password !== formData.get("confirm")) return { error: "Les deux mots de passe ne correspondent pas." };

  const supabase = await createClient();
  const { error } = await supabase.auth.updateUser({ password });
  if (error) return { error: "Le lien a expiré. Redemande un e-mail de réinitialisation." };
  redirect("/dashboard");
}
