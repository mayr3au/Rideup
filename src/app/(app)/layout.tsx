import { AppNav } from "@/components/app-nav";
import { Logo } from "@/components/logo";
import { SportSwitcher } from "@/components/sport-switcher";
import { requireSession, effectivePlan } from "@/lib/auth";
import { PLANS } from "@/lib/plans";
import { activeSport, riderSports } from "@/lib/rider";
import { DEMO_MODE } from "@/lib/supabase/env";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const { profile } = await requireSession();
  const plan = effectivePlan(profile);

  return (
    <div className="min-h-dvh pb-24 lg:pb-0">
      {DEMO_MODE && (
        <p className="bg-kite px-4 py-1.5 text-center text-sm font-semibold text-deep">
          Mode démo (local) : compte Elite fictif, rien n&apos;est enregistré durablement.
        </p>
      )}
      <div className="sticky top-0 z-30">
        <header className="border-b border-line bg-spray">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-6">
            <Logo href="/dashboard" height={28} />
            <AppNav isAdmin={profile.is_admin} planLabel={plan === "free" ? "Essai" : PLANS[plan].name} />
          </div>
        </header>
        {profile.onboarded && <SportSwitcher sports={riderSports(profile)} active={activeSport(profile)} />}
      </div>
      <main className="mx-auto max-w-6xl px-5 py-6 sm:px-6 sm:py-10">{children}</main>
    </div>
  );
}
