"use client";

import { useEffect, useLayoutEffect, useRef, useState, type MouseEvent, type ReactNode } from "react";

import { WaveMotif } from "@/components/ui/WaveMotif";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { formationDomains, formationPanelId } from "@/lib/formations";
import { FREE_CIRCUIT, tabsCircuit } from "@/lib/formations-circuit";

import { FormationsAccordion } from "./FormationsAccordion";
import { FormationsCircuit } from "./FormationsCircuit";
import { FormationsTabs } from "./FormationsTabs";

/** Accordéon desktop (même seuil que la variante `fo-desk` de globals.css). */
const DESKTOP_QUERY = "(min-width: 68.75rem)";
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
  panels: ReactNode;
  publics: ReactNode;
  cta: ReactNode;
};

const delayOf = (element: Element) => Number(element.getAttribute("data-d") ?? 0);

/** Mesure du menu desktop pour le circuit : largeur de la colonne, haut et hauteur du menu (depuis le haut du circuit). */
type TabsMeasure = { width: number; top: number; height: number };
const sameMeasure = (a: TabsMeasure | null, b: TabsMeasure) =>
  a !== null && a.width === b.width && a.top === b.top && a.height === b.height;

/**
 * Seul composant client de la section : onglet actif (`data-active`), un IntersectionObserver
 * pour trois cibles (en-tête + composition, publics, bouton) et la section (pause des boucles),
 * parallaxe au pointeur. Les états d'entrée sont des attributs posés directement sur la racine
 * (`data-js`, `data-in-a|b|c`, `data-lit`, `data-inview`) : aucun re-rendu pendant les animations.
 */
export function FormationsInteractive({ header, panels, publics, cta }: FormationsInteractiveProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const accRef = useRef<HTMLDivElement>(null);
  const circuitRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [tabs, setTabs] = useState<TabsMeasure | null>(null);
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const reduce = usePrefersReducedMotion();

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

  // Desktop : colonne de nœuds 01 → 03 à la hauteur du menu, mesurée à chaque changement de taille du menu
  // ou de la colonne (y compris pendant l'ouverture d'un volet, image par image si le menu varie).
  useEffect(() => {
    const acc = accRef.current;
    const wrap = circuitRef.current;
    if (!desktop || !acc || !wrap) return;
    const observer = new ResizeObserver(() => {
      const origin = wrap.getBoundingClientRect().top;
      const box = acc.getBoundingClientRect();
      const next = { width: wrap.clientWidth, top: Math.round(box.top - origin), height: Math.round(box.height) };
      setTabs((previous) => (sameMeasure(previous, next) ? previous : next));
    });
    observer.observe(wrap);
    observer.observe(acc);
    return () => observer.disconnect();
  }, [desktop]);

  const geometry = desktop && tabs ? tabsCircuit(tabs.width, tabs.top, tabs.height) : FREE_CIRCUIT;

  // Clic sur un nœud du circuit (pointeur) : sélectionne l'onglet correspondant.
  const onCircuitClick = (event: MouseEvent<HTMLDivElement>) => {
    const node = (event.target as Element).closest("[data-node]");
    if (node) select(Number(node.getAttribute("data-node")));
  };

  return (
    <div ref={rootRef} data-active={active + 1} className="formations-root relative pt-24 pb-32 lg:pt-28 fo-desk:pt-18 fo-desk:pb-24">
      {/* Liseré doré du haut */}
      <div aria-hidden="true" className="formations-topline absolute inset-x-0 top-0 h-px" />

      {/* Zigzag doré (fond sombre, statique) sur tout le fond */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-clip">
        <WaveMotif tone="dark" mask="full" />
      </div>

      {/* Contenu ; marges identiques au header et aux autres sections */}
      <div className="relative z-10 mx-auto max-w-site px-6 md:px-10 xl:px-28">
        <div data-fo-target="a">
          {header}

          {/* ≥ 1100px : accordéon | circuit. Dessous : circuit, pastilles, panneau (affichage en CSS, sans saut à l'hydratation). */}
          {/* Dès 1100px, le circuit a la hauteur du menu (nœuds 01 → 03 répartis du haut au bas des onglets) */}
          <div className="mt-10 lg:mt-14 fo-desk:mt-8 fo-desk:flex fo-desk:items-start fo-desk:gap-10">
            <div ref={accRef} className="hidden w-99 shrink-0 fo-desk:block">
              <FormationsAccordion active={active} onSelect={select} />
            </div>

            <div className="formations-circuit-col relative mx-auto max-w-195 fo-desk:max-w-none fo-desk:min-w-0 fo-desk:flex-1" onClick={onCircuitClick}>
              {/* Halo centré sur la puce (centre de la colonne sous 1100px) */}
              <div
                aria-hidden="true"
                className="formations-glow pointer-events-none absolute"
                style={geometry.layout === "tabs" ? { left: geometry.chip.x + geometry.chip.width / 2, top: geometry.chip.y + geometry.chip.height / 2 } : undefined}
              />
              <div ref={circuitRef} className="formations-circuit-wrap relative">
                <FormationsCircuit geometry={geometry} />
              </div>
            </div>

            <div className="mt-6 fo-desk:hidden">
              <FormationsTabs active={active} onSelect={select} listRef={listRef} />
              {panels}
            </div>
          </div>
        </div>

        {publics}
        {cta}
      </div>
    </div>
  );
}
