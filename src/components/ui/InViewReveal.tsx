"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

const REDUCE = "(prefers-reduced-motion: reduce)";
// Seuils intermédiaires : l'entrée se déclenche aussi quand la zone, plus haute que l'écran
// (mobile, zoom), ne peut jamais atteindre le seuil demandé.
const STEPS = [0, 0.1, 0.2, 0.3, 0.35, 0.5];
const COUNT_MS = 1200;
// Repli : 3 s après le montage, toute valeur encore différente de la valeur finale est réécrite
// (observateur jamais déclenché, onglet masqué, erreur).
const SAFETY_MS = 3000;

const easeOut = (t: number) => 1 - (1 - t) ** 3;

type Counter = { element: HTMLElement; value: number; delay: number; final: string };

/** Compteurs [data-count] : un seul élément visible par nombre, dont la valeur finale est déjà dans le HTML. */
function collectCounters(root: HTMLElement): Counter[] {
  return [...root.querySelectorAll<HTMLElement>("[data-count]")].map((element) => ({
    element,
    value: Number(element.dataset.count),
    delay: Number(element.dataset.delay ?? 0),
    final: element.dataset.count ?? "",
  }));
}

/** Écrit la valeur finale partout et libère la largeur figée. */
function settle(counters: readonly Counter[]) {
  for (const { element, final } of counters) {
    if (element.textContent !== final) element.textContent = final;
    element.style.minWidth = "";
  }
}

/**
 * Anime les compteurs de 0 à leur valeur en 1.2 s après data-delay ms, en écrivant textContent
 * (aucun état React). Largeur de la valeur finale mesurée une seule fois avant de commencer, puis
 * figée (min-width) ; aucune lecture de mise en page dans la boucle. Une seule boucle
 * requestAnimationFrame, arrêtée quand tout est fini. Retourne l'arrêt (valeur finale écrite).
 */
function runCounters(counters: readonly Counter[]) {
  const widths = counters.map(({ element }) => element.getBoundingClientRect().width);
  counters.forEach(({ element }, index) => {
    element.style.minWidth = `${widths[index]}px`;
    element.textContent = "0";
  });
  const start = performance.now();
  let frame = 0;
  const tick = (now: number) => {
    let running = false;
    for (const { element, value, delay } of counters) {
      const t = Math.min(1, Math.max(0, (now - start - delay) / COUNT_MS));
      const text = String(Math.round(value * easeOut(t)));
      if (element.textContent !== text) element.textContent = text;
      if (t < 1) running = true;
    }
    if (running) frame = requestAnimationFrame(tick);
    else settle(counters);
  };
  frame = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(frame);
    settle(counters);
  };
}

/**
 * Entrée unique d'une zone : état masqué posé au montage (data-js, jamais avec les animations
 * réduites ni sans JavaScript), data-in au premier passage du seuil, data-animating pendant
 * `sequenceMs` (will-change). Options : compteurs (amélioration progressive : sans JS, avec les
 * animations réduites, à l'arrêt ou en cas d'erreur, la valeur finale du HTML reste affichée),
 * et data-visible tenu à jour tant que la zone est à l'écran (boucles CSS suspendues hors écran).
 * Un seul IntersectionObserver, déconnecté après l'entrée sauf avec `track`.
 */
export function InViewReveal({
  className,
  threshold = 0.35,
  sequenceMs = 2000,
  counters = false,
  track = false,
  children,
}: {
  className?: string;
  threshold?: number;
  sequenceMs?: number;
  counters?: boolean;
  track?: boolean;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!window.matchMedia(REDUCE).matches) ref.current?.setAttribute("data-js", "");
  }, []);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    let entered = false;
    let timer = 0;
    let stopCounters: (() => void) | undefined;
    const numbers = counters ? collectCounters(root) : [];
    const finish = () => {
      stopCounters?.();
      stopCounters = undefined;
      settle(numbers);
    };
    // Repli de sécurité, et fin immédiate si l'onglet est masqué (requestAnimationFrame y est suspendu).
    const safety = window.setTimeout(() => {
      if (!stopCounters) settle(numbers);
    }, SAFETY_MS);
    let guard = 0;
    const onHidden = () => {
      if (document.hidden) finish();
    };
    document.addEventListener("visibilitychange", onHidden);
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        if (track) root.toggleAttribute("data-visible", entry.isIntersecting);
        const enough =
          entry.intersectionRatio >= threshold || entry.intersectionRect.height >= window.innerHeight * 0.5;
        if (entered || !entry.isIntersecting || !enough) return;
        entered = true;
        if (!track) observer.disconnect();
        root.setAttribute("data-in", "");
        if (!root.hasAttribute("data-js")) return;
        root.setAttribute("data-animating", "");
        timer = window.setTimeout(() => root.removeAttribute("data-animating"), sequenceMs);
        if (numbers.length > 0 && !document.hidden) {
          try {
            stopCounters = runCounters(numbers);
            // Fin garantie : plus long délai + durée du compteur + marge.
            const longest = Math.max(...numbers.map(({ delay }) => delay)) + COUNT_MS + 300;
            guard = window.setTimeout(finish, longest);
          } catch {
            finish();
          }
        }
      },
      { threshold: STEPS.includes(threshold) ? STEPS : [...STEPS, threshold] },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      window.clearTimeout(safety);
      window.clearTimeout(guard);
      document.removeEventListener("visibilitychange", onHidden);
      // Démontage (et double montage du mode strict) : valeur finale, boucle arrêtée.
      finish();
    };
  }, [threshold, sequenceMs, counters, track]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
