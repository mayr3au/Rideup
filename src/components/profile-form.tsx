"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { saveProfile, type ProfileState } from "@/app/(app)/coach/actions";
import { LEVEL_LABELS, LEVEL_ORDER, SPORT_IDS, SPORTS, type SportId } from "@/lib/sports";
import { riderSports } from "@/lib/rider";
import type { Profile } from "@/lib/types";

const chip =
  "cursor-pointer select-none rounded-full border border-line bg-spray px-4 py-2.5 font-semibold has-[:checked]:border-brand has-[:checked]:bg-brand has-[:checked]:text-white has-[:focus-visible]:outline has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-brand";

type StepId = "sports" | `sport:${SportId}` | "you" | "place";

/**
 * Formulaire de profil.
 * - Première fois (onboarding) : une étape à la fois, avec validation à chaque « Continuer ».
 * - Ensuite : toutes les sections visibles, pour modifier vite.
 */
export function ProfileForm({ profile, submitLabel, showAlerts }: { profile: Profile; submitLabel: string; showAlerts?: boolean }) {
  const stepped = !profile.onboarded;
  const [state, action, pending] = useActionState<ProfileState, FormData>(saveProfile, undefined);
  const [sports, setSports] = useState<SportId[]>(profile.onboarded ? riderSports(profile) : []);
  const [main, setMain] = useState<SportId>(profile.sport ?? "kitesurf");
  const [place, setPlace] = useState({
    label: profile.home_label ?? "",
    lat: profile.home_lat?.toString() ?? "",
    lng: profile.home_lng?.toString() ?? "",
  });
  const [locating, setLocating] = useState(false);
  const [geoError, setGeoError] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const formRef = useRef<HTMLFormElement>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const steps: StepId[] = ["sports", ...sports.map((s) => `sport:${s}` as const), "you", "place"];
  const current = steps[Math.min(step, steps.length - 1)];
  const visible = (id: StepId) => !stepped || current === id;
  const last = step >= steps.length - 1;

  useEffect(() => {
    if (stepped && step > 0) topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [step, stepped]);

  function toggleSport(id: SportId) {
    setSports((list) => {
      const next = list.includes(id) ? list.filter((s) => s !== id) : [...list, id];
      if (!next.includes(main) && next.length) setMain(next[0]);
      if (next.length === 1) setMain(next[0]);
      return next;
    });
  }

  /** Valide uniquement les champs de l'étape affichée, puis passe à la suivante. */
  function next() {
    const section = formRef.current?.querySelector<HTMLElement>(`[data-step="${current}"]`);
    const fields = section ? Array.from(section.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea")) : [];
    const bad = fields.find((f) => !f.checkValidity());
    if (bad) {
      bad.reportValidity();
      return;
    }
    setStep((s) => s + 1);
  }

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

  const stepTitle: Record<string, string> = {
    sports: "Tes sports",
    you: "Toi",
    place: "Où tu rides",
    ...Object.fromEntries(sports.map((s) => [`sport:${s}`, `Ton niveau en ${SPORTS[s].name.toLowerCase()}`])),
  };

  return (
    <form ref={formRef} action={action} className="space-y-6">
      <div ref={topRef} className="scroll-mt-32" />

      {stepped && (
        <div aria-live="polite">
          <div className="flex items-baseline justify-between">
            <p className="text-sm font-semibold text-brand">
              Étape {step + 1} sur {steps.length}
            </p>
            <p className="text-sm text-slate">{stepTitle[current]}</p>
          </div>
          <div className="mt-2 h-2 overflow-hidden rounded-full bg-raised" aria-hidden="true">
            <div className="h-full rounded-full bg-brand transition-[width]" style={{ width: `${((step + 1) / steps.length) * 100}%` }} />
          </div>
        </div>
      )}

      {/* 1. Sports */}
      <fieldset data-step="sports" className={`panel p-5 ${visible("sports") ? "" : "hidden"}`}>
        <legend className="sr-only">Tes sports</legend>
        <p className="text-lg font-bold">Quels sports tu pratiques ?</p>
        <p className="text-sm text-slate">Choisis-en un ou plusieurs. Tu pourras en ajouter plus tard.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {SPORT_IDS.map((id) => (
            <label key={id} className={chip}>
              <input type="checkbox" name="sports" value={id} checked={sports.includes(id)} onChange={() => toggleSport(id)} className="sr-only" />
              {SPORTS[id].name}
            </label>
          ))}
        </div>
        {sports.length > 1 && (
          <div className="mt-5">
            <label htmlFor="sport" className="label">Ton sport principal</label>
            <select id="sport" name="sport" value={main} onChange={(e) => setMain(e.target.value as SportId)} className="field">
              {sports.map((id) => (
                <option key={id} value={id}>{SPORTS[id].name}</option>
              ))}
            </select>
            <p className="mt-1 text-sm text-slate">C&apos;est celui qui s&apos;affiche en premier. Tu peux changer à tout moment.</p>
          </div>
        )}
        {sports.length === 1 && <input type="hidden" name="sport" value={sports[0]} />}
      </fieldset>

      {/* 2. Niveau et matériel par sport */}
      {sports.map((id) => {
        const sport = SPORTS[id];
        return (
          <fieldset key={id} data-step={`sport:${id}`} className={`panel p-5 ${visible(`sport:${id}`) ? "" : "hidden"}`}>
            <legend className="sr-only">{sport.name}</legend>
            <p className="text-lg font-bold">{sport.name}</p>
            <p className="text-sm text-slate">Le coach adapte ses conseils et sa roadmap à ton niveau.</p>
            <p className="mt-3 label">Ton niveau</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {LEVEL_ORDER.map((lvl) => (
                <label key={lvl} className="flex cursor-pointer gap-3 rounded-2xl border border-line bg-spray p-3 has-[:checked]:border-brand has-[:checked]:bg-brand-light">
                  <input type="radio" name={`level_${id}`} value={lvl} defaultChecked={profile.levels?.[id] === lvl} required className="mt-1 accent-[var(--brand)]" />
                  <span>
                    <span className="font-semibold">{LEVEL_LABELS[lvl]}</span>
                    <span className="block text-sm text-slate">{sport.levelHints[lvl]}</span>
                  </span>
                </label>
              ))}
            </div>
            <label htmlFor={`gear_${id}`} className="label mt-4">{sport.gear.label}</label>
            <input id={`gear_${id}`} name={`gear_${id}`} defaultValue={profile.gear?.[id] ?? ""} placeholder={sport.gear.placeholder} className="field" />
            {sport.spot === "wind" && <p className="mt-1 text-sm text-slate">Facultatif, mais le Spot Finder te dira alors quelle taille sortir.</p>}
          </fieldset>
        );
      })}

      {/* 3. Toi */}
      <fieldset data-step="you" className={`panel space-y-5 p-5 ${visible("you") ? "" : "hidden"}`}>
        <legend className="sr-only">Toi</legend>
        <p className="text-lg font-bold">Toi</p>
        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <label htmlFor="full_name" className="label">Prénom</label>
            <input id="full_name" name="full_name" defaultValue={profile.full_name ?? ""} required autoComplete="given-name" className="field" />
          </div>
          <div>
            <label htmlFor="weight_kg" className="label">Poids (kg)</label>
            <input id="weight_kg" name="weight_kg" type="number" inputMode="numeric" min={25} max={200} defaultValue={profile.weight_kg ?? ""} required className="field" />
            <p className="mt-1 text-sm text-slate">Sert à choisir la bonne taille d&apos;aile ou de kite.</p>
          </div>
        </div>
        <fieldset>
          <legend className="label">Pied avant</legend>
          <div className="flex gap-2">
            {[{ id: "regular", label: "Regular (gauche)" }, { id: "goofy", label: "Goofy (droit)" }].map((s) => (
              <label key={s.id} className={chip}>
                <input type="radio" name="stance" value={s.id} defaultChecked={profile.stance === s.id} required className="sr-only" />
                {s.label}
              </label>
            ))}
          </div>
        </fieldset>
        <div>
          <label htmlFor="goals" className="label">Ce que tu veux débloquer <span className="font-normal text-slate">(facultatif)</span></label>
          <textarea id="goals" name="goals" rows={3} defaultValue={profile.goals ?? ""} placeholder="Ex. mon premier backroll cet été, tenir le vol en wing" className="field" />
        </div>
      </fieldset>

      {/* 4. Où tu rides */}
      <fieldset data-step="place" className={`panel space-y-4 p-5 ${visible("place") ? "" : "hidden"}`}>
        <legend className="sr-only">Où tu rides</legend>
        <p className="text-lg font-bold">Où tu rides</p>
        <p className="text-sm text-slate">Pour te proposer les spots autour de toi. Tu peux passer cette étape.</p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            name="home_label"
            aria-label="Ville de départ"
            value={place.label}
            onChange={(e) => setPlace({ label: e.target.value, lat: "", lng: "" })}
            placeholder="Ville de départ, ex. Montpellier"
            autoComplete="address-level2"
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
          <label htmlFor="radius_km" className="label">Distance max pour aller rider (km)</label>
          <input id="radius_km" name="radius_km" type="number" inputMode="numeric" min={5} max={2000} defaultValue={profile.radius_km ?? 100} className="field max-w-40" />
        </div>
        {showAlerts ? (
          <label className="flex items-start gap-3">
            <input type="checkbox" name="wind_alerts" defaultChecked={profile.wind_alerts} className="mt-1 h-5 w-5 accent-[var(--brand)]" />
            <span>
              <span className="font-semibold">Alertes par e-mail</span>
              <span className="block text-sm text-slate">Quand des conditions adaptées sont prévues sur tes spots favoris.</span>
            </span>
          </label>
        ) : (
          <input type="hidden" name="wind_alerts" value={profile.wind_alerts ? "on" : ""} />
        )}
      </fieldset>

      {state?.error && <p role="alert" className="text-danger">{state.error}</p>}
      {state?.saved && <p role="status" className="rounded-2xl bg-brand-light p-3 font-semibold text-lagoon">Profil enregistré.</p>}

      {stepped ? (
        <div className="flex items-center gap-3">
          {step > 0 && (
            <button type="button" onClick={() => setStep((s) => s - 1)} className="btn btn-ghost">
              Retour
            </button>
          )}
          {last ? (
            <button disabled={pending} className="btn btn-primary flex-1 sm:flex-none">
              {pending ? "Enregistrement…" : submitLabel}
            </button>
          ) : (
            <button type="button" onClick={next} disabled={sports.length === 0} className="btn btn-primary flex-1 sm:flex-none">
              {sports.length === 0 ? "Choisis au moins un sport" : "Continuer"}
            </button>
          )}
        </div>
      ) : (
        <button disabled={pending || sports.length === 0} className="btn btn-primary w-full sm:w-auto">
          {pending ? "Enregistrement…" : sports.length === 0 ? "Choisis au moins un sport" : submitLabel}
        </button>
      )}
    </form>
  );
}
