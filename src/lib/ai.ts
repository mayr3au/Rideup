import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { errorLabel, errorsFor, LEVEL_LABELS, SPORTS, SPORT_IDS, tricksFor, trickById, type SportId } from "@/lib/sports";
import { detailsFor, disciplineFor, gearFor, levelFor, riderSports } from "@/lib/rider";
import type { AnalysisResult, Profile, Program, TrickProgress } from "@/lib/types";
import { normalizeResult } from "@/lib/analysis-result";

let client: Anthropic | null = null;
function anthropic() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
// Tarifs en $ par million de tokens (Claude Sonnet 5.5 : 2 $ en entrée, 10 $ en sortie).
const PRICE_IN = Number(process.env.AI_PRICE_INPUT_PER_MTOK ?? 2);
const PRICE_OUT = Number(process.env.AI_PRICE_OUTPUT_PER_MTOK ?? 10);

/**
 * Les modèles récents réfléchissent avant de répondre (blocs « thinking »), et cette réflexion
 * est décomptée de max_tokens. Sans marge, la réponse est coupée avant la fin.
 */
const THINKING_HEADROOM = Number(process.env.AI_THINKING_HEADROOM ?? 8000);

export function costUsd(usage: { input_tokens: number; output_tokens: number }) {
  return (usage.input_tokens * PRICE_IN + usage.output_tokens * PRICE_OUT) / 1_000_000;
}

async function recordUsage(userId: string, kind: "analyse" | "coach" | "programme", usage: Anthropic.Usage) {
  const cost = costUsd(usage);
  await createAdminClient().from("ai_usage").insert({
    user_id: userId,
    kind,
    model: MODEL,
    input_tokens: usage.input_tokens,
    output_tokens: usage.output_tokens,
    cost_usd: cost,
  });
  return cost;
}

/**
 * Appelle le modèle en lui demandant de répondre via un outil.
 * Certains modèles refusent tool_choice forcé ("tool"/"any") : on laisse le choix ("auto"),
 * on insiste dans la consigne, et si le modèle répond quand même en texte, on relance une fois.
 */
async function callWithTool(
  userId: string,
  kind: "analyse" | "programme",
  params: { system: string; max_tokens: number; tool: Anthropic.Tool; content: string | Anthropic.ContentBlockParam[] },
): Promise<{ input: unknown; cost: number }> {
  const required = ((params.tool.input_schema as { required?: string[] }).required ?? []) as string[];
  const messages: Anthropic.MessageParam[] = [{ role: "user", content: params.content }];
  let cost = 0;
  let maxTokens = params.max_tokens + THINKING_HEADROOM;
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await anthropic().messages.create({
      model: MODEL,
      max_tokens: maxTokens,
      system: `${params.system}\n\nRéponds obligatoirement en appelant l'outil ${params.tool.name}, sans aucun texte avant ni après, et remplis tous ses champs.`,
      tools: [params.tool],
      tool_choice: { type: "auto" },
      messages,
    });
    cost += await recordUsage(userId, kind, res.usage);
    const block = res.content.find((b) => b.type === "tool_use");
    const input = block && block.type === "tool_use" ? (block.input as Record<string, unknown>) : null;
    const missing = input ? required.filter((k) => !(k in input)) : required;
    if (process.env.NODE_ENV !== "production" || missing.length) {
      console.info(`[ia ${kind}] essai ${attempt + 1} : stop=${res.stop_reason}, blocs=${res.content.map((b) => b.type).join("+")}, manquants=${missing.join(",") || "aucun"}`);
    }
    if (input && !missing.length && res.stop_reason !== "max_tokens") return { input, cost };
    if (attempt === 0) {
      // Réponse tronquée ou incomplète : on relance avec plus de marge, en demandant l'outil seul.
      maxTokens = Math.round(maxTokens * 1.6);
      messages.splice(1);
      messages[0] = {
        role: "user",
        content:
          typeof params.content === "string"
            ? `${params.content}\n\nAppelle directement l'outil ${params.tool.name} avec tous ses champs remplis, sans texte.`
            : [...params.content, { type: "text", text: `Appelle directement l'outil ${params.tool.name} avec tous ses champs remplis, sans texte.` }],
      };
    } else if (input) {
      return { input, cost }; // dernier recours : on garde ce qu'on a, normalisé ensuite
    }
  }
  throw new Error(`Le modèle n'a pas utilisé l'outil ${params.tool.name}`);
}

/* ───────────────────────── Contexte rider ───────────────────────── */

export type RiderHistory = {
  progress: TrickProgress[];
  recurringErrors: { code: string; count: number }[];
};

function riderContext(profile: Profile, sport: SportId, history?: RiderHistory) {
  const progress = (history?.progress ?? []).filter((p) => trickById(p.trick_id)?.sport === sport);
  const names = (s: string) =>
    progress.filter((p) => p.status === s).map((p) => trickById(p.trick_id)?.name).filter(Boolean).join(", ") || "aucune";
  const others = riderSports(profile)
    .filter((s) => s !== sport)
    .map((s) => `${SPORTS[s].name} (${LEVEL_LABELS[levelFor(profile, s) ?? "debutant"].toLowerCase()})`);
  const lvl = levelFor(profile, sport);
  const evaluation = detailsFor(profile, sport).evaluation;
  const lines = [
    `Prénom : ${profile.full_name || "inconnu"}`,
    `Sport concerné : ${SPORTS[sport].name}`,
    `Niveau déclaré dans ce sport : ${lvl ? LEVEL_LABELS[lvl] : "non renseigné"}${evaluation ? ` (auto-évaluation : ${evaluation.score}/100, ${LEVEL_LABELS[evaluation.level].toLowerCase()})` : ""}`,
    `Discipline : ${disciplineFor(profile, sport) ?? "non précisée"}`,
    `Pied avant : ${profile.stance === "goofy" ? "droit (goofy)" : profile.stance === "regular" ? "gauche (regular)" : "?"}`,
    `Poids : ${profile.weight_kg ? `${profile.weight_kg} kg` : "non renseigné"}`,
    `Matériel : ${gearFor(profile, sport) || "non renseigné"}`,
    `Autres sports pratiqués : ${others.length ? others.join(", ") : "aucun"}`,
    `Objectifs : ${profile.goals || "non renseignés"}`,
    `Figures validées : ${names("valide")}`,
    `Figures en cours : ${names("en-cours")}`,
  ];
  if (history?.recurringErrors.length) {
    lines.push(
      `Erreurs récurrentes (analyses récentes) : ${history.recurringErrors
        .map((e) => `${errorLabel(e.code)} ×${e.count}`)
        .join(" ; ")}`,
    );
  }
  return lines.join("\n");
}

function coachRules(sport: SportId) {
  const s = SPORTS[sport];
  const all = SPORT_IDS.map((id) => SPORTS[id].name.toLowerCase()).join(", ");
  return `Tu es le coach de RIDE'UP, moniteur expérimenté en sports de glisse (${all}). Tu parles français et tu tutoies.
Dans cette conversation, le rider parle surtout de ${s.name.toLowerCase()}. Ton expertise : ${s.expertise}.
Règles :
- Concret et actionnable : ce que le rider doit faire différemment à sa prochaine session, avec des repères corporels (« regarde ton épaule arrière », « genoux souples »).
- Court : 120 mots maximum par réponse (un plan détaillé peut aller jusqu'à 250). Va à l'essentiel, le rider peut te redemander des détails.
- Adapte tout au sport, au niveau, au poids, au matériel et à l'historique du rider.
- La sécurité passe avant tout : vent offshore, rafales, orage, houle trop grosse, courants, spot inconnu, matériel abîmé, figure trop avancée pour le niveau → dis-le clairement et conseille l'option prudente ou un moniteur.
- Tu ne donnes pas de prévisions météo : renvoie vers le Spot Finder de RIDE'UP.
- Si le rider parle d'un autre de ses sports, réponds pour ce sport-là.
- Hors sports de glisse, recentre poliment.
- Pas de titres markdown. Listes courtes et gras autorisés.
- Quand tu poses une question au rider (poids, niveau, matériel, conditions, choix entre options…), termine ta réponse par UNE ligne exactement de la forme [[choix: réponse 1 | réponse 2 | réponse 3]] avec 2 à 4 réponses courtes (5 mots max chacune) qu'il pourra cliquer, dont une porte de sortie comme « Autre » ou « Je ne sais pas » si c'est pertinent. Une seule question à la fois. Pas de ligne [[choix: …]] si tu ne poses pas de question.`;
}

/* ───────────────────────── Coach ───────────────────────── */

export async function coachReply(
  profile: Profile,
  sport: SportId,
  history: RiderHistory,
  messages: { role: "user" | "assistant"; content: string }[],
) {
  const res = await anthropic().messages.create({
    model: MODEL,
    max_tokens: 1400 + THINKING_HEADROOM,
    system: `${coachRules(sport)}\n\nProfil du rider :\n${riderContext(profile, sport, history)}`,
    messages,
  });
  await recordUsage(profile.id, "coach", res.usage);
  return res.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

/* ───────────────────────── Analyse vidéo ───────────────────────── */

function analysisTool(sport: SportId, withEvolution: boolean): Anthropic.Tool {
  const codes = Object.keys(errorsFor(sport));
  const phases = SPORTS[sport].phases;
  return {
    name: "rapport_analyse",
    description: `Rapport technique d'une tentative de figure de ${SPORTS[sport].name.toLowerCase()}.`,
    input_schema: {
      type: "object",
      properties: {
        figure: { type: "string", description: "Nom de la figure tentée ou identifiée." },
        figure_id: {
          type: ["string", "null"],
          enum: [...tricksFor(sport).map((t) => t.id), null],
          description: "Identifiant de la figure dans la roadmap, ou null si aucune ne correspond.",
        },
        note: { type: "integer", minimum: 1, maximum: 10, description: "Note d'exécution globale." },
        visibilite: {
          type: "string",
          enum: ["bonne", "partielle", "faible"],
          description: "Qualité de ce qui est visible (rider trop loin, aile ou kite hors cadre, contre-jour…).",
        },
        resume: { type: "string", description: "2 phrases maximum : le diagnostic et le point décisif. Si un élément est hors champ, une seule courte phrase pour le dire." },
        phases: {
          type: "array",
          description: `Une entrée par phase réellement visible ; omets une phase que tu ne vois pas. approche = ${phases.approche}, appel = ${phases.appel}, vol = ${phases.vol}, reception = ${phases.reception}.`,
          items: {
            type: "object",
            properties: {
              phase: { type: "string", enum: ["approche", "appel", "vol", "reception"] },
              note: { type: "integer", minimum: 1, maximum: 10 },
              commentaire: { type: "string", description: "Une phrase, 25 mots maximum, affirmative." },
            },
            required: ["phase", "note", "commentaire"],
          },
        },
        points_forts: { type: "array", items: { type: "string" }, maxItems: 3, description: "Courts, 12 mots maximum chacun." },
        erreurs: {
          type: "array",
          maxItems: 4,
          description: "Erreurs réellement visibles, de la plus importante à la moins importante. Aucune erreur sur un point que tu ne vois pas.",
          items: {
            type: "object",
            properties: {
              code: { type: "string", enum: codes },
              probleme: { type: "string", description: "Ce qui ne va pas et pourquoi, en une phrase, situé par la phase (« à l'appel », « en l'air ») : jamais de numéro d'image ni d'horodatage." },
              correction: { type: "string", description: "Consigne concrète, 1 à 2 phrases, à l'impératif." },
              gravite: { type: "string", enum: ["majeure", "moyenne", "mineure"] },
            },
            required: ["code", "probleme", "correction", "gravite"],
          },
        },
        drills: { type: "array", items: { type: "string" }, maxItems: 3, description: "Exercices précis pour la prochaine session, une phrase chacun." },
        priorite_session: { type: "string", description: "LA chose à travailler en priorité à la prochaine session, en une phrase." },
        securite: { type: ["string", "null"], description: "Alerte sécurité en une phrase si quelque chose de dangereux est visible, sinon null (pas de rappel générique)." },
        ...(withEvolution
          ? {
              evolution: {
                type: ["string", "null"],
                description: "2 phrases maximum : ce qui s'améliore, ce qui persiste. null si pas d'historique.",
              },
            }
          : {}),
      },
      required: ["figure", "figure_id", "note", "visibilite", "resume", "phases", "points_forts", "erreurs", "drills", "priorite_session", "securite"],
    },
  };
}

export type PreviousAttempt = { date: string; note: number; codes: string[]; priorite: string };

export async function analyseClip(opts: {
  profile: Profile;
  sport: SportId;
  history: RiderHistory;
  sheets: string[]; // planches JPEG base64 (grilles 4×3 numérotées)
  frameTimes: number[]; // horodatage (s) de chaque image dans le clip
  trickId?: string | null;
  notes?: string | null;
  deep: boolean;
  maxTokens: number;
  previous?: PreviousAttempt[];
}): Promise<{ result: AnalysisResult; cost: number }> {
  const sport = SPORTS[opts.sport];
  const trick = opts.trickId ? trickById(opts.trickId) : undefined;
  const n = opts.frameTimes.length;
  const span = n > 1 ? opts.frameTimes[n - 1] - opts.frameTimes[0] : 0;

  const intro = [
    `Tu reçois ${opts.sheets.length} planche(s) contenant ${n} images numérotées (1 à ${n}), extraites à intervalle régulier d'un passage de ${span.toFixed(1)} s choisi par le rider. Ordre de lecture : de gauche à droite puis de haut en bas, planche après planche.`,
    `Sport : ${sport.name}.`,
    trick
      ? `Le rider dit tenter : ${trick.name}. Points clés attendus : ${trick.keys.join(" ; ")}.`
      : `Le rider n'a pas précisé la figure : identifie-la à partir du mouvement (figures de la roadmap ${sport.name} : ${tricksFor(opts.sport).map((t) => t.name).join(", ")}).`,
    opts.notes ? `Ce qui coince selon lui : « ${opts.notes} ».` : "",
    `Analyse comme un moniteur de ${sport.name.toLowerCase()} : ${sport.checklist}.`,
    `Phases à noter : ${sport.phases.approche}, ${sport.phases.appel}, ${sport.phases.vol}, ${sport.phases.reception}.`,
    "Les numéros et horodatages des images servent seulement à ta lecture : ne les cite jamais dans le rapport, ni les planches. Situe tout par phase (approche, appel, en l'air, réception).",
    "Ton : moniteur sûr de son diagnostic. Affirmatif et direct, phrases courtes, à l'impératif pour les consignes. Pas de conditionnel ni de « semble », « peut-être », « probablement », « lecture incertaine ».",
    "Ce que tu ne vois pas (rider trop loin, planche ou aile hors cadre) : dis-le une seule fois, en une courte phrase dans le résumé, baisse « visibilite », puis n'en parle plus. Ne note pas une phase invisible et ne relève aucune erreur que tu ne vois pas : juge uniquement ce qui est visible.",
    "Chaque erreur est un point technique précis : pas de description générique de la vidéo.",
    "Si la vidéo ne correspond pas au sport indiqué, dis-le dans le résumé et analyse ce que tu vois.",
    opts.deep
      ? "Analyse approfondie : pour chaque erreur, donne la cause (pas seulement le symptôme) et son effet sur la suite de la figure, toujours en une phrase."
      : "",
    opts.previous?.length
      ? `Tentatives précédentes de cette figure :\n${opts.previous
          .map((p) => `- ${p.date} : ${p.note}/10, erreurs ${p.codes.map(errorLabel).join(", ") || "aucune"} ; priorité donnée : ${p.priorite}`)
          .join("\n")}\nRemplis « evolution » : ce qui s'est amélioré, ce qui persiste, ce qui est nouveau.`
      : "",
    "Réponds uniquement avec l'outil rapport_analyse, en français, en tutoyant.",
  ]
    .filter(Boolean)
    .join("\n\n");

  const content: Anthropic.ContentBlockParam[] = [{ type: "text", text: intro }];
  opts.sheets.forEach((data, i) => {
    content.push({ type: "text", text: `Planche ${i + 1}` });
    content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data } });
  });

  const tool = analysisTool(opts.sport, Boolean(opts.previous?.length));
  const { input, cost } = await callWithTool(opts.profile.id, "analyse", {
    system: `${coachRules(opts.sport)}\n\nProfil du rider :\n${riderContext(opts.profile, opts.sport, opts.history)}`,
    max_tokens: opts.maxTokens,
    tool,
    content,
  });

  const codes = errorsFor(opts.sport);
  const result: AnalysisResult = normalizeResult(input);
  result.sport = opts.sport;
  result.erreurs = result.erreurs.map((e) => ({ ...e, code: e.code in codes ? e.code : "autre" }));
  if (result.figure_id && trickById(result.figure_id)?.sport !== opts.sport) result.figure_id = null;
  return { result, cost };
}

/* ───────────────────────── Programme personnalisé (Elite) ───────────────────────── */

const PROGRAM_TOOL: Anthropic.Tool = {
  name: "programme",
  description: "Programme de progression pour les prochaines sessions.",
  input_schema: {
    type: "object",
    properties: {
      focus: { type: "string", description: "Objectif principal du programme en une phrase." },
      diagnostic: { type: "string", description: "Où en est le rider et pourquoi ce focus (3 phrases max)." },
      sessions: {
        type: "array",
        minItems: 3,
        maxItems: 5,
        items: {
          type: "object",
          properties: {
            titre: { type: "string" },
            objectif: { type: "string" },
            exercices: { type: "array", items: { type: "string" }, minItems: 2, maxItems: 5 },
          },
          required: ["titre", "objectif", "exercices"],
        },
      },
      criteres_reussite: { type: "array", items: { type: "string" }, maxItems: 4, description: "Comment savoir que l'objectif est atteint." },
    },
    required: ["focus", "diagnostic", "sessions", "criteres_reussite"],
  },
};

export async function generateProgram(
  profile: Profile,
  sport: SportId,
  history: RiderHistory,
  recent: (PreviousAttempt & { figure?: string })[],
) {
  const { input } = await callWithTool(profile.id, "programme", {
    system: `${coachRules(sport)}\n\nProfil du rider :\n${riderContext(profile, sport, history)}`,
    max_tokens: 2000,
    tool: PROGRAM_TOOL,
    content: `Construis un programme de 3 à 5 sessions de ${SPORTS[sport].name.toLowerCase()} pour faire progresser ce rider vers son objectif, en s'attaquant d'abord à ses erreurs récurrentes. Chaque session doit être faisable sur l'eau en 1 h 30 à 2 h, avec des exercices progressifs et sûrs pour son niveau.\n\nDernières analyses :\n${
          recent.length
            ? recent.map((r) => `- ${r.date} ${r.figure ?? ""} : ${r.note}/10, erreurs ${r.codes.map(errorLabel).join(", ") || "aucune"}`).join("\n")
            : "aucune"
        }`,
  });
  return input as Program;
}
