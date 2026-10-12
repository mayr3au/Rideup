export type Plan = "free" | "progress" | "elite";
export type PaidPlan = Exclude<Plan, "free">;

/** Contenu commercial des formules. Les quotas, eux, viennent de la table plan_settings (admin). */
export const PLANS = {
  progress: {
    name: "Progress",
    price: "14,99 €",
    priceEnv: "STRIPE_PRICE_PROGRESS",
    tagline: "Pour progresser chaque semaine.",
    features: [
      "Analyse des sauts et des figures",
      "Identification des erreurs techniques",
      "Conseils personnalisés pour progresser",
      "Historique et suivi des analyses",
      "Coach et roadmap de figures",
      "Accès au Spot Finder",
      "Objectifs de progression",
    ],
  },
  elite: {
    name: "Elite",
    price: "29,99 €",
    priceEnv: "STRIPE_PRICE_ELITE",
    tagline: "Pour les riders qui s'entraînent sérieusement.",
    features: [
      "Tout ce qui est inclus dans Progress",
      "Analyse technique plus approfondie",
      "Comparaison des figures et des sessions",
      "Détection de l'évolution de tes erreurs",
      "Programme de progression personnalisé",
      "Suivi des figures maîtrisées et à travailler",
      "Analyses traitées en priorité",
      "Alerte quand du vent est prévu sur tes spots favoris",
    ],
  },
} as const;

export type PlanSettings = {
  plan: Plan;
  monthly_analyses: number;
  monthly_coach_messages: number;
};

/** Valeurs par défaut si la table plan_settings est vide. */
export const DEFAULT_SETTINGS: Record<Plan, PlanSettings> = {
  free: { plan: "free", monthly_analyses: 1, monthly_coach_messages: 10 },
  progress: { plan: "progress", monthly_analyses: 20, monthly_coach_messages: 300 },
  elite: { plan: "elite", monthly_analyses: 60, monthly_coach_messages: 600 },
};

/** Ce qui change concrètement dans l'analyse selon la formule. */
export const ANALYSIS_DEPTH = {
  free: { depth: "standard", sheets: 2, maxTokens: 1800, compare: false },
  progress: { depth: "standard", sheets: 2, maxTokens: 1800, compare: false },
  elite: { depth: "approfondie", sheets: 4, maxTokens: 3200, compare: true },
} as const;

export const FRAMES_PER_SHEET = 12; // grille 4 × 3
export const MAX_SEGMENT_SECONDS = 20;

export function isActive(status: string | null | undefined) {
  return status === "active" || status === "trialing";
}

export function hasSpotFinder(plan: Plan) {
  return plan !== "free";
}

export function priceIdFor(plan: PaidPlan) {
  const id = process.env[PLANS[plan].priceEnv];
  if (!id) throw new Error(`Variable ${PLANS[plan].priceEnv} manquante`);
  return id;
}

export function planFromPriceId(priceId: string | null | undefined): Plan {
  if (priceId && priceId === process.env.STRIPE_PRICE_ELITE) return "elite";
  if (priceId && priceId === process.env.STRIPE_PRICE_PROGRESS) return "progress";
  return "free";
}

export function formatQuota(n: number) {
  return `${n} analyse${n > 1 ? "s" : ""}`;
}
