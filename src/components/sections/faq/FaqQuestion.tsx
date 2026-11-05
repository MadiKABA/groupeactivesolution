import type { CSSProperties } from "react";

import { reveal } from "@/components/sections/formations/reveal";
import { faqNumber, type FaqItem } from "@/lib/faq";

/** Entrée des cartes : une par une après l'en-tête (ms). */
const CARDS_AT = 450;
const CARD_STAGGER = 120;

/** Question et réponse toujours visibles : h3 puis paragraphe (aucun accordéon). */
export function FaqQuestion({ item, index }: { item: FaqItem; index: number }) {
  const entry = reveal(CARDS_AT + index * CARD_STAGGER, 600, "translateY(28px) scale(.985)");
  return (
    <li
      className="fq-a faq-card relative flex gap-3.5 rounded-[18px] border border-brand-navy/8 bg-surface p-5 shadow-sm lg:gap-5 lg:px-7 lg:py-6"
      data-d={entry["data-d"]}
      style={{ ...entry.style, "--i": index } as CSSProperties}
    >
      <span aria-hidden="true" className="w-7 shrink-0 text-tag font-extrabold text-gold-ink-strong lg:text-sm">
        {faqNumber(item)}
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="text-question-sm font-bold tracking-question text-brand-navy lg:text-question">{item.question}</h3>
        <p className="mt-2 max-w-159 text-answer-sm text-brand-navy/75 lg:max-w-150 lg:text-answer">{item.answer}</p>
      </div>
    </li>
  );
}
