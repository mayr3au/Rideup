import type { Metadata } from "next";
import Link from "next/link";
import { requireSession } from "@/lib/auth";
import { LEVELS, TRICKS } from "@/lib/tricks";
import type { CoachMessage, TrickProgress } from "@/lib/types";
import { redirect } from "next/navigation";
import { courseForTrick } from "@/lib/courses";
import { CoachChat } from "@/components/coach-chat";
import { clearChat, setTrickStatus } from "./actions";

export const metadata: Metadata = { title: "Coach" };

export default async function CoachPage() {
  const { supabase, profile } = await requireSession();

  if (!profile.onboarded) redirect("/profil");

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
  const firstOpen = TRICKS.find((t) => status.get(t.id) !== "valide")?.id;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-4xl font-bold">Ta roadmap</h1>
          <Link href="/profil" className="text-lagoon hover:underline">
            Modifier mon profil
          </Link>
        </div>
        <p className="mt-2 text-slate">
          {[...status.values()].filter((s) => s === "valide").length} figures validées sur {TRICKS.length}. Marque une
          figure en cours pour que le coach la garde en tête.
        </p>

        <div className="mt-8 space-y-8">
          {LEVELS.map((level) => (
            <div key={level.id}>
              <h2 className="text-xl font-bold">{level.label}</h2>
              <ol className="mt-3 space-y-2">
                {TRICKS.filter((t) => t.level === level.id).map((t) => {
                  const s = status.get(t.id);
                  const isNext = t.id === firstOpen;
                  return (
                    <li
                      key={t.id}
                      className={`rounded-md border p-4 ${
                        s === "valide" ? "border-line bg-salt" : isNext ? "border-2 border-kite bg-spray" : "border-line bg-spray"
                      }`}
                    >
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className={`font-semibold ${s === "valide" ? "text-slate line-through decoration-lagoon decoration-2" : ""}`}>
                            {t.name}
                          </p>
                          {s !== "valide" && <p className="text-sm text-slate">{t.summary}</p>}
                        </div>
                        <TrickControls trickId={t.id} status={s} />
                      </div>
                      {(isNext || s === "en-cours") && (
                        <ul className="mt-3 space-y-1 border-t border-line pt-3 text-[0.95rem]">
                          {t.keys.map((k) => (
                            <li key={k} className="flex gap-2">
                              <span aria-hidden="true" className="text-lagoon">•</span>
                              {k}
                            </li>
                          ))}
                          <li className="flex flex-wrap gap-x-4 pt-1">
                            {courseForTrick(t.id) && (
                              <Link href={`/cours/${courseForTrick(t.id)!.slug}`} className="text-lagoon underline">
                                Lire le cours
                              </Link>
                            )}
                            <Link href={`/analyse?figure=${t.id}`} className="text-lagoon underline">
                              Analyser une tentative
                            </Link>
                          </li>
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          ))}
        </div>
      </section>

      <section className="lg:sticky lg:top-6 lg:self-start">
        <CoachChat initial={messages ?? []} clearAction={clearChat} />
      </section>
    </div>
  );
}

function TrickControls({ trickId, status }: { trickId: string; status?: string }) {
  const options =
    status === "valide"
      ? [{ value: "aucun", label: "Annuler" }]
      : status === "en-cours"
        ? [{ value: "valide", label: "Validée" }, { value: "aucun", label: "Retirer" }]
        : [{ value: "en-cours", label: "Je travaille dessus" }, { value: "valide", label: "Validée" }];

  return (
    <div className="flex shrink-0 gap-1.5">
      {status === "en-cours" && <span className="rounded-sm bg-kite/30 px-3 py-1 text-sm font-medium">En cours</span>}
      {options.map((o) => (
        <form key={o.value} action={setTrickStatus}>
          <input type="hidden" name="trick" value={trickId} />
          <input type="hidden" name="status" value={o.value} />
          <button
            className={`rounded-sm px-3 py-1 text-sm font-medium ${
              o.value === "valide" ? "bg-lagoon text-white hover:bg-lagoon-dark" : "border border-line hover:border-deep"
            }`}
          >
            {o.label}
          </button>
        </form>
      ))}
    </div>
  );
}
