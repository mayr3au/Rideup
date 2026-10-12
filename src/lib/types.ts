import type { Level, SportId } from "./sports";
import type { Plan } from "./plans";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  /** Sport actif (celui affiché par défaut) */
  sport: SportId;
  /** Sports pratiqués */
  sports: SportId[];
  /** Niveau par sport */
  levels: Partial<Record<SportId, Level>>;
  /** Matériel par sport, texte libre */
  gear: Partial<Record<SportId, string>>;
  stance: "regular" | "goofy" | null;
  weight_kg: number | null;
  goals: string | null;
  home_label: string | null;
  home_lat: number | null;
  home_lng: number | null;
  radius_km: number;
  wind_alerts: boolean;
  onboarded: boolean;
  plan: Plan;
  plan_override: Exclude<Plan, "free"> | null;
  subscription_status: string | null;
  current_period_start: string | null;
  current_period_end: string | null;
  stripe_customer_id: string | null;
  is_admin: boolean;
  created_at: string;
};

export type TrickProgress = {
  user_id: string;
  trick_id: string;
  status: "en-cours" | "valide";
  updated_at: string;
};

export type CoachMessage = {
  id: string;
  user_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
};

export type PhaseNote = { phase: "approche" | "appel" | "vol" | "reception"; note: number; commentaire: string };

export type AnalysisResult = {
  sport?: SportId;
  figure: string;
  figure_id: string | null;
  note: number;
  resume: string;
  visibilite: "bonne" | "partielle" | "faible";
  phases: PhaseNote[];
  points_forts: string[];
  erreurs: { code: string; probleme: string; correction: string; gravite: "majeure" | "moyenne" | "mineure" }[];
  drills: string[];
  priorite_session: string;
  securite: string | null;
  evolution?: string | null; // Elite : comparaison avec les tentatives précédentes
};

export type VideoAnalysis = {
  id: string;
  user_id: string;
  sport: SportId;
  trick: string | null;
  notes: string | null;
  video_path: string | null;
  clip_hash: string | null;
  seg_start: number;
  seg_end: number;
  depth: "standard" | "approfondie";
  cache_key: string | null;
  reused_from: string | null;
  counted: boolean;
  status: "en-attente" | "en-cours" | "termine" | "erreur";
  result: AnalysisResult | null;
  error: string | null;
  created_at: string;
};

export type Spot = {
  id: string;
  name: string;
  sports: SportId[];
  country: string;
  region: string | null;
  lat: number;
  lng: number;
  sea_bearing: number;
  water: "flat" | "chop" | "vagues";
  min_level: "debutant" | "intermediaire" | "avance";
  notes: string | null;
  active: boolean;
};

export type ProgramDay = { titre: string; objectif: string; exercices: string[] };
export type Program = {
  focus: string;
  diagnostic: string;
  sessions: ProgramDay[];
  criteres_reussite: string[];
};
