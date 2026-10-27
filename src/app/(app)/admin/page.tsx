import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";

export const metadata: Metadata = { title: "Admin" };

const usd = (n: number) => `${n.toFixed(2).replace(".", ",")} $`;
const eur = (n: number) => `${n.toFixed(2).replace(".", ",")} €`;

export default async function AdminOverview() {
  await requireAdmin();
  const db = createAdminClient();
  const since30 = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const since7 = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const head = { count: "exact" as const, head: true };

  const [users, newUsers, subs, usage, analyses30, failed30] = await Promise.all([
    db.from("profiles").select("id", head),
    db.from("profiles").select("id", head).gte("created_at", since7),
    db.from("profiles").select("plan, plan_override, subscription_status"),
    db.from("ai_usage").select("kind, cost_usd, created_at").gte("created_at", since30.toISOString()).limit(50000),
    db.from("video_analyses").select("id", head).eq("status", "termine").gte("created_at", since30.toISOString()),
    db.from("video_analyses").select("id", head).eq("status", "erreur").eq("counted", false).neq("error", "Annulée").gte("created_at", since30.toISOString()),
  ]);

  const paying = (subs.data ?? []).filter((p) => p.plan !== "free" && ["active", "trialing"].includes(p.subscription_status ?? ""));
  const progress = paying.filter((p) => p.plan === "progress").length;
  const elite = paying.filter((p) => p.plan === "elite").length;
  const offered = (subs.data ?? []).filter((p) => p.plan_override).length;
  const mrr = progress * 14.99 + elite * 29.99;

  const rows = usage.data ?? [];
  const total = rows.reduce((s, r) => s + Number(r.cost_usd), 0);
  const byKind = new Map<string, { cost: number; n: number }>();
  for (const r of rows) {
    const k = byKind.get(r.kind) ?? { cost: 0, n: 0 };
    k.cost += Number(r.cost_usd);
    k.n++;
    byKind.set(r.kind, k);
  }
  const byDay = new Map<string, number>();
  for (let i = 29; i >= 0; i--) byDay.set(new Date(Date.now() - i * 86400000).toISOString().slice(0, 10), 0);
  for (const r of rows) {
    const d = r.created_at.slice(0, 10);
    if (byDay.has(d)) byDay.set(d, byDay.get(d)! + Number(r.cost_usd));
  }
  const maxDay = Math.max(0.01, ...byDay.values());
  const analyse = byKind.get("analyse");

  const stats = [
    { label: "Comptes", value: String(users.count ?? 0), sub: `+${newUsers.count ?? 0} sur 7 jours` },
    { label: "Abonnés", value: String(progress + elite), sub: `${progress} Progress · ${elite} Elite${offered ? ` · ${offered} offerts` : ""}` },
    { label: "Revenu mensuel estimé", value: eur(mrr), sub: "TTC, avant frais Stripe" },
    { label: "Dépense IA (30 j)", value: usd(total), sub: mrr ? `${((total / (mrr * 1.08)) * 100).toFixed(1).replace(".", ",")} % du revenu` : undefined },
    { label: "Analyses (30 j)", value: String(analyses30.count ?? 0), sub: `${failed30.count ?? 0} en échec` },
    { label: "Coût moyen d'une analyse", value: analyse?.n ? usd(analyse.cost / analyse.n) : "–" },
  ];

  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-bold">Vue d&apos;ensemble</h1>

      <dl className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {stats.map((s) => (
          <div key={s.label} className="panel p-4">
            <dt className="text-sm text-slate">{s.label}</dt>
            <dd className="mt-1 font-display text-2xl font-extrabold sm:text-3xl">{s.value}</dd>
            {s.sub && <dd className="text-sm text-slate">{s.sub}</dd>}
          </div>
        ))}
      </dl>

      <section>
        <h2 className="text-2xl font-bold">Dépenses IA par jour (30 jours)</h2>
        <div className="mt-4 flex h-40 items-end gap-[3px]" role="img" aria-label="Dépense IA quotidienne">
          {[...byDay.entries()].map(([d, v]) => (
            <div key={d} className="group relative flex-1">
              <div className="w-full rounded-t bg-lagoon" style={{ height: `${Math.max(2, (v / maxDay) * 150)}px` }} />
              <span className="pointer-events-none absolute bottom-full left-1/2 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded bg-brand px-2 py-1 text-xs text-white group-hover:block">
                {d.slice(5)} : {usd(v)}
              </span>
            </div>
          ))}
        </div>
        <table className="mt-6 w-full max-w-lg text-left">
          <thead className="border-b border-line text-sm text-slate">
            <tr>
              <th className="py-2 font-medium">Poste</th>
              <th className="py-2 font-medium">Appels</th>
              <th className="py-2 font-medium">Coût</th>
              <th className="py-2 font-medium">Coût moyen</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {[...byKind.entries()].map(([k, v]) => (
              <tr key={k}>
                <td className="py-2 capitalize">{k}</td>
                <td className="py-2">{v.n}</td>
                <td className="py-2">{usd(v.cost)}</td>
                <td className="py-2">{usd(v.cost / v.n)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="mt-3 text-sm text-slate">
          Coûts calculés à partir des tokens réellement facturés par Anthropic, au tarif de chaque modèle (cache compris).
          Modèles : AI_MODEL_ANALYSE, AI_MODEL_COACH, AI_MODEL_PROGRAMME.
        </p>
      </section>
    </div>
  );
}
