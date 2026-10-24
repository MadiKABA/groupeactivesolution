import Image from "next/image";
import type { CSSProperties } from "react";

import { reveal } from "@/components/sections/formations/reveal";
import { realisationsIntro, type Realisation } from "@/lib/realisations";

import { RealisationIllustration } from "./RealisationsIllustrations";

export const REALISATION_IMAGE_QUALITY = 78;

/** Ouverture des tuiles (rideau de 800 ms) après le début de la séquence (ms) ; légende 300 ms après. */
const TILE_AT = [700, 1000, 1200] as const;
const LEGEND_AFTER = 300;

const TILE_LAYOUT = [
  {
    className: "rz-tile-main md:col-span-2 lg:col-span-8 lg:row-span-2",
    sizes: "(min-width:1024px) 66vw, 100vw",
  },
  {
    className: "rz-tile-alt lg:col-span-4 lg:col-start-9 lg:row-start-1",
    sizes: "(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw",
  },
  {
    className: "lg:col-span-4 lg:col-start-9 lg:row-start-2",
    sizes: "(min-width:1024px) 33vw, (min-width:768px) 50vw, 100vw",
  },
] as const;

type BentoProps = {
  projects: readonly Realisation[];
  /** Projets dont les 2 photos existent : la première remplace l'illustration. */
  photographed: readonly boolean[];
};

/**
 * Mode « bento » (tant que les photos manquent) : 3 tuiles, une par domaine. Tuile illustrée
 * (étiquetée « Illustration ») ou photo réelle du projet. Rendu serveur ; le rideau, la construction
 * des illustrations et les états de survol / tuile active sont en CSS, pilotés par RealisationsController.
 */
export function RealisationsBento({ projects, photographed }: BentoProps) {
  return (
    <div className="rz-bento relative mt-10 lg:mt-14">
      <div aria-hidden="true" className="rz-glow-gold pointer-events-none absolute" />
      <ul className="relative grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 lg:grid-cols-12 lg:grid-rows-[17.5rem_17.5rem]">
        {projects.map((project, index) => {
          const photo = photographed[index] ? project.photos[0] : null;
          const layout = TILE_LAYOUT[index];
          const tileAt = TILE_AT[index];
          return (
            <li
              key={project.id}
              data-rz-tile={index}
              data-photo={photo ? "" : undefined}
              className={`rz-tile rz-a group/tile relative isolate overflow-hidden border ${index === 0 ? "rounded-hero" : "rounded-2xl"} ${layout.className}`}
              style={{ "--tile-at": `${tileAt}ms` } as CSSProperties}
              {...{ "data-d": tileAt }}
            >
              <div aria-hidden="true" className="rz-tile-halo pointer-events-none absolute" />
              <div aria-hidden="true" className="rz-tile-spot pointer-events-none absolute top-0 left-0 size-65 rounded-full" />

              {/* Petites tuiles illustrées : dessin cadré entre l'index et la légende */}
              <div className={`rz-art absolute ${photo || index === 0 ? "inset-0" : "inset-x-2 top-12 bottom-19"}`}>
                {photo ? (
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes={layout.sizes}
                    quality={REALISATION_IMAGE_QUALITY}
                    loading="lazy"
                    decoding="async"
                    className="object-cover"
                  />
                ) : (
                  <RealisationIllustration domain={project.domain} />
                )}
              </div>

              <div className="relative flex items-start justify-between p-5 lg:p-6">
                <span className="rz-index text-index font-extrabold">{project.index}</span>
                {!photo && (
                  <span className="rounded-full border border-text-on-dark/25 px-2.5 py-1 text-badge-xs font-bold tracking-category text-text-on-dark/80 uppercase">
                    {realisationsIntro.illustrationBadge}
                  </span>
                )}
              </div>

              <div
                className="rz-legend rz-a absolute bottom-4 left-4 max-w-[calc(100%-2rem)] rounded-2xl border px-4.5 py-3 lg:bottom-5 lg:left-5"
                {...reveal(tileAt + LEGEND_AFTER, 400, "translateY(14px)")}
              >
                <p className="flex items-center gap-2 text-2xs font-bold tracking-category text-brand-gold uppercase">
                  <span aria-hidden="true" className="size-1.5 rounded-full bg-brand-gold" />
                  {project.domainLabel}
                </p>
                {photo ? (
                  <>
                    <p className={`mt-1 font-semibold text-text-on-dark ${index === 0 ? "text-legend" : "text-legend-sm"}`}>{project.name}</p>
                    <p className="mt-0.5 text-sm text-text-on-dark/85">{project.caption}</p>
                  </>
                ) : (
                  <p className={`mt-1 text-text-on-dark ${index === 0 ? "text-legend font-semibold" : "text-legend-sm font-medium"}`}>
                    {project.illustrationText}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
