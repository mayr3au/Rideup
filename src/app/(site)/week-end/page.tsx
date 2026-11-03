import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getConditions, weekendDates } from "@/lib/weather";
import { compass, distanceKm, ORIENTATION_LABEL, summarizeDay, type DaySummary, type Rider } from "@/lib/wind";
import { isSport, LEVEL_LABELS, SPORTS, type Level, type SportId } from "@/lib/sports";
import type { Spot } from "@/lib/types";
import { WindArrow } from "@/components/wind-arrow";
import { NearMeButton } from "@/components/near-me-button";

export const metadata: Metadata = {
  title: "Les meilleurs spots du week-end",
  description:
    "Les spots de kitesurf, wingfoil, foil et surf où ça marche ce week-end : créneaux ridables, vent, houle et orientation, selon ton niveau.",
};

/** Sports pour lesquels un classement « week-end » a du sens (pas le téléski). */
const TABS: SportId[] = ["kitesurf", "wingfoil", "foil", "surf"];
const LEVELS: Level[] = ["debutant", "intermediaire", "avance"];

/** Classement : d'abord le nombre d'heures ridables, puis la qualité du meilleur moment. */
const quality = (d: DaySummary | null) => (!d || d.goodHours === 0 ? 0 : d.goodHours * 10 + d.bestScore / 10);

export default async function WeekendPage({
  searchParams,
}: {
  searchParams: Promise<{ pays?: string; sport?: string; niveau?: string; lat?: string; lng?: string; rayon?: string }>;
}) {
  const sp = await searchParams;
  const sport: SportId = isSport(sp.sport) && TABS.includes(sp.sport) ? sp.sport : "kitesurf";
  const level: Level = LEVELS.includes(sp.niveau as Level) ? (sp.niveau as Level) : "intermediaire";
  const waves = SPORTS[sport].spot === "waves";
  const lat = sp.lat ? Number(sp.lat) : null;
  const lng = sp.lng ? Number(sp.lng) : null;
  const here = lat != null && lng != null && Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
  const radius = Math.min(1000, Math.max(50, Number(sp.rayon) || 300));

  const supabase = await createClient();
  const { data: spots } = await supabase.from("spots").select("*").contains("sports", [sport]).returns<Spot[]>();
  const [sat, sun] = weekendDates();
  // Rider « type » : pas de matériel ni de poids, le niveau choisi
  const rider: Rider = { sport, level, weightKg: null, gear: [] };

  const candidates = (spots ?? [])
    .map((spot) => ({ spot, distance: here ? distanceKm(here.lat, here.lng, spot.lat, spot.lng) : null }))
    .filter((c) => c.distance == null || c.distance <= radius);

  let rows: { spot: Spot; distance: number | null; sat: DaySummary | null; sun: DaySummary | null; best: number }[] = [];
  let failed = false;
  try {
    const forecasts = candidates.length ? await getConditions(candidates.map((c) => c.spot), waves) : [];
    rows = candidates
      .map(({ spot, distance }, i) => {
        const hours = forecasts[i] ?? [];
        const day = (d: string) => (hours.some((h) => h.time.startsWith(d)) ? summarizeDay(hours, d, spot, rider) : null);
        const s1 = day(sat);
        const s2 = day(sun);
        return { spot, distance, sat: s1, sun: s2, best: Math.max(quality(s1), quality(s2)) };
      })
      .sort((a, b) => b.best - a.best || (a.distance ?? 0) - (b.distance ?? 0));
  } catch (e) {
    console.error("week-end", e);
    failed = true;
  }

  const countries = [...new Set(candidates.map((x) => x.spot.country))].sort((a, b) => a.localeCompare(b, "fr"));
  const filtered = rows.filter((r) => !sp.pays || r.spot.country === sp.pays);
  const shown = filtered.slice(0, 30);
  const okSat = filtered.filter((r) => (r.sat?.goodHours ?? 0) > 0).length;
  const okSun = filtered.filter((r) => (r.sun?.goodHours ?? 0) > 0).length;

  const fmtDate = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const href = (q: { sport?: string; pays?: string; niveau?: string; near?: boolean }) => {
    const p = new URLSearchParams();
    const s = q.sport ?? sport;
    if (s !== "kitesurf") p.set("sport", s);
    const n = q.niveau ?? level;
    if (n !== "intermediaire") p.set("niveau", n);
    if (q.pays) p.set("pays", q.pays);
    if (q.near !== false && here) {
      p.set("lat", here.lat.toFixed(3));
      p.set("lng", here.lng.toFixed(3));
      p.set("rayon", String(radius));
    }
    const qs = p.toString();
    return qs ? `/week-end?${qs}` : "/week-end";
  };
  const nearQuery = new URLSearchParams({ ...(sport !== "kitesurf" && { sport }), ...(level !== "intermediaire" && { niveau: level }) }).toString();

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-14">
      <p className="eyebrow">Ce week-end</p>
      <h1 className="mt-2 text-4xl font-extrabold sm:text-6xl">
        Où ça <em className="italic text-brand">marche</em> ce week-end.
      </h1>
      <p className="mt-3 text-lg text-slate">
        {SPORTS[sport].name}, {fmtDate(sat)} et {fmtDate(sun)} : les créneaux où {waves ? "la houle" : "le vent"} est bon pour un
        rider {LEVEL_LABELS[level].toLowerCase()}, orientation du spot comprise.
      </p>

      <nav className="-mx-5 mt-7 flex gap-2 overflow-x-auto px-5 pb-1" aria-label="Sport">
        {TABS.map((t) => (
          <Link
            key={t}
            href={href({ sport: t, pays: sp.pays })}
            aria-current={t === sport ? "page" : undefined}
            className={`min-h-10 whitespace-nowrap rounded-full px-4 py-2 text-[0.95rem] font-semibold ${t === sport ? "bg-brand text-white" : "bg-raised"}`}
          >
            {SPORTS[t].name}
          </Link>
        ))}
      </nav>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <nav className="flex gap-1 rounded-full bg-raised p-1" aria-label="Niveau">
          {LEVELS.map((l) => (
            <Link
              key={l}
              href={href({ niveau: l, pays: sp.pays })}
              aria-current={l === level ? "true" : undefined}
              className={`min-h-9 rounded-full px-3.5 py-1.5 text-sm font-semibold ${l === level ? "bg-white text-deep shadow" : "text-slate"}`}
            >
              {LEVEL_LABELS[l]}
            </Link>
          ))}
        </nav>
        {here ? (
          <Link href={href({ near: false, pays: sp.pays })} className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand px-3.5 text-sm font-semibold text-white">
            À moins de {radius} km de toi
            <span aria-hidden="true">✕</span>
            <span className="sr-only">(retirer)</span>
          </Link>
        ) : (
          <NearMeButton radius={radius} basePath="/week-end" query={nearQuery} />
        )}
      </div>

      {!here && countries.length > 1 && (
        <nav className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1" aria-label="Pays">
          <Link href={href({})} className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm ${!sp.pays ? "bg-deep text-white" : "border border-line"}`}>
            Tous les pays
          </Link>
          {countries.map((c) => (
            <Link
              key={c}
              href={href({ pays: c })}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm ${sp.pays === c ? "bg-deep text-white" : "border border-line"}`}
            >
              {c}
            </Link>
          ))}
        </nav>
      )}

      {failed ? (
        <div role="alert" className="mt-8 rounded-2xl bg-danger/10 p-4">
          <p className="font-semibold">Les prévisions sont indisponibles pour le moment.</p>
          <p className="mt-1 text-sm text-slate">Le service météo ne répond pas. Réessaie dans quelques minutes.</p>
          <Link href={`${href({ pays: sp.pays })}${href({ pays: sp.pays }).includes("?") ? "&" : "?"}r=${Date.now()}`} className="btn btn-ghost mt-3 !min-h-10 !px-4 !py-2 !text-sm">Réessayer</Link>
        </div>
      ) : shown.length === 0 ? (
        <div className="panel mt-8 p-5">
          <p className="text-slate">{here ? `Aucun spot référencé à moins de ${radius} km de toi pour ce sport.` : "Aucun spot référencé ici pour ce sport."}</p>
          {here && radius < 1000 && (
            <Link href={widenHref(nearQuery, here, Math.min(1000, radius * 2))} className="btn btn-primary mt-4">
              Chercher à {Math.min(1000, radius * 2)} km
            </Link>
          )}
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3">
            {[
              { label: "Samedi", n: okSat },
              { label: "Dimanche", n: okSun },
            ].map((d) => (
              <div key={d.label} className="panel p-4">
                <p className="text-sm text-slate">{d.label}</p>
                <p className="mt-0.5 text-lg font-bold">
                  {d.n === 0 ? "Rien de ridable" : `${d.n} spot${d.n > 1 ? "s" : ""} ridable${d.n > 1 ? "s" : ""}`}
                </p>
              </div>
            ))}
          </div>

          <ol className="mt-4 space-y-3">
            {shown.map((r, i) => {
              const top = i === 0 && r.best > 0;
              return (
                <li
                  key={r.spot.id}
                  className={`panel grid grid-cols-[2rem_1fr] gap-x-3 gap-y-2 p-4 md:grid-cols-[2.5rem_1fr_14rem_14rem] md:items-center ${top ? "ring-2 ring-brand" : ""} ${r.best === 0 ? "opacity-70" : ""}`}
                >
                  <span className={`text-2xl font-extrabold ${r.best > 0 ? "text-lagoon" : "text-slate"}`}>{i + 1}</span>
                  <div className="min-w-0">
                    <p className="font-semibold">{r.spot.name}</p>
                    <p className="text-sm text-slate">
                      {r.spot.region ? `${r.spot.region}, ` : ""}
                      {r.spot.country}
                      {r.distance != null && ` · ${Math.round(r.distance)} km`}
                    </p>
                  </div>
                  {[
                    { label: "Sam.", d: r.sat },
                    { label: "Dim.", d: r.sun },
                  ].map(({ label, d }) => (
                    <DayCell key={label} label={label} d={d} waves={waves} />
                  ))}
                </li>
              );
            })}
          </ol>
        </>
      )}

      <div className="mt-10 rounded-3xl bg-brand p-6 text-white">
        <h2 className="text-2xl font-bold">Le bon spot pour toi, toute la semaine</h2>
        <p className="mt-2 text-white/80">
          Le Spot Finder ajoute ton poids, ton matériel et ton rayon : il te donne les créneaux heure par heure sur 7 jours et la
          taille d&apos;aile à sortir.
        </p>
        <Link href="/tarifs" className="btn mt-5 bg-white text-deep">Découvrir le Spot Finder</Link>
      </div>
      <p className="mt-6 text-sm text-slate">
        Prévisions Open-Meteo, indicatives, entre 8 h et 20 h. Vérifie toujours les conditions sur place et l&apos;avis des locaux.
      </p>
    </div>
  );
}

function widenHref(query: string, here: { lat: number; lng: number }, radius: number) {
  const p = new URLSearchParams(query);
  p.set("lat", here.lat.toFixed(3));
  p.set("lng", here.lng.toFixed(3));
  p.set("rayon", String(radius));
  return `/week-end?${p}`;
}

function DayCell({ label, d, waves }: { label: string; d: DaySummary | null; waves: boolean }) {
  const ok = d && d.goodHours > 0;
  return (
    <div className="col-start-2 flex min-w-0 items-start gap-2 md:col-start-auto">
      <span className="w-9 shrink-0 pt-0.5 text-sm text-slate">{label}</span>
      {!d ? (
        <span className="text-sm text-slate">Pas de prévision</span>
      ) : ok ? (
        <div className="min-w-0">
          <p className="flex flex-wrap items-center gap-x-1.5">
            <span className="rounded-md bg-brand-light px-1.5 py-0.5 text-sm font-bold text-brand">
              {d.window ? `${d.window.from.replace(":00", " h")} – ${d.window.to.replace(":00", " h")}` : `${d.goodHours} h`}
            </span>
            {waves ? (
              <span className="text-sm">
                <strong>{(d.avgWave ?? 0).toFixed(1).replace(".", ",")} m</strong>
                {d.period != null && <span className="text-slate"> · {d.period} s</span>}
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-sm">
                <strong>{d.avgWind} nds</strong>
                {d.dir != null && <WindArrow deg={d.dir} size={14} />}
              </span>
            )}
          </p>
          <p className="mt-0.5 truncate text-xs text-slate">
            {d.dir != null && compass(d.dir)}
            {d.orientation && ` · ${ORIENTATION_LABEL[d.orientation]}`}
            {d.warnings[0] && ` · ${d.warnings[0]}`}
          </p>
        </div>
      ) : (
        <span className="text-sm text-slate">{d.warnings[0] ?? "Pas ridable"}</span>
      )}
    </div>
  );
}
