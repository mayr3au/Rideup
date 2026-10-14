"use client";

import { useActionState, useState } from "react";
import type { FormState } from "@/app/(site)/(auth)/actions";

type Field = {
  name: string;
  label: string;
  type?: string;
  autoComplete?: string;
};

export function AuthForm({
  action,
  fields,
  submitLabel,
  pendingLabel,
  hidden,
  children,
}: {
  action: (state: FormState, formData: FormData) => Promise<FormState>;
  fields: Field[];
  submitLabel: string;
  pendingLabel: string;
  hidden?: Record<string, string>;
  children?: React.ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, undefined);
  const [showPassword, setShowPassword] = useState(false);

  if (state?.message) {
    return (
      <div role="status" className="panel p-5">
        <p className="text-lg font-bold">C&apos;est presque bon</p>
        <p className="mt-1">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-4">
      {hidden &&
        Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {fields.map((f) => (
        <div key={f.name}>
          <label htmlFor={f.name} className="label">
            {f.label}
          </label>
          <div className="relative">
            <input
              id={f.name}
              name={f.name}
              type={f.type === "password" && showPassword ? "text" : (f.type ?? "text")}
              autoComplete={f.autoComplete}
              required
              minLength={f.type === "password" && f.autoComplete === "new-password" ? 8 : undefined}
              className={`field ${f.type === "password" ? "pr-20" : ""}`}
            />
            {f.type === "password" && (
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
                className="absolute inset-y-0 right-0 px-3 text-sm font-semibold text-lagoon"
              >
                {showPassword ? "Masquer" : "Afficher"}
              </button>
            )}
          </div>
        </div>
      ))}
      {children}
      {state?.error && (
        <p role="alert" className="text-danger">
          {state.error}
        </p>
      )}
      <button type="submit" disabled={pending} className="btn btn-primary w-full">
        {pending ? pendingLabel : submitLabel}
      </button>
    </form>
  );
}
