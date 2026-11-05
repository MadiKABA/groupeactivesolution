import { ArrowDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

import { ButtonShine } from "@/components/ui/ButtonShine";
import { aboutArches, aboutHero, type AboutArchId } from "@/lib/about";
import { showPlaceholders } from "@/lib/flags";

/*
 * Hero « Notre manifeste » (page /a-propos). Server Component : entrées et portes des arches
 * en CSS pur (classes `about-*` de globals.css), rien ne dépend de JavaScript.
 * Le padding-top compense le header fixe (72px, 90px en xl), comme le hero de l'accueil.
 */

// Largeur rendue de chaque arche, d'après la géométrie de la figure (globals.css) dans le
// conteneur `site-container`. Les battants recomposent la photo à la même taille : même URL,
// téléchargée une seule fois.
const SIZES: Record<AboutArchId, string> = {
  enseigner: "(min-width: 1280px) 330px, (min-width: 1024px) 24vw, (min-width: 768px) 307px, calc(61.4vw - 30px)",
  batir: "(min-width: 1280px) 286px, (min-width: 1024px) 21vw, (min-width: 768px) 266px, calc(53.2vw - 26px)",
};
const QUALITY = 80;

type ArchProps = {
  id: AboutArchId;
  /** Photo réelle (chemin dans public/) ; absente → fond bleu nuit de repli. */
  src?: string;
  preload?: boolean;
};

/*
 * Porte à deux battants : au repos, les battants recomposent la photo entière ; au survol (souris),
 * ils pivotent vers l'intérieur et révèlent la vitre dépolie et la phrase. Non interactive :
 * la scène est une image (role="img"), toutes les couches internes sont décoratives.
 */
function Arch({ id, src, preload = false }: ArchProps) {
  const { label, description, phrase } = aboutArches[id];
  const photo = (extra?: { preload?: boolean; loading?: "eager" }) =>
    src ? (
      <Image
        src={src}
        alt=""
        fill
        sizes={SIZES[id]}
        quality={QUALITY}
        className="about-photo"
        {...extra}
      />
    ) : null;

  return (
    // Couche externe : masque d'entrée. La scène porte la perspective et le découpage de l'arche.
    <div className={`about-arch about-arch--${id}`}>
      {/* TODO : aria-label définitif à fournir (voir `description` dans src/lib/about.ts). */}
      <div role="img" aria-label={`${label} : ${description}`} className="about-stage">
        <div className="about-stage-back">{photo(preload ? { preload: true } : undefined)}</div>
        <div aria-hidden="true" className="about-glass" />
        <p aria-hidden="true" className="about-phrase">
          <span className="about-phrase-line" />
          <span className="about-phrase-text">{phrase[0]}</span>
          <span className="about-phrase-text">{phrase[1]}</span>
        </p>
        <span aria-hidden="true" className="about-slit" />
        {/* Conteneur : boucle d'entrebâillement ; battant : ouverture au survol (deux éléments distincts) */}
        {(["l", "r"] as const).map((side) => (
          <div key={side} aria-hidden="true" className={`about-ajar about-ajar--${side}`}>
            <div className={`about-leaf about-leaf--${side}`}>
              <div className="about-leaf-photo">{photo(preload ? { loading: "eager" } : undefined)}</div>
              <span className="about-leaf-shade" />
            </div>
          </div>
        ))}
        <span aria-hidden="true" className="about-label">
          <span className="about-label-dot" />
          {label}
        </span>
        <span aria-hidden="true" className="about-stage-edge" />
      </div>
    </div>
  );
}

type AboutHeroProps = {
  photos?: Partial<Record<AboutArchId, string>>;
};

export function AboutHero({ photos = {} }: AboutHeroProps) {
  const { badge, title, paragraphs, cta, hint, caption } = aboutHero;

  return (
    <section aria-labelledby="about-hero-title" className="about-hero">
      <div className="about-container site-container">
        <div className="about-text">
          <p className="about-badge">
            <span aria-hidden="true" className="about-badge-line" />
            {badge}
          </p>

          <h1 id="about-hero-title" className="about-title">
            <span className="about-line about-line--1">
              <span className="about-line-inner">
                {title.line1.before}
                <span className="about-title-gold">{title.line1.highlight}</span>
              </span>
            </span>{" "}
            <span className="about-line about-line--2">
              <span className="about-line-inner">{title.line2}</span>
            </span>
          </h1>

          <div className="about-copy">
            {paragraphs.map((text, index) => (
              <p key={index} className={index === 0 ? "about-copy-soft" : "about-copy-lead"}>
                {text}
              </p>
            ))}
          </div>

          <Link href={cta.href} className="about-cta btn-gold group">
            {cta.label}
            <ArrowDown aria-hidden="true" className="about-cta-icon" />
            <ButtonShine />
          </Link>
        </div>

        <div className="about-visual">
          <figure className="about-figure">
            <div className="about-arches">
              {/* Décor ancré au bas des arches : lueur chaude et arches de fond concentriques */}
              <div aria-hidden="true" className="about-glow" />
              <div aria-hidden="true" className="about-rings">
                <span className="about-ring about-ring--1" />
                <span className="about-ring about-ring--2" />
                <span className="about-ring about-ring--3" />
              </div>
              <Arch id="enseigner" src={photos.enseigner} preload />
              {/* Liseré doré derrière la grande arche : frère suivant, pour réagir à son survol */}
              <div aria-hidden="true" className="about-outline">
                <span className="about-outline-line" />
              </div>
              <Arch id="batir" src={photos.batir} />
            </div>
            <figcaption className="about-caption">
              <span aria-hidden="true" className="about-hint">
                <span className="about-hint-dot" />
                {hint}
              </span>
              {/* Légende provisoire : jamais en production (aucune légende fabriquée) */}
              {showPlaceholders && (
                <span className="about-caption-text">
                  <span aria-hidden="true" className="about-caption-line" />
                  {caption}
                </span>
              )}
            </figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
