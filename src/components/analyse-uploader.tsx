"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { buildFrames, clipFingerprint, loadVideo } from "@/lib/frames";
import { LEVEL_LABELS, LEVEL_ORDER, SPORTS, trickById, tricksFor, type SportId } from "@/lib/sports";
import { ClipTrimmer } from "./clip-trimmer";
import { CropPicker, FULL_FRAME, type Crop } from "./crop-picker";

const MAX_SIZE = 200 * 1024 * 1024;

type Step = "idle" | "empreinte" | "images" | "analyse";

export function AnalyseUploader({
  defaultTrick,
  remaining,
  deep,
  frameCount,
  sports,
  defaultSport,
}: {
  defaultTrick?: string;
  remaining: number;
  deep: boolean;
  frameCount: number;
  sports: SportId[];
  defaultSport: SportId;
}) {
  const router = useRouter();
  const [sport, setSport] = useState<SportId>(defaultTrick ? trickById(defaultTrick)?.sport ?? defaultSport : defaultSport);
  const [trick, setTrick] = useState(defaultTrick ?? "");
  const [file, setFile] = useState<File | null>(null);
  const [src, setSrc] = useState<string | null>(null);
  const [seg, setSeg] = useState({ start: 0, end: 0 });
  const [crop, setCrop] = useState<Crop>(FULL_FRAME);
  const [step, setStep] = useState<Step>("idle");
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<{ text: string; upgrade?: boolean } | null>(null);
  const [dragging, setDragging] = useState(false);

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
    setCrop(FULL_FRAME);
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
      const { frames, times } = await buildFrames(
        video,
        seg.start,
        seg.end,
        frameCount,
        (d, t) => setProgress(Math.round((d / t) * 100)),
        crop,
      );

      setStep("analyse");
      const res = await fetch("/api/analyses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sport,
          trick,
          notes: form.get("notes") ?? "",
          extension: ext,
          clipHash,
          segStart: seg.start,
          segEnd: seg.end,
          crop: crop.w < 1 ? [crop.x, crop.y, crop.w].map((v) => Math.round(v * 100) / 100) : null,
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
      if (created.frames !== frameCount) {
        throw new Error("Ta formule vient de changer : recharge la page puis relance l'analyse.");
      }

      // Le clip complet (souvent 30 à 100 Mo depuis un téléphone) ne sert qu'à le revoir à côté du rapport :
      // il part en parallèle et n'empêche pas d'afficher le résultat dès que l'IA a répondu.
      if (created.needsUpload) {
        const id = created.id as string;
        void createClient()
          .storage.from("clips")
          .upload(created.videoPath, file, { contentType: file.type, upsert: false })
          .catch((e: unknown) => ({ error: e }))
          .then((up) => {
            if (up.error) fetch(`/api/analyses/${id}`, { method: "POST", body: JSON.stringify({ action: "video-missing" }) });
          });
      }

      const runRes = await fetch(`/api/analyses/${created.id}/run`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ frames, frameTimes: times }),
      });
      const done = await runRes.json();
      analysisId = null; // le serveur a pris en charge l'analyse (réussie ou marquée en échec)
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
            Depuis ta galerie, ou glisse le fichier ici. Tu choisiras ensuite le passage de ta figure, 20 secondes maximum.
          </span>
          <span className="mt-3 text-xs text-slate">MP4, MOV ou WebM · 200 Mo max</span>
        </label>
        <input id="clip" type="file" accept="video/mp4,video/quicktime,video/webm" className="sr-only" onChange={(e) => pick(e.target.files?.[0])} />
        {error && <p role="alert" className="text-danger">{error.text}</p>}
        <p className="text-center text-sm text-slate">
          Il te reste {remaining} analyse{remaining > 1 ? "s" : ""} sur cette période.
        </p>

        <div className="panel mt-4 p-5">
          <p className="font-bold">Pour une analyse précise</p>
          <ul className="mt-3 grid gap-2.5 text-[0.95rem] sm:grid-cols-2">
            {[
              ["De côté", "Filme perpendiculairement à ta trajectoire, pas de face."],
              ["Pas trop loin", "20 à 40 m : le rider doit rester bien visible, kite ou aile compris."],
              ["Stable", "Téléphone à l'horizontale, sans zoomer pendant la figure."],
              ["Une figure", "Garde juste l'approche, la figure et la réception : 20 s max."],
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
    { id: "empreinte", label: "Préparation du clip" },
    { id: "images", label: "Extraction des images" },
    { id: "analyse", label: deep ? "Analyse approfondie par le coach" : "Analyse par le coach" },
  ];
  const stepIndex = STEPS.findIndex((x) => x.id === step);

  return (
    <form onSubmit={submit} className="space-y-6">
      <section>
        <h2 className="text-xl font-bold">1. Choisis le passage</h2>
        <p className="mt-1 text-[0.95rem] text-slate">
          Fais glisser les poignées bleues pour garder uniquement ta figure, du début à la fin. Plus le passage est serré,
          plus l&apos;analyse est précise.
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

      {seg.end > seg.start && (
        <section>
          <h2 className="text-xl font-bold">2. Zoome sur ta figure</h2>
          <p className="mt-1 text-[0.95rem] text-slate">
            Tu es loin ? Zoome sur la zone où se passe ta figure, en gardant ton kite ou ton aile dans le cadre.
            L&apos;analyse verra jusqu&apos;à 4× plus de détails.
          </p>
          <div className="mt-3">
            <CropPicker src={src} start={seg.start} end={seg.end} value={crop} onChange={setCrop} disabled={busy} />
          </div>
        </section>
      )}

      <section className="space-y-4">
        <h2 className="text-xl font-bold">3. Dis ce que tu tentes</h2>
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
          <label htmlFor="notes" className="label">Ce que tu as voulu faire</label>
          <textarea
            id="notes"
            name="notes"
            rows={2}
            required
            minLength={3}
            maxLength={500}
            disabled={busy}
            placeholder="Ex. mon premier saut, je voulais aller plus haut · un backroll, je ne finis pas la rotation"
            className="field"
          />
          <p className="mt-1 text-sm text-slate">Obligatoire : l&apos;analyse compare ce que tu voulais faire à ce que montre la vidéo.</p>
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
        {busy ? (
          <ol role="status" className="mt-3 space-y-1.5 text-sm" aria-label={statusText}>
            {STEPS.map((x, i) => {
              const done = i < stepIndex;
              const now = i === stepIndex;
              return (
                <li key={x.id} className={`flex items-center gap-2 ${done ? "text-lagoon" : now ? "font-semibold" : "text-slate"}`}>
                  <span aria-hidden="true" className={`flex h-5 w-5 items-center justify-center rounded-full text-[0.65rem] font-bold ${done ? "bg-brand text-white" : now ? "border-2 border-brand" : "border-2 border-line"}`}>
                    {done ? "✓" : ""}
                  </span>
                  {x.label}
                  {now && x.id === "images" && ` · ${progress} %`}
                  {now && x.id === "analyse" && " · 30 à 60 s, tu peux rester sur la page"}
                </li>
              );
            })}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-slate">
            Il te reste {remaining} analyse{remaining > 1 ? "s" : ""} sur cette période.
          </p>
        )}
      </div>
    </form>
  );
}
