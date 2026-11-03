import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession, effectivePlan } from "@/lib/auth";
import { hasSpotFinder } from "@/lib/plans";
import { getConditions } from "@/lib/weather";
import { FORECAST_ATTRIBUTION, getLiveWinds, LIVE_ATTRIBUTION } from "@/lib/live-wind";
import { distanceKm, rateHour, summarizeDay, type Rider } from "@/lib/wind";
import { activeSport, gearSizes, levelFor } from "@/lib/rider";
import { SPORTS } from "@/lib/sports";
import type { Spot } from "@/lib/types";
import { SpotFinder, type SpotData } from "@/components/spot-finder";
import { NearMeButton } from "@/components/near-me-button";
import Image from "next/image";
import { SITE_PHOTOS, SPORT_PHOTOS } from "@/lib/photos";

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

  const withDistance = (allSpots ?? []).map((s) => ({ ...s, distance: distanceKm(lat, lng, s.lat, s.lng) }));
  const inRadius = withDistance
    .filter((s) => s.distance <= radius || favorites.has(s.id))
    .sort((a, b) => a.distance - b.distance)
    .slice(0, MAX_SPOTS);
  // Rien dans le rayon : plutôt qu'une page vide, on montre les 6 spots les plus proches (jusqu'à 1 000 km)
  const extended = inRadius.length === 0;
  const nearby = extended
    ? [...withDistance].filter((s) => s.distance <= 1000).sort((a, b) => a.distance - b.distance).slice(0, 6)
    : inRadius;

  const rider: Rider = { sport, level: levelFor(profile, sport), weightKg: profile.weight_kg, gear: gearSizes(profile, sport) };
  const needsGear = S.spot === "wind";

  let spots: SpotData[] = [];
  let forecastError = false;
  if (nearby.length) {
    try {
      // Prévisions et vent mesuré en direct (sports de vent, spots les plus proches) en parallèle
      const [forecasts, live] = await Promise.all([
        getConditions(nearby, S.spot === "waves"),
        S.spot === "wind" ? getLiveWinds(nearby) : Promise.resolve(new Map()),
      ]);
      spots = nearby.map((s, i) => {
        const hours = forecasts[i] ?? [];
        const dates = [...new Set(hours.map((h) => h.time.slice(0, 10)))].slice(0, 7);
        return {
          spot: s,
          distance: Math.round(s.distance),
          favorite: favorites.has(s.id),
          live: live.get(s.id) ?? null,
          days: dates.map((d) => summarizeDay(hours, d, s, rider)),
          hours: hours
            .filter((h) => {
              const hh = Number(h.time.slice(11, 13));
              return hh >= 7 && hh <= 21;
            })
            .map((h) => {
              const v = rateHour(h, s, rider);
              return { ...h, score: v.score, ok: v.ok, caution: v.caution ?? false };
            }),
        };
      });
    } catch (e) {
      console.error("prévisions", e);
      forecastError = true;
    }
  }

  const where = sp.lat ? "ta position" : profile.home_label?.split(",")[0] ?? "chez toi";
  const promises =
    S.spot === "wind"
      ? [
          ["4 modèles météo croisés", "Météo-France AROME, ICON, ECMWF, GFS"],
          ["Vent mesuré en direct", "par les balises au bord de l'eau"],
          ["Taillé pour toi", "ton niveau, ton poids, ta voile"],
        ]
      : S.spot === "waves"
        ? [
            ["Houle et vent croisés", "hauteur, période, offshore"],
            ["Le bon créneau", "heure par heure, 7 jours"],
            ["Taillé pour toi", "selon ton niveau"],
          ]
        : [
            ["Météo du téléski", "pluie, orage, température"],
            ["Le bon créneau", "heure par heure, 7 jours"],
            ["Les téléskis proches", "classés par distance"],
          ];

  return (
    <div>
      {/* Bandeau : ce que fait le Spot Finder, en une phrase */}
      <section className="photo-card relative overflow-hidden">
        <Image
          src={S.spot === "wind" ? SITE_PHOTOS.spots : SPORT_PHOTOS[sport]}
          alt=""
          fill
          priority
          sizes="(min-width: 1152px) 1152px, 100vw"
          quality={85}
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-deep/90 via-deep/65 to-deep/20" />
        <div className="relative p-5 text-white sm:p-8">
          <p className="text-sm font-bold uppercase tracking-wider text-white/80">Spot Finder · {S.name}</p>
          <h1 className="mt-1 max-w-xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
            {S.spot === "cable" ? "Le bon téléski, au bon moment" : "Où rider cette semaine ?"}
          </h1>
          <p className="mt-2 max-w-xl text-white/85">
            {S.spot === "wind"
              ? "Chaque spot autour de toi, jour par jour : y aller ou pas, à quelle heure, et quelle aile sortir."
              : S.spot === "waves"
                ? "Chaque spot autour de toi, jour par jour : y aller ou pas, à quelle heure, et pourquoi."
                : "Les téléskis autour de toi et les meilleurs créneaux de la semaine."}
          </p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-3">
            {promises.map(([t, d]) => (
              <li key={t} className="rounded-2xl border border-white/20 bg-white/10 px-3 py-2.5 backdrop-blur">
                <p className="text-sm font-bold">{t}</p>
                <p className="text-xs text-white/75">{d}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Réglages de la recherche */}
      <div className="panel mt-4 flex flex-wrap items-center gap-x-4 gap-y-3 p-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate">Autour de</p>
          <p className="truncate font-bold">
            {where}
            {needsGear && (
              <span className="font-normal text-slate">
                {" · "}
                {rider.gear.length ? rider.gear.map((k) => `${String(k).replace(".", ",")} m²`).join(", ") : "matériel non renseigné"}
              </span>
            )}
          </p>
        </div>
        <nav className="flex gap-1 rounded-full bg-raised p-1" aria-label="Rayon de recherche">
          {[50, 100, 250, 500, 1000].map((r) => (
            <Link
              key={r}
              href={`/spots?rayon=${r}${sp.lat && sp.lng ? `&lat=${sp.lat}&lng=${sp.lng}` : ""}`}
              aria-current={radius === r ? "true" : undefined}
              className={`min-h-9 whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-semibold ${radius === r ? "bg-brand text-white shadow" : "text-deep hover:bg-white"}`}
            >
              {r} km
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <NearMeButton radius={radius} />
          <Link href="/profil" className="text-sm font-semibold text-lagoon">Mes réglages</Link>
        </div>
      </div>

      {needsGear && !rider.gear.length && (
        <p className="mt-4 rounded-2xl bg-brand-light p-3 text-[0.95rem]">
          Ajoute les tailles de ton matériel dans ton profil : le Spot Finder te dira lequel sortir.
        </p>
      )}

      {forecastError ? (
        <div role="alert" className="mt-6 rounded-2xl bg-danger/10 p-4">
          <p className="font-semibold">Les prévisions sont indisponibles pour le moment.</p>
          <p className="mt-1 text-sm text-slate">Le service météo ne répond pas. Réessaie dans quelques minutes.</p>
          <Link href={`/spots?rayon=${radius}&r=${Date.now()}`} className="btn btn-ghost mt-3 !min-h-10 !px-4 !py-2 !text-sm">Réessayer</Link>
        </div>
      ) : nearby.length === 0 ? (
        <div className="panel mt-6 p-6 text-center">
          <p className="text-4xl" aria-hidden="true">🏝️</p>
          <p className="mt-2 text-lg font-bold">
            {S.spot === "cable" ? "Aucun téléski nautique référencé autour de toi" : "Aucun spot référencé autour de toi"}
          </p>
          <p className="mt-1 text-slate">On ajoute des spots chaque semaine. Essaie « Autour de moi » si tu es en voyage.</p>
        </div>
      ) : (
        <div className="mt-6">
          {extended && (
            <div className="mb-4 flex items-start gap-3 rounded-2xl bg-amber-50 p-4">
              <span aria-hidden="true" className="text-xl">📍</span>
              <p className="text-[0.95rem]">
                <span className="font-semibold">Aucun spot à moins de {radius} km.</span> Voici les {nearby.length} plus proches, jusqu&apos;à{" "}
                {Math.round(nearby.at(-1)!.distance)} km.
              </p>
            </div>
          )}
          <SpotFinder spots={spots} origin={{ lat, lng }} canAlert={plan === "elite"} kind={S.spot} />
        </div>
      )}

      <p className="mt-8 text-sm text-slate">
        {FORECAST_ATTRIBUTION} {S.spot === "wind" && LIVE_ATTRIBUTION} Vérifie toujours les conditions sur place et
        l&apos;avis des locaux avant d&apos;y aller.
      </p>
    </div>
  );
}
