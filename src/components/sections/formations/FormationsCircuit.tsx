import type { CSSProperties } from "react";

import {
  CIRCUIT_CHIP,
  CIRCUIT_LABEL_OFFSET,
  CIRCUIT_MONOGRAM,
  CIRCUIT_NODE_HALO_RADIUS,
  CIRCUIT_NODE_RADIUS,
  CIRCUIT_NODES,
  CIRCUIT_VIEWBOX,
} from "@/lib/formations-circuit";
import { formationDomains } from "@/lib/formations";

import { reveal } from "./reveal";

/** Séquence d'entrée du circuit (ms après le déclenchement de l'en-tête et de la composition). */
const CHIP_AT = 800;
const TRACKS_AT = 1000;
const TRACK_STAGGER = 150;
const TRACK_DRAW = 500;

const { x, y, width, height, rx, inner, pinXs, pinLength, haloRadius } = CIRCUIT_CHIP;
const chipCx = x + width / 2;
const chipCy = y + height / 2;

/**
 * Circuit décoratif (aria-hidden) : puce au monogramme, 5 pistes et 5 nœuds. Aucun état React :
 * l'onglet actif (`data-active`), l'allumage (`data-lit`) et l'entrée (`data-in-a`) sont posés sur
 * l'ancêtre `.formations-root` et lus par le CSS (globals.css, « Section Formations »).
 * Chaque élément lié à une étape porte `data-i` (1 → 5).
 */
export function FormationsCircuit() {
  return (
    <svg
      viewBox={`0 0 ${CIRCUIT_VIEWBOX.width} ${CIRCUIT_VIEWBOX.height}`}
      aria-hidden="true"
      className="formations-circuit block h-auto w-full overflow-visible"
    >
      <defs>
        <radialGradient id="formations-chip-halo">
          <stop offset="0" className="formations-halo-stop" />
          <stop offset="1" className="formations-halo-stop" stopOpacity="0" />
        </radialGradient>
        <filter id="formations-track-blur" x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>

      <g className="formations-parallax">
        {/* Halo derrière la puce : apparition, puis respiration (boucle CSS) */}
        <g className="fo-a" {...reveal(CHIP_AT, 700)}>
          <circle className="fo-loop formations-breathe" cx={chipCx} cy={chipCy} r={haloRadius} fill="url(#formations-chip-halo)" />
        </g>

        {/* Pistes : base (dessinée à l'entrée), doublon flouté et tracé doré de la piste active */}
        {CIRCUIT_NODES.map((node, index) => (
          <g key={node.track} data-i={index + 1}>
            <path className="fo-a formations-track" d={node.track} pathLength={1} {...reveal(TRACKS_AT + index * TRACK_STAGGER, TRACK_DRAW)} />
            <path className="formations-track-glow" d={node.track} pathLength={1} filter="url(#formations-track-blur)" />
            <path className="formations-track-on" d={node.track} pathLength={1} />
          </g>
        ))}

        {/* Puce : cadre, broches, monogramme officiel, anneaux d'arrivée de l'impulsion */}
        <g className="fo-a formations-chip" {...reveal(CHIP_AT, 500, "scale(.85)")}>
          <rect className="formations-chip-body" x={x} y={y} width={width} height={height} rx={rx} />
          <rect className="formations-chip-inner" x={inner.x} y={inner.y} width={inner.width} height={inner.height} rx={inner.rx} />
          {pinXs.map((pinX) => (
            <g key={pinX} className="formations-chip-pin">
              <line x1={pinX} y1={y - pinLength} x2={pinX} y2={y} />
              <line x1={pinX} y1={y + height} x2={pinX} y2={y + height + pinLength} />
            </g>
          ))}
          <image
            href={CIRCUIT_MONOGRAM.src}
            x={chipCx - CIRCUIT_MONOGRAM.width / 2}
            y={chipCy - CIRCUIT_MONOGRAM.height / 2}
            width={CIRCUIT_MONOGRAM.width}
            height={CIRCUIT_MONOGRAM.height}
          />
          {CIRCUIT_NODES.map((node, index) => (
            <rect key={node.track} data-i={index + 1} className="fo-loop formations-ring" x={x} y={y} width={width} height={height} rx={rx} />
          ))}
        </g>

        {/* Impulsion : un point par piste, seul celui de la piste active circule (offset-path) */}
        {CIRCUIT_NODES.map((node, index) => (
          <g
            key={node.track}
            data-i={index + 1}
            className="fo-loop formations-pulse"
            style={{ offsetPath: `path("${node.track}")` } as CSSProperties}
          >
            <circle className="formations-pulse-halo" r={13} />
            <circle className="formations-pulse-dot" r={6} />
          </g>
        ))}

        {/* Nœuds : apparition à la fin de leur piste ; clic (pointeur) = onglet correspondant */}
        {CIRCUIT_NODES.map((node, index) => {
          const domain = formationDomains[index];
          const number = { x: node.cx, y: node.cy, textAnchor: "middle", dominantBaseline: "central" } as const;
          const entry = reveal(TRACKS_AT + index * TRACK_STAGGER + TRACK_DRAW, 300, "scale(.8)");
          // Mise à l'échelle autour du centre du nœud (unités du viewBox), libellé compris.
          const origin = { transformOrigin: `${node.cx}px ${node.cy}px` };
          return (
            <g
              key={node.track}
              data-i={index + 1}
              data-node={index}
              className="fo-a formations-node-in"
              data-d={entry["data-d"]}
              style={{ ...entry.style, ...origin }}
            >
              <g className="formations-node" style={origin}>
                <circle className="formations-node-halo" cx={node.cx} cy={node.cy} r={CIRCUIT_NODE_HALO_RADIUS} />
                <circle className="formations-node-base" cx={node.cx} cy={node.cy} r={CIRCUIT_NODE_RADIUS} />
                <circle className="formations-node-on" cx={node.cx} cy={node.cy} r={CIRCUIT_NODE_RADIUS} />
                <text {...number} className="formations-node-num">
                  {domain.num}
                </text>
                <text {...number} className="formations-node-num formations-node-num-on">
                  {domain.num}
                </text>
              </g>
              <text x={node.cx} y={node.cy + CIRCUIT_LABEL_OFFSET} textAnchor="middle" className="formations-node-label">
                {domain.nodeLabel}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}
