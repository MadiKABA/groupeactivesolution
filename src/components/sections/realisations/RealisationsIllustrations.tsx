import type { CSSProperties } from "react";

import type { RealisationDomain } from "@/lib/realisations";

/*
 * Illustrations décoratives des tuiles du bento (SVG inline, aria-hidden, aucune photo simulée).
 * Construction en CSS (classes rz-*), déclenchée à l'ouverture de la tuile : chaque élément lit
 * son délai local dans --d (ms), ajouté à --tile-at (ouverture de la tuile) par le CSS.
 */

const at = (delay: number, extra?: Record<string, string | number>) => ({ "--d": `${delay}ms`, ...extra }) as CSSProperties;

/* ---------- 01 · Formation : points épars reliés à une grille de nœuds ---------- */
const DY = 40;
const SCATTERED = [
  [70, 150, 4],
  [130, 300, 3],
  [210, 200, 5],
  [280, 120, 3.5],
  [330, 320, 4.5],
  [380, 230, 3],
] as const;
const LINK_TARGETS = [150, 240, 330, 150, 240, 330] as const;
const GRID_X = [470, 540, 610, 680] as const;
const GRID_Y = [150, 240, 330] as const;
const COLUMN_OPACITY = [0.35, 0.57, 0.78, 1] as const;

function EducationArt() {
  return (
    <svg viewBox="0 0 804 580" className="rz-art-svg" aria-hidden="true" focusable="false">
      <g className="rz-links">
        {SCATTERED.map(([x, y], index) => {
          const ty = LINK_TARGETS[index] + DY;
          const mid = x + (470 - x) / 2;
          return <path key={index} d={`M${x} ${y + DY}C${mid} ${y + DY} ${mid} ${ty} 470 ${ty}`} className="rz-dashed" />;
        })}
      </g>
      <g className="rz-lines">
        {GRID_Y.map((y, row) => (
          <path key={`h${row}`} d={`M470 ${y + DY}H680`} pathLength={1} className="rz-draw" style={at(800 + row * 80)} />
        ))}
        {GRID_X.map((x, column) => (
          <path key={`v${column}`} d={`M${x} ${150 + DY}V${330 + DY}`} pathLength={1} className="rz-draw" style={at(900 + column * 80)} />
        ))}
      </g>
      <g className="rz-scatter">
        {SCATTERED.map(([x, y, r], index) => (
          <circle key={index} cx={x} cy={y + DY} r={r} className="rz-dot-white rz-pop" style={at(index * 50)} />
        ))}
      </g>
      {GRID_X.map((x, column) =>
        GRID_Y.map((y, row) => (
          <circle
            key={`${column}-${row}`}
            cx={x}
            cy={y + DY}
            r="5"
            className="rz-node"
            style={at(1100 + column * 90 + row * 30, {
              "--o": COLUMN_OPACITY[column],
              "--tw": `${(column * 3 + row) * 0.35}s`,
            })}
          />
        )),
      )}
      <circle cx="680" cy={330 + DY} r="14" className="rz-ring rz-pop" style={at(1500)} />
    </svg>
  );
}

/* ---------- 02 · Développement digital : blocs qui s'assemblent ---------- */
const FILLED = [
  [0, 0],
  [1, 0],
  [1, 1],
  [2, 1],
  [2, 2],
  [3, 2],
] as const;
const cell = (column: number, row: number) => ({
  x: 150 + column * 56,
  y: 40 + row * 56,
});

function DevelopmentArt() {
  const filledKey = new Set(FILLED.map(([c, r]) => `${c}-${r}`));
  const outlines = Array.from({ length: 12 }, (_, i) => [i % 4, Math.floor(i / 4)] as const).filter(([c, r]) => !filledKey.has(`${c}-${r}`));
  return (
    <svg viewBox="0 0 392 280" className="rz-art-svg" aria-hidden="true" focusable="false">
      <g className="rz-lines">
        {outlines.map(([c, r]) => (
          <rect key={`${c}-${r}`} {...cell(c, r)} width="48" height="48" rx="8" className="rz-block-outline" />
        ))}
      </g>
      {FILLED.map(([c, r], order) => (
        <rect key={`${c}-${r}`} {...cell(c, r)} width="48" height="48" rx="8" className="rz-block rz-slide" style={at(order * 90)} />
      ))}
      <g className="rz-float">
        <rect x="64" y="58" width="48" height="48" rx="8" className="rz-block-dashed rz-slide" style={at(650)} />
      </g>
      {/* Animation sur le groupe : un transform CSS remplacerait l'attribut rotate du bloc */}
      <g className="rz-bounce" style={at(760)}>
        <rect x="84" y="148" width="48" height="48" rx="8" transform="rotate(-6 108 172)" className="rz-block-gold" />
      </g>
      <g className="rz-lines">
        <path d="M380 40V200M374 40H386M374 200H386" pathLength={1} className="rz-draw" style={at(900)} />
      </g>
    </svg>
  );
}

/* ---------- 03 · Transformation digitale : formes qui évoluent le long d'une courbe ---------- */
const SHAPE_X = [50, 120, 190, 260, 330] as const;
const hexagon = (cx: number, cy: number, r: number) =>
  Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i - Math.PI / 2;
    return `${(cx + r * Math.cos(angle)).toFixed(1)},${(cy + r * Math.sin(angle)).toFixed(1)}`;
  }).join(" ");

function Shape({ index, y }: { index: number; y: number }) {
  const x = SHAPE_X[index];
  switch (index) {
    case 0:
      return <circle cx={x} cy={y} r="24" />;
    case 1:
      return <rect x={x - 22} y={y - 22} width="44" height="44" rx="10" />;
    case 2:
      return <path d={`M${x} ${y - 20}L${x + 20} ${y}L${x} ${y + 20}L${x - 20} ${y}Z`} data-gold="" />;
    case 3:
      return <polygon points={hexagon(x, y, 26)} />;
    default:
      return (
        <g data-gold="">
          <circle cx={x} cy={y} r="26" />
          <circle cx={x} cy={y} r="14" />
        </g>
      );
  }
}

function TransformationArt() {
  return (
    <svg viewBox="0 0 392 280" className="rz-art-svg" aria-hidden="true" focusable="false">
      <g className="rz-lines">
        <path d="M14 128Q30 100 50 100Q85 60 120 100T190 100T260 100T330 100Q352 100 378 74" pathLength={1} className="rz-draw rz-curve" style={at(0)} />
      </g>
      <g className="rz-ghosts">
        {SHAPE_X.map((_, index) => (
          <g key={index} className="rz-ghost" style={at(1500 + index * 60)}>
            <Shape index={index} y={144} />
          </g>
        ))}
      </g>
      {SHAPE_X.map((x, index) => (
        <g key={x} className="rz-shape" style={at(300 + index * 220)}>
          <Shape index={index} y={100} />
          <circle cx={x} cy="100" r="3.5" className="rz-center" />
        </g>
      ))}
    </svg>
  );
}

export function RealisationIllustration({ domain }: { domain: RealisationDomain }) {
  if (domain === "education") return <EducationArt />;
  if (domain === "developpement") return <DevelopmentArt />;
  return <TransformationArt />;
}
