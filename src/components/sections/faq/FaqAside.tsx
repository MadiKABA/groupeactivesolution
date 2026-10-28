import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { reveal } from "@/components/sections/formations/reveal";
import { WaveMotif } from "@/components/ui/WaveMotif";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import { faqContact } from "@/lib/faq";
import { getWhatsAppUrl } from "@/lib/site";

import { FaqQuestionMark } from "./FaqQuestionMark";

/** Cascade interne (ms, depuis l'entrée de l'aside) : scène, titre, texte, boutons. */
const STEPS = { scene: 150, title: 230, text: 310, whatsapp: 390, contact: 470 } as const;
const lift = (delay: number) => reveal(delay, 400, "translateY(12px)");

/**
 * Bloc contact (fond bleu nuit), à droite des questions en desktop (sticky), après elles sinon.
 * Zigzag sombre, halo, projecteur qui suit le pointeur et scène du « ? » (desktop) : décoratifs.
 * Entrée en classe `fq-s` (déclenchée avec l'en-tête en desktop, à sa propre vue sinon).
 */
export function FaqAside() {
  return (
    <aside
      aria-label={faqContact.label}
      data-fq-target="b"
      className="faq-aside fq-s relative mt-8 overflow-hidden rounded-hero border border-brand-gold/40 bg-brand-navy p-6 text-text-on-dark shadow-aside [--focus-ring:var(--color-brand-gold-light)] lg:sticky lg:top-[calc(var(--hdr-h)+2rem)] lg:mt-0 lg:w-100 lg:flex-none lg:p-7"
      {...reveal(0, 700)}
    >
      <WaveMotif tone="dark" mask="bl" />
      <div aria-hidden="true" className="faq-spot pointer-events-none absolute top-0 left-0 size-65 rounded-full" />

      <div className="fq-s faq-scene relative hidden lg:block" data-inview="false" {...reveal(STEPS.scene, 450, "none")}>
        <div aria-hidden="true" className="faq-scene-halo pointer-events-none absolute top-1/2 left-1/2 size-80 rounded-full" />
        <FaqQuestionMark />
      </div>

      <p className="fq-s relative text-aside-sm font-bold lg:mt-3.5 lg:text-step" {...lift(STEPS.title)}>
        {faqContact.title}
      </p>
      <p className="fq-s relative mt-2 text-aside-body text-text-on-dark/76" {...lift(STEPS.text)}>
        {faqContact.text}
      </p>

      <a
        href={getWhatsAppUrl()}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={faqContact.whatsapp.ariaLabel}
        className="faq-wa fq-s relative mt-4 flex h-13.5 w-full items-center justify-center gap-2.5 overflow-hidden rounded-full bg-brand-gold text-base font-bold text-brand-navy"
        {...lift(STEPS.whatsapp)}
      >
        <WhatsAppIcon className="relative size-5.5" />
        <span className="relative">{faqContact.whatsapp.label}</span>
      </a>
      <Link
        href={faqContact.cta.href}
        className="faq-contact fq-s group relative mt-2.5 flex h-13.5 w-full items-center justify-center gap-2.5 rounded-full border border-text-on-dark/30 text-base font-bold text-text-on-dark"
        {...lift(STEPS.contact)}
      >
        {faqContact.cta.label}
        <ArrowRight aria-hidden="true" className="faq-contact-arrow size-4.5" />
      </Link>
    </aside>
  );
}
