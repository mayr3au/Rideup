import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { errorLabel, errorsFor, LEVEL_LABELS, SPORTS, SPORT_IDS, trickById, tricksFor, type SportId } from "@/lib/sports";
import { normalizeDraft, type ReviewDraft } from "@/lib/review-draft";
import { detailsFor, disciplineFor, gearFor, levelFor, riderSports } from "@/lib/rider";
import type { Profile, Program, TrickProgress } from "@/lib/types";

let client: Anthropic | null = null;
function anthropic() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

/* ───────────────────────── Modèles, effort et coûts ───────────────────────── */

type Task = "coach" | "programme" | "compte_rendu";
type Effort = "low" | "medium" | "high";
type TaskConfig = { model: string; effort: Effort; thinking: Anthropic.ThinkingConfigParam | null; headroom: number };

/**
 * Un modèle par tâche, au plus juste :
 * - coach : Haiku 5.5, 20× moins cher, sans réflexion préalable : réponses courtes et rapides ;
 * - programme Elite : Sonnet 5.5, effort moyen.
 * Chaque réglage reste modifiable par variable d'environnement sans toucher au code.
 * La réflexion est décomptée de max_tokens : `headroom` est la marge réservée en plus de la réponse.
 */
const TASKS: Record<Task, TaskConfig> = {
  coach: {
    model: process.env.AI_MODEL_COACH || "claude-haiku-5-5",
    effort: (process.env.AI_EFFORT_COACH as Effort) || "medium",
    thinking: { type: "disabled" },
    headroom: 0,
  },
  // Mise en forme du compte rendu d'un coach : fidèle et soignée, sans réflexion préalable pour rester rapide.
  compte_rendu: {
    model: process.env.AI_MODEL_COMPTE_RENDU || "claude-sonnet-5-5",
    effort: (process.env.AI_EFFORT_COMPTE_RENDU as Effort) || "medium",
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
  model: string,
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
    // La base n'accepte que analyse / coach / programme : la mise en forme d'un retour compte comme « analyse »
    kind: kind === "compte_rendu" ? "analyse" : kind,
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
  kind: "programme" | "compte_rendu",
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

/* ───────────────────────── Programme Elite ───────────────────────── */

/** Résumé d'une analyse passée (rédigée par un coach) pour construire le programme. */
export type PreviousAttempt = { date: string; note: number; codes: string[]; priorite: string };

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

/* ───────────────────────── Mise en forme du retour d'un coach ───────────────────────── */

function reportTool(sport: SportId): Anthropic.Tool {
  const tricks = tricksFor(sport).map((t) => t.id);
  const codes = [...Object.keys(errorsFor(sport)), "autre"];
  const text = (description: string) => ({ type: "string" as const, description });
  return {
    name: "retour_coach",
    description: "Retour structuré envoyé au rider, rédigé à partir du compte rendu du coach.",
    input_schema: {
      type: "object",
      properties: {
        figure: text("Nom de la figure, tel qu'affiché au rider."),
        figure_id: { type: "string", enum: ["", ...tricks], description: "Identifiant de la figure dans la roadmap, ou vide si elle n'y est pas." },
        note: { type: "number", minimum: 0, maximum: 10, description: "Note globale /10 donnée par le coach. S'il n'en donne pas, propose une note cohérente avec son compte rendu." },
        resume: text("3 à 5 phrases : ce que le coach voit, ce qui marche, ce qui bloque. Tutoiement."),
        priorite_session: text("La seule chose à travailler à la prochaine session, en une phrase concrète."),
        visibilite: { type: "string", enum: ["bonne", "partielle", "faible"], description: "Qualité de la vidéo selon le coach (bonne par défaut)." },
        phases: {
          type: "array",
          description: "Seulement les phases dont le coach parle. Ne jamais inventer une phase.",
          items: {
            type: "object",
            properties: {
              phase: { type: "string", enum: ["approche", "appel", "vol", "reception"] },
              note: { type: ["number", "null"], minimum: 0, maximum: 10, description: "Note de la phase si le coach en donne une, sinon null." },
              commentaire: text("Ce que le coach dit de cette phase."),
            },
            required: ["phase", "note", "commentaire"],
          },
        },
        erreurs: {
          type: "array",
          maxItems: 6,
          description: "Les erreurs relevées par le coach, de la plus importante à la moins importante.",
          items: {
            type: "object",
            properties: {
              code: { type: "string", enum: codes },
              gravite: { type: "string", enum: ["majeure", "moyenne", "mineure"] },
              probleme: text("Le problème, en une phrase."),
              correction: text("La correction concrète à appliquer sur l'eau."),
            },
            required: ["code", "gravite", "probleme", "correction"],
          },
        },
        points_forts: { type: "array", items: { type: "string" }, maxItems: 5, description: "Ce qui marche déjà, d'après le coach." },
        drills: { type: "array", items: { type: "string" }, maxItems: 5, description: "Exercices donnés par le coach (ou directement déduits de ses corrections)." },
        rappels: { type: "array", items: { type: "string" }, maxItems: 4, description: "Points à garder en tête mentionnés par le coach. Vide sinon." },
        securite: text("Alerte sécurité seulement si le coach en signale une, sinon chaîne vide."),
        evolution: text("Comparaison avec ses tentatives précédentes si le coach en parle, sinon chaîne vide."),
      },
      required: ["figure", "figure_id", "note", "resume", "priorite_session", "visibilite", "phases", "erreurs", "points_forts", "drills", "rappels", "securite", "evolution"],
    },
  };
}

/**
 * Transforme le compte rendu brut d'un coach (notes en vrac, dictée…) en retour structuré et propre.
 * Le coach relit et corrige avant publication : l'IA reformule, elle n'ajoute rien.
 */
export async function structureCoachReport(
  coachId: string,
  sport: SportId,
  ctx: { figure: string; figureId: string; riderQuestion: string; riderLevel: string | null; previous: string[] },
  draft: string,
): Promise<ReviewDraft> {
  const S = SPORTS[sport];
  const system = `Tu es l'assistant de rédaction des moniteurs diplômés d'État de RIDE'UP, spécialistes du ${S.name.toLowerCase()}.
Un moniteur a regardé la vidéo d'un rider et a écrit son compte rendu en vrac. Ta mission : le transformer en retour clair, bien rangé et agréable à lire pour le rider.

Règles :
- Fidélité absolue : garde le diagnostic, les corrections et les exercices du coach. N'ajoute aucune erreur, aucun conseil ni aucune phase dont il ne parle pas.
- Tutoie le rider, phrases courtes et concrètes, ton bienveillant et motivant, vocabulaire technique du coach conservé.
- Corrige l'orthographe et la grammaire, supprime les tics de langage et les répétitions.
- Classe les erreurs de la plus importante à la moins importante et choisis le code d'erreur le plus proche.
- Si une information manque (note de phase, rappels, sécurité, évolution), laisse le champ vide ou null : ne l'invente pas.
- Phases de la figure pour ce sport : approche = « ${S.phases.approche} », appel = « ${S.phases.appel} », vol = « ${S.phases.vol} », reception = « ${S.phases.reception} ».`;
  const content = `Figure annoncée : ${ctx.figure || "non précisée"}${ctx.figureId ? ` (id ${ctx.figureId})` : ""}
Niveau du rider : ${ctx.riderLevel ?? "non précisé"}
Question du rider : « ${ctx.riderQuestion} »
${ctx.previous.length ? `Ses derniers retours :\n${ctx.previous.map((p) => `- ${p}`).join("\n")}\n` : ""}
Compte rendu du coach :
"""
${draft}
"""`;
  const { input } = await callWithTool(coachId, "compte_rendu", { system, max_tokens: 2500, tool: reportTool(sport), content });
  return normalizeDraft(input, { tricks: tricksFor(sport).map((t) => t.id), codes: [...Object.keys(errorsFor(sport)), "autre"] });
}
