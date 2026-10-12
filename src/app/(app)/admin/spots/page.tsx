import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import type { Spot } from "@/lib/types";
import { AdminForm } from "@/components/admin-form";
import { saveSpot, toggleSpot } from "../actions";

export const metadata: Metadata = { title: "Admin · Spots" };

export default async function AdminSpots({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  const { edit } = await searchParams;
  const db = createAdminClient();
  const { data: spots } = await db.from("spots").select("*").order("country").order("name").returns<Spot[]>();
  const current = spots?.find((s) => s.id === edit);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_1.1fr]">
      <section>
        <h1 className="text-4xl font-bold">{current ? `Modifier ${current.name}` : "Ajouter un spot"}</h1>
        <p className="mt-2 text-[0.95rem] text-slate">
          « Direction du large » : vers où on regarde depuis la plage, en degrés (0 = nord, 90 = est, 180 = sud, 270 =
          ouest). Elle sert à savoir si le vent est onshore, side ou offshore.
        </p>
        <AdminForm action={saveSpot} submitLabel={current ? "Enregistrer" : "Ajouter le spot"} className="mt-6" key={current?.id ?? "new"}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="id" label="Identifiant (slug)" def={current?.id} readOnly={!!current} placeholder="ex. almanarre" />
            <Field name="name" label="Nom" def={current?.name} />
            <Field name="country" label="Pays" def={current?.country} />
            <Field name="region" label="Région" def={current?.region ?? ""} required={false} />
            <Field name="lat" label="Latitude" def={current?.lat} type="number" step="0.0001" />
            <Field name="lng" label="Longitude" def={current?.lng} type="number" step="0.0001" />
            <Field name="sea_bearing" label="Direction du large (°)" def={current?.sea_bearing} type="number" step="1" />
            <div>
              <label htmlFor="water" className="label">Plan d&apos;eau</label>
              <select id="water" name="water" defaultValue={current?.water ?? "chop"} className="field">
                <option value="flat">Eau plate</option>
                <option value="chop">Clapot</option>
                <option value="vagues">Vagues</option>
              </select>
            </div>
            <div>
              <label htmlFor="min_level" className="label">Niveau minimum</label>
              <select id="min_level" name="min_level" defaultValue={current?.min_level ?? "debutant"} className="field">
                <option value="debutant">Tous niveaux</option>
                <option value="intermediaire">Intermédiaire</option>
                <option value="avance">Confirmé</option>
              </select>
            </div>
          </div>
          <div className="mt-4">
            <label htmlFor="notes" className="label">Notes (sécurité, accès, réglementation)</label>
            <textarea id="notes" name="notes" rows={2} defaultValue={current?.notes ?? ""} className="field" />
          </div>
        </AdminForm>
        {current && <a href="/admin/spots" className="mt-3 inline-block text-lagoon hover:underline">Annuler</a>}
      </section>

      <section>
        <h2 className="text-2xl font-bold">{spots?.length ?? 0} spots</h2>
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {(spots ?? []).map((s) => (
            <li key={s.id} className="flex items-center justify-between gap-3 py-3">
              <div className={`min-w-0 ${s.active ? "" : "opacity-50"}`}>
                <p className="truncate font-semibold">{s.name}</p>
                <p className="text-sm text-slate">{s.country} · large {s.sea_bearing}° · {s.lat.toFixed(3)}, {s.lng.toFixed(3)}</p>
              </div>
              <div className="flex shrink-0 gap-2">
                <a href={`/admin/spots?edit=${s.id}`} className="btn btn-ghost !px-3 !py-1.5 text-sm">Modifier</a>
                <form action={toggleSpot}>
                  <input type="hidden" name="id" value={s.id} />
                  <input type="hidden" name="active" value={String(!s.active)} />
                  <button className="btn btn-ghost !px-3 !py-1.5 text-sm">{s.active ? "Masquer" : "Afficher"}</button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function Field({
  name,
  label,
  def,
  type = "text",
  step,
  placeholder,
  readOnly,
  required = true,
}: {
  name: string;
  label: string;
  def?: string | number | null;
  type?: string;
  step?: string;
  placeholder?: string;
  readOnly?: boolean;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="label">{label}</label>
      <input
        id={name}
        name={name}
        type={type}
        step={step}
        defaultValue={def ?? ""}
        placeholder={placeholder}
        readOnly={readOnly}
        required={required}
        className={`field ${readOnly ? "bg-salt" : ""}`}
      />
    </div>
  );
}
