import { existsSync } from "node:fs";
import path from "node:path";

import Image from "next/image";
import type { CSSProperties } from "react";

import { RoleReveal } from "./formations-ecole-role-reveal";

/*
 * Section 2 de /formations/ecole, « Notre rôle ». Server Component ; seul `RoleReveal` (îlot client
 * sans rendu) pose l'état d'entrée. Desktop (≥ 1024px) : maquette 1280 × 840 reproduite dans une boîte
 * pleine largeur en aspect-ratio, tout en pourcentages et en `cqw` ; bandes obliques (clip-path sur le
 * conteneur), voile bleu nuit, texte blanc sur l'image. En dessous : engagements empilés. Styles `ro-*`.
 */

const SECTION_ID = "notre-role";

type Engagement = {
  id: "realiser" | "adapter" | "accompagner";
  number: string;
  title: string;
  text: string;
  /** Description de la photo (vue) ; la photo n'est utilisée que si le fichier existe dans public/. */
  alt: string;
  sizes: string;
};

const engagements: readonly Engagement[] = [
  {
    id: "realiser",
    number: "01",
    title: "Réaliser",
    text: "Chaque séance débouche sur quelque chose de concret.",
    alt: "Un formateur guide deux enfants qui assemblent un montage électronique devant un ordinateur portable",
    sizes: "(min-width: 1024px) 37vw, 100vw",
  },
  {
    id: "adapter",
    number: "02",
    title: "Adapter",
    text: "Club, atelier ponctuel ou intégration au cursus.",
    alt: "Élèves équipés d'ordinateurs portables dans une salle de classe, face à un écran de projection",
    sizes: "(min-width: 1024px) 42vw, 100vw",
  },
  {
    id: "accompagner",
    number: "03",
    title: "Accompagner",
    text: "Conception, formateurs, matériel et suivi.",
    alt: "Formateur devant des étudiants assis face à leurs ordinateurs dans une salle informatique",
    sizes: "(min-width: 1024px) 30vw, 100vw",
  },
];

const photoSrc = (id: Engagement["id"]) => {
  const file = `/images/formations/ecole/role-${id}.webp`;
  return existsSync(path.join(process.cwd(), "public", file)) ? file : null;
};

export function FormationsEcoleRole() {
  return (
    <section id={SECTION_ID} aria-labelledby="notre-role-title" className="ro">
      <RoleReveal targetId={SECTION_ID} />

      <div className="ro-canvas">
        {/* Arc fin en haut à droite : cercle r 260 centré en (1260, -20) */}
        <svg className="ro-arc" viewBox="1000 0 280 240" aria-hidden="true" focusable="false">
          <circle cx="1260" cy="-20" r="260" />
        </svg>

        <header className="ro-header site-container">
          <p className="ro-mark">
            <span className="ro-mark-line" aria-hidden="true" />
            Notre rôle
          </p>
          <h2 id="notre-role-title" className="ro-title">
            <span className="ro-line">
              <span className="ro-line-inner">Un partenaire pour votre établissement,</span>
            </span>{" "}
            <span className="ro-line">
              <span className="ro-line-inner ro-title-gold">pas un intervenant de passage.</span>
            </span>
          </h2>
          <p className="ro-sub">
            Nous construisons avec chaque établissement un cadre d&apos;apprentissage adapté aux élèves, à leurs
            niveaux et aux objectifs pédagogiques.
          </p>
        </header>

        <ol className="ro-list">
          {engagements.map((item, index) => {
            const src = photoSrc(item.id);
            return (
              <li key={item.id} className={`ro-item ro-item--${index + 1}`} style={{ "--i": index } as CSSProperties}>
                <div className="ro-band">
                  <div className="ro-band-inner hero-backdrop">
                    {src ? (
                      <Image src={src} alt={item.alt} fill quality={75} sizes={item.sizes} className="ro-photo" />
                    ) : (
                      <svg className="ro-placeholder" viewBox="0 0 68 68" aria-hidden="true" focusable="false">
                        <circle cx="34" cy="34" r="33" />
                        <circle cx="34" cy="34" r="4" className="ro-placeholder-dot" />
                      </svg>
                    )}
                    <div className="ro-veil" aria-hidden="true" />
                  </div>
                </div>
                <div className="ro-copy">
                  <span className="ro-number" aria-hidden="true">
                    {item.number}
                  </span>
                  <h3 className="ro-item-title">{item.title}</h3>
                  <p className="ro-item-text">{item.text}</p>
                  <span className="ro-item-line" aria-hidden="true" />
                </div>
              </li>
            );
          })}
        </ol>

        {/* Traits dorés au milieu de l'espace entre les bandes (desktop) */}
        {/* Calque entre les marges (x 64 → 1216) : `none` + trait non mis à l'échelle (1.5px) */}
        <svg
          className="ro-diagonals"
          viewBox="64 0 1152 840"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <line x1="490" y1="326" x2="393" y2="758" pathLength={1} />
          <line x1="897" y1="280" x2="795" y2="730" pathLength={1} />
        </svg>

        <p className="ro-signature site-container">
          Comprendre. Expérimenter. <span className="ro-signature-gold">Créer.</span>
        </p>
      </div>
    </section>
  );
}
