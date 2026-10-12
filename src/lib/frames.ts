/**
 * Traitement vidéo dans le navigateur :
 * - empreinte du clip (pour ne jamais payer deux fois la même analyse),
 * - extraction d'images sur le passage choisi, assemblées en planches numérotées.
 * Seules les planches (quelques centaines de Ko) partent vers l'IA.
 */

import { FRAMES_PER_SHEET } from "./plans";

export function loadVideo(src: string): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.crossOrigin = "anonymous";
    video.src = src;
    video.onloadeddata = () => resolve(video);
    video.onerror = () =>
      reject(new Error("Ton navigateur ne sait pas lire ce format. Exporte le clip en MP4 (H.264) et réessaie."));
  });
}

/** Empreinte rapide : taille + 4 Mo du début + 4 Mo de la fin. Suffisant pour reconnaître le même fichier. */
export async function clipFingerprint(file: File) {
  const chunk = 4 * 1024 * 1024;
  const head = await file.slice(0, chunk).arrayBuffer();
  const tail = await file.slice(Math.max(0, file.size - chunk)).arrayBuffer();
  const size = new TextEncoder().encode(String(file.size));
  const buf = new Uint8Array(size.byteLength + head.byteLength + tail.byteLength);
  buf.set(size, 0);
  buf.set(new Uint8Array(head), size.byteLength);
  buf.set(new Uint8Array(tail), size.byteLength + head.byteLength);
  const digest = await crypto.subtle.digest("SHA-256", buf);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

function seek(video: HTMLVideoElement, time: number) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Lecture du clip trop lente. Réessaie.")), 10000);
    const done = () => {
      clearTimeout(timer);
      video.removeEventListener("seeked", done);
      resolve();
    };
    video.addEventListener("seeked", done);
    video.currentTime = Math.min(time, Math.max(0, video.duration - 0.05));
  });
}

export function frameTimesFor(start: number, end: number, count: number) {
  const step = (end - start) / count;
  return Array.from({ length: count }, (_, i) => Math.round((start + step * (i + 0.5)) * 100) / 100);
}

/** Construit `sheets` planches de 4 × 3 images numérotées couvrant [start, end]. */
export async function buildContactSheets(
  video: HTMLVideoElement,
  start: number,
  end: number,
  sheets: number,
  onProgress?: (done: number, total: number) => void,
) {
  const total = sheets * FRAMES_PER_SHEET;
  const times = frameTimesFor(start, end, total);

  const aspect = video.videoWidth / video.videoHeight || 16 / 9;
  // Cases plus étroites pour les vidéos verticales, pour garder des planches ≈ 1,5 Mpx
  const cellW = aspect >= 1 ? 384 : 256;
  const cellH = Math.round(cellW / aspect);
  const cols = 4;
  const rows = FRAMES_PER_SHEET / cols;

  const canvas = document.createElement("canvas");
  canvas.width = cellW * cols;
  canvas.height = cellH * rows;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible.");

  const out: string[] = [];
  for (let s = 0; s < sheets; s++) {
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    for (let i = 0; i < FRAMES_PER_SHEET; i++) {
      const idx = s * FRAMES_PER_SHEET + i;
      await seek(video, times[idx]);
      const x = (i % cols) * cellW;
      const y = Math.floor(i / cols) * cellH;
      ctx.drawImage(video, x, y, cellW, cellH);
      // Numéro de l'image et horodatage, pour que l'IA puisse citer un moment précis
      const label = `${idx + 1} · ${times[idx].toFixed(1)}s`;
      ctx.font = "bold 15px system-ui, sans-serif";
      const w = ctx.measureText(label).width + 10;
      ctx.fillStyle = "rgba(0,0,0,0.65)";
      ctx.fillRect(x + 4, y + 4, w, 22);
      ctx.fillStyle = "#ffd23f";
      ctx.fillText(label, x + 9, y + 20);
      ctx.strokeStyle = "#000";
      ctx.strokeRect(x, y, cellW, cellH);
      onProgress?.(idx + 1, total);
    }
    out.push(canvas.toDataURL("image/jpeg", 0.8));
  }
  return { sheets: out, times };
}
