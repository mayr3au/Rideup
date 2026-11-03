"use client";

import { useEffect, useState, useTransition, type ComponentProps } from "react";
import { ReviewForm } from "./review-form";
import type { ReviewDraft } from "@/lib/review-draft";

type FormProps = Omit<ComponentProps<typeof ReviewForm>, "initial">;

/**
 * Le coach écrit son compte rendu comme il parlerait à son élève (ou le dicte au micro du clavier),
 * l'IA le range dans le retour structuré, le coach relit et publie.
 */
export function CoachReviewWorkspace({
  structure,
  ...form
}: FormProps & { structure: (id: string, draft: string) => Promise<{ draft?: ReviewDraft; error?: string }> }) {
  const storageKey = `rideup-compte-rendu-${form.analysisId}`;
  const [text, setText] = useState("");
  const [draft, setDraft] = useState<ReviewDraft | null>(null);
  const [version, setVersion] = useState(0);
  const [manual, setManual] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  // Le compte rendu est gardé dans le navigateur : rien n'est perdu si la page se recharge
  useEffect(() => {
    try {
      setText(localStorage.getItem(storageKey) ?? "");
    } catch {}
  }, [storageKey]);
  useEffect(() => {
    try {
      if (text) localStorage.setItem(storageKey, text);
    } catch {}
  }, [text, storageKey]);

  function run() {
    setError(null);
    start(async () => {
      const res = await structure(form.analysisId, text);
      if (res.error || !res.draft) return setError(res.error ?? "Mise en forme impossible.");
      setDraft(res.draft);
      setVersion((v) => v + 1);
      setManual(false);
      requestAnimationFrame(() => document.getElementById("relecture")?.scrollIntoView({ behavior: "smooth", block: "start" }));
    });
  }

  const showForm = draft || manual;

  return (
    <div className="space-y-8">
      <section className="panel p-5">
        <p className="text-sm font-bold uppercase tracking-wider text-brand">Étape 1</p>
        <h2 className="mt-1 text-xl font-bold">Ton compte rendu, en vrac</h2>
        <p className="mt-1 text-[0.95rem] text-slate">
          Écris comme tu parlerais à ton élève sur la plage : ce que tu vois, ce qui marche, ce qu&apos;il faut corriger, les exercices, une note
          sur 10. Pas besoin de soigner la forme, l&apos;IA s&apos;en charge. Sur téléphone, tu peux dicter avec le micro du clavier.
        </p>
        <label htmlFor="compte-rendu" className="sr-only">Ton compte rendu</label>
        <textarea
          id="compte-rendu"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={9}
          maxLength={6000}
          disabled={pending}
          className="field mt-4"
          placeholder={"Ex. : approche ok, bonne vitesse. À l'appel il regarde déjà la réception, du coup la rotation part trop tôt et il retombe à plat. Barre trop loin des hanches pendant la rotation. Point positif : bon envoi de l'aile. Exos : 5 sauts en regardant l'aile jusqu'au sommet, puis backroll en vent modéré. Je mets 6/10."}
        />
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <button type="button" onClick={run} disabled={pending || text.trim().length < 20} className="btn btn-primary">
            {pending ? "Mise en forme en cours…" : draft ? "✨ Remettre en forme" : "✨ Mettre en forme avec l'IA"}
          </button>
          {!showForm && (
            <button type="button" onClick={() => setManual(true)} className="text-sm font-semibold text-lagoon hover:underline">
              Remplir le retour à la main
            </button>
          )}
          <span className="text-xs text-slate">{text.length}/6000</span>
        </div>
        {pending && <p className="mt-2 text-sm text-slate">L&apos;IA range ton compte rendu dans le retour (10 à 20 secondes).</p>}
        {error && (
          <p role="alert" className="mt-2 text-danger">
            {error}
          </p>
        )}
      </section>

      {showForm && (
        <section id="relecture" className="scroll-mt-24">
          <p className="text-sm font-bold uppercase tracking-wider text-brand">Étape 2</p>
          <h2 className="mt-1 text-xl font-bold">Relis, ajuste, publie</h2>
          {draft ? (
            <p className="mt-2 rounded-2xl bg-brand-light p-3 text-sm text-deep">
              ✨ Pré-rempli à partir de ton compte rendu. Vérifie la note, les erreurs et les exercices : c&apos;est ton nom qui part au rider.
            </p>
          ) : (
            <p className="mt-2 text-sm text-slate">Remplis le retour tel que le rider le recevra.</p>
          )}
          <div className="mt-6">
            <ReviewForm key={version} {...form} initial={draft ?? undefined} />
          </div>
        </section>
      )}
    </div>
  );
}
