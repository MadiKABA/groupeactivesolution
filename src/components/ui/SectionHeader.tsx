"use client";

import { motion } from "motion/react";

import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { EASE } from "@/lib/motion";

type SectionHeaderProps = {
  /** Identifiant du h2, pour `aria-labelledby` de la section. */
  id: string;
  eyebrow: string;
  /** Phrases du titre, révélées une à une depuis un masque. */
  titleLines: readonly string[];
  /** Souligne la dernière phrase d'un trait doré tracé. */
  underlineLast?: boolean;
  /**
   * Titre « display » : très grand, sur une seule ligne à partir de 1024px,
   * une phrase par ligne en dessous. Sinon, style h2 standard (une phrase par ligne).
   */
  display?: boolean;
  intro?: string;
  className?: string;
};

// Déclenché dès qu'un pixel est visible : le haut de l'en-tête sert de teaser sous le hero.
const VIEWPORT = { once: true, amount: 0 } as const;

/** En-tête de section sur fond clair : libellé + trait doré, titre (h2) et introduction. */
export function SectionHeader({
  id,
  eyebrow,
  titleLines,
  underlineLast = false,
  display = false,
  intro,
  className = "",
}: SectionHeaderProps) {
  const reduce = usePrefersReducedMotion();
  const timing = (delay: number, duration = 0.6) =>
    reduce ? { duration: 0 } : { duration, delay, ease: EASE.reveal };
  const lastIndex = titleLines.length - 1;
  const linesEnd = 0.2 + lastIndex * 0.12 + 0.9;

  const titleClass = display
    ? "mt-5 text-display-section-sm font-extrabold tracking-display-tight lg:text-display-section lg:whitespace-nowrap"
    : "mt-6 text-section font-extrabold tracking-display";
  // En display, chaque phrase est un bloc en mobile et s'aligne sur la même ligne en desktop.
  const lineClass = display ? "block overflow-hidden lg:inline-block lg:align-top" : "block overflow-hidden";

  return (
    <motion.header initial="hidden" whileInView="visible" viewport={VIEWPORT} className={className}>
      <p className="flex items-center gap-3 text-xs font-semibold tracking-eyebrow text-text-primary uppercase">
        <motion.span
          aria-hidden="true"
          className="h-0.5 w-9 origin-left bg-brand-gold"
          variants={{ hidden: { scaleX: 0 }, visible: { scaleX: 1, transition: timing(0) } }}
        />
        <motion.span
          variants={{ hidden: { opacity: 0 }, visible: { opacity: 1, transition: timing(0.3, 0.5) } }}
        >
          {eyebrow}
        </motion.span>
      </p>

      <h2 id={id} className={`${titleClass} text-text-primary`}>
        {titleLines.map((line, index) => (
          <span key={line}>
            {/* Masque de révélation ; le padding bas laisse la place au soulignement */}
            <span className={`${lineClass} -mb-[0.2em] pb-[0.2em]`}>
              <motion.span
                className="relative inline-block"
                variants={{
                  hidden: { y: "110%" },
                  visible: { y: 0, transition: timing(0.2 + index * 0.12, 0.9) },
                }}
              >
                {line}
                {underlineLast && index === lastIndex && (
                  // Révélé de gauche à droite par clip-path : un tracé `pathLength` est faussé
                  // par `non-scaling-stroke` sur un SVG étiré (le trait s'arrêtait aux 2/3).
                  <motion.svg
                    aria-hidden="true"
                    viewBox="0 0 200 14"
                    preserveAspectRatio="none"
                    className="absolute -bottom-[0.12em] left-0 h-[0.2em] w-full overflow-visible text-brand-gold"
                    variants={{
                      hidden: { clipPath: "inset(-50% 100% -50% -2%)" },
                      visible: {
                        clipPath: "inset(-50% -2% -50% -2%)",
                        transition: timing(linesEnd - 0.3, 0.7),
                      },
                    }}
                  >
                    {/* Trait épais, légèrement incliné vers le haut à droite */}
                    <path
                      d="M4 11 C 60 9, 130 6, 196 3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={display ? 8 : 5}
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </motion.svg>
                )}
              </motion.span>
            </span>
            {/* Espace entre les phrases quand elles partagent la ligne */}
            {index < lastIndex && " "}
          </span>
        ))}
      </h2>

      {intro && (
        <motion.p
          className={`${display ? "mt-7 max-w-160 text-lg" : "mt-6 max-w-140 text-body-lg"} text-text-primary/72`}
          variants={{
            hidden: { opacity: 0, y: 12 },
            visible: { opacity: 1, y: 0, transition: timing(0.5, 0.7) },
          }}
        >
          {intro}
        </motion.p>
      )}
    </motion.header>
  );
}
