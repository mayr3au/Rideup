import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { setPlanOverride } from "../actions";

export const metadata: Metadata = { title: "Admin · Utilisateurs" };

type Row = {
  id: string;
  email: string | null;
  full_name: string | null;
  plan: string;
  plan_override: string | null;
  subscription_status: string | null;
  created_at: string;
  is_admin: boolean;
};

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  await requireAdmin();
  const db = createAdminClient();
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const cols = "id, email, full_name, plan, plan_override, subscription_status, created_at, is_admin";
  const term = (q ?? "").replace(/[%_\\]/g, "").trim().slice(0, 80);
  let users: Row[] = [];
  if (term) {
    // Deux requêtes paramétrées plutôt qu'un filtre .or() construit à la main
    const [byEmail, byName] = await Promise.all([
      db.from("profiles").select(cols).ilike("email", `%${term}%`).limit(100).returns<Row[]>(),
      db.from("profiles").select(cols).ilike("full_name", `%${term}%`).limit(100).returns<Row[]>(),
    ]);
    const seen = new Map<string, Row>();
    for (const u of [...(byEmail.data ?? []), ...(byName.data ?? [])]) seen.set(u.id, u);
    users = [...seen.values()].sort((a, b) => b.created_at.localeCompare(a.created_at));
  } else {
    const { data } = await db.from("profiles").select(cols).order("created_at", { ascending: false }).limit(100).returns<Row[]>();
    users = data ?? [];
  }

  const ids = users.map((u) => u.id);
  const [{ data: usage }, { data: analyses }] = ids.length
    ? await Promise.all([
        db.from("ai_usage").select("user_id, cost_usd").in("user_id", ids).gte("created_at", monthStart.toISOString()),
        db.from("video_analyses").select("user_id").in("user_id", ids).eq("counted", true).neq("status", "erreur").gte("created_at", monthStart.toISOString()),
      ])
    : [{ data: [] }, { data: [] }];

  const cost = new Map<string, number>();
  for (const u of usage ?? []) cost.set(u.user_id, (cost.get(u.user_id) ?? 0) + Number(u.cost_usd));
  const count = new Map<string, number>();
  for (const a of analyses ?? []) count.set(a.user_id, (count.get(a.user_id) ?? 0) + 1);

  return (
    <div>
      <h1 className="text-4xl font-bold">Utilisateurs</h1>
      <form className="mt-6 flex max-w-md gap-2">
        <label htmlFor="q" className="sr-only">Rechercher</label>
        <input id="q" name="q" defaultValue={q} placeholder="E-mail ou prénom" className="field" />
        <button className="btn btn-primary">Rechercher</button>
      </form>

      <div className="mt-6 overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-[0.95rem]">
          <thead className="border-b border-line text-sm text-slate">
            <tr>
              <th className="py-2 pr-3 font-medium">Utilisateur</th>
              <th className="py-2 pr-3 font-medium">Abonnement</th>
              <th className="py-2 pr-3 font-medium">Analyses (mois)</th>
              <th className="py-2 pr-3 font-medium">Coût IA (mois)</th>
              <th className="py-2 pr-3 font-medium">Accès offert</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="py-3 pr-3">
                  <p className="font-semibold">{u.full_name || "—"}{u.is_admin && <span className="ml-2 text-sm text-lagoon">admin</span>}</p>
                  <p className="text-sm text-slate">{u.email} · inscrit le {new Date(u.created_at).toLocaleDateString("fr-FR")}</p>
                </td>
                <td className="py-3 pr-3">
                  {u.plan === "free" ? "Gratuit" : u.plan === "progress" ? "Progress" : "Elite"}
                  {u.subscription_status && <span className="block text-sm text-slate">{u.subscription_status}</span>}
                </td>
                <td className="py-3 pr-3">{count.get(u.id) ?? 0}</td>
                <td className="py-3 pr-3">{(cost.get(u.id) ?? 0).toFixed(2).replace(".", ",")} $</td>
                <td className="py-3 pr-3">
                  <form action={setPlanOverride} className="flex gap-2">
                    <input type="hidden" name="id" value={u.id} />
                    <select name="override" defaultValue={u.plan_override ?? ""} aria-label="Accès offert" className="field !w-auto !py-1.5">
                      <option value="">Aucun</option>
                      <option value="progress">Progress</option>
                      <option value="elite">Elite</option>
                    </select>
                    <button className="btn btn-ghost !px-3 !py-1.5 text-sm">Appliquer</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-slate">
        « Accès offert » donne la formule sans paiement (testeurs, partenaires). Les abonnements payants se gèrent dans
        Stripe.
      </p>
    </div>
  );
}
