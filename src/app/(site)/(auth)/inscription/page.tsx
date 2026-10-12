import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { signUp } from "../actions";

export const metadata: Metadata = { title: "Créer un compte" };

export default function SignupPage() {
  return (
    <>
      <h1 className="text-4xl font-bold">Crée ton compte</h1>
      <p className="mt-2 text-slate">Ta première analyse vidéo est offerte, sans carte bancaire.</p>
      <div className="mt-8">
        <AuthForm
          action={signUp}
          submitLabel="Créer mon compte"
          pendingLabel="Création du compte…"
          fields={[
            { name: "full_name", label: "Prénom", autoComplete: "given-name" },
            { name: "email", label: "E-mail", type: "email", autoComplete: "email" },
            { name: "password", label: "Mot de passe (8 caractères minimum)", type: "password", autoComplete: "new-password" },
          ]}
        >
          <label className="flex items-start gap-2 text-[0.95rem]">
            <input type="checkbox" name="cgu" className="mt-1 h-4 w-4 accent-[var(--lagoon)]" />
            <span>
              J&apos;accepte les{" "}
              <Link href="/cgu" className="text-lagoon underline">
                CGU
              </Link>{" "}
              et la{" "}
              <Link href="/confidentialite" className="text-lagoon underline">
                politique de confidentialité
              </Link>
              .
            </span>
          </label>
        </AuthForm>
      </div>
      <p className="mt-6 text-[0.95rem]">
        Déjà un compte ?{" "}
        <Link href="/connexion" className="text-lagoon hover:underline">
          Se connecter
        </Link>
      </p>
    </>
  );
}
