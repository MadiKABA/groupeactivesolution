import { Plus } from "lucide-react";
import type { CSSProperties } from "react";

import { faqAnswerId, faqNumber, faqQuestionId, type FaqItem as FaqItemData } from "@/lib/faq";
import { reveal } from "@/components/sections/formations/reveal";

/** Entrée des cartes : une par une après les onglets (ms). */
const CARDS_AT = 700;
const CARD_STAGGER = 120;

type FaqItemProps = {
  item: FaqItemData;
  open: boolean;
  /** Carte d'une autre catégorie que celle affichée. */
  hidden: boolean;
  /** Rang dans sa catégorie (cascades d'entrée et de changement de catégorie). */
  index: number;
  onToggle: (id: number) => void;
};

/**
 * Carte accordéon (pattern WAI-ARIA) : h3 > bouton (aria-expanded, aria-controls) et région de
 * réponse (role="region", inert une fois fermée). Ouverture en CSS : grid-template-rows 0fr → 1fr,
 * réponse en opacité + translation, rotation du plus, barre dorée et anneau (calques en opacité / transform).
 */
export function FaqItem({ item, open, hidden, index, onToggle }: FaqItemProps) {
  const entry = reveal(CARDS_AT + index * CARD_STAGGER, 600, "translateY(28px) scale(.985)");
  return (
    <li
      hidden={hidden}
      data-faq-card
      className={`fq-a faq-card relative rounded-[18px] border border-brand-navy/8 bg-surface shadow-sm ${open ? "is-open" : ""}`}
      data-d={entry["data-d"]}
      style={{ ...entry.style, "--i": index } as CSSProperties}
    >
      {/* Ombre de survol (pseudo-élément ::after), bordure dorée, anneau et ombre de la carte ouverte : calques dont seule l'opacité change */}
      <span aria-hidden="true" className="faq-ring pointer-events-none absolute -inset-px rounded-[inherit]" />
      {/* Barre dorée verticale (scaleY depuis le haut) */}
      <span aria-hidden="true" className="faq-bar pointer-events-none absolute top-4.5 bottom-4.5 left-0 w-0.75 rounded-full bg-brand-gold" />

      <h3>
        <button
          type="button"
          id={faqQuestionId(item)}
          aria-expanded={open}
          aria-controls={faqAnswerId(item)}
          onClick={() => onToggle(item.id)}
          className="relative flex min-h-17 w-full cursor-pointer items-center gap-3.5 rounded-[18px] py-3 pr-4 pl-4.5 text-left lg:min-h-24 lg:gap-5 lg:px-7 lg:py-2"
        >
          <span aria-hidden="true" className="faq-num w-7 shrink-0 text-tag font-extrabold text-brand-navy/60 lg:text-sm">
            {faqNumber(item)}
          </span>
          <span className="flex-1 text-question-sm font-bold tracking-question text-brand-navy lg:text-question">{item.question}</span>
          <span
            aria-hidden="true"
            className="faq-plus flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-navy lg:size-11"
          >
            <Plus strokeWidth={2.6} className="faq-plus-icon size-4 text-brand-gold lg:size-4.5" />
          </span>
        </button>
      </h3>

      <div role="region" id={faqAnswerId(item)} aria-labelledby={faqQuestionId(item)} inert={!open} className="faq-answer grid">
        <div className="min-h-0 overflow-hidden">
          <p className="faq-answer-inner max-w-159 px-4.5 pb-5.5 text-answer-sm text-brand-navy/75 lg:max-w-150 lg:pr-7 lg:pb-7.5 lg:pl-19 lg:text-answer">
            {item.answer.map((segment, segmentIndex) =>
              segment.strong ? (
                <strong key={segmentIndex} className="font-bold text-brand-navy">
                  {segment.text}
                </strong>
              ) : (
                <span key={segmentIndex}>{segment.text}</span>
              ),
            )}
          </p>
        </div>
      </div>
    </li>
  );
}
