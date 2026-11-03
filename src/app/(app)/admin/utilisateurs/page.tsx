import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth";
import { SPORTS, SPORT_IDS } from "@/lib/sports";
import { setCoach, setPlanOverride } from "../actions";

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
  is_coach: boolean;
  coach_sports: string[];
  coach_diploma: string | null;
  coach_bio: string | null;
};

export default async function AdminUsers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  await requireAdmin();
  const db = createAdminClient();
  const monthStart = new Date();
  monthStart.setUTCDate(1);
  monthStart.setUTCHours(0, 0, 0, 0);

  const cols = "id, email, full_name, plan, plan_override, subscription_status, created_at, is_admin, is_coach, coach_sports, coach_diploma, coach_bio";
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
        <table className="w-full min-w-[1100px] text-left text-[0.95rem]">
          <thead className="border-b border-line text-sm text-slate">
            <tr>
              <th className="py-2 pr-3 font-medium">Utilisateur</th>
              <th className="py-2 pr-3 font-medium">Abonnement</th>
              <th className="py-2 pr-3 font-medium">Analyses (mois)</th>
              <th className="py-2 pr-3 font-medium">Coût IA (mois)</th>
              <th className="py-2 pr-3 font-medium">Accès offert</th>
              <th className="py-2 pr-3 font-medium">Coach</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="py-3 pr-3">
                  <p className="font-semibold">{u.full_name || "—"}{u.is_admin && <span className="ml-2 text-sm text-lagoon">admin</span>}{u.is_coach && <span className="ml-2 text-sm text-lagoon">coach</span>}</p>
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
                <td className="py-3 pr-3">
                  <form action={setCoach} className="space-y-1.5">
                    <input type="hidden" name="id" value={u.id} />
                    <label className="flex items-center gap-2 font-semibold">
                      <input type="checkbox" name="is_coach" defaultChecked={u.is_coach} /> Coach
                    </label>
                    <div className="flex flex-wrap gap-x-3 gap-y-1 text-sm">
                      {SPORT_IDS.map((s) => (
                        <label key={s} className="flex items-center gap-1">
                          <input type="checkbox" name="coach_sports" value={s} defaultChecked={u.coach_sports?.includes(s)} /> {SPORTS[s].name}
                        </label>
                      ))}
                    </div>
                    <input name="coach_diploma" defaultValue={u.coach_diploma ?? ""} placeholder="Diplôme (ex. BPJEPS kitesurf)" aria-label="Diplôme du coach" className="field !py-1.5 text-sm" />
                    <textarea name="coach_bio" defaultValue={u.coach_bio ?? ""} rows={2} maxLength={300} placeholder="Présentation courte, vue par les riders" aria-label="Présentation du coach" className="field !py-1.5 text-sm" />
                    <button className="btn btn-ghost !px-3 !py-1.5 text-sm">Enregistrer</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-4 text-sm text-slate">
        « Accès offert » donne la formule sans paiement (testeurs, partenaires). Les abonnements payants se gèrent dans
        Stripe. « Coach » donne accès à l&apos;espace coach pour analyser les vidéos des sports cochés (aucun coché = tous
        les sports). Le diplôme et la présentation s&apos;affichent au rider avec chaque retour.
      </p>
    </div>
  );
}
