"use client";

import { useEffect } from "react";

/*
 * Après une ancre vers une fiche (#former, #creer, #transformer ou un ancien alias), le focus va
 * au titre de la fiche : le CSS ne sait pas déplacer le focus. Le défilement reste natif (doux
 * seulement sans mouvement réduit, règle globale de `html`) ; sans JavaScript, les ancres marchent.
 */
export function FicheFocus() {
  useEffect(() => {
    const focusTitle = () => {
      const hash = decodeURIComponent(window.location.hash.slice(1));
      const fiche = hash ? document.getElementById(hash)?.closest("#expertises > section[id]") : null;
      document.getElementById(`${fiche?.id}-title`)?.focus({ preventScroll: true });
    };
    focusTitle();
    window.addEventListener("hashchange", focusTitle);
    return () => window.removeEventListener("hashchange", focusTitle);
  }, []);

  return null;
}
