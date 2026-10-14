import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getConditions, weekendDates } from "@/lib/weather";
import { compass, orientation, ORIENTATION_LABEL, type HourForecast } from "@/lib/wind";
import { isSport, SPORTS, type SportId } from "@/lib/sports";
import type { Spot } from "@/lib/types";
import { WindArrow } from "@/components/wind-arrow";

export const metadata: Metadata = {
  title: "Les meilleurs spots du week-end",
  description: "Classement des spots de kitesurf, wingfoil, foil et surf selon le vent et la houle prévus ce week-end.",
};

/** Sports pour lesquels un classement « week-end » a du sens (pas le téléski). */
const TABS: SportId[] = ["kitesurf", "wingfoil", "foil", "surf"];

type DayStat = { main: number; sub: number | null; dir: number } | null;

function vectorMean(degs: number[]) {
  const x = degs.reduce((s, d) => s + Math.cos((d * Math.PI) / 180), 0);
  const y = degs.reduce((s, d) => s + Math.sin((d * Math.PI) / 180), 0);
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
}

function dayStat(hours: HourForecast[], date: string, waves: boolean): DayStat {
  const day = hours.filter((h) => h.time.startsWith(date) && Number(h.time.slice(11, 13)) >= 8 && Number(h.time.slice(11, 13)) <= 18);
  if (!day.length) return null;
  if (waves) {
    const w = day.filter((h) => h.wave != null);
    if (!w.length) return null;
    const avg = (k: "wave" | "period") => w.reduce((s, h) => s + (h[k] ?? 0), 0) / w.length;
    return { main: avg("wave"), sub: avg("period"), dir: vectorMean(w.map((h) => h.swellDir ?? h.dir)) };
  }
  return {
    main: day.reduce((s, h) => s + h.wind, 0) / day.length,
    sub: Math.max(...day.map((h) => h.gust)),
    dir: vectorMean(day.map((h) => h.dir)),
  };
}

/** Score de classement : vent moyen, ou énergie de houle (hauteur² × période) pour le surf. */
const score = (d: DayStat, waves: boolean) => (!d ? 0 : waves ? d.main * d.main * (d.sub ?? 8) : d.main);

export default async function WeekendPage({ searchParams }: { searchParams: Promise<{ pays?: string; sport?: string }> }) {
  const { pays, sport: s } = await searchParams;
  const sport: SportId = isSport(s) && TABS.includes(s) ? s : "kitesurf";
  const waves = SPORTS[sport].spot === "waves";
  const supabase = await createClient();
  const { data: spots } = await supabase.from("spots").select("*").contains("sports", [sport]).returns<Spot[]>();
  const [sat, sun] = weekendDates();

  let rows: { spot: Spot; sat: DayStat; sun: DayStat; best: number }[] = [];
  let failed = false;
  try {
    const forecasts = await getConditions(spots ?? [], waves);
    rows = (spots ?? [])
      .map((spot, i) => {
        const s1 = dayStat(forecasts[i] ?? [], sat, waves);
        const s2 = dayStat(forecasts[i] ?? [], sun, waves);
        return { spot, sat: s1, sun: s2, best: Math.max(score(s1, waves), score(s2, waves)) };
      })
      .sort((a, b) => b.best - a.best);
  } catch (e) {
    console.error("week-end", e);
    failed = true;
  }

  const countries = [...new Set((spots ?? []).map((x) => x.country))].sort((a, b) => a.localeCompare(b, "fr"));
  const shown = rows.filter((r) => !pays || r.spot.country === pays).slice(0, 30);
  const fmtDate = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });
  const href = (q: { sport?: string; pays?: string }) => {
    const p = new URLSearchParams();
    if (q.sport && q.sport !== "kitesurf") p.set("sport", q.sport);
    if (q.pays) p.set("pays", q.pays);
    const qs = p.toString();
    return qs ? `/week-end?${qs}` : "/week-end";
  };

  return (
    <div className="mx-auto max-w-4xl px-5 py-10 sm:px-6 sm:py-14">
      <p className="eyebrow">Ce week-end</p>
      <h1 className="mt-2 text-4xl font-extrabold sm:text-6xl">
        {waves ? (
          <>Les plus belles <em className="italic text-brand">houles</em>.</>
        ) : (
          <>Les spots les plus <em className="italic text-brand">ventés</em>.</>
        )}
      </h1>
      <p className="mt-3 text-lg text-slate">
        {waves ? "Houle moyenne prévue" : "Vent moyen prévu"} entre 8 h et 18 h, {fmtDate(sat)} et {fmtDate(sun)}.
      </p>

      <nav className="-mx-5 mt-7 flex gap-2 overflow-x-auto px-5 pb-1" aria-label="Sport">
        {TABS.map((t) => (
          <Link
            key={t}
            href={href({ sport: t })}
            aria-current={t === sport ? "page" : undefined}
            className={`min-h-10 whitespace-nowrap rounded-full px-4 py-2 text-[0.95rem] font-semibold ${t === sport ? "bg-brand text-white" : "bg-raised"}`}
          >
            {SPORTS[t].name}
          </Link>
        ))}
      </nav>

      <nav className="-mx-5 mt-3 flex gap-2 overflow-x-auto px-5 pb-1" aria-label="Pays">
        <Link href={href({ sport })} className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm ${!pays ? "bg-deep text-white" : "border border-line"}`}>
          Monde
        </Link>
        {countries.map((c) => (
          <Link
            key={c}
            href={href({ sport, pays: c })}
            className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm ${pays === c ? "bg-deep text-white" : "border border-line"}`}
          >
            {c}
          </Link>
        ))}
      </nav>

      {failed ? (
        <div role="alert" className="mt-8 rounded-2xl bg-danger/10 p-4">
          <p className="font-semibold">Les prévisions sont indisponibles pour le moment.</p>
          <p className="mt-1 text-sm text-slate">Le service météo ne répond pas. Réessaie dans quelques minutes.</p>
          <Link href={`${href({ sport, pays })}${href({ sport, pays }).includes("?") ? "&" : "?"}r=${Date.now()}`} className="btn btn-ghost mt-3 !min-h-10 !px-4 !py-2 !text-sm">Réessayer</Link>
        </div>
      ) : shown.length === 0 ? (
        <p className="panel mt-8 p-5 text-slate">Aucun spot référencé ici pour ce sport.</p>
      ) : (
        <ol className="mt-6 space-y-3">
          {shown.map((r, i) => (
            <li key={r.spot.id} className={`panel grid grid-cols-[2rem_1fr] gap-x-3 gap-y-2 p-4 sm:grid-cols-[2.5rem_1fr_auto_auto] sm:items-center ${i === 0 ? "ring-2 ring-brand" : ""}`}>
              <span className="text-2xl font-extrabold text-lagoon">{i + 1}</span>
              <div className="min-w-0">
                <p className="font-semibold">{r.spot.name}</p>
                <p className="text-sm text-slate">{r.spot.region ? `${r.spot.region}, ` : ""}{r.spot.country}</p>
              </div>
              {[{ label: "Sam.", d: r.sat }, { label: "Dim.", d: r.sun }].map(({ label, d }) => (
                <div key={label} className="col-start-2 flex items-center gap-2 sm:col-start-auto sm:w-48 sm:justify-end">
                  <span className="w-10 text-sm text-slate">{label}</span>
                  {d ? (
                    waves ? (
                      <>
                        <span className="text-xl font-bold">{d.main.toFixed(1).replace(".", ",")}</span>
                        <span className="text-sm text-slate">m · {Math.round(d.sub ?? 0)} s · {compass(d.dir)}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-xl font-bold">{Math.round(d.main)}</span>
                        <span className="text-sm text-slate">nds</span>
                        <WindArrow deg={d.dir} />
                        <span className="text-sm text-slate">
                          {compass(d.dir)} · {ORIENTATION_LABEL[orientation(d.dir, r.spot.sea_bearing)]}
                        </span>
                      </>
                    )
                  ) : (
                    <span className="text-sm text-slate">–</span>
                  )}
                </div>
              ))}
            </li>
          ))}
        </ol>
      )}

      <div className="mt-10 rounded-3xl bg-brand p-6 text-white">
        <h2 className="text-2xl font-bold">Le bon spot pour toi, pas seulement le plus gros</h2>
        <p className="mt-2 text-white/80">
          Le Spot Finder tient compte de ton sport, de ton niveau, de ton poids, de ton matériel et de ton rayon, et te donne
          les créneaux et la taille d&apos;aile à sortir.
        </p>
        <Link href="/tarifs" className="btn mt-5 bg-white text-deep">Découvrir le Spot Finder</Link>
      </div>
      <p className="mt-6 text-sm text-slate">Prévisions Open-Meteo, indicatives. Vérifie toujours les conditions sur place.</p>
    </div>
  );
}
