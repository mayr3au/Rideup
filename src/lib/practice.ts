import type { PracticeStatus } from "./types";

/** Libellés des statuts de pratique du référentiel Spot Finder. */
export const PRACTICE_LABEL: Record<PracticeStatus, { short: string; label: string; tone: "ok" | "warn" | "off" | "mute" }> = {
  D: { short: "documenté", label: "Pratique documentée", tone: "ok" },
  T: { short: "confirmé", label: "Confirmé sur le terrain par RIDE'UP", tone: "ok" },
  P: { short: "à vérifier", label: "Piste à vérifier : pratique signalée, pas encore confirmée", tone: "warn" },
  W: { short: "wing à vérifier", label: "Wing à vérifier sur ce départ (profondeur, zonage)", tone: "warn" },
  X: { short: "écarté", label: "Pratique écartée sur ce départ", tone: "off" },
  "?": { short: "inconnu", label: "Pas assez d'informations sur cette pratique ici", tone: "mute" },
};
