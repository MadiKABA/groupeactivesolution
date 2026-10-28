"use client";

import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, type MotionValue, type Transition } from "motion/react";
import Link from "next/link";
import { useId, useRef, type KeyboardEvent } from "react";

import { ButtonShine } from "@/components/ui/ButtonShine";
import type { HeroCarousel } from "@/hooks/useHeroCarousel";
import { HERO_EASE, HERO_ENTRY_DELAY, heroSlides, type HeroSlide } from "@/lib/hero-slides";
import { ROUTES } from "@/lib/routes";

const MotionLink = motion.create(Link);

type HeroCarouselTextProps = {
  carousel: HeroCarousel;
  reduce: boolean;
};

/** Transition d'entrée : fondu + légère montée, instantanée si animations réduites. */
function entry(reduce: boolean, delay: number, duration = 0.5): Transition {
  return reduce ? { duration: 0 } : { duration, delay, ease: "easeOut" };
}

/** Pastille d'information au-dessus du titre : décorative, neutre, non interactive. */
function HeroBadge({ reduce }: { reduce: boolean }) {
  const separator = (
    <>
      <span aria-hidden="true" className="size-0.75 shrink-0 rounded-full bg-text-on-dark/35" />
      <span className="sr-only">, </span>
    </>
  );

  return (
    <motion.p
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={entry(reduce, HERO_ENTRY_DELAY.badge)}
      className="glass glass-sweep inline-flex h-8 w-fit items-center gap-2.5 rounded-full px-3.5 text-xs font-medium tracking-badge whitespace-nowrap text-text-on-dark/78"
    >
      {/* Point pulsant : l'anneau se dilate en boucle (statique si animations réduites) */}
      <span aria-hidden="true" className="relative flex size-2 shrink-0">
        <span className="absolute inset-0 rounded-full bg-brand-gold opacity-0 motion-safe:animate-pulse-ring" />
        <span className="relative size-2 rounded-full bg-brand-gold shadow-glow" />
      </span>
      <span>Dakar</span>
      {separator}
      <span>Sénégal</span>
      {separator}
      <span>
        Depuis <span className="font-semibold text-text-on-dark/92">2021</span>
      </span>
    </motion.p>
  );
}

type TitleLineProps = {
  slide: HeroSlide;
  index: number;
  active: boolean;
  progress: MotionValue<number>;
  reduce: boolean;
  hintId: string;
  onSelect: () => void;
  buttonRef: (element: HTMLButtonElement | null) => void;
};

function TitleLine({ slide, index, active, progress, reduce, hintId, onSelect, buttonRef }: TitleLineProps) {
  return (
    // Masque de révélation ; le padding évite de rogner les jambages et la barre.
    // En xl (titre sans retour à la ligne), le masque suit la largeur du texte, qui peut
    // déborder dans l'espace entre les colonnes sans jamais atteindre le visuel.
    <span className="-mb-[0.14em] block overflow-hidden pb-[0.14em] xl:w-max">
      <motion.span
        className="block"
        initial={{ y: "110%" }}
        animate={{ y: 0 }}
        transition={
          reduce
            ? { duration: 0 }
            : {
                duration: 0.8,
                ease: HERO_EASE.reveal,
                delay: HERO_ENTRY_DELAY.lines + index * HERO_ENTRY_DELAY.lineStagger,
              }
        }
      >
        <button
          ref={buttonRef}
          type="button"
          onClick={onSelect}
          aria-current={active ? "true" : undefined}
          aria-controls="hero-visual"
          aria-describedby={hintId}
          className="group relative inline-block cursor-pointer rounded-sm text-left"
        >
          {/* Texte blanc (inactif) et texte doré (actif) en fondu croisé : aucun saut de couleur */}
          <span
            className={`transition-opacity duration-500 ease-out ${active ? "opacity-0" : "opacity-35 group-hover:opacity-60 group-hover:duration-(--duration-base)"}`}
          >
            {slide.line}
          </span>
          <span
            aria-hidden="true"
            className={`hero-gradient-text absolute inset-0 transition-opacity duration-500 ease-out ${active ? "opacity-100" : "opacity-0"}`}
          >
            {slide.line}
          </span>
          {active && !reduce && (
            <span aria-hidden="true" className="hero-text-shine absolute inset-0 animate-text-shine">
              {slide.line}
            </span>
          )}
          {active && (
            <span
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-0.5 overflow-hidden rounded-full bg-text-on-dark/12"
            >
              <motion.span
                className="block size-full origin-left bg-brand-gold"
                style={{ scaleX: progress }}
              />
            </span>
          )}
        </button>
      </motion.span>
    </span>
  );
}

export function HeroCarouselText({ carousel, reduce }: HeroCarouselTextProps) {
  const { activeIndex, progress, goTo, next, prev, setHold } = carousel;
  const buttons = useRef<(HTMLButtonElement | null)[]>([]);
  const hintId = useId();
  const count = heroSlides.length;

  // Flèches gauche / droite dans le titre : change d'état et suit le focus.
  const onTitleKeyDown = (event: KeyboardEvent<HTMLHeadingElement>) => {
    if (event.key !== "ArrowRight" && event.key !== "ArrowLeft") return;
    event.preventDefault();
    const forward = event.key === "ArrowRight";
    const target = (activeIndex + (forward ? 1 : -1) + count) % count;
    if (forward) next();
    else prev();
    buttons.current[target]?.focus();
  };

  return (
    // Ordre : badge, titre, légende, boutons — rien d'autre.
    <div
      className="relative z-10 flex flex-col"
      onMouseEnter={() => setHold("hover-text", true)}
      onMouseLeave={() => setHold("hover-text", false)}
    >
      {/* a0) Badge */}
      <HeroBadge reduce={reduce} />

      {/* a) Titre : les 3 lignes cliquables forment un seul h1 */}
      <h1
        onKeyDown={onTitleKeyDown}
        className="mt-6 text-hero font-bold tracking-display text-text-on-dark xl:whitespace-nowrap"
      >
        {heroSlides.map((slide, index) => (
          <TitleLine
            key={slide.line}
            slide={slide}
            index={index}
            active={index === activeIndex}
            progress={progress}
            reduce={reduce}
            hintId={hintId}
            onSelect={() => goTo(index)}
            buttonRef={(element) => {
              buttons.current[index] = element;
            }}
          />
        ))}
      </h1>
      <span id={hintId} className="sr-only">
        Afficher l’expertise correspondante (flèches gauche et droite pour naviguer)
      </span>

      {/* b) Légende de l'état actif (hauteur réservée : 3 lignes) */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={entry(reduce, HERO_ENTRY_DELAY.caption)}
        className="mt-7 min-h-[4.8em] max-w-130 text-base leading-relaxed text-text-on-dark/82"
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={activeIndex}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0, transition: { duration: reduce ? 0.2 : 0.45, ease: "easeOut" } }}
            exit={{ opacity: 0, y: -8, transition: { duration: reduce ? 0.1 : 0.25, ease: "easeIn" } }}
          >
            {heroSlides[activeIndex].caption}
          </motion.p>
        </AnimatePresence>
      </motion.div>

      {/* c) Actions : dernier élément de la colonne */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={entry(reduce, HERO_ENTRY_DELAY.actions)}
        className="mt-9 flex flex-col gap-4 xs:flex-row xs:flex-wrap"
      >
        <MotionLink
          href="/services"
          whileHover={{ y: -1 }}
          whileTap={{ scale: 0.97 }}
          className="group relative inline-flex h-12 items-center justify-center gap-2 overflow-hidden rounded-full bg-brand-gold px-7 text-sm font-semibold whitespace-nowrap text-brand-navy transition-[background-color,box-shadow] duration-(--duration-base) ease-standard hover:bg-brand-gold-light hover:shadow-gold xs:h-11.25"
        >
          Découvrir nos services
          <ArrowRight
            aria-hidden="true"
            className="size-4 transition-transform duration-(--duration-base) ease-standard group-hover:translate-x-1"
          />
          <ButtonShine />
        </MotionLink>

        <MotionLink
          href={ROUTES.contact}
          whileTap={{ scale: 0.97 }}
          className="group relative inline-flex h-12 items-center justify-center overflow-hidden rounded-full border border-brand-gold px-7 text-sm font-semibold whitespace-nowrap text-text-on-dark transition-colors duration-300 ease-standard hover:text-brand-navy xs:h-11.25"
        >
          {/* Fond doré qui monte depuis le bas au survol */}
          <span
            aria-hidden="true"
            className="absolute inset-0 origin-bottom scale-y-0 bg-brand-gold transition-transform duration-300 ease-standard group-hover:scale-y-100"
          />
          <span className="relative flex items-center gap-2">
            Parlons de votre projet
            <ArrowRight
              aria-hidden="true"
              className="size-4 transition-transform duration-(--duration-base) ease-standard group-hover:translate-x-1"
            />
          </span>
        </MotionLink>
      </motion.div>
    </div>
  );
}
