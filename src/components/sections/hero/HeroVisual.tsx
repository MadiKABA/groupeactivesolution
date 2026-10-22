"use client";

import { AnimatePresence, motion, type MotionValue, type Variants } from "motion/react";
import { Pause, Play } from "lucide-react";
import Image, { getImageProps } from "next/image";
import { useEffect } from "react";

import type { HeroCarousel } from "@/hooks/useHeroCarousel";
import { formatSlideCount, HERO_EASE, HERO_SLIDE_DURATION, heroSlides } from "@/lib/hero-slides";

const IMAGE_SIZES = "(min-width: 1024px) 50vw, 100vw";
const IMAGE_QUALITY = 80;
const SWIPE_THRESHOLD = 50;

type HeroVisualProps = {
  carousel: HeroCarousel;
  /** Présence de chaque image dans `public/` (vérifiée côté serveur). */
  imagesAvailable: readonly boolean[];
  reduce: boolean;
  offsetX: MotionValue<number>;
  offsetY: MotionValue<number>;
};

// Balayage clip-path : de droite à gauche en avant, de gauche à droite en arrière.
const slideVariants: Variants = {
  enter: ({ direction, reduce }: { direction: 1 | -1; reduce: boolean }) =>
    reduce
      ? { opacity: 0, zIndex: 1 }
      : {
          opacity: 0,
          zIndex: 1,
          clipPath: direction > 0 ? "inset(0 0 0 100%)" : "inset(0 100% 0 0)",
        },
  center: ({ reduce }: { reduce: boolean }) => ({
    opacity: 1,
    zIndex: 1,
    clipPath: "inset(0 0 0 0)",
    transition: reduce ? { duration: 0.3 } : { duration: 0.9, ease: HERO_EASE.wipe },
  }),
  exit: ({ reduce }: { reduce: boolean }) => ({
    opacity: 0,
    zIndex: 0,
    scale: reduce ? 1 : 0.98,
    // Retardé pour que l'ancienne image reste sous le balayage jusqu'à sa fin (0.3 + 0.6 = 0.9 s).
    transition: reduce ? { duration: 0.3 } : { duration: 0.6, delay: 0.3, ease: "easeOut" },
  }),
};

// Zoom d'entrée (1.12 → 1.04, pendant le balayage) puis Ken Burns lent (1.04 → 1).
const WIPE_DURATION = 0.9;
const KEN_BURNS_TOTAL = WIPE_DURATION + HERO_SLIDE_DURATION / 1000;

function ImagePlaceholder({ path }: { path: string }) {
  return (
    <div className="flex size-full items-center justify-center bg-brand-navy-soft p-6 text-center">
      <p className="rounded-md border border-dashed border-brand-gold px-4 py-3 text-sm text-text-on-dark">
        Image à fournir
        <br />
        <span className="text-text-on-dark/70">public{path}</span>
      </p>
    </div>
  );
}

export function HeroVisual({ carousel, imagesAvailable, reduce, offsetX, offsetY }: HeroVisualProps) {
  const { activeIndex, direction, isPaused, isRunning, progress, goTo, next, prev, togglePause, setHold } =
    carousel;
  const slide = heroSlides[activeIndex];
  const Icon = slide.icon;

  // Précharge les images suivantes (mêmes URL optimisées que next/image).
  useEffect(() => {
    heroSlides.forEach((item, index) => {
      if (index === 0 || !imagesAvailable[index]) return;
      const { props } = getImageProps({
        src: item.image,
        alt: "",
        fill: true,
        sizes: IMAGE_SIZES,
        quality: IMAGE_QUALITY,
      });
      const img = new window.Image();
      if (props.sizes) img.sizes = props.sizes;
      if (props.srcSet) img.srcset = props.srcSet;
      img.src = props.src;
    });
  }, [imagesAvailable]);

  return (
    <div className="relative w-full lg:max-w-155 lg:justify-self-end">
      {/* Halo doré derrière le cadre */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-[8%] rounded-full bg-brand-gold/18 blur-[90px]"
      />

      {/* Orbite : ellipse inclinée derrière le cadre, parcourue par un point lumineux */}
      <svg
        aria-hidden="true"
        viewBox="0 0 800 520"
        className="pointer-events-none absolute -top-[14%] -left-[12%] hidden h-[128%] w-[124%] -rotate-12 overflow-visible text-brand-gold lg:block"
      >
        <ellipse cx="400" cy="260" rx="390" ry="200" fill="none" stroke="currentColor" strokeOpacity="0.55" strokeWidth="1" vectorEffect="non-scaling-stroke" />
        {!reduce && (
          <circle r="4" className="fill-brand-gold-light" style={{ filter: "drop-shadow(0 0 6px var(--color-brand-gold))" }}>
            <animateMotion dur="14s" repeatCount="indefinite" path="M10 260 A390 200 0 1 1 790 260 A390 200 0 1 1 10 260" />
          </circle>
        )}
      </svg>

      <motion.div
        id="hero-visual"
        aria-live={isRunning ? "off" : "polite"}
        style={{ x: offsetX, y: offsetY, touchAction: "pan-y" }}
        onPanEnd={(_, info) => {
          if (info.offset.x <= -SWIPE_THRESHOLD) next();
          else if (info.offset.x >= SWIPE_THRESHOLD) prev();
        }}
        onMouseEnter={() => setHold("hover-visual", true)}
        onMouseLeave={() => setHold("hover-visual", false)}
        onPointerDown={(event) => event.pointerType === "touch" && setHold("touch", true)}
        onPointerUp={() => setHold("touch", false)}
        onPointerCancel={() => setHold("touch", false)}
        className="relative z-10 aspect-4/3 w-full overflow-hidden rounded-2xl border border-brand-gold/35 bg-brand-navy shadow-hero lg:rounded-hero"
      >
        <AnimatePresence initial={false} custom={{ direction, reduce }}>
          <motion.div
            key={activeIndex}
            custom={{ direction, reduce }}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            className="absolute inset-0"
          >
            <motion.div
              className="absolute inset-0"
              initial={{ scale: reduce ? 1 : 1.12 }}
              animate={{ scale: reduce ? 1 : [1.12, 1.04, 1] }}
              transition={{
                duration: KEN_BURNS_TOTAL,
                times: [0, WIPE_DURATION / KEN_BURNS_TOTAL, 1],
                ease: [HERO_EASE.wipe, "linear"],
              }}
            >
              {imagesAvailable[activeIndex] ? (
                <Image
                  src={slide.image}
                  alt={slide.alt}
                  fill
                  sizes={IMAGE_SIZES}
                  quality={IMAGE_QUALITY}
                  preload={activeIndex === 0}
                  className="object-cover"
                  draggable={false}
                />
              ) : (
                <ImagePlaceholder path={slide.image} />
              )}
            </motion.div>
          </motion.div>
        </AnimatePresence>

        {/* Voile bas pour la lisibilité de la pastille */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-2/5 bg-linear-to-b from-transparent to-brand-navy/65"
        />

        {/* Pastille en verre */}
        <div className="glass absolute bottom-5 left-5 z-20 flex items-center gap-3 rounded-full py-2.5 pr-5 pl-2.5">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="flex items-center gap-3"
            >
              <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-brand-gold text-brand-navy">
                <Icon aria-hidden="true" className="size-4" />
              </span>
              <span className="text-sm font-semibold text-text-on-dark">{slide.label}</span>
              <span className="text-sm text-text-on-dark/60">
                {formatSlideCount(activeIndex, heroSlides.length)}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Pause / lecture du défilement automatique (absent si animations réduites : pas d'autoplay) */}
        {!reduce && (
          <button
            type="button"
            onClick={togglePause}
            aria-pressed={isPaused}
            aria-label={
              isPaused ? "Reprendre le défilement automatique" : "Mettre en pause le défilement automatique"
            }
            className="glass absolute top-4 right-4 z-20 flex size-9 items-center justify-center rounded-full text-text-on-dark transition-colors duration-(--duration-base) ease-standard hover:[--glass-bg:color-mix(in_oklab,white_18%,transparent)]"
          >
            {isPaused ? (
              <Play aria-hidden="true" className="size-3.5" />
            ) : (
              <Pause aria-hidden="true" className="size-3.5" />
            )}
          </button>
        )}
      </motion.div>

      {/* Pagination (mobile) : la pastille active se remplit selon la progression */}
      <div className="relative z-10 mt-5 flex justify-center gap-1 lg:hidden">
        {heroSlides.map((item, index) => {
          const active = index === activeIndex;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`Afficher : ${item.label}`}
              aria-current={active ? "true" : undefined}
              className="flex h-6 items-center rounded-full px-1"
            >
              <span
                className={`relative block h-2 overflow-hidden rounded-full transition-[width,background-color] duration-300 ease-standard ${active ? "w-7 bg-text-on-dark/20" : "w-2 bg-text-on-dark/40"}`}
              >
                {active && (
                  <motion.span
                    className="absolute inset-0 origin-left bg-brand-gold"
                    style={{ scaleX: progress }}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
