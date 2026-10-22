/** Courbes d'animation communes à tout le site (cubic-bezier). */
export const EASE = {
  /** Révélations depuis un masque, entrées douces. */
  reveal: [0.22, 1, 0.36, 1],
  /** Balayages d'images (clip-path). */
  wipe: [0.77, 0, 0.18, 1],
} as const;
