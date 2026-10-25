"use client";

import { useEffect, useRef, type ReactNode } from "react";

const QUERY = "(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)";

/*
 * Parallaxe au pointeur de la mosaïque (souris uniquement) : écrit --sv-px et --sv-py (-1 à 1)
 * sur le conteneur, une fois par image ; chaque vignette en déduit son décalage (globals.css,
 * 6px au plus). Aucun rendu React pendant le mouvement.
 */
export function MosaicParallax({ className, children }: { className: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    const query = window.matchMedia(QUERY);
    if (!element) return;

    let frame = 0;
    let x = 0;
    let y = 0;
    const write = () => {
      frame = 0;
      element.style.setProperty("--sv-px", x.toFixed(3));
      element.style.setProperty("--sv-py", y.toFixed(3));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(write);
    };
    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      x = Math.max(-1, Math.min(1, ((event.clientX - rect.left) / rect.width) * 2 - 1));
      y = Math.max(-1, Math.min(1, ((event.clientY - rect.top) / rect.height) * 2 - 1));
      schedule();
    };
    const onLeave = () => {
      x = 0;
      y = 0;
      schedule();
    };

    const attach = () => {
      element.addEventListener("pointermove", onMove);
      element.addEventListener("pointerleave", onLeave);
    };
    const detach = () => {
      element.removeEventListener("pointermove", onMove);
      element.removeEventListener("pointerleave", onLeave);
      onLeave();
    };
    const onChange = () => (query.matches ? attach() : detach());

    if (query.matches) attach();
    query.addEventListener("change", onChange);
    return () => {
      query.removeEventListener("change", onChange);
      detach();
      cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
