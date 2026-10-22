import { existsSync } from "node:fs";
import { join } from "node:path";

import { SectionHeader } from "@/components/ui/SectionHeader";
import { expertiseImagePath, expertises, expertisesIntro } from "@/lib/expertises";

import { ExpertisesScroller } from "./ExpertisesScroller";
import { SectionMotif } from "./SectionMotif";

/*
 * Section « Nos expertises » (fond clair). Rendue côté serveur ; seule la partie
 * interactive (bloc actif, visuel sticky) est un composant client.
 * Sur desktop, le padding-top réduit laisse voir le libellé et le début du titre
 * dans les 96px de teaser sous le hero.
 */
export function Expertises() {
  // Photos déposées dans public/expertises/ prises en compte au build, sinon emplacement graphique.
  const images = expertises.map((expertise) => {
    const path = expertiseImagePath(expertise.slug);
    return existsSync(join(process.cwd(), "public", path)) ? path : null;
  });

  return (
    <section
      id="expertises"
      aria-labelledby="expertises-title"
      className="expertises-section relative isolate overflow-x-clip bg-surface-warm pt-16 lg:pt-10"
    >
      {/* Motif sur toute la section ; le padding bas est porté par la scène (sticky jusqu'au bout) */}
      <SectionMotif />
      {/* Contenu au-dessus du motif, sans fond opaque */}
      <div className="relative z-10 mx-auto max-w-site px-6 md:px-10 xl:px-28">
        <SectionHeader
          id="expertises-title"
          eyebrow={expertisesIntro.eyebrow}
          titleLines={expertisesIntro.titleLines}
          underlineLast
          display
          intro={expertisesIntro.intro}
        />
        <ExpertisesScroller images={images} />
      </div>
    </section>
  );
}
