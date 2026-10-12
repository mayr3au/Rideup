import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { updatePassword } from "../actions";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default function NewPasswordPage() {
  return (
    <>
      <h1 className="text-4xl font-bold">Choisis un nouveau mot de passe</h1>
      <div className="mt-8">
        <AuthForm
          action={updatePassword}
          submitLabel="Enregistrer le mot de passe"
          pendingLabel="Enregistrement…"
          fields={[
            { name: "password", label: "Nouveau mot de passe", type: "password", autoComplete: "new-password" },
            { name: "confirm", label: "Confirme le mot de passe", type: "password", autoComplete: "new-password" },
          ]}
        />
      </div>
    </>
  );
}
