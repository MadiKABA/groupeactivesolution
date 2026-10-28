/*
 * Géométrie du circuit de la section Formations. Sous 1100px : viewBox fixe 780 × 480 (ci-dessous).
 * Dès 1100px (accordéon visible) : `tabsCircuit()`, en pixels réels, à la hauteur du menu des onglets.
 * Les pistes vont du nœud vers la puce : c'est le sens du tracé et de l'impulsion.
 */

export const CIRCUIT_VIEWBOX = { width: 780, height: 480 } as const;

export const CIRCUIT_CHIP = {
  x: 330,
  y: 180,
  width: 120,
  height: 120,
  rx: 22,
  inner: { x: 342, y: 192, width: 96, height: 96, rx: 14 },
  /** Broches : 5 au-dessus, 5 au-dessous, traits de 8. */
  pinXs: [352, 372, 392, 412, 432],
  pinLength: 8,
  /** Halo derrière la puce (190 avant l'atténuation des halos). */
  haloRadius: 95,
} as const;

/** Monogramme officiel (public/logos/logo-mark.svg, ratio 1000 × 420), centré sur la puce. */
export const CIRCUIT_MONOGRAM = { src: "/logos/logo-mark.svg", width: 100, height: 42 } as const;

/** Cercle de rayon 29 et trait de 2 : bord extérieur à 30 du centre. */
export const CIRCUIT_NODE_RADIUS = 29;
/** Halo du nœud actif : 6px autour du nœud (11px avant l'atténuation des halos). */
export const CIRCUIT_NODE_HALO_RADIUS = 35;
/** Numéro : cy + 6 (ligne de base) ; libellé : cy + 54. */
export const CIRCUIT_NUMBER_OFFSET = 6;
export const CIRCUIT_LABEL_OFFSET = 54;

export type CircuitNode = { cx: number; cy: number; track: string };

/*
 * Nœuds N1 → N5 (même ordre que formationDomains) et leur piste vers la puce (diagonales à 45°).
 * Le circuit occupe tout le viewBox : haut du nœud 01 en y = 0, bas du libellé « Électronique »
 * (ligne de base 476 + jambage du « q ») en y = 480, bord droit des nœuds de droite en x = 780 ;
 * nœuds de gauche en cx = 48 pour que le libellé centré « Électronique » commence à x ≥ 0.
 */
export const CIRCUIT_NODES: readonly CircuitNode[] = [
  { cx: 48, cy: 30, track: "M78 30H100L270 200H330" },
  { cx: 48, cy: 240, track: "M78 240H330" },
  { cx: 48, cy: 422, track: "M78 422H128L270 280H330" },
  { cx: 750, cy: 150, track: "M720 150H560L510 200H450" },
  { cx: 750, cy: 330, track: "M720 330H560L510 280H450" },
];

export type CircuitChip = {
  x: number;
  y: number;
  width: number;
  height: number;
  rx: number;
  inner: { x: number; y: number; width: number; height: number; rx: number };
  pinXs: readonly number[];
  pinLength: number;
  haloRadius: number;
};

export type CircuitGeometry = {
  viewBox: { width: number; height: number };
  chip: CircuitChip;
  nodes: readonly CircuitNode[];
  /** `tabs` : circuit à la hauteur de l'accordéon (libellés masqués, déjà dans les onglets). */
  layout: "free" | "tabs";
};

/** Circuit autonome (sous 1100px) : 3 nœuds à gauche, 2 à droite. */
export const FREE_CIRCUIT: CircuitGeometry = {
  viewBox: CIRCUIT_VIEWBOX,
  chip: CIRCUIT_CHIP,
  nodes: CIRCUIT_NODES,
  layout: "free",
};

/** Puce de même dessin que CIRCUIT_CHIP, coin haut gauche en (x, y). */
function chipAt(x: number, y: number): CircuitChip {
  const { inner, pinXs } = CIRCUIT_CHIP;
  const dx = x - CIRCUIT_CHIP.x;
  const dy = y - CIRCUIT_CHIP.y;
  return {
    ...CIRCUIT_CHIP,
    x,
    y,
    inner: { ...inner, x: inner.x + dx, y: inner.y + dy },
    pinXs: pinXs.map((pinX) => pinX + dx),
  };
}

/** Rayon extérieur d'un nœud (cercle de 29 + demi-trait). */
const NODE_OUTER = CIRCUIT_NODE_RADIUS + 1;
/** Arrivées sur les bords de la puce : axe ± 40 (01 et 04 au-dessus, 03 et 05 au-dessous). */
const ARRIVAL_OFFSET = 40;
/** Nœuds 04 et 05 : axe de la puce ± 90, comme le circuit autonome. */
const RIGHT_NODE_OFFSET = 90;
/** Dernier segment horizontal avant la puce et segment horizontal minimal après un nœud. */
const LEAD_IN = 30;
const MIN_RUN = 16;

const round = (value: number) => Math.round(value * 2) / 2;

/**
 * Piste d'un nœud vers un bord de la puce : horizontale depuis le bord du nœud, diagonale à 45°
 * jusqu'à `arrival`, puis horizontale de LEAD_IN jusqu'à la puce. `side` : -1 nœud à gauche, 1 à droite.
 */
function track(side: -1 | 1, startX: number, y: number, edgeX: number, arrival: number) {
  const drop = Math.abs(arrival - y);
  const bendEnd = edgeX + side * LEAD_IN;
  if (drop === 0) return `M${startX} ${y}H${edgeX}`;
  return `M${startX} ${y}H${bendEnd + side * drop}L${bendEnd} ${arrival}H${edgeX}`;
}

/**
 * Circuit desktop (≥ 1100px), en pixels CSS (viewBox = taille rendue), à côté de l'accordéon :
 * `width` = largeur de la colonne du circuit, `top` et `height` = position et hauteur du menu des
 * onglets mesurées depuis le haut du circuit. Nœuds 01 → 03 en colonne à gauche, répartis sur toute la
 * hauteur du menu (haut de 01 = haut du menu, bas de 03 = bas du menu, 02 au milieu) ; puce centrée
 * sur l'axe du menu ; nœuds 04 et 05 à droite, symétriques par rapport à cet axe. Chaque piste va
 * de son nœud au bord le plus proche de la puce (diagonales à 45°, sans croisement).
 */
export function tabsCircuit(width: number, top: number, height: number): CircuitGeometry {
  const { width: chipWidth, height: chipHeight } = CIRCUIT_CHIP;
  const cy = top + height / 2;
  const leftYs = [top + NODE_OUTER, cy, top + height - NODE_OUTER].map(round);
  const rightYs = [cy - RIGHT_NODE_OFFSET, cy + RIGHT_NODE_OFFSET].map(round);
  const arrival = (index: number) => round(cy + (index - 1) * ARRIVAL_OFFSET);

  // Puce centrée dans la colonne, décalée vers la droite si les diagonales de gauche manquent de place.
  const leftDrop = Math.max(0, cy - ARRIVAL_OFFSET - leftYs[0]);
  const minX = 2 * NODE_OUTER + MIN_RUN + leftDrop + LEAD_IN;
  const chipX = round(Math.max(minX, (width - chipWidth) / 2));
  const chipRight = chipX + chipWidth;
  const rightCx = round(Math.max(width - NODE_OUTER, chipRight + LEAD_IN + (RIGHT_NODE_OFFSET - ARRIVAL_OFFSET) + MIN_RUN + NODE_OUTER));

  const left = leftYs.map((y, index) => ({
    cx: NODE_OUTER,
    cy: y,
    track: track(-1, 2 * NODE_OUTER, y, chipX, arrival(index)),
  }));
  const right = rightYs.map((y, index) => ({
    cx: rightCx,
    cy: y,
    track: track(1, rightCx - NODE_OUTER, y, chipRight, arrival(index * 2)),
  }));

  return {
    viewBox: { width: round(Math.max(width, rightCx + NODE_OUTER)), height: round(top + height) },
    chip: chipAt(chipX, round(cy - chipHeight / 2)),
    nodes: [...left, ...right],
    layout: "tabs",
  };
}
