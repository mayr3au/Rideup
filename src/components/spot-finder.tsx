"use client";

import dynamic from "next/dynamic";
import { useMemo, useState, useTransition } from "react";
import { toggleFavorite } from "@/app/(app)/spots/actions";
import { compass, ORIENTATION_LABEL, weatherLabel, type DaySummary, type HourForecast } from "@/lib/wind";
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

const WATER = { flat: "Eau plate", chop: "Clapot", vagues: "Vagues" } as const;

function dayLabel(date: string, i: number) {
  if (i === 0) return "Aujourd'hui";
  if (i === 1) return "Demain";
  return new Date(date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
}

export function SpotFinder({ spots, origin, canAlert }: { spots: SpotData[]; origin: { lat: number; lng: number }; canAlert: boolean }) {
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
        return (db?.goodHours ?? 0) - (da?.goodHours ?? 0) || (db?.bestScore ?? 0) - (da?.bestScore ?? 0) || a.distance - b.distance;
      }),
    [spots, dayIdx],
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
      <nav className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1" aria-label="Jour">
        {dates.map((d, i) => (
          <button
            key={d}
            onClick={() => setDayIdx(i)}
            aria-pressed={i === dayIdx}
            className={`whitespace-nowrap rounded-sm px-4 py-2.5 text-[0.95rem] font-medium ${i === dayIdx ? "bg-brand text-white" : "border border-line bg-spray"}`}
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
              favorite={favs.has(current.spot.id)}
              onFavorite={() => fav(current.spot.id)}
              onBack={() => setSelected(null)}
              canAlert={canAlert}
            />
          ) : (
            <ol className="space-y-2">
              {ranked.map((s, rank) => {
                const d = s.days[dayIdx];
                const good = d && d.goodHours > 0;
                return (
                  <li key={s.spot.id}>
                    <button
                      onClick={() => setSelected(s.spot.id)}
                      className={`panel flex w-full items-center gap-3 p-4 text-left hover:border-deep ${rank === 0 && good ? "border-2 !border-lagoon" : ""}`}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold">
                          {favs.has(s.spot.id) && <span aria-label="favori" className="text-white">★ </span>}
                          {s.spot.name}
                        </p>
                        <p className="text-sm text-slate">
                          {s.distance} km · {WATER[s.spot.water]}
                          {good && d.window ? ` · ${d.window.from}–${d.window.to}` : ""}
                        </p>
                        {!good && d?.warnings[0] && <p className="text-sm text-slate">{d.warnings[0]}</p>}
                      </div>
                      {good ? (
                        <div className="shrink-0 text-right">
                          <p className="flex items-center justify-end gap-1 font-display text-2xl font-extrabold">
                            {d.avgWind}
                            <span className="text-sm font-normal text-slate">nds</span>
                            {d.dir != null && <WindArrow deg={d.dir} />}
                          </p>
                          <p className="text-sm text-lagoon-dark">{d.kite ? `Kite ${d.kite} m` : ""}</p>
                        </div>
                      ) : (
                        <span className="shrink-0 rounded-sm bg-raised px-3 py-1 text-sm text-slate">Pas ridable</span>
                      )}
                    </button>
                  </li>
                );
              })}
            </ol>
          )}
        </div>

        <div className="order-1 h-[42dvh] min-h-[280px] overflow-hidden rounded-lg border border-line lg:sticky lg:top-6 lg:order-2 lg:h-[70dvh]">
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
  favorite,
  onFavorite,
  onBack,
  canAlert,
}: {
  data: SpotData;
  dayIdx: number;
  date: string;
  favorite: boolean;
  onFavorite: () => void;
  onBack: () => void;
  canAlert: boolean;
}) {
  const s = data.spot;
  const d = data.days[dayIdx];
  const hours = data.hours.filter((h) => h.time.startsWith(date));
  const max = Math.max(30, ...hours.map((h) => h.gust));

  return (
    <div className="panel p-5">
      <button onClick={onBack} className="text-lagoon hover:underline">Tous les spots</button>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div>
          <h2 className="text-3xl font-bold">{s.name}</h2>
          <p className="text-slate">
            {s.region ? `${s.region}, ` : ""}
            {s.country} · {data.distance} km
          </p>
        </div>
        <button
          onClick={onFavorite}
          aria-pressed={favorite}
          className={`btn !px-4 !py-2 ${favorite ? "btn-primary" : "btn-ghost"}`}
          title={canAlert ? "Les favoris reçoivent les alertes vent" : undefined}
        >
          {favorite ? "★ Favori" : "☆ Favori"}
        </button>
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 text-[0.95rem] sm:grid-cols-4">
        <Info label="Plan d'eau" value={WATER[s.water]} />
        <Info label="Niveau" value={s.min_level === "debutant" ? "Tous niveaux" : s.min_level === "intermediaire" ? "Intermédiaire +" : "Confirmé"} />
        <Info label="Orientation idéale" value={`Vent de ${compass((s.sea_bearing + 90) % 360)} ou ${compass((s.sea_bearing + 270) % 360)}`} />
        <Info label="Météo" value={hours.length ? weatherLabel(hours[Math.floor(hours.length / 2)].code) : "–"} />
      </dl>

      {d && d.goodHours > 0 ? (
        <div className="mt-5 rounded-md bg-lagoon/10 p-4">
          <p className="font-semibold">
            Ridable de {d.window!.from} à {d.window!.to} · {d.avgWind} nœuds de {compass(d.dir!)} ({ORIENTATION_LABEL[d.orientation!]})
          </p>
          <p className="mt-1">
            Sors ton <span className="font-semibold">{d.kite} m</span>. Rafales jusqu&apos;à {d.maxGust} nœuds.
          </p>
          {d.warnings.length > 0 && <p className="mt-1 text-sm">{d.warnings.join(" · ")}</p>}
        </div>
      ) : (
        <p className="mt-5 rounded-md bg-raised p-4">
          Pas de créneau ridable pour toi ce jour-là{d?.warnings[0] ? ` : ${d.warnings[0].toLowerCase()}` : ""}.
        </p>
      )}

      {s.notes && <p className="mt-4 text-slate">{s.notes}</p>}

      <h3 className="mt-6 font-semibold">Vent heure par heure</h3>
      <div className="mt-2 overflow-x-auto">
        <div className="flex min-w-max items-end gap-1.5 pb-1">
          {hours.map((h) => (
            <div key={h.time} className="flex w-9 flex-col items-center text-xs">
              <span className="font-semibold">{Math.round(h.wind)}</span>
              <div className="relative mt-1 flex h-28 w-4 items-end rounded bg-raised">
                <div className="absolute bottom-0 w-full rounded bg-kite/40" style={{ height: `${(h.gust / max) * 100}%` }} />
                <div className="relative w-full rounded bg-lagoon" style={{ height: `${(h.wind / max) * 100}%` }} />
              </div>
              <WindArrow deg={h.dir} size={14} />
              <span className="text-slate">{h.time.slice(11, 13)}h</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-1 text-xs text-slate">En nœuds · bleu : vent moyen · jaune : rafales</p>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-sm text-slate">{label}</dt>
      <dd className="font-semibold">{value}</dd>
    </div>
  );
}
