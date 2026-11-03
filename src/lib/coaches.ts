import type { SportId } from "@/lib/sports";

/**
 * L'équipe de coachs mise en avant sur le site. Pour ajouter un coach : déposer sa photo dans public/coachs/,
 * puis ajouter une entrée ici. Un coach sans nom n'est pas affiché.
 * `instagram` = identifiant sans @ (lien vers ses coachings privés).
 */
export type TeamCoach = {
  name: string;
  sports: SportId[];
  /** Ligne sous le nom : diplôme, spécialité, sponsor… */
  title: string;
  bio: string;
  instagram: string;
  photo: string;
  /** Cadrage de la photo (object-position) */
  pos?: string;
};

export const TEAM: TeamCoach[] = [
  {
    name: "Anil Garnier",
    sports: ["kitesurf", "foil"],
    title: "Kitefoil & big air · team Eleveight",
    bio: "Top 11 Young World Kite Foil. Kitefoileur dans l'âme, big air dans le cœur : il t'aide à voler plus haut et plus propre.",
    instagram: "anil_garnier",
    photo: "/coachs/coach-kite.jpg",
    pos: "50% 30%",
  },
  {
    name: "Endy Beltrame",
    sports: ["wakeboard"],
    title: "Wakeboard câble",
    bio: "Kickers, modules et premiers inverts : il te fait progresser à chaque tour de câble.",
    instagram: "endy_beltrame",
    photo: "/coachs/coach-wake.jpg",
    pos: "50% 25%",
  },
];

export const instagramUrl = (handle: string) => `https://www.instagram.com/${handle.replace(/^@/, "")}/`;
