import type { KeyboardEvent, Ref } from "react";

import { reveal } from "@/components/sections/formations/reveal";
import { FAQ_PANEL_ID, faqCategories, faqIntro, faqTabId } from "@/lib/faq";

/** Entrée des onglets (ms) : un par un après le titre ; l'indicateur se pose juste après le premier. */
const TABS_AT = 420;
const TAB_STAGGER = 70;
export const INDICATOR_AT = TABS_AT + 40;

type FaqTabsProps = {
  selected: number;
  /** Nombre de questions par catégorie (calculé depuis les items). */
  counts: Record<string, number>;
  onSelect: (index: number) => void;
  listRef: Ref<HTMLDivElement>;
  indicatorRef: Ref<HTMLSpanElement>;
};

/**
 * Onglets des catégories (tablist WAI-ARIA horizontale, roving tabindex, activation automatique),
 * identiques à toutes les largeurs : rangée en desktop, pastilles défilantes sous 1024px.
 * Pastille active = un indicateur unique qui glisse (position et largeur posées par FaqInteractive).
 */
export function FaqTabs({ selected, counts, onSelect, listRef, indicatorRef }: FaqTabsProps) {
  const total = faqCategories.length;

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = {
      ArrowRight: (selected + 1) % total,
      ArrowLeft: (selected - 1 + total) % total,
      Home: 0,
      End: total - 1,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onSelect(next);
    // Le focus suit la sélection ; seul le conteneur des pastilles défile (jamais la page).
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus({ preventScroll: true });
  };

  return (
    <div
      ref={listRef}
      role="tablist"
      aria-label={faqIntro.tablistLabel}
      aria-orientation="horizontal"
      className="faq-tablist relative isolate -mr-6 mt-8 flex snap-x snap-proximity scroll-px-6 gap-2.5 overflow-x-auto pr-6 md:-mr-10 md:pr-10 lg:mr-0 lg:mt-10 lg:overflow-visible lg:pr-0"
    >
      <span ref={indicatorRef} aria-hidden="true" className="faq-indicator fq-a absolute top-0 left-0 -z-10 h-12 rounded-full bg-brand-navy" {...reveal(INDICATOR_AT, 300, "scaleX(.9)")} />
      {faqCategories.map((category, index) => {
        const count = counts[category.id] ?? 0;
        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            id={faqTabId(category)}
            aria-selected={index === selected}
            aria-controls={FAQ_PANEL_ID}
            tabIndex={index === selected ? 0 : -1}
            onClick={() => onSelect(index)}
            onKeyDown={onKeyDown}
            className="faq-tab fq-a group/tab relative flex h-12 shrink-0 cursor-pointer snap-start items-center gap-2.5 rounded-full px-4 text-faq-tab font-bold whitespace-nowrap lg:px-5"
            {...reveal(TABS_AT + index * TAB_STAGGER, 450, "translateY(12px)")}
          >
            {category.label}
            <span className="sr-only">{`, ${count} question${count > 1 ? "s" : ""}`}</span>
            <span aria-hidden="true" className="faq-counter flex h-6 min-w-7 items-center justify-center rounded-full px-2 text-counter-sm font-extrabold lg:text-counter">
              {count}
            </span>
          </button>
        );
      })}
    </div>
  );
}
