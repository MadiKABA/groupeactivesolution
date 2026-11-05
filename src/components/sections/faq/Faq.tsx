import { reveal } from "@/components/sections/formations/reveal";
import { faqIntro, faqItems, faqJsonLd } from "@/lib/faq";

import { FaqAside } from "./FaqAside";
import { FaqInteractive } from "./FaqInteractive";
import { FaqQuestion } from "./FaqQuestion";

/*
 * Section « FAQ » (fond clair), après « Formations ».
 * Rendue côté serveur : en-tête, bloc contact (aside), données JSON-LD et repli sans JS ;
 * les 3 questions s'affichent directement avec leur réponse ; <FaqInteractive> (unique composant client)
 * ne gère que les entrées, la profondeur du « ? » et le projecteur de l'aside.
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

  const questions = (
    <ul className="faq-list flex flex-col gap-3">
      {faqItems.map((item, index) => (
        <FaqQuestion key={item.id} item={item} index={index} />
      ))}
    </ul>
  );

  return (
    <section id="faq" aria-labelledby="faq-title" className="faq-section relative isolate overflow-x-clip bg-surface-warm text-brand-navy">
      {/* FAQPage : les 3 questions affichées ; « < » échappé pour ne jamais fermer la balise */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd()).replace(/</g, "\\u003c") }}
      />
      <FaqInteractive header={header} aside={<FaqAside />}>
        {questions}
      </FaqInteractive>
    </section>
  );
}
