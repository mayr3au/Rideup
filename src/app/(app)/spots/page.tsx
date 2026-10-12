import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession, effectivePlan } from "@/lib/auth";
import { hasSpotFinder } from "@/lib/plans";
import { getConditions } from "@/lib/weather";
import { distanceKm, summarizeDay, type Rider } from "@/lib/wind";
import { activeSport, gearSizes, levelFor } from "@/lib/rider";
import { SPORTS } from "@/lib/sports";
import type { Spot } from "@/lib/types";
import { SpotFinder, type SpotData } from "@/components/spot-finder";

export const metadata: Metadata = { title: "Spot Finder" };
export const dynamic = "force-dynamic";

const MAX_SPOTS = 40;

export default async function SpotsPage({ searchParams }: { searchParams: Promise<{ lat?: string; lng?: string; rayon?: string }> }) {
  const sp = await searchParams;
  const { supabase, user, profile } = await requireSession();
  if (!profile.onboarded) redirect("/profil");
  const plan = effectivePlan(profile);
  const sport = activeSport(profile);
  const S = SPORTS[sport];

  if (!hasSpotFinder(plan)) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Spot Finder</h1>
        <p className="mt-3 text-lg text-slate">
          Le meilleur spot selon les conditions prévues, ton niveau, ton poids, ton matériel et la distance que tu es prêt à
          faire, avec les créneaux horaires.
        </p>
        <Link href="/tarifs" className="btn btn-primary mt-6">Débloquer avec Progress</Link>
        <p className="mt-6">
          En attendant, consulte les{" "}
          <Link href="/week-end" className="font-semibold text-lagoon">meilleurs spots du week-end</Link>.
        </p>
      </div>
    );
  }

  const lat = sp.lat ? Number(sp.lat) : profile.home_lat;
  const lng = sp.lng ? Number(sp.lng) : profile.home_lng;
  const radius = Math.min(2000, Math.max(5, Number(sp.rayon) || profile.radius_km || 100));

  if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return (
      <div className="mx-auto max-w-2xl">
        <h1 className="text-3xl font-bold sm:text-4xl">Spot Finder</h1>
        <p className="mt-3 text-slate">Indique d&apos;où tu pars pour trouver les spots autour de toi.</p>
        <Link href="/profil" className="btn btn-primary mt-6">Renseigner ma ville</Link>
      </div>
    );
  }

  const [{ data: allSpots }, { data: favs }] = await Promise.all([
    supabase.from("spots").select("*").contains("sports", [sport]).returns<Spot[]>(),
    supabase.from("favorite_spots").select("spot_id").eq("user_id", user.id),
  ]);
  const favorites = new Set((favs ?? []).map((f) => f.spot_id as string));

  const nearby = (allSpots ?? [])
    .map((s) => ({ ...s, distance: distanceKm(lat, lng, s.lat, s.lng) }))
    .filter((s) => s.distance <= radius || favorites.has(s.id))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, MAX_SPOTS);

  const rider: Rider = { sport, level: levelFor(profile, sport), weightKg: profile.weight_kg, gear: gearSizes(profile, sport) };
  const needsGear = S.spot === "wind";

  let spots: SpotData[] = [];
  let forecastError = false;
  if (nearby.length) {
    try {
      const forecasts = await getConditions(nearby, S.spot === "waves");
      spots = nearby.map((s, i) => {
        const hours = forecasts[i] ?? [];
        const dates = [...new Set(hours.map((h) => h.time.slice(0, 10)))].slice(0, 7);
        return {
          spot: s,
          distance: Math.round(s.distance),
          favorite: favorites.has(s.id),
          days: dates.map((d) => summarizeDay(hours, d, s, rider)),
          hours: hours.filter((h) => {
            const hh = Number(h.time.slice(11, 13));
            return hh >= 7 && hh <= 21;
          }),
        };
      });
    } catch (e) {
      console.error("prévisions", e);
      forecastError = true;
    }
  }

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold sm:text-4xl">Spot Finder · {S.name}</h1>
          <p className="mt-2 text-slate">
            {nearby.length} {S.spot === "cable" ? "téléski" : "spot"}
            {nearby.length > 1 ? "s" : ""} à moins de {radius} km
            {sp.lat ? " de ta position" : profile.home_label ? ` de ${profile.home_label}` : ""}
            {needsGear && (
              <>
                {" · "}
                {rider.gear.length ? rider.gear.map((k) => `${k} m²`).join(", ") : "matériel non renseigné"}
              </>
            )}
          </p>
        </div>
        <Link href="/profil" className="text-sm font-semibold text-lagoon">Modifier mes réglages</Link>
      </div>

      {needsGear && !rider.gear.length && (
        <p className="mt-4 rounded-2xl bg-brand-light p-3 text-[0.95rem]">
          Ajoute les tailles de ton matériel dans ton profil : le Spot Finder te dira lequel sortir.
        </p>
      )}

      {forecastError ? (
        <p role="alert" className="mt-6 rounded-2xl bg-danger/10 p-4">
          Les prévisions sont indisponibles pour le moment. Recharge la page dans quelques minutes.
        </p>
      ) : nearby.length === 0 ? (
        <div className="panel mt-6 p-6">
          <p>
            {S.spot === "cable"
              ? "Aucun téléski nautique référencé autour de toi pour l'instant."
              : "Aucun spot référencé dans ce rayon."}
          </p>
          {radius < 2000 && (
            <Link href={`/spots?rayon=${Math.min(2000, radius * 2)}`} className="btn btn-primary mt-4">
              Chercher à {Math.min(2000, radius * 2)} km
            </Link>
          )}
        </div>
      ) : (
        <div className="mt-6">
          <SpotFinder spots={spots} origin={{ lat, lng }} canAlert={plan === "elite"} kind={S.spot} />
        </div>
      )}

      <p className="mt-8 text-sm text-slate">
        Prévisions Open-Meteo, indicatives. Vérifie toujours les conditions sur place et l&apos;avis des locaux avant d&apos;y aller.
      </p>
    </div>
  );
}
