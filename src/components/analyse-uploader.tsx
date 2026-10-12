"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { extractFrames, loadVideo } from "@/lib/frames";
import { LEVELS, TRICKS } from "@/lib/tricks";

const MAX_SIZE = 100 * 1024 * 1024;
const MAX_DURATION = 30;

type Step = "idle" | "reservation" | "upload" | "images" | "analyse";
const STEP_LABEL: Record<Step, string> = {
  idle: "",
  reservation: "Préparation…",
  upload: "Envoi du clip…",
  images: "Lecture des images…",
  analyse: "Analyse en cours, ça prend environ 30 secondes…",
};

export function AnalyseUploader({ defaultTrick }: { defaultTrick?: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState<{ text: string; upgrade?: boolean } | null>(null);

  function pick(f: File | undefined) {
    setError(null);
    if (!f) return;
    if (!/^video\/(mp4|quicktime|webm)$/.test(f.type)) {
      setError({ text: "Formats acceptés : MP4, MOV ou WebM." });
      return;
    }
    if (f.size > MAX_SIZE) {
      setError({ text: "Clip trop lourd (100 Mo max). Coupe-le autour de ta figure." });
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(f);
    setPreview(URL.createObjectURL(f));
  }

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!file) {
      setError({ text: "Choisis d'abord un clip." });
      return;
    }
    setError(null);
    const form = new FormData(e.currentTarget);

    try {
      const video = await loadVideo(file);
      if (video.duration > MAX_DURATION) {
        throw new Error(`Ton clip dure ${Math.round(video.duration)} s. Coupe-le à 20 s autour de ta figure.`);
      }

      setStep("reservation");
      const ext = file.type === "video/quicktime" ? "mov" : file.type === "video/webm" ? "webm" : "mp4";
      const res = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trick: form.get("trick") ?? "", notes: form.get("notes") ?? "", extension: ext }),
      });
      const created = await res.json();
      if (!res.ok) {
        setError({ text: created.error, upgrade: created.upgrade });
        setStep("idle");
        return;
      }

      setStep("upload");
      const { error: upErr } = await createClient()
        .storage.from("clips")
        .upload(created.videoPath, file, { contentType: file.type, upsert: false });
      if (upErr) throw new Error("L'envoi du clip a échoué. Vérifie ta connexion et réessaie.");

      setStep("images");
      const frames = await extractFrames(video);

      setStep("analyse");
      const run = await fetch(`/api/analyses/${created.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frames }),
      });
      const done = await run.json();
      if (!run.ok) throw new Error(done.error);

      router.push(`/analyse/${created.id}`);
      router.refresh();
    } catch (err) {
      setError({ text: err instanceof Error ? err.message : "Une erreur est survenue." });
      setStep("idle");
    }
  }

  const busy = step !== "idle";

  return (
    <form onSubmit={submit} className="panel space-y-6 p-6">
      <div>
        <label htmlFor="clip" className="label">Ton clip (20 s, MP4 ou MOV)</label>
        {preview ? (
          <div className="space-y-2">
            <video src={preview} controls playsInline muted className="max-h-72 w-full rounded-xl bg-deep" />
            {!busy && (
              <button type="button" onClick={() => { setFile(null); setPreview(null); }} className="text-sm text-lagoon hover:underline">
                Choisir un autre clip
              </button>
            )}
          </div>
        ) : (
          <label
            htmlFor="clip"
            className="flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-line px-4 py-10 text-center hover:border-lagoon"
          >
            <span className="font-semibold">Choisir une vidéo</span>
            <span className="mt-1 text-sm text-slate">Filme de côté, kite et rider dans le cadre si possible</span>
          </label>
        )}
        <input
          id="clip"
          type="file"
          accept="video/mp4,video/quicktime,video/webm"
          className="sr-only"
          onChange={(e) => pick(e.target.files?.[0])}
          disabled={busy}
        />
      </div>

      <div>
        <label htmlFor="trick" className="label">Figure tentée</label>
        <select id="trick" name="trick" defaultValue={defaultTrick ?? ""} className="field" disabled={busy}>
          <option value="">Je ne sais pas, identifie-la</option>
          {LEVELS.map((l) => (
            <optgroup key={l.id} label={l.label}>
              {TRICKS.filter((t) => t.level === l.id).map((t) => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </optgroup>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="notes" className="label">Ce qui coince (facultatif)</label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          maxLength={500}
          disabled={busy}
          placeholder="Ex. je n'arrive pas à finir la rotation, je retombe sur le dos"
          className="field"
        />
      </div>

      {error && (
        <p role="alert" className="text-danger">
          {error.text}{" "}
          {error.upgrade && <Link href="/tarifs" className="font-semibold underline">Voir les formules</Link>}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-4">
        <button disabled={busy || !file} className="btn btn-primary">
          {busy ? "Analyse en cours…" : "Analyser mon clip"}
        </button>
        {busy && <p role="status" className="text-slate">{STEP_LABEL[step]}</p>}
      </div>
    </form>
  );
}
