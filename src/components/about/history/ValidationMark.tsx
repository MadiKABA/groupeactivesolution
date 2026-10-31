import { showPlaceholders } from "@/lib/flags";

/** Marqueur « [À valider] » d'un contenu provisoire, affiché seulement avec les placeholders (src/lib/flags.ts). */
export function ValidationMark({ pending }: { pending: boolean }) {
  if (!pending || !showPlaceholders) return null;
  return <span className="hs-todo">[À valider]</span>;
}
