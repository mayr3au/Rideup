"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildContactSheets, clipFingerprint, loadVideo } from "@/lib/frames";
import { LEVELS, TRICKS } from "@/lib/tricks";
import { ClipTrimmer } from "./clip-trimmer";

const MAX_SIZE = 200 * 1024 * 1024;

type Step = "idle" | "empreinte" | "images" | "analyse";

export function AnalyseUploader({
  defaultTrick,
  remaining,
  deep,
  sheetCount,
}: {
  defaultTrick?: string;
  remaining: number;
  deep: boolean;
  sheetCount: number;
}) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [seg, setSeg] = useState({ start: 0, end: 0 });
  const [step, setStep] = useState<Step>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<{ text: string; upgrade?: boolean } | null>(null);

  useEffect(() => () => { if (src) URL.revokeObjectURL(src); }, [src]);

  const onSegment = useCallback((start: number, end: number) => setSeg({ start, end }), []);

  function pick(f: File | undefined) {
    setError(null);
    if (!f) return;
    if (!/^video\/(mp4|quicktime|webm)$/.test(f.type)) {
      setError({ text: "Formats acceptés : MP4, MOV ou WebM." });
      return;
    }
    if (f.size > MAX_SIZE) {
      setError({ text: "Vidéo trop lourde (200 Mo max). Coupe-la autour de ta session dans ta galerie." });
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
      setStep("empreinte");
      const clipHash = await clipFingerprint(file);
      const ext = file.type === "video/quicktime" ? "mov" : file.type === "video/webm" ? "webm" : "mp4";

      // Les images sont extraites AVANT de réserver l'analyse : si le clip est illisible,
      // rien n'est décompté.
      setStep("images");
      setProgress(0);
      const video = await loadVideo(src);
      const { sheets, times } = await buildContactSheets(video, seg.start, seg.end, sheetCount, (d, t) =>
        setProgress(Math.round((d / t) * 100)),
      );

      setStep("analyse");
      const res = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trick: form.get("trick") ?? "",
          notes: form.get("notes") ?? "",
          extension: ext,
          clipHash,
          segStart: seg.start,
          segEnd: seg.end,
        }),
      });
      const created = await res.json();
      if (!res.ok) {
        setError({ text: created.error, upgrade: created.upgrade });
        setStep("idle");
        return;
      }

      // Même passage déjà analysé : on affiche le résultat existant, sans rien repayer.
      if (created.reusedId) {
        router.push(`/analyse/${created.reusedId}?deja=1`);
        return;
      }
      analysisId = created.id;
      if (created.sheets !== sheetCount) {
        throw new Error("Ta formule vient de changer : recharge la page puis relance l'analyse.");
      }

      const upload = created.needsUpload
        ? createClient()
            .storage.from("clips")
            .upload(created.videoPath, file, { contentType: file.type, upsert: false })
            .catch((e: unknown) => ({ error: e }))
        : Promise.resolve({ error: null });

      const run = fetch(`/api/analyses/${created.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sheets, frameTimes: times }),
      });

      const [up, runRes] = await Promise.all([upload, run]);
      const done = await runRes.json();
      analysisId = null; // le serveur a pris en charge l'analyse (réussie ou marquée en échec)
      if (up.error) {
        await fetch(`/api/analyses/${created.id}`, { method: "POST", body: JSON.stringify({ action: "video-missing" }) });
      }
      if (!runRes.ok) throw new Error(done.error);

      router.push(`/analyse/${created.id}`);
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
  const statusText =
    step === "empreinte"
      ? "Préparation du clip…"
      : step === "images"
        ? `Extraction des images du passage… ${progress} %`
        : step === "analyse"
          ? `Analyse ${deep ? "approfondie " : ""}en cours, compte 30 à 60 secondes…`
          : "";

  if (!file || !src) {
    return (
      <div className="space-y-3">
        <label
          htmlFor="clip"
          className="flex min-h-44 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-deep/25 bg-spray px-4 py-10 text-center hover:border-lagoon"
        >
          <span className="font-display text-2xl font-bold">Importer une vidéo</span>
          <span className="mt-2 max-w-xs text-slate">
            Tu choisiras ensuite le passage de ta figure, 20 secondes maximum.
          </span>
        </label>
        <input id="clip" type="file" accept="video/mp4,video/quicktime,video/webm" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        {error && <p role="alert" className="text-danger">{error.text}</p>}
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-6">
      <section>
        <h2 className="text-xl font-bold">1. Choisis le passage</h2>
        <p className="mt-1 text-[0.95rem] text-slate">
          Garde l&apos;approche, l&apos;appel, le saut et la réception. Plus le passage est serré autour de la figure, plus
          l&apos;analyse est précise.
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
        <h2 className="text-xl font-bold">2. Dis ce que tu tentes</h2>
        <div>
          <label htmlFor="trick" className="label">Figure</label>
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
          <textarea id="notes" name="notes" rows={2} maxLength={500} disabled={busy} placeholder="Ex. je ne finis pas la rotation" className="field" />
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
          {busy ? "Analyse en cours…" : `Analyser ce passage (${(seg.end - seg.start).toFixed(1)} s)`}
        </button>
        <p role="status" className="mt-2 text-sm text-slate">
          {busy ? statusText : `Il te reste ${remaining} analyse${remaining > 1 ? "s" : ""} sur cette période.`}
        </p>
      </div>
    </form>
  );
}
