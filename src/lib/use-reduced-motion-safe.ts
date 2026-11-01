"use client";

import { useSyncExternalStore } from "react";

/*
 * Préférence « animations réduites » sans écart d'hydratation : le premier rendu client reprend la valeur
 * du serveur (false), puis React relit la vraie préférence. `useReducedMotion` de Motion la lit dès le
 * premier rendu client, d'où des attributs `style` différents du HTML serveur.
 */
const QUERY = "(prefers-reduced-motion: reduce)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

export function useReducedMotionSafe(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false,
  );
}
