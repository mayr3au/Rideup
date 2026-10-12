import Link from "next/link";
import { Logo } from "@/components/logo";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col justify-center px-4">
      <Logo />
      <h1 className="mt-10 text-3xl font-extrabold sm:text-4xl">Page introuvable</h1>
      <p className="mt-3 text-lg text-slate">Ce lien ne mène nulle part. Le vent a dû tourner.</p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="btn btn-primary">Retour à l&apos;accueil</Link>
        <Link href="/dashboard" className="btn btn-ghost">Mon espace</Link>
      </div>
    </div>
  );
}
