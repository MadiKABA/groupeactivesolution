import { useId } from "react";

/*
 * Zigzag ondulé doré : seul motif de fond du site (accueil et /services). SVG inline, sans JavaScript.
 * Trait de 1 px, mailles 64 × 32 (mobile) et 96 × 48 (≥ 1024px). Opacité : `--motif-zigzag`
 * (`--motif-zigzag-hero` avec `hero`), couleurs et masques : classes `wave-*` de globals.css.
 * À poser dans un conteneur positionné (le motif remplit son parent, derrière le contenu).
 */
export type WaveTone = "light" | "dark";
export type WaveMask = "tl" | "tr" | "bl" | "br" | "l" | "r" | "full";
export type WaveMesh = "auto" | "small" | "large";

export function WaveMotif({
  tone,
  mask,
  mesh = "auto",
  hero = false,
  className = "",
}: {
  /** `light` : fond clair (doré de trait, gold-line) ; `dark` : fond bleu nuit (doré de la marque). */
  tone: WaveTone;
  /** Coin ou bord où le motif reste visible, effacé partout ailleurs ; `full` : tout le fond, sans masque (accueil). */
  mask: WaveMask;
  /** `auto` : 64 × 32 en mobile, 96 × 48 dès 1024px ; sinon une maille fixe. */
  mesh?: WaveMesh;
  /** Opacité du hero (`--motif-zigzag-hero`). */
  hero?: boolean;
  className?: string;
}) {
  // useId peut contenir des caractères invalides dans une référence `url(#…)`.
  const id = useId().replace(/[^a-zA-Z0-9-]/g, "");
  return (
    <div
      aria-hidden="true"
      className={`wave-motif wave-motif--${tone} wave-mask-${mask} wave-mesh-${mesh}${hero ? " wave-motif--hero" : ""} ${className}`}
    >
      <svg className="wave-svg">
        <defs>
          <pattern id={`${id}-s`} width="64" height="32" patternUnits="userSpaceOnUse">
            <polyline points="0,26 16,8 32,26 48,8 64,26" />
          </pattern>
          <pattern id={`${id}-l`} width="96" height="48" patternUnits="userSpaceOnUse">
            <polyline points="0,38 24,12 48,38 72,12 96,38" />
          </pattern>
        </defs>
        <rect className="wave-tile-s" width="100%" height="100%" fill={`url(#${id}-s)`} />
        <rect className="wave-tile-l" width="100%" height="100%" fill={`url(#${id}-l)`} />
      </svg>
    </div>
  );
}
