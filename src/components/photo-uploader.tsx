"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { SPORTS, type SportId } from "@/lib/sports";

/** Redimensionne une image (photo ou capture) en JPEG, grand côté = `max` pixels. */
async function toJpeg(src: string, max: number, quality: number) {
  const img = new Image();
  img.src = src;
  await img.decode();
  const scale = Math.min(1, max / Math.max(img.naturalWidth, img.naturalHeight));
  const c = document.createElement("canvas");
  c.width = Math.round(img.naturalWidth * scale);
  c.height = Math.round(img.naturalHeight * scale);
  const ctx = c.getContext("2d")!;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, c.width, c.height);
  return c.toDataURL("image/jpeg", quality);
}

/** Analyse simple : une photo + ce que tu fais dessus → retour sur ta position. */
export function PhotoUploader({
  remaining,
  sports,
  defaultSport,
  shortcuts = [],
  defaultIntention,
}: {
  remaining: number;
  sports: SportId[];
  defaultSport: SportId;
  /** Figures en cours du rider, proposées en un clic */
  shortcuts?: string[];
  /** Figure choisie depuis « Nouvelle tentative » */
  defaultIntention?: string;
}) {
  const router = useRouter();
  const [sport, setSport] = useState<SportId>(defaultSport);
  const [src, setSrc] = useState<string | null>(null);
  const [intention, setIntention] = useState(defaultIntention ?? "");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<{ text: string; upgrade?: boolean } | null>(null);

  useEffect(() => () => { if (src) URL.revokeObjectURL(src); }, [src]);

  function pick(f: File | undefined) {
    setError(null);
    if (!f) return;
    if (!f.type.startsWith("image/")) {
      setError({ text: "Choisis une photo (JPEG, PNG…). Pour une vidéo, fais une capture d'écran au bon moment." });
      return;
    }
    setSrc(URL.createObjectURL(f));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!src) return;
    setBusy(true);
    setError(null);
    try {
      const [image, thumb, mini] = await Promise.all([toJpeg(src, 1568, 0.85), toJpeg(src, 640, 0.7), toJpeg(src, 160, 0.7)]);
      const res = await fetch("/api/analyses/photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sport, intention, image, thumb, mini }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError({ text: data.error, upgrade: data.upgrade });
        setBusy(false);
        return;
      }
      router.push(`/analyse/${data.id}`);
      router.refresh();
    } catch {
      setError({ text: "Cette image n'a pas pu être lue. Essaie avec une autre photo ou une capture d'écran." });
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <label
        htmlFor="photo"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          pick(e.dataTransfer.files?.[0]);
        }}
        className={`panel flex cursor-pointer flex-col items-center justify-center overflow-hidden border-2 border-dashed text-center ${
          src ? "border-transparent p-0" : "min-h-56 border-brand/30 px-4 py-10 hover:border-brand"
        }`}
      >
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt="Ta photo" className="max-h-[60dvh] w-full object-contain" />
        ) : (
          <>
            <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-light text-brand" aria-hidden="true">
              <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 8h3l2-2.5h6L17 8h3v11H4zM12 16.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7z" />
              </svg>
            </span>
            <span className="mt-3 text-xl font-bold">Importer une photo</span>
            <span className="mt-2 max-w-xs text-slate">Une photo de toi, ou une capture d&apos;écran de ta vidéo au moment qui t&apos;intéresse.</span>
          </>
        )}
      </label>
      <input id="photo" type="file" accept="image/*" className="sr-only" disabled={busy} onChange={(e) => pick(e.target.files?.[0])} />
      {src && !busy && (
        <button type="button" onClick={() => setSrc(null)} className="text-sm text-lagoon hover:underline">
          Changer de photo
        </button>
      )}

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
                onClick={() => setSport(id)}
                className={`min-h-10 rounded-full px-4 text-sm font-semibold ${sport === id ? "bg-brand text-white" : "bg-raised"}`}
              >
                {SPORTS[id].name}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div>
        <label htmlFor="intention" className="label">Ce que tu fais sur la photo</label>
        <textarea
          id="intention"
          rows={2}
          required
          minLength={3}
          maxLength={300}
          disabled={busy}
          value={intention}
          onChange={(e) => setIntention(e.target.value)}
          placeholder="Ex. premier saut, en l'air · je navigue au près · réception de backroll"
          className="field"
        />
        {sport === defaultSport && shortcuts.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-2" role="group" aria-label="Figures en cours">
            {shortcuts.map((t) => (
              <button
                key={t}
                type="button"
                disabled={busy}
                onClick={() => setIntention(t)}
                className={`min-h-9 rounded-full border px-3 text-sm ${intention === t ? "border-brand bg-brand-light font-semibold text-brand" : "border-line"}`}
              >
                {t}
              </button>
            ))}
          </div>
        )}
      </div>

      <details className="rounded-2xl bg-raised px-4 py-3 text-[0.95rem]">
        <summary className="cursor-pointer font-semibold">Pour une analyse précise</summary>
        <ul className="mt-2 space-y-1 text-slate">
          <li>• Photo prise de côté, rider entier dans le cadre, planche visible.</li>
          <li>• Au moment clé : appel, en l&apos;air ou réception plutôt qu&apos;avant ou après.</li>
          <li>• Évite le contre-jour et le zoom numérique : une capture nette d&apos;une vidéo marche bien.</li>
        </ul>
      </details>

      {error && (
        <p role="alert" className="text-danger">
          {error.text}{" "}
          {error.upgrade && <Link href="/tarifs" className="font-semibold underline">Voir les formules</Link>}
        </p>
      )}

      <div className="sticky bottom-20 z-10 -mx-4 border-t border-line bg-salt/95 px-4 py-3 backdrop-blur sm:static sm:mx-0 sm:border-0 sm:bg-transparent sm:p-0">
        <button disabled={busy || !src || intention.trim().length < 3} className="btn btn-primary w-full sm:w-auto">
          {busy ? "Analyse en cours… (10 s environ)" : "Analyser ma position"}
        </button>
        {!busy && (
          <p className="mt-2 text-sm text-slate">
            Il te reste {remaining} analyse{remaining > 1 ? "s" : ""} sur cette période.
          </p>
        )}
      </div>
    </form>
  );
}
