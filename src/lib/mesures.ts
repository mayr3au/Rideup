/** Mesures automatiques d'une tentative, issues du suivi image par image (kite, rider, planche). */
export type Mesures = {
  /** Part des images où le kite / le rider ont été détectés (0-1) */
  couverture: { kite: number; rider: number };
  /** Temps en l'air (s), hauteur max en « tailles de rider », instants de décollage et de réception (s du clip) */
  saut: { tempsEnAir: number; hauteur: number; decollage: number; reception: number } | null;
  /** Boucle du kite autour du rider : nombre de tours et sens */
  boucle: { tours: number; sens: "horaire" | "antihoraire" } | null;
  /** Angle apparent du kite au-dessus de l'horizon (0° = au ras de l'eau, 90° = zénith) */
  kite: { decollage: number | null; reception: number | null; max: number } | null;
};

const fr = (n: number, d = 1) => n.toLocaleString("fr-FR", { maximumFractionDigits: d, minimumFractionDigits: d });

/** Résumé lisible des mesures, pour l'IA et pour l'affichage. */
export function mesuresLignes(m: Mesures): { label: string; valeur: string }[] {
  const out: { label: string; valeur: string }[] = [];
  if (m.saut) {
    out.push({ label: "Temps en l'air", valeur: `${fr(m.saut.tempsEnAir)} s` });
    out.push({ label: "Hauteur", valeur: `≈ ${fr(m.saut.hauteur)} × ta taille` });
  }
  if (m.boucle) {
    out.push({
      label: "Boucle du kite",
      valeur: `${m.boucle.tours >= 1.8 ? `${Math.round(m.boucle.tours)} tours` : "1 tour complet"} (${m.boucle.sens})`,
    });
  }
  if (m.kite) {
    if (m.kite.decollage != null) out.push({ label: "Kite au décollage", valeur: `${Math.round(m.kite.decollage)}°` });
    if (m.kite.reception != null) out.push({ label: "Kite à la réception", valeur: `${Math.round(m.kite.reception)}°` });
  }
  return out;
}
