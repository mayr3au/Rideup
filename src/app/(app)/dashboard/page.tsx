import type { Metadata } from "next";
import Link from "next/link";
import { requireSession, effectivePlan } from "@/lib/auth";
import { FREE_LIMITS } from "@/lib/plans";
import { TRICKS, LEVELS } from "@/lib/tricks";
import type { TrickProgress, VideoAnalysis } from "@/lib/types";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function Dashboard({ searchParams }: { searchParams: Promise<{ abonnement?: string }> }) {
  const { abonnement } = await searchParams;
  const { supabase, profile } = await requireSession();
  const plan = effectivePlan(profile);

  const [{ data: progress }, { data: analyses, count: analysisCount }] = await Promise.all([
    supabase.from("trick_progress").select("*").returns<TrickProgress[]>(),
    supabase
      .from("video_analyses")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .limit(3)
      .returns<VideoAnalysis[]>(),
  ]);

  const validated = new Set((progress ?? []).filter((p) => p.status === "valide").map((p) => p.trick_id));
  const nextTrick = TRICKS.find((t) => !validated.has(t.id));
  const firstName = profile.full_name?.split(" ")[0];

  return (
    <div className="space-y-10">
      {abonnement === "ok" && (
        <p role="status" className="rounded-xl border border-lagoon/40 bg-lagoon/10 p-4">
          Ton abonnement est actif. L&apos;activation peut prendre quelques secondes : recharge la page si ta formule
          n&apos;apparaît pas encore.
        </p>
      )}

      <div>
        <h1 className="text-4xl font-bold sm:text-5xl">{firstName ? `Salut ${firstName}` : "Salut"}</h1>
        <p className="mt-2 text-slate">
          {profile.level
            ? `Niveau ${LEVELS.find((l) => l.id === profile.level)?.label.toLowerCase()}, ${validated.size} figure${validated.size > 1 ? "s" : ""} validée${validated.size > 1 ? "s" : ""} sur ${TRICKS.length}.`
            : "Commence par configurer ton profil pour que le coach s'adapte à ton niveau."}
        </p>
      </div>

      {!profile.onboarded ? (
        <section className="panel border-2 !border-kite p-6">
          <h2 className="text-2xl font-bold">Configure ton profil rider</h2>
          <p className="mt-2 text-slate">Ton niveau, ton matériel et tes objectifs : deux minutes, et ta roadmap est prête.</p>
          <Link href="/coach" className="btn btn-primary mt-5">
            Configurer mon profil
          </Link>
        </section>
      ) : (
        nextTrick && (
          <section className="panel p-6">
            <p className="text-slate">Prochaine figure de ta roadmap</p>
            <h2 className="mt-1 text-3xl font-bold">{nextTrick.name}</h2>
            <p className="mt-2 max-w-xl text-slate">{nextTrick.summary}</p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link href={`/analyse?figure=${nextTrick.id}`} className="btn btn-primary">
                Analyser un clip
              </Link>
              <Link href="/coach" className="btn btn-ghost">
                Voir ma roadmap
              </Link>
            </div>
          </section>
        )
      )}

      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="text-2xl font-bold">Dernières analyses</h2>
          {(analysisCount ?? 0) > 0 && (
            <Link href="/analyse" className="text-lagoon hover:underline">
              Tout voir ({analysisCount})
            </Link>
          )}
        </div>
        {analyses && analyses.length > 0 ? (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {analyses.map((a) => (
              <li key={a.id}>
                <Link href={`/analyse/${a.id}`} className="flex items-center justify-between gap-4 py-4 hover:text-lagoon">
                  <span>
                    <span className="font-semibold">{a.result?.figure ?? "Analyse"}</span>
                    <span className="ml-2 text-sm text-slate">
                      {new Date(a.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
                    </span>
                  </span>
                  <span className="font-display text-lg font-bold">
                    {a.status === "termine" && a.result ? `${a.result.note}/10` : a.status === "erreur" ? "Échec" : "En cours"}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-line p-6">
            <p>Aucune analyse pour l&apos;instant. Filme 20 secondes de ta prochaine session et envoie le clip.</p>
            <Link href="/analyse" className="btn btn-primary mt-4">
              Envoyer un clip
            </Link>
          </div>
        )}
      </section>

      {plan === "free" && (
        <section className="rounded-2xl bg-deep p-6 text-salt">
          <h2 className="text-2xl font-bold">Tu es sur l&apos;essai gratuit</h2>
          <p className="mt-2 text-salt/75">
            {FREE_LIMITS.analyses} analyse et {FREE_LIMITS.coachMessages} messages au coach inclus. Passe au Standard
            pour des analyses illimitées et un coach sans limite.
          </p>
          <Link href="/tarifs" className="btn btn-kite mt-5">
            Voir les formules
          </Link>
        </section>
      )}
    </div>
  );
}
