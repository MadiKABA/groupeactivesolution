"use client";

import { Camera } from "lucide-react";
import { motion, useMotionValue, useSpring, type MotionValue } from "motion/react";
import Image from "next/image";
import type { CSSProperties, PointerEvent } from "react";

import { EASE } from "@/lib/motion";
import { captionFor, type RealisationVisuel } from "@/lib/realisations";

export const REALISATION_IMAGE_QUALITY = 78;

/** Durées (s) : rideau, zoom de l'image ; pastille 0.5 s après la fin du rideau. */
const CURTAIN = { desktop: 1.0, mobile: 0.8 } as const;
const ZOOM = { desktop: 1.4, mobile: 1.0 } as const;
const CHIP_AFTER = 0.5;
/** Inclinaison 3D maximale au survol (degrés). */
const TILT = 2.5;
const TILT_SPRING = { stiffness: 180, damping: 18, mass: 0.6 } as const;

type RealisationCardProps = {
  visuel: RealisationVisuel;
  src: string | null;
  sizes: string;
  /** Photo principale : arrondi 28px, pastille plus grande, chevron, image surdimensionnée. */
  main?: boolean;
  /** Placement dans la grille et format mobile. */
  className?: string;
  revealed: boolean;
  delay: number;
  reduce: boolean;
  /** Révélation complète (desktop) ou simplifiée (mobile). */
  desktop: boolean;
  /** Effets immersifs : souris, desktop, sans animations réduites ni économie de données. */
  immersive: boolean;
  /** Parallaxe du cadre (px) ou de l'image intérieure (%). */
  y?: MotionValue<number>;
  innerY?: MotionValue<string>;
};

/** Emplacement de développement : composition graphique, jamais une fausse photo. */
function Placeholder({ visuel }: { visuel: RealisationVisuel }) {
  return (
    <div
      aria-hidden="true"
      className="realisation-placeholder absolute inset-0 flex flex-col items-center justify-center gap-2 px-3 text-center"
    >
      <Camera className="size-6 text-brand-gold lg:size-8" strokeWidth={1.5} />
      <span className="text-xs font-semibold text-text-on-dark/80 lg:text-sm">
        Emplacement photo <span className="whitespace-nowrap">· {visuel.fichier}</span>
      </span>
    </div>
  );
}

/**
 * Visuel du bento : rideau bleu nuit qui se lève (scaleY) avec un filet doré sur son bord,
 * zoom de l'image de 1.15 à 1, puis pastille en verre (desktop) ou légende sous l'image (mobile).
 * Au survol (souris, desktop) : inclinaison 3D sur ressort, zoom 1.04, pastille soulevée.
 */
export function RealisationCard({
  visuel,
  src,
  sizes,
  main = false,
  className = "",
  revealed,
  delay,
  reduce,
  desktop,
  immersive,
  y,
  innerY,
}: RealisationCardProps) {
  const curtain = desktop ? CURTAIN.desktop : CURTAIN.mobile;
  const zoom = desktop ? ZOOM.desktop : ZOOM.mobile;
  const caption = captionFor(visuel);
  const chipDelay = delay + (reduce ? 0.4 : curtain) + CHIP_AFTER;

  // Inclinaison : valeurs Motion sur ressort, mises à jour sans re-rendu React.
  const rotateX = useSpring(useMotionValue(0), TILT_SPRING);
  const rotateY = useSpring(useMotionValue(0), TILT_SPRING);
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!immersive || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    const px = (event.clientX - box.left) / box.width - 0.5;
    const py = (event.clientY - box.top) / box.height - 0.5;
    rotateY.set(px * 2 * TILT);
    rotateX.set(-py * 2 * TILT);
  };
  const resetTilt = () => {
    rotateX.set(0);
    rotateY.set(0);
  };

  const hoverZoom = immersive ? "transition-transform duration-600 ease-standard group-hover:scale-104" : "";
  const hoverLift = immersive ? "transition-transform duration-(--duration-base) ease-standard group-hover:-translate-y-0.5" : "";

  return (
    <motion.figure style={y ? { y } : undefined} className={`group relative ${y && immersive ? "realisation-parallax" : ""} ${className}`}>
      {main && (
        // Chevron « < » du logo, hors cadre (-36px / -4px), décoratif.
        <motion.svg
          aria-hidden="true"
          viewBox="0 0 28 28"
          className="pointer-events-none absolute -top-1 -left-9 z-20 hidden size-7 overflow-visible text-brand-gold lg:block"
          initial={{ opacity: 0, x: reduce ? 0 : 8 }}
          animate={revealed ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 0.6, delay: delay + (reduce ? 0 : 0.6), ease: EASE.reveal }}
        >
          <path d="M19 3 L8 14 L19 25" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </motion.svg>
      )}

      <motion.div
        onPointerMove={onPointerMove}
        onPointerLeave={resetTilt}
        style={immersive ? { rotateX, rotateY, transformPerspective: 1000 } : undefined}
        className="relative lg:h-full"
      >
        <div
          className={`relative overflow-hidden border bg-brand-navy-soft shadow-photo lg:h-full ${main ? "aspect-4/3 rounded-hero border-brand-gold/35 lg:aspect-auto" : "aspect-4/5 rounded-2xl border-brand-gold/30 lg:aspect-auto"}`}
        >
          {/* Image surdimensionnée à 108 % quand elle suit la parallaxe : aucun bord vide */}
          <motion.div
            className={`absolute inset-x-0 ${innerY ? "realisation-parallax -top-[4%] h-[108%]" : "inset-y-0"}`}
            style={innerY ? { y: innerY } : undefined}
          >
            <motion.div
              className="size-full"
              initial={reduce ? { opacity: 0 } : { scale: desktop ? 1.15 : 1.1 }}
              animate={revealed ? (reduce ? { opacity: 1 } : { scale: 1 }) : undefined}
              transition={reduce ? { duration: 0.4, delay } : { duration: zoom, delay, ease: EASE.reveal }}
            >
              <div className={`relative size-full ${hoverZoom}`}>
                {src ? (
                  <Image
                    src={src}
                    alt={visuel.alt}
                    fill
                    sizes={sizes}
                    quality={REALISATION_IMAGE_QUALITY}
                    loading="lazy"
                    decoding="async"
                    draggable={false}
                    className="object-cover [object-position:var(--focal-m)] lg:[object-position:var(--focal-d)]"
                    style={{ "--focal-m": visuel.focalMobile, "--focal-d": visuel.focalDesktop } as CSSProperties}
                  />
                ) : (
                  <Placeholder visuel={visuel} />
                )}
              </div>
            </motion.div>
          </motion.div>

          {!reduce && (
            <>
              {/* Rideau : se lève vers le haut */}
              <motion.div
                aria-hidden="true"
                className="absolute inset-0 origin-top bg-brand-navy"
                initial={{ scaleY: 1 }}
                animate={revealed ? { scaleY: 0 } : undefined}
                transition={{ duration: curtain, delay, ease: EASE.wipe }}
              />
              {/* Filet doré de 2px qui suit le bord du rideau, puis s'efface */}
              <motion.div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                initial={{ y: "0%", opacity: 0 }}
                animate={revealed ? { y: "-100%", opacity: [0, 1, 1, 0] } : undefined}
                transition={{
                  y: { duration: curtain, delay, ease: EASE.wipe },
                  opacity: { duration: curtain, delay, times: [0, 0.05, 0.8, 1] },
                }}
              >
                <span className="absolute inset-x-0 bottom-0 h-0.5 bg-brand-gold" />
              </motion.div>
            </>
          )}
        </div>

        {caption && (
          // Desktop : pastille en verre (20px de la principale, 14px des autres) ; mobile : texte sous l'image.
          <motion.figcaption
            initial={{ opacity: 0, y: reduce ? 0 : 8 }}
            animate={revealed ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.5, delay: chipDelay, ease: EASE.reveal }}
            className={`mt-3 lg:absolute lg:mt-0 lg:max-w-[calc(100%-2.5rem)] ${main ? "lg:bottom-5 lg:left-5" : "lg:bottom-3.5 lg:left-3.5"}`}
          >
            <span className={`relative flex flex-col gap-1 lg:rounded-2xl lg:px-4 lg:py-2.5 ${hoverLift}`}>
              {/* Verre (variables --glass-*) en desktop uniquement */}
              <span aria-hidden="true" className="glass absolute inset-0 hidden rounded-[inherit] lg:block" />
              <span className="relative flex items-center gap-2 text-2xs font-semibold tracking-category text-brand-gold uppercase">
                <span aria-hidden="true" className="hidden size-2 rounded-full bg-brand-gold ring-4 ring-brand-gold/20 lg:block" />
                {visuel.categorie}
              </span>
              <span className={`relative line-clamp-2 text-sm text-text-on-dark lg:line-clamp-none lg:truncate ${main ? "lg:text-nav" : ""}`}>
                {caption}
              </span>
            </span>
          </motion.figcaption>
        )}
      </motion.div>
    </motion.figure>
  );
}
