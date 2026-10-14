"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { PHOTOS } from "@/lib/photos";

const TABS = ["Accueil", "Coach", "Analyser", "Progrès", "Spots"];
/** Mêmes icônes que la vraie barre de l'appli */
const ICONS = [
  "M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  "M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1",
  "M3 6h12v12H3zM15 10l6-3v10l-6-3z",
  "M4 20V10M10 20V4M16 20v-7M22 20H2",
  "M12 21s-7-6.1-7-11a7 7 0 0 1 14 0c0 4.9-7 11-7 11zm0-8.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z",
];

function TabIcon({ d, size }: { d: string; size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d={d} />
    </svg>
  );
}
/** Écran affiché → onglet actif */
const SCREENS = [
  { id: "analyse", tab: 2, title: "Ta session kite", sub: "Analyse · aujourd'hui" },
  { id: "coach", tab: 1, title: "Ton coach", sub: "Kitesurf · en ligne" },
  { id: "spots", tab: 4, title: "Spot Finder", sub: "Samedi · autour de Nice" },
] as const;

/** Contenu animé de l'iPhone de l'accueil : trois écrans qui défilent, notification en haut. */
export function PhoneScreens() {
  const [i, setI] = useState(0);
  const [notif, setNotif] = useState(false);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    // Le défilement reste actif même en « animations réduites » : c'est un simple fondu, plus lent.
    if (paused) return;
    const slow = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const t = setInterval(() => setI((x) => (x + 1) % SCREENS.length), slow ? 7000 : 5000);
    return () => clearInterval(t);
  }, [paused]);

  useEffect(() => {
    const show = setTimeout(() => setNotif(true), 1600);
    const hide = setTimeout(() => setNotif(false), 5200);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  const s = SCREENS[i];

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Notification qui sort de la Dynamic Island */}
      <div
        aria-hidden="true"
        className={`absolute left-1/2 top-2.5 z-30 flex -translate-x-1/2 items-center gap-2 overflow-hidden rounded-[22px] bg-black text-white transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          notif ? "h-12 w-[88%] px-3" : "h-[26px] w-[92px] px-0"
        }`}
      >
        <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand text-[0.6rem] font-extrabold transition-opacity ${notif ? "opacity-100 delay-200" : "opacity-0"}`}>
          R&apos;U
        </span>
        <span className={`min-w-0 flex-1 whitespace-nowrap transition-opacity ${notif ? "opacity-100 delay-200" : "opacity-0"}`}>
          <span className="block text-[0.62rem] font-bold">Analyse prête</span>
          <span className="block truncate text-[0.58rem] text-white/70">Backroll · 7/10 · 2 corrections</span>
        </span>
      </div>

      {/* en-tête de l'appli */}
      <div className="flex items-center justify-between px-4 pb-2 pt-1">
        <div key={s.id} className="rise [--d:0s]">
          <p className="text-[0.62rem] text-slate">{s.sub}</p>
          <p className="text-[0.95rem] font-bold leading-tight">{s.title}</p>
        </div>
        <span className="rounded-full bg-brand-light px-2 py-0.5 text-[0.6rem] font-bold text-lagoon">Elite</span>
      </div>

      {/* écrans empilés en fondu */}
      <div className="relative h-[338px]">
        <Screen on={i === 0}>
          <AnalyseScreen />
        </Screen>
        <Screen on={i === 1}>
          <CoachScreen />
        </Screen>
        <Screen on={i === 2}>
          <SpotsScreen />
        </Screen>
      </div>

      {/* indicateur de page */}
      <div className="flex justify-center gap-1.5 pb-1 pt-2" aria-hidden="true">
        {SCREENS.map((x, k) => (
          <button
            key={x.id}
            tabIndex={-1}
            onClick={() => setI(k)}
            className={`h-1.5 rounded-full transition-all ${k === i ? "w-4 bg-brand" : "w-1.5 bg-deep/20"}`}
          />
        ))}
      </div>

      {/* barre d'onglets */}
      <div className="grid grid-cols-5 items-end bg-white/90 px-2 pb-2 pt-2 text-[0.52rem] font-semibold text-slate backdrop-blur">
        {TABS.map((t, k) => (
          <span key={t} className={`flex flex-col items-center gap-0.5 transition-colors ${k === s.tab ? "text-lagoon" : ""}`}>
            {k === 2 ? (
              <span aria-hidden="true" className="-mt-5 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-white shadow-[0_8px_16px_-6px_rgba(22,136,200,0.8)] ring-4 ring-white">
                <TabIcon d={ICONS[k]} size={16} />
              </span>
            ) : (
              <TabIcon d={ICONS[k]} size={17} />
            )}
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

function Screen({ on, children }: { on: boolean; children: React.ReactNode }) {
  return (
    <div
      aria-hidden={!on}
      className={`absolute inset-0 transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
        on ? "translate-x-0 opacity-100" : "pointer-events-none translate-x-6 opacity-0"
      }`}
    >
      {children}
    </div>
  );
}

const card = "rounded-2xl bg-white shadow-[0_6px_14px_-10px_rgba(14,42,71,0.5)]";

function AnalyseScreen() {
  const phases: [string, number][] = [["Approche", 8], ["Appel", 7], ["En l'air", 5], ["Réception", 6]];
  return (
    <div>
      <div className="relative mx-3 h-40 overflow-hidden rounded-[22px]">
        <Image src={PHOTOS.splash} alt="" fill sizes="310px" className="object-cover" />
        <div className="photo-veil absolute inset-0" />
        <div aria-hidden="true" className="sweep absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-transparent via-brand/40 to-transparent" />
        <span aria-hidden="true" className="absolute left-3 top-3 h-4 w-4 rounded-tl-md border-l-2 border-t-2 border-white/80" />
        <span aria-hidden="true" className="absolute right-3 top-3 h-4 w-4 rounded-tr-md border-r-2 border-t-2 border-white/80" />
        <span className="tag-glass absolute left-1/2 top-3 -translate-x-1/2 rounded-full px-2 py-0.5 text-[0.58rem] font-bold">
          <span aria-hidden="true" className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
          IA en analyse
        </span>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3 text-white">
          <div>
            <p className="text-[0.6rem] text-white/80">Kitesurf · 12 s</p>
            <p className="text-lg font-bold leading-tight">Backroll</p>
          </div>
          <div className="relative h-12 w-12">
            <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90" aria-hidden="true">
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3" />
              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round" strokeDasharray="97.4" strokeDashoffset="29.2" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-sm font-extrabold">7</span>
          </div>
        </div>
      </div>
      <div className="mx-3 mt-2.5 grid grid-cols-4 gap-1.5 text-center">
        {phases.map(([p, n]) => (
          <div key={p} className={`${card} px-1.5 py-2`}>
            <p className="text-[0.95rem] font-extrabold leading-none">{n}</p>
            <div className="mx-auto mt-1.5 h-1 w-full overflow-hidden rounded-full bg-raised">
              <div className="h-full rounded-full bg-gradient-to-r from-brand to-[#3fb3e8]" style={{ width: `${n * 10}%` }} />
            </div>
            <p className="mt-1 text-[0.55rem] text-slate">{p}</p>
          </div>
        ))}
      </div>
      <div className={`${card} mx-3 mt-2.5 flex gap-2.5 p-3`}>
        <span aria-hidden="true" className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-danger/10 text-[0.7rem] font-bold text-danger">!</span>
        <div>
          <p className="text-[0.8rem] font-semibold leading-snug">Ton regard reste devant</p>
          <p className="mt-0.5 text-[0.68rem] leading-snug text-slate">Tourne la tête vers l&apos;épaule arrière dès le décollage.</p>
        </div>
      </div>
    </div>
  );
}

function CoachScreen() {
  return (
    <div className="flex h-full flex-col gap-2 px-3">
      <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-brand px-3 py-2 text-[0.72rem] leading-snug text-white">
        Je me fais arracher sur mes kiteloops, je fais quoi ?
      </div>
      <div className={`${card} max-w-[90%] rounded-bl-md px-3 py-2.5 text-[0.7rem] leading-snug`}>
        Sur ta dernière analyse, tu lances la boucle <b>après</b> le sommet du saut.
        <ul className="mt-1.5 space-y-1">
          <li className="flex gap-1.5"><span className="text-brand">1</span> Tire la barre au sommet, pas après.</li>
          <li className="flex gap-1.5"><span className="text-brand">2</span> Barre collée aux hanches.</li>
          <li className="flex gap-1.5"><span className="text-brand">3</span> 5 downloops avant de reboucler.</li>
        </ul>
      </div>
      <div className="ml-auto max-w-[70%] rounded-2xl rounded-br-md bg-brand px-3 py-2 text-[0.72rem] text-white">Et quelle taille avec 18 nœuds ?</div>
      <div className={`${card} flex w-14 gap-1 rounded-bl-md px-3 py-2.5`} aria-hidden="true">
        {[0, 1, 2].map((k) => (
          <span key={k} className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate/60" style={{ animationDelay: `${k * 0.15}s` }} />
        ))}
      </div>
      <div className="mt-auto flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[0.65rem] text-slate shadow-sm">
        Écris ta question…
        <span aria-hidden="true" className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[0.6rem] text-white">↑</span>
      </div>
    </div>
  );
}

function SpotsScreen() {
  const spots = [
    { n: "L'Almanarre", d: "128 km", w: 18, h: "14 h – 18 h", k: "9 m²", best: true },
    { n: "Six-Fours", d: "142 km", w: 15, h: "15 h – 17 h", k: "12 m²" },
    { n: "Beauduc", d: "236 km", w: 22, h: "11 h – 16 h", k: "9 m²" },
  ];
  return (
    <div className="px-3">
      {/* mini carte */}
      <div className="relative h-24 overflow-hidden rounded-[22px] bg-[linear-gradient(160deg,#cfe7f5_0%,#a9d3ec_55%,#e9e1cf_56%,#efe8d8_100%)]">
        <svg viewBox="0 0 300 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path d="M0 62 C 60 50 90 70 140 58 S 230 46 300 60" fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" />
        </svg>
        {[[30, 40, true], [52, 58, false], [78, 35, false]].map(([x, y, best], k) => (
          <span
            key={k}
            className={`absolute flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-[0.55rem] font-bold text-white ring-2 ring-white ${best ? "bg-brand" : "bg-deep/60"}`}
            style={{ left: `${x}%`, top: `${y}%` }}
          >
            {k + 1}
          </span>
        ))}
        <span className="absolute bottom-2 right-2 rounded-full bg-white/80 px-2 py-0.5 text-[0.55rem] font-semibold">Vent NE · 18 nds</span>
      </div>
      <ul className="mt-2.5 space-y-1.5">
        {spots.map((sp) => (
          <li key={sp.n} className={`${card} flex items-center gap-2.5 px-3 py-2 ${sp.best ? "ring-2 ring-brand" : ""}`}>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[0.78rem] font-semibold">{sp.n}</p>
              <p className="text-[0.6rem] text-slate">{sp.d} · {sp.h}</p>
            </div>
            <div className="text-right">
              <p className="text-[0.9rem] font-extrabold leading-none">{sp.w}<span className="text-[0.55rem] font-semibold text-slate"> nds</span></p>
              <p className="text-[0.58rem] font-semibold text-lagoon">Kite {sp.k}</p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
