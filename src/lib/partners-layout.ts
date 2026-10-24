/*
 * Disposition de la constellation des partenaires (desktop, scène de 1248 px de large).
 * Fonction PURE : layout(count) → cartes (centre, taille), traces SVG, chemins des lumières.
 *  - A « Constellation » (1 à 6) : une trace (Bézier cubique) par carte.
 *  - B « Deux rails » (7 à 12) : deux arcs (chacun en deux moitiés depuis son sommet) et deux liaisons
 *    verticales, aucune trace par carte.
 *  - C (plus de 12) : 11 cartes + une carte « +N » (inerte), disposées comme B pour 12.
 *  - 0 : cercle AS seul (aucune carte, aucune trace).
 */

export const SCENE_WIDTH = 1248;
const AS_RADIUS = 56;
const CARD_W = 208;

export type Point = { x: number; y: number };
export type CardBox = { x: number; y: number; w: number; h: number };
export type Layout = {
  regime: "A" | "B" | "C";
  height: number;
  center: Point;
  /** Cartes : centre (x, y), largeur, hauteur ; l'index suit l'ordre des données. */
  cards: CardBox[];
  /** Traits visibles (régime A : une trace par carte ; régime B : 4 demi-arcs depuis leur sommet, puis 2 liaisons). */
  strokes: { d: string; kind: "trace" | "arc" | "link" }[];
  /** Chemin AS → carte de chaque carte (lumières, surbrillance). */
  routes: string[];
  /** Nœuds dorés au sommet des arcs (rangée paire). */
  nodes: Point[];
  /** Nombre de cartes réelles (C : 11) et partenaires non affichés (« +N »). */
  shown: number;
  overflow: number;
};

const round = (value: number) => Math.round(value * 10) / 10;
const fmt = (points: number[]) => points.map(round).join(" ");

// Régime A : emplacements (centres des cartes) et remplissage par nombre, dans l'ordre de lecture.
const SLOTS: Record<string, Point> = {
  // Bas de la carte 8 px au-dessus du second anneau (rayon 110 autour du cercle en y = 210).
  topCenter: { x: 624, y: 50 },
  lTop: { x: 269, y: 70 },
  rTop: { x: 979, y: 70 },
  lMid: { x: 174, y: 210 },
  rMid: { x: 1074, y: 210 },
  lBot: { x: 269, y: 350 },
  rBot: { x: 979, y: 350 },
};
const FILL: Record<number, (keyof typeof SLOTS)[]> = {
  1: ["topCenter"],
  2: ["lMid", "rMid"],
  3: ["topCenter", "lMid", "rMid"],
  4: ["lTop", "rTop", "lBot", "rBot"],
  5: ["topCenter", "lMid", "rMid", "lBot", "rBot"],
  6: ["lTop", "rTop", "lMid", "rMid", "lBot", "rBot"],
};

function constellation(count: number): Layout {
  const center = { x: 624, y: 210 };
  const h = 84;
  const cards = FILL[count].map((slot) => ({ ...SLOTS[slot], w: CARD_W, h }));
  const routes = cards.map((card) => {
    if (card.x === center.x) {
      // Au-dessus du cercle : trait vertical.
      return `M${fmt([center.x, center.y - AS_RADIUS])}V${round(card.y + h / 2)}`;
    }
    const side = card.x < center.x ? -1 : 1;
    const start = { x: center.x + side * AS_RADIUS, y: center.y };
    const end = { x: card.x - side * (card.w / 2), y: card.y };
    const bend = Math.abs(end.x - start.x) / 2;
    // Tangentes horizontales aux deux extrémités (droite si même ordonnée).
    return `M${fmt([start.x, start.y])}C${fmt([start.x + side * bend, start.y, end.x - side * bend, end.y, end.x, end.y])}`;
  });
  return {
    regime: "A",
    height: count <= 2 ? 340 : 420,
    center,
    cards,
    strokes: routes.map((d) => ({ d, kind: "trace" as const })),
    routes,
    nodes: [],
    shown: count,
    overflow: 0,
  };
}

// Régime B : arcs (Bézier quadratiques) haut et bas.
const ARCS = {
  top: { p0: { x: 124, y: 100 }, c: { x: 624, y: -12 }, p1: { x: 1124, y: 100 } },
  bottom: { p0: { x: 124, y: 460 }, c: { x: 624, y: 572 }, p1: { x: 1124, y: 460 } },
} as const;
type Arc = (typeof ARCS)[keyof typeof ARCS];

const quad = (arc: Arc, t: number): Point => ({
  x: (1 - t) ** 2 * arc.p0.x + 2 * (1 - t) * t * arc.c.x + t ** 2 * arc.p1.x,
  y: (1 - t) ** 2 * arc.p0.y + 2 * (1 - t) * t * arc.c.y + t ** 2 * arc.p1.y,
});

/**
 * Portion de l'arc entre son sommet (t = 0.5) et t : Bézier quadratique de point de contrôle
 * (1−a)(1−b)·P0 + ((1−a)b + a(1−b))·C + ab·P1 (a = 0.5, b = t).
 */
function fromApex(arc: Arc, t: number): string {
  const a = 0.5;
  const end = quad(arc, t);
  const k0 = (1 - a) * (1 - t);
  const k1 = (1 - a) * t + a * (1 - t);
  const k2 = a * t;
  const control = { x: k0 * arc.p0.x + k1 * arc.c.x + k2 * arc.p1.x, y: k0 * arc.p0.y + k1 * arc.c.y + k2 * arc.p1.y };
  return `Q${fmt([control.x, control.y, end.x, end.y])}`;
}

function rails(count: number): Layout {
  const center = { x: 624, y: 280 };
  const h = 76;
  const topCount = Math.ceil(count / 2);
  const rows = [
    { arc: ARCS.top, m: topCount, dir: -1 },
    { arc: ARCS.bottom, m: count - topCount, dir: 1 },
  ];
  const cards: CardBox[] = [];
  const routes: string[] = [];
  const strokes: Layout["strokes"] = [];
  const nodes: Point[] = [];
  const links: string[] = [];
  for (const { arc, m, dir } of rows) {
    const spacing = 1000 / (m - 1);
    const w = Math.min(CARD_W, spacing - 16);
    const apex = quad(arc, 0.5);
    const odd = m % 2 === 1;
    // Liaison verticale : du cercle au sommet de l'arc (bord de la carte centrale si m est impair).
    const linkEnd = odd ? apex.y - dir * (h / 2) : apex.y;
    const linkStart = center.y + dir * AS_RADIUS;
    links.push(`M${fmt([center.x, linkStart])}V${round(linkEnd)}`);
    if (!odd) nodes.push(apex);
    for (let i = 0; i < m; i += 1) {
      const t = i / (m - 1);
      const point = quad(arc, t);
      cards.push({ x: point.x, y: point.y, w, h });
      const toApex = `M${fmt([center.x, linkStart])}V${round(apex.y)}`;
      routes.push(Math.abs(t - 0.5) < 1e-6 ? `M${fmt([center.x, linkStart])}V${round(linkEnd)}` : `${toApex}${fromApex(arc, t)}`);
    }
    // Arc en deux moitiés partant du sommet : il se dessine du sommet vers les deux extrémités.
    for (const end of [0, 1]) strokes.push({ d: `M${fmt([apex.x, apex.y])}${fromApex(arc, end)}`, kind: "arc" });
  }
  links.forEach((d) => strokes.push({ d, kind: "link" }));
  return { regime: "B", height: 560, center, cards, strokes, routes, nodes, shown: count, overflow: 0 };
}

const empty: Layout = { regime: "A", height: 240, center: { x: 624, y: 120 }, cards: [], strokes: [], routes: [], nodes: [], shown: 0, overflow: 0 };

export function layout(count: number): Layout {
  if (count <= 0) return empty;
  if (count <= 6) return constellation(count);
  if (count <= 12) return rails(count);
  return { ...rails(12), regime: "C", shown: 11, overflow: count - 11 };
}
