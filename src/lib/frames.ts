/** Extraction d'images d'une vidéo dans le navigateur (aucun upload lourd vers l'API). */

export function loadVideo(file: File): Promise<HTMLVideoElement> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = URL.createObjectURL(file);
    video.onloadedmetadata = () => resolve(video);
    video.onerror = () =>
      reject(new Error("Ton navigateur ne sait pas lire ce format. Exporte le clip en MP4 (H.264) et réessaie."));
  });
}

function seek(video: HTMLVideoElement, time: number) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error("Lecture du clip trop lente.")), 8000);
    video.onseeked = () => {
      clearTimeout(timer);
      resolve();
    };
    video.currentTime = time;
  });
}

export async function extractFrames(video: HTMLVideoElement, count = 8, width = 768): Promise<string[]> {
  const duration = video.duration;
  if (!Number.isFinite(duration) || duration <= 0) throw new Error("Durée du clip illisible.");

  const scale = Math.min(1, width / video.videoWidth);
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(video.videoWidth * scale);
  canvas.height = Math.round(video.videoHeight * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas indisponible.");

  const frames: string[] = [];
  for (let i = 0; i < count; i++) {
    // Images réparties sur le clip, sans la toute première ni la toute dernière frame
    const t = (duration * (i + 0.5)) / count;
    await seek(video, t);
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    frames.push(canvas.toDataURL("image/jpeg", 0.72));
  }
  return frames;
}
