/** Brouillon de retour coach : ce que l'IA propose à partir du compte rendu brut, avant relecture par le coach. */

export type PhaseId = "approche" | "appel" | "vol" | "reception";

export type ReviewDraft = {
  figure: string;
  figure_id: string;
  note: number | null;
  resume: string;
  priorite_session: string;
  visibilite: "bonne" | "partielle" | "faible";
  phases: { phase: PhaseId; note: number | null; commentaire: string }[];
  erreurs: { code: string; gravite: "majeure" | "moyenne" | "mineure"; probleme: string; correction: string }[];
  points_forts: string[];
  drills: string[];
  rappels: string[];
  securite: string;
  evolution: string;
};

const PHASES: PhaseId[] = ["approche", "appel", "vol", "reception"];
const str = (v: unknown, max = 1500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
const list = (v: unknown, max = 8) => (Array.isArray(v) ? v.map((x) => str(x, 300)).filter(Boolean).slice(0, max) : []);
const num = (v: unknown) => {
  const n = Number(v);
  return v === null || v === "" || !Number.isFinite(n) ? null : Math.max(0, Math.min(10, Math.round(n * 2) / 2));
};

/** Remet d'aplomb ce que renvoie l'IA : types, longueurs, valeurs autorisées. */
export function normalizeDraft(raw: unknown, allowed: { tricks: string[]; codes: string[] }): ReviewDraft {
  const r = (raw && typeof raw === "object" ? raw : {}) as Record<string, unknown>;
  const figureId = str(r.figure_id, 60);
  return {
    figure: str(r.figure, 80),
    figure_id: allowed.tricks.includes(figureId) ? figureId : "",
    note: num(r.note),
    resume: str(r.resume),
    priorite_session: str(r.priorite_session, 400),
    visibilite: r.visibilite === "partielle" || r.visibilite === "faible" ? r.visibilite : "bonne",
    phases: (Array.isArray(r.phases) ? r.phases : [])
      .filter((p): p is Record<string, unknown> => !!p && typeof p === "object" && PHASES.includes(p.phase as PhaseId))
      .map((p) => ({ phase: p.phase as PhaseId, note: num(p.note), commentaire: str(p.commentaire, 600) }))
      .filter((p) => p.commentaire),
    erreurs: (Array.isArray(r.erreurs) ? r.erreurs : [])
      .filter((e): e is Record<string, unknown> => !!e && typeof e === "object")
      .map((e) => ({
        code: allowed.codes.includes(String(e.code)) ? String(e.code) : "autre",
        gravite: (e.gravite === "majeure" || e.gravite === "mineure" ? e.gravite : "moyenne") as ReviewDraft["erreurs"][number]["gravite"],
        probleme: str(e.probleme, 600),
        correction: str(e.correction, 800),
      }))
      .filter((e) => e.probleme && e.correction)
      .slice(0, 6),
    points_forts: list(r.points_forts),
    drills: list(r.drills),
    rappels: list(r.rappels),
    securite: str(r.securite, 600),
    evolution: str(r.evolution, 800),
  };
}
