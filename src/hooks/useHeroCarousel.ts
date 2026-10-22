"use client";

import { useMotionValue, type MotionValue } from "motion/react";
import { useCallback, useEffect, useState, type RefObject } from "react";

/** Raisons de suspendre automatiquement le défilement (en plus de la pause manuelle). */
export type HoldReason = "hover-text" | "hover-visual" | "focus" | "touch" | "hidden" | "offscreen";

type Options = {
  count: number;
  /** Durée d'un état, en millisecondes. */
  duration: number;
  /** Défilement automatique autorisé (désactivé si prefers-reduced-motion). */
  autoplay: boolean;
  /** Section observée pour suspendre le défilement hors écran. */
  rootRef: RefObject<HTMLElement | null>;
};

export type HeroCarousel = {
  activeIndex: number;
  /** Sens de navigation : 1 en avant, -1 en arrière. */
  direction: 1 | -1;
  /** Pause manuelle (bouton). */
  isPaused: boolean;
  /** La progression avance actuellement. */
  isRunning: boolean;
  /** Progression de l'état actif, de 0 à 1. */
  progress: MotionValue<number>;
  goTo: (index: number) => void;
  next: () => void;
  prev: () => void;
  togglePause: () => void;
  setHold: (reason: HoldReason, active: boolean) => void;
};

export function useHeroCarousel({ count, duration, autoplay, rootRef }: Options): HeroCarousel {
  const [{ index, direction }, setSlide] = useState<{ index: number; direction: 1 | -1 }>({
    index: 0,
    direction: 1,
  });
  const [isPaused, setIsPaused] = useState(false);
  const [holds, setHolds] = useState<ReadonlySet<HoldReason>>(() => new Set());
  const progress = useMotionValue(0);

  const goTo = useCallback(
    (target: number) => {
      progress.set(0);
      setSlide((current) => ({
        index: target,
        direction: target >= current.index ? 1 : -1,
      }));
    },
    [progress],
  );

  const next = useCallback(() => {
    progress.set(0);
    setSlide((current) => ({ index: (current.index + 1) % count, direction: 1 }));
  }, [count, progress]);

  const prev = useCallback(() => {
    progress.set(0);
    setSlide((current) => ({ index: (current.index - 1 + count) % count, direction: -1 }));
  }, [count, progress]);

  const togglePause = useCallback(() => setIsPaused((paused) => !paused), []);

  const setHold = useCallback((reason: HoldReason, active: boolean) => {
    setHolds((current) => {
      if (current.has(reason) === active) return current;
      const updated = new Set(current);
      if (active) updated.add(reason);
      else updated.delete(reason);
      return updated;
    });
  }, []);

  const isRunning = autoplay && !isPaused && holds.size === 0;

  // Progression au temps réellement écoulé ; en pause, la boucle s'arrête et la valeur gèle.
  useEffect(() => {
    if (!isRunning) return;
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const value = progress.get() + (now - last) / duration;
      last = now;
      if (value >= 1) next();
      else progress.set(value);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [isRunning, duration, next, progress]);

  // Onglet masqué.
  useEffect(() => {
    const onVisibility = () => setHold("hidden", document.hidden);
    onVisibility();
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, [setHold]);

  // Section hors écran (moins de 30 % visible).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const observer = new IntersectionObserver(
      ([entry]) => setHold("offscreen", !entry.isIntersecting),
      { threshold: 0.3 },
    );
    observer.observe(root);
    return () => observer.disconnect();
  }, [rootRef, setHold]);

  return {
    activeIndex: index,
    direction,
    isPaused,
    isRunning,
    progress,
    goTo,
    next,
    prev,
    togglePause,
    setHold,
  };
}
