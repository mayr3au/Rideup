"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const TABS = ["Accueil", "Cours", "Coach", "Progrès", "Spots"];
/** Mêmes icônes que la vraie barre de l'appli */
const ICONS = [
  "M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z",
  "M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 21V5M8 7h7",
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
  { id: "analyse", tab: 2, title: "Retour de ton coach", sub: "Backroll · analysé par Anil" },
  { id: "ia", tab: 2, title: "Coach IA", sub: "Kitesurf · en ligne 24/7" },
  { id: "spots", tab: 4, title: "Spot Finder", sub: "Samedi · autour de Hyères" },
  { id: "roadmap", tab: 2, title: "Roadmap kitesurf", sub: "54 figures à débloquer" },
  { id: "progres", tab: 3, title: "Ta progression", sub: "Palier 3 · Shredder" },
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

  // La notification « retour prêt » sort de la Dynamic Island à chaque passage sur l'écran du coach
  useEffect(() => {
    if (i !== 0) return;
    const show = setTimeout(() => setNotif(true), 900);
    const hide = setTimeout(() => setNotif(false), 3600);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
      setNotif(false);
    };
  }, [i]);

  const s = SCREENS[i];

  return (
    <div onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
      {/* Notification qui sort de la Dynamic Island */}
      <div
        aria-hidden="true"
        className={`absolute left-1/2 top-[6px] z-30 flex -translate-x-1/2 items-center gap-2 overflow-hidden rounded-[22px] bg-black text-white transition-all duration-500 ease-[cubic-bezier(0.2,0.8,0.2,1)] ${
          notif ? "h-12 w-[88%] px-3" : "h-[34px] w-[98px] px-0"
        }`}
      >
        <span className={`relative h-7 w-7 shrink-0 overflow-hidden rounded-full transition-opacity ${notif ? "opacity-100 delay-200" : "opacity-0"}`}>
          <Image src="/coachs/avatar-anil.jpg" alt="" fill sizes="28px" className="object-cover" />
        </span>
        <span className={`min-w-0 flex-1 whitespace-nowrap transition-opacity ${notif ? "opacity-100 delay-200" : "opacity-0"}`}>
          <span className="block text-[0.62rem] font-bold">Anil a analysé ta vidéo</span>
          <span className="block truncate text-[0.58rem] text-white/70">Backroll · 7/10 · 2 corrections, 1 priorité</span>
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
      <div className="relative h-[470px]">
        <Screen on={i === 0}>
          <AnalyseScreen />
        </Screen>
        <Screen on={i === 1}>
          <AiScreen />
        </Screen>
        <Screen on={i === 2}>
          <SpotsScreen />
        </Screen>
        <Screen on={i === 3}>
          <RoadmapScreen />
        </Screen>
        <Screen on={i === 4}>
          <ProgressScreen />
        </Screen>
      </div>

      <div className="flex h-4 items-center justify-center gap-1" aria-hidden="true">
        {SCREENS.map((x, k) => (
          <span key={x.id} className={`h-1 rounded-full transition-all duration-500 ${k === i ? "w-4 bg-brand" : "w-1 bg-deep/20"}`} />
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
      <div className="relative mx-3 h-40 overflow-hidden rounded-[22px] lg:h-44">
        <Image src="/sports/kite-v1.jpg" alt="" fill sizes="480px" quality={85} className="object-cover object-[48%_50%]" />
        <div className="photo-veil absolute inset-0" />
        <div aria-hidden="true" className="sweep absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-transparent via-brand/40 to-transparent" />
        <span className="tag-glass absolute left-3 top-3 flex items-center gap-1.5 rounded-full py-0.5 pl-0.5 pr-2 text-[0.58rem] font-bold">
          <span className="relative h-5 w-5 overflow-hidden rounded-full">
            <Image src="/coachs/avatar-anil.jpg" alt="" fill sizes="20px" className="object-cover" />
          </span>
          Anil · diplômé d&apos;État
        </span>
        <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-3 text-white">
          <div>
            <p className="text-[0.6rem] text-white/80">Kitesurf · 12 s · image par image</p>
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
      <div className="mx-3 mt-2 grid grid-cols-4 gap-1.5 text-center">
        {phases.map(([p, n]) => (
          <div key={p} className={`${card} px-1.5 py-1.5`}>
            <p className="text-[0.9rem] font-extrabold leading-none">{n}</p>
            <div className="mx-auto mt-1 h-1 w-full overflow-hidden rounded-full bg-raised">
              <div className="h-full rounded-full bg-gradient-to-r from-brand to-[#3fb3e8]" style={{ width: `${n * 10}%` }} />
            </div>
            <p className="mt-1 text-[0.52rem] text-slate">{p}</p>
          </div>
        ))}
      </div>
      <div className={`${card} mx-3 mt-2 space-y-1.5 p-2.5`}>
        <p className="flex gap-2 text-[0.68rem] leading-snug">
          <span aria-hidden="true" className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-danger/10 text-[0.55rem] font-bold text-danger">1</span>
          <span><b>Regard trop tôt vers l&apos;avant.</b> Tourne la tête vers l&apos;épaule arrière dès le décollage.</span>
        </p>
        <p className="flex gap-2 text-[0.68rem] leading-snug">
          <span aria-hidden="true" className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-amber-100 text-[0.55rem] font-bold text-amber-700">2</span>
          <span><b>Barre loin des hanches.</b> Ramène-la pendant la rotation.</span>
        </p>
      </div>
      <div className="mx-3 mt-2 rounded-2xl bg-brand p-2.5 text-white">
        <p className="text-[0.55rem] font-bold uppercase tracking-wider text-white/75">Ta priorité · prochaine session</p>
        <p className="mt-0.5 text-[0.7rem] font-semibold leading-snug">5 sauts en regardant l&apos;aile jusqu&apos;au sommet, puis backroll en 15 nds.</p>
      </div>
    </div>
  );
}

function AiScreen() {
  return (
    <div className="flex h-full flex-col gap-2 px-3">
      <div className={`${card} flex items-center gap-2 px-2.5 py-2`}>
        <span className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-brand to-lagoon text-white" aria-hidden="true">
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 3l1.8 4.7L18.5 9.5l-4.7 1.8L12 16l-1.8-4.7L5.5 9.5l4.7-1.8z" />
          </svg>
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-emerald-500" />
        </span>
        <div className="min-w-0">
          <p className="text-[0.72rem] font-bold leading-tight">Coach IA kitesurf</p>
          <p className="text-[0.55rem] text-emerald-700">En ligne · répond en quelques secondes</p>
        </div>
        <span className="ml-auto rounded-full bg-emerald-500 px-1.5 py-0.5 text-[0.5rem] font-bold text-white">24/7</span>
      </div>
      <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-md bg-brand px-3 py-2 text-[0.7rem] leading-snug text-white">
        Demain 22 nds à l&apos;Almanarre, je fais 72 kg. Quelle aile ?
      </div>
      <div className={`${card} max-w-[92%] rounded-bl-md px-3 py-2 text-[0.68rem] leading-snug`}>
        Ton <b>9 m²</b>. Vent side-on l&apos;après-midi : parfait pour ton <b>backroll</b>.
        <p className="mt-1">Rappel d&apos;Anil : regarde l&apos;aile au décollage, pas l&apos;horizon.</p>
      </div>
      <div className="flex flex-wrap gap-1">
        {["Et à 28 nds ?", "Un exercice ?"].map((o) => (
          <span key={o} className="rounded-full border border-brand bg-white px-2 py-0.5 text-[0.58rem] font-semibold text-brand">{o}</span>
        ))}
      </div>
      <div className="ml-auto max-w-[70%] rounded-2xl rounded-br-md bg-brand px-3 py-2 text-[0.7rem] text-white">Un exercice pour le backroll ?</div>
      <div className={`${card} flex w-14 gap-1 rounded-bl-md px-3 py-2.5`} aria-hidden="true">
        {[0, 1, 2].map((k) => (
          <span key={k} className="h-1.5 w-1.5 animate-bounce rounded-full bg-slate/60" style={{ animationDelay: `${k * 0.15}s` }} />
        ))}
      </div>
      <div className="mt-auto flex items-center gap-2 rounded-full bg-white px-3 py-2 text-[0.62rem] text-slate shadow-sm">
        Pose ta question au coach IA…
        <span aria-hidden="true" className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-brand text-[0.6rem] text-white">↑</span>
      </div>
    </div>
  );
}

function SpotsScreen() {
  const spots = [
    { n: "L'Almanarre", d: "12 km", w: 26, name: "Ça charge 🔥", h: "13 h – 18 h", k: "9 m²", v: "Go !", c: "bg-emerald-500 text-white", live: 24 },
    { n: "La Capte", d: "9 km", w: 19, name: "Ça se lève 🌬️", h: "14 h – 17 h", k: "12 m²", v: "Oui", c: "bg-emerald-100 text-emerald-800" },
    { n: "Six-Fours", d: "38 km", w: 31, name: "Gros temps ⚡", h: "11 h – 15 h", k: "7 m²", v: "Prudence", c: "bg-amber-100 text-amber-800" },
    { n: "Les Salins", d: "6 km", w: 5, name: "Pétole 😴", h: "—", k: "", v: "Non", c: "bg-raised text-slate" },
  ];
  return (
    <div className="px-3">
      <div className="relative h-20 overflow-hidden rounded-[22px] bg-[linear-gradient(160deg,#cfe7f5_0%,#a9d3ec_55%,#e9e1cf_56%,#efe8d8_100%)]">
        <svg viewBox="0 0 300 100" className="absolute inset-0 h-full w-full" aria-hidden="true">
          <path d="M0 62 C 60 50 90 70 140 58 S 230 46 300 60" fill="none" stroke="#fff" strokeWidth="2" opacity="0.7" />
        </svg>
        {[[28, 40, "bg-emerald-500"], [46, 58, "bg-emerald-400"], [70, 35, "bg-amber-400"], [86, 60, "bg-slate"]].map(([x, y, c], k) => (
          <span key={k} className={`absolute h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-white ${c}`} style={{ left: `${x}%`, top: `${y}%` }} />
        ))}
        <span className="absolute bottom-2 right-2 rounded-full bg-white/85 px-2 py-0.5 text-[0.55rem] font-semibold">4 modèles météo croisés</span>
      </div>
      <ul className="mt-2 space-y-1.5">
        {spots.map((sp, k) => (
          <li key={sp.n} className={`${card} flex items-center gap-2 px-2.5 py-1.5 ${k === 0 ? "ring-2 ring-emerald-500" : ""}`}>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1 truncate text-[0.74rem] font-semibold">
                {sp.n}
                {sp.live && (
                  <span className="rounded-full bg-emerald-50 px-1 text-[0.5rem] font-bold text-emerald-700">● live {sp.live} nds</span>
                )}
              </p>
              <p className="truncate text-[0.56rem] text-slate">
                {sp.name} · {sp.w} nds · {sp.h}
                {sp.k && ` · ${sp.k}`}
              </p>
            </div>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[0.58rem] font-bold ${sp.c}`}>{sp.v}</span>
          </li>
        ))}
      </ul>
      <p className="mt-2 text-center text-[0.55rem] text-slate">Selon ton niveau, ton poids et tes ailes</p>
    </div>
  );
}

function RoadmapScreen() {
  const levels: { l: string; done: number; total: number; on?: boolean }[] = [
    { l: "Débutant", done: 11, total: 11 },
    { l: "Intermédiaire", done: 14, total: 14 },
    { l: "Avancé", done: 4, total: 15, on: true },
    { l: "Expert", done: 0, total: 14 },
  ];
  return (
    <div className="px-3">
      <div className={`${card} flex items-center gap-3 p-3`}>
        <div className="relative h-12 w-12 shrink-0">
          <svg viewBox="0 0 36 36" className="h-12 w-12 -rotate-90" aria-hidden="true">
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--raised)" strokeWidth="3.5" />
            <circle cx="18" cy="18" r="15.5" fill="none" stroke="var(--brand)" strokeWidth="3.5" strokeLinecap="round" strokeDasharray="97.4" strokeDashoffset="44.6" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[0.7rem] font-extrabold">54 %</span>
        </div>
        <div>
          <p className="text-[0.8rem] font-bold leading-tight">29 figures sur 54</p>
          <p className="text-[0.6rem] text-slate">Du water start au kiteloop backroll</p>
        </div>
      </div>
      <ul className="mt-2 space-y-1.5">
        {levels.map((x) => (
          <li key={x.l} className={`${card} px-3 py-2 ${x.on ? "ring-2 ring-brand" : ""}`}>
            <div className="flex items-center justify-between text-[0.68rem]">
              <span className="font-semibold">
                {x.done === x.total ? "✓ " : x.done === 0 ? "🔒 " : ""}
                {x.l}
              </span>
              <span className="text-slate">{x.done}/{x.total}</span>
            </div>
            <div className="mt-1 h-1 overflow-hidden rounded-full bg-raised">
              <div className="h-full rounded-full bg-brand" style={{ width: `${(x.done / x.total) * 100}%` }} />
            </div>
            {x.on && (
              <div className="mt-1.5 flex flex-wrap gap-1">
                <span className="rounded-full bg-brand px-1.5 py-0.5 text-[0.52rem] font-bold text-white">En cours · Backroll grab</span>
                <span className="rounded-full bg-brand-light px-1.5 py-0.5 text-[0.52rem] font-bold text-brand">Prochaine · Double backroll</span>
              </div>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-center text-[0.55rem] text-slate">Chaque figure : cours, points clés, vidéo au coach</p>
    </div>
  );
}

function ProgressScreen() {
  const notes = [4, 5, 5, 6, 5.5, 6.5, 7, 7, 7.5, 8];
  const pts = notes.map((n, k) => `${(k / (notes.length - 1)) * 100},${40 - (n / 10) * 36}`).join(" ");
  return (
    <div className="px-3">
      <div className="rounded-[22px] bg-deep p-3 text-white">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.55rem] font-bold uppercase tracking-wider text-white/65">Palier 3 · Shredder</p>
            <p className="text-[0.85rem] font-bold">2 450 XP</p>
          </div>
          <span className="rounded-full bg-white/15 px-2 py-0.5 text-[0.55rem] font-bold">+320 cette semaine</span>
        </div>
        <svg viewBox="0 0 100 42" className="mt-2 h-16 w-full" preserveAspectRatio="none" aria-hidden="true">
          <polyline points={pts} fill="none" stroke="#7cc7ee" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>
        <p className="flex items-center justify-between text-[0.58rem] text-white/75">
          <span>Ta note moyenne : 4 → 8/10</span>
          <span>10 dernières analyses</span>
        </p>
      </div>
      <div className={`${card} mt-2 p-2.5`}>
        <p className="text-[0.62rem] font-bold">Tes erreurs qui reculent</p>
        {[
          ["Regard trop tôt", "En baisse", "text-emerald-700 bg-emerald-50"],
          ["Barre loin des hanches", "En baisse", "text-emerald-700 bg-emerald-50"],
          ["Réception jambes raides", "Revient souvent", "text-amber-700 bg-amber-50"],
        ].map(([e, t, c]) => (
          <p key={e} className="mt-1 flex items-center justify-between text-[0.62rem]">
            {e}
            <span className={`rounded-full px-1.5 py-0.5 text-[0.5rem] font-bold ${c}`}>{t}</span>
          </p>
        ))}
      </div>
      <div className="mt-2 grid grid-cols-3 gap-1.5 text-center">
        {[
          ["🔥", "Série de 4"],
          ["🎯", "Premier 8/10"],
          ["📅", "3 mois actifs"],
        ].map(([e, t]) => (
          <div key={t} className={`${card} px-1 py-2`}>
            <p className="text-base leading-none">{e}</p>
            <p className="mt-1 text-[0.52rem] font-semibold leading-tight">{t}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
