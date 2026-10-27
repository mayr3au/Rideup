"use client";

import { useEffect, useRef, useState } from "react";

export type Crop = { x: number; y: number; w: number; h: number }; // fractions de l'image (0-1)

export const FULL_FRAME: Crop = { x: 0, y: 0, w: 1, h: 1 };
const ZOOMS = [1, 1.5, 2, 3, 4];

const clamp = (v: number, min: number, max: number) => Math.max(min, Math.min(max, v));

/** Cadre de même proportion que la vidéo, centré sur (cx, cy), pour un zoom donné. */
function cropFor(zoom: number, cx: number, cy: number): Crop {
  const w = 1 / zoom;
  const h = 1 / zoom;
  return { w, h, x: clamp(cx - w / 2, 0, 1 - w), y: clamp(cy - h / 2, 0, 1 - h) };
}

/**
 * Recadrage de la zone analysée : quand le rider est loin, il ne fait que quelques pixels.
 * En zoomant sur la zone de la figure, l'IA reçoit jusqu'à 4× plus de détails sur le rider et son kite.
 */
export function CropPicker({
  src,
  start,
  end,
  value,
  onChange,
  disabled,
}: {
  src: string;
  start: number;
  end: number;
  value: Crop;
  onChange: (c: Crop) => void;
  disabled?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ px: number; py: number; x: number; y: number } | null>(null);
  const [aspect, setAspect] = useState(16 / 9);
  const [t, setT] = useState(0.5); // position dans le passage (0 = début, 1 = fin)
  const zoom = Math.round((1 / value.w) * 10) / 10;

  // Affiche l'image du passage à la position choisie
  useEffect(() => {
    const v = videoRef.current;
    if (!v || !Number.isFinite(v.duration)) return;
    v.currentTime = start + (end - start) * t;
  }, [start, end, t]);

  function setZoom(z: number) {
    onChange(cropFor(z, value.x + value.w / 2, value.y + value.h / 2));
  }

  function onPointerDown(e: React.PointerEvent) {
    if (disabled || zoom <= 1) return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    drag.current = { px: e.clientX, py: e.clientY, x: value.x, y: value.y };
  }

  function onPointerMove(e: React.PointerEvent) {
    const d = drag.current;
    const box = boxRef.current?.getBoundingClientRect();
    if (!d || !box) return;
    const x = clamp(d.x + (e.clientX - d.px) / box.width, 0, 1 - value.w);
    const y = clamp(d.y + (e.clientY - d.py) / box.height, 0, 1 - value.h);
    onChange({ ...value, x, y });
  }

  // Toucher l'image hors du cadre : on y recentre le cadre
  function onTapImage(e: React.MouseEvent) {
    if (disabled || zoom <= 1 || drag.current) return;
    const box = boxRef.current?.getBoundingClientRect();
    if (!box) return;
    onChange(cropFor(zoom, (e.clientX - box.left) / box.width, (e.clientY - box.top) / box.height));
  }

  return (
    <div className="space-y-3">
      <div
        ref={boxRef}
        onClick={onTapImage}
        className="relative w-full touch-none select-none overflow-hidden rounded-md bg-deep"
        style={{ aspectRatio: String(aspect) }}
      >
        <video
          ref={videoRef}
          src={src}
          muted
          playsInline
          preload="auto"
          onLoadedMetadata={(e) => {
            const v = e.currentTarget;
            if (v.videoWidth && v.videoHeight) setAspect(v.videoWidth / v.videoHeight);
            v.currentTime = start + (end - start) * t;
          }}
          className="absolute inset-0 h-full w-full object-cover"
        />
        {zoom > 1 && (
          <div
            role="slider"
            aria-label="Zone analysée, à déplacer"
            aria-valuenow={Math.round(value.x * 100)}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuetext={`Zoom ×${zoom}`}
            tabIndex={0}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={() => setTimeout(() => (drag.current = null), 0)}
            onPointerCancel={() => (drag.current = null)}
            onClick={(e) => e.stopPropagation()}
            onKeyDown={(e) => {
              const step = 0.03;
              const dx = e.key === "ArrowRight" ? step : e.key === "ArrowLeft" ? -step : 0;
              const dy = e.key === "ArrowDown" ? step : e.key === "ArrowUp" ? -step : 0;
              if (!dx && !dy) return;
              e.preventDefault();
              onChange({ ...value, x: clamp(value.x + dx, 0, 1 - value.w), y: clamp(value.y + dy, 0, 1 - value.h) });
            }}
            className="absolute cursor-grab rounded-md border-2 border-white shadow-[0_0_0_9999px_rgba(8,22,38,0.6)] active:cursor-grabbing"
            style={{ left: `${value.x * 100}%`, top: `${value.y * 100}%`, width: `${value.w * 100}%`, height: `${value.h * 100}%` }}
          >
            <span className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[0.7rem] font-bold text-deep">Zone analysée</span>
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Zoom">
        {ZOOMS.map((z) => (
          <button
            key={z}
            type="button"
            disabled={disabled}
            aria-pressed={zoom === z}
            onClick={() => setZoom(z)}
            className={`min-h-10 rounded-full px-4 text-sm font-semibold transition-colors ${zoom === z ? "bg-brand text-white" : "bg-raised text-deep"}`}
          >
            {z === 1 ? "Image entière" : `×${z}`}
          </button>
        ))}
      </div>

      {zoom > 1 && (
        <label className="block text-sm text-slate">
          Vérifie que tu restes dans le cadre du début à la fin du passage :
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={t}
            disabled={disabled}
            onChange={(e) => setT(Number(e.target.value))}
            className="mt-2 w-full accent-[var(--brand)]"
          />
          <span className="flex justify-between text-xs">
            <span>Début</span>
            <span>Fin</span>
          </span>
        </label>
      )}
    </div>
  );
}
