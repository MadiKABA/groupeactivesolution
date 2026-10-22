"use client";

import { AnimatePresence, motion, type MotionValue, type Variants } from "motion/react";

import { GlassChip } from "@/components/ui/GlassChip";
import { expertises } from "@/lib/expertises";
import { EASE } from "@/lib/motion";

import { ExpertiseImage } from "./ExpertiseImage";

type ExpertiseVisualProps = {
  activeIndex: number;
  /** 1 en descendant, -1 en remontant : sens du balayage vertical. */
  direction: 1 | -1;
  images: readonly (string | null)[];
  reduce: boolean;
  /** Palier « a » (desktop) : balayage plus lent, pastille complète. */
  desktop: boolean;
  /** Parallaxe interne de l'image liée au défilement (desktop uniquement). */
  parallaxY: MotionValue<number>;
  /** Parallaxe souris du cadre (desktop). */
  offsetX: MotionValue<number>;
  offsetY: MotionValue<number>;
  /** Progression de chaque bloc (0 → 1) pour les segments des paliers mobiles. */
  segments: readonly MotionValue<number>[];
  onNavigate: (index: number) => void;
};

type Custom = { direction: 1 | -1; reduce: boolean; duration: number };

// Balayage vertical (le hero balaie horizontalement) : depuis le bas en descendant, depuis le haut en remontant.
const slide: Variants = {
  enter: ({ direction, reduce }: Custom) =>
    reduce
      ? { opacity: 0, zIndex: 1 }
      : { zIndex: 1, clipPath: direction > 0 ? "inset(100% 0 0 0)" : "inset(0 0 100% 0)" },
  center: ({ reduce, duration }: Custom) => ({
    opacity: 1,
    zIndex: 1,
    clipPath: "inset(0 0 0 0)",
    transition: reduce ? { duration: 0.3 } : { duration, ease: EASE.wipe },
  }),
  exit: ({ reduce }: Custom) => ({
    opacity: 0,
    zIndex: 0,
    // L'ancienne image reste sous le balayage avant de s'effacer.
    transition: reduce ? { duration: 0.3 } : { duration: 0.5, delay: 0.3, ease: "easeOut" },
  }),
};

function Chevron({ d, className, reduce }: { d: string; className: string; reduce: boolean }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 28 28"
      className={`pointer-events-none absolute z-30 overflow-visible text-brand-gold ${className}`}
    >
      <motion.path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={{ pathLength: reduce ? 1 : 0 }}
        whileInView={{ pathLength: 1 }}
        viewport={{ once: true }}
        transition={reduce ? { duration: 0 } : { duration: 0.9, delay: 0.2, ease: EASE.reveal }}
      />
    </svg>
  );
}

export function ExpertiseVisual({
  activeIndex,
  direction,
  images,
  reduce,
  desktop,
  parallaxY,
  offsetX,
  offsetY,
  segments,
  onNavigate,
}: ExpertiseVisualProps) {
  const expertise = expertises[activeIndex];
  const custom: Custom = { direction, reduce, duration: desktop ? 0.8 : 0.6 };
  const total = String(expertises.length).padStart(2, "0");

  return (
    // Hauteur pilotée par --visual-h (desktop : jusqu'à 760px ; mobile : cadre large et bas).
    <div className="relative h-(--visual-h) w-full">
      {/* Halo doré très doux (desktop) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[6%] hidden rounded-full bg-brand-gold/12 blur-[80px] desk:block"
      />

      {/* Chevrons du logo : à l'extérieur du cadre (14px) en desktop, à l'intérieur (12px) ailleurs */}
      <Chevron
        d="M19 3 L8 14 L19 25"
        reduce={reduce}
        className="top-7 left-3 size-5 desk:-top-3.5 desk:-left-3.5 desk:size-7"
      />
      <Chevron
        d="M9 3 L20 14 L9 25"
        reduce={reduce}
        className="right-3 bottom-3 size-5 desk:-right-3.5 desk:-bottom-3.5 desk:size-7"
      />

      <motion.div
        aria-live="off"
        style={{ x: offsetX, y: offsetY }}
        className="relative size-full overflow-hidden rounded-2xl border border-brand-gold/35 bg-brand-navy shadow-frame desk:rounded-hero"
      >
        <AnimatePresence initial={false} custom={custom}>
          <motion.div
            key={activeIndex}
            custom={custom}
            variants={slide}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <motion.div
              // will-change en desktop : parallaxe liée au défilement, en continu.
              className="absolute -inset-y-5 inset-x-0 desk:will-change-transform"
              style={{ y: parallaxY }}
              initial={{ scale: reduce ? 1.04 : 1.12 }}
              animate={{ scale: 1.04 }}
              transition={reduce ? { duration: 0 } : { duration: custom.duration, ease: EASE.wipe }}
            >
              <ExpertiseImage expertise={expertise} src={images[activeIndex]} />
            </motion.div>
          </motion.div>
        </AnimatePresence>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2/5 bg-linear-to-b from-transparent to-brand-navy/60"
        />

        {/* Segments de progression (paliers mobiles) : passés dorés, actif qui se remplit */}
        <div className="absolute inset-x-3.5 top-0 z-20 flex gap-1.5 desk:hidden">
          {expertises.map((item, index) => (
            <button
              key={item.slug}
              type="button"
              onClick={() => onNavigate(index)}
              aria-label={`Aller à l'expertise ${item.number} : ${item.name}`}
              aria-current={index === activeIndex ? "true" : undefined}
              className="h-11 flex-1 rounded-sm pt-3.5 [--focus-ring:var(--color-brand-gold)]"
            >
              <span className="block h-0.75 overflow-hidden rounded-full bg-text-on-dark/30">
                <motion.span
                  className="block size-full origin-left bg-brand-gold"
                  style={{ scaleX: segments[index] }}
                />
              </span>
            </button>
          ))}
        </div>

        <GlassChip
          icon={expertise.icon}
          label={expertise.name}
          current={expertise.number}
          total={total}
          compact={!desktop}
          className="glass-touch-solid absolute bottom-3 left-3 z-20 desk:bottom-5 desk:left-5"
        />
      </motion.div>
    </div>
  );
}
