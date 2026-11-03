import "server-only";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { escapeHtml, sendEmail } from "@/lib/email";
import { SPORTS, type SportId } from "@/lib/sports";
import type { Profile } from "@/lib/types";

/** Un coach (ou l'admin) peut analyser les vidéos de ce sport. */
export function coachesSport(profile: Profile, sport: SportId) {
  if (profile.is_admin) return true;
  if (!profile.is_coach) return false;
  return !profile.coach_sports?.length || profile.coach_sports.includes(sport);
}

export function isCoach(profile: Profile) {
  return profile.is_admin || profile.is_coach === true;
}

/** À appeler en tête de chaque page et action de l'espace coach. */
export async function requireCoach() {
  const session = await requireSession();
  if (!isCoach(session.profile)) notFound();
  return session;
}

const siteUrl = () => (process.env.NEXT_PUBLIC_SITE_URL ?? "").replace(/\/$/, "");

/** Nouvelle vidéo dans la file : prévient les coachs de ce sport (si l'e-mail est configuré). */
export async function notifyCoaches(sport: SportId, priority: boolean) {
  const db = createAdminClient();
  const { data } = await db
    .from("profiles")
    .select("email, coach_sports")
    .eq("is_coach", true)
    .returns<Pick<Profile, "email" | "coach_sports">[]>();
  const to = (data ?? [])
    .filter((c) => c.email && (!c.coach_sports?.length || c.coach_sports.includes(sport)))
    .map((c) => c.email!);
  const name = SPORTS[sport].name;
  await Promise.all(
    to.map((email) =>
      sendEmail(
        email,
        `${priority ? "[Elite] " : ""}Nouvelle vidéo ${name} à analyser`,
        `<p>Une nouvelle vidéo de ${escapeHtml(name)} attend ton analyse${priority ? " (rider Elite, retour sous 24 h)" : ""}.</p>
         <p><a href="${siteUrl()}/espace-coach">Ouvrir l'espace coach</a></p>`,
      ),
    ),
  );
}

/** Retour publié : prévient le rider. */
export async function notifyRider(userId: string, analysisId: string, figure: string) {
  const { data } = await createAdminClient().from("profiles").select("email, full_name").eq("id", userId).maybeSingle();
  if (!data?.email) return;
  const hello = data.full_name ? `Salut ${escapeHtml(data.full_name)},` : "Salut,";
  await sendEmail(
    data.email,
    `Ton coach a analysé ta vidéo : ${figure}`,
    `<p>${hello}</p>
     <p>Ton coach RIDE'UP a regardé ta vidéo (${escapeHtml(figure)}) : corrections, exercices et priorité pour ta prochaine session t'attendent.</p>
     <p><a href="${siteUrl()}/analyse/${analysisId}">Voir le retour de ton coach</a></p>`,
  );
}
