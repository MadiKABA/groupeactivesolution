"use client";

import type { MouseEvent, ReactNode } from "react";

/** Filet de sécurité si `scrollend` n'est pas émis (navigateur sans support) : focus après ce délai (ms). */
const FOCUS_FALLBACK = 1500;

/**
 * Lien « Retour en haut » : ancre #top fonctionnelle sans JavaScript ; avec JavaScript, défilement
 * doux (instantané en animations réduites) puis focus sur #top une fois arrivé, sans saut de page.
 */
export function BackToTop({ className, children }: { className?: string; children: ReactNode }) {
  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    const target = document.getElementById("top");
    if (!target) return;
    event.preventDefault();
    const focusTop = () => target.focus({ preventScroll: true });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches || window.scrollY === 0) {
      window.scrollTo({ top: 0, behavior: "instant" });
      focusTop();
      return;
    }

    let timer = 0;
    const arrived = () => {
      window.clearTimeout(timer);
      window.removeEventListener("scrollend", arrived);
      focusTop();
    };
    window.addEventListener("scrollend", arrived, { once: true });
    timer = window.setTimeout(arrived, FOCUS_FALLBACK);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <a href="#top" onClick={onClick} className={className}>
      {children}
    </a>
  );
}
