import { existsSync } from "node:fs";
import { join } from "node:path";

import { realisationImagePath, realisationVisuels } from "@/lib/realisations";

import { RealisationsMotion } from "./RealisationsMotion";

/*
 * Section « Des idées aux réalisations » (fond bleu nuit), après « Nos expertises ».
 * Rendue côté serveur : vérification des photos et décision d'affichage ; tout le contenu animé
 * vit dans <RealisationsMotion> (unique composant client). En production, la section n'est
 * publiée que si les trois photos existent dans public/realisations/ (ou si
 * SHOW_PLACEHOLDER_SECTIONS vaut "true") ; en développement, des emplacements les remplacent.
 */
export function Realisations() {
  const images = realisationVisuels.map((visuel) => {
    const path = realisationImagePath(visuel);
    return existsSync(join(process.cwd(), "public", path)) ? path : null;
  });

  const complete = images.every(Boolean);
  if (process.env.NODE_ENV === "production" && !complete && process.env.SHOW_PLACEHOLDER_SECTIONS !== "true") {
    return null;
  }

  return (
    <section
      id="realisations"
      aria-labelledby="realisations-title"
      className="realisations-section relative isolate overflow-x-clip bg-brand-navy text-text-on-dark [--focus-ring:var(--color-brand-gold)]"
    >
      <RealisationsMotion images={images} />
    </section>
  );
}
