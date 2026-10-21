/** Transition douce entre les pages de l'espace membre (remonté à chaque navigation). */
export default function Template({ children }: { children: React.ReactNode }) {
  return <div className="page-in">{children}</div>;
}
