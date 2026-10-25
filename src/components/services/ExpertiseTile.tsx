import Image from "next/image";

import { servicesTileLinkLabel, type Expertise } from "@/lib/expertises";

// Largeur rendue : colonne de la mosaïque (desktop ≈ 22vw, tablette ≈ 45vw), pleine largeur
// ou demi-largeur en mobile. Seule la première vignette est préchargée (LCP possible).
const SIZES = {
  first: "(min-width: 1024px) 22vw, (min-width: 768px) 45vw, 100vw",
  other: "(min-width: 1024px) 22vw, (min-width: 768px) 45vw, 50vw",
};

type ExpertiseTileProps = {
  expertise: Expertise;
  /** Photo détectée dans public/ au build ; absente → fond de couleur de la vignette. */
  src?: string;
  first?: boolean;
};

/*
 * Vignette de la mosaïque du hero /services : lien vers la fiche de l'expertise. Couches : média
 * (zoom d'entrée), photo (zoom au survol), voile et dégradé, pastille en verre, contour doré (::after).
 */
export function ExpertiseTile({ expertise, src, first = false }: ExpertiseTileProps) {
  return (
    <a
      href={`#${expertise.anchor}`}
      aria-label={`${expertise.name} : ${servicesTileLinkLabel}`}
      className={`sv-tile sv-tile--${expertise.slug}`}
    >
      {src && (
        <span className="sv-tile-media">
          <Image
            src={src}
            alt={expertise.servicesAlt}
            fill
            sizes={first ? SIZES.first : SIZES.other}
            preload={first}
            className="sv-tile-img"
          />
        </span>
      )}
      <span aria-hidden="true" className="sv-tile-veil" />
      <span className="sv-tile-pill">{expertise.name}</span>
    </a>
  );
}
