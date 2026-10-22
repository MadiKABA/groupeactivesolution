"use client";

import {
  motion,
  MotionConfig,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useRef, type FocusEvent, type MouseEvent } from "react";

import { useHeroCarousel } from "@/hooks/useHeroCarousel";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { HERO_ENTRY_DELAY, HERO_SLIDE_DURATION, heroSlides } from "@/lib/hero-slides";

import { HeroCarouselText } from "./HeroCarouselText";
import { HeroMotif } from "./HeroMotif";
import { HeroVisual } from "./HeroVisual";

// Amplitudes de parallaxe, en px.
const FRAME_SHIFT = 10;
const MOTIF_SHIFT = 18;
const MOTIF_SCROLL = 60;

/** Orchestration du hero : état du carrousel, parallaxe et pauses automatiques. */
export function HeroStage({ imagesAvailable }: { imagesAvailable: readonly boolean[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine) and (min-width: 64rem)");
  const parallax = finePointer && !reduce;

  const carousel = useHeroCarousel({
    count: heroSlides.length,
    duration: HERO_SLIDE_DURATION,
    autoplay: !reduce,
    rootRef,
  });

  // Parallaxe souris : position normalisée de -1 à 1, lissée.
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const smoothX = useSpring(pointerX, { stiffness: 80, damping: 20 });
  const smoothY = useSpring(pointerY, { stiffness: 80, damping: 20 });
  const frameX = useTransform(smoothX, (value) => value * FRAME_SHIFT);
  const frameY = useTransform(smoothY, (value) => value * FRAME_SHIFT);
  const motifX = useTransform(smoothX, (value) => value * -MOTIF_SHIFT);
  const motifY = useTransform(smoothY, (value) => value * -MOTIF_SHIFT);

  // Parallaxe au défilement : le motif descend de 0 à 60px pendant que le hero sort de l'écran.
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start start", "end start"] });
  const motifScroll = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : MOTIF_SCROLL]);

  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!parallax) return;
    const rect = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - rect.left) / rect.width) * 2 - 1);
    pointerY.set(((event.clientY - rect.top) / rect.height) * 2 - 1);
  };

  const onMouseLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  // Pause tant que le focus clavier est dans la section.
  const onFocus = (event: FocusEvent<HTMLDivElement>) => {
    if (event.target.matches(":focus-visible")) carousel.setHold("focus", true);
  };
  const onBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) carousel.setHold("focus", false);
  };

  const visualEntry = reduce
    ? { duration: 0 }
    : { duration: 0.5, delay: HERO_ENTRY_DELAY.visual, ease: "easeOut" as const };

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={rootRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        onFocus={onFocus}
        onBlur={onBlur}
        className="relative flex flex-1 items-center"
      >
        <motion.div
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={visualEntry}
        >
          <HeroMotif
            offsetX={parallax ? motifX : pointerX}
            offsetY={parallax ? motifY : pointerY}
            scrollY={motifScroll}
            reduce={reduce}
          />
        </motion.div>

        <div className="mx-auto grid w-full max-w-site gap-8 px-6 pt-10 pb-16 md:px-10 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)] lg:items-center lg:gap-16 lg:py-10 xl:px-28">
          <HeroCarouselText carousel={carousel} reduce={reduce} />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={visualEntry}
            className="flex lg:justify-end"
          >
            <HeroVisual
              carousel={carousel}
              imagesAvailable={imagesAvailable}
              reduce={reduce}
              offsetX={parallax ? frameX : pointerX}
              offsetY={parallax ? frameY : pointerY}
            />
          </motion.div>
        </div>
      </div>
    </MotionConfig>
  );
}
