import Image from "next/image";
import type { CSSProperties } from "react";

import { ValidationMark } from "@/components/about/history/ValidationMark";
import { teamContent, type TeamMember, type TeamSkill } from "@/content/equipe";

import { TeamObject } from "./TeamObjects";
import { TeamWorkbench } from "./TeamWorkbench";

const isDev = process.env.NODE_ENV !== "production";

/*
 * Sans JavaScript : les quatre panneaux s'empilent et restent lisibles, la scène reste visible,
 * les pastilles sont des liens d'ancre, aucune révélation (même principe que « Nos convictions »).
 */
const NO_SCRIPT_CSS = [
  ".eq-card{display:flex!important;flex-direction:column;gap:2rem}",
  ".eq-panel{visibility:visible!important;opacity:1!important;translate:none!important}",
  ".eq-panel .eq-step{opacity:1!important;translate:none!important}",
  ".eq-panel+.eq-panel{padding-top:2rem;border-top:1px solid var(--color-border-subtle)}",
  ".eq-hint,.eq-link{display:none!important}",
].join("");

/*
 * Retours à la ligne du titre (une seule phrase dans le HTML) : 3 lignes dès 1024px
 * (« Derrière Active Solution, » / « une équipe qui forme, développe, » / « conseille et
 * accompagne. »), 4 lignes en dessous. Chaque morceau porte son numéro de ligne pour la
 * révélation ligne par ligne (--ld desktop, --lm mobile).
 */
const TITLE_LINES = [
  { desk: 0, mobile: 0, breakAfter: "both" },
  { desk: 1, mobile: 1, breakAfter: "mobile" },
  { desk: 1, mobile: 2, breakAfter: "desk" },
  { desk: 2, mobile: 2, breakAfter: "mobile" },
  { desk: 2, mobile: 3, breakAfter: null },
] as const;

function Title() {
  const { titleParts, titleAccent } = teamContent.intro;
  return (
    <h2 id="equipe-titre" className="eq-title">
      {titleParts.map((part, index) => {
        const line = TITLE_LINES[index];
        const [before, after] = part.includes(titleAccent) ? part.split(titleAccent) : [part, undefined];
        return (
          <span key={part}>
            <span className="eq-title-mask">
              <span className="eq-title-part" style={{ "--ld": line.desk, "--lm": line.mobile } as CSSProperties}>
                {after === undefined ? (
                  part
                ) : (
                  <>
                    {before}
                    <span className="eq-accent">{titleAccent}</span>
                    {after}
                  </>
                )}
              </span>
            </span>
            {line.breakAfter && <span aria-hidden="true" className={`eq-br eq-br-${line.breakAfter}`} />}
            {index < titleParts.length - 1 && " "}
          </span>
        );
      })}
    </h2>
  );
}

const step = (index: number) => ({ "--i": index }) as CSSProperties;

function initials(name: string) {
  return name
    .split(/\s+/)
    .map((word) => word.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/** « Qui s'en occupe » : membres confirmés, sinon emplacement signalé en développement seulement. */
function Members({ skill, members }: { skill: TeamSkill; members: readonly TeamMember[] }) {
  if (members.length === 0 && !isDev) return null;
  return (
    <div className="eq-who">
      <p className="eq-who-label">Qui s&apos;en occupe</p>
      {members.length > 0 ? (
        <ul className="eq-members" aria-label={`Membres : ${skill.name}`}>
          {members.map((member) => (
            <li key={member.name} className="eq-member">
              {member.photo ? (
                <Image
                  src={member.photo.src}
                  alt={member.photo.alt}
                  width={40}
                  height={40}
                  sizes="40px"
                  className="eq-member-photo"
                />
              ) : (
                <span aria-hidden="true" className="eq-member-initials">
                  {initials(member.name)}
                </span>
              )}
              <span className="eq-member-text">
                <span className="eq-member-name">{member.name}</span>
                <span className="eq-member-role">{member.role}</span>
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="eq-who-empty">
          {teamContent.intro.membersPlaceholder} <ValidationMark pending />
        </p>
      )}
    </div>
  );
}

/** Contenu d'une carte (le bouton « Savoir-faire suivant » est ajouté par l'atelier). */
function PanelBody({ skill }: { skill: TeamSkill }) {
  return (
    <>
      {skill.photo && (
        <div className="eq-step eq-photo" style={step(0)}>
          <Image
            src={skill.photo.src}
            alt={skill.photo.alt}
            width={skill.photo.width}
            height={skill.photo.height}
            sizes="(min-width: 1024px) 500px, calc(100vw - 3rem)"
            className="eq-photo-img"
          />
        </div>
      )}
      <p className="eq-step eq-label" style={step(0)}>
        {skill.number} — {skill.name}
      </p>
      <h3 className="eq-step eq-h3" style={step(1)}>
        {skill.title}
      </h3>
      <p className="eq-step eq-text" style={step(2)}>
        {skill.text} <ValidationMark pending={skill.needsValidation} />
      </p>
      <ul className="eq-step eq-tags" style={step(3)} aria-label={`Domaines : ${skill.name}`}>
        {skill.tags.map((tag) => (
          <li key={tag} className="eq-tag">
            {tag}
          </li>
        ))}
      </ul>
      <Members skill={skill} members={skill.members} />
    </>
  );
}

/*
 * Section « Notre équipe » (page /a-propos, #equipe) : « l'établi ». Server Component : les
 * quatre savoir-faire complets sont dans le HTML initial, cartes inactives comprises (masquées
 * par visibility et inert, jamais retirées du DOM). Seule l'interaction est dans TeamWorkbench.
 * Styles : classes `eq-*` de globals.css.
 *
 * TODO données structurées : aucun JSON-LD (makesOffer / Service) tant que les savoir-faire
 * ne sont pas validés (needsValidation dans src/content/equipe.ts).
 */
export function TeamSection() {
  const { intro, skills, workshopPhoto } = teamContent;

  const heading = (
    <div className="eq-heading">
      <p className="eq-eyebrow">
        <span aria-hidden="true" className="eq-eyebrow-line" />
        <span className="eq-eyebrow-text">{intro.eyebrow}</span>
      </p>
      <Title />
      <ValidationMark pending={intro.needsValidation} />
    </div>
  );

  // Vraie photo de l'atelier : remplace l'illustration sans changer la logique des pastilles.
  const scene = workshopPhoto ? (
    <Image
      src={workshopPhoto.src}
      alt={workshopPhoto.alt}
      fill
      sizes="(min-width: 1024px) 60vw, 100vw"
      className="eq-scene-photo"
    />
  ) : null;

  return (
    <section id="equipe" aria-labelledby="equipe-titre" className="eq">
      <noscript>
        <style>{NO_SCRIPT_CSS}</style>
      </noscript>
      <div aria-hidden="true" className="eq-dots" />
      <div className="site-container">
        <TeamWorkbench
          heading={heading}
          hintFine={intro.hintFine}
          hintTouch={intro.hintTouch}
          skills={skills.map(({ id, number, name }) => ({ id, number, name }))}
          objects={skills.map((skill) => (
            <TeamObject key={skill.id} id={skill.id} />
          ))}
          scene={scene}
          panels={skills.map((skill) => (
            <PanelBody key={skill.id} skill={skill} />
          ))}
          devLabel={
            isDev && !workshopPhoto ? "Illustration provisoire · remplaçable par une photo de l'atelier" : null
          }
        />
      </div>
    </section>
  );
}
