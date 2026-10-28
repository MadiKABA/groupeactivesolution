"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

import { WaveMotif } from "@/components/ui/WaveMotif";

/** Durée totale de la séquence d'entrée (ms) : will-change retiré ensuite. */
const SEQUENCE = 1600;

/**
 * Entrée de la section Contact : état masqué posé au montage (data-js, jamais en CSS statique),
 * un seul IntersectionObserver (25 %, une fois, puis déconnecté) qui pose data-in. Rend aussi le
 * zigzag bleu nuit statique sur tout le fond (WaveMotif, 4.5 %).
 */
export function ContactReveal({ children }: { children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    rootRef.current?.setAttribute("data-js", "");
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        root.setAttribute("data-in", "");
        root.setAttribute("data-animating", "");
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          // Fondus d'opacité seuls (150 ms, décalages ramenés à 0–60 ms) : en WAAPI, la règle globale
          // des animations réduites (durée 0.01 ms, !important) neutraliserait des animations CSS.
          root.querySelectorAll<HTMLElement>(".ct-a, .ct-pop, .ct-motif").forEach((element) =>
            element.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: 150,
              delay: Math.min(60, Number(element.dataset.d ?? 0) * 0.1),
              easing: "ease-out",
              fill: "backwards",
            }),
          );
        }
        timer = window.setTimeout(() => root.removeAttribute("data-animating"), SEQUENCE);
      },
      { threshold: 0.25, rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  return (
    <div ref={rootRef} className="ct-root relative pt-16 pb-18 lg:pt-28 lg:pb-30">
      <div aria-hidden="true" className="ct-motif pointer-events-none absolute inset-0 z-0 overflow-clip">
        <WaveMotif tone="navy" mask="full" />
      </div>
      {children}
    </div>
  );
}
