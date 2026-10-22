"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * Suit une media query sans écart d'hydratation : le rendu serveur (et la première
 * hydratation) utilise `serverValue`, puis la valeur réelle du navigateur.
 */
export function useMediaQuery(query: string, serverValue = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    [query],
  );

  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}

/** prefers-reduced-motion, utilisable pour décider du rendu (contrairement aux seules transitions). */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery("(prefers-reduced-motion: reduce)");
}
