"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useTransition } from "react";
import { toggleFavorite } from "@/app/(app)/spots/actions";
import { compass, ORIENTATION_LABEL, weatherLabel, type DaySummary, type HourForecast } from "@/lib/wind";
import type { SpotKind } from "@/lib/sports";
import type { Spot } from "@/lib/types";
import { WindArrow } from "./wind-arrow";

const SpotMap = dynamic(() => import("./spot-map"), {
  ssr: false,
  loading: () => <div className="flex h-full items-center justify-center text-slate">Chargement de la carte…</div>,
});

export type SpotData = {
  spot: Spot;
  distance: number;
  favorite: boolean;
  days: DaySummary[];
  hours: HourForecast[];
};

const WATER = { flat: "Eau plate", chop: "Clapot", vagues: "Vagues", lac: "Lac" } as const;
const OK_WORD: Record<SpotKind, string> = { wind: "ridable", waves: "surfable", cable: "conseillé" };

function dayLabel(date: string, i: number) {
  if (i === 0) return "Aujourd'hui";
  if (i === 1) return "Demain";
  return new Date(date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
}

const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Le chiffre clé affiché à droite d'un spot. */
function Headline({ d, kind }: { d: DaySummary; kind: SpotKind }) {
  if (kind === "waves")
    return (
      <div className="shrink-0 text-right">
        <p className="text-2xl font-extrabold">
          {d.avgWave?.toFixed(1).replace(".", ",")}
          <span className="text-sm font-semibold text-slate"> m</span>
        </p>
        <p className="text-sm font-semibold text-lagoon">{d.period ? `${d.period} s` : ""}</p>
      </div>
    );
  if (kind === "cable")
    return <span className="shrink-0 rounded-full bg-brand-light px-3 py-1 text-sm font-semibold text-lagoon">Conseillé</span>;
  return (
    <div className="shrink-0 text-right">
      <p className="flex items-center justify-end gap-1 text-2xl font-extrabold">
        {d.avgWind}
        <span className="text-sm font-semibold text-slate">nds</span>
        {d.dir != null && <WindArrow deg={d.dir} />}
      </p>
      <p className="text-sm font-semibold text-lagoon">{d.gear ? `${cap(d.gearName ?? "")} ${String(d.gear).replace(".", ",")} m²` : ""}</p>
    </div>
  );
}

export function SpotFinder({
  spots,
  origin,
  canAlert,
  kind,
}: {
  spots: SpotData[];
  origin: { lat: number; lng: number };
  canAlert: boolean;
  kind: SpotKind;
}) {
  const dates = spots[0]?.days.map((d) => d.date) ?? [];
  const [dayIdx, setDayIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [favs, setFavs] = useState(() => new Set(spots.filter((s) => s.favorite).map((s) => s.spot.id)));
  const [, startTransition] = useTransition();

  const ranked = useMemo(
    () =>
      [...spots].sort((a, b) => {
        const da = a.days[dayIdx];
        const db = b.days[dayIdx];
        if (kind === "cable") return a.distance - b.distance;
        return (db?.goodHours ?? 0) - (da?.goodHours ?? 0) || (db?.bestScore ?? 0) - (da?.bestScore ?? 0) || a.distance - b.distance;
      }),
    [spots, dayIdx, kind],
  );

  const current = spots.find((s) => s.spot.id === selected) ?? null;
  const date = dates[dayIdx];

  function fav(id: string) {
    const next = !favs.has(id);
    setFavs((f) => {
      const n = new Set(f);
      if (next) n.add(id);
      else n.delete(id);
      return n;
    });
    startTransition(() => toggleFavorite(id, next));
  }

  return (
    <div className="space-y-5">
      <nav className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1" aria-label="Jour">
        {dates.map((d, i) => (
          <button
            key={d}
            onClick={() => setDayIdx(i)}
            aria-pressed={i === dayIdx}
            className={`min-h-10 whitespace-nowrap rounded-full px-4 text-sm font-semibold ${i === dayIdx ? "bg-brand text-white" : "bg-raised"}`}
          >
            {dayLabel(d, i)}
          </button>
        ))}
      </nav>

      <div className="grid gap-5 lg:grid-cols-[1.1fr_1fr]">
        <div className="order-2 lg:order-1">
          {current ? (
            <SpotDetail
              data={current}
              dayIdx={dayIdx}
              date={date}
              kind={kind}
              favorite={favs.has(current.spot.id)}
              onFavorite={() => fav(current.spot.id)}
              onBack={() => setSelected(null)}
              canAlert={canAlert}
            />
          ) : (
            <ol className="space-y-3">
              {ranked.map((s, rank) => {
                const d = s.days[dayIdx];
                const good = d && d.goodHours > 0;
                return (
                  <li key={s.spot.id}>
                    <button
                      onClick={() => setSelected(s.spot.id)}
                      className={`panel flex w-full items-center gap-3 p-4 text-left ${rank === 0 && good ? "ring-2 ring-brand" : ""}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">
                          {favs.has(s.spot.id) && <span aria-label="favori" className="text-brand">★ </span>}
                          {s.spot.name}
                        </p>
                        <p className="text-sm text-slate">
                          {s.distance} km
                          {kind !== "cable" && ` · ${WATER[s.spot.water]}`}
                        </p>
                        {good && d.window && kind !== "cable" && (
                          <span className="mt-1 inline-block rounded-lg bg-brand-light px-2 py-0.5 text-xs font-semibold text-lagoon">
                            {d.window.from} – {d.window.to}
                          </span>
                        )}
                        {!good && d?.warnings[0] && <p className="text-sm text-slate">{d.warnings[0]}</p>}
                      </div>
                      {good ? (
                        <Headline d={d} kind={kind} />
                      ) : (
                        <span className="shrink-0 rounded-full bg-raised px-3 py-1 text-sm text-slate">Pas {OK_WORD[kind]}</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="photo-card order-1 h-[38dvh] min-h-[260px] overflow-hidden lg:sticky lg:top-32 lg:order-2 lg:h-[70dvh]">
          <SpotMap
            origin={origin}
            selected={selected}
            onSelect={setSelected}
            spots={spots.map((s) => ({
              id: s.spot.id,
              name: s.spot.name,
              lat: s.spot.lat,
              lng: s.spot.lng,
              score: s.days[dayIdx]?.bestScore ?? 0,
              goodHours: s.days[dayIdx]?.goodHours ?? 0,
            }))}
          />
        </div>
      </div>
    </div>
  );
}

function SpotDetail({
  data,
  dayIdx,
  date,
  kind,
  favorite,
  onFavorite,
  onBack,
  canAlert,
}: {
  data: SpotData;
  dayIdx: number;
  date: string;
  kind: SpotKind;
  favorite: boolean;
  onFavorite: () => void;
  onBack: () => void;
  canAlert: boolean;
}) {
  const s = data.spot;
  const d = data.days[dayIdx];
  const hours = data.hours.filter((h) => h.time.startsWith(date));

  return (
    <div className="panel p-5">
      <button onClick={onBack} className="min-h-10 text-sm font-semibold text-lagoon">← Tous les spots</button>
      <div className="mt-2 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold">{s.name}</h2>
          <p className="text-slate">
            {s.region ? `${s.region}, ` : ""}
            {s.country} · {data.distance} km
          </p>
        </div>
        <button
          onClick={onFavorite}
          aria-pressed={favorite}
          className={`btn !min-h-10 !px-4 !py-2 !text-sm ${favorite ? "btn-primary" : "btn-ghost"}`}
          title={canAlert ? "Tu reçois une alerte quand les conditions sont bonnes sur tes favoris" : undefined}
        >
          {favorite ? "★ Favori" : "☆ Favori"}
        </button>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-[0.95rem]">
        {kind !== "cable" && <Info label="Plan d'eau" value={WATER[s.water]} />}
        <Info label="Niveau" value={s.min_level === "debutant" ? "Tous niveaux" : s.min_level === "intermediaire" ? "Intermédiaire +" : "Confirmé"} />
        {kind === "wind" && <Info label="Vent idéal" value={`De ${compass((s.sea_bearing + 90) % 360)} ou ${compass((s.sea_bearing + 270) % 360)}`} />}
        {kind === "waves" && <Info label="Houle idéale" value={`De ${compass(s.sea_bearing)}`} />}
        <Info label="Météo" value={hours.length ? `${weatherLabel(hours[Math.floor(hours.length / 2)].code)}, ${Math.round(hours[Math.floor(hours.length / 2)].temp)} °C` : "–"} />
      </dl>

      {d && d.goodHours > 0 ? (
        <div className="mt-5 rounded-2xl bg-brand-light p-4">
          {kind === "wind" && (
            <>
              <p className="font-semibold">
                Ridable de {d.window!.from} à {d.window!.to} · {d.avgWind} nœuds de {compass(d.dir!)} ({ORIENTATION_LABEL[d.orientation!]})
              </p>
              <p className="mt-1">
                {d.gear && (
                  <>
                    Sors ta <span className="font-semibold">{d.gearName} de {String(d.gear).replace(".", ",")} m²</span>.{" "}
                  </>
                )}
                Rafales jusqu&apos;à {d.maxGust} nœuds.
              </p>
            </>
          )}
          {kind === "waves" && (
            <>
              <p className="font-semibold">
                Surfable de {d.window!.from} à {d.window!.to} · {d.avgWave?.toFixed(1).replace(".", ",")} m, période {d.period} s
              </p>
              <p className="mt-1">
                Vent {d.avgWind} nœuds de {compass(d.dir!)}
                {d.orientation === "offshore" || d.orientation === "side-off" ? " : offshore, vagues propres." : "."}
              </p>
            </>
          )}
          {kind === "cable" && <p className="font-semibold">Bonne journée pour rider de {d.window!.from} à {d.window!.to}.</p>}
          {d.warnings.length > 0 && <p className="mt-1 text-sm">{d.warnings.join(" · ")}</p>}
        </div>
      ) : (
        <p className="mt-5 rounded-2xl bg-raised p-4">
          Pas de bon créneau pour toi ce jour-là{d?.warnings[0] ? ` : ${d.warnings[0].toLowerCase()}` : ""}.
        </p>
      )}

      {s.notes && <p className="mt-4 text-slate">{s.notes}</p>}

      {kind === "wind" && <WindBars hours={hours} />}
      {kind === "waves" && <WaveBars hours={hours} />}
    </div>
  );
}

function WindBars({ hours }: { hours: HourForecast[] }) {
  const max = Math.max(30, ...hours.map((h) => h.gust));
  return (
    <>
      <h3 className="mt-6 font-semibold">Vent heure par heure</h3>
      <div className="mt-2 overflow-x-auto">
        <div className="flex min-w-max items-end gap-1.5 pb-1">
          {hours.map((h) => (
            <div key={h.time} className="flex w-9 flex-col items-center text-xs">
              <span className="font-semibold">{Math.round(h.wind)}</span>
              <div className="relative mt-1 flex h-28 w-4 items-end rounded-full bg-raised">
                <div className="absolute bottom-0 w-full rounded-full bg-brand/25" style={{ height: `${(h.gust / max) * 100}%` }} />
                <div className="relative w-full rounded-full bg-brand" style={{ height: `${(h.wind / max) * 100}%` }} />
              </div>
              <WindArrow deg={h.dir} size={14} />
              <span className="text-slate">{h.time.slice(11, 13)}h</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-1 text-xs text-slate">En nœuds · foncé : vent moyen · clair : rafales</p>
    </>
  );
}

function WaveBars({ hours }: { hours: HourForecast[] }) {
  const max = Math.max(2, ...hours.map((h) => h.wave ?? 0));
  return (
    <>
      <h3 className="mt-6 font-semibold">Houle heure par heure</h3>
      <div className="mt-2 overflow-x-auto">
        <div className="flex min-w-max items-end gap-1.5 pb-1">
          {hours.map((h) => (
            <div key={h.time} className="flex w-10 flex-col items-center text-xs">
              <span className="font-semibold">{h.wave != null ? h.wave.toFixed(1).replace(".", ",") : "–"}</span>
              <div className="relative mt-1 flex h-28 w-4 items-end rounded-full bg-raised">
                <div className="w-full rounded-full bg-brand" style={{ height: `${((h.wave ?? 0) / max) * 100}%` }} />
              </div>
              <span className="text-slate">{h.period ? `${Math.round(h.period)} s` : ""}</span>
              <span className="text-slate">{h.time.slice(11, 13)}h</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-1 text-xs text-slate">Hauteur en mètres · période en secondes</p>
    </>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-raised p-3">
      <dt className="text-xs text-slate">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
