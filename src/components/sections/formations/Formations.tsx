import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { formationDomains, formationPanelId, formationsIntro, formationTabId } from "@/lib/formations";

import { FormationTags } from "./FormationTags";
import { FormationsInteractive } from "./FormationsInteractive";
import { FormationsPublics } from "./FormationsPublics";
import { reveal } from "./reveal";

/** Panneau de description (sous 1100px) : après le circuit (ms). */
const PANEL_AT = 1900;

/*
 * Section « Formations » (fond bleu nuit), après « Notre méthode ».
 * Rendue côté serveur : en-tête, les 5 panneaux mobiles, publics et bouton. L'onglet actif, le circuit
 * (aligné sur les onglets en desktop), l'observateur d'entrée et la parallaxe vivent dans
 * <FormationsInteractive> (unique composant client).
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
        className="fo-a fo-title mt-6 fo-desk:mt-5 text-display-formations font-extrabold tracking-display-tighter text-text-on-dark max-sm:leading-[1.08] sm:whitespace-nowrap"
        {...reveal(120, 650)}
      >
        {formationsIntro.title} <span className="formations-gradient-text">{formationsIntro.titleHighlight}</span>
      </h2>
      <p className="fo-a mt-5 max-w-170 text-intro leading-relaxed text-text-on-dark/76" {...reveal(360, 500, "translateY(16px)")}>
        {formationsIntro.intro}
      </p>
    </header>
  );

  // Panneau de description des pastilles (sous 1100px) ; au-delà, le texte est dans l'accordéon.
  const panels = (
    <div className="fo-a mt-3.5 grid fo-desk:hidden" {...reveal(PANEL_AT, 450, "translateY(12px)")}>
      {formationDomains.map((domain, index) => (
        <div
          key={domain.id}
          role="tabpanel"
          id={formationPanelId(domain)}
          aria-labelledby={formationTabId(domain)}
          tabIndex={0}
          data-i={index + 1}
          className="formations-panel rounded-[20px] border border-text-on-dark/12 bg-text-on-dark/5 p-5.5 [grid-area:1/1]"
        >
          <h3 className="text-formation-sm font-bold text-text-on-dark">{domain.title}</h3>
          <p className="mt-2 text-formation-body text-text-on-dark/78">{domain.text}</p>
          <div className="mt-4">
            <FormationTags tags={domain.tags} />
          </div>
        </div>
      ))}
    </div>
  );

  const cta = (
    <div data-fo-target="c" className="mt-12 flex justify-center lg:mt-16 fo-desk:mt-12">
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
      <FormationsInteractive header={header} panels={panels} publics={<FormationsPublics />} cta={cta} />
    </section>
  );
}
