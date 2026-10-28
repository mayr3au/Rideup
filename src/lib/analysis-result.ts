import type { AnalysisResult } from "./types";

/** Le modèle renvoie parfois un tableau sous forme de texte JSON : on le relit. */
function asArray<T>(v: unknown): T[] {
  if (Array.isArray(v)) return v as T[];
  if (typeof v === "string") {
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed)) return parsed as T[];
    } catch {
      /* texte libre */
    }
    return v.trim() ? ([v] as T[]) : [];
  }
  return [];
}

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : v == null ? fallback : String(v));

/**
 * Remet un rapport d'analyse dans une forme sûre pour l'affichage :
 * champs manquants, tableaux encodés en texte, note hors bornes.
 */
export function normalizeResult(raw: unknown): AnalysisResult {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const note = Number(r.note);
  const visibilite = r.visibilite === "bonne" || r.visibilite === "partielle" || r.visibilite === "faible" ? r.visibilite : "partielle";
  return {
    ...(r as Partial<AnalysisResult>),
    figure: str(r.figure, "Figure"),
    figure_id: typeof r.figure_id === "string" ? r.figure_id : null,
    note: Number.isFinite(note) ? Math.max(0, Math.min(10, Math.round(note * 10) / 10)) : 0,
    resume: str(r.resume),
    visibilite,
    phases: asArray<AnalysisResult["phases"][number]>(r.phases).filter((p) => p && typeof p === "object"),
    points_forts: asArray<unknown>(r.points_forts).map((p) => str(p)).filter(Boolean),
    erreurs: asArray<Record<string, unknown>>(r.erreurs)
      .filter((e) => e && typeof e === "object")
      .map((e) => ({
        code: str(e.code, "autre"),
        probleme: str(e.probleme),
        correction: str(e.correction),
        gravite: e.gravite === "majeure" || e.gravite === "mineure" ? e.gravite : "moyenne",
      })),
    drills: asArray<unknown>(r.drills).map((d) => str(d)).filter(Boolean),
    rappels: asArray<unknown>(r.rappels).map((d) => str(d)).filter(Boolean),
    observations: asArray<unknown>(r.observations).map((d) => str(d)).filter(Boolean),
    priorite_session: str(r.priorite_session),
    securite: typeof r.securite === "string" && r.securite.trim() ? r.securite : null,
    evolution: typeof r.evolution === "string" && r.evolution.trim() ? r.evolution : null,
  };
}
