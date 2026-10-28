"use client";

import { motion, type MotionValue } from "motion/react";

import { WaveMotif } from "@/components/ui/WaveMotif";

type HeroMotifProps = {
  /** Décalage horizontal et vertical issu de la parallaxe souris (px). */
  offsetX: MotionValue<number>;
  offsetY: MotionValue<number>;
  /** Décalage vertical lié au défilement (px). */
  scrollY: MotionValue<number>;
};

/**
 * Zigzag doré du hero (opacité `--motif-zigzag-hero`) sur tout le fond de la section, avec parallaxe.
 * Le calque remonte sous le padding du header (72px, 90px dès xl) et déborde de 48px de chaque côté
 * (parallaxe ±18px + défilement 24px) : aucun bord vide pendant la dérive ; le hero coupe le surplus.
 */
export function HeroMotif({ offsetX, offsetY, scrollY }: HeroMotifProps) {
  return (
    <motion.div
      aria-hidden="true"
      style={{ y: scrollY }}
      className="pointer-events-none absolute -inset-x-12 -top-30 -bottom-12 xl:-top-34.5"
    >
      <motion.div style={{ x: offsetX, y: offsetY }} className="absolute inset-0">
        <WaveMotif tone="dark" mask="full" hero />
      </motion.div>
    </motion.div>
  );
}
