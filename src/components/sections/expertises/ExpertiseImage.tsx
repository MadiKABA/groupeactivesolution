import Image from "next/image";
import type { CSSProperties } from "react";

import type { Expertise } from "@/lib/expertises";

import { ExpertisePlaceholder } from "./ExpertisePlaceholder";

export const EXPERTISE_IMAGE_SIZES = "(min-width: 1024px) 56vw, 100vw";
export const EXPERTISE_IMAGE_QUALITY = 78;

/**
 * Photo d'une expertise (ou emplacement graphique si le fichier est absent).
 * Le point focal change selon le palier : cadre presque carré en desktop, large et bas ailleurs.
 */
export function ExpertiseImage({ expertise, src }: { expertise: Expertise; src: string | null }) {
  if (!src) return <ExpertisePlaceholder expertise={expertise} />;
  return (
    <Image
      src={src}
      alt={expertise.alt}
      fill
      sizes={EXPERTISE_IMAGE_SIZES}
      quality={EXPERTISE_IMAGE_QUALITY}
      loading="lazy"
      decoding="async"
      draggable={false}
      className="object-cover [object-position:var(--focal-m)] desk:[object-position:var(--focal-d)]"
      style={{ "--focal-m": expertise.focalMobile, "--focal-d": expertise.focalDesktop } as CSSProperties}
    />
  );
}
