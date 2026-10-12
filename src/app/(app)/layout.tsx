import { AppNav } from "@/components/app-nav";
import { Logo } from "@/components/logo";
import { requireSession, effectivePlan } from "@/lib/auth";
import { PLANS } from "@/lib/plans";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireSession();
  const plan = effectivePlan(profile);

  return (
    <div className="min-h-dvh pb-24 lg:pb-0">
      <header className="sticky top-0 z-30 border-b border-line bg-spray/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <Logo href="/dashboard" />
          <AppNav isAdmin={profile.is_admin} />
          <div className="flex items-center gap-3">
            <a href="/compte" className="rounded-full bg-salt px-3 py-1 text-sm">
              {plan === "free" ? "Essai" : PLANS[plan].name}
            </a>
            <form action="/auth/deconnexion" method="post" className="hidden lg:block">
              <button className="text-sm text-slate hover:text-deep">Déconnexion</button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
