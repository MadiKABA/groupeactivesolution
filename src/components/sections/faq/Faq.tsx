import { reveal } from "@/components/sections/formations/reveal";
import { faqCategories, faqIntro, faqItemsOf, faqJsonLd, faqNumber, type FaqItem as FaqItemData } from "@/lib/faq";

import { FaqAside } from "./FaqAside";
import { FaqInteractive } from "./FaqInteractive";

/** Sans JS : onglets et accordéon inopérants, remplacés par des <details> natifs. */
const NOSCRIPT_STYLE = ".faq-root [role=tablist],.faq-list{display:none!important}";

const answerOf = (item: FaqItemData) =>
  item.answer.map((segment, index) =>
    segment.strong ? (
      <strong key={index} className="font-bold text-brand-navy">
        {segment.text}
      </strong>
    ) : (
      <span key={index}>{segment.text}</span>
    ),
  );

/*
 * Section « FAQ » (fond clair), après « Formations ».
 * Rendue côté serveur : en-tête, bloc contact (aside), données JSON-LD et repli sans JS ;
 * la catégorie affichée et la question ouverte vivent dans <FaqInteractive> (unique composant client),
 * dont le rendu initial (catégorie 1, question 01 ouverte) est produit au serveur.
 */
export function Faq() {
  const header = (
    <header>
      <p className="flex items-center gap-3 text-xs font-semibold tracking-eyebrow text-brand-navy uppercase">
        <span aria-hidden="true" className="fq-a h-0.5 w-8 origin-left bg-brand-gold" {...reveal(0, 450, "scaleX(0)")} />
        <span className="fq-a" {...reveal(0, 450, "translateX(-12px)")}>
          {faqIntro.eyebrow}
        </span>
      </p>
      <h2
        id="faq-title"
        className="fq-a fq-title mt-6 text-display-formations font-extrabold tracking-display-tighter text-brand-navy max-sm:leading-[1.08] sm:whitespace-nowrap"
        {...reveal(100, 700)}
      >
        {faqIntro.title} <span className="gold-ink-text">{faqIntro.titleHighlight}</span>
      </h2>
    </header>
  );

  const fallback = (
    <noscript>
      <style>{NOSCRIPT_STYLE}</style>
      <div className="flex flex-col gap-3">
        {faqCategories.map((category, categoryIndex) => (
          <details key={category.id} open={categoryIndex === 0} className="rounded-[18px] border border-brand-navy/8 bg-surface p-5">
            <summary className="cursor-pointer text-lg font-bold text-brand-navy">{category.label}</summary>
            {faqItemsOf(category.id).map((item, itemIndex) => (
              <details key={item.id} open={categoryIndex === 0 && itemIndex === 0} className="mt-4">
                <summary className="cursor-pointer text-question-sm font-bold text-brand-navy">
                  {faqNumber(item)} · {item.question}
                </summary>
                <p className="mt-2 text-answer-sm text-brand-navy/75">{answerOf(item)}</p>
              </details>
            ))}
          </details>
        ))}
      </div>
    </noscript>
  );

  return (
    <section id="faq" aria-labelledby="faq-title" className="faq-section relative isolate overflow-x-clip bg-surface-warm text-brand-navy">
      {/* FAQPage : seulement les réponses rédigées ; « < » échappé pour ne jamais fermer la balise */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()).replace(/</g, "\\u003c") }}
      />
      <FaqInteractive header={header} aside={<FaqAside />} fallback={fallback} />
    </section>
  );
}
