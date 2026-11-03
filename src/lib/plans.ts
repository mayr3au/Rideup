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
      "2 vidéos analysées par un coach diplômé d'État chaque mois",
      "Erreurs techniques et corrections, phase par phase",
      "Exercices et priorité pour ta prochaine session",
      "Historique et suivi des analyses",
      "Tous les cours, figure par figure",
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
      "6 vidéos analysées par un coach diplômé d'État chaque mois",
      "Retour du coach sous 24 h, tes vidéos passent en priorité",
      "Ton coach compare avec tes tentatives précédentes",
      "Détection de l'évolution de tes erreurs",
      "Programme de progression personnalisé",
      "Suivi des figures maîtrisées et à travailler",
      "Alerte quand les conditions (vent ou houle) sont bonnes sur tes spots favoris",
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
  progress: { plan: "progress", monthly_analyses: 2, monthly_coach_messages: 300 },
  elite: { plan: "elite", monthly_analyses: 6, monthly_coach_messages: 600 },
};

/** Passage envoyé au coach : assez long pour l'approche, la figure et la réception. */
export const MAX_SEGMENT_SECONDS = 30;

/** Délai de retour annoncé au rider (heures) : Elite passe devant dans la file. */
export const REVIEW_DELAY_HOURS = { free: 72, progress: 72, elite: 24 } as const;

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
