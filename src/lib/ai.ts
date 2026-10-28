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

/* ───────────────────────── Modèles, effort et coûts ───────────────────────── */

type Task = "analyse" | "coach" | "programme";
type Effort = "low" | "medium" | "high";
type TaskConfig = { model: string; effort: Effort; thinking: Anthropic.ThinkingConfigParam | null; headroom: number };

/**
 * Un modèle par tâche, au plus juste :
 * - analyse vidéo : Sonnet 5.5 (vision fine), effort moyen : il réfléchit sur les images sans s'étendre ;
 * - coach : Haiku 5.5, 20× moins cher, sans réflexion préalable : réponses courtes et rapides ;
 * - programme Elite : Sonnet 5.5, effort moyen.
 * Chaque réglage reste modifiable par variable d'environnement sans toucher au code.
 * La réflexion est décomptée de max_tokens : `headroom` est la marge réservée en plus de la réponse.
 */
const TASKS: Record<Task, TaskConfig> = {
  analyse: {
    model: process.env.AI_MODEL_ANALYSE || "claude-sonnet-5-5",
    effort: (process.env.AI_EFFORT_ANALYSE as Effort) || "medium",
    thinking: null, // réflexion adaptative : utile pour relier les images entre elles
    headroom: Number(process.env.AI_HEADROOM_ANALYSE ?? 4000),
  },
  coach: {
    model: process.env.AI_MODEL_COACH || "claude-haiku-5-5",
    effort: (process.env.AI_EFFORT_COACH as Effort) || "medium",
    thinking: { type: "disabled" },
    headroom: 0,
  },
  programme: {
    model: process.env.AI_MODEL_PROGRAMME || "claude-sonnet-5-5",
    effort: (process.env.AI_EFFORT_PROGRAMME as Effort) || "medium",
    thinking: null,
    headroom: Number(process.env.AI_HEADROOM_PROGRAMME ?? 3000),
  },
};

/** Modèle utilisé pour l'analyse vidéo (enregistré avec chaque analyse). */
export const MODEL = TASKS.analyse.model;

/** Tarifs Anthropic en $ par million de tokens : entrée, sortie, écriture cache (5 min), lecture cache. */
const PRICES: Record<string, { in: number; out: number; cacheWrite: number; cacheRead: number }> = {
  "claude-haiku-5-5": { in: 0.1, out: 0.5, cacheWrite: 0.125, cacheRead: 0.01 },
  "claude-sonnet-5-5": { in: 2, out: 10, cacheWrite: 2.5, cacheRead: 0.1 },
  "claude-opus-5-5": { in: 4, out: 20, cacheWrite: 5, cacheRead: 0.2 },
  "claude-fable-5-1": { in: 10, out: 50, cacheWrite: 12.5, cacheRead: 0.25 },
};

function priceFor(model: string) {
  const key = Object.keys(PRICES).find((k) => model.startsWith(k));
  return key ? PRICES[key] : PRICES["claude-sonnet-5-5"];
}

export function costUsd(
  usage: Pick<Anthropic.Usage, "input_tokens" | "output_tokens"> & Partial<Pick<Anthropic.Usage, "cache_creation_input_tokens" | "cache_read_input_tokens">>,
  model: string = MODEL,
) {
  const p = priceFor(model);
  return (
    (usage.input_tokens * p.in +
      usage.output_tokens * p.out +
      (usage.cache_creation_input_tokens ?? 0) * p.cacheWrite +
      (usage.cache_read_input_tokens ?? 0) * p.cacheRead) /
    1_000_000
  );
}

async function recordUsage(userId: string, kind: Task, model: string, usage: Anthropic.Usage) {
  const cost = costUsd(usage, model);
  await createAdminClient().from("ai_usage").insert({
    user_id: userId,
    kind,
    model,
    input_tokens: usage.input_tokens + (usage.cache_creation_input_tokens ?? 0) + (usage.cache_read_input_tokens ?? 0),
    output_tokens: usage.output_tokens,
    cost_usd: cost,
  });
  return cost;
}

/** Paramètres communs d'un appel : modèle, effort, réflexion, et prompt système mis en cache. */
function callParams(task: Task, system: string, maxTokens: number) {
  const cfg = TASKS[task];
  return {
    model: cfg.model,
    max_tokens: maxTokens + cfg.headroom,
    // Le prompt système (règles + profil du rider) est identique d'un appel à l'autre : mis en cache,
    // il coûte 10 à 20 fois moins cher à la relecture (messages du coach qui s'enchaînent, analyses successives).
    system: [{ type: "text" as const, text: system, cache_control: { type: "ephemeral" as const } }],
    output_config: { effort: cfg.effort },
    ...(cfg.thinking ? { thinking: cfg.thinking } : {}),
  };
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
  let maxTokens = params.max_tokens;
  // Définition de l'outil (longue, identique pour tous les riders d'un même sport) mise en cache elle aussi.
  const tool: Anthropic.Tool = { ...params.tool, cache_control: { type: "ephemeral" } };
  for (let attempt = 0; attempt < 2; attempt++) {
    const base = callParams(
      kind,
      `${params.system}\n\nRéponds obligatoirement en appelant l'outil ${params.tool.name}, sans aucun texte avant ni après, et remplis tous ses champs.`,
      maxTokens,
    );
    const res = await anthropic().messages.create({
      ...base,
      tools: [tool],
      tool_choice: { type: "auto" },
      messages,
    });
    cost += await recordUsage(userId, kind, base.model, res.usage);
    const block = res.content.find((b) => b.type === "tool_use");
    const input = block && block.type === "tool_use" ? (block.input as Record<string, unknown>) : null;
    const missing = input ? required.filter((k) => !(k in input)) : required;
    if (process.env.NODE_ENV !== "production" || missing.length) {
      console.info(
        `[ia ${kind}] essai ${attempt + 1} : ${base.model}, stop=${res.stop_reason}, blocs=${res.content.map((b) => b.type).join("+")}, ` +
          `entrée=${res.usage.input_tokens}+cache ${res.usage.cache_read_input_tokens ?? 0}/${res.usage.cache_creation_input_tokens ?? 0}, sortie=${res.usage.output_tokens}, ` +
          `coût=${costUsd(res.usage, base.model).toFixed(4)} $, manquants=${missing.join(",") || "aucun"}`,
      );
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
  // Le début de la conversation est mis en cache : chaque nouveau message ne paie plein tarif que la fin.
  const convo: Anthropic.MessageParam[] = messages.map((m, i) =>
    i === messages.length - 2
      ? { role: m.role, content: [{ type: "text", text: m.content, cache_control: { type: "ephemeral" } }] }
      : { role: m.role, content: m.content },
  );
  const base = callParams("coach", `${coachRules(sport)}\n\nProfil du rider :\n${riderContext(profile, sport, history)}`, 1400);
  const res = await anthropic().messages.create({ ...base, messages: convo });
  await recordUsage(profile.id, "coach", base.model, res.usage);
  if (process.env.NODE_ENV !== "production") {
    console.info(
      `[ia coach] ${base.model}, entrée=${res.usage.input_tokens}+cache ${res.usage.cache_read_input_tokens ?? 0}/${res.usage.cache_creation_input_tokens ?? 0}, ` +
        `sortie=${res.usage.output_tokens}, coût=${costUsd(res.usage, base.model).toFixed(5)} $`,
    );
  }
  return res.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

/**
 * Même réponse que coachReply, mais envoyée au fil de l'écriture : le rider voit le texte apparaître
 * tout de suite au lieu d'attendre la réponse complète. `onDone` reçoit le texte final (pour l'enregistrer),
 * ou une chaîne vide si la réponse a échoué (pour ne pas décompter le message).
 */
export function streamCoachReply(
  profile: Profile,
  sport: SportId,
  history: RiderHistory,
  messages: { role: "user" | "assistant"; content: string }[],
  onDone: (text: string) => Promise<void>,
): ReadableStream<Uint8Array> {
  const convo: Anthropic.MessageParam[] = messages.map((m, i) =>
    i === messages.length - 2
      ? { role: m.role, content: [{ type: "text", text: m.content, cache_control: { type: "ephemeral" } }] }
      : { role: m.role, content: m.content },
  );
  const base = callParams("coach", `${coachRules(sport)}\n\nProfil du rider :\n${riderContext(profile, sport, history)}`, 1400);
  const encoder = new TextEncoder();

  return new ReadableStream<Uint8Array>({
    async start(controller) {
      let text = "";
      try {
        const stream = anthropic().messages.stream({ ...base, messages: convo });
        stream.on("text", (delta) => {
          text += delta;
          controller.enqueue(encoder.encode(delta));
        });
        const final = await stream.finalMessage();
        await recordUsage(profile.id, "coach", base.model, final.usage);
        await onDone(text.trim());
        controller.close();
      } catch (e) {
        console.error("coach (flux)", e);
        await onDone("").catch(() => {}); // réponse non enregistrée, message non décompté
        // Marqueur lu par le navigateur : la réponse a été interrompue
        controller.enqueue(encoder.encode("\u0000ERREUR"));
        controller.close();
      }
    },
  });
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
        observations: {
          type: "array",
          items: { type: "string" },
          description: "Une ligne par moment (environ une demi-seconde), dans l'ordre : ce qui est réellement visible (rider sur l'eau / en l'air, position du kite, gerbe, corps si lisible). À remplir en premier.",
        },
        figure: { type: "string", description: "Nom d'une seule figure, affirmatif (jamais « peut-être » ni deux figures)." },
        figure_id: {
          type: ["string", "null"],
          enum: [...tricksFor(sport).map((t) => t.id), null],
          description: `Figure de la liste qui correspond à ce que le rider a fait (${tricksFor(sport).map((t) => `${t.id} = ${t.name}`).join(", ")}), ou null si aucune.`,
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
        rappels: {
          type: "array",
          items: { type: "string" },
          maxItems: 3,
          description: "Bons gestes de la figure sur des points non visibles dans la vidéo, en conseil (« Pense à… »), une phrase chacun. Vide si tout est visible.",
        },
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
      required: ["observations", "figure", "figure_id", "note", "visibilite", "resume", "phases", "points_forts", "erreurs", "drills", "rappels", "priorite_session", "securite"],
    },
  };
}

export type PreviousAttempt = { date: string; note: number; codes: string[]; priorite: string };

export async function analyseClip(opts: {
  userId: string;
  sport: SportId;
  frames: string[]; // images JPEG base64 du passage, dans l'ordre, numérotées
  frameTimes: number[]; // horodatage (s) de chaque image dans le clip
  intention: string; // ce que le rider a voulu faire, écrit par lui (obligatoire)
  trickId?: string | null;
  deep: boolean;
  maxTokens: number;
  previous?: PreviousAttempt[];
}): Promise<{ result: AnalysisResult; cost: number }> {
  const sport = SPORTS[opts.sport];
  const trick = opts.trickId ? trickById(opts.trickId) : undefined;
  const n = opts.frames.length;
  const span = n > 1 ? opts.frameTimes[n - 1] - opts.frameTimes[0] : 0;

  // Volontairement minimal : la vidéo, l'intention du rider et le sport. Ni niveau, ni matériel, ni historique
  // dans le jugement : la note et les corrections ne reposent que sur ce que montrent les images.
  const intro = [
    `Tu reçois ${n} images d'un passage de ${span.toFixed(1)} s de ${sport.name.toLowerCase()}, environ 6 par seconde, dans l'ordre chronologique (numéro et temps en haut à gauche de chaque image). Elles forment une séquence continue : suis le mouvement d'une image à l'autre.`,
    `Ce que le rider a voulu faire, avec ses mots : « ${opts.intention} ».${trick ? ` Figure choisie : ${trick.name} (points clés : ${trick.keys.join(" ; ")}).` : ""}`,
    `Travaille en trois temps :
1. Regarde toute la séquence et note dans « observations », moment par moment (une ligne par demi-seconde environ), ce que tu vois vraiment : rider sur l'eau ou en l'air, position du kite ou de l'aile, gerbe d'eau, orientation du corps si elle est lisible.
2. Compare avec ce qu'il a voulu faire : l'a-t-il fait, en partie, ou pas du tout ? Ne change de figure que si les images montrent clairement autre chose.
3. Juge l'exécution sur ce qui est visible uniquement, sans tenir compte du niveau du rider. Les erreurs et les points forts viennent des images. Pour les points clés de la figure que tu ne vois pas (genoux, regard, mains, barre quand le rider est petit), donne le bon geste dans « rappels », en conseil (« Pense à… »), jamais comme une erreur constatée.`,
    `Repères ${sport.name.toLowerCase()} : ${sport.checklist}.`,
    "Dans le rapport, ne cite jamais de numéro d'image : situe tout par phase (approche, appel, en l'air, réception). Ton affirmatif et direct, phrases courtes, consignes à l'impératif.",
    opts.deep ? "Analyse approfondie : pour chaque erreur, donne aussi sa cause, en une phrase." : "",
    opts.previous?.length
      ? `Uniquement pour remplir « evolution », après avoir jugé cette vidéo seule — tentatives précédentes de cette figure :\n${opts.previous
          .map((p) => `- ${p.date} : ${p.note}/10, erreurs ${p.codes.map(errorLabel).join(", ") || "aucune"}`)
          .join("\n")}`
      : "",
  ]
    .filter(Boolean)
    .join("\n\n");

  const content: Anthropic.ContentBlockParam[] = [{ type: "text", text: intro }];
  for (const data of opts.frames) content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data } });

  const tool = analysisTool(opts.sport, Boolean(opts.previous?.length));
  const { input, cost } = await callWithTool(opts.userId, "analyse", {
    system: `Tu es moniteur de ${sport.name.toLowerCase()} et tu analyses une vidéo envoyée par un rider. Tu réponds en français, en le tutoyant, uniquement avec l'outil rapport_analyse.`,
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

/* ───────────────────────── Analyse photo ───────────────────────── */

export const MOMENTS = ["navigation", "approche", "appel", "en l'air", "réception", "autre"] as const;

function photoTool(sport: SportId): Anthropic.Tool {
  return {
    name: "rapport_photo",
    description: `Retour de moniteur de ${SPORTS[sport].name.toLowerCase()} sur la position du rider, à partir d'une photo.`,
    input_schema: {
      type: "object",
      properties: {
        vu: { type: "string", description: "Ce que tu vois sur la photo, en une ou deux phrases factuelles. À remplir en premier." },
        figure: { type: "string", description: "Ce que fait le rider, en quelques mots (ex. « Navigation », « Premier saut, en l'air »)." },
        figure_id: {
          type: ["string", "null"],
          enum: [...tricksFor(sport).map((t) => t.id), null],
          description: `Figure de la liste qui correspond (${tricksFor(sport).map((t) => `${t.id} = ${t.name}`).join(", ")}), ou null.`,
        },
        moment: { type: "string", enum: [...MOMENTS], description: "Moment de la figure visible sur la photo." },
        note: { type: "integer", minimum: 1, maximum: 10, description: "Note de la position sur cette photo." },
        visibilite: { type: "string", enum: ["bonne", "partielle", "faible"], description: "Le rider est-il assez grand et net pour juger sa position ?" },
        resume: { type: "string", description: "2 phrases maximum : le diagnostic principal sur la position." },
        points_forts: { type: "array", items: { type: "string" }, maxItems: 3, description: "Ce qui est bien placé, 12 mots maximum chacun." },
        erreurs: {
          type: "array",
          maxItems: 3,
          description: "Défauts de position visibles sur la photo, du plus important au moins important.",
          items: {
            type: "object",
            properties: {
              code: { type: "string", enum: Object.keys(errorsFor(sport)) },
              probleme: { type: "string", description: "Ce qui ne va pas et pourquoi, en une phrase." },
              correction: { type: "string", description: "Consigne concrète, 1 à 2 phrases, à l'impératif." },
              gravite: { type: "string", enum: ["majeure", "moyenne", "mineure"] },
            },
            required: ["code", "probleme", "correction", "gravite"],
          },
        },
        drills: { type: "array", items: { type: "string" }, maxItems: 3, description: "Exercices pour corriger, une phrase chacun." },
        priorite_session: { type: "string", description: "LA chose à corriger à la prochaine session, en une phrase." },
        securite: { type: ["string", "null"], description: "Alerte sécurité en une phrase si un danger est visible, sinon null." },
      },
      required: ["vu", "figure", "figure_id", "moment", "note", "visibilite", "resume", "points_forts", "erreurs", "drills", "priorite_session", "securite"],
    },
  };
}

/** Analyse simple : une photo (ou une image de vidéo) + ce que le rider fait → retour sur sa position. */
export async function analysePhoto(opts: {
  userId: string;
  sport: SportId;
  image: string; // JPEG base64
  intention: string;
}): Promise<{ result: AnalysisResult; cost: number }> {
  const sport = SPORTS[opts.sport];
  const text = [
    `Photo de ${sport.name.toLowerCase()}. Ce que le rider fait, avec ses mots : « ${opts.intention} ».`,
    "Regarde la photo et juge sa position : posture (jambes, buste, bras, tête), placement sur la planche, angle de la planche, position du kite ou de l'aile, et ce que tout ça donne pour ce qu'il veut faire.",
    `Repères : ${sport.checklist}.`,
    "Ne juge que ce qui est visible. Si le rider est trop petit ou flou pour voir un détail, n'en parle pas. Ton direct et affirmatif, phrases courtes, consignes à l'impératif. Ne tiens pas compte de son niveau : juge la position telle qu'elle est.",
  ].join("\n\n");

  const { input, cost } = await callWithTool(opts.userId, "analyse", {
    system: `Tu es moniteur de ${sport.name.toLowerCase()}. Tu réponds en français, en tutoyant, uniquement avec l'outil rapport_photo.`,
    max_tokens: 1500,
    tool: photoTool(opts.sport),
    content: [
      { type: "text", text },
      { type: "image", source: { type: "base64", media_type: "image/jpeg", data: opts.image } },
    ],
  });

  const raw = input as Record<string, unknown>;
  const codes = errorsFor(opts.sport);
  const result: AnalysisResult = normalizeResult({ ...raw, phases: [], observations: raw.vu ? [raw.vu] : [] });
  result.sport = opts.sport;
  result.moment = typeof raw.moment === "string" ? raw.moment : null;
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
