import type { Metadata } from "next";
import { LegalPage, Todo } from "@/components/legal-page";

export const metadata: Metadata = { title: "Politique de confidentialité" };

export default function Page() {
  return (
    <LegalPage title="Politique de confidentialité">
      <h2>Données collectées</h2>
      <p>
        Adresse e-mail et prénom (compte), informations de pratique que tu renseignes (niveau, matériel, objectifs),
        vidéos envoyées et leurs analyses, messages échangés avec le coach. Les paiements sont traités par Stripe :
        RIDE&apos;UP ne voit jamais ton numéro de carte.
      </p>
      <h2>Pourquoi</h2>
      <p>
        Fournir le service (analyses, roadmap, coach), gérer ton abonnement et assurer la sécurité de la plateforme.
      </p>
      <h2>Sous-traitants</h2>
      <p>
        Supabase (base de données et stockage), Vercel (hébergement), Stripe (paiement), Anthropic (analyse des images
        extraites de tes vidéos et réponses du coach). Ces prestataires n&apos;utilisent pas tes données à leurs
        propres fins.
      </p>
      <h2>Durée de conservation</h2>
      <p>Tant que ton compte est actif, puis suppression sous 30 jours après sa fermeture.</p>
      <h2>Tes droits</h2>
      <p>
        Accès, rectification, suppression, portabilité et opposition : écris à <Todo>e-mail de contact</Todo>. Tu
        peux aussi saisir la CNIL.
      </p>
    </LegalPage>
  );
}
