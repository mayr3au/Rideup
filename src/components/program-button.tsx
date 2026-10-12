"use client";

import { useActionState } from "react";
import { createProgram, type ProgramState } from "@/app/(app)/progression/actions";

export function ProgramButton({ label }: { label: string }) {
  const [state, action, pending] = useActionState<ProgramState>(createProgram, undefined);
  return (
    <form action={action}>
      <button disabled={pending} className="btn btn-kite">
        {pending ? "Création du programme… (20 s environ)" : label}
      </button>
      {state?.error && <p role="alert" className="mt-2 text-danger">{state.error}</p>}
    </form>
  );
}
