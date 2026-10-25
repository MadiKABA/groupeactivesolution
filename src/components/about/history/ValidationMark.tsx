/** Marqueur « [À valider] » d'un contenu provisoire, affiché en développement uniquement. */
export function ValidationMark({ pending }: { pending: boolean }) {
  if (!pending || process.env.NODE_ENV === "production") return null;
  return <span className="hs-todo">[À valider]</span>;
}
