"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Recherche autour de la position actuelle du téléphone (utile en voyage). */
export function NearMeButton({ radius }: { radius: number }) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "loading" | "denied">("idle");

  function locate() {
    if (!navigator.geolocation) return setState("denied");
    setState("loading");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(3);
        const lng = pos.coords.longitude.toFixed(3);
        router.push(`/spots?lat=${lat}&lng=${lng}&rayon=${radius}`);
        setState("idle");
      },
      () => setState("denied"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 },
    );
  }

  return (
    <button
      type="button"
      onClick={locate}
      disabled={state === "loading"}
      className="inline-flex min-h-10 items-center gap-1.5 rounded-full bg-brand-light px-3.5 text-sm font-semibold text-brand hover:bg-brand hover:text-white disabled:opacity-60"
      title={state === "denied" ? "Autorise la localisation dans ton navigateur" : undefined}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
        <circle cx="12" cy="12" r="3.5" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
      </svg>
      {state === "loading" ? "Localisation…" : state === "denied" ? "Position refusée" : "Autour de moi"}
    </button>
  );
}
