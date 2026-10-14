"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60dvh] max-w-md flex-col items-center justify-center px-5 text-center">
      <p className="text-sm font-semibold text-brand">Oups</p>
      <h1 className="mt-1 text-3xl font-bold">Quelque chose a cassé</h1>
      <p className="mt-3 text-slate">
        Ce n&apos;est pas toi. Réessaie, et si ça persiste, reviens dans quelques minutes.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        <button onClick={reset} className="btn btn-primary">Réessayer</button>
        <Link href="/dashboard" className="btn btn-ghost">Mon espace</Link>
      </div>
      {error.digest && <p className="mt-6 text-xs text-slate">Référence : {error.digest}</p>}
    </div>
  );
}
