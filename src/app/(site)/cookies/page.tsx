import type { Metadata } from "next";
import { LegalPage } from "@/components/legal-page";

export const metadata: Metadata = { title: "Cookies" };

export default function Page() {
  return (
    <LegalPage title="Cookies">
      <p>
        RIDE&apos;UP n&apos;utilise que les cookies nécessaires au fonctionnement du site : ceux qui te gardent
        connecté et ceux de Stripe pendant le paiement. Aucun cookie publicitaire ni de mesure d&apos;audience
        n&apos;est déposé, c&apos;est pourquoi aucun bandeau de consentement n&apos;est affiché.
      </p>
    </LegalPage>
  );
}
