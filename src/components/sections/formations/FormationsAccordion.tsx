import { ChevronRight } from "lucide-react";
import type { KeyboardEvent } from "react";

import { formationDomains, formationRegionId, formationsIntro, formationTriggerId } from "@/lib/formations";

import { FormationTags } from "./FormationTags";
import { reveal } from "./reveal";

/** Entrée des onglets : un par un après l'introduction (ms). */
const TABS_AT = 560;
const TAB_STAGGER = 80;

type FormationsAccordionProps = {
  active: number;
  onSelect: (index: number) => void;
};

/**
 * Colonne d'onglets desktop (≥ 1100px) : accordéon WAI-ARIA, un volet toujours ouvert.
 * Hauteur fixe (4 × 60 + 200 + 4 × 10 = 480px) : les volets qui s'ouvrent et se ferment ont la même
 * durée et la même courbe (globals.css, `.formations-acc-item`), la colonne ne varie jamais.
 */
export function FormationsAccordion({ active, onSelect }: FormationsAccordionProps) {
  const count = formationDomains.length;

  const onKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const keys: Record<string, number> = {
      ArrowDown: (active + 1) % count,
      ArrowUp: (active - 1 + count) % count,
      Home: 0,
      End: count - 1,
    };
    const next = keys[event.key];
    if (next === undefined) return;
    event.preventDefault();
    onSelect(next);
    document.getElementById(formationTriggerId(formationDomains[next]))?.focus({ preventScroll: true });
  };

  return (
    <div role="group" aria-label={formationsIntro.tablistLabel} className="formations-acc">
      {formationDomains.map((domain, index) => {
        const open = index === active;
        return (
          <div
            key={domain.id}
            data-open={open || undefined}
            className="fo-a formations-acc-item group/acc relative rounded-[18px] border border-text-on-dark/12 bg-text-on-dark/4 has-[button:focus-visible]:outline-2 has-[button:focus-visible]:outline-offset-3 has-[button:focus-visible]:outline-brand-gold-light data-open:border-brand-gold/35 data-open:bg-brand-gold/5 pointer-fine:not-data-open:hover:bg-text-on-dark/8"
            {...reveal(TABS_AT + index * TAB_STAGGER, 450, "translateX(-16px)")}
          >
            {/* Barre dorée verticale du volet ouvert */}
            <span
              aria-hidden="true"
              className="absolute inset-y-4 left-0 w-0.75 rounded-full bg-brand-gold opacity-0 transition-opacity duration-200 ease-out group-data-open/acc:opacity-80"
            />
            <h3 className="contents">
              <button
                type="button"
                id={formationTriggerId(domain)}
                aria-expanded={open}
                aria-controls={formationRegionId(domain)}
                aria-disabled={open || undefined}
                onClick={() => onSelect(index)}
                onKeyDown={onKeyDown}
                className="group/btn flex items-center gap-4 rounded-[17px] px-4.5 text-left text-tab font-bold text-text-on-dark/78 focus-visible:outline-none aria-expanded:cursor-default aria-expanded:text-text-on-dark"
              >
                <span className="text-sm font-extrabold tracking-badge text-brand-gold group-aria-expanded/btn:text-brand-gold/80">
                  {domain.num}
                </span>
                <span className="flex-1">{domain.tab}</span>
                <ChevronRight
                  aria-hidden="true"
                  strokeWidth={1.8}
                  className="formations-acc-chevron size-5 shrink-0 text-text-on-dark/50 group-aria-expanded/btn:text-brand-gold/70"
                />
              </button>
            </h3>
            <div
              role="region"
              id={formationRegionId(domain)}
              aria-labelledby={formationTriggerId(domain)}
              inert={!open}
              className="formations-acc-region"
            >
              <div className="formations-acc-body px-4.5 pb-4.5">
                <p className="mb-3.5 text-formation-body text-text-on-dark/78">{domain.text}</p>
                <FormationTags tags={domain.tags} compact />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
