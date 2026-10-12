import { NextResponse, type NextRequest } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getConditions } from "@/lib/weather";
import { compass, summarizeDay, type DaySummary } from "@/lib/wind";
import { gearSizes, levelFor, riderSports } from "@/lib/rider";
import { SPORTS, type SportId } from "@/lib/sports";
import { escapeHtml, sendEmail } from "@/lib/email";
import { isActive } from "@/lib/plans";
import type { Profile, Spot } from "@/lib/types";

export const maxDuration = 300;

/**
 * Alertes conditions (Elite) : lancé chaque jour par Vercel Cron (vercel.json).
 * Pour chaque abonné Elite avec alertes activées, regarde les 3 prochains jours sur ses spots favoris
 * et envoie un e-mail récapitulatif des créneaux ridables encore jamais signalés.
 */
export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new NextResponse("Non autorisé", { status: 401 });
  }

  const db = createAdminClient();
  const { data: users } = await db
    .from("profiles")
    .select("*")
    .eq("wind_alerts", true)
    .or("plan_override.eq.elite,plan.eq.elite")
    .returns<Profile[]>();

  const elite = (users ?? []).filter((u) => u.plan_override === "elite" || (u.plan === "elite" && isActive(u.subscription_status)));
  if (!elite.length) return NextResponse.json({ users: 0, sent: 0 });

  const { data: favs } = await db
    .from("favorite_spots")
    .select("user_id, spot_id, spots(*)")
    .in("user_id", elite.map((u) => u.id));

  const spotMap = new Map<string, Spot>();
  for (const f of favs ?? []) {
    const s = (Array.isArray(f.spots) ? f.spots[0] : f.spots) as Spot | null;
    if (s?.active) spotMap.set(s.id, s);
  }
  const spots = [...spotMap.values()];
  if (!spots.length) return NextResponse.json({ users: elite.length, sent: 0 });

  // La houle n'est demandée que si un favori est un spot de surf.
  const forecasts = await getConditions(spots, spots.some((s) => s.sports?.includes("surf")));
  const hoursBySpot = new Map(spots.map((s, i) => [s.id, forecasts[i] ?? []]));

  const { data: already } = await db
    .from("wind_alerts_sent")
    .select("user_id, spot_id, day")
    .in("user_id", elite.map((u) => u.id))
    .gte("day", new Date().toISOString().slice(0, 10));
  const sentKey = new Set((already ?? []).map((a) => `${a.user_id}|${a.spot_id}|${a.day}`));

  let sent = 0;
  for (const user of elite) {
    if (!user.email) continue;
    // Les alertes concernent les sports dépendant des conditions (pas le téléski).
    const sports = riderSports(user).filter((sp) => SPORTS[sp].spot !== "cable");
    const hits: { spot: Spot; day: DaySummary; sport: SportId }[] = [];

    for (const f of (favs ?? []).filter((x) => x.user_id === user.id)) {
      const spot = spotMap.get(f.spot_id as string);
      if (!spot) continue;
      const hours = hoursBySpot.get(spot.id) ?? [];
      const dates = [...new Set(hours.map((h) => h.time.slice(0, 10)))].slice(0, 3);
      for (const date of dates) {
        if (sentKey.has(`${user.id}|${spot.id}|${date}`)) continue;
        // Premier sport pratiqué par l'utilisateur et possible sur ce spot qui donne un bon créneau.
        for (const sport of sports.filter((sp) => spot.sports?.includes(sp))) {
          const rider = { sport, level: levelFor(user, sport), weightKg: user.weight_kg, gear: gearSizes(user, sport) };
          const day = summarizeDay(hours, date, spot, rider);
          if (day.goodHours >= 2) {
            hits.push({ spot, day, sport });
            break;
          }
        }
      }
    }
    if (!hits.length) continue;

    const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    const lines = hits
      .map(({ spot, day, sport }) => {
        const d = new Date(day.date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
        const cond =
          SPORTS[sport].spot === "waves"
            ? `houle ${day.avgWave?.toFixed(1).replace(".", ",")} m, période ${day.period} s`
            : `${day.avgWind} nœuds de ${compass(day.dir!)}${day.gear ? `, ${day.gearName} ${String(day.gear).replace(".", ",")} m²` : ""}`;
        return `<li><strong>${escapeHtml(spot.name)}</strong> (${SPORTS[sport].name}), ${d} : ${day.window!.from}–${day.window!.to}, ${cond}</li>`;
      })
      .join("");
    const ok = await sendEmail(
      user.email,
      `Bonnes conditions prévues sur ${hits.length > 1 ? "tes spots" : hits[0].spot.name}`,
      `<p>Salut ${escapeHtml(user.full_name || "")},</p><p>De bons créneaux pour toi sont prévus :</p><ul>${lines}</ul><p><a href="${site}/spots">Voir le détail dans le Spot Finder</a></p><p style="color:#557381;font-size:13px">Prévisions indicatives : vérifie toujours les conditions sur place. Tu peux désactiver ces alertes dans ton profil.</p>`,
    );
    if (ok) {
      sent++;
      await db.from("wind_alerts_sent").upsert(hits.map(({ spot, day }) => ({ user_id: user.id, spot_id: spot.id, day: day.date })));
    }
  }

  return NextResponse.json({ users: elite.length, sent });
}
