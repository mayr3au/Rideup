import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { coachesSport, requireCoach } from "@/lib/coaching";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeResult } from "@/lib/analysis-result";
import { errorLabel, errorsFor, LEVEL_LABELS, phaseLabel, SPORTS, trickById, tricksFor } from "@/lib/sports";
import { disciplineFor, gearFor, levelFor } from "@/lib/rider";
import type { Profile, VideoAnalysis } from "@/lib/types";
import { ReviewForm } from "@/components/review-form";
import { claimAnalysis, submitReview, unclaimAnalysis } from "../actions";

export const metadata: Metadata = { title: "Analyse coach" };
export const dynamic = "force-dynamic";

export default async function CoachAnalysis({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { profile } = await requireCoach();
  const db = createAdminClient();

  const { data: a } = await db.from("video_analyses").select("*").eq("id", id).maybeSingle<VideoAnalysis>();
  if (!a || !coachesSport(profile, a.sport) || a.status === "envoi" || a.status === "erreur") notFound();

  const [{ data: rider }, { data: previous }, signed] = await Promise.all([
    db.from("profiles").select("*").eq("id", a.user_id).single<Profile>(),
    db
      .from("video_analyses")
      .select("id, trick, created_at, result")
      .eq("user_id", a.user_id)
      .eq("sport", a.sport)
      .eq("status", "termine")
      .neq("id", a.id)
      .order("created_at", { ascending: false })
      .limit(5)
      .returns<Pick<VideoAnalysis, "id" | "trick" | "created_at" | "result">[]>(),
    a.video_path ? db.storage.from("clips").createSignedUrl(a.video_path, 3 * 3600) : Promise.resolve({ data: null }),
  ]);

  const mine = a.status === "en-cours" && (a.coach_id === profile.id || profile.is_admin);
  const takenByOther = a.status === "en-cours" && !mine;
  const trick = a.trick ? trickById(a.trick) : undefined;
  const start = Number(a.seg_start);
  const end = Number(a.seg_end);
  const level = rider ? levelFor(rider, a.sport) : null;
  const done = a.status === "termine" && a.result ? normalizeResult(a.result) : null;

  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/espace-coach" className="inline-flex min-h-10 items-center text-sm font-semibold text-lagoon">
        ← Espace coach
      </Link>

      <div className="mt-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-slate">
            {SPORTS[a.sport].name}
            {a.priority && " · Elite (retour sous 24 h)"}
            {a.submitted_at && ` · envoyée le ${new Date(a.submitted_at).toLocaleString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}`}
          </p>
          <h1 className="text-3xl font-extrabold sm:text-4xl">{done?.figure ?? trick?.name ?? "Figure libre"}</h1>
        </div>
        {mine && (
          <form action={unclaimAnalysis}>
            <input type="hidden" name="id" value={a.id} />
            <button className="btn btn-ghost !min-h-10 !px-4 !py-2 !text-sm">Rendre à la file</button>
          </form>
        )}
      </div>

      <div className="mt-6 grid gap-8 lg:grid-cols-[1fr_1.15fr]">
        <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          {signed.data?.signedUrl ? (
            <video src={`${signed.data.signedUrl}#t=${start},${end}`} controls playsInline preload="metadata" className="w-full rounded-lg bg-brand" />
          ) : (
            <div className="rounded-lg bg-raised p-6 text-slate">Vidéo indisponible.</div>
          )}
          <p className="text-sm text-slate">
            Passage choisi par le rider : <span className="font-semibold text-deep">{start.toFixed(1)} s → {end.toFixed(1)} s</span>. Astuce : ralentis la
            lecture avec le menu du lecteur.
          </p>

          <section className="panel p-5">
            <h2 className="font-bold">Ce que le rider demande</h2>
            <p className="mt-2 whitespace-pre-line">« {a.notes} »</p>
          </section>

          {rider && (
            <section className="panel p-5">
              <h2 className="font-bold">{rider.full_name || "Rider"}</h2>
              <dl className="mt-2 grid grid-cols-[7rem_1fr] gap-x-3 gap-y-1 text-[0.95rem]">
                {level && (<><dt className="text-slate">Niveau</dt><dd>{LEVEL_LABELS[level]}</dd></>)}
                {disciplineFor(rider, a.sport) && (<><dt className="text-slate">Discipline</dt><dd>{disciplineFor(rider, a.sport)}</dd></>)}
                {rider.stance && (<><dt className="text-slate">Stance</dt><dd>{rider.stance}</dd></>)}
                {rider.weight_kg && (<><dt className="text-slate">Poids</dt><dd>{rider.weight_kg} kg</dd></>)}
                {gearFor(rider, a.sport) && (<><dt className="text-slate">Matériel</dt><dd>{gearFor(rider, a.sport)}</dd></>)}
                {rider.goals && (<><dt className="text-slate">Objectifs</dt><dd>{rider.goals}</dd></>)}
              </dl>
            </section>
          )}

          {(previous?.length ?? 0) > 0 && (
            <section className="panel p-5">
              <h2 className="font-bold">Ses derniers retours en {SPORTS[a.sport].name.toLowerCase()}</h2>
              <ul className="mt-3 space-y-3">
                {previous!.map((p) => {
                  const r = p.result ? normalizeResult(p.result) : null;
                  if (!r) return null;
                  return (
                    <li key={p.id} className={`text-[0.95rem] ${p.trick && p.trick === a.trick ? "border-l-4 border-brand pl-3" : ""}`}>
                      <p className="font-semibold">
                        {r.figure} · {r.note}/10 <span className="font-normal text-slate">· {new Date(p.created_at).toLocaleDateString("fr-FR")}</span>
                      </p>
                      <p className="text-slate">Priorité : {r.priorite_session}</p>
                      {r.erreurs.length > 0 && <p className="text-sm text-slate">Erreurs : {r.erreurs.map((e) => errorLabel(e.code)).join(", ")}</p>}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </aside>

        <div>
          {a.status === "en-attente" && (
            <div className="panel p-6">
              <p className="text-lg font-bold">Cette vidéo attend un coach.</p>
              <p className="mt-1 text-slate">Prends-la pour rédiger ton retour : elle disparaît de la file des autres coachs.</p>
              <form action={claimAnalysis} className="mt-4">
                <input type="hidden" name="id" value={a.id} />
                <button className="btn btn-primary">Prendre cette vidéo</button>
              </form>
            </div>
          )}

          {takenByOther && <div className="panel p-6 text-slate">Un autre coach analyse cette vidéo.</div>}

          {mine && (
            <ReviewForm
              action={submitReview}
              analysisId={a.id}
              defaultFigure={trick?.name ?? ""}
              defaultFigureId={trick?.id ?? ""}
              tricks={tricksFor(a.sport).map((t) => ({ value: t.id, label: t.name }))}
              errorCodes={[
                ...Object.entries(errorsFor(a.sport)).map(([value, label]) => ({ value, label })),
                { value: "autre", label: errorLabel("autre") },
              ]}
              phases={(["approche", "appel", "vol", "reception"] as const).map((p) => ({ id: p, label: phaseLabel(a.sport, p) }))}
            />
          )}

          {done && (
            <div className="space-y-5">
              <p className="text-5xl font-extrabold">{done.note}<span className="text-2xl text-slate">/10</span></p>
              <p className="text-lg">{done.resume}</p>
              <p className="rounded-lg bg-brand p-4 font-semibold text-white">Priorité : {done.priorite_session}</p>
              {done.erreurs.length > 0 && (
                <ol className="space-y-3">
                  {done.erreurs.map((e, i) => (
                    <li key={i} className="border-l-4 border-kite pl-3">
                      <p className="text-sm text-slate">{errorLabel(e.code)} · {e.gravite}</p>
                      <p className="font-semibold">{e.probleme}</p>
                      <p>{e.correction}</p>
                    </li>
                  ))}
                </ol>
              )}
              {done.drills.length > 0 && <p className="text-slate">Exercices : {done.drills.join(" · ")}</p>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
