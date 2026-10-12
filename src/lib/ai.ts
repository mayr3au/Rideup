import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { createAdminClient } from "@/lib/supabase/admin";
import { ERROR_CODES, LEVELS, TRICKS, trickById, errorLabel } from "@/lib/tricks";
import type { AnalysisResult, Profile, Program, TrickProgress } from "@/lib/types";

let client: Anthropic | null = null;
function anthropic() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

export const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";
// Tarifs en $ par million de tokens (Claude Sonnet 5.5 : 2 $ en entrée, 10 $ en sortie).
const PRICE_IN = Number(process.env.AI_PRICE_INPUT_PER_MTOK ?? 2);
const PRICE_OUT = Number(process.env.AI_PRICE_OUTPUT_PER_MTOK ?? 10);

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

/* ───────────────────────── Contexte rider ───────────────────────── */

export type RiderHistory = {
  progress: TrickProgress[];
  recurringErrors: { code: string; count: number }[];
};

function riderContext(profile: Profile, history?: RiderHistory) {
  const level = LEVELS.find((l) => l.id === profile.level)?.label ?? "non renseigné";
  const progress = history?.progress ?? [];
  const names = (s: string) =>
    progress.filter((p) => p.status === s).map((p) => trickById(p.trick_id)?.name).filter(Boolean).join(", ") || "aucune";
  const lines = [
    `Prénom : ${profile.full_name || "inconnu"}`,
    `Niveau déclaré : ${level}`,
    `Pratique : ${profile.discipline ?? "non renseignée"} · stance ${profile.stance ?? "?"}`,
    `Poids : ${profile.weight_kg ? `${profile.weight_kg} kg` : "non renseigné"}`,
    `Matériel : ${profile.quiver || "non renseigné"}`,
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

const COACH_RULES = `Tu es le coach de kitesurf de RIDE'UP, moniteur expérimenté spécialisé dans la technique (freeride, sauts, freestyle hooké et unhooked). Tu parles français et tu tutoies.
Ton expertise : lecture de la fenêtre de vent, gestion de la carre et de la vitesse, timing de l'envoi du kite, pop, position de la barre, rotations (backroll, frontroll, kiteloop), unhooked (raley, S-bend, passes), réceptions.
Règles :
- Concret et actionnable : ce que le rider doit faire différemment à sa prochaine session, avec des repères corporels (« regarde ton épaule arrière », « barre au nombril »).
- Adapte tout au niveau, au poids, au matériel et à l'historique du rider.
- La sécurité passe avant tout : vent offshore, rafales, orage, spot inconnu, matériel abîmé, figure trop avancée pour le niveau → dis-le clairement et conseille l'option prudente ou un moniteur.
- Tu ne donnes pas de prévisions météo : renvoie vers le Spot Finder de RIDE'UP.
- Hors kitesurf, recentre poliment.
- Pas de titres markdown. Listes courtes et gras autorisés.`;

/* ───────────────────────── Coach ───────────────────────── */

export async function coachReply(
  profile: Profile,
  history: RiderHistory,
  messages: { role: "user" | "assistant"; content: string }[],
) {
  const res = await anthropic().messages.create({
    model: MODEL,
    max_tokens: 900,
    system: `${COACH_RULES}\n\nProfil du rider :\n${riderContext(profile, history)}`,
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

const CODES = Object.keys(ERROR_CODES);

function analysisTool(withEvolution: boolean): Anthropic.Tool {
  return {
    name: "rapport_analyse",
    description: "Rapport technique d'une tentative de figure de kitesurf.",
    input_schema: {
      type: "object",
      properties: {
        figure: { type: "string", description: "Nom de la figure tentée ou identifiée." },
        figure_id: {
          type: ["string", "null"],
          enum: [...TRICKS.map((t) => t.id), null],
          description: "Identifiant de la figure dans la roadmap, ou null si aucune ne correspond.",
        },
        note: { type: "integer", minimum: 1, maximum: 10, description: "Note d'exécution globale." },
        visibilite: {
          type: "string",
          enum: ["bonne", "partielle", "faible"],
          description: "Qualité de ce qui est visible (rider trop loin, kite hors cadre, contre-jour…).",
        },
        resume: { type: "string", description: "2 à 3 phrases : ce qui se passe et le point décisif." },
        phases: {
          type: "array",
          description: "Une entrée par phase visible.",
          items: {
            type: "object",
            properties: {
              phase: { type: "string", enum: ["approche", "appel", "vol", "reception"] },
              note: { type: "integer", minimum: 1, maximum: 10 },
              commentaire: { type: "string" },
            },
            required: ["phase", "note", "commentaire"],
          },
        },
        points_forts: { type: "array", items: { type: "string" }, maxItems: 4 },
        erreurs: {
          type: "array",
          maxItems: 5,
          description: "Erreurs visibles, de la plus importante à la moins importante.",
          items: {
            type: "object",
            properties: {
              code: { type: "string", enum: CODES },
              probleme: { type: "string", description: "Ce qui est visible, avec le moment (ex. « image 7 »)." },
              correction: { type: "string", description: "Consigne concrète pour corriger." },
              gravite: { type: "string", enum: ["majeure", "moyenne", "mineure"] },
            },
            required: ["code", "probleme", "correction", "gravite"],
          },
        },
        drills: { type: "array", items: { type: "string" }, maxItems: 4, description: "Exercices précis pour la prochaine session." },
        priorite_session: { type: "string", description: "LA chose à travailler en priorité à la prochaine session, en une phrase." },
        securite: { type: ["string", "null"], description: "Alerte sécurité si quelque chose de dangereux est visible, sinon null." },
        ...(withEvolution
          ? {
              evolution: {
                type: ["string", "null"],
                description: "Comparaison avec les tentatives précédentes : ce qui s'améliore, ce qui persiste. null si pas d'historique.",
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
  history: RiderHistory;
  sheets: string[]; // planches JPEG base64 (grilles 4×3 numérotées)
  frameTimes: number[]; // horodatage (s) de chaque image dans le clip
  trickId?: string | null;
  notes?: string | null;
  deep: boolean;
  maxTokens: number;
  previous?: PreviousAttempt[];
}): Promise<{ result: AnalysisResult; cost: number }> {
  const trick = opts.trickId ? trickById(opts.trickId) : undefined;
  const n = opts.frameTimes.length;
  const span = n > 1 ? opts.frameTimes[n - 1] - opts.frameTimes[0] : 0;

  const intro = [
    `Tu reçois ${opts.sheets.length} planche(s) contenant ${n} images numérotées (1 à ${n}), extraites à intervalle régulier d'un passage de ${span.toFixed(1)} s choisi par le rider. Ordre de lecture : de gauche à droite puis de haut en bas, planche après planche.`,
    trick
      ? `Le rider dit tenter : ${trick.name}. Points clés attendus : ${trick.keys.join(" ; ")}.`
      : "Le rider n'a pas précisé la figure : identifie-la à partir du mouvement.",
    opts.notes ? `Ce qui coince selon lui : « ${opts.notes} ».` : "",
    "Analyse comme un moniteur : vitesse et carre à l'approche, timing et amplitude de l'envoi du kite, pop, position de la barre et des bras, regard et épaules pendant la rotation, position de la planche, renvoi du kite et réception.",
    "Ne décris pas la vidéo de façon générique : chaque erreur doit être un point technique précis, rattaché à une image ou à une phase.",
    "Si un élément n'est pas visible (rider trop loin, kite hors cadre), ne l'invente pas : baisse « visibilite » et dis-le dans le résumé.",
    opts.deep
      ? "Analyse approfondie : sois exhaustif sur chaque phase, explique la cause de chaque erreur (pas seulement le symptôme) et l'enchaînement entre elles."
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

  const tool = analysisTool(Boolean(opts.previous?.length));
  const res = await anthropic().messages.create({
    model: MODEL,
    max_tokens: opts.maxTokens,
    system: `${COACH_RULES}\n\nProfil du rider :\n${riderContext(opts.profile, opts.history)}`,
    tools: [tool],
    tool_choice: { type: "tool", name: tool.name },
    messages: [{ role: "user", content }],
  });

  const cost = await recordUsage(opts.profile.id, "analyse", res.usage);
  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") throw new Error("Réponse d'analyse vide");

  const result = block.input as AnalysisResult;
  result.erreurs = (result.erreurs ?? []).map((e) => ({ ...e, code: CODES.includes(e.code) ? e.code : "autre" }));
  if (result.figure_id && !trickById(result.figure_id)) result.figure_id = null;
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

export async function generateProgram(profile: Profile, history: RiderHistory, recent: (PreviousAttempt & { figure?: string })[]) {
  const res = await anthropic().messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: `${COACH_RULES}\n\nProfil du rider :\n${riderContext(profile, history)}`,
    tools: [PROGRAM_TOOL],
    tool_choice: { type: "tool", name: PROGRAM_TOOL.name },
    messages: [
      {
        role: "user",
        content: `Construis un programme de 3 à 5 sessions pour faire progresser ce rider vers son objectif, en s'attaquant d'abord à ses erreurs récurrentes. Chaque session doit être faisable sur l'eau en 1 h 30 à 2 h, avec des exercices progressifs et sûrs pour son niveau.\n\nDernières analyses :\n${
          recent.length
            ? recent.map((r) => `- ${r.date} ${r.figure ?? ""} : ${r.note}/10, erreurs ${r.codes.map(errorLabel).join(", ") || "aucune"}`).join("\n")
            : "aucune"
        }`,
      },
    ],
  });
  await recordUsage(profile.id, "programme", res.usage);
  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") throw new Error("Programme vide");
  return block.input as Program;
}
