import type { Metadata } from "next";
import Link from "next/link";
import { requireSession, effectivePlan } from "@/lib/auth";
import { PLANS } from "@/lib/plans";
import { ProfileForm } from "@/components/profile-form";

export const metadata: Metadata = { title: "Compte" };

const STATUS_LABEL: Record<string, string> = {
  active: "Actif",
  trialing: "Période d'essai",
  past_due: "Paiement en retard",
  unpaid: "Impayé",
  canceled: "Résilié",
  incomplete: "Paiement incomplet",
};

export default async function AccountPage() {
  const { user, profile } = await requireSession();
  const plan = effectivePlan(profile);

  return (
    <div className="max-w-3xl space-y-14">
      <section>
        <h1 className="text-4xl font-bold sm:text-5xl">Ton compte</h1>
        <p className="mt-2 text-slate">{user.email}</p>

        <div className="panel mt-8 p-6">
          <h2 className="text-2xl font-bold">Abonnement</h2>
          {plan === "free" ? (
            <>
              <p className="mt-2 text-slate">
                Tu es sur l&apos;essai gratuit.
                {profile.subscription_status && profile.subscription_status !== "canceled" &&
                  ` Statut de ton dernier abonnement : ${STATUS_LABEL[profile.subscription_status] ?? profile.subscription_status}.`}
              </p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="/tarifs" className="btn btn-primary">
                  Choisir une formule
                </Link>
                {profile.stripe_customer_id && (
                  <form action="/api/billing-portal" method="post">
                    <button className="btn btn-ghost">Mes factures</button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="mt-2">
                <span className="font-semibold">{PLANS[plan].name}</span>, {PLANS[plan].price} par mois.{" "}
                <span className="text-slate">
                  {STATUS_LABEL[profile.subscription_status ?? ""] ?? ""}
                  {profile.current_period_end &&
                    `, prochaine échéance le ${new Date(profile.current_period_end).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}`}
                </span>
              </p>
              <form action="/api/billing-portal" method="post" className="mt-5">
                <button className="btn btn-ghost">Gérer l&apos;abonnement et les factures</button>
              </form>
              <p className="mt-3 text-sm text-slate">Changement de formule, carte bancaire, résiliation : tout se fait sur la page sécurisée de Stripe.</p>
            </>
          )}
        </div>
      </section>

      <section id="profil" className="scroll-mt-8">
        <h2 className="text-3xl font-bold">Profil rider</h2>
        <div className="mt-6">
          <ProfileForm profile={profile} submitLabel="Enregistrer" />
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold">Supprimer mon compte</h2>
        <p className="mt-2 text-slate">
          Écris-nous depuis {user.email} à l&apos;adresse indiquée dans les mentions légales : ton compte, tes vidéos
          et tes analyses seront effacés sous 30 jours. Pense à résilier ton abonnement avant.
        </p>
      </section>
    </div>
  );
}
