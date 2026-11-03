"use client";

import { startTransition, useActionState, useState } from "react";
import type { ReviewState } from "@/app/(app)/espace-coach/actions";

type Option = { value: string; label: string };
type Phase = { id: "approche" | "appel" | "vol" | "reception"; label: string };

const MAX_ERRORS = 6;

/** Formulaire du coach : même structure que le rapport affiché au rider. */
export function ReviewForm({
  action,
  analysisId,
  defaultFigure,
  defaultFigureId,
  tricks,
  errorCodes,
  phases,
}: {
  action: (s: ReviewState, f: FormData) => Promise<ReviewState>;
  analysisId: string;
  defaultFigure: string;
  defaultFigureId: string;
  tricks: Option[];
  errorCodes: Option[];
  phases: Phase[];
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [errorRows, setErrorRows] = useState(2);
  const [figureId, setFigureId] = useState(defaultFigureId);
  const [figure, setFigure] = useState(defaultFigure);

  return (
    <form
      // Soumission manuelle : React ne vide pas le formulaire si le serveur renvoie une erreur
      onSubmit={(e) => {
        e.preventDefault();
        const data = new FormData(e.currentTarget);
        startTransition(() => formAction(data));
      }}
      className="space-y-8"
    >
      <input type="hidden" name="id" value={analysisId} />

      <section className="space-y-4">
        <h2 className="text-xl font-bold">Vue d&apos;ensemble</h2>
        <div className="grid gap-4 sm:grid-cols-[1fr_8rem]">
          <div>
            <label htmlFor="figure_id" className="label">Figure</label>
            <select
              id="figure_id"
              name="figure_id"
              value={figureId}
              onChange={(e) => {
                setFigureId(e.target.value);
                const t = tricks.find((o) => o.value === e.target.value);
                if (t) setFigure(t.label);
              }}
              className="field"
            >
              <option value="">Hors roadmap (nom libre)</option>
              {tricks.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
            <input name="figure" value={figure} onChange={(e) => setFigure(e.target.value)} required maxLength={80} className="field mt-2" aria-label="Nom affiché de la figure" />
          </div>
          <div>
            <label htmlFor="note" className="label">Note /10</label>
            <input id="note" name="note" type="number" min={0} max={10} step={0.5} required className="field" />
          </div>
        </div>
        <div>
          <label htmlFor="resume" className="label">Ton retour en quelques phrases</label>
          <textarea id="resume" name="resume" rows={4} required minLength={10} maxLength={1500} className="field" placeholder="Ce que tu vois, ce qui fonctionne, ce qui bloque." />
        </div>
        <div>
          <label htmlFor="priorite_session" className="label">Priorité pour sa prochaine session</label>
          <input id="priorite_session" name="priorite_session" required maxLength={400} className="field" placeholder="Ex. Attendre le point haut de l'aile avant de déclencher la rotation." />
        </div>
        <fieldset>
          <legend className="label">Qualité de la vidéo</legend>
          <div className="flex flex-wrap gap-4">
            {[
              ["bonne", "Bonne"],
              ["partielle", "Partielle"],
              ["faible", "Faible"],
            ].map(([v, l]) => (
              <label key={v} className="flex items-center gap-2">
                <input type="radio" name="visibilite" value={v} defaultChecked={v === "bonne"} /> {l}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <section>
        <h2 className="text-xl font-bold">Phase par phase</h2>
        <p className="mt-1 text-sm text-slate">Laisse vide une phase que la vidéo ne montre pas.</p>
        <div className="mt-3 space-y-3">
          {phases.map((p) => (
            <div key={p.id} className="grid gap-2 sm:grid-cols-[9rem_5rem_1fr] sm:items-start">
              <span className="pt-2 font-semibold">{p.label}</span>
              <input name={`phase_${p.id}_note`} type="number" min={0} max={10} step={0.5} aria-label={`Note ${p.label}`} placeholder="/10" className="field" />
              <textarea name={`phase_${p.id}_commentaire`} rows={2} maxLength={600} aria-label={`Commentaire ${p.label}`} className="field" />
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold">À corriger, dans l&apos;ordre</h2>
        <div className="mt-3 space-y-4">
          {Array.from({ length: errorRows }, (_, i) => (
            <fieldset key={i} className="panel space-y-2 p-4">
              <legend className="sr-only">Erreur {i + 1}</legend>
              <div className="grid gap-2 sm:grid-cols-[1fr_9rem]">
                <select name={`erreur_${i}_code`} defaultValue="autre" aria-label={`Type d'erreur ${i + 1}`} className="field">
                  {errorCodes.map((c) => (
                    <option key={c.value} value={c.value}>{c.label}</option>
                  ))}
                </select>
                <select name={`erreur_${i}_gravite`} defaultValue="moyenne" aria-label={`Gravité ${i + 1}`} className="field">
                  <option value="majeure">Majeure</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="mineure">Mineure</option>
                </select>
              </div>
              <input name={`erreur_${i}_probleme`} maxLength={600} placeholder="Le problème, tel que tu le vois" aria-label={`Problème ${i + 1}`} className="field" />
              <textarea name={`erreur_${i}_correction`} rows={2} maxLength={800} placeholder="La correction, concrète" aria-label={`Correction ${i + 1}`} className="field" />
            </fieldset>
          ))}
        </div>
        {errorRows < MAX_ERRORS && (
          <button type="button" onClick={() => setErrorRows((n) => n + 1)} className="mt-3 text-sm font-semibold text-lagoon hover:underline">
            + Ajouter une erreur
          </button>
        )}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="points_forts" className="label">Ce qui marche déjà (une ligne par point)</label>
          <textarea id="points_forts" name="points_forts" rows={4} className="field" />
        </div>
        <div>
          <label htmlFor="drills" className="label">Exercices (une ligne par exercice)</label>
          <textarea id="drills" name="drills" rows={4} className="field" />
        </div>
        <div>
          <label htmlFor="rappels" className="label">À garder en tête (facultatif)</label>
          <textarea id="rappels" name="rappels" rows={3} className="field" placeholder="Points clés pas visibles sur la vidéo" />
        </div>
        <div>
          <label htmlFor="evolution" className="label">Par rapport à ses tentatives précédentes (facultatif)</label>
          <textarea id="evolution" name="evolution" rows={3} maxLength={800} className="field" />
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="securite" className="label">Alerte sécurité (facultatif)</label>
          <input id="securite" name="securite" maxLength={600} className="field" placeholder="Seulement s'il y a un vrai risque" />
        </div>
      </section>

      {state?.error && <p role="alert" className="text-danger">{state.error}</p>}
      <div className="sticky bottom-20 z-10 -mx-4 border-t border-line bg-salt/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <button disabled={pending} className="btn btn-primary w-full sm:w-auto">{pending ? "Publication…" : "Publier le retour au rider"}</button>
      </div>
    </form>
  );
}
