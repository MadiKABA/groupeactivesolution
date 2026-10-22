"use client";

import { motion, useScroll, useTransform } from "motion/react";

import { HERO_ENTRY_DELAY } from "@/lib/hero-slides";

// Distance de défilement au bout de laquelle l'indicateur a disparu (px).
const FADE_DISTANCE = 80;

/**
 * Indicateur « Défiler » centré en bas du hero, lien vers la section suivante.
 * Masqué sous 1024px et sous 700px de hauteur de fenêtre (pour ne jamais toucher les CTA).
 */
export function HeroScrollHint({ targetId }: { targetId: string }) {
  const { scrollY } = useScroll();
  const opacity = useTransform(scrollY, [0, FADE_DISTANCE], [1, 0]);
  // Une fois effacé, il sort aussi de l'ordre de tabulation.
  const visibility = useTransform(scrollY, (value) => (value >= FADE_DISTANCE ? "hidden" : "visible"));

  return (
    <motion.a
      href={`#${targetId}`}
      aria-label="Aller à la section suivante"
      style={{ opacity, visibility }}
      className="absolute bottom-6 left-1/2 z-10 hidden -translate-x-1/2 rounded-sm lg:[@media(min-height:700px)]:block"
    >
      <motion.span
        className="flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: HERO_ENTRY_DELAY.scrollHint, ease: "easeOut" }}
      >
        <span className="text-2xs font-semibold tracking-label text-text-on-dark/60 uppercase">
          Défiler
        </span>
        <span aria-hidden="true" className="relative flex h-10 w-1.5 justify-center">
          <span className="h-full w-px bg-brand-gold/35" />
          <span className="absolute top-0 size-1.5 rounded-full bg-brand-gold shadow-glow motion-safe:animate-scroll-dot" />
        </span>
      </motion.span>
    </motion.a>
  );
}
