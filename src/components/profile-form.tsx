"use client";

import { useActionState } from "react";
import { saveProfile, type ProfileState } from "@/app/(app)/coach/actions";
import { DISCIPLINES, LEVELS } from "@/lib/tricks";
import type { Profile } from "@/lib/types";

export function ProfileForm({ profile, submitLabel }: { profile: Profile; submitLabel: string }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(saveProfile, undefined);

  return (
    <form action={action} className="space-y-7">
      <div>
        <label htmlFor="full_name" className="label">Prénom</label>
        <input id="full_name" name="full_name" defaultValue={profile.full_name ?? ""} required className="field max-w-sm" />
      </div>

      <fieldset>
        <legend className="label">Ton niveau</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {LEVELS.map((l) => (
            <label key={l.id} className="flex cursor-pointer gap-3 rounded-xl border border-line bg-spray p-3 has-[:checked]:border-lagoon has-[:checked]:bg-lagoon/5">
              <input type="radio" name="level" value={l.id} defaultChecked={profile.level === l.id} required className="mt-1 accent-[var(--lagoon)]" />
              <span>
                <span className="font-semibold">{l.label}</span>
                <span className="block text-sm text-slate">{l.hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-6 sm:grid-cols-2">
        <fieldset>
          <legend className="label">Ta pratique</legend>
          <div className="flex flex-wrap gap-2">
            {DISCIPLINES.map((d) => (
              <label key={d.id} className="cursor-pointer rounded-full border border-line bg-spray px-4 py-2 has-[:checked]:border-deep has-[:checked]:bg-deep has-[:checked]:text-salt">
                <input type="radio" name="discipline" value={d.id} defaultChecked={profile.discipline === d.id} required className="sr-only" />
                {d.label}
              </label>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="label">Stance</legend>
          <div className="flex gap-2">
            {[{ id: "regular", label: "Regular" }, { id: "goofy", label: "Goofy" }].map((s) => (
              <label key={s.id} className="cursor-pointer rounded-full border border-line bg-spray px-4 py-2 has-[:checked]:border-deep has-[:checked]:bg-deep has-[:checked]:text-salt">
                <input type="radio" name="stance" value={s.id} defaultChecked={profile.stance === s.id} required className="sr-only" />
                {s.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="home_spot" className="label">Spot habituel</label>
          <input id="home_spot" name="home_spot" defaultValue={profile.home_spot ?? ""} placeholder="Ex. Almanarre, Hyères" className="field" />
        </div>
        <div>
          <label htmlFor="quiver" className="label">Ton matériel</label>
          <input id="quiver" name="quiver" defaultValue={profile.quiver ?? ""} placeholder="Ex. 9 m et 12 m, twin-tip 138" className="field" />
        </div>
      </div>

      <div>
        <label htmlFor="goals" className="label">Ce que tu veux débloquer</label>
        <textarea id="goals" name="goals" rows={3} defaultValue={profile.goals ?? ""} placeholder="Ex. passer mon premier backroll cet été, sauter plus haut" className="field" />
      </div>

      {state?.error && <p role="alert" className="text-danger">{state.error}</p>}
      {state?.saved && <p role="status" className="text-lagoon">Profil enregistré.</p>}

      <button disabled={pending} className="btn btn-primary">
        {pending ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}
