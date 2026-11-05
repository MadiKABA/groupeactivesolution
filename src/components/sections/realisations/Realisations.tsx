import { existsSync } from "node:fs";
import { join } from "node:path";

import { reveal } from "@/components/sections/formations/reveal";
import { realisations, realisationsClosing, realisationsIntro, type Realisation } from "@/lib/realisations";

import { RealisationsBento } from "./RealisationsBento";
import { RealisationsController } from "./RealisationsController";
import { RealisationsLink } from "./RealisationsLink";
import { RealisationsScene, RealisationsStacked } from "./RealisationsScene";

const publicFile = (src: string) => existsSync(join(process.cwd(), "public", src));
const ROUTE_FILES = ["page.tsx", "page.ts", "page.jsx", "page.js"].map((file) => join(process.cwd(), "src", "app", "realisations", file));

/** Les 2 photos du projet existent (scène) : jamais le cas, une seule photo par carte. */
const hasPhotos = (project: Realisation) => project.photos.length === 2 && project.photos.every((photo) => publicFile(photo.src));
/** La photo de la carte existe dans public/realisations/ (mode bento). */
const hasCardPhoto = (project: Realisation) => project.photos.length > 0 && publicFile(project.photos[0].src);

/*
 * Section « Des idées aux réalisations » (fond bleu nuit), après « Nos expertises ». Toujours publiée.
 * Mode choisi au serveur (au build, la page étant statique) : « scene » si les 3 projets ont leurs
 * 2 photos (non utilisé : une photo par carte), sinon « bento » (visuel graphique avec le nom du domaine,
 * remplacé par la photo réelle et sa légende dès que le fichier existe).
 * Le lien « Voir toutes nos réalisations » n'est rendu que si la route existe et qu'une vraie photo est présente.
 */
export function Realisations() {
  const mode = realisations.every(hasPhotos) ? "scene" : "bento";
  const photographed = realisations.map(hasCardPhoto);
  const showLink = ROUTE_FILES.some((file) => existsSync(file)) && realisations.some((project) => project.photos.some((photo) => publicFile(photo.src)));

  const header = (
    <header>
      <p className="flex items-center gap-3 text-xs font-semibold tracking-eyebrow text-brand-gold uppercase">
        <span aria-hidden="true" className="rz-a h-0.5 w-8 origin-left bg-brand-gold" {...reveal(0, 450, "scaleX(0)")} />
        <span className="rz-a" {...reveal(0, 450, "translateX(-12px)")}>
          {realisationsIntro.eyebrow}
        </span>
      </p>
      <h2
        id="realisations-title"
        className="rz-a rz-title mt-6 text-display-mobile font-extrabold tracking-display-tighter text-text-on-dark sm:text-display-formations sm:whitespace-nowrap"
        {...reveal(100, 700)}
      >
        {realisationsIntro.title} <span className="rz-gradient-text">{realisationsIntro.titleHighlight}</span>
      </h2>
      <div className="mt-6 flex flex-col items-start gap-5 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
        <p className="rz-a max-w-140 text-lg leading-relaxed text-text-on-dark/78" {...reveal(400, 450, "translateY(16px)")}>
          {realisationsIntro.intro}
        </p>
        {showLink && (
          <div className="rz-a" {...reveal(700, 450, "translateY(16px)")}>
            <RealisationsLink slot="a" />
          </div>
        )}
      </div>
    </header>
  );

  return (
    <section
      id="realisations"
      aria-labelledby="realisations-title"
      data-mode={mode}
      className="realisations-section relative isolate overflow-x-clip bg-brand-navy text-text-on-dark [--focus-ring:var(--color-brand-gold-light)]"
    >
      <RealisationsController mode={mode}>
        <div data-rz-target="a">
          {header}
          {mode === "scene" ? (
            <>
              <RealisationsScene projects={realisations} showLink={showLink} />
              <RealisationsStacked projects={realisations} />
            </>
          ) : (
            <RealisationsBento projects={realisations} photographed={photographed} />
          )}
        </div>

        {/* Fin : phrase révélée, puis ligne dorée jusqu'au bord droit de l'écran */}
        <div id="realisations-fin" tabIndex={-1} data-rz-target="c" className="mt-11 flex items-center gap-5 outline-none lg:mt-18 lg:gap-8">
          <p className="rz-closing text-closing font-extrabold tracking-display-tight text-text-on-dark">
            {realisationsClosing.text} <span className="rz-gradient-text">{realisationsClosing.highlight}</span>
          </p>
          <span aria-hidden="true" className="rz-closing-line h-0.5 min-w-12 flex-1 origin-left" />
        </div>
      </RealisationsController>
    </section>
  );
}
