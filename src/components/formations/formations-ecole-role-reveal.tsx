"use client";

import { useEffect } from "react";

/*
 * Entrée de la section « Notre rôle », une seule fois : ne pose que `data-reveal` sur la section
 * (armed → in → done). Sans JavaScript, sans IntersectionObserver ou en mouvement réduit : rien
 * n'est posé, le contenu reste visible. `done` retire les animations et le will-change.
 */
const DONE_AFTER_MS = 2600;

export function RoleReveal({ targetId }: { targetId: string }) {
  useEffect(() => {
    const section = document.getElementById(targetId);
    if (!section || !("IntersectionObserver" in window)) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let timer = 0;
    section.dataset.reveal = "armed";
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        section.dataset.reveal = "in";
        timer = window.setTimeout(() => {
          section.dataset.reveal = "done";
        }, DONE_AFTER_MS);
      },
      { rootMargin: "0px 0px -15% 0px" },
    );
    observer.observe(section);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
      if (section.dataset.reveal === "armed") delete section.dataset.reveal;
      else section.dataset.reveal = "done";
    };
  }, [targetId]);

  return null;
}
