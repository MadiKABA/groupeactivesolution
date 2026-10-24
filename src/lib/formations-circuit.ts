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

/** Cercle de rayon 29 et trait de 2 : bord extérieur à 30 du centre. */
export const CIRCUIT_NODE_RADIUS = 29;
export const CIRCUIT_NODE_HALO_RADIUS = 40;
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
