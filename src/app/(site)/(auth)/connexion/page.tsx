import Link from "next/link";
import type { Metadata } from "next";
import { AuthForm } from "@/components/auth-form";
import { signIn } from "../actions";

export const metadata: Metadata = { title: "Connexion" };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; erreur?: string }> }) {
  const { next, erreur } = await searchParams;
  return (
    <>
      <h1 className="text-4xl font-bold">Content de te revoir</h1>
      <p className="mt-2 text-slate">Connecte-toi pour retrouver ta roadmap et tes analyses.</p>
      {erreur && (
        <p role="alert" className="mt-4 text-danger">
          Le lien utilisé n&apos;est plus valide. Connecte-toi ou redemande un e-mail.
        </p>
      )}
      <div className="mt-8">
        <AuthForm
          action={signIn}
          hidden={next ? { next } : undefined}
          submitLabel="Se connecter"
          pendingLabel="Connexion…"
          fields={[
            { name: "email", label: "E-mail", type: "email", autoComplete: "email" },
            { name: "password", label: "Mot de passe", type: "password", autoComplete: "current-password" },
          ]}
        />
      </div>
      <div className="mt-6 flex flex-wrap justify-between gap-2 text-[0.95rem]">
        <Link href="/mot-de-passe-oublie" className="text-lagoon hover:underline">
          Mot de passe oublié ?
        </Link>
        <Link href="/inscription" className="text-lagoon hover:underline">
          Créer un compte
        </Link>
      </div>
    </>
  );
}
