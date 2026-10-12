import type { Level } from "./tricks";
import type { Plan } from "./plans";

export type Profile = {
  id: string;
  email: string | null;
  full_name: string | null;
  level: Level | null;
  discipline: string | null;
  stance: "regular" | "goofy" | null;
  home_spot: string | null;
  quiver: string | null;
  goals: string | null;
  onboarded: boolean;
  plan: Plan;
  subscription_status: string | null;
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

export type AnalysisResult = {
  figure: string;
  note: number;
  resume: string;
  points_forts: string[];
  erreurs: { probleme: string; correction: string }[];
  drills: string[];
  securite: string | null;
};

export type VideoAnalysis = {
  id: string;
  user_id: string;
  trick: string | null;
  notes: string | null;
  video_path: string | null;
  status: "en-attente" | "termine" | "erreur";
  result: AnalysisResult | null;
  error: string | null;
  created_at: string;
};
