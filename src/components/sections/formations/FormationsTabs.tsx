import type { KeyboardEvent, Ref } from "react";

import { formationDomains, formationPanelId, formationsIntro, formationTabId } from "@/lib/formations";

import { reveal } from "./reveal";

/** Entrée des onglets : un par un après l'introduction (ms). */
const TABS_AT = 560;
const TAB_STAGGER = 80;

type FormationsTabsProps = {
  active: number;
  onSelect: (index: number) => void;
  listRef: Ref<HTMLDivElement>;
};

/**
 * Tablist WAI-ARIA (roving tabindex, activation automatique) : pastilles défilantes sous 1100px
 * (au-delà, accordéon FormationsAccordion). Importé par FormationsInteractive (composant client).
 */
export function FormationsTabs({ active, onSelect, listRef }: FormationsTabsProps) {
  const count = formationDomains.length;

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: (active + 1) % count,
      ArrowLeft: (active - 1 + count) % count,
      Home: 0,
      End: count - 1,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onSelect(next);
    // Le focus suit la sélection ; le conteneur des pastilles défile seul (jamais la page).
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus({ preventScroll: true });
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={formationsIntro.tablistLabel}
      aria-orientation="horizontal"
      className="formations-pills -mr-6 flex snap-x snap-proximity scroll-px-6 gap-2 overflow-x-auto pr-6 md:-mr-10 md:pr-10"
    >
      {formationDomains.map((domain, index) => {
        const selected = index === active;
        return (
          <button
            key={domain.id}
            type="button"
            role="tab"
            id={formationTabId(domain)}
            aria-selected={selected}
            aria-controls={formationPanelId(domain)}
            tabIndex={selected ? 0 : -1}
            onClick={() => onSelect(index)}
            onKeyDown={onKeyDown}
            className="fo-a group/tab relative flex h-11 shrink-0 snap-start items-center gap-2.5 rounded-full border border-text-on-dark/12 bg-text-on-dark/4 px-4 text-sm font-semibold whitespace-nowrap text-text-on-dark/78 transition-[background-color,border-color,color,box-shadow] duration-200 ease-out aria-selected:border-brand-gold/45 aria-selected:bg-brand-gold/8 aria-selected:text-text-on-dark aria-selected:ring-4 aria-selected:ring-brand-gold/10 pointer-fine:hover:bg-text-on-dark/8 pointer-fine:aria-selected:hover:bg-brand-gold/16"
            {...reveal(TABS_AT + index * TAB_STAGGER, 450, "translateX(-16px)")}
          >
            <span className="text-xs font-extrabold tracking-badge text-brand-gold group-aria-selected/tab:text-brand-gold/80">
              {domain.num}
            </span>
            <span>{domain.tab}</span>
          </button>
        );
      })}
    </div>
  );
}
