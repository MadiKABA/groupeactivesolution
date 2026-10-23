"use client";

import { motion, useTransform, type MotionValue, type Transition } from "motion/react";
import { memo } from "react";

import { EASE } from "@/lib/motion";
import { METHODE_LAYERS } from "@/lib/methode";

export type LayerState = "rest" | "done" | "active" | "upcoming";

/** Entrée de la pile, issue de la table de séquence de MethodeClient (s). */
export type PileTiming = {
  /** Durée de l'entrée d'une couche et décalage entre couches (l'étape 4 part la première, le logo en dernier). */
  duration: number;
  stagger: number;
  /** Apparition de chaque nœud (index 0 → étape 1) ; null : le nœud entre avec sa couche. */
  nodeDelays: readonly number[] | null;
  nodeDuration: number;
};

const VIEW_H = 740;
const THICKNESS = 20;
const RADIUS = 22;
const CX = 360;
/** Décalage maximal des couches selon la profondeur (px). */
const DEPTH_SHIFT = 6;
/** Translations en % de la hauteur de la pile (740 unités) : levée de 8, entrée depuis -60. */
const LIFT = `${(-8 / VIEW_H) * 100}%`;
const ENTRY_Y = `${(-60 / VIEW_H) * 100}%`;
/** Ordre de dessin : étape 4 → 1, puis le logo (les couches hautes masquent les basses). */
const DRAW_ORDER = [4, 3, 2, 1, 0] as const;
const LOGO = { src: "/logos/logo-mark.svg", width: 96, height: 40 };

const navyAt = (opacity: number) => `color-mix(in oklab, var(--color-brand-navy) ${opacity * 100}%, transparent)`;

type SlabProps = { hw: number; cy: number; face: string; side: string; stroke: string; width: number };

/** Une couche : tranche (rect décalé de 20 + deux arêtes verticales), puis face supérieure. */
function Slab({ hw, cy, face, side, stroke, width }: SlabProps) {
  const s = hw * Math.SQRT2;
  const xL = hw - 9;
  const square = (y: number, fill: string) => (
    <rect
      x={-s / 2}
      y={-s / 2}
      width={s}
      height={s}
      rx={RADIUS}
      transform={`translate(${CX} ${y}) scale(1 .5) rotate(45)`}
      vectorEffect="non-scaling-stroke"
      style={{ fill }}
    />
  );
  return (
    <g style={{ stroke }} strokeWidth={width} strokeLinejoin="round">
      {square(cy + THICKNESS, side)}
      <line x1={CX - xL} y1={cy} x2={CX - xL} y2={cy + THICKNESS} vectorEffect="non-scaling-stroke" />
      <line x1={CX + xL} y1={cy} x2={CX + xL} y2={cy + THICKNESS} vectorEffect="non-scaling-stroke" />
      {square(cy, face)}
    </g>
  );
}

type NodeProps = { cy: number; label: string; active: boolean; reduce: boolean; entered: boolean; appear: Transition | null };

function Node({ cy, label, active, reduce, entered, appear }: NodeProps) {
  const fade = { duration: 0.3, ease: "easeOut" } as const;
  const text = { x: CX, y: cy, textAnchor: "middle", dominantBaseline: "central", fontSize: 14, fontWeight: 800 } as const;
  return (
    // Apparition propre au nœud (desktop : à l'instant de son étape), sinon avec sa couche.
    <motion.g
      data-reveal
      initial={appear ? { opacity: 0, scale: reduce ? 1 : 0.6 } : false}
      animate={entered ? { opacity: 1, scale: 1 } : undefined}
      transition={appear ?? undefined}
    >
      {/* Halo de la couche active : pulse une fois à chaque activation (monté à l'activation) */}
      {active && (
        <motion.circle
          cx={CX}
          cy={cy}
          r={24}
          style={{ fill: "color-mix(in oklab, var(--color-brand-gold) 30%, transparent)" }}
          initial={reduce ? false : { scale: 0.9, opacity: 0 }}
          animate={reduce ? undefined : { scale: [0.9, 1.15, 1], opacity: [0, 1, 1] }}
          transition={{ duration: 0.9, ease: EASE.reveal }}
        />
      )}
      <circle cx={CX} cy={cy} r={15} style={{ fill: "var(--color-brand-navy)" }} />
      <motion.circle cx={CX} cy={cy} r={15} style={{ fill: "var(--color-brand-gold)" }} initial={false} animate={{ opacity: active ? 1 : 0 }} transition={fade} />
      <text {...text} style={{ fill: "var(--color-text-on-dark)" }}>
        {label}
      </text>
      <motion.text {...text} style={{ fill: "var(--color-brand-navy)" }} initial={false} animate={{ opacity: active ? 1 : 0 }} transition={fade}>
        {label}
      </motion.text>
    </motion.g>
  );
}

/** Monogramme posé à plat sur la face du haut, puis reflet lumineux unique (transform, rogné à la face). */
function LogoFace({ entered, reduce, delay }: { entered: boolean; reduce: boolean; delay: number }) {
  const { hw, cy } = METHODE_LAYERS[0];
  const s = hw * Math.SQRT2;
  const flat = `translate(${CX} ${cy}) scale(1 .5) rotate(45)`;
  return (
    <g>
      <image href={LOGO.src} x={-LOGO.width / 2} y={-LOGO.height / 2} width={LOGO.width} height={LOGO.height} transform={flat} />
      {!reduce && (
        <>
          <clipPath id="methode-logo-face">
            <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={RADIUS} transform={flat} />
          </clipPath>
          <g clipPath="url(#methode-logo-face)">
            <motion.rect
              x={CX - 30}
              y={cy - 60}
              width={36}
              height={120}
              style={{ fill: "color-mix(in oklab, white 70%, transparent)", skewX: -20 }}
              initial={{ x: -110, opacity: 0 }}
              animate={entered ? { x: 130, opacity: [0, 1, 0] } : undefined}
              transition={{ duration: 1.1, delay, ease: "easeInOut" }}
            />
          </g>
        </>
      )}
    </g>
  );
}

type LayerProps = {
  index: number;
  state: LayerState;
  order: number;
  entered: boolean;
  timing: PileTiming;
  mobile: boolean;
  reduce: boolean;
  strokeWidth: number;
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
};

/**
 * Une couche = un <svg> plein cadre (même viewBox) : ses déplacements (profondeur, entrée, levée)
 * sont des transforms HTML, composités, sans repeindre les autres couches.
 * Mémoïsée : seule la couche dont l'état change est re-rendue.
 */
const Layer = memo(function Layer({ index, state, order, entered, timing, mobile, reduce, strokeWidth, pointerX, pointerY }: LayerProps) {
  const { hw, cy, stroke } = METHODE_LAYERS[index];
  // Profondeur : le logo (en haut) bouge le plus, l'étape 4 le moins.
  const depth = 1 - index * 0.2;
  const x = useTransform(pointerX, (v) => v * DEPTH_SHIFT * depth);
  const y = useTransform(pointerY, (v) => v * DEPTH_SHIFT * depth);
  const active = state === "active";
  const fade = { duration: 0.3, ease: "easeOut" } as const;

  const delay = order * timing.stagger;
  const entry = reduce
    ? { initial: { opacity: 0 }, transition: { duration: timing.duration, delay } }
    : { initial: { opacity: 0, y: mobile ? "-2.7%" : ENTRY_Y }, transition: { duration: timing.duration, delay, ease: EASE.reveal } };
  const nodeAppear = timing.nodeDelays && index > 0 ? { duration: timing.nodeDuration, delay: timing.nodeDelays[index - 1], ease: EASE.reveal } : null;

  return (
    <motion.div className="methode-layer absolute inset-0" style={{ x, y }}>
      <motion.div
        data-reveal
        className="size-full"
        initial={entry.initial}
        animate={entered ? { opacity: state === "upcoming" ? 0.55 : 1, y: "0%" } : undefined}
        transition={entry.transition}
      >
        <motion.svg
          viewBox={`0 0 720 ${VIEW_H}`}
          preserveAspectRatio="xMidYMid meet"
          className="block size-full overflow-visible"
          animate={{ y: active ? LIFT : "0%" }}
          transition={{ duration: reduce ? 0 : 0.5, ease: EASE.reveal }}
        >
          {/* Calques d'état : seule leur opacité change */}
          <Slab hw={hw} cy={cy} face="var(--color-surface-warm)" side="var(--color-surface-sunken)" stroke={navyAt(stroke)} width={strokeWidth} />
          <motion.g initial={false} animate={{ opacity: state === "done" ? 1 : 0 }} transition={fade}>
            <Slab hw={hw} cy={cy} face="var(--color-surface-warm)" side="var(--color-surface-sunken)" stroke={navyAt(0.85)} width={strokeWidth} />
          </motion.g>
          <motion.g initial={false} animate={{ opacity: active ? 1 : 0 }} transition={fade}>
            <Slab hw={hw} cy={cy} face="var(--color-gold-tint)" side="var(--color-gold-tint-side)" stroke="var(--color-gold-line)" width={2} />
          </motion.g>

          {index === 0 ? (
            <LogoFace entered={entered} reduce={reduce} delay={delay + timing.duration} />
          ) : (
            <Node cy={cy} label={String(index)} active={active} reduce={reduce} entered={entered} appear={nodeAppear} />
          )}
        </motion.svg>
      </motion.div>
    </motion.div>
  );
});

type MethodeLayersProps = {
  /** État des quatre étapes (index 0 → étape 1). */
  states: readonly LayerState[];
  entered: boolean;
  /** Assemblage (la couche de l'étape 4 part la première) et apparition des nœuds ; objet stable. */
  timing: PileTiming;
  mobile: boolean;
  reduce: boolean;
  /** Position du pointeur normalisée (-1 → 1), ressorts (desktop avec souris), sinon 0. */
  pointerX: MotionValue<number>;
  pointerY: MotionValue<number>;
};

/**
 * Pile de quatre couches et de la couche du logo, en SVG pur (aucun filtre, aucune image raster) :
 * un <svg> par couche, superposés dans l'ordre de dessin.
 */
export function MethodeLayers({ states, entered, timing, mobile, reduce, pointerX, pointerY }: MethodeLayersProps) {
  return (
    <div role="img" aria-label="Pile de quatre couches représentant les quatre étapes de la méthode" className="relative size-full">
      {DRAW_ORDER.map((index, order) => (
        <Layer
          key={index}
          index={index}
          order={order}
          state={index === 0 ? "rest" : states[index - 1]}
          entered={entered}
          timing={timing}
          mobile={mobile}
          reduce={reduce}
          strokeWidth={mobile ? 2 : 1.5}
          pointerX={pointerX}
          pointerY={pointerY}
        />
      ))}
    </div>
  );
}
