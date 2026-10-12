import type { Metadata } from "next";
import { LegalPage, Todo } from "@/components/legal-page";

export const metadata: Metadata = { title: "Conditions générales d'utilisation" };

export default function Page() {
  return (
    <LegalPage title="Conditions générales d'utilisation">
      <h2>Le service</h2>
      <p>
        RIDE&apos;UP propose un accompagnement en ligne pour progresser en sports de glisse (kitesurf, wingfoil, foil, surf, wakeboard) : analyse de vidéos par
        intelligence artificielle, roadmap de figures et coach conversationnel. Les conseils fournis sont
        indicatifs et ne remplacent pas un enseignement encadré par un moniteur diplômé.
      </p>
      <h2>Sécurité</h2>
      <p>
        Les sports de glisse sont des sports à risques. L&apos;utilisateur reste seul juge des conditions de pratique (vent,
        mer, matériel, niveau) et seul responsable de sa sécurité et de celle des tiers.
      </p>
      <h2>Compte</h2>
      <p>
        L&apos;utilisateur s&apos;engage à fournir une adresse e-mail valide et à garder son mot de passe
        confidentiel. Il peut supprimer son compte à tout moment en écrivant à <Todo>e-mail de contact</Todo>.
      </p>
      <h2>Abonnements</h2>
      <p>
        Les abonnements Standard et Premium sont mensuels, sans engagement, payés via Stripe. La résiliation prend
        effet à la fin de la période en cours. Conformément à l&apos;article L221-28 du Code de la consommation,
        l&apos;utilisateur qui accède immédiatement au service renonce à son droit de rétractation.
      </p>
      <h2>Contenus envoyés</h2>
      <p>
        L&apos;utilisateur garantit disposer des droits sur les vidéos qu&apos;il envoie, y compris
        l&apos;accord des personnes filmées. Les vidéos ne sont utilisées que pour produire son analyse.
      </p>
      <h2>Droit applicable</h2>
      <p>Les présentes conditions sont soumises au droit français.</p>
    </LegalPage>
  );
}
