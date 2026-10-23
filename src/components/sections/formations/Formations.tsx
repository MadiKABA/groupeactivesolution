import { ArrowRight } from "lucide-react";
import Link from "next/link";
import type { CSSProperties } from "react";

import { formationDomains, formationPanelId, formationsIntro, formationTabId } from "@/lib/formations";

import { FormationsCircuit } from "./FormationsCircuit";
import { FormationsInteractive } from "./FormationsInteractive";
import { FormationsPublics } from "./FormationsPublics";
import { reveal } from "./reveal";

/** Panneau de description : après le circuit (ms). */
const PANEL_AT = 1900;

/*
 * Section « Formations » (fond bleu nuit), après « Notre méthode ».
 * Rendue côté serveur : en-tête, circuit, les 5 panneaux, publics et bouton. Seuls l'onglet actif,
 * l'observateur d'entrée et la parallaxe vivent dans <FormationsInteractive> (unique composant client).
 * Sans JavaScript, tout est visible : onglet 01 actif, piste 01 allumée.
 */
export function Formations() {
  const header = (
    <header>
      <p className="flex items-center gap-3 text-xs font-semibold tracking-eyebrow text-brand-gold uppercase">
        <span aria-hidden="true" className="fo-a h-0.5 w-8 origin-left bg-brand-gold" {...reveal(0, 400, "scaleX(0)")} />
        <span className="fo-a" {...reveal(0, 400, "translateX(-12px)")}>
          {formationsIntro.eyebrow}
        </span>
      </p>
      <h2
        id="formations-title"
        className="fo-a fo-title mt-6 text-display-formations font-extrabold tracking-display-tighter text-text-on-dark max-sm:leading-[1.08] sm:whitespace-nowrap"
        {...reveal(120, 650)}
      >
        {formationsIntro.title} <span className="formations-gradient-text">{formationsIntro.titleHighlight}</span>
      </h2>
      <p className="fo-a mt-5 max-w-170 text-intro leading-relaxed text-text-on-dark/76" {...reveal(360, 500, "translateY(16px)")}>
        {formationsIntro.intro}
      </p>
    </header>
  );

  const panels = (
    <div className="fo-a mt-8 grid lg:mt-10" {...reveal(PANEL_AT, 450, "translateY(12px)")}>
      {formationDomains.map((domain, index) => (
        <div
          key={domain.id}
          role="tabpanel"
          id={formationPanelId(domain)}
          aria-labelledby={formationTabId(domain)}
          tabIndex={0}
          data-i={index + 1}
          className="formations-panel rounded-2xl border border-brand-gold/30 bg-(--glass-bg) p-5.5 [grid-area:1/1] lg:flex lg:items-center lg:justify-between lg:gap-10 lg:px-9 lg:py-7"
        >
          <div>
            <p className="text-tag font-semibold tracking-eyebrow-wide text-brand-gold uppercase">
              {domain.num} / {formationsIntro.panelKicker}
            </p>
            <h3 className="mt-2 text-formation font-bold text-text-on-dark">{domain.title}</h3>
            <p className="mt-2 max-w-165 text-base leading-relaxed text-text-on-dark/76">{domain.text}</p>
          </div>
          <ul className="mt-5 flex flex-wrap gap-2 lg:mt-0 lg:shrink-0 lg:flex-col">
            {domain.tags.map((tag, tagIndex) => (
              <li
                key={tag}
                className="formations-tag flex h-8.5 items-center gap-2.5 rounded-full border border-brand-gold/45 px-4 text-sm font-medium text-text-on-dark"
                style={{ "--fo-tag": tagIndex } as CSSProperties}
              >
                <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-gold" />
                {tag}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );

  const cta = (
    <div data-fo-target="c" className="mt-12 flex justify-center lg:mt-16">
      <Link
        href={formationsIntro.cta.href}
        className="fo-c group inline-flex h-14 w-full items-center justify-center gap-2.5 rounded-full bg-brand-gold px-8 text-base font-bold text-brand-navy transition-[background-color,translate,scale] duration-200 ease-out hover:-translate-y-0.5 hover:bg-brand-gold-light focus-visible:bg-brand-gold-light active:scale-98 sm:w-auto"
        {...reveal(0, 500, "translateY(16px) scale(.96)")}
      >
        {formationsIntro.cta.label}
        <ArrowRight
          aria-hidden="true"
          className="size-4.5 transition-transform duration-200 ease-out motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1"
        />
      </Link>
    </div>
  );

  return (
    <section
      id="formations"
      aria-labelledby="formations-title"
      className="formations-section relative isolate overflow-x-clip bg-brand-navy text-text-on-dark [--focus-ring:var(--color-brand-gold-light)]"
    >
      <FormationsInteractive header={header} circuit={<FormationsCircuit />} panels={panels} publics={<FormationsPublics />} cta={cta} />
    </section>
  );
}
