import type { Metadata } from "next";
import { LegalPage, Todo } from "@/components/legal-page";

export const metadata: Metadata = { title: "Mentions légales" };

export default function Page() {
  return (
    <LegalPage title="Mentions légales">
      <h2>Éditeur</h2>
      <p>
        <Todo>Nom ou raison sociale</Todo>, <Todo>statut (micro-entreprise, SAS…)</Todo>, SIRET{" "}
        <Todo>numéro</Todo>, <Todo>adresse</Todo>. Contact : <Todo>e-mail</Todo>.
      </p>
      <h2>Directeur de la publication</h2>
      <p>
        <Todo>Nom</Todo>.
      </p>
      <h2>Hébergement</h2>
      <p>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, États-Unis.</p>
      <p>Base de données et fichiers : Supabase Inc., hébergement dans l&apos;Union européenne.</p>
      <h2>Propriété intellectuelle</h2>
      <p>
        Les contenus du site (textes, logo, cours) sont la propriété de l&apos;éditeur. Toute reproduction sans
        autorisation est interdite.
      </p>
    </LegalPage>
  );
}
