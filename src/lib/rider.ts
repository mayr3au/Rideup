import { disciplineName, type SportDetails } from "./rider-details";
import { isSport, parseSizes, SPORTS, type Level, type SportId } from "./sports";
import type { Profile } from "./types";

/** Sports pratiqués par le rider (au moins son sport actif). */
export function riderSports(profile: Pick<Profile, "sport" | "sports">): SportId[] {
  const list = (profile.sports ?? []).filter(isSport);
  const active = isSport(profile.sport) ? profile.sport : "kitesurf";
  return list.includes(active) ? list : [active, ...list];
}

export function activeSport(profile: Pick<Profile, "sport">, wanted?: string | null): SportId {
  if (isSport(wanted)) return wanted;
  return isSport(profile.sport) ? profile.sport : "kitesurf";
}

export function levelFor(profile: Pick<Profile, "levels">, sport: SportId): Level | null {
  return profile.levels?.[sport] ?? null;
}

export function gearFor(profile: Pick<Profile, "gear">, sport: SportId): string {
  return profile.gear?.[sport] ?? "";
}

export function detailsFor(profile: Pick<Profile, "details">, sport: SportId): SportDetails {
  return profile.details?.[sport] ?? {};
}

export function disciplineFor(profile: Pick<Profile, "details">, sport: SportId) {
  return disciplineName(sport, detailsFor(profile, sport).discipline);
}

/** Tailles d'ailes/kites : le quiver structuré d'abord, sinon les nombres du texte libre. */
export function gearSizes(profile: Pick<Profile, "gear" | "details">, sport: SportId) {
  const ailes = detailsFor(profile, sport).quiver?.ailes;
  if (ailes?.length) return [...ailes].sort((a, b) => a - b);
  return parseSizes(sport, gearFor(profile, sport));
}

export function sportName(sport: SportId) {
  return SPORTS[sport].name;
}
