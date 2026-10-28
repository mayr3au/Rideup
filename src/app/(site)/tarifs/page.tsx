import type { Metadata } from "next";
import Link from "next/link";
import { getSession, effectivePlan } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getPlanSettings } from "@/lib/usage";
import { PLANS, type PaidPlan } from "@/lib/plans";
import { Reveal } from "@/components/reveal";

export const metadata: Metadata = {
  title: "Tarifs",
  description: "Progress à 14,99 € (20 analyses vidéo par mois) ou Elite à 29,99 € (60 analyses), sans engagement.",
};

export default async function PricingPage() {
  const session = await getSession();
  const current = effectivePlan(session?.profile);
  const settings = await getPlanSettings(session?.supabase ?? (await createClient()));

  return (
    <div className="mx-auto max-w-5xl px-5 py-14 sm:px-6 sm:py-20">
      <p className="eyebrow">Tarifs</p>
      <h1 className="mt-2 max-w-3xl text-4xl font-extrabold sm:text-6xl">
        Choisis ton rythme de <em className="italic text-brand">progression</em>.
      </h1>
      <p className="mt-4 max-w-2xl text-lg text-slate">
        Sans engagement, résiliable en deux clics. À l&apos;inscription, {settings.free.monthly_analyses} analyse
        {settings.free.monthly_analyses > 1 ? "s" : ""} offerte{settings.free.monthly_analyses > 1 ? "s" : ""} pour essayer.
      </p>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {(Object.keys(PLANS) as PaidPlan[]).map((key) => {
          const plan = PLANS[key];
          const n = settings[key].monthly_analyses;
          const elite = key === "elite";
          return (
            <Reveal key={key} as="section" delay={elite ? 0.12 : 0} className={`panel relative flex flex-col p-6 sm:p-8 ${elite ? "ring-2 ring-brand" : ""}`}>
              {elite && <span className="tag tag-solid absolute right-5 top-5">Le plus complet</span>}
              <h2 className="text-3xl font-bold">{plan.name}</h2>
              <p className="mt-1 text-slate">{plan.tagline}</p>
              <p className="mt-6">
                <span className="font-display text-5xl font-extrabold">{plan.price}</span>
                <span className="text-slate"> par mois</span>
              </p>
              <p className="mt-4 text-lg font-semibold">
                {n} analyses vidéo par mois
                <span className="block text-base font-normal text-slate">Environ {Math.round(n / 4.3)} par semaine</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex gap-2">
                    <span aria-hidden="true" className="text-lagoon">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              {current === key ? (
                <Link href="/compte" className="btn btn-ghost mt-8">Ta formule actuelle</Link>
              ) : session ? (
                <form action="/api/checkout" method="post" className="mt-8">
                  <input type="hidden" name="plan" value={key} />
                  <button className={`btn w-full ${"btn-primary"}`}>
                    {current === "free" ? `Choisir ${plan.name}` : `Passer à ${plan.name}`}
                  </button>
                </form>
              ) : (
                <Link href="/inscription" className={`btn mt-8 ${"btn-primary"}`}>
                  Commencer avec une analyse offerte
                </Link>
              )}
            </Reveal>
          );
        })}
      </div>

      <div className="mt-12 grid gap-4 text-[0.95rem] sm:grid-cols-3">
        <div className="rounded-2xl bg-salt p-5">
          <h2 className="font-semibold">Une analyse, c&apos;est quoi ?</h2>
          <p className="mt-1 text-slate">Un passage de 10 secondes maximum que tu choisis dans ta vidéo, analysé à 6 images par seconde, phase par phase.</p>
        </div>
        <div className="rounded-2xl bg-salt p-5">
          <h2 className="font-semibold">Et si je renvoie le même clip ?</h2>
          <p className="mt-1 text-slate">Le même passage déjà analysé te redonne le résultat, sans décompter d&apos;analyse.</p>
        </div>
        <div className="rounded-2xl bg-salt p-5">
          <h2 className="font-semibold">Si l&apos;analyse échoue ?</h2>
          <p className="mt-1 text-slate">Elle n&apos;est pas décomptée. Tu peux relancer avec le même clip.</p>
        </div>
      </div>
      <p className="mt-8 text-sm text-slate">Paiement sécurisé par Stripe. Prix TTC.</p>
    </div>
  );
}
