import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { errorLabel, phaseLabel, SPORTS, trickById } from "@/lib/sports";
import type { VideoAnalysis } from "@/lib/types";
import { ConfirmButton } from "@/components/confirm-button";
import { deleteAnalysis } from "../actions";
import { setTrickStatus } from "../../coach/actions";

export const metadata: Metadata = { title: "Résultat d'analyse" };

const GRAVITE_STYLE = {
  majeure: "border-danger",
  moyenne: "border-kite",
  mineure: "border-line",
} as const;

export default async function AnalysisDetail({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ deja?: string }>;
}) {
  const { id } = await params;
  const { deja } = await searchParams;
  const { supabase } = await requireSession();

  const { data: a } = await supabase.from("video_analyses").select("*").eq("id", id).single<VideoAnalysis>();
  if (!a) notFound();

  const { data: signed } = a.video_path
    ? await supabase.storage.from("clips").createSignedUrl(a.video_path, 3600)
    : { data: null };

  const trick = a.trick ? trickById(a.trick) : undefined;
  const r = a.result;
  const start = Number(a.seg_start);
  const end = Number(a.seg_end);

  return (
    <div className="mx-auto max-w-4xl">
      <Link href="/historique" className="text-lagoon hover:underline">
        Historique
      </Link>

      {deja && (
        <p role="status" className="mt-4 rounded-md border border-lagoon/40 bg-lagoon/10 p-4">
          Ce passage a déjà été analysé : voici le résultat, sans nouvelle analyse décomptée.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-slate">
            {new Date(a.created_at).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
            {SPORTS[a.sport] && ` · ${SPORTS[a.sport].name}`}
            {a.depth === "approfondie" && " · analyse approfondie"}
          </p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">{r?.figure ?? trick?.name ?? "Analyse"}</h1>
        </div>
        {r && (
          <p className="text-5xl font-extrabold leading-none">
            {r.note}
            <span className="text-2xl text-slate">/10</span>
          </p>
        )}
      </div>

      {a.status === "erreur" && (
        <p role="alert" className="mt-6 rounded-md border border-danger/40 bg-danger/5 p-4">
          Cette analyse a échoué et n&apos;a pas été décomptée. Relance-la depuis la page Analyse.
        </p>
      )}

      {(a.status === "en-attente" || a.status === "en-cours") && (
        <p role="status" className="mt-6 rounded-md border border-line bg-spray p-4">
          Analyse en cours. Recharge la page dans un instant. Si elle reste bloquée plus de 10 minutes, elle sera
          annulée et ne sera pas décomptée.
        </p>
      )}

      <div className="mt-6 grid gap-8 md:grid-cols-[1fr_1.25fr]">
        <div className="md:sticky md:top-6 md:self-start">
          {signed?.signedUrl ? (
            <video src={`${signed.signedUrl}#t=${start},${end}`} controls playsInline className="w-full rounded-lg bg-brand" />
          ) : (
            <div className="rounded-lg bg-raised p-6 text-slate">Vidéo indisponible.</div>
          )}
          <p className="mt-2 text-sm text-slate">
            Passage analysé : {start.toFixed(1)} s → {end.toFixed(1)} s
          </p>
          {r && r.visibilite !== "bonne" && (
            <p className="mt-3 rounded-md bg-kite/20 p-3 text-[0.95rem]">
              Visibilité {r.visibilite} : filme plus près et de côté, en gardant tout le rider dans le cadre, pour une analyse plus fine.
            </p>
          )}
        </div>

        {r && (
          <div className="space-y-8">
            <p className="text-lg">{r.resume}</p>

            {r.securite && (
              <div role="alert" className="rounded-md border-2 border-danger bg-danger/5 p-4">
                <p className="font-bold text-danger">Sécurité</p>
                <p className="mt-1">{r.securite}</p>
              </div>
            )}

            <section className="rounded-lg bg-brand p-5 text-white">
              <h2 className="text-sm font-semibold text-white">Priorité pour ta prochaine session</h2>
              <p className="mt-1 text-lg font-semibold">{r.priorite_session}</p>
            </section>

            {r.evolution && (
              <section>
                <h2 className="text-2xl font-bold">Par rapport à tes tentatives précédentes</h2>
                <p className="mt-2">{r.evolution}</p>
              </section>
            )}

            {r.phases?.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold">Phase par phase</h2>
                <dl className="mt-4 space-y-3">
                  {r.phases.map((p) => (
                    <div key={p.phase} className="grid grid-cols-[5.5rem_1fr] gap-3">
                      <dt>
                        <span className="block font-semibold">{phaseLabel(a.sport, p.phase)}</span>
                        <span className="font-display text-lg font-bold">{p.note}/10</span>
                      </dt>
                      <dd className="text-slate">{p.commentaire}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            {r.erreurs.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold">À corriger, dans cet ordre</h2>
                <ol className="mt-4 space-y-4">
                  {r.erreurs.map((e, i) => (
                    <li key={i} className={`border-l-4 pl-4 ${GRAVITE_STYLE[e.gravite] ?? "border-kite"}`}>
                      <p className="text-sm text-slate">
                        {errorLabel(e.code)} · {e.gravite}
                      </p>
                      <p className="font-semibold">{e.probleme}</p>
                      <p className="mt-1">{e.correction}</p>
                    </li>
                  ))}
                </ol>
              </section>
            )}

            {r.points_forts.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold">Ce qui marche déjà</h2>
                <ul className="mt-3 space-y-1.5">
                  {r.points_forts.map((p) => (
                    <li key={p} className="flex gap-2">
                      <span aria-hidden="true" className="text-lagoon">✓</span>
                      {p}
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {r.drills.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold">Exercices</h2>
                <ul className="mt-3 space-y-2">
                  {r.drills.map((d) => (
                    <li key={d} className="flex gap-2">
                      <span aria-hidden="true" className="text-lagoon">•</span>
                      {d}
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}
      </div>

      <div className="mt-12 flex flex-wrap gap-3 border-t border-line pt-6">
        {trick && r && r.note >= 8 && (
          <form action={setTrickStatus}>
            <input type="hidden" name="trick" value={trick.id} />
            <input type="hidden" name="status" value="valide" />
            <button className="btn btn-primary">Marquer « {trick.name} » comme maîtrisée</button>
          </form>
        )}
        {trick && (
          <Link href={`/analyse?figure=${trick.id}`} className="btn btn-ghost">
            Nouvelle tentative
          </Link>
        )}
        <Link href="/coach" className="btn btn-ghost">
          En parler au coach
        </Link>
        <form action={deleteAnalysis} className="sm:ml-auto">
          <input type="hidden" name="id" value={a.id} />
          <ConfirmButton message="Supprimer définitivement cette analyse ?" className="btn text-danger hover:bg-danger/5">
            Supprimer
          </ConfirmButton>
        </form>
      </div>
    </div>
  );
}
