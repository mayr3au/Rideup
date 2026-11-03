import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getConditions } from "@/lib/weather";
import { distanceKm, ORIENTATION_LABEL, summarizeDay, type DaySummary, type Rider } from "@/lib/wind";
import { gearSizes, levelFor } from "@/lib/rider";
import { SPORTS, type SportId } from "@/lib/sports";
import type { Profile, Spot } from "@/lib/types";

const MAX_SPOTS = 10;

type Option = { spot: Spot; km: number; day: DaySummary; quality: number };

const quality = (d: DaySummary) => (d.goodHours === 0 ? 0 : d.goodHours * 10 + d.bestScore / 10);

/** « 2026-10-28 14 » à Paris : sert à ignorer les heures déjà passées aujourd'hui. */
function nowLocal() {
  return new Date().toLocaleString("sv-SE", { timeZone: "Europe/Paris" }).replace(" ", "T").slice(0, 13);
}

function dayLabel(date: string, today: string) {
  const diff = Math.round((Date.parse(date) - Date.parse(today)) / 86_400_000);
  if (diff === 0) return "Aujourd'hui";
  if (diff === 1) return "Demain";
  const d = new Date(date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long" });
  return d.charAt(0).toUpperCase() + d.slice(1);
}

const hourRange = (w: { from: string; to: string }) => `${w.from.replace(":00", " h")} – ${w.to.replace(":00", " h")}`;

/** Carte de l'accueil : la meilleure session des prochains jours sur les spots favoris (ou les plus proches). */
export async function DashboardConditions({ profile, sport }: { profile: Profile; sport: SportId }) {
  const S = SPORTS[sport];
  if (S.spot === "cable") return null;

  if (profile.home_lat == null || profile.home_lng == null) {
    return (
      <section className="panel p-5">
        <p className="text-sm font-semibold text-brand">Tes conditions</p>
        <h2 className="mt-1 text-xl font-bold">Où rider cette semaine ?</h2>
        <p className="mt-1 text-[0.95rem] text-slate">Indique d&apos;où tu pars : on te montre ici ton meilleur créneau des prochains jours.</p>
        <Link href="/profil" className="mt-3 inline-flex min-h-10 items-center text-sm font-semibold text-lagoon">Renseigner ma ville</Link>
      </section>
    );
  }

  const supabase = await createClient();
  const [{ data: all }, { data: favs }] = await Promise.all([
    supabase.from("spots").select("*").contains("sports", [sport]).returns<Spot[]>(),
    supabase.from("favorite_spots").select("spot_id").eq("user_id", profile.id),
  ]);
  const favorites = new Set((favs ?? []).map((f) => f.spot_id as string));
  const home = { lat: profile.home_lat, lng: profile.home_lng };
  const withDist = (all ?? []).map((s) => ({ s, km: distanceKm(home.lat, home.lng, s.lat, s.lng) }));
  const favSpots = withDist.filter((x) => favorites.has(x.s.id));
  const radius = profile.radius_km || 100;
  const inRadius = withDist.filter((x) => x.km <= radius);
  // Rien dans le rayon : on prend quand même les spots les plus proches (jusqu'à 400 km)
  const nearest = withDist.filter((x) => x.km <= 400).sort((a, b) => a.km - b.km).slice(0, 5);
  const pool = (favSpots.length ? favSpots : inRadius.length ? inRadius : nearest).sort((a, b) => a.km - b.km).slice(0, MAX_SPOTS);
  const source = favSpots.length
    ? "tes spots favoris"
    : inRadius.length
      ? `les spots à moins de ${radius} km`
      : "les spots les plus proches de chez toi";

  if (!pool.length) {
    return (
      <section className="panel p-5">
        <p className="text-sm font-semibold text-brand">Tes conditions</p>
        <h2 className="mt-1 text-xl font-bold">Aucun spot dans ton rayon</h2>
        <p className="mt-1 text-[0.95rem] text-slate">Élargis ton rayon ou ajoute des spots en favoris dans le Spot Finder.</p>
        <Link href="/spots?rayon=250" className="mt-3 inline-flex min-h-10 items-center text-sm font-semibold text-lagoon">Chercher plus loin</Link>
      </section>
    );
  }

  const rider: Rider = { sport, level: levelFor(profile, sport), weightKg: profile.weight_kg, gear: gearSizes(profile, sport) };
  let options: Option[] = [];
  let today = "";
  try {
    const forecasts = await getConditions(pool.map((x) => x.s), S.spot === "waves");
    const now = nowLocal();
    today = now.slice(0, 10);
    options = pool.flatMap(({ s, km }, i) => {
      // On ne garde que les heures à venir
      const hours = (forecasts[i] ?? []).filter((h) => h.time.slice(0, 13) >= now);
      const dates = [...new Set(hours.map((h) => h.time.slice(0, 10)))].slice(0, 7);
      return dates.map((d) => {
        const day = summarizeDay(hours, d, s, rider);
        return { spot: s, km, day, quality: quality(day) };
      });
    });
  } catch (e) {
    console.error("accueil prévisions", e);
    return null;
  }

  const soon = options.filter((o) => o.quality > 0 && Date.parse(o.day.date) - Date.parse(today) <= 2 * 86_400_000);
  // Meilleure option par spot, puis les 3 meilleures
  const bestPerSpot = new Map<string, Option>();
  for (const o of soon.sort((a, b) => b.quality - a.quality)) if (!bestPerSpot.has(o.spot.id)) bestPerSpot.set(o.spot.id, o);
  const top = [...bestPerSpot.values()].slice(0, 3);
  const later = top.length ? null : options.filter((o) => o.quality > 0).sort((a, b) => a.day.date.localeCompare(b.day.date) || b.quality - a.quality)[0];

  return (
    <section className="panel overflow-hidden">
      <div className="p-5 pb-3">
        <p className="text-sm font-semibold text-brand">Tes conditions</p>
        {top.length ? (
          <>
            <h2 className="mt-1 text-xl font-bold">
              {dayLabel(top[0].day.date, today)}
              {top[0].day.window && `, ${hourRange(top[0].day.window)}`}
            </h2>
            <p className="mt-0.5 text-[0.95rem] text-slate">Ta meilleure session d&apos;ici 3 jours, parmi {source}.</p>
          </>
        ) : (
          <>
            <h2 className="mt-1 text-xl font-bold">Rien de ridable d&apos;ici 3 jours</h2>
            <p className="mt-0.5 text-[0.95rem] text-slate">
              {later
                ? `Prochain créneau : ${dayLabel(later.day.date, today).toLowerCase()}${later.day.window ? ` ${hourRange(later.day.window)}` : ""} à ${later.spot.name}.`
                : `Pas de créneau prévu cette semaine sur ${source}.`}
            </p>
          </>
        )}
      </div>
      {top.length > 0 && (
        <ul className="divide-y divide-line border-t border-line">
          {top.map((o, i) => (
            <li key={o.spot.id} className="flex items-center justify-between gap-3 px-5 py-3">
              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {o.spot.name}
                  {i > 0 && (
                    <span className="font-normal text-slate">
                      {" "}
                      · {dayLabel(o.day.date, today).toLowerCase()}
                      {o.day.window && ` ${hourRange(o.day.window)}`}
                    </span>
                  )}
                </p>
                <p className="truncate text-sm text-slate">
                  {S.spot === "waves"
                    ? `${(o.day.avgWave ?? 0).toFixed(1).replace(".", ",")} m${o.day.period != null ? ` · ${o.day.period} s` : ""}`
                    : `${o.day.avgWind} nds${o.day.orientation ? ` · ${ORIENTATION_LABEL[o.day.orientation]}` : ""}`}
                  {o.day.gear != null && ` · ${o.day.gearName ?? "aile"} ${o.day.gear} m²`}
                  {` · ${Math.round(o.km)} km`}
                </p>
              </div>
              <span className="shrink-0 rounded-full bg-brand-light px-2.5 py-1 text-sm font-bold text-brand">{o.day.goodHours} h</span>
            </li>
          ))}
        </ul>
      )}
      <Link href="/spots" className="flex min-h-12 items-center justify-between border-t border-line px-5 text-sm font-semibold text-lagoon hover:bg-brand-light/50">
        Voir tous les créneaux de la semaine
        <span aria-hidden="true">→</span>
      </Link>
    </section>
  );
}

export function DashboardConditionsSkeleton() {
  return (
    <section className="panel p-5" aria-busy="true" aria-label="Chargement des conditions">
      <p className="text-sm font-semibold text-brand">Tes conditions</p>
      <div className="mt-2 h-6 w-2/3 animate-pulse rounded-md bg-raised" />
      <div className="mt-2 h-4 w-1/2 animate-pulse rounded-md bg-raised" />
      <div className="mt-4 h-12 animate-pulse rounded-xl bg-raised" />
    </section>
  );
}
