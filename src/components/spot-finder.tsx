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

/** Heure de prévision, avec la note calculée pour le rider (0-100) et si elle est ridable. */
export type RatedHour = HourForecast & { score: number; ok: boolean };

export type SpotData = {
  spot: Spot;
  distance: number;
  favorite: boolean;
  days: DaySummary[];
  hours: RatedHour[];
};

const WATER = { flat: "Eau plate", chop: "Clapot", vagues: "Vagues", lac: "Lac" } as const;
const OK_WORD: Record<SpotKind, string> = { wind: "ridable", waves: "surfable", cable: "conseillé" };

function dayLabel(date: string, i: number) {
  if (i === 0) return "Aujourd'hui";
  if (i === 1) return "Demain";
  return new Date(date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "short", day: "numeric" });
}
const dayShort = (date: string) => new Date(date + "T12:00:00").toLocaleDateString("fr-FR", { weekday: "narrow" });
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
const fr1 = (n: number | null | undefined) => (n == null ? "–" : n.toFixed(1).replace(".", ","));

/** Qualité d'une journée pour un spot, 0-1 : nombre d'heures ridables pondéré par la meilleure note. */
function quality(d: DaySummary | undefined) {
  if (!d || d.goodHours === 0) return 0;
  return Math.min(1, d.goodHours / 6) * (0.5 + d.bestScore / 200);
}
function qualityClass(q: number) {
  if (q >= 0.6) return "bg-brand";
  if (q >= 0.3) return "bg-brand/55";
  if (q > 0) return "bg-brand/25";
  return "bg-line";
}

/** Le chiffre clé affiché à droite d'un spot. */
function Headline({ d, kind }: { d: DaySummary; kind: SpotKind }) {
  if (kind === "waves")
    return (
      <div className="shrink-0 text-right">
        <p className="text-2xl font-extrabold">
          {fr1(d.avgWave)}
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

/** Ligne de conditions d'un créneau, en clair. */
function conditionsText(d: DaySummary, kind: SpotKind) {
  if (kind === "waves") return `${fr1(d.avgWave)} m · ${d.period ?? "–"} s`;
  if (kind === "cable") return "Météo favorable";
  return `${d.avgWind} nds${d.dir != null ? ` de ${compass(d.dir)}` : ""}${d.gear ? ` · ${d.gearName} ${String(d.gear).replace(".", ",")} m²` : ""}`;
}

type Filter = "tous" | "bons" | "favoris";

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
  const dates = useMemo(() => spots[0]?.days.map((d) => d.date) ?? [], [spots]);
  const [dayIdx, setDayIdx] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("tous");
  const [favs, setFavs] = useState(() => new Set(spots.filter((s) => s.favorite).map((s) => s.spot.id)));
  const [, startTransition] = useTransition();

  // Nombre de spots ridables par jour (pastille sur les onglets)
  const goodPerDay = useMemo(() => dates.map((_, i) => spots.filter((s) => (s.days[i]?.goodHours ?? 0) > 0).length), [dates, spots]);

  // Meilleur plan de la semaine : le couple spot × jour le plus favorable, à distance égale le plus proche
  const bestPlan = useMemo(() => {
    let best: { s: SpotData; i: number; q: number } | null = null;
    for (const s of spots)
      s.days.forEach((d, i) => {
        const q = quality(d) - s.distance / 5000;
        if (quality(d) > 0 && (!best || q > best.q)) best = { s, i, q };
      });
    return best as { s: SpotData; i: number; q: number } | null;
  }, [spots]);

  const ranked = useMemo(() => {
    const list = spots.filter((s) =>
      filter === "favoris" ? favs.has(s.spot.id) : filter === "bons" ? (s.days[dayIdx]?.goodHours ?? 0) > 0 : true,
    );
    return list.sort((a, b) => {
      if (kind === "cable") return a.distance - b.distance;
      const da = a.days[dayIdx];
      const db = b.days[dayIdx];
      return (db?.goodHours ?? 0) - (da?.goodHours ?? 0) || (db?.bestScore ?? 0) - (da?.bestScore ?? 0) || a.distance - b.distance;
    });
  }, [spots, dayIdx, kind, filter, favs]);

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

  function open(id: string, day?: number) {
    if (day != null) setDayIdx(day);
    setSelected(id);
    if (typeof window !== "undefined" && window.innerWidth < 1024) window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <div className="space-y-5">
      {/* Meilleur plan de la semaine */}
      {kind !== "cable" &&
        (bestPlan ? (
          <button
            type="button"
            onClick={() => open(bestPlan.s.spot.id, bestPlan.i)}
            className="relative w-full overflow-hidden rounded-3xl bg-gradient-to-br from-brand to-lagoon p-5 text-left text-white shadow-[0_18px_40px_-20px_rgba(22,136,200,0.8)]"
          >
            <span className="text-xs font-bold uppercase tracking-wide text-white/80">Ton meilleur plan de la semaine</span>
            <span className="mt-1 block text-2xl font-extrabold">{bestPlan.s.spot.name}</span>
            <span className="mt-1 block text-white/90">
              {cap(dayLabel(dates[bestPlan.i], bestPlan.i))}
              {bestPlan.s.days[bestPlan.i].window && ` · ${bestPlan.s.days[bestPlan.i].window!.from} – ${bestPlan.s.days[bestPlan.i].window!.to}`}
              {` · ${bestPlan.s.distance} km`}
            </span>
            <span className="mt-3 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-semibold">
              {conditionsText(bestPlan.s.days[bestPlan.i], kind)}
            </span>
            <span aria-hidden="true" className="absolute right-5 top-1/2 -translate-y-1/2 text-3xl opacity-80">→</span>
          </button>
        ) : (
          <div className="rounded-3xl bg-raised p-5">
            <p className="font-semibold">Pas de bon créneau cette semaine dans ce rayon.</p>
            <p className="mt-1 text-sm text-slate">Élargis le rayon ou reviens plus tard : les prévisions bougent tous les jours.</p>
          </div>
        ))}

      {/* Jours, avec le nombre de spots ridables */}
      <nav className="scroll-x -mx-5 flex gap-2 px-5 pb-1" aria-label="Jour">
        {dates.map((d, i) => (
          <button
            key={d}
            onClick={() => setDayIdx(i)}
            aria-pressed={i === dayIdx}
            className={`flex min-h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-full px-4 text-sm font-semibold ${
              i === dayIdx ? "bg-brand text-white" : "bg-raised"
            }`}
          >
            {dayLabel(d, i)}
            {kind !== "cable" && (
              <span
                className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[0.7rem] font-bold ${
                  goodPerDay[i] ? (i === dayIdx ? "bg-white text-brand" : "bg-brand text-white") : i === dayIdx ? "bg-white/30" : "bg-line text-slate"
                }`}
                aria-label={`${goodPerDay[i]} spot${goodPerDay[i] > 1 ? "s" : ""} ${OK_WORD[kind]}${goodPerDay[i] > 1 ? "s" : ""}`}
              >
                {goodPerDay[i]}
              </span>
            )}
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
              onDay={setDayIdx}
              dates={dates}
              canAlert={canAlert}
            />
          ) : (
            <>
              <div className="mb-3 flex gap-2" role="group" aria-label="Filtrer les spots">
                {(
                  [
                    ["tous", "Tous"],
                    ["bons", `${cap(OK_WORD[kind])}s`],
                    ["favoris", "★ Favoris"],
                  ] as [Filter, string][]
                ).map(([f, label]) => (
                  <button
                    key={f}
                    type="button"
                    aria-pressed={filter === f}
                    onClick={() => setFilter(f)}
                    className={`min-h-9 rounded-full px-3.5 text-sm font-semibold ${filter === f ? "bg-deep text-white" : "bg-raised text-deep"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {ranked.length === 0 ? (
                <p className="panel p-5 text-slate">
                  {filter === "favoris"
                    ? "Aucun favori dans ce rayon. Ouvre un spot et touche ☆ pour l'ajouter."
                    : `Aucun spot ${OK_WORD[kind]} ce jour-là. Regarde les autres jours ou élargis le rayon.`}
                </p>
              ) : (
                <ol className="space-y-3">
                  {ranked.map((s, rank) => {
                    const d = s.days[dayIdx];
                    const good = d && d.goodHours > 0;
                    return (
                      <li key={s.spot.id}>
                        <div className={`panel p-4 ${rank === 0 && good && filter !== "favoris" ? "ring-2 ring-brand" : ""}`}>
                          <button onClick={() => open(s.spot.id)} className="flex w-full items-center gap-3 text-left">
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

                          {/* La semaine du spot en un coup d'œil */}
                          {kind !== "cable" && (
                            <div className="mt-3 flex gap-1" role="group" aria-label={`Semaine à ${s.spot.name}`}>
                              {s.days.map((day, i) => (
                                <button
                                  key={day.date}
                                  type="button"
                                  onClick={() => setDayIdx(i)}
                                  aria-label={`${dayLabel(day.date, i)} : ${day.goodHours ? `${day.goodHours} h ${OK_WORD[kind]}s` : `pas ${OK_WORD[kind]}`}`}
                                  className="flex flex-1 flex-col items-center gap-1"
                                >
                                  <span className={`h-2 w-full rounded-full ${qualityClass(quality(day))} ${i === dayIdx ? "ring-2 ring-deep ring-offset-1" : ""}`} />
                                  <span className={`text-[0.65rem] uppercase ${i === dayIdx ? "font-bold text-deep" : "text-slate"}`}>{dayShort(day.date)}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </>
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
  dates,
  kind,
  favorite,
  onFavorite,
  onBack,
  onDay,
  canAlert,
}: {
  data: SpotData;
  dayIdx: number;
  date: string;
  dates: string[];
  kind: SpotKind;
  favorite: boolean;
  onFavorite: () => void;
  onBack: () => void;
  onDay: (i: number) => void;
  canAlert: boolean;
}) {
  const s = data.spot;
  const d = data.days[dayIdx];
  const hours = data.hours.filter((h) => h.time.startsWith(date));
  const [copied, setCopied] = useState(false);
  const directions = `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`;

  async function share() {
    const text = d?.window
      ? `${s.name} ${dayLabel(date, dayIdx).toLowerCase()} : ${d.window.from} – ${d.window.to}, ${conditionsText(d, kind)}. On y va ?`
      : `${s.name} : on regarde les conditions ?`;
    try {
      if (navigator.share) await navigator.share({ title: s.name, text, url: directions });
      else {
        await navigator.clipboard.writeText(`${text} ${directions}`);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {
      /* partage annulé */
    }
  }

  const mid = hours[Math.floor(hours.length / 2)];

  return (
    <div className="panel p-5">
      <button onClick={onBack} className="min-h-10 text-sm font-semibold text-lagoon">← Tous les spots</button>
      <div className="mt-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-bold">{s.name}</h2>
          <p className="text-slate">
            {s.region ? `${s.region}, ` : ""}
            {s.country} · {data.distance} km
          </p>
        </div>
        <button
          onClick={onFavorite}
          aria-pressed={favorite}
          className={`btn !min-h-10 shrink-0 !px-4 !py-2 !text-sm ${favorite ? "btn-primary" : "btn-ghost"}`}
          title={canAlert ? "Tu reçois une alerte quand les conditions sont bonnes sur tes favoris" : undefined}
        >
          {favorite ? "★ Favori" : "☆ Favori"}
        </button>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <a href={directions} target="_blank" rel="noopener noreferrer" className="btn btn-ghost !min-h-10 !px-4 !py-2 !text-sm">
          Itinéraire
        </a>
        <button type="button" onClick={share} className="btn btn-ghost !min-h-10 !px-4 !py-2 !text-sm">
          {copied ? "Lien copié" : "Proposer à un pote"}
        </button>
      </div>

      {/* Semaine du spot */}
      {kind !== "cable" && (
        <div className="mt-4 grid grid-cols-7 gap-1.5" role="group" aria-label="Choisir le jour">
          {data.days.map((day, i) => (
            <button
              key={day.date}
              type="button"
              onClick={() => onDay(i)}
              aria-pressed={i === dayIdx}
              className={`rounded-xl px-1 py-2 text-center ${i === dayIdx ? "bg-deep text-white" : "bg-raised"}`}
            >
              <span className="block text-[0.7rem] uppercase opacity-80">{i === 0 ? "Auj." : dayShort(dates[i])}</span>
              <span className={`mx-auto mt-1 block h-1.5 w-6 rounded-full ${qualityClass(quality(day))}`} />
              <span className="mt-1 block text-xs font-bold">
                {kind === "waves" ? (day.avgWave != null ? fr1(day.avgWave) : "–") : day.avgWind ?? "–"}
              </span>
            </button>
          ))}
        </div>
      )}

      <dl className="mt-4 grid grid-cols-2 gap-3 text-[0.95rem]">
        {kind !== "cable" && <Info label="Plan d'eau" value={WATER[s.water]} />}
        <Info label="Niveau" value={s.min_level === "debutant" ? "Tous niveaux" : s.min_level === "intermediaire" ? "Intermédiaire +" : "Confirmé"} />
        {kind === "wind" && <Info label="Vent idéal" value={`De ${compass((s.sea_bearing + 90) % 360)} ou ${compass((s.sea_bearing + 270) % 360)}`} />}
        {kind === "waves" && <Info label="Houle idéale" value={`De ${compass(s.sea_bearing)}`} />}
        <Info label="Météo" value={mid ? `${weatherLabel(mid.code)}, ${Math.round(mid.temp)} °C` : "–"} />
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
                Surfable de {d.window!.from} à {d.window!.to} · {fr1(d.avgWave)} m, période {d.period} s
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

function WindBars({ hours }: { hours: RatedHour[] }) {
  const max = Math.max(30, ...hours.map((h) => h.gust));
  return (
    <>
      <h3 className="mt-6 font-semibold">Vent heure par heure</h3>
      <div className="scroll-x mt-2">
        <div className="flex min-w-max items-end gap-1.5 pb-1">
          {hours.map((h) => (
            <div key={h.time} className={`flex w-9 flex-col items-center rounded-lg py-1 text-xs ${h.ok ? "bg-brand-light" : ""}`}>
              <span className="font-semibold">{Math.round(h.wind)}</span>
              <div className="relative mt-1 flex h-28 w-4 items-end rounded-full bg-raised">
                <div className={`absolute bottom-0 w-full rounded-full ${h.ok ? "bg-brand/25" : "bg-slate/15"}`} style={{ height: `${(h.gust / max) * 100}%` }} />
                <div className={`relative w-full rounded-full ${h.ok ? "bg-brand" : "bg-slate/40"}`} style={{ height: `${(h.wind / max) * 100}%` }} />
              </div>
              <WindArrow deg={h.dir} size={14} />
              <span className="text-slate">{h.time.slice(11, 13)}h</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-1 text-xs text-slate">En nœuds · en bleu : heures ridables pour toi · clair : rafales</p>
    </>
  );
}

function WaveBars({ hours }: { hours: RatedHour[] }) {
  const max = Math.max(2, ...hours.map((h) => h.wave ?? 0));
  return (
    <>
      <h3 className="mt-6 font-semibold">Houle heure par heure</h3>
      <div className="scroll-x mt-2">
        <div className="flex min-w-max items-end gap-1.5 pb-1">
          {hours.map((h) => (
            <div key={h.time} className={`flex w-10 flex-col items-center rounded-lg py-1 text-xs ${h.ok ? "bg-brand-light" : ""}`}>
              <span className="font-semibold">{h.wave != null ? fr1(h.wave) : "–"}</span>
              <div className="relative mt-1 flex h-28 w-4 items-end rounded-full bg-raised">
                <div className={`w-full rounded-full ${h.ok ? "bg-brand" : "bg-slate/40"}`} style={{ height: `${((h.wave ?? 0) / max) * 100}%` }} />
              </div>
              <span className="text-slate">{h.period ? `${Math.round(h.period)} s` : ""}</span>
              <span className="text-slate">{h.time.slice(11, 13)}h</span>
            </div>
          ))}
        </div>
      </div>
      <p className="mt-1 text-xs text-slate">Hauteur en mètres · période en secondes · en bleu : heures surfables pour toi</p>
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
