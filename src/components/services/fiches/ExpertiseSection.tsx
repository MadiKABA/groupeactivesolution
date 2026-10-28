import { ArrowRight, Check } from "lucide-react";

import type { Expertise, ExpertiseFiche } from "@/lib/expertises";

import { DomainGrid } from "./DomainGrid";
import { ExpertisePhoto } from "./ExpertisePhoto";
import { SectionBackdrop } from "./SectionBackdrop";

/** Titre : nom en petit, puis l'accroche ; « : » pour lecteur d'écran, le h2 se lit d'un trait. */
function ExpertiseHeading({ id, name, hook }: { id: string; name: string; hook: ExpertiseFiche["hook"] }) {
  return (
    // tabIndex -1 : reçoit le focus après une ancre vers la fiche (FicheFocus)
    <h2 id={id} tabIndex={-1} className="xp-title">
      <span className="xp-label">
        <span aria-hidden="true" className="xp-label-line" />
        {name}
      </span>
      <span className="sr-only"> : </span>
      <span className="xp-hook">
        <span className="xp-hook-inner">
          {hook.before}
          <span className="xp-hook-gold">{hook.highlight}</span>
          {hook.after}
        </span>
      </span>
    </h2>
  );
}

/** « Pour qui » : pastilles informatives, non interactives. */
function AudienceChips({ audience }: { audience: readonly string[] }) {
  return (
    <div className="xp-audience">
      <p className="xp-audience-label">Pour qui :</p>
      <ul className="xp-chips">
        {audience.map((item) => (
          <li key={item} className="xp-chip">
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ApproachList({ approach }: { approach: readonly string[] }) {
  return (
    <ul className="xp-approach">
      {approach.map((item) => (
        <li key={item} className="xp-approach-item">
          <span aria-hidden="true" className="xp-approach-check">
            <Check />
          </span>
          {item}
        </li>
      ))}
    </ul>
  );
}

function SectionLink({ href, label }: ExpertiseFiche["link"]) {
  return (
    <a href={href} className="xp-link">
      {label}
      <span aria-hidden="true" className="xp-link-circle">
        <ArrowRight />
      </span>
    </a>
  );
}

type ExpertiseSectionProps = {
  expertise: Expertise;
  /** Photo détectée dans public/ au build ; absente → fond de repli. */
  photo?: string;
};

/*
 * Fiche d'une expertise sur /services (Server Component). Les entrées au défilement sont en CSS
 * (animation-timeline, amélioration progressive) : tout le contenu est visible sans elles.
 */
export function ExpertiseSection({ expertise, photo }: ExpertiseSectionProps) {
  const { anchor, anchorAliases, name, fiche } = expertise;
  const titleId = `${anchor}-title`;

  return (
    <section
      id={anchor}
      aria-labelledby={titleId}
      className={`xp-section xp-section--${fiche.theme === "sombre" ? "dark" : "light"}${fiche.photoSide === "gauche" ? " xp-section--photo-left" : ""}`}
    >
      {/* Anciennes ancres : mènent au début de la même fiche */}
      {anchorAliases.map((alias) => (
        <span key={alias} id={alias} aria-hidden="true" className="xp-alias" />
      ))}
      <SectionBackdrop dark={fiche.theme === "sombre"} />

      <div className="xp-inner site-container">
        <div className="xp-text">
          <ExpertiseHeading id={titleId} name={name} hook={fiche.hook} />
          <p className="xp-paragraph">{fiche.paragraph}</p>
          <AudienceChips audience={fiche.audience} />
          <ApproachList approach={fiche.approach} />
          <SectionLink {...fiche.link} />
        </div>
        <ExpertisePhoto src={photo} photo={fiche.photo} />
        <DomainGrid label={`Domaines : ${name}`} domains={fiche.domains} />
      </div>
    </section>
  );
}
