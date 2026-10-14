export default function Loading() {
  return (
    <div className="mx-auto max-w-4xl animate-pulse space-y-5 px-5 py-14 sm:px-6" aria-busy="true" aria-label="Chargement">
      <div className="h-9 w-1/2 rounded-xl bg-raised" />
      <div className="h-5 w-3/4 rounded-lg bg-raised" />
      <div className="h-64 rounded-3xl bg-raised" />
    </div>
  );
}
