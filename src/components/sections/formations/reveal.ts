import type { CSSProperties } from "react";

/**
 * Attributs d'un élément de la séquence d'entrée (classe `fo-a|b|c` posée par l'appelant) :
 * délai et durée en ms, transform de départ. Lus par le CSS (`--fo-*`) et, en animations
 * réduites, par FormationsInteractive (`data-d` : ordre des fondus).
 */
export function reveal(delay: number, duration = 500, from?: string): { "data-d": number; style: CSSProperties } {
  return {
    "data-d": delay,
    style: {
      "--fo-d": `${delay}ms`,
      "--fo-dur": `${duration}ms`,
      ...(from ? { "--fo-from": from } : {}),
    } as CSSProperties,
  };
}
