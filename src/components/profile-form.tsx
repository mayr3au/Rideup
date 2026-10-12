"use client";

import { useActionState, useState } from "react";
import { saveProfile, type ProfileState } from "@/app/(app)/coach/actions";
import { DISCIPLINES, LEVELS } from "@/lib/tricks";
import type { Profile } from "@/lib/types";

const chip =
  "cursor-pointer rounded-sm border border-line bg-spray px-4 py-2.5 has-[:checked]:border-deep has-[:checked]:bg-brand has-[:checked]:text-white has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-kite";

export function ProfileForm({ profile, submitLabel, showAlerts }: { profile: Profile; submitLabel: string; showAlerts?: boolean }) {
  const [state, action, pending] = useActionState<ProfileState, FormData>(saveProfile, undefined);
  const [place, setPlace] = useState({
    label: profile.home_label ?? "",
    lat: profile.home_lat?.toString() ?? "",
    lng: profile.home_lng?.toString() ?? "",
  });
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);

  function locate() {
    setGeoError(null);
    if (!navigator.geolocation) {
      setGeoError("La géolocalisation n'est pas disponible sur cet appareil.");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPlace({ label: "Ma position", lat: pos.coords.latitude.toFixed(4), lng: pos.coords.longitude.toFixed(4) });
        setLocating(false);
      },
      () => {
        setGeoError("Position refusée. Saisis plutôt ta ville.");
        setLocating(false);
      },
      { timeout: 10000 },
    );
  }

  return (
    <form action={action} className="space-y-8">
      <div className="grid gap-6 sm:grid-cols-2">
        <div>
          <label htmlFor="full_name" className="label">Prénom</label>
          <input id="full_name" name="full_name" defaultValue={profile.full_name ?? ""} required className="field" />
        </div>
        <div>
          <label htmlFor="weight_kg" className="label">Poids (kg)</label>
          <input id="weight_kg" name="weight_kg" type="number" inputMode="numeric" min={25} max={200} defaultValue={profile.weight_kg ?? ""} required className="field" />
        </div>
      </div>

      <fieldset>
        <legend className="label">Ton niveau</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {LEVELS.map((l) => (
            <label key={l.id} className="flex cursor-pointer gap-3 rounded-md border border-line bg-spray p-3 has-[:checked]:border-lagoon has-[:checked]:bg-lagoon/5">
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
              <label key={d.id} className={chip}>
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
              <label key={s.id} className={chip}>
                <input type="radio" name="stance" value={s.id} defaultChecked={profile.stance === s.id} required className="sr-only" />
                {s.label}
              </label>
            ))}
          </div>
        </fieldset>
      </div>

      <div>
        <label htmlFor="quiver" className="label">Tes kites et ta planche</label>
        <input id="quiver" name="quiver" defaultValue={profile.quiver ?? ""} placeholder="Ex. 9 m, 12 m, twin-tip 138" className="field" />
        <p className="mt-1 text-sm text-slate">Indique les tailles en m² : le Spot Finder s&apos;en sert pour te conseiller le bon kite.</p>
      </div>

      <div>
        <label htmlFor="goals" className="label">Tes objectifs</label>
        <textarea id="goals" name="goals" rows={3} defaultValue={profile.goals ?? ""} placeholder="Ex. passer mon premier backroll cet été, sauter plus haut" className="field" />
      </div>

      <fieldset className="space-y-3">
        <legend className="label">Où tu rides</legend>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            name="home_label"
            aria-label="Ville de départ"
            value={place.label}
            onChange={(e) => setPlace({ label: e.target.value, lat: "", lng: "" })}
            placeholder="Ville de départ, ex. Montpellier"
            className="field flex-1"
          />
          <button type="button" onClick={locate} disabled={locating} className="btn btn-ghost">
            {locating ? "Localisation…" : "Utiliser ma position"}
          </button>
        </div>
        <input type="hidden" name="home_lat" value={place.lat} />
        <input type="hidden" name="home_lng" value={place.lng} />
        {geoError && <p className="text-sm text-danger">{geoError}</p>}
        <div>
          <label htmlFor="radius_km" className="label">Rayon de recherche des spots (km)</label>
          <input id="radius_km" name="radius_km" type="number" inputMode="numeric" min={5} max={2000} defaultValue={profile.radius_km ?? 100} className="field max-w-40" />
        </div>
      </fieldset>

      {showAlerts ? (
        <label className="flex items-start gap-3">
          <input type="checkbox" name="wind_alerts" defaultChecked={profile.wind_alerts} className="mt-1 h-5 w-5 accent-[var(--lagoon)]" />
          <span>
            <span className="font-semibold">Alertes vent par e-mail</span>
            <span className="block text-sm text-slate">Quand du vent adapté à ton niveau et à ton matériel est prévu sur tes spots favoris.</span>
          </span>
        </label>
      ) : (
        <input type="hidden" name="wind_alerts" value={profile.wind_alerts ? "on" : ""} />
      )}

      {state?.error && <p role="alert" className="text-danger">{state.error}</p>}
      {state?.saved && <p role="status" className="text-lagoon">Profil enregistré.</p>}

      <button disabled={pending} className="btn btn-primary w-full sm:w-auto">
        {pending ? "Enregistrement…" : submitLabel}
      </button>
    </form>
  );
}
