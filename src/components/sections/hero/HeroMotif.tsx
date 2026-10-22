"use client";

import { motion, type MotionValue } from "motion/react";
import { useId } from "react";

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

/** Motif textile : bandes de chevrons et losanges imbriqués, tracés fins dorés. */
function MotifPattern({ id, className }: { id: string; className?: string }) {
  return (
    <svg aria-hidden="true" className={`absolute inset-0 size-full ${className ?? ""}`}>
      <defs>
        <pattern id={id} width="96" height="96" patternUnits="userSpaceOnUse">
          <g fill="none" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round">
            {/* Bande de chevrons */}
            <path d="M0 12 L12 0 L24 12 L36 0 L48 12 L60 0 L72 12 L84 0 L96 12" strokeOpacity="0.32" />
            <path d="M0 22 L12 10 L24 22 L36 10 L48 22 L60 10 L72 22 L84 10 L96 22" strokeOpacity="0.22" />
            {/* Losanges imbriqués */}
            <path d="M24 30 L42 48 L24 66 L6 48 Z" strokeOpacity="0.38" />
            <path d="M24 38 L34 48 L24 58 L14 48 Z" strokeOpacity="0.26" />
            <path d="M72 30 L90 48 L72 66 L54 48 Z" strokeOpacity="0.38" />
            <path d="M72 38 L82 48 L72 58 L62 48 Z" strokeOpacity="0.26" />
            <path d="M48 44 L52 48 L48 52 L44 48 Z" strokeOpacity="0.34" />
            {/* Bande de chevrons inversée */}
            <path d="M0 74 L12 86 L24 74 L36 86 L48 74 L60 86 L72 74 L84 86 L96 74" strokeOpacity="0.22" />
            <path d="M0 84 L12 96 L24 84 L36 96 L48 84 L60 96 L72 84 L84 96 L96 84" strokeOpacity="0.32" />
          </g>
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${id})`} />
    </svg>
  );
}

// useId peut contenir des caractères invalides dans une référence `url(#…)`.
const useSvgId = () => useId().replace(/[^a-zA-Z0-9-]/g, "");

export function HeroMotif({ offsetX, offsetY, scrollY, reduce }: HeroMotifProps) {
  const patternId = useSvgId();
  const shineId = useSvgId();

  return (
    <motion.div
      aria-hidden="true"
      style={{ y: scrollY }}
      className="pointer-events-none absolute top-0 right-0 bottom-1/2 left-1/2 opacity-55 lg:bottom-0 lg:left-[45%] lg:opacity-100"
    >
      <motion.div style={{ x: offsetX, y: offsetY }} className="hero-motif-mask absolute inset-0">
        <MotifPattern id={patternId} className="text-brand-gold" />

        {/* Reflet lumineux qui balaie lentement le motif */}
        {!reduce && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-1/3 animate-motif-band [mask-image:linear-gradient(to_right,transparent,black,transparent)]">
              <div className="absolute inset-y-0 left-0 w-[300%] animate-motif-band-inner">
                <MotifPattern id={shineId} className="text-brand-gold-light opacity-90" />
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
