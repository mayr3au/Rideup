import type { Metadata } from "next";
import Link from "next/link";
import { getSession, effectivePlan } from "@/lib/auth";
import { FREE_LIMITS, PLANS, type PaidPlan } from "@/lib/plans";

export const metadata: Metadata = {
  title: "Tarifs",
  description: "Standard à 9,99 € ou Premium à 15,99 € par mois, sans engagement.",
};

export default async function PricingPage() {
  const session = await getSession();
  const current = effectivePlan(session?.profile);

  return (
    <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <h1 className="max-w-3xl text-5xl font-extrabold sm:text-6xl">Choisis comment tu veux progresser</h1>
      <p className="mt-4 max-w-2xl text-lg text-slate">
        Sans engagement, résiliable en deux clics depuis ton espace. Le compte gratuit inclut{" "}
        {FREE_LIMITS.analyses} analyse vidéo et {FREE_LIMITS.coachMessages} messages au coach pour tester.
      </p>

      <div className="mt-12 grid gap-6 md:grid-cols-2">
        {(Object.keys(PLANS) as PaidPlan[]).map((key) => {
          const plan = PLANS[key];
          const isCurrent = current === key;
          return (
            <section
              key={key}
              className={`panel flex flex-col p-8 ${key === "premium" ? "border-2 !border-kite" : ""}`}
            >
              <h2 className="text-3xl font-bold">{plan.name}</h2>
              <p className="mt-1 text-slate">{plan.tagline}</p>
              <p className="mt-6">
                <span className="font-display text-5xl font-extrabold">{plan.price}</span>
                <span className="text-slate"> par mois</span>
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span aria-hidden="true" className="text-lagoon">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <Link href="/compte" className="btn btn-ghost mt-8">
                  Ta formule actuelle
                </Link>
              ) : session ? (
                <form action="/api/checkout" method="post" className="mt-8">
                  <input type="hidden" name="plan" value={key} />
                  <button className={`btn w-full ${key === "premium" ? "btn-kite" : "btn-primary"}`}>
                    {current === "free" ? `Passer au ${plan.name}` : `Changer pour ${plan.name}`}
                  </button>
                </form>
              ) : (
                <Link
                  href="/inscription"
                  className={`btn mt-8 ${key === "premium" ? "btn-kite" : "btn-primary"}`}
                >
                  Créer un compte
                </Link>
              )}
            </section>
          );
        })}
      </div>

      <p className="mt-6 text-sm text-slate">
        Paiement sécurisé par Stripe. Le Spot Finder et les spots du week-end arrivent bientôt pour les abonnés
        Premium.
      </p>
    </div>
  );
}
