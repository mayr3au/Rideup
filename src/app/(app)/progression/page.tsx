import type { Metadata } from "next";
import Link from "next/link";
import { requireSession, effectivePlan } from "@/lib/auth";
import { getProgressData } from "@/lib/progress";
import { computeGamification, type PalierState } from "@/lib/gamification";
import { courseForTrick } from "@/lib/courses";
import { LEVEL_LABELS, LEVEL_ORDER, SPORTS } from "@/lib/sports";
import { activeSport, levelFor, riderSports } from "@/lib/rider";
import type { Program, TrickProgress } from "@/lib/types";
import { Sparkline } from "@/components/sparkline";
import { ProgressRing } from "@/components/progress-ring";
import { ProgramButton } from "@/components/program-button";
import { validateBelowDeclaredLevel } from "./actions";

export const metadata: Metadata = { title: "Progression" };
// La génération du programme Elite (action serveur) peut prendre plus d'une minute.
export const maxDuration = 300;

const TREND = {
  "en-baisse": { label: "En baisse", cls: "bg-lagoon/15 text-lagoon-dark" },
  "en-hausse": { label: "En hausse", cls: "bg-danger/10 text-danger" },
  stable: { label: "Revient souvent", cls: "bg-kite/25" },
  nouvelle: { label: "Nouvelle", cls: "bg-raised" },
  unique: { label: "Vue une fois", cls: "bg-raised" },
} as const;

const fmtXp = (n: number) => n.toLocaleString("fr-FR");

export default async function ProgressionPage() {
  const { supabase, user, profile } = await requireSession();
  const plan = effectivePlan(profile);
  const elite = plan === "elite";
  const sport = activeSport(profile);
  const sportName = SPORTS[sport].name.toLowerCase();

  const [data, { data: progressRows }] = await Promise.all([
    getProgressData(supabase, user.id, sport),
    supabase.from("trick_progress").select("*").eq("user_id", user.id).returns<TrickProgress[]>(),
  ]);
  const g = computeGamification({ sport, progress: progressRows ?? [], analyses: data.analysesLite, sportsCount: riderSports(profile).length });

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

  const declared = levelFor(profile, sport);
  const focusTricks = g.actuel.tricks.filter((t) => t.status === "en-cours").map((t) => t.trick);
  const next = data.nextTrick;
  const nextCourse = next ? courseForTrick(next.id) : undefined;
  const obtenus = g.badges.filter((b) => b.obtenu);
  // Profil déclaré plus haut que le palier atteint : proposer de valider les paliers inférieurs d'un coup.
  const declaredIdx = declared ? LEVEL_ORDER.indexOf(declared) : -1;
  const offerCatchUp = declaredIdx > LEVEL_ORDER.indexOf(g.actuel.level) && g.paliers.some((p) => LEVEL_ORDER.indexOf(p.level) < declaredIdx && p.valides < p.total);
  const maxMois = Math.max(1, ...g.mois.map((m) => m.count));

  return (
    <div className="space-y-12">
      {/* ───────── Niveau ───────── */}
      <section className="overflow-hidden rounded-[26px] bg-deep text-white shadow-[var(--shadow-card)]">
        <div className="relative px-5 py-6 sm:px-8 sm:py-8">
          <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-brand/30 blur-3xl" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-20 left-1/3 h-56 w-56 rounded-full bg-lagoon/30 blur-3xl" />
          <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
            <ProgressRing value={g.pctTotal} size={132} stroke={11} label={`Roadmap ${sportName} : ${g.pctTotal} % validée`}>
              <span className="font-display text-3xl leading-none">{g.pctTotal}%</span>
              <span className="mt-1 text-[0.7rem] font-semibold uppercase tracking-wider text-white/70">roadmap</span>
            </ProgressRing>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold uppercase tracking-wider text-white/70">Progression {sportName}</p>
              <h1 className="mt-1 font-display text-3xl leading-tight sm:text-4xl">
                Palier {g.actuel.numero} · {g.actuel.titre}
                <span className="ml-3 align-middle rounded-full bg-white/15 px-3 py-1 text-sm font-semibold tracking-normal">{LEVEL_LABELS[g.actuel.level]}</span>
              </h1>
              <p className="mt-2 text-white/80">{g.actuel.devise}</p>
              <div className="mt-4">
                <div className="flex items-baseline justify-between text-sm">
                  <span className="font-semibold">
                    {g.suivant ? `Vers le palier ${g.suivant.numero} · ${g.suivant.titre}` : "Roadmap complète"}
                  </span>
                  <span className="text-white/80">
                    {g.actuel.valides}/{g.actuel.total} figures
                  </span>
                </div>
                <div className="mt-1.5 h-2.5 overflow-hidden rounded-full bg-white/15" aria-hidden="true">
                  <div className="h-full rounded-full bg-brand transition-[width] duration-700" style={{ width: `${g.pctPalier}%` }} />
                </div>
                <p className="mt-1.5 text-xs text-white/60">
                  Tu changes de palier quand toutes les figures {LEVEL_LABELS[g.actuel.level].toLowerCase()} sont validées dans ta roadmap.
                  {declared && declared !== g.actuel.level && ` Niveau déclaré dans ton profil : ${LEVEL_LABELS[declared].toLowerCase()}.`}
                </p>
              </div>
            </div>
          </div>
          {offerCatchUp && declared && (
            <form action={validateBelowDeclaredLevel} className="relative mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white/10 p-4">
              <p className="text-sm">
                <span className="font-semibold">Ton profil dit « {LEVEL_LABELS[declared]} »</span>
                <span className="text-white/80"> mais ta roadmap part de zéro. Valide d&apos;un coup les figures des paliers précédents.</span>
              </p>
              <button className="btn btn-kite !min-h-10 !px-4 !py-2 !text-sm">Valider les paliers précédents</button>
            </form>
          )}
          <dl className="relative mt-6 grid grid-cols-2 gap-2 sm:grid-cols-5">
            <Kpi label="XP" value={fmtXp(g.xp)} hint="figures + analyses" />
            <Kpi label="Analyses" value={String(data.analysesCount)} />
            <Kpi label="Moyenne" value={g.moyenne != null ? g.moyenne.toFixed(1) : "–"} hint="10 dernières" />
            <Kpi label="Meilleure" value={g.meilleure != null ? `${g.meilleure}/10` : "–"} />
            <Kpi label="Série" value={g.serie >= 2 ? `🔥 ${g.serie}` : "–"} hint="sans baisse" />
          </dl>
        </div>
      </section>

      {/* ───────── Où tu en es ───────── */}
      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold">Où tu en es</h2>
            <p className="mt-1 text-slate">Les 4 paliers de la roadmap {sportName}. Chaque point est une figure.</p>
          </div>
          <Link href="/coach" className="shrink-0 text-sm font-semibold text-lagoon hover:underline">
            Gérer ma roadmap
          </Link>
        </div>
        <ol className="scroll-x relative -mx-5 mt-5 flex gap-3 px-5 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:px-0 lg:grid-cols-4">
          {g.paliers.map((p) => (
            <PalierCard key={p.level} p={p} />
          ))}
        </ol>
      </section>

      {/* ───────── Prochaine étape ───────── */}
      <section className="grid gap-4 md:grid-cols-2">
        {next && (
          <div className="panel p-5 ring-2 ring-brand">
            <p className="text-xs font-bold uppercase tracking-wider text-brand">Prochaine figure à débloquer</p>
            <h2 className="mt-1 text-xl font-bold">{next.name}</h2>
            <p className="mt-1 text-slate">{next.summary}</p>
            <ul className="mt-3 space-y-1 rounded-xl bg-raised p-3 text-[0.92rem]">
              {next.keys.map((k) => (
                <li key={k} className="flex gap-2">
                  <span aria-hidden="true" className="text-brand">•</span>
                  {k}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-wrap gap-2">
              {nextCourse && (
                <Link href={`/cours/${nextCourse.slug}`} className="btn btn-primary !min-h-10 !px-4 !py-2 !text-sm">
                  Lire le cours
                </Link>
              )}
              <Link href={`/analyse?figure=${next.id}`} className="btn btn-ghost !min-h-10 !px-4 !py-2 !text-sm">
                Analyser ma tentative
              </Link>
            </div>
          </div>
        )}
        <div className="panel p-5">
          <p className="text-xs font-bold uppercase tracking-wider text-slate">Ce que tu bosses</p>
          {focusTricks.length ? (
            <ul className="mt-2 space-y-2">
              {focusTricks.map((t) => {
                const stat = data.tricks.find((x) => x.trickId === t.id);
                const course = courseForTrick(t.id);
                return (
                  <li key={t.id} className="flex items-center justify-between gap-3 rounded-xl bg-raised px-3 py-2.5">
                    <div className="min-w-0">
                      <p className="font-semibold">{t.name}</p>
                      <p className="text-sm text-slate">{stat ? `${stat.attempts} analyse${stat.attempts > 1 ? "s" : ""} · meilleure ${stat.best}/10` : "pas encore analysée"}</p>
                    </div>
                    <div className="flex shrink-0 gap-2 text-sm font-semibold text-lagoon">
                      {course && <Link href={`/cours/${course.slug}`}>Cours</Link>}
                      <Link href={`/analyse?figure=${t.id}`}>Analyser</Link>
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-slate">
              Aucune figure marquée « je bosse dessus ». Choisis-en une dans ta{" "}
              <Link href="/coach" className="text-lagoon underline">
                roadmap
              </Link>{" "}
              pour que le coach la garde en tête.
            </p>
          )}
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-slate">Ton objectif</p>
          <p className="mt-1 text-[0.95rem]">{profile.goals || "Aucun objectif renseigné."}</p>
          <Link href="/profil" className="mt-1 inline-block text-sm font-semibold text-lagoon hover:underline">
            Modifier
          </Link>
        </div>
      </section>

      {/* ───────── Priorités ───────── */}
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
            <Link href="/analyse" className="text-lagoon underline">
              Analyser un clip
            </Link>
          </p>
        )}
      </section>

      {/* ───────── Forme et régularité ───────── */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="panel p-5">
          <h2 className="text-xl font-bold">Ta courbe de forme</h2>
          <p className="text-sm text-slate">Notes de tes 10 dernières analyses, toutes figures confondues.</p>
          {g.forme.length >= 2 ? (
            <div className="mt-3">
              <Sparkline values={g.forme} width={320} height={90} />
              <p className="mt-1 text-xs text-slate">La ligne pointillée, c&apos;est 8/10 : la note à partir de laquelle une figure est propre.</p>
            </div>
          ) : (
            <p className="mt-3 text-slate">Encore {2 - g.forme.length} analyse{2 - g.forme.length > 1 ? "s" : ""} et ta courbe apparaît ici.</p>
          )}
        </div>
        <div className="panel p-5">
          <h2 className="text-xl font-bold">Ta régularité</h2>
          <p className="text-sm text-slate">Analyses par mois, 6 derniers mois.</p>
          <div className="mt-4 flex h-24 items-end gap-2" role="img" aria-label={g.mois.map((m) => `${m.label} : ${m.count}`).join(", ")}>
            {g.mois.map((m) => (
              <div key={m.label} className="flex flex-1 flex-col items-center gap-1">
                <span className="text-xs font-semibold text-slate">{m.count || ""}</span>
                <div className="w-full rounded-t-lg bg-brand/80 transition-[height]" style={{ height: `${Math.max(4, (m.count / maxMois) * 64)}px`, opacity: m.count ? 1 : 0.25 }} />
                <span className="text-xs text-slate">{m.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Badges ───────── */}
      <section>
        <div className="flex items-end justify-between gap-4">
          <h2 className="text-2xl font-bold">Badges</h2>
          <p className="text-sm font-semibold text-slate">
            {obtenus.length}/{g.badges.length} obtenus
          </p>
        </div>
        <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {g.badges.map((b) => (
            <li key={b.id} className={`rounded-2xl border p-3.5 ${b.obtenu ? "border-brand/40 bg-brand-light" : "border-line bg-spray"}`}>
              <div className="flex items-start gap-3">
                <span aria-hidden="true" className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xl ${b.obtenu ? "bg-white" : "bg-raised grayscale"}`}>
                  {b.icone}
                </span>
                <div className="min-w-0">
                  <p className={`font-bold leading-tight ${b.obtenu ? "" : "text-slate"}`}>{b.titre}</p>
                  <p className="mt-0.5 text-xs text-slate">{b.texte}</p>
                </div>
              </div>
              {!b.obtenu && (
                <div className="mt-2.5 flex items-center gap-2">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-raised" aria-hidden="true">
                    <div className="h-full rounded-full bg-brand/60" style={{ width: `${Math.round(b.progression * 100)}%` }} />
                  </div>
                  {b.detail && <span className="text-[0.7rem] font-semibold text-slate">{b.detail}</span>}
                </div>
              )}
              {b.obtenu && <p className="mt-2 text-[0.7rem] font-bold uppercase tracking-wider text-brand">Obtenu</p>}
            </li>
          ))}
        </ul>
      </section>

      {/* ───────── Erreurs récurrentes ───────── */}
      <section>
        <h2 className="text-2xl font-bold">Points à corriger</h2>
        {data.errors.length ? (
          <ul className="mt-4 space-y-2">
            {data.errors.slice(0, elite ? 8 : 4).map((e) => {
              const max = data.errors[0]?.total || 1;
              return (
                <li key={e.code} className="panel p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold">{e.label}</p>
                      <p className="text-sm text-slate">
                        {e.total} fois sur tes 20 dernières analyses
                        {elite && ` · ${e.recent} sur les 5 dernières`}
                      </p>
                    </div>
                    {elite && <span className={`rounded-full px-3 py-1 text-sm font-medium ${TREND[e.trend].cls}`}>{TREND[e.trend].label}</span>}
                  </div>
                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-raised" aria-hidden="true">
                    <div className="h-full rounded-full bg-danger/60" style={{ width: `${Math.round((e.total / max) * 100)}%` }} />
                  </div>
                  {e.lastCorrection && <p className="mt-2 text-sm text-slate">→ {e.lastCorrection}</p>}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="mt-3 text-slate">Rien à signaler pour l&apos;instant.</p>
        )}
        {!elite && data.errors.length > 0 && (
          <p className="mt-3 text-[0.95rem] text-slate">
            Avec Elite, vois si chaque erreur est en baisse ou en hausse d&apos;une session à l&apos;autre.{" "}
            <Link href="/tarifs" className="text-lagoon underline">
              Découvrir Elite
            </Link>
          </p>
        )}
      </section>

      {/* ───────── Figures analysées ───────── */}
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
                      <Link href={`/historique?figure=${t.trickId}`} className="font-semibold hover:text-lagoon">
                        {t.name}
                      </Link>
                      {t.status === "valide" && <span className="ml-2 text-sm text-lagoon">maîtrisée</span>}
                    </td>
                    <td className="py-3 pr-3">{t.attempts}</td>
                    <td className="py-3 pr-3 font-display font-bold">{t.best}/10</td>
                    <td className="py-3 pr-3">
                      {t.last}/10
                      {elite && t.attempts > 1 && (
                        <span className={`ml-1 text-sm ${t.last >= t.first ? "text-lagoon" : "text-danger"}`}>
                          ({t.last - t.first >= 0 ? "+" : ""}
                          {t.last - t.first})
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

      {/* ───────── Programme Elite ───────── */}
      <section className="rounded-lg bg-brand p-6 text-white sm:p-8">
        <h2 className="text-2xl font-bold">Programme personnalisé</h2>
        {!elite ? (
          <>
            <p className="mt-2 text-white/75">Un plan de 3 à 5 sessions construit à partir de tes erreurs récurrentes et de tes objectifs. Inclus dans Elite.</p>
            <Link href="/tarifs" className="btn btn-kite mt-5">
              Passer à Elite
            </Link>
          </>
        ) : program ? (
          <div className="mt-3">
            <p className="text-sm text-white/70">Créé le {new Date(programRow!.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "long" })}</p>
            <p className="mt-2 text-xl font-semibold text-white">{program.focus}</p>
            <p className="mt-2 text-white/80">{program.diagnostic}</p>
            <ol className="mt-6 space-y-5">
              {program.sessions.map((s, i) => (
                <li key={i} className="border-l-2 border-kite pl-4">
                  <p className="font-semibold">
                    Session {i + 1} · {s.titre}
                  </p>
                  <p className="text-white/80">{s.objectif}</p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-white/90">
                    {s.exercices.map((x) => (
                      <li key={x}>{x}</li>
                    ))}
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
            <p className="mt-2 text-white/75">Génère un plan de sessions basé sur tes analyses{data.analysesCount < 2 ? " (plus tu as d'analyses, plus il est précis)" : ""}.</p>
            <div className="mt-5">
              <ProgramButton label="Créer mon programme" />
            </div>
          </>
        )}
      </section>
    </div>
  );
}

function Kpi({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="rounded-2xl bg-white/10 px-3 py-2.5">
      <dt className="text-[0.7rem] font-semibold uppercase tracking-wider text-white/70">{label}</dt>
      <dd className="font-display text-xl leading-tight">{value}</dd>
      {hint && <dd className="text-[0.7rem] text-white/50">{hint}</dd>}
    </div>
  );
}

function PalierCard({ p }: { p: PalierState }) {
  const styles = {
    termine: "border-brand/30 bg-brand-light",
    actuel: "border-brand bg-spray ring-2 ring-brand",
    "a-venir": "border-line bg-spray opacity-80",
  }[p.etat];
  return (
    <li className={`min-w-[220px] flex-1 rounded-2xl border p-4 ${styles}`}>
      <Link href="/coach" className="block">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate">Palier {p.numero}</p>
            <p className="text-lg font-bold leading-tight">{p.titre}</p>
            <p className="text-sm text-slate">{LEVEL_LABELS[p.level]}</p>
          </div>
          <ProgressRing value={p.pct} size={56} stroke={6} track="var(--raised)" color={p.etat === "a-venir" ? "var(--slate)" : "var(--brand)"} label={`${p.valides} sur ${p.total} figures`}>
            <span className="text-xs font-bold">
              {p.valides}/{p.total}
            </span>
          </ProgressRing>
        </div>
        <ul className="mt-3 flex flex-wrap gap-1.5" aria-label={`Figures ${LEVEL_LABELS[p.level]}`}>
          {p.tricks.map(({ trick, status }) => (
            <li
              key={trick.id}
              title={trick.name}
              className={`h-3 w-3 rounded-full ${status === "valide" ? "bg-brand" : status === "en-cours" ? "bg-kite/40 ring-2 ring-brand" : "border-2 border-line bg-white"}`}
            >
              <span className="sr-only">
                {trick.name} : {status === "valide" ? "validée" : status === "en-cours" ? "en cours" : "à faire"}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs font-semibold">
          {p.etat === "termine" && <span className="text-brand">✓ Palier terminé</span>}
          {p.etat === "actuel" && <span className="text-brand">● Tu es ici{p.enCours ? ` · ${p.enCours} en cours` : ""}</span>}
          {p.etat === "a-venir" && <span className="text-slate">À débloquer</span>}
        </p>
      </Link>
    </li>
  );
}
