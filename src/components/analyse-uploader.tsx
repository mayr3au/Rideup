"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { clipFingerprint } from "@/lib/clip";
import { canExportClip, DIRECT_UPLOAD_MAX, exportSegment } from "@/lib/clip-export";
import { MAX_SEGMENT_SECONDS } from "@/lib/plans";
import { LEVEL_LABELS, LEVEL_ORDER, SPORTS, trickById, tricksFor, type SportId } from "@/lib/sports";
import { ClipTrimmer } from "./clip-trimmer";

const MAX_SIZE = 1024 * 1024 * 1024;

type Step = "idle" | "preparation" | "decoupe" | "envoi" | "file";

/** Envoi d'une vidéo à un coach RIDE'UP : choix du passage, figure, question au coach. */
export function AnalyseUploader({
  defaultTrick,
  remaining,
  sports,
  defaultSport,
  delayHours,
}: {
  defaultTrick?: string;
  remaining: number;
  sports: SportId[];
  defaultSport: SportId;
  delayHours: number;
}) {
  const router = useRouter();
  const [sport, setSport] = useState<SportId>(defaultTrick ? trickById(defaultTrick)?.sport ?? defaultSport : defaultSport);
  const [trick, setTrick] = useState(defaultTrick ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [seg, setSeg] = useState({ start: 0, end: 0 });
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<{ text: string; upgrade?: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);
  const [cutProgress, setCutProgress] = useState(0);

  useEffect(() => () => { if (src) URL.revokeObjectURL(src); }, [src]);

  // Prévenir avant de quitter la page pendant l'envoi
  useEffect(() => {
    if (step === "idle") return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [step]);

  const onSegment = useCallback((start: number, end: number) => setSeg({ start, end }), []);

  function pick(f: File | undefined) {
    setError(null);
    if (!f) return;
    if (!/^video\/(mp4|quicktime|webm|x-m4v)$/.test(f.type) && !/\.(mp4|mov|m4v|webm)$/i.test(f.name)) {
      setError({ text: "Formats acceptés : MP4, MOV ou WebM." });
      return;
    }
    if (f.size > MAX_SIZE) {
      setError({ text: "Vidéo trop lourde (1 Go max). Coupe-la autour de ta figure dans ta galerie." });
      return;
    }
    setFile(f);
    setSrc(URL.createObjectURL(f));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file || !src) return;
    setError(null);
    const form = new FormData(e.currentTarget);
    let analysisId: string | null = null;

    try {
      setStep("preparation");
      const clipHash = await clipFingerprint(file);
      const lower = file.name.toLowerCase();
      let ext: "mp4" | "mov" | "webm" = file.type === "video/quicktime" || lower.endsWith(".mov") ? "mov" : file.type === "video/webm" || lower.endsWith(".webm") ? "webm" : "mp4";
      let upload: Blob = file;
      let segStart = seg.start;
      let segEnd = seg.end;

      // Vidéo lourde : on n'envoie que le passage choisi, réencodé en 720p (le stockage refuse les gros fichiers).
      if (file.size > DIRECT_UPLOAD_MAX) {
        if (!canExportClip()) {
          throw new Error("Ta vidéo est trop lourde pour être envoyée telle quelle. Coupe-la autour de ta figure dans ta galerie, puis réessaie.");
        }
        setStep("decoupe");
        setCutProgress(0);
        const cut = await exportSegment(file, seg.start, seg.end, setCutProgress);
        upload = cut.blob;
        ext = cut.extension;
        segStart = 0;
        segEnd = Math.round(cut.duration * 10) / 10;
      }

      const res = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sport,
          trick,
          notes: form.get("notes") ?? "",
          extension: ext,
          clipHash,
          segStart,
          segEnd,
        }),
      });
      const created = await res.json();
      if (!res.ok) {
        setError({ text: created.error, upgrade: created.upgrade });
        setStep("idle");
        return;
      }
      analysisId = created.id as string;

      setStep("envoi");
      const contentType = ext === "mov" ? "video/quicktime" : ext === "webm" ? "video/webm" : "video/mp4";
      const up = await createClient()
        .storage.from("clips")
        .uploadToSignedUrl(created.videoPath, created.uploadToken, upload, { contentType });
      if (up.error) {
        console.error("envoi vidéo", up.error);
        throw new Error(`L'envoi de la vidéo a échoué (${up.error.message}). Vérifie ta connexion et réessaie : rien n'est décompté.`);
      }

      setStep("file");
      const done = await fetch(`/api/analyses/${analysisId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "uploaded" }),
      });
      if (!done.ok) throw new Error((await done.json().catch(() => ({}))).error ?? "Envoi impossible. Réessaie.");

      router.push(`/analyse/${analysisId}?envoye=1`);
      router.refresh();
    } catch (err) {
      if (analysisId) {
        await fetch(`/api/analyses/${analysisId}`, { method: "POST", body: JSON.stringify({ action: "cancel" }) }).catch(() => {});
      }
      setError({ text: err instanceof Error ? err.message : "Une erreur est survenue. Réessaie." });
      setStep("idle");
    }
  }

  const busy = step !== "idle";
  const remainingText = `Il te reste ${remaining} analyse${remaining > 1 ? "s" : ""} coach sur cette période.`;

  if (!file || !src) {
    return (
      <div className="space-y-3">
        <label
          htmlFor="clip"
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); pick(e.dataTransfer.files?.[0]); }}
          className={`panel flex min-h-56 cursor-pointer flex-col items-center justify-center border-2 border-dashed px-4 py-10 text-center transition-colors ${
            dragging ? "border-brand bg-brand-light" : "border-brand/30 hover:border-brand"
          }`}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand" aria-hidden="true">
            <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"><path d="M4 7h11v10H4zM15 10.5l5-3v9l-5-3" /></svg>
          </span>
          <span className="mt-3 text-xl font-bold">{dragging ? "Lâche ta vidéo ici" : "Importer une vidéo"}</span>
          <span className="mt-2 max-w-xs text-slate">
            Depuis ta galerie, ou glisse le fichier ici. Tu choisiras ensuite le passage à montrer au coach, {MAX_SEGMENT_SECONDS} secondes maximum.
          </span>
          <span className="mt-3 text-xs text-slate">MP4, MOV ou WebM · 1 Go max</span>
        </label>
        <input id="clip" type="file" accept="video/mp4,video/quicktime,video/webm" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        {error && <p role="alert" className="text-danger">{error.text}</p>}
        <p className="text-center text-sm text-slate">{remainingText}</p>

        <div className="panel mt-4 p-5">
          <p className="font-bold">Pour que ton coach voie tout</p>
          <ul className="mt-3 grid gap-2.5 text-[0.95rem] sm:grid-cols-2">
            {[
              ["De côté", "Filme perpendiculairement à ta trajectoire, pas de face."],
              ["Pas trop loin", "20 à 40 m : le rider doit rester bien visible, kite ou aile compris."],
              ["Stable", "Téléphone à l'horizontale, sans zoomer pendant la figure."],
              ["Tout le mouvement", `L'approche, la figure et la réception : ${MAX_SEGMENT_SECONDS} s max.`],
            ].map(([t, d]) => (
              <li key={t} className="flex gap-2.5">
                <span aria-hidden="true" className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-light text-xs font-bold text-brand">✓</span>
                <span>
                  <span className="font-semibold">{t}.</span> <span className="text-slate">{d}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    );
  }

  const STEPS: { id: Step; label: string }[] = [
    { id: "preparation", label: "Préparation" },
    ...(file && file.size > DIRECT_UPLOAD_MAX ? [{ id: "decoupe" as Step, label: "Découpe du passage" }] : []),
    { id: "envoi", label: "Envoi de la vidéo" },
    { id: "file", label: "Transmission au coach" },
  ];
  const stepIndex = STEPS.findIndex((x) => x.id === step);

  return (
    <form onSubmit={submit} className="space-y-6">
      <section>
        <h2 className="text-xl font-bold">1. Choisis le passage</h2>
        <p className="mt-1 text-[0.95rem] text-slate">
          Fais glisser les poignées bleues pour montrer ta figure, de l&apos;approche à la réception. Le coach la regarde
          image par image.
        </p>
        <div className="mt-3">
          <ClipTrimmer src={src} start={seg.start} end={seg.end} onChange={onSegment} disabled={busy} />
        </div>
        {!busy && (
          <button type="button" onClick={() => { setFile(null); setSrc(null); }} className="mt-2 text-sm text-lagoon hover:underline">
            Changer de vidéo
          </button>
        )}
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-bold">2. Explique au coach</h2>
        {sports.length > 1 && (
          <fieldset>
            <legend className="label">Sport</legend>
            <div className="flex flex-wrap gap-2">
              {sports.map((id) => (
                <button
                  key={id}
                  type="button"
                  disabled={busy}
                  aria-pressed={sport === id}
                  onClick={() => {
                    setSport(id);
                    setTrick("");
                  }}
                  className={`min-h-10 rounded-full px-4 text-sm font-semibold ${sport === id ? "bg-brand text-white" : "bg-raised"}`}
                >
                  {SPORTS[id].name}
                </button>
              ))}
            </div>
          </fieldset>
        )}
        <div>
          <label htmlFor="trick" className="label">Figure de ta roadmap (facultatif)</label>
          <select id="trick" name="trick" value={trick} onChange={(e) => setTrick(e.target.value)} className="field" disabled={busy}>
            <option value="">Pas dans la liste</option>
            {LEVEL_ORDER.map((l) => {
              const list = tricksFor(sport).filter((t) => t.level === l);
              return list.length ? (
                <optgroup key={l} label={LEVEL_LABELS[l]}>
                  {list.map((t) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </optgroup>
              ) : null;
            })}
          </select>
        </div>
        <div>
          <label htmlFor="notes" className="label">Ce que tu as voulu faire, et ta question</label>
          <textarea
            id="notes"
            name="notes"
            rows={3}
            required
            minLength={3}
            maxLength={800}
            disabled={busy}
            placeholder="Ex. un backroll, je ne finis pas la rotation et j'atterris sur le dos. Qu'est-ce qui cloche à l'appel ?"
            className="field"
          />
          <p className="mt-1 text-sm text-slate">Plus tu es précis, plus le retour du coach sera utile.</p>
        </div>
      </section>

      {error && (
        <p role="alert" className="text-danger">
          {error.text}{" "}
          {error.upgrade && <Link href="/tarifs" className="font-semibold underline">Voir les formules</Link>}
        </p>
      )}

      <div className="sticky bottom-20 z-10 -mx-4 border-t border-line bg-salt/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <button disabled={busy || seg.end <= seg.start} className="btn btn-primary w-full sm:w-auto">
          {busy ? "Envoi en cours…" : `Envoyer au coach (${(seg.end - seg.start).toFixed(1)} s)`}
        </button>
        {busy ? (
          <ol role="status" className="mt-3 space-y-1.5 text-sm" aria-label="Envoi au coach">
            {STEPS.map((x, i) => {
              const done = i < stepIndex;
              const now = i === stepIndex;
              return (
                <li key={x.id} className={`flex items-center gap-2 ${done ? "text-lagoon" : now ? "font-semibold" : "text-slate"}`}>
                  <span aria-hidden="true" className={`flex h-5 w-5 items-center justify-center rounded-full text-[0.65rem] font-bold ${done ? "bg-brand text-white" : now ? "border-2 border-brand" : "border-2 border-line"}`}>
                    {done ? "✓" : ""}
                  </span>
                  {x.label}
                  {now && x.id === "decoupe" && ` · ${Math.round(cutProgress * 100)} %, garde cette page ouverte`}
                  {now && x.id === "envoi" && " · garde cette page ouverte"}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-slate">
            {remainingText} Retour du coach sous {delayHours} h.
          </p>
        )}
      </div>
    </form>
  );
}
