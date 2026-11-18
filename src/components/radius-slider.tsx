"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

/** Crans du curseur : fins près de chez soi, plus larges au-delà. */
export const RADIUS_STEPS = [5, 10, 15, 20, 25, 30, 40, 50, 60, 75, 100, 125, 150, 200, 250, 300];

const nearestStep = (km: number) =>
  RADIUS_STEPS.reduce((best, s, i) => (Math.abs(s - km) < Math.abs(RADIUS_STEPS[best] - km) ? i : best), 0);

/** Rayon de recherche du Spot Finder, réglable au doigt ; la page se recharge quand on relâche. */
export function RadiusSlider({ radius, query = "" }: { radius: number; query?: string }) {
  const router = useRouter();
  const [idx, setIdx] = useState(() => nearestStep(radius));
  const sent = useRef(radius);
  const km = RADIUS_STEPS[idx];

  useEffect(() => {
    setIdx(nearestStep(radius));
    sent.current = radius;
  }, [radius]);

  const input = useRef<HTMLInputElement>(null);
  // « change » natif : déclenché quand on relâche le curseur (doigt, souris ou clavier), pas à chaque cran
  useEffect(() => {
    const el = input.current;
    if (!el) return;
    const apply = () => {
      const next = RADIUS_STEPS[Number(el.value)];
      if (next === sent.current) return;
      sent.current = next;
      router.push(`/spots?rayon=${next}${query ? `&${query}` : ""}`, { scroll: false });
    };
    el.addEventListener("change", apply);
    return () => el.removeEventListener("change", apply);
  }, [router, query]);

  const pct = (idx / (RADIUS_STEPS.length - 1)) * 100;

  return (
    <div className="w-full">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor="rayon" className="text-sm font-semibold text-deep">
          Spots à moins de
        </label>
        <output htmlFor="rayon" className="text-lg font-extrabold tabular-nums text-brand">
          {km} km
        </output>
      </div>
      <input
        ref={input}
        id="rayon"
        type="range"
        min={0}
        max={RADIUS_STEPS.length - 1}
        step={1}
        value={idx}
        onChange={(e) => setIdx(Number(e.target.value))}
        aria-valuetext={`${km} kilomètres`}
        className="radius-range mt-2 w-full"
        style={{ "--fill": `${pct}%` } as React.CSSProperties}
      />
      <div className="mt-1 flex justify-between text-xs text-slate" aria-hidden="true">
        <span>{RADIUS_STEPS[0]} km</span>
        <span>{RADIUS_STEPS.at(-1)} km</span>
      </div>
    </div>
  );
}
