"use client";

import { useEffect, useLayoutEffect, useRef } from "react";

/** Part visible du footer au-delà de laquelle il est « à l'écran ». */
const THRESHOLD = 0.15;

/**
 * États de l'entrée du footer, posés sur le <footer> parent : data-js au montage (état masqué,
 * jamais en CSS statique) et data-in à la première apparition (révélation du contenu, une fois).
 * Un seul IntersectionObserver, déconnecté après l'entrée. Sans JavaScript, tout est visible.
 */
export function FooterLive() {
  const ref = useRef<HTMLSpanElement>(null);

  useLayoutEffect(() => {
    ref.current?.closest("footer")?.setAttribute("data-js", "");
  }, []);

  useEffect(() => {
    const footer = ref.current?.closest("footer");
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting || entry.intersectionRatio < THRESHOLD) return;
        observer.disconnect();
        footer.setAttribute("data-in", "");
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
          // Fondus de 150 ms en WAAPI : la règle globale des animations réduites (0.01 ms, !important)
          // neutraliserait des animations CSS.
          footer.querySelectorAll<HTMLElement>(".ft-a").forEach((element) =>
            element.animate([{ opacity: 0 }, { opacity: 1 }], {
              duration: 150,
              delay: Math.min(60, Number(element.dataset.d ?? 0) * 0.1),
              easing: "ease-out",
              fill: "backwards",
            }),
          );
        }
      },
      { threshold: THRESHOLD },
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, []);

  return <span ref={ref} hidden />;
}
