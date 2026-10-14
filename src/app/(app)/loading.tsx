/** Squelette affiché pendant le chargement d'une page de l'espace membre. */
export default function Loading() {
  return (
    <div className="mx-auto max-w-3xl animate-pulse space-y-5" aria-busy="true" aria-label="Chargement">
      <div className="h-8 w-2/3 rounded-xl bg-raised" />
      <div className="h-44 rounded-3xl bg-raised" />
      <div className="h-24 rounded-3xl bg-raised" />
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="h-32 rounded-3xl bg-raised" />
        <div className="h-32 rounded-3xl bg-raised" />
      </div>
    </div>
  );
}
