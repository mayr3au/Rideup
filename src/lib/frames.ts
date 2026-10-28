/**
 * Traitement vidéo dans le navigateur :
 * - empreinte du clip (pour ne jamais payer deux fois la même analyse),
 * - extraction d'images sur le passage choisi, assemblées en planches numérotées.
 * Seules les planches (quelques centaines de Ko) partent vers l'IA.
 */

import { FRAMES_PER_SHEET } from "./plans";
import type { Mesures } from "./mesures";
import type { FrameTrack } from "./tracking";

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

/**
 * Chronophotographie : toutes les positions superposées sur une seule image.
 * Le décor (médiane des images) reste fixe ; tout ce qui bouge (kite, aile, rider, gerbes) est peint
 * par-dessus dans l'ordre du temps. Une boucle de kite devient un cercle, un saut devient une parabole.
 * Utile surtout quand le rider est loin. Renvoie null si la caméra bouge trop (image brouillée).
 */
function buildTrace(cells: HTMLCanvasElement[], w: number, h: number, track: FrameTrack[] | null): string | null {
  const frames = cells.map((c) => c.getContext("2d")!.getImageData(0, 0, w, h).data);
  const n = frames.length;
  const size = w * h;
  const sample = frames.filter((_, i) => i % 2 === 0);
  const bg = new Uint8ClampedArray(size * 4);
  const buf = new Uint8Array(sample.length);
  for (let p = 0; p < size; p++) {
    for (let ch = 0; ch < 3; ch++) {
      for (let k = 0; k < sample.length; k++) buf[k] = sample[k][p * 4 + ch];
      buf.sort();
      bg[p * 4 + ch] = buf[buf.length >> 1];
    }
    bg[p * 4 + 3] = 255;
  }
  const out = new Uint8ClampedArray(bg);
  let moving = 0;
  for (let i = 0; i < n; i++) {
    const f = frames[i];
    for (let p = 0; p < size; p++) {
      const o = p * 4;
      const d = Math.abs(f[o] - bg[o]) + Math.abs(f[o + 1] - bg[o + 1]) + Math.abs(f[o + 2] - bg[o + 2]);
      if (d > 70) {
        out[o] = f[o];
        out[o + 1] = f[o + 1];
        out[o + 2] = f[o + 2];
        moving++;
      }
    }
  }
  // Caméra qui bouge : presque tout « bouge », la synthèse n'apporte rien.
  if (moving / (size * n) > 0.12) return null;
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  const ctx = c.getContext("2d")!;
  ctx.putImageData(new ImageData(out, w, h), 0, 0);
  // Trajectoires suivies : kite en orange, rider en jaune
  if (track) {
    const path = (pick: (f: FrameTrack) => { x: number; y: number; w: number; h: number } | null, color: string) => {
      const pts = track.map(pick).filter(Boolean).map((b) => ({ x: (b!.x + b!.w / 2) * w, y: (b!.y + b!.h / 2) * h }));
      if (pts.length < 3) return;
      ctx.strokeStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      pts.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y)));
      ctx.stroke();
    };
    path((f) => f.kite, "#ff8a00");
    path((f) => f.rider, "#ffd23f");
  }
  // Agrandie ×2 pour que le modèle distingue bien les trajectoires
  const big = document.createElement("canvas");
  big.width = w * 2;
  big.height = h * 2;
  const bctx = big.getContext("2d")!;
  bctx.imageSmoothingQuality = "high";
  bctx.drawImage(c, 0, 0, w * 2, h * 2);
  return big.toDataURL("image/jpeg", 0.85);
}

/** Construit `sheets` planches de 4 × 3 images numérotées couvrant [start, end]. */
export async function buildContactSheets(
  video: HTMLVideoElement,
  start: number,
  end: number,
  sheets: number,
  onProgress?: (done: number, total: number) => void,
  crop: { x: number; y: number; w: number; h: number } = { x: 0, y: 0, w: 1, h: 1 },
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
  // Zone recadrée prise à la résolution d'origine : zoomer donne réellement plus de détails au rider lointain.
  const sx = crop.x * video.videoWidth;
  const sy = crop.y * video.videoHeight;
  const sw = crop.w * video.videoWidth;
  const sh = crop.h * video.videoHeight;
  // Copie plus grande de chaque image pour le détecteur de kite / rider (les petits objets y restent lisibles)
  const detW = Math.round(Math.min(800, sw));
  const detH = Math.round(detW * (sh / sw));
  const det = times.map(() => {
    const c = document.createElement("canvas");
    c.width = detW;
    c.height = detH;
    return c;
  });
  const drawCell = (idx: number) => {
    const ctx = cells[idx].getContext("2d");
    if (!ctx) return;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(video, sx, sy, sw, sh, 0, 0, cellW, cellH);
    det[idx].getContext("2d")?.drawImage(video, sx, sy, sw, sh, 0, 0, detW, detH);
  };
  // Progression : capture = 0-60 %, suivi du kite et du rider = 60-100 %
  let captured = 0;
  const tick = () => onProgress?.(Math.round(++captured * 0.6), total);

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
  // Suivi du kite, du rider et de la planche → mesures (temps en l'air, hauteur, boucle, angle du kite)
  let track: FrameTrack[] | null = null;
  let mesures: Mesures | null = null;
  try {
    const { trackFrames, computeMesures } = await import("./tracking");
    track = await trackFrames(det, times, (d, t) => onProgress?.(Math.round(total * 0.6 + (d / t) * total * 0.4), total));
    if (track) {
      const m = computeMesures(track, sw / sh);
      mesures = m.couverture.kite >= 0.3 || m.couverture.rider >= 0.3 ? m : null;
      if (process.env.NODE_ENV !== "production") console.info("[suivi]", m);
    }
  } catch {
    track = null;
  }
  onProgress?.(total, total);

  let trace: string | null = null;
  try {
    // Recalage vertical sur l'horizon : une caméra qui monte et descend ne brouille plus la synthèse
    let traceCells = cells;
    const hz = track?.map((f) => f.horizon?.y ?? null) ?? [];
    if (track && hz.filter((y) => y != null).length >= track.length * 0.7) {
      const known = hz.filter((y): y is number => y != null).sort((a, b) => a - b);
      const ref = known[Math.floor(known.length / 2)];
      traceCells = cells.map((c, i) => {
        const dy = hz[i] != null ? Math.round((hz[i]! - ref) * cellH) : 0;
        if (!dy) return c;
        const a = document.createElement("canvas");
        a.width = cellW;
        a.height = cellH;
        a.getContext("2d")!.drawImage(c, 0, -dy);
        return a;
      });
    }
    trace = buildTrace(traceCells, cellW, cellH, track);
  } catch {
    trace = null;
  }
  return { sheets: out, times, trace, mesures };
}
