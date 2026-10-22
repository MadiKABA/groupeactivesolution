"use client";

import { motion, type MotionValue } from "motion/react";
import { MotifPattern } from "@/components/ui/MotifPattern";

/*
 * Réseau de points : positions (en % de la zone du motif), tailles et rythmes fixes
 * pour un rendu identique serveur / client. Les 6 premiers restent visibles sur mobile.
 */
const points = [
  { x: 62, y: 14, size: 3, duration: 3.2, delay: 0.4 },
  { x: 78, y: 22, size: 4, duration: 4.1, delay: 1.3 },
  { x: 90, y: 38, size: 2, duration: 2.7, delay: 0.9 },
  { x: 70, y: 34, size: 3, duration: 4.6, delay: 2.1 },
  { x: 84, y: 8, size: 2, duration: 3.6, delay: 0.2 },
  { x: 95, y: 20, size: 3, duration: 2.9, delay: 1.7 },
  { x: 30, y: 20, size: 2, duration: 3.9, delay: 0.6 },
  { x: 44, y: 10, size: 3, duration: 4.4, delay: 2.6 },
  { x: 36, y: 42, size: 2, duration: 2.5, delay: 1.1 },
  { x: 52, y: 58, size: 4, duration: 5, delay: 0.3 },
  { x: 24, y: 66, size: 2, duration: 3.4, delay: 1.9 },
  { x: 40, y: 82, size: 3, duration: 4.8, delay: 0.8 },
  { x: 60, y: 90, size: 2, duration: 2.8, delay: 2.3 },
  { x: 76, y: 70, size: 3, duration: 3.7, delay: 1.5 },
  { x: 92, y: 62, size: 2, duration: 4.2, delay: 0.5 },
  { x: 86, y: 86, size: 3, duration: 3.1, delay: 2.8 },
] as const;

const MOBILE_POINTS = 6;

// Liaisons entre points (indices dans `points`).
const links = [
  [0, 1], [1, 2], [1, 3], [0, 3], [0, 4], [4, 1], [1, 5], [5, 2],
  [6, 7], [7, 0], [6, 8], [8, 3], [8, 9], [9, 3], [9, 10], [10, 11],
  [11, 12], [12, 13], [13, 9], [13, 14], [14, 2], [13, 15], [15, 14],
] as const;

type HeroMotifProps = {
  /** Décalage horizontal et vertical issu de la parallaxe souris (px). */
  offsetX: MotionValue<number>;
  offsetY: MotionValue<number>;
  /** Décalage vertical lié au défilement (px). */
  scrollY: MotionValue<number>;
  reduce: boolean;
};

export function HeroMotif({ offsetX, offsetY, scrollY, reduce }: HeroMotifProps) {

  return (
    <motion.div
      aria-hidden="true"
      style={{ y: scrollY }}
      className="pointer-events-none absolute top-0 right-0 bottom-1/2 left-1/2 opacity-55 lg:bottom-0 lg:left-[45%] lg:opacity-100"
    >
      <motion.div style={{ x: offsetX, y: offsetY }} className="hero-motif-mask absolute inset-0">
        <MotifPattern className="text-brand-gold" />

        {/* Reflet lumineux qui balaie lentement le motif */}
        {!reduce && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1/3 animate-motif-band [mask-image:linear-gradient(to_right,transparent,black,transparent)]">
              <div className="absolute inset-y-0 left-0 w-[300%] animate-motif-band-inner">
                <MotifPattern className="text-brand-gold-light opacity-90" />
              </div>
            </div>
          </div>
        )}

        {/* Réseau de points reliés */}
        <svg
          className="absolute inset-0 size-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          {links.map(([from, to]) => (
            <line
              key={`${from}-${to}`}
              x1={points[from].x}
              y1={points[from].y}
              x2={points[to].x}
              y2={points[to].y}
              stroke="currentColor"
              strokeOpacity="0.25"
              strokeWidth="1"
              vectorEffect="non-scaling-stroke"
              className={`text-brand-gold ${from >= MOBILE_POINTS || to >= MOBILE_POINTS ? "hidden lg:inline" : ""}`}
            />
          ))}
        </svg>
        {points.map((point, index) => (
          <span
            key={`${point.x}-${point.y}`}
            className={`absolute -translate-1/2 rounded-full bg-brand-gold-light opacity-60 shadow-glow motion-safe:animate-twinkle ${index >= MOBILE_POINTS ? "hidden lg:block" : ""}`}
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              width: point.size,
              height: point.size,
              animationDuration: `${point.duration}s`,
              animationDelay: `${point.delay}s`,
            }}
          />
        ))}
      </motion.div>
    </motion.div>
  );
}
