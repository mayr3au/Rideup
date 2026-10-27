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
    video.setAttribute("playsinline", "");
    const timer = setTimeout(
      () => reject(new Error("Lecture du clip impossible. Exporte-le en MP4 (H.264) et réessaie.")),
      15000,
    );
    video.onloadedmetadata = () => {
      clearTimeout(timer);
      resolve(video);
    };
    video.onerror = () => {
      clearTimeout(timer);
      reject(new Error("Ton navigateur ne sait pas lire ce format. Exporte le clip en MP4 (H.264) et réessaie."));
    };
    video.src = src;
    video.load(); // nécessaire sur iOS Safari pour un élément vidéo hors de la page
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

type FrameVideo = HTMLVideoElement & { requestVideoFrameCallback?: (cb: () => void) => number };

/** Se place sur `time` et attend que l'image soit réellement décodée (Safari émet « seeked » trop tôt). */
function seek(video: FrameVideo, time: number) {
  const target = Math.min(time, Math.max(0, video.duration - 0.05));
  return new Promise<void>((resolve, reject) => {
    if (Math.abs(video.currentTime - target) < 0.01 && video.readyState >= 2) {
      resolve();
      return;
    }
    const timer = setTimeout(() => reject(new Error("Lecture du clip trop lente. Réessaie.")), 10000);
    const finish = () => {
      clearTimeout(timer);
      resolve();
    };
    const onSeeked = () => {
      video.removeEventListener("seeked", onSeeked);
      if (video.requestVideoFrameCallback) {
        // Image présentée : sûre à dessiner. Filet de sécurité si aucune image n'arrive.
        const fallback = setTimeout(finish, 300);
        video.requestVideoFrameCallback(() => {
          clearTimeout(fallback);
          finish();
        });
      } else {
        setTimeout(finish, 60);
      }
    };
    video.addEventListener("seeked", onSeeked);
    video.currentTime = target;
  });
}

export function frameTimesFor(start: number, end: number, count: number) {
  const step = (end - start) / count;
  return Array.from({ length: count }, (_, i) => Math.round((start + step * (i + 0.5)) * 100) / 100);
}

type FrameCallbackVideo = HTMLVideoElement & {
  requestVideoFrameCallback?: (cb: (now: number, meta: { mediaTime: number }) => void) => number;
  cancelVideoFrameCallback?: (handle: number) => void;
};

/**
 * Capture rapide : on lit le passage en accéléré et on attrape chaque image au vol.
 * Sur une vidéo de téléphone (HEVC, 4K, 60 i/s), 48 sauts peuvent prendre 30 s ou plus ;
 * une lecture accélérée du même passage prend quelques secondes.
 * Renvoie les index capturés ; ceux qui manquent sont récupérés ensuite par des sauts classiques.
 */
async function captureByPlayback(
  video: FrameCallbackVideo,
  times: number[],
  draw: (idx: number) => void,
  onProgress?: () => void,
): Promise<Set<number>> {
  const done = new Set<number>();
  if (!video.requestVideoFrameCallback || times.length === 0) return done;
  const end = times[times.length - 1];
  const span = end - times[0];

  try {
    await seek(video, Math.max(0, times[0] - 0.05));
    video.muted = true;
    video.playbackRate = span > 8 ? 4 : span > 3 ? 3 : 2;
  } catch {
    return done;
  }

  await new Promise<void>((resolve) => {
    let next = 0;
    let handle = 0;
    const timeout = setTimeout(finish, Math.max(8000, (span / video.playbackRate) * 1000 * 3));
    function finish() {
      clearTimeout(timeout);
      if (handle && video.cancelVideoFrameCallback) video.cancelVideoFrameCallback(handle);
      video.pause();
      video.onended = null;
      resolve();
    }
    const onFrame = (_now: number, meta: { mediaTime: number }) => {
      // On dessine l'image affichée pour toutes les cibles qu'elle a atteintes (à une image près).
      while (next < times.length && meta.mediaTime >= times[next] - 0.02) {
        draw(next);
        done.add(next);
        next++;
        onProgress?.();
      }
      if (next >= times.length || meta.mediaTime > end + 0.3) return finish();
      handle = video.requestVideoFrameCallback!(onFrame);
    };
    video.onended = finish;
    handle = video.requestVideoFrameCallback!(onFrame);
    video.play().catch(finish);
    // Navigateur qui refuse la lecture hors page : on passe tout de suite aux sauts classiques.
    setTimeout(() => {
      if (next === 0) finish();
    }, 1500);
  });

  video.playbackRate = 1;
  return done;
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

  // 1. Capture de chaque image dans une petite vignette (lecture accélérée, puis sauts pour les manquantes)
  const cells = times.map(() => {
    const c = document.createElement("canvas");
    c.width = cellW;
    c.height = cellH;
    return c;
  });
  const drawCell = (idx: number) => cells[idx].getContext("2d")?.drawImage(video, 0, 0, cellW, cellH);
  let captured = 0;
  const tick = () => onProgress?.(++captured, total);

  const fast = await captureByPlayback(video as FrameCallbackVideo, times, drawCell, tick);
  for (let idx = 0; idx < total; idx++) {
    if (fast.has(idx)) continue;
    await seek(video, times[idx]);
    drawCell(idx);
    tick();
  }

  // 2. Assemblage des planches numérotées
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
      const x = (i % cols) * cellW;
      const y = Math.floor(i / cols) * cellH;
      ctx.drawImage(cells[idx], x, y);
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
    }
    out.push(canvas.toDataURL("image/jpeg", 0.8));
  }
  return { sheets: out, times };
}
