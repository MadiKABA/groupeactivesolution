"use client";

import { useMotionValue } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

import { SectionMotifLayers } from "@/components/sections/expertises/SectionMotif";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { formationDomains, formationPanelId } from "@/lib/formations";

import { FormationsTabs } from "./FormationsTabs";

const DESKTOP_QUERY = "(min-width: 64rem)";
const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";
/** Part visible de chaque cible qui déclenche sa séquence (ou la moitié de l'écran si elle est plus haute). */
const AMOUNTS = { a: 0.35, b: 0.3, c: 0.6 } as const;
type Target = keyof typeof AMOUNTS;
/** Allumage de la piste active dans la séquence d'entrée (ms après T0). */
const LIT_AT = 1700;
/** Animations réduites : fondu par bloc et décalage entre blocs (ms). */
const REDUCED_FADE = 200;
const REDUCED_STAGGER = 60;
const REDUCED_PANEL_FADE = 120;
/** Parallaxe : lissage et seuil d'arrêt de la boucle. */
const LERP = 0.08;
const SETTLE = 0.001;

type FormationsInteractiveProps = {
  header: ReactNode;
  circuit: ReactNode;
  panels: ReactNode;
  publics: ReactNode;
  cta: ReactNode;
};

const delayOf = (element: Element) => Number(element.getAttribute("data-d") ?? 0);

/**
 * Seul composant client de la section : onglet actif (`data-active`), un IntersectionObserver
 * pour trois cibles (en-tête + composition, publics, bouton) et la section (pause des boucles),
 * parallaxe au pointeur. Les états d'entrée sont des attributs posés directement sur la racine
 * (`data-js`, `data-in-a|b|c`, `data-lit`, `data-inview`) : aucun re-rendu pendant les animations.
 */
export function FormationsInteractive({ header, circuit, panels, publics, cta }: FormationsInteractiveProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const reduce = usePrefersReducedMotion();
  const still = useMotionValue(0);

  // JS actif : l'état masqué initial n'existe qu'à partir d'ici (sans JS ou avant hydratation, tout est visible).
  useLayoutEffect(() => {
    rootRef.current?.setAttribute("data-js", "");
  }, []);

  // Un observateur, quatre cibles : chaque séquence ne se déclenche qu'une fois, sa cible visible.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const section = root.parentElement ?? root;
    const reduced = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    let sectionVisible = false;
    const updateInView = () => root.toggleAttribute("data-inview", sectionVisible && document.visibilityState === "visible");

    const start = (target: Target) => {
      root.setAttribute(`data-in-${target}`, "");
      let litAt = LIT_AT;
      if (reduced()) {
        // Fondus seuls, bloc par bloc dans l'ordre de la séquence (data-d), lancés dans la même image que l'attribut.
        const items = [...root.querySelectorAll(`.fo-${target}`)];
        const blocks = [...new Set(items.map(delayOf))].sort((a, b) => a - b);
        items.forEach((item) =>
          item.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: REDUCED_FADE,
            delay: blocks.indexOf(delayOf(item)) * REDUCED_STAGGER,
            easing: "ease-out",
            fill: "backwards",
          }),
        );
        litAt = blocks.length * REDUCED_STAGGER + REDUCED_FADE;
      }
      if (target === "a") timers.push(window.setTimeout(() => root.setAttribute("data-lit", ""), litAt));
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === section) {
            sectionVisible = entry.isIntersecting;
            updateInView();
            continue;
          }
          const target = (entry.target as HTMLElement).dataset.foTarget as Target;
          const screen = entry.rootBounds?.height ?? window.innerHeight;
          if (entry.intersectionRatio < AMOUNTS[target] && entry.intersectionRect.height < screen * 0.5) continue;
          observer.unobserve(entry.target);
          start(target);
        }
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.35, 0.5, 0.6] },
    );
    observer.observe(section);
    root.querySelectorAll("[data-fo-target]").forEach((element) => observer.observe(element));
    document.addEventListener("visibilitychange", updateInView);
    return () => {
      observer.disconnect();
      timers.forEach((timer) => window.clearTimeout(timer));
      document.removeEventListener("visibilitychange", updateInView);
    };
  }, []);

  // Parallaxe (pointeur fin, sans animations réduites) : un écouteur, une boucle rAF qui s'arrête seule.
  useEffect(() => {
    const root = rootRef.current;
    const section = root?.parentElement;
    if (!root || !section || reduce || !window.matchMedia(FINE_POINTER_QUERY).matches) return;
    const goal = { x: 0, y: 0 };
    const current = { x: 0, y: 0 };
    let frame = 0;
    const tick = () => {
      current.x += (goal.x - current.x) * LERP;
      current.y += (goal.y - current.y) * LERP;
      root.style.setProperty("--px", current.x.toFixed(4));
      root.style.setProperty("--py", current.y.toFixed(4));
      const settled = Math.abs(goal.x - current.x) < SETTLE && Math.abs(goal.y - current.y) < SETTLE;
      frame = settled || !root.hasAttribute("data-inview") ? 0 : requestAnimationFrame(tick);
    };
    const run = () => {
      if (!frame) frame = requestAnimationFrame(tick);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const box = section.getBoundingClientRect();
      goal.x = ((event.clientX - box.left) / box.width) * 2 - 1;
      goal.y = ((event.clientY - box.top) / box.height) * 2 - 1;
      run();
    };
    const onLeave = () => {
      goal.x = 0;
      goal.y = 0;
      run();
    };
    section.addEventListener("pointermove", onMove, { passive: true });
    section.addEventListener("pointerleave", onLeave);
    return () => {
      cancelAnimationFrame(frame);
      section.removeEventListener("pointermove", onMove);
      section.removeEventListener("pointerleave", onLeave);
    };
  }, [reduce]);

  const select = (index: number) => {
    if (index === active) return;
    setActive(index);
    // Animations réduites : fondu simple du panneau (les animations CSS sont neutralisées).
    if (reduce) {
      document
        .getElementById(formationPanelId(formationDomains[index]))
        ?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: REDUCED_PANEL_FADE, easing: "ease-out" });
    }
  };

  // Panneaux inactifs inertes dès le changement (hors focus et lecteurs d'écran), pendant leur fondu de sortie.
  useLayoutEffect(() => {
    formationDomains.forEach((domain, index) => {
      const panel = document.getElementById(formationPanelId(domain));
      if (panel) panel.inert = index !== active;
    });
  }, [active]);

  // Pastilles : la pastille active est amenée dans la vue en ne faisant défiler que leur conteneur.
  useEffect(() => {
    const list = listRef.current;
    if (!list || desktop) return;
    const tab = list.querySelectorAll<HTMLElement>('[role="tab"]')[active];
    if (!tab) return;
    const pad = 24;
    const left = tab.offsetLeft - list.offsetLeft;
    const right = left + tab.offsetWidth;
    if (left >= list.scrollLeft + pad && right <= list.scrollLeft + list.clientWidth - pad) return;
    list.scrollTo({ left: Math.max(0, left - pad), behavior: reduce ? "auto" : "smooth" });
  }, [active, desktop, reduce]);

  // Clic sur un nœud du circuit (pointeur) : sélectionne l'onglet correspondant.
  const onCircuitClick = (event: MouseEvent<HTMLDivElement>) => {
    const node = (event.target as Element).closest("[data-node]");
    if (node) select(Number(node.getAttribute("data-node")));
  };

  return (
    <div ref={rootRef} data-active={active + 1} className="formations-root relative pt-24 pb-32 lg:pt-28">
      {/* Liseré doré du haut */}
      <div aria-hidden="true" className="formations-topline absolute inset-x-0 top-0 h-px" />

      {/* Motif du hero, variante nuit, sur toute la section ; intensité --motif-strength-formations */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-clip">
        <SectionMotifLayers tone="night" leftY={still} rightY={still} reduce={reduce} willChange={false} />
      </div>

      {/* Contenu ; marges identiques au header et aux autres sections */}
      <div className="relative z-10 mx-auto max-w-site px-6 md:px-10 xl:px-28">
        <div data-fo-target="a">
          {header}

          <div className="mt-10 lg:mt-14 lg:grid lg:grid-cols-[clamp(300px,32%,396px)_1fr] lg:items-center lg:gap-10">
            <FormationsTabs active={active} vertical={desktop} onSelect={select} listRef={listRef} />

            <div className="formations-circuit-col relative mt-6 lg:mt-0" onClick={onCircuitClick}>
              <div aria-hidden="true" className="formations-glow pointer-events-none absolute" />
              <div className="formations-circuit-wrap relative">{circuit}</div>
            </div>
          </div>

          {panels}
        </div>

        {publics}
        {cta}
      </div>
    </div>
  );
}
