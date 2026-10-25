import type { CSSProperties } from "react";

import { ValidationMark } from "@/components/about/history/ValidationMark";
import { InViewReveal } from "@/components/ui/InViewReveal";
import { impactContent } from "@/content/impact";

// Calendrier de l'entrée (ms) : la règle se dessine par segments de 400ms à partir de 600ms ;
// losange, trait vertical puis chiffre de chaque colonne suivent le passage du trait.
const RULE_START = 600;
const SEGMENT = 400;
const numberDelay = (index: number) => RULE_START + index * SEGMENT + 250;

/*
 * Section « Notre impact » (page /a-propos, #impact). Server Component : chiffres, unités,
 * phrases, descriptions et date sont dans le HTML initial. Le grand chiffre et sa ligne sont
 * décoratifs (aria-hidden) ; la phrase complète (« Au moins dix applications livrées ») est le
 * texte lu par les lecteurs d'écran. InViewReveal (client) ne gère que l'entrée, le compteur et
 * la pause de la dérive du halo. Styles : classes `im-*`.
 * TODO : aucune donnée structurée pour ces chiffres tant qu'ils ne sont pas confirmés
 * (foundingDate de l'organisation : voir AboutJsonLd, année à confirmer).
 */
export function ImpactSection() {
  const { intro, figures, updatedAt } = impactContent;

  return (
    <section id="impact" aria-labelledby="impact-titre" className="im">
      <InViewReveal className="im-root" counters track sequenceMs={RULE_START + figures.length * SEGMENT + 1600}>
        <div aria-hidden="true" className="im-bg">
          <span className="im-halo" />
        </div>
        <div className="site-container">
          <header className="im-head">
            <div>
              <p className="im-label">
                <span aria-hidden="true" className="im-label-line" />
                <span className="im-label-text">{intro.label}</span>
              </p>
              <h2 id="impact-titre" className="im-title">
                <span className="im-title-line">
                  <span className="im-title-part" style={{ "--i": 0 } as CSSProperties}>
                    {intro.titleLines[0]}
                  </span>
                </span>{" "}
                <span className="im-title-line">
                  <span className="im-title-part" style={{ "--i": 1 } as CSSProperties}>
                    {intro.titleLines[1]}
                    <span className="im-accent">{intro.titleAccent}</span>
                  </span>
                </span>
              </h2>
            </div>
            <p className="im-intro">
              {intro.paragraph} <ValidationMark pending={intro.needsValidation} />
            </p>
          </header>

          <ul className="im-list">
            {figures.map((figure, index) => {
              const note = figure.note?.confirmed ? figure.note.text : null;
              return (
                <li
                  key={figure.id}
                  className="im-item"
                  style={{ "--i": index } as CSSProperties}
                >
                  <span aria-hidden="true" className="im-seg" />
                  <span aria-hidden="true" className="im-diamond" />
                  <span aria-hidden="true" className="im-tick" />
                  <p className="im-figure">
                    <span aria-hidden="true" className="im-num">
                      {/* Un seul élément porte le nombre : valeur finale au serveur, compteur par-dessus en JS */}
                      <span className="im-count" data-count={figure.value} data-delay={numberDelay(index)}>
                        {figure.value}
                      </span>
                      {figure.suffix && <span className="im-suffix">{figure.suffix}</span>}
                    </span>
                    <span aria-hidden="true" className="im-caption">
                      {figure.unit} <span className="im-word">{figure.label}</span>
                      {note && <span className="im-note">{note}</span>}
                    </span>
                    <span className="sr-only">
                      {figure.sentence}
                      {note ? `, ${note}` : ""}.
                    </span>
                  </p>
                  <p className="im-desc">
                    {figure.description} <ValidationMark pending={figure.needsValidation} />
                  </p>
                </li>
              );
            })}
          </ul>

          <p className="im-updated">
            Chiffres à jour : <time dateTime={updatedAt.iso}>{updatedAt.label}</time>.{" "}
            <ValidationMark pending={updatedAt.needsValidation} />
          </p>
        </div>
      </InViewReveal>
    </section>
  );
}
