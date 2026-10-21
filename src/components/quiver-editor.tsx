"use client";

import type { Quiver } from "@/lib/rider-details";
import type { SportId } from "@/lib/sports";

const chip =
  "cursor-pointer select-none rounded-full border border-line bg-spray px-3.5 py-2 text-sm font-semibold transition-colors hover:border-brand aria-pressed:border-brand aria-pressed:bg-brand aria-pressed:text-white";

/** Tailles proposées en un clic, par sport. */
const SIZES: Partial<Record<SportId, number[]>> = {
  kitesurf: [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 17],
  foil: [5, 6, 7, 8, 9, 10, 11, 12, 13, 15, 17],
  wingfoil: [2.5, 3, 3.5, 4, 4.5, 5, 5.5, 6, 6.5, 7, 8],
};

const BOARD_TYPES: Partial<Record<SportId, string[]>> = {
  kitesurf: ["Twin-tip", "Surf / directionnelle", "Light wind"],
  surf: ["Shortboard", "Fish", "Mid-length", "Longboard", "Mousse"],
};

const fmt = (n: number) => String(n).replace(".", ",");

function Num({ id, label, unit, value, min, max, step = 1, hint, onChange }: { id: string; label: string; unit?: string; value?: number; min: number; max: number; step?: number; hint?: string; onChange: (v?: number) => void }) {
  return (
    <div>
      <label htmlFor={id} className="label">
        {label}
        {unit && <span className="font-normal text-slate"> ({unit})</span>}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={min}
        max={max}
        step={step}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value === "" ? undefined : Number(e.target.value))}
        className="field"
      />
      {hint && <p className="mt-1 text-xs text-slate">{hint}</p>}
    </div>
  );
}

/**
 * Éditeur de quiver : tailles d'ailes en un clic, planches, et pour le foil tous les paramètres
 * (aile avant, stab, mât, fuselage, volume de planche).
 */
export function QuiverEditor({ sport, value, onChange }: { sport: SportId; value: Quiver; onChange: (q: Quiver) => void }) {
  const set = (patch: Partial<Quiver>) => onChange({ ...value, ...patch });
  const ailes = value.ailes ?? [];
  const sizes = SIZES[sport];
  const isFoil = sport === "wingfoil" || sport === "foil";
  const aileLabel = sport === "wingfoil" ? "Tes ailes" : "Tes kites";

  function toggleSize(n: number) {
    const next = ailes.includes(n) ? ailes.filter((x) => x !== n) : [...ailes, n].sort((a, b) => a - b);
    set({ ailes: next.length ? next : undefined });
  }

  const boards = value.planches ?? [];
  function setBoard(i: number, patch: Partial<{ type: string; taille: string }>) {
    const next = boards.map((b, j) => (j === i ? { ...b, ...patch } : b));
    set({ planches: next });
  }

  return (
    <div className="space-y-5">
      {sizes && (
        <div>
          <p className="label">
            {aileLabel} <span className="font-normal text-slate">(m², clique pour ajouter)</span>
          </p>
          <div className="flex flex-wrap gap-2" role="group" aria-label={aileLabel}>
            {sizes.map((n) => (
              <button key={n} type="button" aria-pressed={ailes.includes(n)} onClick={() => toggleSize(n)} className={chip}>
                {fmt(n)}
              </button>
            ))}
          </div>
          <p className="mt-1.5 text-sm text-slate">
            {ailes.length ? `Quiver : ${ailes.map(fmt).join(" / ")} m². Le Spot Finder te dira laquelle sortir.` : "Facultatif, mais le Spot Finder te dira alors quelle taille sortir."}
          </p>
        </div>
      )}

      {(sport === "kitesurf" || sport === "foil") && (
        <div className="grid gap-4 sm:grid-cols-2">
          <Num id={`lignes_${sport}`} label="Longueur de lignes" unit="m" value={value.lignesM} min={10} max={30} hint="Courtes = plus de réactivité, moins de puissance." onChange={(v) => set({ lignesM: v })} />
        </div>
      )}

      {BOARD_TYPES[sport] && (
        <div>
          <p className="label">Tes planches</p>
          <div className="space-y-2">
            {boards.map((b, i) => (
              <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                <select aria-label="Type de planche" value={b.type} onChange={(e) => setBoard(i, { type: e.target.value })} className="field">
                  {BOARD_TYPES[sport]!.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
                <input
                  aria-label="Taille"
                  value={b.taille}
                  onChange={(e) => setBoard(i, { taille: e.target.value })}
                  placeholder={sport === "surf" ? "5'10 · 28 L" : "138 cm"}
                  maxLength={30}
                  className="field"
                />
                <button type="button" onClick={() => set({ planches: boards.filter((_, j) => j !== i) })} aria-label="Retirer cette planche" className="rounded-xl px-3 text-slate hover:bg-raised hover:text-danger">
                  ✕
                </button>
              </div>
            ))}
            {boards.length < 6 && (
              <button type="button" onClick={() => set({ planches: [...boards, { type: BOARD_TYPES[sport]![0], taille: "" }] })} className="text-sm font-semibold text-lagoon">
                + Ajouter une planche
              </button>
            )}
          </div>
        </div>
      )}

      {isFoil && (
        <div className="rounded-2xl border border-line bg-salt p-4">
          <p className="font-bold">Ton foil</p>
          <p className="text-sm text-slate">Plus c&apos;est précis, plus le coach et le Spot Finder sont justes (portance, vent mini, stabilité).</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor={`foil_marque_${sport}`} className="label">
                Marque / modèle <span className="font-normal text-slate">(facultatif)</span>
              </label>
              <input id={`foil_marque_${sport}`} value={value.foil?.marque ?? ""} onChange={(e) => set({ foil: { ...value.foil, marque: e.target.value } })} placeholder="Ex. Armstrong HA1125, F-One Phantom" maxLength={60} className="field" />
            </div>
            <Num id={`foil_av_${sport}`} label="Aile avant" unit="cm²" value={value.foil?.aileAvantCm2} min={300} max={3000} step={10} hint="Débutant : 1500-2000 · freeride : 900-1400 · race : < 800" onChange={(v) => set({ foil: { ...value.foil, aileAvantCm2: v } })} />
            <Num id={`foil_stab_${sport}`} label="Stabilisateur" unit="cm²" value={value.foil?.stabCm2} min={80} max={600} step={5} hint="Grand = stable, petit = vif" onChange={(v) => set({ foil: { ...value.foil, stabCm2: v } })} />
            <Num id={`foil_mat_${sport}`} label="Mât" unit="cm" value={value.foil?.matCm} min={40} max={120} hint="Court pour apprendre (60-75), long pour les vagues et le clapot" onChange={(v) => set({ foil: { ...value.foil, matCm: v } })} />
            <Num id={`foil_fus_${sport}`} label="Fuselage" unit="cm" value={value.foil?.fuselageCm} min={40} max={100} hint="Long = stable en tangage, court = maniable" onChange={(v) => set({ foil: { ...value.foil, fuselageCm: v } })} />
            <Num id={`planche_vol_${sport}`} label="Volume de la planche" unit="L" value={value.planche?.volumeL} min={20} max={200} hint="Repère wing : ton poids + 10 à 30 L pour débuter" onChange={(v) => set({ planche: { ...value.planche, volumeL: v } })} />
            <div>
              <label htmlFor={`planche_long_${sport}`} className="label">
                Longueur de la planche <span className="font-normal text-slate">(facultatif)</span>
              </label>
              <input id={`planche_long_${sport}`} value={value.planche?.longueur ?? ""} onChange={(e) => set({ planche: { ...value.planche, longueur: e.target.value } })} placeholder="Ex. 5'2 ou 150 cm" maxLength={20} className="field" />
            </div>
          </div>
        </div>
      )}

      {sport === "wakeboard" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="wake_planche" className="label">Ta planche</label>
            <input id="wake_planche" value={boards[0]?.taille ?? ""} onChange={(e) => set({ planches: [{ type: "Planche câble", taille: e.target.value }] })} placeholder="Ex. 140 cm, base câble" maxLength={30} className="field" />
          </div>
          <div>
            <p className="label">Chausses</p>
            <div className="flex gap-2">
              {[
                { id: "ouvertes", label: "Ouvertes" },
                { id: "fermees", label: "Fermées" },
              ].map((c) => (
                <button key={c.id} type="button" aria-pressed={value.chausses === c.id} onClick={() => set({ chausses: value.chausses === c.id ? undefined : (c.id as Quiver["chausses"]) })} className={chip}>
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div>
        <label htmlFor={`notes_${sport}`} className="label">
          Précisions <span className="font-normal text-slate">(facultatif)</span>
        </label>
        <input id={`notes_${sport}`} value={value.notes ?? ""} onChange={(e) => set({ notes: e.target.value })} placeholder="Ex. barre 4 lignes, harnais culotte, kite de light wind" maxLength={300} className="field" />
      </div>
    </div>
  );
}
