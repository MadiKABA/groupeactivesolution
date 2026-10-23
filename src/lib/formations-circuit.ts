/*
 * Géométrie du circuit de la section Formations (unités du viewBox 780 × 480).
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
  /** Halo derrière la puce. */
  haloRadius: 190,
} as const;

/** Monogramme officiel (public/logos/logo-mark.svg, ratio 1000 × 420), centré sur la puce. */
export const CIRCUIT_MONOGRAM = { src: "/logos/logo-mark.svg", width: 100, height: 42 } as const;

export const CIRCUIT_NODE_RADIUS = 30;
export const CIRCUIT_NODE_HALO_RADIUS = 46;
/** Libellé sous le nœud : cy + 54. */
export const CIRCUIT_LABEL_OFFSET = 54;

export type CircuitNode = { cx: number; cy: number; track: string };

/** Nœuds N1 → N5 (même ordre que formationDomains) et leur piste vers la puce. */
export const CIRCUIT_NODES: readonly CircuitNode[] = [
  { cx: 100, cy: 80, track: "M130 80H220L290 150V200H330" },
  { cx: 100, cy: 240, track: "M130 240H330" },
  { cx: 100, cy: 400, track: "M130 400H220L290 330V280H330" },
  { cx: 680, cy: 160, track: "M650 160H540L500 200H450" },
  { cx: 680, cy: 320, track: "M650 320H540L500 280H450" },
];
