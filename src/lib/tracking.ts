/**
 * Suivi du kite, du rider et de la planche, image par image, dans le navigateur.
 * Détecteur : MediaPipe Object Detector (EfficientDet-Lite2, classes COCO « kite », « person »,
 * « surfboard »), licence Apache 2.0. Le modèle (~7 Mo) est chargé une fois puis mis en cache.
 * Le suivi en déduit des mesures fiables même quand le rider est loin : temps en l'air,
 * hauteur, boucle du kite, angle du kite dans la fenêtre.
 */
import type { ObjectDetector } from "@mediapipe/tasks-vision";
import type { Mesures } from "./mesures";

const WASM = "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@1.2.0/wasm";
const MODEL = "https://storage.googleapis.com/mediapipe-models/object_detector/efficientdet_lite2/float16/latest/efficientdet_lite2.tflite";

export type Box = { x: number; y: number; w: number; h: number; score: number }; // fractions de l'image
/** Ligne d'horizon (mer / ciel) : hauteur au centre de l'image (fraction) et pente. null si introuvable. */
export type Horizon = { y: number; slope: number };
export type FrameTrack = { t: number; kite: Box | null; rider: Box | null; board: Box | null; horizon: Horizon | null };

/**
 * Détecte la ligne d'horizon : sur des bandes verticales, la frontière où le ciel (clair) passe à la mer (plus sombre).
 * Sert à mesurer la hauteur du rider par rapport à la mer, indépendamment des mouvements de la caméra.
 */
const HZ_W = 160;
let hzCanvas: HTMLCanvasElement | null = null;
export function detectHorizon(src: HTMLCanvasElement): Horizon | null {
  const h = Math.max(40, Math.round(HZ_W * (src.height / src.width)));
  hzCanvas ??= document.createElement("canvas");
  hzCanvas.width = HZ_W;
  hzCanvas.height = h;
  const ctx = hzCanvas.getContext("2d", { willReadFrequently: true })!;
  ctx.drawImage(src, 0, 0, HZ_W, h);
  const data = ctx.getImageData(0, 0, HZ_W, h).data;
  const lum = (x: number, y: number) => {
    const o = (y * HZ_W + x) * 4;
    return 0.3 * data[o] + 0.59 * data[o + 1] + 0.11 * data[o + 2];
  };
  const bands = 16;
  const bw = HZ_W / bands;
  const win = Math.max(3, Math.round(h * 0.04));
  const pts: { x: number; y: number; s: number }[] = [];
  for (let b = 0; b < bands; b++) {
    const x0 = Math.round(b * bw);
    const x1 = Math.round((b + 1) * bw);
    // Luminance moyenne de chaque ligne sur la bande
    const row: number[] = [];
    for (let y = 0; y < h; y++) {
      let sum = 0;
      for (let x = x0; x < x1; x++) sum += lum(x, y);
      row.push(sum / (x1 - x0));
    }
    let best = { y: -1, s: 0 };
    for (let y = win; y < h - win; y++) {
      let above = 0;
      let below = 0;
      for (let k = 1; k <= win; k++) {
        above += row[y - k];
        below += row[y + k - 1];
      }
      const diff = (above - below) / win; // ciel plus clair que la mer
      if (diff > best.s) best = { y, s: diff };
    }
    if (best.s > 12) pts.push({ x: (x0 + x1) / 2 / HZ_W, y: best.y / h, s: best.s });
  }
  if (pts.length < bands * 0.5) return null;
  const med = median(pts.map((p) => p.y));
  const inl = pts.filter((p) => Math.abs(p.y - med) < 0.06);
  if (inl.length < bands * 0.4) return null;
  // Droite des moindres carrés sur les points cohérents
  const mx = inl.reduce((a, p) => a + p.x, 0) / inl.length;
  const my = inl.reduce((a, p) => a + p.y, 0) / inl.length;
  const num = inl.reduce((a, p) => a + (p.x - mx) * (p.y - my), 0);
  const den = inl.reduce((a, p) => a + (p.x - mx) ** 2, 0) || 1;
  const slope = num / den;
  return { y: my + slope * (0.5 - mx), slope };
}

export const horizonAt = (hz: Horizon, x: number) => hz.y + hz.slope * (x - 0.5);

let detectorPromise: Promise<ObjectDetector> | null = null;

function loadDetector() {
  if (!detectorPromise) {
    detectorPromise = (async () => {
      const { FilesetResolver, ObjectDetector } = await import("@mediapipe/tasks-vision");
      const files = await FilesetResolver.forVisionTasks(WASM);
      const make = (delegate: "GPU" | "CPU") =>
        ObjectDetector.createFromOptions(files, {
          baseOptions: { modelAssetPath: MODEL, delegate },
          runningMode: "IMAGE",
          scoreThreshold: 0.15,
          maxResults: 12,
          categoryAllowlist: ["kite", "person", "surfboard"],
        });
      return make("GPU").catch(() => make("CPU"));
    })();
    detectorPromise.catch(() => (detectorPromise = null));
  }
  return detectorPromise;
}

const withTimeout = <T,>(p: Promise<T>, ms: number) =>
  Promise.race([p, new Promise<never>((_, reject) => setTimeout(() => reject(new Error("timeout")), ms))]);

const center = (b: Box) => ({ x: b.x + b.w / 2, y: b.y + b.h / 2 });
const dist = (a: Box, b: Box) => Math.hypot(center(a).x - center(b).x, center(a).y - center(b).y);

/** Parmi les candidats, garde le plus probable en privilégiant la continuité avec l'image précédente. */
function pick(cands: Box[], prev: Box | null): Box | null {
  if (!cands.length) return null;
  return cands.reduce((best, c) => {
    const s = (b: Box) => b.score - (prev ? dist(b, prev) * 1.5 : 0);
    return s(c) > s(best) ? c : best;
  });
}

/** Détecte kite, rider et planche sur chaque image (canvas) du passage. */
export async function trackFrames(
  frames: HTMLCanvasElement[],
  times: number[],
  onProgress?: (done: number, total: number) => void,
): Promise<FrameTrack[] | null> {
  let detector: ObjectDetector;
  try {
    detector = await withTimeout(loadDetector(), 20000);
  } catch {
    return null; // pas de suivi (hors ligne, navigateur trop ancien) : l'analyse se fait sans les mesures
  }
  const out: FrameTrack[] = [];
  let prevKite: Box | null = null;
  let prevRider: Box | null = null;
  for (let i = 0; i < frames.length; i++) {
    const c = frames[i];
    const kites: Box[] = [];
    const people: Box[] = [];
    const boards: Box[] = [];
    try {
      const res = detector.detect(c);
      for (const d of res.detections) {
        const bb = d.boundingBox;
        const cat = d.categories[0];
        if (!bb || !cat) continue;
        const box: Box = { x: bb.originX / c.width, y: bb.originY / c.height, w: bb.width / c.width, h: bb.height / c.height, score: cat.score };
        if (cat.categoryName === "kite") kites.push(box);
        else if (cat.categoryName === "person") people.push(box);
        else if (cat.categoryName === "surfboard") boards.push(box);
      }
    } catch {
      /* image illisible : on passe */
    }
    const rider = pick(people, prevRider);
    const kite = pick(kites, prevKite);
    const board = rider ? pick(boards.filter((b) => dist(b, rider) < 0.25), null) : pick(boards, null);
    let horizon: Horizon | null = null;
    try {
      horizon = detectHorizon(c);
    } catch {
      horizon = null;
    }
    out.push({ t: times[i], kite, rider, board, horizon });
    if (kite) prevKite = kite;
    if (rider) prevRider = rider;
    onProgress?.(i + 1, frames.length);
    // Laisse respirer l'interface entre deux détections
    if (i % 6 === 5) await new Promise((r) => setTimeout(r, 0));
  }
  return out;
}

function nearestHorizon(track: FrameTrack[], f: FrameTrack): Horizon | null {
  let best: FrameTrack | null = null;
  for (const g of track) if (g.horizon && (!best || Math.abs(g.t - f.t) < Math.abs(best.t - f.t))) best = g;
  return best?.horizon ?? null;
}

const median = (a: number[]) => {
  if (!a.length) return 0;
  const s = [...a].sort((x, y) => x - y);
  return s[Math.floor(s.length / 2)];
};
const quantile = (a: number[], q: number) => {
  const s = [...a].sort((x, y) => x - y);
  return s[Math.min(s.length - 1, Math.max(0, Math.round((s.length - 1) * q)))];
};

/** Calcule les mesures à partir du suivi. Chaque mesure n'est donnée que si le suivi est assez complet. */
export function computeMesures(track: FrameTrack[], aspect: number): Mesures {
  const n = track.length;
  const withRider = track.filter((f) => f.rider);
  const withKite = track.filter((f) => f.kite);
  const couverture = { kite: withKite.length / n, rider: withRider.length / n };

  /* Saut : le bas du rider (ou de sa planche) s'éloigne de la ligne d'eau */
  let saut: Mesures["saut"] = null;
  if (couverture.rider >= 0.5) {
    // Hauteur du rider au-dessus de l'eau, en « tailles de rider ».
    // Avec l'horizon : (bas du rider − horizon) / taille du rider est constant tant qu'il est sur l'eau,
    // quels que soient le zoom, la distance et les mouvements de caméra ; il diminue quand il décolle.
    const hzOk = track.filter((f) => f.horizon).length >= n * 0.7;
    const sizes = track.map((f) => (f.rider ? f.rider.h : null));
    const smoothSize = (i: number) => {
      const w = sizes.slice(Math.max(0, i - 2), i + 3).filter((x): x is number => x != null);
      return w.length ? median(w) : 0;
    };
    const rel = track.map((f, i) => {
      if (!f.rider) return null;
      const size = smoothSize(i);
      if (!size) return null;
      const raw = Math.max(f.rider.y + f.rider.h, f.board ? f.board.y + f.board.h : 0);
      if (hzOk) {
        const hz = f.horizon ?? nearestHorizon(track, f);
        if (!hz) return null;
        return (raw - horizonAt(hz, f.rider.x + f.rider.w / 2)) / size;
      }
      return raw / size;
    });
    // Images où la caméra bouge brusquement (horizon qui saute, zoom) : aucune mesure de hauteur fiable.
    const unstable = track.map((f, i) => {
      const p = track[i - 1];
      if (!p) return false;
      const hzJump = f.horizon && p.horizon ? Math.abs(f.horizon.y - p.horizon.y) > 0.06 : false;
      const s0 = sizes[i - 1];
      const s1 = sizes[i];
      const zoom = s0 && s1 ? Math.max(s0, s1) / Math.min(s0, s1) > 1.5 : false;
      return hzJump || zoom;
    });
    for (let i = 0; i < n; i++) if (unstable[i] || (i + 1 < n && unstable[i + 1])) rel[i] = null;
    const known = rel.filter((x): x is number => x != null);
    const water = quantile(known, 0.75); // sur l'eau = valeurs les plus grandes (y vers le bas)
    const heights = rel.map((r) => (r == null ? null : water - r));
    // Plus long passage « en l'air » ; un trou de détection de 2 images max est toléré pendant le vol.
    const runs: [number, number][] = [];
    let start = -1;
    let lastUp = -1;
    const close = () => {
      if (start >= 0 && lastUp - start >= 1) runs.push([start, lastUp]);
      start = -1;
    };
    for (let i = 0; i < n; i++) {
      const h = heights[i];
      if (h != null && h > 0.5) {
        if (start < 0) start = i;
        lastUp = i;
      } else if (h != null || (start >= 0 && i - lastUp > 2)) {
        close();
      }
    }
    close();
    const solid = (a: number, b: number) => {
      const span = heights.slice(a, b + 1);
      const seen = span.filter((h) => h != null).length / span.length;
      const calm = !unstable.slice(Math.max(0, a - 2), Math.min(n, b + 3)).some(Boolean);
      return seen >= 0.7 && calm && heights[Math.max(0, a - 1)] != null && heights[Math.min(n - 1, b + 1)] != null;
    };
    const best = runs.filter(([a, b]) => solid(a, b)).sort((x, y) => y[1] - y[0] - (x[1] - x[0]))[0];
    const dt = n > 1 ? track[1].t - track[0].t : 0;
    const hmax = best ? Math.max(...heights.slice(best[0], best[1] + 1).map((h) => h ?? 0)) : 0;
    // Un vrai saut : au moins 0,3 s en l'air, plus de 0,8 taille de hauteur, rider suivi pendant tout le vol
    // et caméra stable autour ; sinon c'est du bruit de détection ou un mouvement de caméra.
    if (best && hmax >= 0.8 && track[best[1]].t - track[best[0]].t + dt >= 0.3) {
      const [a, b] = best;
      saut = {
        tempsEnAir: Math.round((track[b].t - track[a].t + dt) * 10) / 10,
        hauteur: Math.round(hmax * 10) / 10,
        decollage: track[a].t,
        reception: track[b].t,
      };
    }
  }

  /* Boucle du kite : rotation cumulée du vecteur rider → kite */
  let boucle: Mesures["boucle"] = null;
  let kite: Mesures["kite"] = null;
  const both = track.map((f, i) => ({ f, i })).filter(({ f }) => f.kite && f.rider);
  if (couverture.kite >= 0.4 && both.length >= 6) {
    const angle = (f: FrameTrack) => {
      const k = center(f.kite!);
      const r = center(f.rider!);
      return Math.atan2(-(k.y - r.y), (k.x - r.x) * aspect);
    };
    // Une vraie boucle : le kite tourne régulièrement autour du rider, toujours dans le même sens.
    // Les sauts d'angle brusques (kite confondu avec un autre, rider perdu) sont du bruit : on ne les compte pas,
    // et s'il y en a trop, on ne conclut à aucune boucle.
    const MAX_STEP = (70 * Math.PI) / 180;
    let total = 0;
    let absTotal = 0;
    let steps = 0;
    let noisy = 0;
    for (let j = 1; j < both.length; j++) {
      const a = both[j - 1];
      const b = both[j];
      if (b.i - a.i > 2) continue; // trou trop long : on ne devine pas
      steps++;
      const ka = center(a.f.kite!);
      const kb = center(b.f.kite!);
      const kiteJump = Math.hypot(kb.x - ka.x, kb.y - ka.y) > 0.25;
      let d = angle(b.f) - angle(a.f);
      while (d > Math.PI) d -= 2 * Math.PI;
      while (d < -Math.PI) d += 2 * Math.PI;
      if (kiteJump || Math.abs(d) > MAX_STEP) {
        noisy++;
        continue;
      }
      total += d;
      absTotal += Math.abs(d);
    }
    const tours = Math.abs(total) / (2 * Math.PI);
    const regular = absTotal > 0 && Math.abs(total) / absTotal >= 0.75; // même sens de rotation
    const clean = steps >= 6 && noisy / steps <= 0.2;
    if (tours >= 0.9 && regular && clean) boucle = { tours: Math.round(tours * 10) / 10, sens: total < 0 ? "horaire" : "antihoraire" };

    /* Angle apparent du kite au-dessus de l'horizon, vu depuis le rider */
    const elev = (f: FrameTrack) => {
      const k = center(f.kite!);
      const r = center(f.rider!);
      return (Math.atan2(r.y - k.y, Math.abs(k.x - r.x) * aspect) * 180) / Math.PI;
    };
    const at = (t: number | undefined) => {
      if (t == null) return null;
      const near = both.reduce((best, x) => (Math.abs(x.f.t - t) < Math.abs(best.f.t - t) ? x : best));
      return Math.abs(near.f.t - t) < 0.5 ? Math.max(0, elev(near.f)) : null;
    };
    kite = {
      decollage: at(saut?.decollage),
      reception: at(saut?.reception),
      max: Math.round(Math.max(...both.map(({ f }) => elev(f)))),
    };
  }

  return { couverture: { kite: Math.round(couverture.kite * 100) / 100, rider: Math.round(couverture.rider * 100) / 100 }, saut, boucle, kite };
}
