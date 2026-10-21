"use client";

import { useState } from "react";
import { ASSESSMENTS, scoreAssessment, type Assessment } from "@/lib/rider-details";
import { LEVEL_LABELS, SPORTS, type SportId } from "@/lib/sports";

export type QuizResult = Assessment & { label: string };

/**
 * QCM d'auto-évaluation : une question à la fois, score 0-100, niveau suggéré.
 * Mélange d'expérience déclarée et de questions de connaissance (une seule bonne réponse).
 */
export function LevelQuiz({ sport, initial, onResult }: { sport: SportId; initial?: Assessment; onResult: (r: QuizResult) => void }) {
  const qs = ASSESSMENTS[sport];
  const [open, setOpen] = useState(false);
  const [i, setI] = useState(0);
  const [rep, setRep] = useState<Record<string, number>>(initial?.reponses ?? {});
  const [result, setResult] = useState<QuizResult | null>(initial ? { ...initial, ...scoreAssessment(sport, initial.reponses) } : null);

  function start() {
    setRep({});
    setResult(null);
    setI(0);
    setOpen(true);
  }

  function answer(idx: number) {
    const q = qs[i];
    const next = { ...rep, [q.id]: idx };
    setRep(next);
    if (i + 1 < qs.length) {
      setI(i + 1);
    } else {
      const s = scoreAssessment(sport, next);
      const r: QuizResult = { score: s.score, level: s.level, label: s.label, at: new Date().toISOString(), reponses: next };
      setResult(r);
      setOpen(false);
      onResult(r);
    }
  }

  if (open) {
    const q = qs[i];
    return (
      <div className="rounded-2xl border border-brand/40 bg-brand-light/60 p-4" role="group" aria-label="Évaluation du niveau">
        <div className="flex items-center justify-between text-sm">
          <span className="font-semibold text-lagoon">
            Question {i + 1} / {qs.length}
          </span>
          <button type="button" onClick={() => setOpen(false)} className="text-slate hover:text-deep">
            Annuler
          </button>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white" aria-hidden="true">
          <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${(i / qs.length) * 100}%` }} />
        </div>
        <p className="mt-4 text-lg font-bold leading-snug">{q.q}</p>
        <div className="mt-3 grid gap-2">
          {q.a.map((txt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => answer(idx)}
              className="min-h-12 rounded-xl border border-line bg-white px-4 py-2.5 text-left text-[0.95rem] transition-colors hover:border-brand hover:bg-white active:bg-brand-light"
            >
              {txt}
            </button>
          ))}
        </div>
        {i > 0 && (
          <button type="button" onClick={() => setI(i - 1)} className="mt-3 text-sm font-semibold text-lagoon">
            ← Question précédente
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-line bg-salt p-4">
      {result ? (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-slate">Ton niveau évalué en {SPORTS[sport].name.toLowerCase()}</p>
            <p className="text-lg font-bold">
              {result.label} <span className="text-slate">· {result.score}/100</span>
            </p>
            <p className="text-sm text-slate">Le niveau « {LEVEL_LABELS[result.level]} » a été sélectionné. Tu peux le changer à la main.</p>
          </div>
          <button type="button" onClick={start} className="btn btn-ghost !min-h-10 !px-4 !py-2 !text-sm">
            Refaire le test
          </button>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="font-bold">Pas sûr de ton niveau ?</p>
            <p className="text-sm text-slate">{qs.length} questions, une minute : on situe ton vrai niveau de base, pas juste une case.</p>
          </div>
          <button type="button" onClick={start} className="btn btn-primary !min-h-10 !px-4 !py-2 !text-sm">
            Évaluer mon niveau
          </button>
        </div>
      )}
    </div>
  );
}
