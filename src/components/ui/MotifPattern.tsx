import { useId } from "react";

/** Motif textile du hero : bandes de chevrons et losanges imbriqués, tracés fins (couleur : `currentColor`). */
export function MotifPattern({
  className,
  tileScale = 1,
  strokeWidth = 1.25,
}: {
  className?: string;
  tileScale?: number;
  /** Épaisseur en unités de la tuile (multipliée par `tileScale` à l'affichage). */
  strokeWidth?: number;
}) {
  // useId peut contenir des caractères invalides dans une référence `url(#…)`.
  const id = useId().replace(/[^a-zA-Z0-9-]/g, "");
  return (
    <svg aria-hidden="true" className={`absolute inset-0 size-full ${className ?? ""}`}>
      <defs>
        <pattern
          id={id}
          width="96"
          height="96"
          patternUnits="userSpaceOnUse"
          patternTransform={tileScale === 1 ? undefined : `scale(${tileScale})`}
        >
          <g fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinejoin="round">
            {/* Bande de chevrons */}
            <path d="M0 12 L12 0 L24 12 L36 0 L48 12 L60 0 L72 12 L84 0 L96 12" strokeOpacity="0.32" />
            <path d="M0 22 L12 10 L24 22 L36 10 L48 22 L60 10 L72 22 L84 10 L96 22" strokeOpacity="0.22" />
            {/* Losanges imbriqués */}
            <path d="M24 30 L42 48 L24 66 L6 48 Z" strokeOpacity="0.38" />
            <path d="M24 38 L34 48 L24 58 L14 48 Z" strokeOpacity="0.26" />
            <path d="M72 30 L90 48 L72 66 L54 48 Z" strokeOpacity="0.38" />
            <path d="M72 38 L82 48 L72 58 L62 48 Z" strokeOpacity="0.26" />
            <path d="M48 44 L52 48 L48 52 L44 48 Z" strokeOpacity="0.34" />
            {/* Bande de chevrons inversée */}
            <path d="M0 74 L12 86 L24 74 L36 86 L48 74 L60 86 L72 74 L84 86 L96 74" strokeOpacity="0.22" />
            <path d="M0 84 L12 96 L24 84 L36 96 L48 84 L60 96 L72 84 L84 96 L96 84" strokeOpacity="0.32" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}
