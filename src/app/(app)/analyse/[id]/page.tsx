import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireSession } from "@/lib/auth";
import { trickById } from "@/lib/tricks";
import type { VideoAnalysis } from "@/lib/types";
import { ConfirmButton } from "@/components/confirm-button";
import { deleteAnalysis } from "../actions";
import { setTrickStatus } from "../../coach/actions";

export const metadata: Metadata = { title: "Résultat d'analyse" };

export default async function AnalysisDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { supabase } = await requireSession();

  const { data: a } = await supabase.from("video_analyses").select("*").eq("id", id).single<VideoAnalysis>();
  if (!a) notFound();

  const { data: signed } = a.video_path
    ? await supabase.storage.from("clips").createSignedUrl(a.video_path, 3600)
    : { data: null };

  const trick = a.trick ? trickById(a.trick) : undefined;
  const r = a.result;

  return (
    <div className="max-w-4xl">
      <Link href="/analyse" className="text-lagoon hover:underline">
        Toutes mes analyses
      </Link>

      <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-slate">
            {new Date(a.created_at).toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}
          </p>
          <h1 className="text-5xl font-extrabold">{r?.figure ?? trick?.name ?? "Analyse"}</h1>
        </div>
        {r && (
          <p className="font-display text-6xl font-extrabold">
            {r.note}
            <span className="text-2xl text-slate">/10</span>
          </p>
        )}
      </div>

      {a.status === "erreur" && (
        <p role="alert" className="mt-6 rounded-xl border border-danger/40 bg-danger/5 p-4">
          Cette analyse a échoué et n&apos;a pas été décomptée. Renvoie le clip depuis la page Analyse vidéo.
        </p>
      )}
      {a.status === "en-attente" && (
        <p className="mt-6 rounded-xl border border-line bg-spray p-4">
          Analyse interrompue avant la fin. Si ça dure, renvoie le clip.
        </p>
      )}

      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_1.2fr]">
        <div>
          {signed?.signedUrl ? (
            <video src={signed.signedUrl} controls playsInline className="w-full rounded-2xl bg-deep" />
          ) : (
            <div className="rounded-2xl bg-deep/5 p-6 text-slate">Clip indisponible.</div>
          )}
          {a.notes && (
            <p className="mt-4 text-[0.95rem]">
              <span className="font-semibold">Ce qui coinçait : </span>
              <span className="text-slate">{a.notes}</span>
            </p>
          )}
        </div>

        {r && (
          <div className="space-y-8">
            <p className="text-lg">{r.resume}</p>

            {r.securite && (
              <div role="alert" className="rounded-xl border-2 border-danger bg-danger/5 p-4">
                <p className="font-bold text-danger">Sécurité</p>
                <p className="mt-1">{r.securite}</p>
              </div>
            )}

            {r.erreurs.length > 0 && (
              <section>
                <h2 className="text-2xl font-bold">À corriger, dans cet ordre</h2>
                <ol className="mt-4 space-y-4">
                  {r.erreurs.map((e, i) => (
                    <li key={i} className="border-l-4 border-kite pl-4">
                      <p className="font-semibold">{e.probleme}</p>
                      <p className="mt-1 text-slate">{e.correction}</p>
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
              <section className="rounded-2xl bg-deep p-6 text-salt">
                <h2 className="text-2xl font-bold">Pour ta prochaine session</h2>
                <ul className="mt-3 space-y-2">
                  {r.drills.map((d) => (
                    <li key={d} className="flex gap-2">
                      <span aria-hidden="true" className="text-kite">•</span>
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
            <button className="btn btn-primary">Valider « {trick.name} » dans ma roadmap</button>
          </form>
        )}
        <Link href="/coach" className="btn btn-ghost">
          En parler au coach
        </Link>
        <form action={deleteAnalysis} className="ml-auto">
          <input type="hidden" name="id" value={a.id} />
          <ConfirmButton message="Supprimer définitivement cette analyse et le clip ?" className="btn text-danger hover:bg-danger/5">
            Supprimer l&apos;analyse et le clip
          </ConfirmButton>
        </form>
      </div>
    </div>
  );
}
