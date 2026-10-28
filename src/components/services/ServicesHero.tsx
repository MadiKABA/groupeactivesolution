import { ArrowDown } from "lucide-react";

import { WaveMotif } from "@/components/ui/WaveMotif";
import { expertises, type ExpertiseSlug } from "@/lib/expertises";
import { servicesHero } from "@/lib/services";

import { ExpertiseTile } from "./ExpertiseTile";
import { MosaicParallax } from "./MosaicParallax";

/*
 * Hero de /services. Server Component : l'entrée est en CSS pur (classes `sv-*` de globals.css),
 * le texte est visible sans JavaScript ; seule la parallaxe au pointeur est un îlot client.
 * Le padding-top compense le header fixe (72px, 90px en xl), comme les autres heros.
 */
export function ServicesHero({ photos = {} }: { photos?: Partial<Record<ExpertiseSlug, string>> }) {
  const { title, subtitle, ctaLabel, mosaicLabel } = servicesHero;

  return (
    <section aria-labelledby="services-hero-title" className="sv-hero">
      {/* Zigzag doré en SVG inline (une image de fond deviendrait l'élément LCP à la place du titre) : coin haut droit, hors du texte */}
      <div aria-hidden="true" className="sv-wave pointer-events-none absolute inset-0 -z-10">
        <WaveMotif tone="dark" mask="tr" hero />
      </div>

      <div className="sv-grid site-container">
        <div className="sv-text">
          {/* Une ligne par <span> (révélée dans son masque) ; espaces entre lignes pour la lecture */}
          <h1 id="services-hero-title" className="sv-title">
            <span className="sv-line">
              <span className="sv-line-inner">{title.line1}</span>
            </span>{" "}
            <span className="sv-line sv-line--2">
              <span className="sv-line-inner">
                {title.line2.before}
                <span className="sv-title-gold">{title.line2.highlight}</span>
              </span>
            </span>{" "}
            <span className="sv-line sv-line--3">
              <span className="sv-line-inner">{title.line3}</span>
            </span>
          </h1>

          <p className="sv-subtitle">{subtitle}</p>

          <a href={`#${expertises[0].anchor}`} className="sv-cta">
            {ctaLabel}
            <ArrowDown aria-hidden="true" className="sv-cta-icon" />
          </a>
        </div>

        <nav aria-label={mosaicLabel} className="sv-visual">
          <div aria-hidden="true" className="sv-halo" />
          <MosaicParallax className="sv-mosaic-frame">
            <ul className="sv-mosaic">
              {expertises.map((expertise, index) => (
                <li key={expertise.slug} className="sv-mosaic-item">
                  <ExpertiseTile expertise={expertise} src={photos[expertise.slug]} first={index === 0} />
                </li>
              ))}
            </ul>
          </MosaicParallax>
        </nav>
      </div>
    </section>
  );
}
