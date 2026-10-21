import type { SchemaId } from "@/components/schemas";

/** Phases notées par l'analyse vidéo (mêmes clés que dans sports.ts). */
export type Phase = "approche" | "appel" | "vol" | "reception";

export type Course = {
  /** Identifiant dans l'URL /cours/<slug> */
  slug: string;
  /** Figure de la roadmap (sports.ts) */
  trickId: string;
  title: string;
  /** « Débutant », « Intermédiaire », « Avancé », « Expert » */
  level: string;
  /** Temps de lecture */
  minutes: number;
  /** 1 à 2 phrases : l'idée clé de la figure */
  intro: string;
  /** Conditions idéales pour l'apprendre (vent, vagues, module…) */
  conditions?: string;
  prerequis: string[];
  /** Le repère unique à garder en tête pour chaque phase (≤ 10 mots) */
  phases?: { phase: Phase; cle: string }[];
  /** Schéma illustrant la figure */
  schema?: SchemaId;
  etapes: { titre: string; texte: string }[];
  erreurs: { erreur: string; correction: string }[];
  exercices: string[];
  /** Comment filmer pour que l'analyse IA soit utile */
  filmer?: string;
  securite: string;
  retenir?: string[];
  quiz?: { q: string; a: string }[];
};
