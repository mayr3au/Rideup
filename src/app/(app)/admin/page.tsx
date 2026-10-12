import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Admin" };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const { profile } = await requireSession();
  if (!profile.is_admin) notFound();

  const db = createAdminClient();
  const since = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
  const head = { count: "exact" as const, head: true };

  const [users, newUsers, standard, premium, analyses, analyses7, failed, messages7, latest] = await Promise.all([
    db.from("profiles").select("id", head),
    db.from("profiles").select("id", head).gte("created_at", since),
    db.from("profiles").select("id", head).eq("plan", "standard").in("subscription_status", ["active", "trialing"]),
    db.from("profiles").select("id", head).eq("plan", "premium").in("subscription_status", ["active", "trialing"]),
    db.from("video_analyses").select("id", head).eq("status", "termine"),
    db.from("video_analyses").select("id", head).eq("status", "termine").gte("created_at", since),
    db.from("video_analyses").select("id", head).eq("status", "erreur").gte("created_at", since),
    db.from("coach_messages").select("id", head).eq("role", "user").gte("created_at", since),
    db.from("profiles").select("email, full_name, plan, subscription_status, created_at").order("created_at", { ascending: false }).limit(15),
  ]);

  const mrr = (standard.count ?? 0) * 9.99 + (premium.count ?? 0) * 15.99;

  const stats = [
    { label: "Comptes", value: users.count ?? 0, sub: `+${newUsers.count ?? 0} sur 7 jours` },
    { label: "Abonnés Standard", value: standard.count ?? 0 },
    { label: "Abonnés Premium", value: premium.count ?? 0 },
    { label: "Revenu mensuel estimé", value: `${mrr.toFixed(2).replace(".", ",")} €` },
    { label: "Analyses réussies", value: analyses.count ?? 0, sub: `${analyses7.count ?? 0} sur 7 jours` },
    { label: "Analyses en échec (7 j)", value: failed.count ?? 0 },
    { label: "Messages au coach (7 j)", value: messages7.count ?? 0 },
  ];

  return (
    <div className="space-y-10">
      <h1 className="text-4xl font-bold">Admin</h1>
      <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="panel p-5">
            <dt className="text-sm text-slate">{s.label}</dt>
            <dd className="mt-1 font-display text-3xl font-extrabold">{s.value}</dd>
            {s.sub && <dd className="text-sm text-slate">{s.sub}</dd>}
          </div>
        ))}
      </dl>

      <section>
        <h2 className="text-2xl font-bold">Derniers inscrits</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-[0.95rem]">
            <thead className="border-b border-line text-slate">
              <tr>
                <th className="py-2 pr-4 font-medium">E-mail</th>
                <th className="py-2 pr-4 font-medium">Prénom</th>
                <th className="py-2 pr-4 font-medium">Formule</th>
                <th className="py-2 font-medium">Inscription</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {(latest.data ?? []).map((u) => (
                <tr key={u.email}>
                  <td className="py-2 pr-4">{u.email}</td>
                  <td className="py-2 pr-4">{u.full_name}</td>
                  <td className="py-2 pr-4">{u.plan}{u.subscription_status ? ` (${u.subscription_status})` : ""}</td>
                  <td className="py-2">{new Date(u.created_at).toLocaleDateString("fr-FR")}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
