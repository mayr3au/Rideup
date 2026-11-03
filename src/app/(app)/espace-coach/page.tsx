import type { Metadata } from "next";
import Link from "next/link";
import { coachesSport, requireCoach } from "@/lib/coaching";
import { createAdminClient } from "@/lib/supabase/admin";
import { REVIEW_DELAY_HOURS } from "@/lib/plans";
import { SPORTS, trickById } from "@/lib/sports";
import { LEVEL_LABELS } from "@/lib/sports";
import { levelFor } from "@/lib/rider";
import type { Profile, VideoAnalysis } from "@/lib/types";
import { claimAnalysis } from "./actions";

export const metadata: Metadata = { title: "Espace coach" };
export const dynamic = "force-dynamic";

type Row = Pick<
  VideoAnalysis,
  "id" | "user_id" | "sport" | "trick" | "notes" | "status" | "coach_id" | "priority" | "submitted_at" | "claimed_at" | "reviewed_at" | "seg_start" | "seg_end"
> & { result?: VideoAnalysis["result"] };

function since(iso: string | null | undefined) {
  if (!iso) return "";
  const h = (Date.now() - new Date(iso).getTime()) / 3600_000;
  if (h < 1) return `${Math.max(1, Math.round(h * 60))} min`;
  if (h < 48) return `${Math.round(h)} h`;
  return `${Math.round(h / 24)} j`;
}

/** Heures restantes avant l'échéance annoncée au rider (négatif = en retard). */
function hoursLeft(a: Row) {
  if (!a.submitted_at) return null;
  const delay = a.priority ? REVIEW_DELAY_HOURS.elite : REVIEW_DELAY_HOURS.progress;
  return delay - (Date.now() - new Date(a.submitted_at).getTime()) / 3600_000;
}

export default async function EspaceCoach({ searchParams }: { searchParams: Promise<{ publie?: string; prise?: string }> }) {
  const { publie, prise } = await searchParams;
  const { profile } = await requireCoach();
  const db = createAdminClient();
  const cols = "id, user_id, sport, trick, notes, status, coach_id, priority, submitted_at, claimed_at, reviewed_at, seg_start, seg_end";

  const [{ data: queue }, { data: mine }, { data: done }] = await Promise.all([
    db
      .from("video_analyses")
      .select(cols)
      .eq("status", "en-attente")
      .order("priority", { ascending: false })
      .order("submitted_at", { ascending: true })
      .limit(100)
      .returns<Row[]>(),
    db.from("video_analyses").select(cols).eq("status", "en-cours").eq("coach_id", profile.id).order("claimed_at").returns<Row[]>(),
    db
      .from("video_analyses")
      .select(`${cols}, result`)
      .eq("status", "termine")
      .eq("coach_id", profile.id)
      .order("reviewed_at", { ascending: false })
      .limit(15)
      .returns<Row[]>(),
  ]);
  const myQueue = (queue ?? []).filter((a) => coachesSport(profile, a.sport));

  const riderIds = [...new Set([...myQueue, ...(mine ?? []), ...(done ?? [])].map((a) => a.user_id))];
  const { data: riders } = riderIds.length
    ? await db.from("profiles").select("id, full_name, levels").in("id", riderIds).returns<Pick<Profile, "id" | "full_name" | "levels">[]>()
    : { data: [] };
  const riderById = new Map((riders ?? []).map((r) => [r.id, r]));

  function Item({ a, action }: { a: Row; action: "prendre" | "reprendre" | "voir" }) {
    const rider = riderById.get(a.user_id);
    const level = rider ? levelFor(rider, a.sport) : null;
    const left = hoursLeft(a);
    return (
      <li className="panel flex flex-wrap items-center gap-3 px-4 py-3">
        <span className="min-w-0 flex-1">
          <span className="flex flex-wrap items-center gap-2">
            <span className="font-semibold">{a.result?.figure || trickById(a.trick ?? "")?.name || "Figure libre"}</span>
            <span className="rounded-full bg-raised px-2 py-0.5 text-xs font-semibold">{SPORTS[a.sport].name}</span>
            {a.priority && <span className="rounded-full bg-kite px-2 py-0.5 text-xs font-bold text-deep">Elite</span>}
          </span>
          <span className="mt-0.5 block text-sm text-slate">
            {rider?.full_name || "Rider"}
            {level && ` · ${LEVEL_LABELS[level]}`}
            {` · ${(Number(a.seg_end) - Number(a.seg_start)).toFixed(0)} s`}
            {action === "voir" ? ` · publié il y a ${since(a.reviewed_at)}` : ` · envoyée il y a ${since(a.submitted_at)}`}
          </span>
          {a.notes && action !== "voir" && <span className="mt-1 line-clamp-2 block text-[0.95rem]">« {a.notes} »</span>}
        </span>
        {action !== "voir" && left !== null && (
          <span className={`text-sm font-semibold ${left < 0 ? "text-danger" : left < 6 ? "text-kite" : "text-slate"}`}>
            {left < 0 ? `En retard de ${Math.round(-left)} h` : `Reste ${Math.round(left)} h`}
          </span>
        )}
        {action === "prendre" ? (
          <form action={claimAnalysis}>
            <input type="hidden" name="id" value={a.id} />
            <button className="btn btn-primary !min-h-10 !px-4 !py-2 !text-sm">Prendre</button>
          </form>
        ) : action === "reprendre" ? (
          <Link href={`/espace-coach/${a.id}`} className="btn btn-primary !min-h-10 !px-4 !py-2 !text-sm">Continuer</Link>
        ) : (
          <span className="flex items-center gap-3">
            <span className="text-xl font-extrabold text-brand">{a.result?.note ?? "–"}/10</span>
            <Link href={`/espace-coach/${a.id}`} className="text-sm font-semibold text-lagoon hover:underline">Revoir</Link>
          </span>
        )}
      </li>
    );
  }

  const sportsText = profile.coach_sports?.length
    ? profile.coach_sports.map((s) => SPORTS[s]?.name).filter(Boolean).join(", ")
    : "tous les sports";

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-3xl font-bold sm:text-4xl">Espace coach</h1>
      <p className="mt-2 text-slate">
        Vidéos de {sportsText}. Les riders Elite passent en premier (retour sous {REVIEW_DELAY_HOURS.elite} h), les autres sous{" "}
        {REVIEW_DELAY_HOURS.progress} h.
      </p>

      {publie && <p role="status" className="mt-4 rounded-2xl bg-brand-light p-4 font-semibold text-lagoon">Retour publié, le rider est prévenu.</p>}
      {prise && <p role="alert" className="mt-4 rounded-2xl bg-kite/20 p-4 font-semibold">Un autre coach vient de prendre cette vidéo.</p>}

      {(mine?.length ?? 0) > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold">À finir ({mine!.length})</h2>
          <ul className="mt-3 space-y-2">{mine!.map((a) => <Item key={a.id} a={a} action="reprendre" />)}</ul>
        </section>
      )}

      <section className="mt-8">
        <h2 className="text-xl font-bold">File d&apos;attente ({myQueue.length})</h2>
        {myQueue.length ? (
          <ul className="mt-3 space-y-2">{myQueue.map((a) => <Item key={a.id} a={a} action="prendre" />)}</ul>
        ) : (
          <p className="panel mt-3 p-5 text-slate">Aucune vidéo en attente. Tu seras prévenu par e-mail à la prochaine.</p>
        )}
      </section>

      {(done?.length ?? 0) > 0 && (
        <section className="mt-10">
          <h2 className="text-xl font-bold">Tes derniers retours</h2>
          <ul className="mt-3 space-y-2">{done!.map((a) => <Item key={a.id} a={a} action="voir" />)}</ul>
        </section>
      )}
    </div>
  );
}
