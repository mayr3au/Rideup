import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getConditions } from "@/lib/weather";
import { getLiveWinds } from "@/lib/live-wind";
import { compass, confidenceFor, distanceKm, ORIENTATION_LABEL, summarizeDay, weatherLabel, type DaySummary, type Rider } from "@/lib/wind";
import { gearSizes, levelFor } from "@/lib/rider";
import { SPORTS, type SportId } from "@/lib/sports";
import type { Profile, Spot } from "@/lib/types";

/**
 * Prévisions lues par le coach IA : quand le rider demande où / quand rider, le coach répond lui-même
 * dans le chat, à partir des mêmes calculs que le Spot Finder (vent ou houle, orientation, niveau, poids, matériel).
 */

const plain = (t: string) =>
  t
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/['’]/g, " ");

/** Le message parle-t-il des conditions (vent, houle, météo, où / quand rider) ? */
const INTENT =
  /\b(vent|venteux|ventee?|meteo|previsions?|conditions?|houle|vagues?|swell|noeuds?|nds|rafales?|thermique|orage|pluie|offshore|onshore|side|ca souffle|souffler?|pétole|petole|rideable|ridable|naviguer|aller a l eau|spot|spots|ou aller|aujourd hui|ce soir|ce matin|cet aprem|demain|apres demain|week ?end|samedi|dimanche|lundi|mardi|mercredi|jeudi|vendredi|cette semaine|quelle aile|quelle taille|quel kite|quelle voile)\b/;

export function wantsConditions(text: string) {
  return INTENT.test(plain(text));
}

/** Spots cités par leur nom dans le message (« l'Almanarre », « la Bocca »…). */
function namedSpots(text: string, spots: Spot[]) {
  const t = ` ${plain(text).replace(/[^a-z0-9 ]/g, " ")} `;
  return spots.filter((s) =>
    plain(s.name)
      .split(/[–\-(),/]/)
      .map((part) => part.replace(/\b(l|la|le|les|plage|de|du|des|d)\b/g, " ").replace(/[^a-z0-9 ]/g, " ").trim())
      .filter((part) => part.length >= 4)
      .some((part) => t.includes(` ${part} `)),
  );
}

const JOURS = ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"];
/** Date du jour (AAAA-MM-JJ) en France : les spots sont rendus à l'heure locale. */
function todayIso() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Paris" }).format(new Date());
}

function dayName(date: string) {
  const d = new Date(`${date}T12:00:00Z`);
  const label = `${JOURS[d.getUTCDay()]} ${d.getUTCDate()}/${d.getUTCMonth() + 1}`;
  const diff = Math.round((d.getTime() - new Date(`${todayIso()}T12:00:00Z`).getTime()) / 86_400_000);
  return diff === 0 ? `aujourd'hui (${label})` : diff === 1 ? `demain (${label})` : label;
}

function dayLine(d: DaySummary, i: number, sport: SportId) {
  const waves = SPORTS[sport].spot === "waves";
  const cable = SPORTS[sport].spot === "cable";
  const conf = confidenceFor(d.spread, i, d.avgWind);
  const head = `  · ${dayName(d.date)} : `;
  if (d.goodHours > 0) {
    const parts = [
      `RIDABLE ${d.window ? `${d.window.from}–${d.window.to}` : `${d.goodHours} h`}${d.caution ? " (avec prudence)" : ""}`,
      waves
        ? `${d.avgWave != null ? `${d.avgWave.toFixed(1)} m` : "?"}${d.period ? `, ${d.period} s` : ""}${d.avgWind != null ? `, vent ${d.avgWind} nds` : ""}`
        : cable
          ? null
          : `${d.avgWind} nds${d.maxGust != null && d.maxGust > (d.avgWind ?? 0) + 3 ? ` (rafales ${d.maxGust})` : ""}${d.dir != null ? ` de ${compass(d.dir)}` : ""}`,
      d.orientation ? ORIENTATION_LABEL[d.orientation].toLowerCase() : null,
      d.gear ? `${d.gearName ?? "aile"} conseillée ${String(d.gear).replace(".", ",")} m²` : null,
      conf ? `fiabilité ${conf}` : null,
      d.warnings.length ? `attention : ${d.warnings.join(" ; ")}` : null,
    ];
    return head + parts.filter(Boolean).join(", ");
  }
  const p = d.peak;
  const peak = p
    ? waves
      ? `max ${p.wave != null ? `${p.wave.toFixed(1)} m` : "?"}${p.period ? `, ${p.period} s` : ""}, vent ${p.wind} nds`
      : `max ${p.wind} nds (rafales ${p.gust}) de ${compass(p.dir)}${p.orientation ? `, ${ORIENTATION_LABEL[p.orientation].toLowerCase()}` : ""}`
    : null;
  return head + ["pas ridable", d.reason, peak].filter(Boolean).join(", ");
}

/**
 * Bloc de contexte à joindre au message du rider, ou null si la question ne porte pas sur les conditions.
 * Jamais d'exception : en cas de souci, le bloc dit au coach ce qui manque.
 */
export async function conditionsBrief(db: SupabaseClient, profile: Profile, sport: SportId, message: string, previous = ""): Promise<string | null> {
  const S = SPORTS[sport];
  // Seul le message en cours déclenche les prévisions (« et samedi ? » oui, « comment je fais un backroll ? » non) ;
  // le message précédent sert seulement à retrouver le spot dont on parlait.
  const asksNow = wantsConditions(message);

  try {
    const [{ data: all }, { data: favs }] = await Promise.all([
      db.from("spots").select("*").contains("sports", [sport]).returns<Spot[]>(),
      db.from("favorite_spots").select("spot_id").eq("user_id", profile.id),
    ]);
    const spots = all ?? [];
    const favorites = new Set((favs ?? []).map((f) => f.spot_id as string));
    const namedNow = namedSpots(message, spots);
    if (!asksNow && !namedNow.length) return null;
    const named = namedNow.length ? namedNow : namedSpots(previous, spots);

    const lat = profile.home_lat;
    const lng = profile.home_lng;
    const hasHome = lat != null && lng != null;
    if (!hasHome && !named.length) {
      return `Prévisions : indisponibles, le rider n'a pas renseigné sa ville dans son profil et ne cite aucun spot connu. Demande-lui sa ville ou le spot visé, ou propose-lui de renseigner sa ville dans son profil.`;
    }

    const radius = Math.min(150, profile.radius_km || 60);
    const withDist = spots.map((s) => ({ s, km: hasHome ? distanceKm(lat!, lng!, s.lat, s.lng) : 0 }));
    const nearby = hasHome ? withDist.filter((x) => x.km <= radius).sort((a, b) => a.km - b.km).slice(0, 6) : [];
    const favList = hasHome ? withDist.filter((x) => favorites.has(x.s.id)).sort((a, b) => a.km - b.km).slice(0, 3) : [];
    const namedList = withDist.filter((x) => named.some((n) => n.id === x.s.id));
    const chosen = [...namedList, ...favList, ...nearby].filter((x, i, arr) => arr.findIndex((y) => y.s.id === x.s.id) === i)
      .slice(0, 8)
      .sort((a, b) => a.km - b.km);

    if (!chosen.length) {
      return `Prévisions : aucun spot de ${S.name.toLowerCase()} référencé à moins de ${radius} km de ${profile.home_label?.split(",")[0] ?? "chez le rider"}. Dis-le simplement et demande-lui où il compte rider.`;
    }

    const rider: Rider = { sport, level: levelFor(profile, sport), weightKg: profile.weight_kg, gear: gearSizes(profile, sport) };
    const [forecasts, live] = await Promise.all([
      getConditions(
        chosen.map((x) => x.s),
        S.spot === "waves",
      ),
      S.spot === "wind" ? getLiveWinds(chosen.map((x) => x.s), 4).catch(() => new Map()) : Promise.resolve(new Map()),
    ]);

    const blocks = chosen.map((x, k) => {
      const hours = forecasts[k] ?? [];
      const today = todayIso();
      const dates = [...new Set(hours.map((h) => h.time.slice(0, 10)))].filter((d) => d >= today).slice(0, 5);
      const days = dates.map((d) => summarizeDay(hours, d, x.s, rider));
      const lw = live.get(x.s.id);
      const tags = [
        hasHome ? `${Math.round(x.km)} km` : null,
        favorites.has(x.s.id) ? "favori du rider" : null,
        named.some((n) => n.id === x.s.id) ? "cité par le rider" : null,
        x.s.rules ? `règles locales : ${x.s.rules.slice(0, 160)}` : null,
      ].filter(Boolean);
      const first = days[0];
      const meteo = first ? weatherLabel(hours.find((h) => h.time.startsWith(first.date) && h.time.slice(11, 13) === "14")?.code ?? 0) : null;
      return [
        `- ${x.s.name} (${tags.join(", ")})`,
        lw ? `  · vent mesuré en ce moment : ${lw.wind} nds${lw.gust ? `, rafales ${lw.gust}` : ""}${lw.dir != null ? ` de ${compass(lw.dir)}` : ""}` : null,
        ...days.map((d, i) => dayLine(d, i, sport)),
        meteo ? `  · ciel aujourd'hui vers 14 h : ${meteo.toLowerCase()}` : null,
      ]
        .filter(Boolean)
        .join("\n");
    });

    const now = new Intl.DateTimeFormat("fr-FR", { timeZone: "Europe/Paris", weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }).format(new Date());
    return [
      `Prévisions RIDE'UP (4 modèles météo croisés), calculées pour ce rider (niveau, poids, matériel) — nous sommes ${now} :`,
      hasHome ? `Point de départ : ${profile.home_label ?? "domicile du rider"}, rayon ${radius} km. Spots du plus proche au plus loin.` : "",
      ...blocks,
    ]
      .filter(Boolean)
      .join("\n");
  } catch (e) {
    console.error("prévisions coach", e);
    return "Prévisions : le service météo ne répond pas en ce moment. Dis-le au rider en une phrase et propose-lui de reposer la question dans quelques minutes.";
  }
}
