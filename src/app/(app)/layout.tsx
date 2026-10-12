import { AppNav } from "@/components/app-nav";
import { Logo } from "@/components/logo";
import { requireSession, effectivePlan } from "@/lib/auth";
import { PLANS } from "@/lib/plans";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireSession();
  const plan = effectivePlan(profile);

  return (
    <div className="min-h-dvh">
      <header className="border-b border-line bg-spray">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-4 py-3 sm:px-6">
          <Logo href="/dashboard" />
          <div className="order-3 w-full sm:order-2 sm:w-auto">
            <AppNav isAdmin={profile.is_admin} />
          </div>
          <div className="order-2 flex items-center gap-3 sm:order-3">
            <span className="rounded-full bg-salt px-3 py-1 text-sm">
              {plan === "free" ? "Essai gratuit" : PLANS[plan].name}
            </span>
            <form action="/auth/deconnexion" method="post">
              <button className="text-sm text-slate hover:text-deep">Se déconnecter</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">{children}</main>
    </div>
  );
}
