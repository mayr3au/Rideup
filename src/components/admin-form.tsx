"use client";

import { useActionState } from "react";
import type { AdminState } from "@/app/(app)/admin/actions";

export function AdminForm({
  action,
  submitLabel,
  children,
  className,
}: {
  action: (s: AdminState, f: FormData) => Promise<AdminState>;
  submitLabel: string;
  children: React.ReactNode;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  return (
    <form action={formAction} className={className}>
      {children}
      {state?.error && <p role="alert" className="mt-3 text-danger">{state.error}</p>}
      {state?.ok && <p role="status" className="mt-3 text-lagoon">{state.ok}</p>}
      <button disabled={pending} className="btn btn-primary mt-4">{pending ? "Enregistrement…" : submitLabel}</button>
    </form>
  );
}
