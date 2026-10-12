export function LegalPage({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <article className="mx-auto max-w-2xl px-4 py-16 sm:px-6 [&_h2]:mt-10 [&_h2]:text-2xl [&_h2]:font-bold [&_p]:mt-3 [&_p]:text-slate">
      <h1 className="text-5xl font-extrabold">{title}</h1>
      <p className="!mt-2 text-sm">Dernière mise à jour : octobre 2026</p>
      {children}
    </article>
  );
}

/** Champ à compléter par l'éditeur du site avant la mise en ligne. */
export function Todo({ children }: { children: React.ReactNode }) {
  return <mark className="rounded bg-kite/40 px-1 text-deep">{children}</mark>;
}
