/** Réseau : 3 polylignes de 3 nœuds (coordonnées du viewBox 380 × 166, centre de la scène en 190, 83). */
const NETWORK = [
  [
    [52, 50],
    [92, 26],
    [138, 40],
  ],
  [
    [330, 40],
    [292, 74],
    [316, 122],
  ],
  [
    [84, 130],
    [128, 148],
    [160, 136],
  ],
] as const;
const NODE_RADII = [3, 4, 3.5] as const;
const NODE_STAGGER = 0.35;

/** « ? » réduit et centré sur la scène : tige et point sur l'axe x = 190. */
const MARK_TRANSFORM = "translate(190 83) scale(.6) translate(-190 -128)";

/**
 * Scène décorative de l'aside FAQ (desktop) : anneaux, réseau, « ? » flottant, coche à l'ouverture
 * d'une question. SVG rendu au serveur, animé en CSS (transform, opacité ; tracé de la coche) ;
 * FaqInteractive pilote data-inview / data-pulse sur le conteneur et la profondeur au pointeur
 * (calques .fqm-net, .fqm-rings, .fqm-depth).
 */
export function FaqQuestionMark() {
  return (
    <svg viewBox="0 0 380 166" className="fqm block h-37.5 w-full" aria-hidden="true" focusable="false">
      <g className="fqm-net">
        {NETWORK.map((line, lineIndex) => (
          <g key={lineIndex}>
            <polyline points={line.map((point) => point.join(",")).join(" ")} fill="none" className="stroke-brand-gold/40" strokeWidth="1" />
            {line.map(([cx, cy], nodeIndex) => (
              <circle
                key={nodeIndex}
                cx={cx}
                cy={cy}
                r={NODE_RADII[nodeIndex]}
                className="fqm-node fill-brand-gold"
                style={{ animationDelay: `${(lineIndex * 3 + nodeIndex) * NODE_STAGGER}s` }}
              />
            ))}
          </g>
        ))}
      </g>

      <g className="fqm-rings">
        <circle cx="190" cy="83" r="64" fill="none" strokeWidth="1.5" strokeDasharray="3 7" className="fqm-ring-dash stroke-brand-gold/30" />
        <circle cx="190" cy="83" r="92" fill="none" strokeWidth="1.5" className="fqm-ring stroke-brand-gold/15" />
      </g>

      <g className="fqm-depth">
        <g className="fqm-float">
          <g className="fqm-mark">
            <g transform={MARK_TRANSFORM}>
              <path
                d="M138 92C138 52 165 34 192 34C225 34 248 54 248 86C248 112 230 124 212 136C196 147 190 158 190 182"
                fill="none"
                strokeWidth="22"
                strokeLinecap="round"
                className="stroke-brand-gold"
              />
              <g className="fqm-dot">
                <circle cx="190" cy="226" r="12" className="fill-brand-gold-light" />
              </g>
            </g>
          </g>
          <g transform={MARK_TRANSFORM}>
            <path
              d="M150 128L182 160L238 96"
              pathLength={1}
              fill="none"
              strokeWidth="22"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="fqm-check stroke-brand-gold-light"
            />
          </g>
        </g>
      </g>
    </svg>
  );
}
