export type Plan = "free" | "standard" | "premium";

export const PLANS = {
  standard: {
    name: "Standard",
    price: "9,99 €",
    tagline: "Pour progresser chaque session.",
    priceEnv: "STRIPE_PRICE_STANDARD",
    features: [
      "Analyses vidéo illimitées (clips de 20 s)",
      "Coach personnel et roadmap de figures",
      "Cours en ligne, du water start au freestyle",
      "Historique de toutes tes analyses",
    ],
  },
  premium: {
    name: "Premium",
    price: "15,99 €",
    tagline: "Pour rider plus souvent, et au bon endroit.",
    priceEnv: "STRIPE_PRICE_PREMIUM",
    features: [
      "Tout le plan Standard",
      "Spot Finder selon le vent, ton quiver et ton niveau",
      "Meilleurs spots du week-end",
      "Conseils sécurité et matériel sur mesure",
      "Analyses vidéo traitées en priorité",
    ],
  },
} as const;

export type PaidPlan = keyof typeof PLANS;

/** Essai gratuit : ce qu'un compte sans abonnement peut utiliser. */
export const FREE_LIMITS = {
  analyses: 1,
  coachMessages: 10,
};

/** Garde-fou anti-abus sur les plans payants (par 24 h). */
export const DAILY_FAIR_USE = {
  analyses: 20,
  coachMessages: 150,
};

export function isActive(status: string | null | undefined) {
  return status === "active" || status === "trialing";
}

export function planRank(plan: Plan) {
  return plan === "premium" ? 2 : plan === "standard" ? 1 : 0;
}

export function priceIdFor(plan: PaidPlan) {
  const id = process.env[PLANS[plan].priceEnv];
  if (!id) throw new Error(`Variable ${PLANS[plan].priceEnv} manquante`);
  return id;
}

export function planFromPriceId(priceId: string | null | undefined): Plan {
  if (!priceId) return "free";
  if (priceId === process.env.STRIPE_PRICE_PREMIUM) return "premium";
  if (priceId === process.env.STRIPE_PRICE_STANDARD) return "standard";
  return "free";
}
