"use client";

import { ArrowRight } from "lucide-react";
import { animate, motion, useMotionValue, useSpring } from "motion/react";
import Link from "next/link";
import type { PointerEvent } from "react";

import { SectionMotifLayers } from "@/components/sections/expertises/SectionMotif";
import { EASE } from "@/lib/motion";
import { methodeCta } from "@/lib/methode";

const MotionLink = motion.create(Link);

/** Amplitude du bouton magnétique (px) et diamètre de la lueur de bordure (px). */
const MAGNET = 6;
const GLOW = 240;
const MAGNET_SPRING = { stiffness: 260, damping: 18, mass: 0.5 } as const;

const clamp = (value: number) => Math.max(-MAGNET, Math.min(MAGNET, value));

type MethodeCtaProps = {
  revealed: boolean;
  reduce: boolean;
  /** Lueur de bordure et magnétisme : souris, desktop, sans animations réduites. */
  immersive: boolean;
};

/**
 * Bandeau d'appel à l'action (fond bleu nuit, 984px max) : motif du hero en variante sombre,
 * lueur dorée en haut à droite, reflet unique à l'entrée. Avec la souris : lueur qui suit le
 * curseur le long de la bordure (déplacée par transform dans un anneau masqué) et bouton
 * magnétique (±6px).
 */
export function MethodeCta({ revealed, reduce, immersive }: MethodeCtaProps) {
  const still = useMotionValue(0);
  const glowX = useMotionValue(0);
  const glowY = useMotionValue(0);
  const glowOpacity = useMotionValue(0);
  const magnetX = useSpring(0, MAGNET_SPRING);
  const magnetY = useSpring(0, MAGNET_SPRING);

  const isMouse = (event: PointerEvent) => immersive && event.pointerType === "mouse";

  const onBannerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!isMouse(event)) return;
    const box = event.currentTarget.getBoundingClientRect();
    glowX.set(event.clientX - box.left - GLOW / 2);
    glowY.set(event.clientY - box.top - GLOW / 2);
  };
  const onBannerEnter = (event: PointerEvent<HTMLDivElement>) => {
    if (isMouse(event)) animate(glowOpacity, 1, { duration: 0.3 });
  };
  const onBannerLeave = () => {
    animate(glowOpacity, 0, { duration: 0.4 });
  };

  const onButtonMove = (event: PointerEvent<HTMLAnchorElement>) => {
    if (!isMouse(event)) return;
    const box = event.currentTarget.getBoundingClientRect();
    magnetX.set(clamp((event.clientX - (box.left + box.width / 2)) * 0.2));
    magnetY.set(clamp((event.clientY - (box.top + box.height / 2)) * 0.3));
  };
  const resetMagnet = () => {
    magnetX.set(0);
    magnetY.set(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: reduce ? 0 : 24 }}
      animate={revealed ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: reduce ? 0.4 : 0.7, ease: EASE.reveal }}
      onPointerMove={onBannerMove}
      onPointerEnter={onBannerEnter}
      onPointerLeave={onBannerLeave}
      className="relative mx-auto mt-10 flex w-full max-w-246 flex-col gap-6 overflow-hidden rounded-hero border border-brand-gold/40 bg-brand-navy px-6 py-7 text-text-on-dark shadow-cta [--focus-ring:var(--color-brand-gold)] lg:min-h-32 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-10 lg:py-5"
    >
      {/* Motif du hero, variante sombre, faible et estompé vers la droite */}
      <div aria-hidden="true" className="methode-cta-motif pointer-events-none absolute inset-0">
        <SectionMotifLayers tone="dark" leftY={still} rightY={still} reduce={reduce} willChange={false} />
      </div>
      {/* Lueur dorée en haut à droite */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -right-24 size-80 bg-radial from-brand-gold/28 to-transparent to-70%"
      />

      {/* Lueur de 240px qui suit le curseur, visible seulement dans l'anneau de 1px de la bordure */}
      {immersive && (
        <span aria-hidden="true" className="methode-cta-ring pointer-events-none absolute inset-0 rounded-[inherit]">
          <motion.span
            className="absolute top-0 left-0 size-60 rounded-full bg-radial from-brand-gold-light to-transparent to-70%"
            style={{ x: glowX, y: glowY, opacity: glowOpacity }}
          />
        </span>
      )}

      {/* Reflet lumineux unique à l'entrée (transform uniquement) */}
      {!reduce && (
        <motion.span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 w-1/4 -skew-x-20 bg-linear-to-r from-transparent via-text-on-dark/10 to-transparent"
          initial={{ x: "-120%" }}
          animate={revealed ? { x: "450%" } : undefined}
          transition={{ duration: 1.2, delay: 0.6, ease: "easeInOut" }}
        />
      )}

      <div className="relative">
        <p className="text-step font-bold tracking-display lg:text-banner">{methodeCta.title}</p>
        <p className="mt-1.5 text-nav leading-relaxed text-text-on-dark/74">{methodeCta.text}</p>
      </div>

      <MotionLink
        href={methodeCta.href}
        onPointerMove={onButtonMove}
        onPointerLeave={resetMagnet}
        style={immersive ? { x: magnetX, y: magnetY } : undefined}
        whileTap={reduce ? undefined : { scale: 0.97 }}
        className="group relative inline-flex h-12 w-full shrink-0 items-center justify-center gap-2.5 rounded-full bg-brand-gold px-8 text-base font-bold whitespace-nowrap text-brand-navy transition-[background-color,box-shadow] duration-(--duration-base) ease-standard hover:bg-brand-gold-light hover:shadow-gold focus-visible:bg-brand-gold-light focus-visible:shadow-gold lg:h-13 lg:w-auto"
      >
        {methodeCta.label}
        <ArrowRight
          aria-hidden="true"
          className="size-4 transition-transform duration-(--duration-base) ease-standard motion-safe:group-hover:translate-x-1 motion-safe:group-focus-visible:translate-x-1"
        />
      </MotionLink>
    </motion.div>
  );
}
