import type { Course } from "./course-types";
import { COURSES_FOIL } from "./courses/foil";
import { COURSES_KITESURF } from "./courses/kitesurf";
import { COURSES_SURF } from "./courses/surf";
import { COURSES_WAKEBOARD } from "./courses/wakeboard";
import { COURSES_WINGFOIL } from "./courses/wingfoil";
import { LESSONS } from "./lessons";
import { trickById, type SportId } from "./sports";

export type { Course } from "./course-types";

/** Tous les cours « figure par figure », dans l'ordre des roadmaps. */
export const COURSES: Course[] = [...COURSES_KITESURF, ...COURSES_WINGFOIL, ...COURSES_FOIL, ...COURSES_SURF, ...COURSES_WAKEBOARD];

export function courseBySlug(slug: string) {
  return COURSES.find((c) => c.slug === slug);
}

/** Cours (figure) ou leçon (fondamentaux) qui enseigne cette figure de la roadmap. */
export function courseForTrick(trickId: string): { slug: string; title: string } | undefined {
  return COURSES.find((c) => c.trickId === trickId) ?? LESSONS.find((l) => l.trickId === trickId);
}

/** Sport d'un cours, déduit de la figure qu'il enseigne. */
export function courseSport(c: Course): SportId {
  return trickById(c.trickId)?.sport ?? "kitesurf";
}
