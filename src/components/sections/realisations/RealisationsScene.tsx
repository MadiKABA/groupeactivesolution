import { getImageProps } from "next/image";
import Image from "next/image";
import type { CSSProperties } from "react";

import { reveal } from "@/components/sections/formations/reveal";
import { realisationsIntro, type Realisation, type RealisationPhoto } from "@/lib/realisations";

import { REALISATION_IMAGE_QUALITY } from "./RealisationsBento";
import { RealisationsLink } from "./RealisationsLink";

const SCENE_SIZES = "(min-width:1024px) 66vw, 100vw";
/** Image vide (1 × 1 transparent) : les photos des projets 2 et 3 ne sont demandées qu'à l'approche (RealisationsController). */
const EMPTY_IMAGE = "data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==";

const shortDomain = (project: Realisation) => project.domainLabel.split(" ")[0];

/** Photo d'une bande : agrandie à 1.16 et décalée par les variables de la scène (--t, --y), voir globals.css. */
function StripPhoto({ photo, position, deferred }: { photo: RealisationPhoto; position: number; deferred: boolean }) {
  const { props } = getImageProps({
    src: photo.src,
    alt: photo.alt,
    width: photo.width,
    height: photo.height,
    sizes: SCENE_SIZES,
    quality: REALISATION_IMAGE_QUALITY,
  });
  const { src, srcSet, sizes, alt, width, height } = props;
  const style = { "--i": position } as CSSProperties;
  return deferred ? (
    // eslint-disable-next-line @next/next/no-img-element -- chargement différé piloté par la scène (data-src)
    <img
      src={EMPTY_IMAGE}
      data-src={src}
      data-srcset={srcSet}
      sizes={sizes}
      alt={alt}
      width={width}
      height={height}
      decoding="async"
      className="rz-img"
      style={style}
    />
  ) : (
    // eslint-disable-next-line @next/next/no-img-element -- props de next/image (getImageProps), transform piloté en CSS
    <img src={src} srcSet={srcSet} sizes={sizes} alt={alt} width={width} height={height} loading="lazy" decoding="async" className="rz-img" style={style} />
  );
}

function Dots({ project }: { project: Realisation }) {
  return (
    <div className="flex items-center gap-1">
      {[0, 1].map((photo) => (
        <button
          key={photo}
          type="button"
          data-goto-photo={photo}
          aria-label={`${project.index} · photo ${photo + 1} sur 2`}
          className="rz-dot-button flex size-11 cursor-pointer items-center justify-center rounded-full"
        >
          <span data-dot={photo} className="rz-dot size-2 rounded-full" />
        </button>
      ))}
    </div>
  );
}

/**
 * Mode « scène » (les 3 projets ont leurs 2 photos) : intro dans le flux, puis une piste de
 * 3 × 120svh sous une scène sticky (barre compacte, cadre à bandes panoramiques, rail). Tout est
 * rendu au serveur ; RealisationsController écrit les variables de défilement sur .rz-stage.
 */
export function RealisationsScene({ projects, showLink }: { projects: readonly Realisation[]; showLink: boolean }) {
  const { title, titleHighlight, eyebrow, sceneLabel, skipLabel } = realisationsIntro;
  return (
    <div className="rz-scene">
      <a
        href="#realisations-fin"
        className="sr-only rounded-full bg-brand-gold px-5 py-3 text-sm font-bold text-brand-navy focus:not-sr-only focus:absolute focus:z-30 focus:mt-4 focus:px-5 focus:py-3"
      >
        {skipLabel}
      </a>
      <div className="rz-track relative">
        <div
          role="region"
          aria-label={sceneLabel}
          data-active="0"
          data-photo="0"
          className="rz-stage sticky top-(--hdr-h) flex h-[calc(100svh-var(--hdr-h))] flex-col"
        >
          {/* Barre compacte : visible pendant la scène (data-pinned) ; titre dupliqué masqué aux lecteurs d'écran */}
          <div className="rz-bar flex h-16 shrink-0 items-center justify-between gap-4 lg:h-18">
            <div aria-hidden="true" className="flex min-w-0 items-center gap-4">
              <span className="hidden items-center gap-3 text-xs font-semibold tracking-eyebrow text-brand-gold uppercase lg:flex">
                <span className="h-0.5 w-8 bg-brand-gold" />
                {eyebrow}
              </span>
              <span className="text-bar-title-sm font-extrabold tracking-display-tighter text-text-on-dark lg:text-bar-title lg:whitespace-nowrap">
                {title} <span className="rz-gradient-text">{titleHighlight}</span>
              </span>
            </div>
            {showLink && <RealisationsLink slot="b" inert />}
          </div>

          <div className="mt-6 flex min-h-0 flex-1 flex-col pb-5 lg:grid lg:grid-cols-12 lg:gap-5 lg:pb-8">
            {/* Cadre : 3 bandes superposées (2 photos côte à côte chacune), une visible à la fois */}
            <div className="rz-frame relative h-[min(46svh,22.5rem)] shrink-0 overflow-hidden rounded-hero border border-brand-gold/35 lg:col-span-8 lg:h-full">
              {projects.map((project, k) => (
                <div key={project.id} data-k={k} className="rz-strip">
                  {project.photos.slice(0, 2).map((photo, position) => (
                    <div key={photo.src} className="rz-shot">
                      <StripPhoto photo={photo} position={position} deferred={k > 0} />
                    </div>
                  ))}
                </div>
              ))}
              <div aria-hidden="true" className="rz-frame-spot pointer-events-none absolute top-0 left-0 size-65 rounded-full" />
            </div>

            {/* Sous 1024px : nom, légende et points du projet actif, puis les pastilles */}
            <div className="mt-4 flex min-h-0 flex-col lg:hidden">
              <div className="grid">
                {projects.map((project, k) => (
                  <div key={project.id} data-rz-k={k} className="rz-info col-start-1 row-start-1">
                    <p className="text-2xs font-bold tracking-category text-brand-gold uppercase">
                      {project.index} · {project.domainLabel}
                    </p>
                    <p className="mt-1 truncate text-lg font-bold text-text-on-dark">{project.domainLabel}</p>
                    <p className="line-clamp-2 text-sm leading-relaxed text-text-on-dark/78">{project.caption}</p>
                    <div className="-ml-3.5">
                      <Dots project={project} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-1 flex gap-2">
                {projects.map((project, k) => (
                  <button
                    key={project.id}
                    type="button"
                    data-goto-k={k}
                    data-rz-k={k}
                    aria-current={k === 0 ? "step" : undefined}
                    aria-label={`${project.index} · ${project.domainLabel}`}
                    className="rz-rail-item flex h-11 min-w-0 flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-full border px-3 text-xs font-bold"
                  >
                    <span>{project.index}</span>
                    {/* Domaine court à partir de 640px : jamais coupé */}
                    <span className="font-semibold max-sm:hidden">{shortDomain(project)}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Desktop : numéro, rail des projets, progression globale */}
            <div className="hidden min-h-0 gap-6 lg:col-span-4 lg:flex">
              <div aria-hidden="true" className="relative w-0.5 shrink-0 overflow-hidden rounded-full bg-text-on-dark/12">
                <span className="rz-progress absolute inset-0 origin-top bg-brand-gold" />
              </div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div aria-hidden="true" className="grid">
                  {projects.map((project, k) => (
                    <span key={project.id} data-rz-k={k} className="rz-number col-start-1 row-start-1 text-numeral-xl font-extrabold">
                      {project.index}
                    </span>
                  ))}
                </div>
                {/* Rail à hauteurs fixes : les entrées se décalent en transform (aucun décalage de mise en page) */}
                <ol className="rz-rail relative mt-4">
                  {projects.map((project, k) => (
                    <li key={project.id} data-rz-k={k} className="rz-rail-entry" style={{ "--i": k } as CSSProperties}>
                      <button
                        type="button"
                        data-goto-k={k}
                        data-rz-k={k}
                        aria-current={k === 0 ? "step" : undefined}
                        className="rz-rail-item relative flex w-full cursor-pointer flex-col items-start justify-center gap-1 rounded-2xl border px-5 text-left"
                      >
                        <span aria-hidden="true" className="rz-rail-bar absolute top-3 bottom-3 left-0 w-0.75 rounded-full bg-brand-gold" />
                        <span className="text-2xs font-bold tracking-category uppercase">
                          {project.index} · {project.domainLabel}
                        </span>
                        <span className="w-full truncate text-lg font-bold">{project.domainLabel}</span>
                      </button>
                      <div className="rz-rail-detail">
                        <p className="line-clamp-2 px-5 pt-3 text-nav leading-relaxed text-text-on-dark/78">{project.caption}</p>
                        <div className="ml-1.5">
                          <Dots project={project} />
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>

          <p data-rz-live aria-live="polite" className="sr-only" />
        </div>
      </div>
    </div>
  );
}

/** Repli de la scène (sans JS, animations réduites, écran de moins de 600px de haut) : projets empilés. */
export function RealisationsStacked({ projects }: { projects: readonly Realisation[] }) {
  return (
    // Le conteneur .rz-stacked ne porte aucune classe d'affichage : le CSS le masque quand la scène est active.
    <div className="rz-stacked">
      <div className="mt-10 flex flex-col gap-12 lg:mt-14 lg:gap-16">
        {projects.map((project, index) => (
          <article key={project.id} className="rz-a" {...reveal(700 + index * 150, 200, "none")}>
            <p className="text-2xs font-bold tracking-category text-brand-gold uppercase">
              {project.index} · {project.domainLabel}
            </p>
            <h3 className="mt-2 text-h3 font-bold text-text-on-dark">{project.domainLabel}</h3>
            <p className="mt-1 text-nav leading-relaxed text-text-on-dark/78">{project.caption}</p>
            <div className="mt-5 grid gap-4 md:grid-cols-2 lg:gap-5">
              {project.photos.slice(0, 2).map((photo) => (
                <div key={photo.src} className="relative aspect-5/3 overflow-hidden rounded-hero border border-brand-gold/35 bg-brand-navy-soft">
                  <Image
                    src={photo.src}
                    alt={photo.alt}
                    fill
                    sizes="(min-width:768px) 50vw, 100vw"
                    quality={REALISATION_IMAGE_QUALITY}
                    loading="lazy"
                    decoding="async"
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
