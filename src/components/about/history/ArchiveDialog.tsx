"use client";

import { ChevronLeft, ChevronRight, X } from "lucide-react";
import Image from "next/image";
import { useEffect, useId, useRef, type PointerEvent } from "react";
import { createPortal } from "react-dom";

import type { HistoryArchive } from "@/content/history";
import { showPlaceholders } from "@/lib/flags";

import { ValidationMark } from "./ValidationMark";

// Glissement vers le bas (sur la poignée) au-delà duquel la feuille mobile se ferme.
const SWIPE_CLOSE = 80;
const SHEET_QUERY = "(max-width: 47.999rem)";

type ArchiveDialogProps = {
  open: boolean;
  archives: readonly HistoryArchive[];
  index: number;
  onIndexChange: (index: number) => void;
  onClose: () => void;
};

/*
 * Archive agrandie : <dialog> modal natif (couche supérieure, au-dessus du header ; piège du
 * focus, Échap, arrière-plan inerte), rendu dans document.body. Desktop : boîte centrée ;
 * mobile : feuille qui monte du bas, fermée par le bouton, le voile, Échap, le retour du
 * navigateur ou un glissement de la poignée. Entrées et sorties en CSS (`hs-dialog*`).
 */
export function ArchiveDialog({ open, archives, index, onIndexChange, onClose }: ArchiveDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const drag = useRef<{ start: number; delta: number } | null>(null);
  const titleId = useId();
  const archive = archives[index];
  const count = archives.length;

  // Reste monté après la première ouverture : la sortie s'anime en CSS.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  /*
   * Pendant l'ouverture : page figée (body en position fixe, compatible iOS) et entrée
   * d'historique, pour que le retour du navigateur ferme l'archive au lieu de quitter la page.
   * Le nettoyage restaure toujours la position exacte, même au démontage.
   */
  useEffect(() => {
    if (!open) return;
    const scrollY = window.scrollY;
    const { body } = document;
    const previous = body.getAttribute("style");
    Object.assign(body.style, { position: "fixed", top: `-${scrollY}px`, left: "0", right: "0", width: "100%" });

    // L'état courant du routeur Next.js est conservé : le retour reste sur la même page.
    window.history.pushState({ ...window.history.state, hsArchive: true }, "");
    const onPopState = () => dialogRef.current?.close();
    window.addEventListener("popstate", onPopState);

    return () => {
      window.removeEventListener("popstate", onPopState);
      if (window.history.state?.hsArchive) window.history.back();
      if (previous === null) body.removeAttribute("style");
      else body.setAttribute("style", previous);
      window.scrollTo({ top: scrollY, behavior: "instant" });
    };
  }, [open]);

  const close = () => dialogRef.current?.close();

  const onHandleDown = (event: PointerEvent<HTMLDivElement>) => {
    if (!window.matchMedia(SHEET_QUERY).matches) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drag.current = { start: event.clientY, delta: 0 };
  };
  const onHandleMove = (event: PointerEvent<HTMLDivElement>) => {
    const dialog = dialogRef.current;
    if (!drag.current || !dialog) return;
    drag.current.delta = Math.max(0, event.clientY - drag.current.start);
    dialog.style.transition = "none";
    dialog.style.translate = `0 ${drag.current.delta}px`;
  };
  const onHandleEnd = () => {
    const dialog = dialogRef.current;
    if (!drag.current || !dialog) return;
    const { delta } = drag.current;
    drag.current = null;
    dialog.style.transition = "";
    dialog.style.translate = "";
    if (delta > SWIPE_CLOSE) close();
  };

  if (!archive) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      className="hs-dialog"
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        // Un clic sur le voile atteint directement le <dialog>.
        if (event.target === event.currentTarget) close();
      }}
    >
      <div className="hs-dialog-inner">
        {/* Premier élément focalisable : reçoit le focus à l'ouverture */}
        <button type="button" className="hs-dialog-btn hs-dialog-close" aria-label="Fermer l’archive" onClick={close}>
          <X aria-hidden="true" className="size-5" />
        </button>

        {/* Poignée (mobile) : seule zone de glissement, le contenu garde son défilement */}
        <div
          aria-hidden="true"
          className="hs-dialog-handle-zone"
          onPointerDown={onHandleDown}
          onPointerMove={onHandleMove}
          onPointerUp={onHandleEnd}
          onPointerCancel={onHandleEnd}
        >
          <span className="hs-dialog-handle" />
        </div>

        <div className="hs-dialog-body">
          <div className="hs-dialog-media">
            <span aria-hidden="true" className="hs-ph">
              {showPlaceholders && <span className="hs-ph-label">Archive à fournir</span>}
            </span>
            {archive.src && (
              <Image
                src={archive.src}
                alt={archive.alt}
                fill
                sizes="(min-width: 768px) 540px, 100vw"
                className="hs-dialog-img"
                onError={(event) => {
                  event.currentTarget.style.visibility = "hidden";
                }}
              />
            )}
          </div>

          <div className="hs-dialog-text">
            <p className="hs-dialog-legend">{archive.legend}</p>
            <h2 id={titleId} className="hs-dialog-title">
              {archive.title}
            </h2>
            {archive.story && <p className="hs-dialog-story">{archive.story}</p>}
            <ValidationMark pending={archive.needsValidation} />

            {count > 1 && (
              <div className="hs-dialog-nav">
                <button
                  type="button"
                  className="hs-dialog-btn"
                  aria-label="Archive précédente"
                  onClick={() => onIndexChange((index - 1 + count) % count)}
                >
                  <ChevronLeft aria-hidden="true" className="size-5" />
                </button>
                <span className="hs-dialog-count">
                  {index + 1} / {count}
                </span>
                <button
                  type="button"
                  className="hs-dialog-btn"
                  aria-label="Archive suivante"
                  onClick={() => onIndexChange((index + 1) % count)}
                >
                  <ChevronRight aria-hidden="true" className="size-5" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </dialog>,
    document.body,
  );
}
