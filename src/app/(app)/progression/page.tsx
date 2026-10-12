import type { Metadata } from "next";
import Link from "next/link";
import { requireSession, effectivePlan } from "@/lib/auth";
import { getProgressData } from "@/lib/progress";
import { SPORTS } from "@/lib/sports";
import { activeSport } from "@/lib/rider";
import type { Program } from "@/lib/types";
import { Sparkline } from "@/components/sparkline";
import { ProgramButton } from "@/components/program-button";

export const metadata: Metadata = { title: "Progression" };

const TREND = {
  "en-baisse": { label: "En baisse", cls: "bg-lagoon/15 text-lagoon-dark" },
  "en-hausse": { label: "En hausse", cls: "bg-danger/10 text-danger" },
  stable: { label: "Persistante", cls: "bg-kite/25" },
  nouvelle: { label: "Nouvelle", cls: "bg-raised" },
} as const;

export default async function ProgressionPage() {
  const { supabase, user, profile } = await requireSession();
  const plan = effectivePlan(profile);
  const elite = plan === "elite";
  const sport = activeSport(profile);
  const data = await getProgressData(supabase, user.id, sport);

  const { data: programRow } = elite
    ? await supabase
        .from("programs")
        .select("content, created_at")
        .eq("content->>sport", sport)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle()
    : { data: null };
  const program = programRow?.content as Program | undefined;

  return (
    <div className="space-y-12">
      <header>
        <h1 className="text-3xl font-bold sm:text-4xl">Progression {SPORTS[sport].name.toLowerCase()}</h1>
        <dl className="mt-6 grid grid-cols-3 gap-3 sm:max-w-xl">
          <Stat label="Maîtrisées" value={`${data.validated.length}/${data.totalTricks}`} />
          <Stat label="Analyses" value={String(data.analysesCount)} />
          <Stat label="Moyenne récente" value={data.average ? data.average.toFixed(1) : "–"} />
        </dl>
      </header>

      {/* Priorités */}
      <section>
        <h2 className="text-2xl font-bold">Pour ta prochaine session</h2>
        {data.priorities.length ? (
          <ol className="mt-4 space-y-3">
            {data.priorities.map((p, i) => (
              <li key={i} className="panel flex gap-4 p-4">
                <span className="font-display text-3xl font-extrabold text-lagoon">{i + 1}</span>
                <div>
                  <p className="font-semibold">{p.title}</p>
                  <p className="mt-1 text-slate">{p.detail}</p>
                </div>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-3 text-slate">
            Analyse une première figure pour obtenir tes priorités.{" "}
            <Link href="/analyse" className="text-lagoon underline">Analyser un clip</Link>
          </p>
        )}
      </section>

      {/* Objectifs */}
      <section className="grid gap-6 md:grid-cols-2">
        <div className="panel p-5">
          <h2 className="text-xl font-bold">Tes objectifs</h2>
          <p className="mt-2 text-slate">{profile.goals || "Aucun objectif renseigné."}</p>
          <Link href="/profil" className="mt-3 inline-block text-lagoon hover:underline">Modifier</Link>
        </div>
        <div className="panel p-5">
          <h2 className="text-xl font-bold">Figures</h2>
          <p className="mt-2">
            <span className="font-semibold">En cours :</span>{" "}
            <span className="text-slate">{data.working.map((t) => t.name).join(", ") || "aucune"}</span>
          </p>
          {data.nextTrick && (
            <p className="mt-1">
              <span className="font-semibold">Prochaine à débloquer :</span> <span className="text-slate">{data.nextTrick.name}</span>
            </p>
          )}
          <Link href="/coach" className="mt-3 inline-block text-lagoon hover:underline">Voir la roadmap</Link>
        </div>
      </section>

      {/* Erreurs récurrentes */}
      <section>
        <h2 className="text-2xl font-bold">Erreurs récurrentes</h2>
        {data.errors.length ? (
          <ul className="mt-4 divide-y divide-line border-y border-line">
            {data.errors.slice(0, elite ? 8 : 4).map((e) => (
              <li key={e.code} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <p className="font-semibold">{e.label}</p>
                  <p className="text-sm text-slate">
                    {e.total} fois sur tes 20 dernières analyses
                    {elite && ` · ${e.recent} sur les 5 dernières`}
                  </p>
                </div>
                {elite && <span className={`rounded-sm px-3 py-1 text-sm font-medium ${TREND[e.trend].cls}`}>{TREND[e.trend].label}</span>}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-3 text-slate">Rien à signaler pour l&apos;instant.</p>
        )}
        {!elite && data.errors.length > 0 && (
          <p className="mt-3 text-[0.95rem] text-slate">
            Avec Elite, vois si chaque erreur est en baisse ou en hausse d&apos;une session à l&apos;autre.{" "}
            <Link href="/tarifs" className="text-lagoon underline">Découvrir Elite</Link>
          </p>
        )}
      </section>

      {/* Comparaison par figure */}
      <section>
        <h2 className="text-2xl font-bold">{elite ? "Comparaison des figures" : "Tes figures analysées"}</h2>
        {data.tricks.length ? (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[480px] text-left">
              <thead className="border-b border-line text-sm text-slate">
                <tr>
                  <th className="py-2 pr-3 font-medium">Figure</th>
                  <th className="py-2 pr-3 font-medium">Tentatives</th>
                  <th className="py-2 pr-3 font-medium">Meilleure</th>
                  <th className="py-2 pr-3 font-medium">Dernière</th>
                  {elite && <th className="py-2 font-medium">Évolution</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {data.tricks.map((t) => (
                  <tr key={t.trickId}>
                    <td className="py-3 pr-3">
                      <Link href={`/historique?figure=${t.trickId}`} className="font-semibold hover:text-lagoon">{t.name}</Link>
                      {t.status === "valide" && <span className="ml-2 text-sm text-lagoon">maîtrisée</span>}
                    </td>
                    <td className="py-3 pr-3">{t.attempts}</td>
                    <td className="py-3 pr-3 font-display font-bold">{t.best}/10</td>
                    <td className="py-3 pr-3">
                      {t.last}/10
                      {elite && t.attempts > 1 && (
                        <span className={`ml-1 text-sm ${t.last >= t.first ? "text-lagoon" : "text-danger"}`}>
                          ({t.last - t.first >= 0 ? "+" : ""}{t.last - t.first})
                        </span>
                      )}
                    </td>
                    {elite && (
                      <td className="py-3">
                        <Sparkline values={t.notes.map((n) => n.note)} />
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="mt-3 text-slate">Tes figures apparaîtront ici après tes premières analyses.</p>
        )}
      </section>

      {/* Programme Elite */}
      <section className="rounded-lg bg-brand p-6 text-white sm:p-8">
        <h2 className="text-2xl font-bold">Programme personnalisé</h2>
        {!elite ? (
          <>
            <p className="mt-2 text-white/75">
              Un plan de 3 à 5 sessions construit à partir de tes erreurs récurrentes et de tes objectifs. Inclus dans Elite.
            </p>
            <Link href="/tarifs" className="btn btn-kite mt-5">Passer à Elite</Link>
          </>
        ) : program ? (
          <div className="mt-3">
            <p className="text-sm text-white/70">
              Créé le {new Date(programRow!.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}
            </p>
            <p className="mt-2 text-xl font-semibold text-white">{program.focus}</p>
            <p className="mt-2 text-white/80">{program.diagnostic}</p>
            <ol className="mt-6 space-y-5">
              {program.sessions.map((s, i) => (
                <li key={i} className="border-l-2 border-kite pl-4">
                  <p className="font-semibold">Session {i + 1} · {s.titre}</p>
                  <p className="text-white/80">{s.objectif}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-white/90">
                    {s.exercices.map((x) => <li key={x}>{x}</li>)}
                  </ul>
                </li>
              ))}
            </ol>
            {program.criteres_reussite.length > 0 && (
              <p className="mt-6 text-white/80">
                <span className="font-semibold text-white">Objectif atteint quand :</span> {program.criteres_reussite.join(" ; ")}
              </p>
            )}
            <div className="mt-6">
              <ProgramButton label="Mettre à jour le programme" />
            </div>
          </div>
        ) : (
          <>
            <p className="mt-2 text-white/75">
              Génère un plan de sessions basé sur tes analyses{data.analysesCount < 2 ? " (plus tu as d'analyses, plus il est précis)" : ""}.
            </p>
            <div className="mt-5">
              <ProgramButton label="Créer mon programme" />
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="panel p-3 sm:p-4">
      <dt className="text-sm text-slate">{label}</dt>
      <dd className="font-display text-2xl font-extrabold sm:text-3xl">{value}</dd>
    </div>
  );
}
