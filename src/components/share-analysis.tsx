"use client";

import { useState } from "react";

/** Partage le résumé d'une analyse : partage natif sur téléphone, copie sinon. */
export function ShareAnalysis({ title, text }: { title: string; text: string }) {
  const [done, setDone] = useState<"copie" | "partage" | null>(null);

  async function share() {
    const payload = { title, text, url: window.location.href };
    try {
      if (navigator.share && navigator.canShare?.(payload)) {
        await navigator.share(payload);
        setDone("partage");
      } else {
        await navigator.clipboard.writeText(`${title}\n${text}\n${window.location.href}`);
        setDone("copie");
      }
      setTimeout(() => setDone(null), 2500);
    } catch {
      /* annulé par l'utilisateur */
    }
  }

  return (
    <button type="button" onClick={share} className="btn btn-ghost">
      {done === "copie" ? "Copié !" : done === "partage" ? "Partagé" : "Partager"}
    </button>
  );
}
