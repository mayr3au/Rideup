import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { LEVELS, TRICKS, trickById } from "@/lib/tricks";
import type { AnalysisResult, Profile, TrickProgress } from "@/lib/types";

let client: Anthropic | null = null;
function anthropic() {
  if (!client) client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  return client;
}

const MODEL = process.env.ANTHROPIC_MODEL || "claude-sonnet-5-5";

function riderContext(profile: Profile, progress: TrickProgress[] = []) {
  const level = LEVELS.find((l) => l.id === profile.level)?.label ?? "non renseigné";
  const done = progress.filter((p) => p.status === "valide").map((p) => trickById(p.trick_id)?.name).filter(Boolean);
  const working = progress.filter((p) => p.status === "en-cours").map((p) => trickById(p.trick_id)?.name).filter(Boolean);
  return [
    `Prénom : ${profile.full_name || "inconnu"}`,
    `Niveau déclaré : ${level}`,
    `Pratique : ${profile.discipline ?? "non renseignée"}`,
    `Stance : ${profile.stance ?? "non renseignée"}`,
    `Spot habituel : ${profile.home_spot || "non renseigné"}`,
    `Matériel : ${profile.quiver || "non renseigné"}`,
    `Objectifs : ${profile.goals || "non renseignés"}`,
    `Figures validées : ${done.length ? done.join(", ") : "aucune"}`,
    `Figures en cours : ${working.length ? working.join(", ") : "aucune"}`,
  ].join("\n");
}

const COACH_RULES = `Tu es le coach de kitesurf de RIDE'UP. Tu parles français, tu tutoies, ton ton est direct et encourageant, comme un moniteur expérimenté sur la plage.
Règles :
- Réponds de façon concrète et courte : des consignes que le rider peut appliquer à sa prochaine session.
- Adapte-toi au niveau et à l'historique du rider ci-dessous.
- La sécurité passe avant tout : si la question touche à des conditions dangereuses (vent offshore, rafales fortes, orage, spot inconnu, matériel abîmé, figure trop avancée pour le niveau), dis-le clairement et conseille l'option prudente ou un moniteur.
- Tu ne donnes pas de prévisions météo en temps réel : renvoie vers les sources de prévision et l'avis des locaux.
- Hors kitesurf et sports de glisse, recentre poliment la conversation.
- Pas de titres markdown. Tu peux utiliser des listes courtes et du gras.`;

export async function coachReply(
  profile: Profile,
  progress: TrickProgress[],
  history: { role: "user" | "assistant"; content: string }[],
) {
  const res = await anthropic().messages.create({
    model: MODEL,
    max_tokens: 900,
    system: `${COACH_RULES}\n\nProfil du rider :\n${riderContext(profile, progress)}`,
    messages: history,
  });
  return res.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("\n")
    .trim();
}

const ANALYSIS_TOOL: Anthropic.Tool = {
  name: "rapport_analyse",
  description: "Rapport d'analyse d'une figure de kitesurf à partir d'images extraites d'une vidéo.",
  input_schema: {
    type: "object",
    properties: {
      figure: { type: "string", description: "Figure identifiée ou tentée." },
      note: { type: "integer", minimum: 1, maximum: 10, description: "Note d'exécution sur 10." },
      resume: { type: "string", description: "Résumé en 2 phrases de ce qui se passe." },
      points_forts: { type: "array", items: { type: "string" }, maxItems: 3 },
      erreurs: {
        type: "array",
        maxItems: 4,
        description: "Erreurs par ordre d'importance.",
        items: {
          type: "object",
          properties: {
            probleme: { type: "string" },
            correction: { type: "string" },
          },
          required: ["probleme", "correction"],
        },
      },
      drills: { type: "array", items: { type: "string" }, maxItems: 4, description: "Exercices pour la prochaine session." },
      securite: {
        type: ["string", "null"],
        description: "Alerte sécurité si quelque chose de dangereux est visible, sinon null.",
      },
    },
    required: ["figure", "note", "resume", "points_forts", "erreurs", "drills", "securite"],
  },
};

export async function analyseFrames(opts: {
  profile: Profile;
  frames: string[]; // JPEG en base64, dans l'ordre chronologique
  trickId?: string | null;
  notes?: string | null;
}): Promise<AnalysisResult> {
  const trick = opts.trickId ? trickById(opts.trickId) : undefined;
  const intro = [
    `Voici ${opts.frames.length} images extraites à intervalles réguliers d'un clip de kitesurf, dans l'ordre chronologique.`,
    trick
      ? `Le rider dit tenter : ${trick.name}. Points clés de cette figure : ${trick.keys.join(" ; ")}.`
      : "Le rider n'a pas précisé la figure : identifie-la.",
    opts.notes ? `Ce qui coince selon lui : « ${opts.notes} »` : "",
    "Analyse la carre et la vitesse avant l'envoi, la position du kite, le pop, la position du corps et du regard en l'air, la réception.",
    "Si les images ne permettent pas de juger un point (rider trop loin, kite hors cadre), dis-le dans le résumé au lieu d'inventer.",
    "Réponds avec l'outil rapport_analyse, en français, en tutoyant.",
  ]
    .filter(Boolean)
    .join("\n");

  const content: Anthropic.ContentBlockParam[] = [{ type: "text", text: intro }];
  opts.frames.forEach((data, i) => {
    content.push({ type: "text", text: `Image ${i + 1}` });
    content.push({ type: "image", source: { type: "base64", media_type: "image/jpeg", data } });
  });

  const res = await anthropic().messages.create({
    model: MODEL,
    max_tokens: 1500,
    system: `${COACH_RULES}\n\nProfil du rider :\n${riderContext(opts.profile)}`,
    tools: [ANALYSIS_TOOL],
    tool_choice: { type: "tool", name: ANALYSIS_TOOL.name },
    messages: [{ role: "user", content }],
  });

  const block = res.content.find((b) => b.type === "tool_use");
  if (!block || block.type !== "tool_use") throw new Error("Réponse d'analyse vide");
  return block.input as AnalysisResult;
}

export const TRICK_IDS = TRICKS.map((t) => t.id);
