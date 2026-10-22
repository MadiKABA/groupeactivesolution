import { existsSync } from "node:fs";
import { join } from "node:path";

import { heroSlides } from "@/lib/hero-slides";

import { HeroScrollHint } from "./HeroScrollHint";
import { HeroStage } from "./HeroStage";

/*
 * Section d'accueil. Le fond (dégradés, grain, filet bas) est rendu côté serveur ;
 * le carrousel, le motif et les animations vivent dans <HeroStage> (client).
 * L'indicateur de défilement pointe vers la section suivante (`#expertises`).
 * Le hero commence sous le header fixe : padding-top = hauteur du header. Sur desktop, il
 * occupe l'écran moins 96px, qui laissent voir le début de #expertises (teaser).
 */
export function Hero() {
  // Images absentes de public/ → emplacement signalé au lieu d'une image cassée.
  const imagesAvailable = heroSlides.map((slide) =>
    existsSync(join(process.cwd(), "public", slide.image)),
  );

  return (
    <section
      id="hero"
      aria-label="Présentation d'Active Solution"
      className="relative isolate flex flex-col overflow-hidden bg-brand-navy pt-18 text-text-on-dark [--focus-ring:var(--color-brand-gold)] lg:h-hero xl:pt-22.5"
    >
      <div aria-hidden="true" className="hero-backdrop pointer-events-none absolute inset-0 -z-10" />
      <div aria-hidden="true" className="hero-grain pointer-events-none absolute inset-0 -z-10" />

      <HeroStage imagesAvailable={imagesAvailable} />
      <HeroScrollHint targetId="expertises" />

      {/* Filet bas en dégradé, avant la section claire suivante */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-brand-gold/35 to-transparent"
      />
    </section>
  );
}
