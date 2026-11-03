import type { Metadata } from "next";
import Link from "next/link";
import { requireSession, effectivePlan } from "@/lib/auth";
import { PLANS } from "@/lib/plans";
import { getQuota } from "@/lib/usage";
import { detailsFor, disciplineFor, riderSports } from "@/lib/rider";
import { assessmentLabel } from "@/lib/rider-details";
import { SPORTS } from "@/lib/sports";

export const metadata: Metadata = { title: "Compte" };

const STATUS_LABEL: Record<string, string> = {
  active: "Actif",
  trialing: "Période d'essai",
  past_due: "Paiement en retard",
  unpaid: "Impayé",
  canceled: "Résilié",
  incomplete: "Paiement incomplet",
};

const fmt = (d: string) => new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "long" });

export default async function AccountPage() {
  const { supabase, user, profile } = await requireSession();
  const plan = effectivePlan(profile);
  const offered = Boolean(profile.plan_override);
  const [analyses, coach] = await Promise.all([
    getQuota(supabase, profile, plan, "analyses"),
    getQuota(supabase, profile, plan, "coachMessages"),
  ]);
  const sports = riderSports(profile);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold sm:text-4xl">Mon compte</h1>
        <p className="mt-1 text-slate">{user.email}</p>
      </div>

      {/* Formule */}
      <section className="panel p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand">Formule</p>
            <h2 className="text-2xl font-bold">{plan === "free" ? "Essai gratuit" : PLANS[plan].name}</h2>
            <p className="mt-1 text-[0.95rem] text-slate">
              {offered
                ? "Accès offert par RIDE'UP, sans paiement."
                : plan === "free"
                  ? "Une analyse offerte pour essayer. Sans carte bancaire."
                  : `${PLANS[plan].price} par mois · ${STATUS_LABEL[profile.subscription_status ?? ""] ?? "Actif"}${
                      profile.current_period_end ? ` · renouvellement le ${fmt(profile.current_period_end)}` : ""
                    }`}
            </p>
          </div>
          {plan !== "elite" && (
            <Link href="/tarifs" className="btn btn-primary">
              {plan === "free" ? "Choisir une formule" : "Passer à Elite"}
            </Link>
          )}
        </div>

        {/* Consommation */}
        <dl className="mt-5 grid gap-3 sm:grid-cols-2">
          <Usage label={plan === "free" ? "Analyse d'essai" : "Analyses"} used={analyses.used} limit={analyses.limit} unit="analyse" period={plan === "free" ? "au total" : "sur la période"} />
          <Usage label="Messages au coach" used={coach.used} limit={coach.limit} unit="message" period={plan === "free" ? "au total" : "sur la période"} />
        </dl>
        {plan !== "free" && (
          <p className="mt-3 text-sm text-slate">
            Le compteur repart {profile.current_period_end && !offered ? `le ${fmt(profile.current_period_end)}` : "au début de chaque mois"}. Une analyse échouée ou déjà faite n&apos;est pas décomptée.
          </p>
        )}

        {!offered && (plan !== "free" || profile.stripe_customer_id) && (
          <form action="/api/billing-portal" method="post" className="mt-5">
            <button className="btn btn-ghost">{plan === "free" ? "Mes factures" : "Gérer l'abonnement et les factures"}</button>
            <p className="mt-2 text-sm text-slate">Changement de formule, carte bancaire, résiliation : sur la page sécurisée de Stripe.</p>
          </form>
        )}
      </section>

      {/* Profil rider */}
      <section className="panel p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand">Profil rider</p>
            <h2 className="text-2xl font-bold">{profile.full_name || "Ton profil"}</h2>
            <p className="mt-1 text-[0.95rem] text-slate">
              {sports.map((s) => SPORTS[s].name).join(", ")}
              {profile.weight_kg ? ` · ${profile.weight_kg} kg` : ""}
              {profile.home_label ? ` · ${profile.home_label}` : ""}
            </p>
          </div>
          <Link href="/profil" className="btn btn-ghost">Modifier</Link>
        </div>
        <dl className="mt-4 grid gap-3 text-[0.95rem] sm:grid-cols-3">
          {sports.map((s) => (
            <div key={s} className="rounded-xl bg-raised p-3">
              <dt className="text-xs text-slate">{SPORTS[s].name}</dt>
              <dd className="font-semibold">
                {profile.levels?.[s] ? { debutant: "Débutant", intermediaire: "Intermédiaire", avance: "Avancé", expert: "Expert" }[profile.levels[s]!] : "Niveau à renseigner"}
                {disciplineFor(profile, s) ? ` · ${disciplineFor(profile, s)}` : ""}
              </dd>
              {assessmentLabel(detailsFor(profile, s).evaluation) && <dd className="text-xs font-semibold text-lagoon">Évalué : {assessmentLabel(detailsFor(profile, s).evaluation)}</dd>}
              {profile.gear?.[s] && <dd className="text-sm text-slate">{profile.gear[s]}</dd>}
            </div>
          ))}
        </dl>
        {plan === "elite" && (
          <p className="mt-4 text-[0.95rem]">
            Alertes e-mail sur tes spots favoris : <span className="font-semibold">{profile.wind_alerts ? "activées" : "désactivées"}</span>
            {" · "}
            <Link href="/profil" className="font-semibold text-lagoon">changer</Link>
          </p>
        )}
      </section>

      {/* Raccourcis */}
      <section className="grid gap-3 sm:grid-cols-3">
        {[
          { href: "/historique", title: "Historique", text: "Toutes tes analyses" },
          { href: "/cours", title: "Cours", text: "Figure par figure" },
          { href: "/week-end", title: "Week-end", text: "Les meilleurs spots" },
        ].map((l) => (
          <Link key={l.href} href={l.href} className="panel p-4 hover:ring-2 hover:ring-brand">
            <p className="font-semibold">{l.title}</p>
            <p className="text-sm text-slate">{l.text}</p>
          </Link>
        ))}
      </section>

      <section className="flex flex-wrap items-center justify-between gap-3 border-t border-line pt-6">
        <form action="/auth/deconnexion" method="post">
          <button className="btn btn-ghost">Se déconnecter</button>
        </form>
        <details className="text-sm text-slate">
          <summary className="cursor-pointer">Supprimer mon compte</summary>
          <p className="mt-2 max-w-md">
            Écris-nous depuis {user.email} à l&apos;adresse indiquée dans les mentions légales : ton compte, tes photos, vidéos et
            analyses seront effacés sous 30 jours. Pense à résilier ton abonnement avant.
          </p>
        </details>
      </section>
    </div>
  );
}

function Usage({ label, used, limit, unit, period }: { label: string; used: number; limit: number; unit: string; period: string }) {
  const pct = limit ? Math.min(100, Math.round((used / limit) * 100)) : 0;
  const left = Math.max(0, limit - used);
  return (
    <div className="rounded-2xl bg-raised p-4">
      <dt className="flex items-baseline justify-between text-sm">
        <span className="font-semibold">{label}</span>
        <span className="text-slate">{used}/{limit} {period}</span>
      </dt>
      <dd className="mt-2">
        <div className="h-2 overflow-hidden rounded-full bg-white" aria-hidden="true">
          <div className={`h-full rounded-full ${pct >= 90 ? "bg-danger" : "bg-brand"}`} style={{ width: `${pct}%` }} />
        </div>
        <p className="mt-1.5 text-sm text-slate">
          {left === 0 ? "Plus aucune disponible" : `${left} ${unit}${left > 1 ? "s" : ""} restante${left > 1 ? "s" : ""}`}
        </p>
      </dd>
    </div>
  );
}
