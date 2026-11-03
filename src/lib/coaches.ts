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
    sports: ["kitesurf", "foil", "wingfoil", "surf"],
    title: "Moniteur diplômé d'État · team Eleveight",
    bio: "Top 11 Young World Kite Foil, spécialiste du big air. Kite, foil, wing ou surf : il t'aide à voler plus haut et plus propre.",
    instagram: "anil_garnier",
    photo: "/coachs/coach-kite.jpg",
    pos: "50% 30%",
  },
  {
    name: "Endy Beltrame",
    sports: ["wakeboard"],
    title: "Moniteur diplômé d'État · wakeboard câble",
    bio: "Kickers, modules et premiers inverts : il te fait progresser à chaque tour de câble.",
    instagram: "endy_beltrame",
    photo: "/coachs/coach-endy.jpg",
    pos: "50% 40%",
  },
  {
    name: "Yann Sassa",
    sports: ["wakeboard"],
    title: "Wakeboarder pro · créateur du Sassa roll",
    bio: "Il a inventé le Sassa roll, la figure qui porte son nom. Rider pro français, il t'emmène au niveau supérieur sur les kickers et les modules.",
    instagram: "yann.sassa",
    photo: "/coachs/coach-yann.jpg",
    pos: "50% 30%",
  },
];

export const instagramUrl = (handle: string) => `https://www.instagram.com/${handle.replace(/^@/, "")}/`;
