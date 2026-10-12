import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { LEVEL_LABELS, LEVEL_ORDER, SPORTS, tricksFor } from "@/lib/sports";
import { activeSport } from "@/lib/rider";
import type { CoachMessage, TrickProgress } from "@/lib/types";
import { courseForTrick } from "@/lib/courses";
import { CoachChat } from "@/components/coach-chat";
import { clearChat, setTrickStatus } from "./actions";

export const metadata: Metadata = { title: "Coach" };

export default async function CoachPage({ searchParams }: { searchParams: Promise<{ vue?: string }> }) {
  const { vue } = await searchParams;
  const { supabase, profile } = await requireSession();
  if (!profile.onboarded) redirect("/profil");

  const sport = activeSport(profile);
  const tricks = tricksFor(sport);
  const chatFirst = vue === "chat";

  const [{ data: progress }, { data: messages }] = await Promise.all([
    supabase.from("trick_progress").select("*").returns<TrickProgress[]>(),
    supabase
      .from("coach_messages")
      .select("role, content")
      .order("created_at", { ascending: true })
      .limit(60)
      .returns<Pick<CoachMessage, "role" | "content">[]>(),
  ]);

  const status = new Map((progress ?? []).map((p) => [p.trick_id, p.status]));
  const done = tricks.filter((t) => status.get(t.id) === "valide").length;
  const firstOpen = tricks.find((t) => status.get(t.id) !== "valide")?.id;

  const tab = (on: boolean) =>
    `flex-1 rounded-xl py-2.5 text-center text-sm font-semibold ${on ? "bg-white text-deep shadow" : "text-slate"}`;

  return (
    <div>
      {/* Onglets sur téléphone */}
      <div className="mx-auto mb-6 flex max-w-md gap-1 rounded-2xl bg-raised p-1 lg:hidden">
        <Link href="/coach" className={tab(!chatFirst)} aria-current={!chatFirst ? "page" : undefined}>Ma roadmap</Link>
        <Link href="/coach?vue=chat" className={tab(chatFirst)} aria-current={chatFirst ? "page" : undefined}>Poser une question</Link>
      </div>

      <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
        <section className={chatFirst ? "hidden lg:block" : ""}>
          <h1 className="text-3xl font-bold">Roadmap {SPORTS[sport].name.toLowerCase()}</h1>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-full bg-raised">
              <div className="h-full rounded-full bg-brand" style={{ width: `${(done / tricks.length) * 100}%` }} />
            </div>
            <p className="text-sm font-semibold">{done}/{tricks.length}</p>
          </div>
          <p className="mt-2 text-sm text-slate">Touche « Je bosse dessus » pour que le coach garde la figure en tête.</p>

          <div className="mt-6 space-y-7">
            {LEVEL_ORDER.map((level) => {
              const list = tricks.filter((t) => t.level === level);
              if (!list.length) return null;
              return (
                <div key={level}>
                  <h2 className="text-lg font-bold">{LEVEL_LABELS[level]}</h2>
                  <ol className="mt-3 space-y-2">
                    {list.map((t) => {
                      const s = status.get(t.id);
                      const isNext = t.id === firstOpen;
                      const course = courseForTrick(t.id);
                      return (
                        <li key={t.id} className={`panel p-4 ${isNext ? "ring-2 ring-brand" : ""} ${s === "valide" ? "opacity-70" : ""}`}>
                          <div className="flex items-start gap-3">
                            <span
                              aria-hidden="true"
                              className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                                s === "valide" ? "bg-brand text-white" : s === "en-cours" ? "bg-brand-light text-brand" : "border-2 border-line"
                              }`}
                            >
                              {s === "valide" ? "✓" : ""}
                            </span>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold">
                                {t.name}
                                {isNext && <span className="ml-2 rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand">Prochaine</span>}
                                {s === "en-cours" && <span className="ml-2 rounded-full bg-brand-light px-2 py-0.5 text-xs font-bold text-brand">En cours</span>}
                              </p>
                              {s !== "valide" && <p className="text-sm text-slate">{t.summary}</p>}
                            </div>
                          </div>

                          {(isNext || s === "en-cours") && (
                            <ul className="mt-3 space-y-1 rounded-xl bg-raised p-3 text-[0.92rem]">
                              {t.keys.map((k) => (
                                <li key={k} className="flex gap-2">
                                  <span aria-hidden="true" className="text-brand">•</span>
                                  {k}
                                </li>
                              ))}
                            </ul>
                          )}

                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <TrickControls trickId={t.id} status={s} />
                            {s !== "valide" && (
                              <Link href={`/analyse?figure=${t.id}`} className="inline-flex min-h-9 items-center px-1 text-sm font-semibold text-lagoon">
                                Analyser
                              </Link>
                            )}
                            {course && s !== "valide" && (
                              <Link href={`/cours/${course.slug}`} className="inline-flex min-h-9 items-center px-1 text-sm font-semibold text-lagoon">
                                Cours
                              </Link>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ol>
                </div>
              );
            })}
          </div>
        </section>

        <section className={`lg:sticky lg:top-32 lg:self-start ${chatFirst ? "" : "hidden lg:block"}`}>
          <CoachChat initial={messages ?? []} clearAction={clearChat} sport={sport} sportName={SPORTS[sport].name} />
        </section>
      </div>
    </div>
  );
}

function TrickControls({ trickId, status }: { trickId: string; status?: string }) {
  const options =
    status === "valide"
      ? [{ value: "aucun", label: "Annuler" }]
      : status === "en-cours"
        ? [{ value: "valide", label: "Je la maîtrise" }, { value: "aucun", label: "Retirer" }]
        : [{ value: "en-cours", label: "Je bosse dessus" }, { value: "valide", label: "Je la maîtrise" }];

  return (
    <>
      {options.map((o) => (
        <form key={o.value} action={setTrickStatus}>
          <input type="hidden" name="trick" value={trickId} />
          <input type="hidden" name="status" value={o.value} />
          <button
            className={`min-h-9 rounded-full px-3.5 text-sm font-semibold ${
              o.value === "valide" ? "bg-brand text-white" : o.value === "en-cours" ? "bg-brand-light text-lagoon" : "bg-raised text-slate"
            }`}
          >
            {o.label}
          </button>
        </form>
      ))}
    </>
  );
}
