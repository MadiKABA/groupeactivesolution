import Image from "next/image";
import type { CSSProperties } from "react";

import { ValidationMark } from "@/components/about/history/ValidationMark";
import { convictionsContent, type Conviction } from "@/content/convictions";

import { ConvictionsTabs } from "./ConvictionsTabs";

// Photo : 470px en desktop (colonne de droite), pleine largeur du panneau en dessous de 1024px.
const PHOTO_SIZES = "(min-width: 1024px) 470px, calc(100vw - 5rem)";

/*
 * Sans JavaScript : les quatre panneaux s'empilent et restent lisibles, les cercles sont des
 * liens d'ancre, aucune révélation. Même principe que « Notre histoire » (règle <noscript>
 * plutôt qu'une classe posée au montage : aucun saut de mise en page entre HTML et hydratation).
 */
const NO_SCRIPT_CSS = [
  ".cv-panels{display:flex!important;flex-direction:column;gap:1.25rem}",
  ".cv-panel{visibility:visible!important;opacity:1!important;pointer-events:auto!important}",
  ".cv-glass,.cv-tether,.cv-hint{display:none!important}",
  ".cv-tab[data-active] .cv-ring-active,.cv-tab[data-active] .cv-dot{opacity:0!important}",
  ".cv-tab[data-active] .cv-plus{opacity:1!important}",
  ".cv-tab[data-active] .cv-disc{background-color:var(--cv-disc-bg)!important}",
].join("");

const step = (index: number) => ({ "--i": index }) as CSSProperties;

/** Texte d'un panneau : intitulé, titre, texte et preuve (le bouton « suivante » est ajouté par les onglets). */
function PanelText({ conviction }: { conviction: Conviction }) {
  return (
    <>
      <p className="cv-step cv-label" style={step(0)}>
        <span aria-hidden="true" className="cv-label-line" />
        {conviction.number} — {conviction.label}
      </p>
      <h3 className="cv-step cv-h3" style={step(1)}>
        {conviction.title}
      </h3>
      <p className="cv-step cv-text" style={step(2)}>
        {conviction.text} <ValidationMark pending={conviction.needsValidation} />
      </p>
      <div className="cv-step cv-proof" style={step(3)}>
        <p className="cv-proof-label">Ce que nous en faisons</p>
        <p className="cv-proof-text">{conviction.proof}</p>
      </div>
    </>
  );
}

/** Photo du panneau ; placeholder rayé tant que `src` vaut null (dimensions réservées par le CSS). */
function PanelPhoto({ conviction, eager }: { conviction: Conviction; eager: boolean }) {
  const { photo } = conviction;
  return (
    <figure className="cv-photo">
      <div className="cv-photo-media">
        {photo.src ? (
          <Image
            src={photo.src}
            alt={photo.alt}
            fill
            sizes={PHOTO_SIZES}
            loading={eager ? "eager" : "lazy"}
            className="cv-photo-img"
          />
        ) : (
          <div role="img" aria-label={photo.alt} className="cv-ph">
            <span aria-hidden="true" className="cv-ph-label">
              Photo à fournir
            </span>
          </div>
        )}
      </div>
      {photo.src && <figcaption className="cv-caption">{photo.caption}</figcaption>}
    </figure>
  );
}

/*
 * Section « Nos convictions » (page /a-propos, #convictions). Server Component : les quatre
 * convictions complètes (titre, texte, preuve) sont dans le HTML initial, panneaux inactifs
 * compris (masqués par visibility et inert, jamais retirés du DOM). Styles : classes `cv-*`.
 */
export function ConvictionsSection() {
  const { intro, convictions } = convictionsContent;

  const heading = (
    <div className="cv-heading">
      <p className="cv-eyebrow">
        <span aria-hidden="true" className="cv-eyebrow-line" />
        <span className="cv-eyebrow-text">{intro.surtitre}</span>
      </p>
      <h2 id="convictions-titre" className="cv-title">
        {intro.titreLignes.map((line, index) => (
          <span key={line} className="cv-title-line">
            <span className="cv-title-part" style={step(index)}>
              {line}
            </span>
            {index === intro.titreLignes.length - 1 && (
              <>
                {" "}
                <span className="cv-title-part cv-accent" style={step(index + 1)}>
                  {intro.titreAccent}
                </span>
              </>
            )}
          </span>
        ))}
      </h2>
      <p aria-hidden="true" className="cv-hint">
        <span className="cv-hint-dot" />
        <span className="cv-hint-fine">Cliquez un cercle pour découvrir la conviction</span>
        <span className="cv-hint-touch">Touchez un cercle pour découvrir la conviction</span>
      </p>
      <ValidationMark pending={intro.needsValidation} />
    </div>
  );

  return (
    <section id="convictions" aria-labelledby="convictions-titre" className="cv">
      <noscript>
        <style>{NO_SCRIPT_CSS}</style>
      </noscript>
      <div aria-hidden="true" className="cv-stripes" />
      <div className="site-container">
        <ConvictionsTabs
          heading={heading}
          tabs={convictions.map(({ id, number, word, micro }) => ({ id, number, word, micro }))}
          panels={convictions.map((conviction, index) => ({
            text: <PanelText conviction={conviction} />,
            media: <PanelPhoto conviction={conviction} eager={index === 0} />,
          }))}
        />
      </div>
    </section>
  );
}
