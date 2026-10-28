import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { getPlanSettings } from "@/lib/usage";
import { PLANS } from "@/lib/plans";
import { AdminForm } from "@/components/admin-form";
import { savePlanSettings } from "../actions";

export const metadata: Metadata = { title: "Admin · Offres" };

const LABEL = { free: "Essai gratuit", progress: "Progress — 14,99 €", elite: "Elite — 29,99 €" } as const;
const PRICE = { free: 0, progress: 14.99, elite: 29.99 } as const;
const EUR_PER_USD = 0.92;

export default async function AdminOffers() {
  await requireAdmin();
  const db = createAdminClient();
  const settings = await getPlanSettings(db);

  // Coût moyen réel par analyse et par message sur 30 jours, séparé standard / approfondie
  const since = new Date(Date.now() - 30 * 86400000).toISOString();
  const [{ data: analyses }, { data: coach }] = await Promise.all([
    db.from("video_analyses").select("depth, cost_usd").eq("status", "termine").not("cost_usd", "is", null).gte("created_at", since).limit(20000),
    db.from("ai_usage").select("cost_usd").eq("kind", "coach").gte("created_at", since).limit(20000),
  ]);
  const avg = (xs: number[], fallback: number) => (xs.length ? xs.reduce((a, b) => a + b, 0) / xs.length : fallback);
  const costStd = avg((analyses ?? []).filter((a) => a.depth === "standard").map((a) => Number(a.cost_usd)), 0.03);
  const costDeep = avg((analyses ?? []).filter((a) => a.depth === "approfondie").map((a) => Number(a.cost_usd)), 0.055);
  const costMsg = avg((coach ?? []).map((c) => Number(c.cost_usd)), 0.01);
  const measured = (analyses ?? []).length > 0;

  return (
    <div className="max-w-3xl">
      <h1 className="text-4xl font-bold">Offres et quotas</h1>
      <p className="mt-2 text-slate">
        Les prix se règlent dans Stripe. Ici, tu règles ce que chaque formule inclut. Pour l&apos;essai gratuit, les
        quotas sont un total à vie ; pour les formules payantes, ils repartent à chaque période d&apos;abonnement.
      </p>

      <AdminForm action={savePlanSettings} submitLabel="Enregistrer les quotas" className="mt-8">
        <div className="space-y-4">
          {(["free", "progress", "elite"] as const).map((p) => {
            const s = settings[p];
            const unit = p === "elite" ? costDeep : costStd;
            const worst = (s.monthly_analyses * unit + s.monthly_coach_messages * costMsg) * EUR_PER_USD;
            return (
              <fieldset key={p} className="panel p-5">
                <legend className="px-1 font-semibold">{LABEL[p]}</legend>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor={`${p}_analyses`} className="label">Analyses{p === "free" ? " (total)" : " par mois"}</label>
                    <input id={`${p}_analyses`} name={`${p}_analyses`} type="number" min={0} defaultValue={s.monthly_analyses} className="field" />
                  </div>
                  <div>
                    <label htmlFor={`${p}_coach`} className="label">Messages au coach{p === "free" ? " (total)" : " par mois"}</label>
                    <input id={`${p}_coach`} name={`${p}_coach`} type="number" min={0} defaultValue={s.monthly_coach_messages} className="field" />
                  </div>
                </div>
                <p className="mt-3 text-sm text-slate">
                  Coût IA maximal si tout est consommé : <span className="font-semibold text-deep">{worst.toFixed(2).replace(".", ",")} €</span>
                  {p !== "free" && ` pour ${PRICE[p].toFixed(2).replace(".", ",")} € encaissés (${Math.round((worst / (PRICE[p] / 1.2)) * 100)} % du prix HT)`}
                </p>
              </fieldset>
            );
          })}
        </div>
      </AdminForm>

      <section className="mt-10 text-[0.95rem]">
        <h2 className="text-xl font-bold">Base de calcul</h2>
        <ul className="mt-2 space-y-1 text-slate">
          <li>Analyse standard (Progress, essai) : {costStd.toFixed(3).replace(".", ",")} $ en moyenne</li>
          <li>Analyse approfondie (Elite) : {costDeep.toFixed(3).replace(".", ",")} $ en moyenne</li>
          <li>Message au coach : {costMsg.toFixed(4).replace(".", ",")} $ en moyenne</li>
          <li>{measured ? "Moyennes mesurées sur les 30 derniers jours." : "Estimations par défaut : aucune analyse mesurée pour l'instant."}</li>
        </ul>
        <p className="mt-3 text-slate">
          Les textes des formules (avantages affichés sur la page Tarifs) sont dans <code>src/lib/plans.ts</code>.{" "}
          {Object.values(PLANS).map((p) => p.name).join(" et ")} doivent rester alignés avec les prix Stripe.
        </p>
      </section>
    </div>
  );
}
