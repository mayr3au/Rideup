import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { requestPasswordReset } from "../actions";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function ForgotPage() {
  return (
    <>
      <h1 className="text-4xl font-bold">Mot de passe oublié</h1>
      <p className="mt-2 text-slate">On t&apos;envoie un lien pour en choisir un nouveau.</p>
      <div className="mt-8">
        <AuthForm
          action={requestPasswordReset}
          submitLabel="Envoyer le lien"
          pendingLabel="Envoi…"
          fields={[{ name: "email", label: "E-mail", type: "email", autoComplete: "email" }]}
        />
      </div>
      <Link href="/connexion" className="mt-6 inline-block text-lagoon hover:underline">
        Retour à la connexion
      </Link>
    </>
  );
}
