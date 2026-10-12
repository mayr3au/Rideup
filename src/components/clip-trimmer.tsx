"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MAX_SEGMENT_SECONDS } from "@/lib/plans";

const MIN_SEGMENT = 1.5;

function fmt(t: number) {
  const m = Math.floor(t / 60);
  const s = (t % 60).toFixed(1).padStart(4, "0");
  return m ? `${m}:${s}` : `${(t % 60).toFixed(1)} s`;
}

type Drag = { kind: "start" | "end" | "body"; offset: number } | null;

/** Lecteur + sélection du passage à analyser (20 s max). Pensé pour le pouce sur mobile. */
export function ClipTrimmer({
  src,
  start,
  end,
  onChange,
  disabled,
}: {
  src: string;
  start: number;
  end: number;
  onChange: (start: number, end: number, duration: number) => void;
  disabled?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [duration, setDuration] = useState(0);
  const [current, setCurrent] = useState(0);
  const [drag, setDrag] = useState<Drag>(null);
  const [previewing, setPreviewing] = useState(false);

  const set = useCallback(
    (s: number, e: number) => {
      if (!duration) return;
      s = Math.max(0, Math.min(s, duration - MIN_SEGMENT));
      e = Math.max(s + MIN_SEGMENT, Math.min(e, duration));
      if (e - s > MAX_SEGMENT_SECONDS) e = s + MAX_SEGMENT_SECONDS;
      onChange(Math.round(s * 10) / 10, Math.round(e * 10) / 10, duration);
    },
    [duration, onChange],
  );

  function onLoaded() {
    const d = videoRef.current?.duration ?? 0;
    if (!Number.isFinite(d) || d < MIN_SEGMENT) {
      onChange(0, 0, d || 0); // clip trop court : le bouton d'analyse reste désactivé
      return;
    }
    setDuration(d);
    onChange(0, Math.round(Math.min(d, MAX_SEGMENT_SECONDS) * 10) / 10, d);
  }

  // Arrête la lecture à la fin du passage en mode « revoir »
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const tick = () => {
      setCurrent(v.currentTime);
      if (previewing && v.currentTime >= end) {
        v.pause();
        setPreviewing(false);
      }
    };
    v.addEventListener("timeupdate", tick);
    return () => v.removeEventListener("timeupdate", tick);
  }, [previewing, end]);

  function timeAt(clientX: number) {
    const rect = trackRef.current!.getBoundingClientRect();
    return Math.max(0, Math.min(1, (clientX - rect.left) / rect.width)) * duration;
  }

  function onPointerDown(kind: "start" | "end" | "body") {
    return (e: React.PointerEvent) => {
      if (disabled) return;
      e.preventDefault();
      e.stopPropagation();
      (e.target as Element).setPointerCapture(e.pointerId);
      setDrag({ kind, offset: kind === "body" ? timeAt(e.clientX) - start : 0 });
    };
  }

  function onPointerMove(e: React.PointerEvent) {
    if (!drag) return;
    const t = timeAt(e.clientX);
    if (drag.kind === "start") set(t, end);
    else if (drag.kind === "end") {
      const s = t - start > MAX_SEGMENT_SECONDS ? t - MAX_SEGMENT_SECONDS : start;
      set(s, t);
    } else {
      const len = end - start;
      const s = Math.max(0, Math.min(t - drag.offset, duration - len));
      set(s, s + len);
    }
    if (videoRef.current) videoRef.current.currentTime = drag.kind === "end" ? t : drag.kind === "start" ? t : start;
  }

  function preview() {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = start;
    setPreviewing(true);
    void v.play();
  }

  const pct = (t: number) => (duration ? (t / duration) * 100 : 0);
  const len = end - start;

  return (
    <div className="space-y-3">
      <video
        ref={videoRef}
        src={src}
        playsInline
        muted
        controls
        preload="auto"
        onLoadedMetadata={onLoaded}
        className="max-h-[55dvh] w-full rounded-md bg-brand"
      />

      {duration > 0 && (
        <>
          <div
            ref={trackRef}
            onPointerMove={onPointerMove}
            onPointerUp={() => setDrag(null)}
            onPointerCancel={() => setDrag(null)}
            onClick={(e) => {
              if (!drag && videoRef.current) videoRef.current.currentTime = timeAt(e.clientX);
            }}
            className="relative h-14 touch-none select-none rounded-md bg-raised"
            aria-label="Passage à analyser"
          >
            {/* Passage sélectionné */}
            <div
              onPointerDown={onPointerDown("body")}
              className="absolute inset-y-0 cursor-grab border-y-4 border-kite bg-kite/30 active:cursor-grabbing"
              style={{ left: `${pct(start)}%`, width: `${pct(len)}%` }}
            />
            {/* Poignées : zone tactile large (44 px) */}
            {(["start", "end"] as const).map((k) => (
              <div
                key={k}
                role="slider"
                tabIndex={0}
                aria-label={k === "start" ? "Début du passage" : "Fin du passage"}
                aria-valuemin={0}
                aria-valuemax={Math.round(duration)}
                aria-valuenow={k === "start" ? start : end}
                aria-valuetext={fmt(k === "start" ? start : end)}
                onPointerDown={onPointerDown(k)}
                onKeyDown={(e) => {
                  const d = e.key === "ArrowRight" ? 0.1 : e.key === "ArrowLeft" ? -0.1 : 0;
                  if (!d) return;
                  e.preventDefault();
                  if (k === "start") set(start + d, end);
                  else set(start, end + d);
                }}
                className="absolute inset-y-[-6px] flex w-11 -translate-x-1/2 cursor-ew-resize items-center justify-center"
                style={{ left: `${pct(k === "start" ? start : end)}%` }}
              >
                <span className="h-full w-2.5 rounded-sm bg-kite shadow-[0_0_0_2px_var(--deep)]" />
              </div>
            ))}
            {/* Tête de lecture */}
            <div className="pointer-events-none absolute inset-y-0 w-0.5 bg-brand" style={{ left: `${pct(current)}%` }} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 text-[0.95rem]">
            <p>
              <span className="font-semibold">
                {fmt(start)} → {fmt(end)}
              </span>{" "}
              <span className={len > MAX_SEGMENT_SECONDS - 0.05 ? "font-semibold text-deep" : "text-slate"}>
                ({len.toFixed(1)} s / {MAX_SEGMENT_SECONDS} s max)
              </span>
            </p>
            <button type="button" onClick={preview} disabled={disabled} className="btn btn-ghost !px-4 !py-2">
              Revoir le passage
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                const t = videoRef.current?.currentTime ?? 0;
                set(t, Math.max(end, t + MIN_SEGMENT));
              }}
              className="btn btn-ghost !px-3 !py-3 text-[0.95rem]"
            >
              Début à la tête de lecture
            </button>
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                const t = videoRef.current?.currentTime ?? 0;
                set(Math.max(Math.min(start, t - MIN_SEGMENT), t - MAX_SEGMENT_SECONDS), t);
              }}
              className="btn btn-ghost !px-3 !py-3 text-[0.95rem]"
            >
              Fin à la tête de lecture
            </button>
          </div>
        </>
      )}
    </div>
  );
}
