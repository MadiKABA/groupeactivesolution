import type { CSSProperties } from "react";

/**
 * Trois mots-clés d'une formation, en pastilles neutres (aucun doré).
 * `compact` (accordéon desktop) : marges internes de 12px pour tenir sur une ligne dans 396px.
 */
export function FormationTags({ tags, compact = false }: { tags: readonly string[]; compact?: boolean }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {tags.map((tag, index) => (
        <li
          key={tag}
          className={`formations-tag ${compact ? "px-3" : "px-3.5"} flex h-8 items-center rounded-full border border-text-on-dark/18 bg-text-on-dark/6 text-chip font-semibold whitespace-nowrap text-text-on-dark/90`}
          style={{ "--fo-tag": index } as CSSProperties}
        >
          {tag}
        </li>
      ))}
    </ul>
  );
}
