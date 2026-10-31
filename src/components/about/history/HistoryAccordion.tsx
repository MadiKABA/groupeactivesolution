"use client";

import { Plus, ZoomIn } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from "react";

import type { HistoryArchive, HistoryChapter } from "@/content/history";
import { useMediaQuery } from "@/hooks/useMediaQuery";
import { showPlaceholders } from "@/lib/flags";

import { ValidationMark } from "./ValidationMark";

// Archive agrandie : chargée seulement au premier clic sur une archive.
const ArchiveDialog = dynamic(() => import("./ArchiveDialog").then((mod) => mod.ArchiveDialog), {
  ssr: false,
});

const EASE = [0.2, 0.7, 0.2, 1] as const;

// La zone monte de 24px, puis les panneaux se posent l'un après l'autre (120ms).
const zone: Variants = {
  hidden: { opacity: 0, y: 24 },
  visible: (reduce: boolean) => ({
    opacity: 1,
    y: 0,
    transition: reduce ? { duration: 0 } : { duration: 0.6, ease: EASE, staggerChildren: 0.12, delayChildren: 0.1 },
  }),
};
const page: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (reduce: boolean) => ({
    opacity: 1,
    y: 0,
    transition: reduce ? { duration: 0 } : { duration: 0.6, ease: EASE },
  }),
};

const PHOTO_SIZES = "(min-width: 1024px) 66vw, 100vw";
// Mode survol : zone horizontale (≥ 1024px, comme globals.css) et souris. Sinon, clic/tap seulement.
const HOVER_MODE = "(min-width: 64rem) and (hover: hover) and (pointer: fine)";
// Durée de l'ouverture verticale (mobile, globals.css) : on recadre la page une fois terminée.
const MOBILE_OPEN_MS = 450;

type OpenArchive = { chapter: number; index: number };

function hideOnError(event: { currentTarget: HTMLImageElement }) {
  // Image en échec : le placeholder rayé, déjà dessous, reste visible.
  event.currentTarget.style.visibility = "hidden";
}

/*
 * Accordéon des chapitres. L'ouverture est en CSS (globals.css, classes `hs-*`) :
 * panneau actif (classe s1/s2/s3, rendue au serveur), focus clavier et survol (souris).
 * Ce composant ne fait que mémoriser le panneau actif, gérer le clavier, la parallaxe
 * de la photo et l'ouverture des archives.
 */
export function HistoryAccordion({ chapters }: { chapters: readonly HistoryChapter[] }) {
  const reduce = useReducedMotion() ?? false;
  // Suivi en direct (redimensionnement) : survol, focus et parallaxe seulement en mode survol.
  const hoverMode = useMediaQuery(HOVER_MODE);
  const [active, setActive] = useState(0);
  const [interacted, setInteracted] = useState(false);
  // Dernière archive ouverte (garde le dialogue monté pour sa sortie animée).
  const [archive, setArchive] = useState<OpenArchive | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const panels = useRef<(HTMLElement | null)[]>([]);
  const shown = useRef(0);
  const opener = useRef<HTMLButtonElement | null>(null);
  const frame = useRef(0);

  /*
   * Hors mode survol : quand le panneau actif change (clic, tap, Entrée), son haut reste visible sous le header
   * (scroll-margin-top) une fois l'ouverture terminée. Suivi par effet : le focus du tap rend
   * déjà le panneau actif avant le clic.
   */
  useEffect(() => {
    if (shown.current === active) return;
    shown.current = active;
    if (hoverMode) return;
    const timer = window.setTimeout(
      () => {
        const panel = panels.current[active];
        if (!panel) return;
        const top = panel.getBoundingClientRect().top;
        const headerBottom = parseFloat(getComputedStyle(panel).scrollMarginTop) || 0;
        if (top < headerBottom || top > window.innerHeight * 0.6) {
          panel.scrollIntoView({ block: "start", behavior: reduce ? "instant" : "smooth" });
        }
      },
      reduce ? 0 : MOBILE_OPEN_MS,
    );
    return () => window.clearTimeout(timer);
  }, [active, hoverMode, reduce]);

  const activate = (index: number) => {
    setActive(index);
    setInteracted(true);
  };

  // Flèches (gauche/droite en desktop, haut/bas en mobile), Début et Fin : panneau voisin.
  const onTriggerKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = chapters.length - 1;
    const target = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowDown: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    triggers.current[target]?.focus();
  };

  // Parallaxe de la photo ouverte : position du curseur dans la zone, de -1 à 1 (CSS : souris et desktop seulement).
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse" || reduce) return;
    const zoneEl = event.currentTarget;
    const { clientX, clientY } = event;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const rect = zoneEl.getBoundingClientRect();
      zoneEl.style.setProperty("--px", (((clientX - rect.left) / rect.width) * 2 - 1).toFixed(3));
      zoneEl.style.setProperty("--py", (((clientY - rect.top) / rect.height) * 2 - 1).toFixed(3));
    });
  };
  const onPointerLeave = (event: PointerEvent<HTMLDivElement>) => {
    cancelAnimationFrame(frame.current);
    event.currentTarget.style.setProperty("--px", "0");
    event.currentTarget.style.setProperty("--py", "0");
  };

  const openArchive = (chapter: number, index: number, button: HTMLButtonElement) => {
    // Hors mode survol : l'archive d'un panneau fermé ouvre d'abord son panneau, jamais l'archive.
    if (!hoverMode && chapter !== active) {
      activate(chapter);
      return;
    }
    opener.current = button;
    setArchive({ chapter, index });
    setDialogOpen(true);
    activate(chapter);
  };

  const closeArchive = () => {
    setDialogOpen(false);
    // Sans défilement : la position de la page est restaurée par le dialogue.
    opener.current?.focus({ preventScroll: true });
  };

  const dialogChapter = archive ? chapters[archive.chapter] : undefined;

  return (
    <div className="hs-zone">
      <motion.div
        data-reveal
        className={`hs-panels s${active + 1}`}
        style={{ "--hs-count": chapters.length } as CSSProperties}
        variants={zone}
        custom={reduce}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.25 }}
        // Parallaxe : écouteurs posés seulement en mode survol
        onPointerMove={hoverMode ? onPointerMove : undefined}
        onPointerLeave={hoverMode ? onPointerLeave : undefined}
      >
        {chapters.map((chapter, index) => {
          const open = index === active;
          const panelId = `hs-panel-${chapter.id}`;
          const titleId = `hs-title-${chapter.id}`;
          return (
            <motion.article
              key={chapter.id}
              ref={(node: HTMLElement | null) => {
                panels.current[index] = node;
              }}
              data-reveal
              variants={page}
              custom={reduce}
              className="hs-panel"
              aria-labelledby={titleId}
              // Clic n'importe où (déclencheur, photo ou verre d'un panneau ouvert au survol) : panneau actif.
              onClick={() => activate(index)}
            >
              {/* Photo plein cadre (placeholder rayé dessous) */}
              <div aria-hidden={chapter.photo.src ? undefined : true} className="hs-photo">
                <div className="hs-photo-media">
                  <div className="hs-ph">
                    {showPlaceholders && <span className="hs-ph-label">Photo à fournir</span>}
                  </div>
                  {chapter.photo.src && (
                    <Image
                      src={chapter.photo.src}
                      alt={chapter.photo.alt}
                      fill
                      sizes={PHOTO_SIZES}
                      className="hs-photo-img"
                      onError={hideOnError}
                    />
                  )}
                </div>
              </div>
              <span aria-hidden="true" className="hs-shade" />

              {/* Déclencheur : couvre le panneau ; contenu fermé décoratif, nom accessible en sr-only */}
              <button
                ref={(node) => {
                  triggers.current[index] = node;
                }}
                type="button"
                className="hs-trigger"
                aria-expanded={open}
                aria-controls={panelId}
                // Desktop : le focus clavier ouvre le panneau. Ailleurs, seuls clic, Entrée et Espace l'ouvrent.
                onFocus={hoverMode ? () => setActive(index) : undefined}
                onKeyDown={(event) => onTriggerKeyDown(event, index)}
              >
                <span className="sr-only">
                  Chapitre {chapter.number} — {chapter.label}, {chapter.year}
                </span>
                <span aria-hidden="true" className="hs-closed">
                  <span className="hs-closed-number">{chapter.number}</span>
                  <span className="hs-closed-year">{chapter.year}</span>
                  <span className="hs-closed-title">{chapter.shortTitle}</span>
                  <span className="hs-plus">
                    <Plus className="size-4" />
                  </span>
                </span>
              </button>

              <p aria-hidden={chapter.photo.src ? undefined : true} className="hs-caption">
                {chapter.photo.caption}
              </p>

              {/* Bloc de verre : enfant direct du panneau, porte sa propre opacité */}
              <div id={panelId} className="hs-glass">
                <div className="hs-glass-body">
                  <span aria-hidden="true" className="hs-step hs-glass-year" style={{ "--i": 0 } as CSSProperties}>
                    {chapter.year}
                  </span>
                  <p className="hs-step hs-label" style={{ "--i": 1 } as CSSProperties}>
                    <span aria-hidden="true" className="hs-label-line" />
                    Chapitre {chapter.number} — {chapter.label}
                    <span className="sr-only">, {chapter.year}</span>
                  </p>
                  <h3 id={titleId} className="hs-step hs-h3" style={{ "--i": 2 } as CSSProperties}>
                    {chapter.title}
                  </h3>
                  <p className="hs-step hs-text" style={{ "--i": 3 } as CSSProperties}>
                    {chapter.text} <ValidationMark pending={chapter.needsValidation} />
                  </p>
                  {chapter.cta && (
                    <a
                      href={chapter.cta.href}
                      tabIndex={open ? undefined : -1}
                      className="hs-step hs-cta"
                      style={{ "--i": 4 } as CSSProperties}
                    >
                      {chapter.cta.label}
                    </a>
                  )}
                </div>

                {chapter.archives.length > 0 && (
                  <ul className="hs-archives" aria-label={`Archives du chapitre ${chapter.number}`}>
                    {chapter.archives.map((item, archiveIndex) => (
                      <ArchiveCard
                        key={item.id}
                        archive={item}
                        focusable={open}
                        onOpen={(button) => openArchive(index, archiveIndex, button)}
                      />
                    ))}
                  </ul>
                )}
              </div>
            </motion.article>
          );
        })}
      </motion.div>

      <div className="hs-foot">
        <p aria-hidden="true" className="hs-hint" data-interacted={interacted}>
          <span className="hs-hint-dot" />
          <span className="hs-hint-fine">Survolez ou cliquez un chapitre pour l&apos;ouvrir</span>
          <span className="hs-hint-touch">Touchez un chapitre pour l&apos;ouvrir</span>
        </p>
        <p aria-hidden="true" className="hs-steps">
          {chapters.map((chapter, index) => (
            <span key={chapter.id} className="hs-steps-item" data-active={index === active}>
              {index > 0 && <span className="hs-steps-sep">—</span>}
              {chapter.number}
            </span>
          ))}
        </p>
      </div>

      {dialogChapter && archive && (
        <ArchiveDialog
          open={dialogOpen}
          archives={dialogChapter.archives}
          index={archive.index}
          onIndexChange={(index) => setArchive({ chapter: archive.chapter, index })}
          onClose={closeArchive}
        />
      )}
    </div>
  );
}

type ArchiveCardProps = {
  archive: HistoryArchive;
  focusable: boolean;
  onOpen: (button: HTMLButtonElement) => void;
};

/*
 * Archive posée sur la table : l'emplacement (li) porte l'angle et l'arrivée, le bouton le
 * survol (redressé). L'histoire reste dans le DOM (description du bouton) pour les moteurs.
 */
function ArchiveCard({ archive, focusable, onOpen }: ArchiveCardProps) {
  const storyId = `hs-story-${archive.id}`;
  return (
    <li className="hs-arc-slot">
      <button
        type="button"
        className="arc"
        tabIndex={focusable ? undefined : -1}
        aria-haspopup="dialog"
        aria-label={`Agrandir l'archive : ${archive.title}`}
        aria-describedby={storyId}
        onClick={(event) => {
          // Le clic ne remonte pas au panneau : il ouvre l'archive, rien d'autre.
          event.stopPropagation();
          onOpen(event.currentTarget);
        }}
      >
        <span className="arc-media">
          <span aria-hidden="true" className="hs-ph hs-ph--small">
            {showPlaceholders && <span className="hs-ph-label">Archive à fournir</span>}
          </span>
          {archive.src && (
            <Image src={archive.src} alt={archive.alt} fill sizes="160px" className="arc-img" onError={hideOnError} />
          )}
        </span>
        <span aria-hidden="true" className="arc-zoom">
          <ZoomIn className="size-3.5" />
        </span>
        <span className="arc-legend">{archive.legend}</span>
      </button>
      <p id={storyId} className="sr-only">
        {archive.legend}. {archive.story ?? ""}
      </p>
    </li>
  );
}
