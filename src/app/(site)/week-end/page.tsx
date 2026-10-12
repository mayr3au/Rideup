import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getForecasts, weekendDates } from "@/lib/weather";
import { compass, orientation, ORIENTATION_LABEL, type HourForecast } from "@/lib/wind";
import type { Spot } from "@/lib/types";
import { WindArrow } from "@/components/wind-arrow";

export const metadata: Metadata = {
  title: "Spots les plus ventés ce week-end",
  description: "Classement des spots de kitesurf par vent prévu ce week-end, en France, en Europe et dans le monde.",
};

type DayWind = { avg: number; gust: number; dir: number } | null;

function dayWind(hours: HourForecast[], date: string): DayWind {
  const day = hours.filter((h) => h.time.startsWith(date) && Number(h.time.slice(11, 13)) >= 10 && Number(h.time.slice(11, 13)) <= 18);
  if (!day.length) return null;
  // Direction moyenne vectorielle
  const x = day.reduce((s, h) => s + Math.cos((h.dir * Math.PI) / 180), 0);
  const y = day.reduce((s, h) => s + Math.sin((h.dir * Math.PI) / 180), 0);
  return {
    avg: day.reduce((s, h) => s + h.wind, 0) / day.length,
    gust: Math.max(...day.map((h) => h.gust)),
    dir: ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360,
  };
}

export default async function WeekendPage({ searchParams }: { searchParams: Promise<{ pays?: string }> }) {
  const { pays } = await searchParams;
  const supabase = await createClient();
  const { data: spots } = await supabase.from("spots").select("*").returns<Spot[]>();
  const [sat, sun] = weekendDates();

  let rows: { spot: Spot; sat: DayWind; sun: DayWind; best: number }[] = [];
  let failed = false;
  try {
    const forecasts = await getForecasts(spots ?? []);
    rows = (spots ?? [])
      .map((spot, i) => {
        const s1 = dayWind(forecasts[i] ?? [], sat);
        const s2 = dayWind(forecasts[i] ?? [], sun);
        return { spot, sat: s1, sun: s2, best: Math.max(s1?.avg ?? 0, s2?.avg ?? 0) };
      })
      .sort((a, b) => b.best - a.best);
  } catch (e) {
    console.error("week-end", e);
    failed = true;
  }

  const countries = [...new Set((spots ?? []).map((s) => s.country))].sort((a, b) => a.localeCompare(b, "fr"));
  const shown = rows.filter((r) => !pays || r.spot.country === pays).slice(0, 30);
  const fmtDate = (d: string) => new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6">
      <h1 className="text-3xl font-extrabold sm:text-4xl">Les spots les plus ventés ce week-end</h1>
      <p className="mt-3 text-lg text-slate">
        Vent moyen prévu entre 10 h et 18 h, {fmtDate(sat)} et {fmtDate(sun)}. Classement par puissance du vent.
      </p>

      <nav className="-mx-4 mt-8 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Pays">
        <Link href="/week-end" className={`whitespace-nowrap rounded-sm px-4 py-2 text-[0.95rem] ${!pays ? "bg-brand text-white" : "border border-line"}`}>
          Monde
        </Link>
        {countries.map((c) => (
          <Link
            key={c}
            href={`/week-end?pays=${encodeURIComponent(c)}`}
            className={`whitespace-nowrap rounded-sm px-4 py-2 text-[0.95rem] ${pays === c ? "bg-brand text-white" : "border border-line"}`}
          >
            {c}
          </Link>
        ))}
      </nav>

      {failed ? (
        <p role="alert" className="mt-8 rounded-md border border-danger/40 bg-danger/5 p-4">
          Les prévisions sont indisponibles pour le moment. Réessaie dans quelques minutes.
        </p>
      ) : (
        <ol className="mt-6 divide-y divide-line border-y border-line">
          {shown.map((r, i) => (
            <li key={r.spot.id} className="grid grid-cols-[2rem_1fr] gap-3 py-4 sm:grid-cols-[2.5rem_1fr_auto_auto] sm:items-center">
              <span className="font-display text-2xl font-extrabold text-lagoon">{i + 1}</span>
              <div className="min-w-0">
                <p className="font-semibold">{r.spot.name}</p>
                <p className="text-sm text-slate">{r.spot.region ? `${r.spot.region}, ` : ""}{r.spot.country}</p>
              </div>
              {[{ label: "Sam.", d: r.sat }, { label: "Dim.", d: r.sun }].map(({ label, d }) => (
                <div key={label} className="col-start-2 flex items-center gap-2 sm:col-start-auto sm:w-44 sm:justify-end">
                  <span className="w-10 text-sm text-slate">{label}</span>
                  {d ? (
                    <>
                      <span className="font-display text-xl font-bold">{Math.round(d.avg)}</span>
                      <span className="text-sm text-slate">nds</span>
                      <WindArrow deg={d.dir} />
                      <span className="text-sm text-slate">
                        {compass(d.dir)} · {ORIENTATION_LABEL[orientation(d.dir, r.spot.sea_bearing)]}
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-slate">–</span>
                  )}
                </div>
              ))}
            </li>
          ))}
        </ol>
      )}

      <div className="mt-10 rounded-lg bg-brand p-6 text-white">
        <h2 className="text-2xl font-bold">Le bon spot pour toi, pas seulement le plus venté</h2>
        <p className="mt-2 text-white/75">
          Le Spot Finder tient compte de ton niveau, de ton poids, de tes kites et de ton rayon, et te donne les créneaux
          ridables et la taille de kite à sortir.
        </p>
        <Link href="/tarifs" className="btn btn-kite mt-5">Découvrir le Spot Finder</Link>
      </div>
      <p className="mt-6 text-sm text-slate">Prévisions Open-Meteo, indicatives. Vérifie toujours les conditions sur place.</p>
    </div>
  );
}
