/**
 * Exemple de retour de coach (contenu fictif, affiché comme tel) : montre au rider
 * exactement ce qu'il reçoit, avec la même structure que le vrai rapport.
 */
const PHASES: [string, number, string][] = [
  ["Approche", 8, "Bonne vitesse, carre tenue jusqu'au bout."],
  ["Appel", 6, "Le kite part trop loin derrière le zénith."],
  ["En l'air", 5, "Tête qui tourne avant les épaules : rotation freinée."],
  ["Réception", 6, "Réception subie, jambes trop tendues."],
];

const ERRORS = [
  {
    level: "Majeure",
    color: "border-danger",
    title: "Envoi du kite trop fort et trop loin",
    fix: "Arrête l'envoi à 12 h pile, mains au centre de la barre : le kite te lève au lieu de te tirer en arrière.",
  },
  {
    level: "Moyenne",
    color: "border-kite",
    title: "Regard qui lance la rotation trop tôt",
    fix: "Garde le regard sur l'horizon jusqu'au sommet du saut, puis tourne la tête par-dessus l'épaule arrière.",
  },
];

export function SampleReport({ compact = false }: { compact?: boolean }) {
  return (
    <div className="panel overflow-hidden text-left">
      <div className="flex items-center justify-between gap-3 bg-deep px-5 py-3 text-white">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="flex h-9 w-9 items-center justify-center rounded-full bg-brand">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3a4 4 0 1 1 0 8 4 4 0 0 1 0-8zM4 21v-1a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v1" />
            </svg>
          </span>
          <div className="leading-tight">
            <p className="text-sm font-semibold">Retour de ton coach</p>
            <p className="text-xs text-white/70">Diplômé d&apos;État · kitesurf</p>
          </div>
        </div>
        <span className="rounded-full bg-white/15 px-2.5 py-1 text-xs font-semibold">Exemple</span>
      </div>

      <div className="p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm text-slate">Kitesurf · intermédiaire</p>
            <p className="text-2xl font-extrabold">Backroll</p>
          </div>
          <p className="text-4xl font-extrabold leading-none text-brand">
            6,5<span className="text-lg text-slate">/10</span>
          </p>
        </div>

        <p className="mt-3 text-[0.95rem]">
          Ta vitesse et ta carre sont bonnes : le saut part bien. Ce qui bloque ta rotation, c&apos;est l&apos;envoi du kite,
          trop loin derrière, qui te tire en arrière au lieu de te lever.
        </p>

        <div className="mt-4 rounded-xl bg-brand p-3 text-white">
          <p className="text-xs font-semibold text-white/80">Priorité pour ta prochaine session</p>
          <p className="font-semibold">Envoie le kite à 12 h, pas plus loin, puis renvoie-le vers l&apos;avant.</p>
        </div>

        <p className="mt-5 text-sm font-bold uppercase tracking-wider text-slate">Phase par phase</p>
        <ul className="mt-2 space-y-2">
          {(compact ? PHASES.slice(0, 2) : PHASES).map(([name, note, text]) => (
            <li key={name} className="grid grid-cols-[5.5rem_2.5rem_1fr] items-center gap-2 text-sm">
              <span className="font-semibold">{name}</span>
              <span className="h-1.5 overflow-hidden rounded-full bg-raised">
                <span className="block h-full rounded-full bg-brand" style={{ width: `${note * 10}%` }} />
              </span>
              <span className="text-slate">
                <span className="font-semibold text-deep">{note}/10</span> · {text}
              </span>
            </li>
          ))}
        </ul>

        <p className="mt-5 text-sm font-bold uppercase tracking-wider text-slate">À corriger, dans cet ordre</p>
        <ol className="mt-2 space-y-3">
          {(compact ? ERRORS.slice(0, 1) : ERRORS).map((e) => (
            <li key={e.title} className={`border-l-4 pl-3 text-sm ${e.color}`}>
              <p className="text-xs text-slate">{e.level}</p>
              <p className="font-semibold">{e.title}</p>
              <p className="text-slate">{e.fix}</p>
            </li>
          ))}
        </ol>

        {!compact && (
          <>
            <p className="mt-5 text-sm font-bold uppercase tracking-wider text-slate">Exercices</p>
            <ul className="mt-2 space-y-1 text-sm">
              <li className="flex gap-2"><span aria-hidden="true" className="text-lagoon">•</span>5 petits sauts en envoyant le kite à 12 h, sans rotation</li>
              <li className="flex gap-2"><span aria-hidden="true" className="text-lagoon">•</span>Rotation au sol sur la plage : épaules d&apos;abord, tête ensuite</li>
            </ul>
          </>
        )}
      </div>
    </div>
  );
}
