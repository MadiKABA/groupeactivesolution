import { ChevronRight } from "lucide-react";
import type { KeyboardEvent, Ref } from "react";

import { formationDomains, formationPanelId, formationsIntro, formationTabId } from "@/lib/formations";

import { reveal } from "./reveal";

/** Entrée des onglets : un par un après l'introduction (ms). */
const TABS_AT = 560;
const TAB_STAGGER = 80;

type FormationsTabsProps = {
  active: number;
  /** Colonne verticale (≥ 1024px) ou pastilles horizontales. */
  vertical: boolean;
  onSelect: (index: number) => void;
  listRef: Ref<HTMLDivElement>;
};

/**
 * Tablist WAI-ARIA (roving tabindex, activation automatique) : colonne d'onglets en desktop,
 * pastilles défilantes sous 1024px. Importé par FormationsInteractive (composant client).
 */
export function FormationsTabs({ active, vertical, onSelect, listRef }: FormationsTabsProps) {
  const count = formationDomains.length;

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = {
      [vertical ? "ArrowDown" : "ArrowRight"]: (active + 1) % count,
      [vertical ? "ArrowUp" : "ArrowLeft"]: (active - 1 + count) % count,
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
      aria-orientation={vertical ? "vertical" : "horizontal"}
      className="formations-pills -mr-6 flex snap-x snap-proximity scroll-px-6 gap-2 overflow-x-auto pr-6 md:-mr-10 md:pr-10 lg:mr-0 lg:flex-col lg:gap-3 lg:overflow-visible lg:pr-0"
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
            className="fo-a group/tab relative flex h-11 shrink-0 snap-start items-center gap-2.5 rounded-full border border-text-on-dark/12 bg-text-on-dark/4 px-4 text-sm font-semibold whitespace-nowrap text-text-on-dark/78 transition-[background-color,border-color,color,box-shadow] duration-200 ease-out aria-selected:border-brand-gold/55 aria-selected:bg-brand-gold/12 aria-selected:text-text-on-dark aria-selected:ring-4 aria-selected:ring-brand-gold/10 lg:h-21 lg:gap-4 lg:rounded-[18px] lg:px-6 lg:text-tab lg:font-bold lg:whitespace-normal pointer-fine:hover:bg-text-on-dark/8 pointer-fine:aria-selected:hover:bg-brand-gold/16"
            {...reveal(TABS_AT + index * TAB_STAGGER, 450, "translateX(-16px)")}
          >
            {/* Barre dorée verticale de l'onglet actif (desktop) */}
            <span
              aria-hidden="true"
              className="absolute inset-y-4 left-0 hidden w-0.75 rounded-full bg-brand-gold opacity-0 transition-opacity duration-200 ease-out group-aria-selected/tab:opacity-100 lg:block"
            />
            <span className="text-xs font-extrabold tracking-badge text-brand-gold group-aria-selected/tab:text-brand-gold-light lg:text-sm">
              {domain.num}
            </span>
            <span className="lg:flex-1 lg:text-left">{domain.tab}</span>
            <ChevronRight
              aria-hidden="true"
              strokeWidth={1.8}
              className="hidden size-5 shrink-0 text-text-on-dark/50 transition-transform duration-180 ease-out group-aria-selected/tab:text-brand-gold-light lg:block pointer-fine:group-hover/tab:translate-x-0.75"
            />
          </button>
        );
      })}
    </div>
  );
}
