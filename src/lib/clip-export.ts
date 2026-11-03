/**
 * Découpe, dans le navigateur, le passage choisi par le rider et le réencode en une vidéo légère.
 *
 * Pourquoi : le stockage refuse les fichiers trop lourds (50 Mo sur l'offre gratuite de Supabase),
 * alors qu'une vidéo de téléphone de 1 minute en pèse souvent 100 à 400. Le coach n'a besoin que du
 * passage de la figure (30 s max) : on le rejoue dans une vidéo cachée, on le dessine dans un canvas
 * et on l'enregistre avec MediaRecorder. Fonctionne sur Chrome, Firefox, Edge et Safari (iOS 14.3+).
 */

/** Au-delà, on découpe avant l'envoi. En dessous, on envoie l'original (meilleure qualité). */
export const DIRECT_UPLOAD_MAX = 45 * 1024 * 1024;

const MAX_SIDE = 1280; // 720p : assez pour analyser une figure image par image
const BITRATE = 5_000_000; // ≈ 19 Mo pour 30 s

function pickMime() {
  if (typeof MediaRecorder === "undefined") return null;
  const candidates = ["video/mp4;codecs=avc1", "video/mp4", "video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
  return candidates.find((m) => MediaRecorder.isTypeSupported(m)) ?? null;
}

export function canExportClip() {
  return typeof document !== "undefined" && !!pickMime() && "captureStream" in HTMLCanvasElement.prototype;
}

export async function exportSegment(
  file: File,
  start: number,
  end: number,
  onProgress?: (ratio: number) => void,
): Promise<{ blob: Blob; extension: "mp4" | "webm"; duration: number }> {
  const mime = pickMime();
  if (!mime || !canExportClip()) throw new Error("Ton navigateur ne sait pas découper la vidéo.");

  const url = URL.createObjectURL(file);
  const video = document.createElement("video");
  video.src = url;
  video.muted = true;
  video.playsInline = true;
  video.preload = "auto";
  video.setAttribute("playsinline", "");

  try {
    await new Promise<void>((resolve, reject) => {
      video.onloadedmetadata = () => resolve();
      video.onerror = () => reject(new Error("Impossible de lire cette vidéo."));
    });

    const scale = Math.min(1, MAX_SIDE / Math.max(video.videoWidth, video.videoHeight));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round((video.videoWidth * scale) / 2) * 2;
    canvas.height = Math.round((video.videoHeight * scale) / 2) * 2;
    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Découpe impossible sur ce navigateur.");

    // Se placer au début du passage
    video.currentTime = start;
    await new Promise<void>((resolve) => (video.onseeked = () => resolve()));
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: BITRATE });
    const chunks: Blob[] = [];
    recorder.ondataavailable = (e) => e.data.size && chunks.push(e.data);
    const stopped = new Promise<void>((resolve) => (recorder.onstop = () => resolve()));

    recorder.start(1000);
    await video.play();

    await new Promise<void>((resolve) => {
      const draw = () => {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        onProgress?.(Math.min(1, (video.currentTime - start) / (end - start)));
        if (video.currentTime >= end || video.ended) return resolve();
        if ("requestVideoFrameCallback" in video) (video as HTMLVideoElement & { requestVideoFrameCallback: (cb: () => void) => void }).requestVideoFrameCallback(draw);
        else requestAnimationFrame(draw);
      };
      draw();
    });

    video.pause();
    recorder.stop();
    stream.getTracks().forEach((t) => t.stop());
    await stopped;

    const type = mime.split(";")[0];
    const blob = new Blob(chunks, { type });
    if (!blob.size) throw new Error("La découpe n'a rien produit.");
    return { blob, extension: type === "video/mp4" ? "mp4" : "webm", duration: Math.max(0.5, Math.min(end, video.duration) - start) };
  } finally {
    video.removeAttribute("src");
    video.load();
    URL.revokeObjectURL(url);
  }
}
