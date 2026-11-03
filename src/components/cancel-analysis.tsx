"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

/** Retirer sa vidéo de la file tant qu'aucun coach ne l'a prise : l'analyse est rendue. */
export function CancelAnalysis({ id }: { id: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function cancel() {
    if (!confirm("Retirer ta vidéo ? Elle ne sera pas analysée et ton analyse te sera rendue.")) return;
    setBusy(true);
    setError(null);
    const res = await fetch(`/api/analyses/${id}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "cancel" }),
    });
    if (!res.ok) {
      setError((await res.json().catch(() => ({}))).error ?? "Impossible de retirer la vidéo.");
      setBusy(false);
      router.refresh();
      return;
    }
    router.push("/analyse");
    router.refresh();
  }

  return (
    <div className="mt-3">
      <button type="button" onClick={cancel} disabled={busy} className="text-sm font-semibold text-danger hover:underline">
        {busy ? "Retrait…" : "Retirer ma vidéo"}
      </button>
      {error && <p role="alert" className="mt-1 text-sm text-danger">{error}</p>}
    </div>
  );
}
