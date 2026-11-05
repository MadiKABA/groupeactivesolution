"use client";

import { useEffect, useLayoutEffect, useRef, type ReactNode } from "react";

import { WaveMotif } from "@/components/ui/WaveMotif";

const DESKTOP_QUERY = "(min-width: 64rem)";
const FINE_QUERY = "(hover: hover) and (pointer: fine)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
/** Part visible de chaque cible qui déclenche sa séquence (ou la moitié de l'écran si elle est plus haute). */
const AMOUNTS = { a: 0.3, b: 0.4 } as const;
type Target = keyof typeof AMOUNTS;

/** Séquences (ms) : entrée de l'aside, fondus en animations réduites. */
const TIMING = { asideAt: 900, reducedFade: 200, reducedStagger: 60 } as const;

/** Profondeur au pointeur (px) ; lissage par image. */
const DEPTH = { net: 10, rings: 3, mark: 6 } as const;
const SPOT_RADIUS = 130;
const LERP = { depth: 0.08, spot: 0.1 } as const;

const delayOf = (element: Element) => Number(element.getAttribute("data-d") ?? 0);
const matches = (query: string) => window.matchMedia(query).matches;
const reduced = () => matches(REDUCED_QUERY);

type FaqInteractiveProps = {
  header: ReactNode;
  /** Bloc contact (rendu serveur) : à droite des questions en desktop, après elles sinon. */
  aside: ReactNode;
  /** Les 3 questions (rendu serveur). */
  children: ReactNode;
};

/**
 * Seul composant client de la section : un IntersectionObserver (en-tête + colonnes, aside, scène du « ? »,
 * section) et une boucle rAF (profondeur du « ? », projecteur de l'aside ; desktop à pointeur fin).
 * États posés en attributs : data-js, data-in-a|s (entrées), data-inview, data-spot.
 */
export function FaqInteractive({ header, aside, children }: FaqInteractiveProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    rootRef.current?.setAttribute("data-js", "");
  }, []);

  // Un observateur pour tout : entrées (une fois chacune), visibilité de la scène du « ? » et de la section,
  // boucle rAF et écouteurs (défilement pendant la visibilité, pointeur sur l'aside).
  useEffect(() => {
    const root = rootRef.current;
    const asideEl = root?.querySelector<HTMLElement>(".faq-aside");
    const scene = root?.querySelector<HTMLElement>(".faq-scene");
    if (!root || !asideEl || !scene) return;
    const spot = asideEl.querySelector<HTMLElement>(".faq-spot");
    const layers = (["net", "rings", "mark"] as const).map((name) => ({
      element: scene.querySelector<SVGGElement>(name === "mark" ? ".fqm-depth" : `.fqm-${name}`),
      depth: DEPTH[name],
    }));
    const moving = [spot, ...layers.map((layer) => layer.element)];

    const startSide = (offset: number) => {
      if (root.hasAttribute("data-in-s")) return;
      root.style.setProperty("--fq-side-at", `${offset}ms`);
      root.setAttribute("data-in-s", "");
    };
    const start = (target: Target) => {
      const desktop = matches(DESKTOP_QUERY);
      if (target === "a") {
        root.setAttribute("data-in-a", "");
        if (desktop) startSide(TIMING.asideAt);
      } else {
        startSide(0);
      }
      const sideAt = target === "a" ? TIMING.asideAt : 0;
      if (reduced()) {
        // Fondus seuls, bloc par bloc dans l'ordre de la séquence (data-d), dans la même image que l'attribut.
        const selector = target === "a" ? (desktop ? ".fq-a, .fq-s" : ".fq-a") : ".fq-s";
        const items = [...root.querySelectorAll(selector)].filter((item) => !item.closest("[hidden]"));
        const delay = (item: Element) => delayOf(item) + (item.classList.contains("fq-s") ? sideAt : 0);
        const blocks = [...new Set(items.map(delay))].sort((a, b) => a - b);
        items.forEach((item) =>
          item.animate([{ opacity: 0 }, { opacity: 1 }], {
            duration: TIMING.reducedFade,
            delay: blocks.indexOf(delay(item)) * TIMING.reducedStagger,
            easing: "ease-out",
            fill: "backwards",
          }),
        );
      }
    };

    // ---- Boucle rAF partagée (desktop, pointeur fin, mouvements autorisés, section visible) ----
    const live = () => matches(DESKTOP_QUERY) && matches(FINE_QUERY) && !reduced();
    let visible = false;
    let sceneIn = false;
    let raf = 0;
    const state = { mx: 0, my: 0, mxTo: 0, myTo: 0, sx: 0, sy: 0, sxTo: 0, syTo: 0 };

    const write = () => {
      for (const { element, depth } of layers) {
        element?.style.setProperty("transform", `translate(${(state.mx * depth).toFixed(2)}px, ${(state.my * depth).toFixed(2)}px)`);
      }
      if (spot) spot.style.transform = `translate3d(${(state.sx - SPOT_RADIUS).toFixed(1)}px, ${(state.sy - SPOT_RADIUS).toFixed(1)}px, 0)`;
    };
    const frame = () => {
      raf = 0;
      const step = (from: number, to: number, amount: number) => (Math.abs(to - from) < 0.01 ? to : from + (to - from) * amount);
      state.mx = step(state.mx, state.mxTo, LERP.depth);
      state.my = step(state.my, state.myTo, LERP.depth);
      state.sx = step(state.sx, state.sxTo, LERP.spot);
      state.sy = step(state.sy, state.syTo, LERP.spot);
      write();
      const settled =
        state.mx === state.mxTo && state.my === state.myTo && state.sx === state.sxTo && state.sy === state.syTo;
      if (!settled) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && visible && live()) raf = requestAnimationFrame(frame);
    };
    const onPointerMove = (event: PointerEvent) => {
      if (!live() || event.pointerType !== "mouse") return;
      const rect = asideEl.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      if (!asideEl.hasAttribute("data-spot")) {
        // Le projecteur apparaît sous le pointeur, sans glisser depuis sa position précédente.
        state.sx = x;
        state.sy = y;
        asideEl.setAttribute("data-spot", "");
      }
      state.sxTo = x;
      state.syTo = y;
      state.mxTo = Math.max(-1, Math.min(1, (x / rect.width) * 2 - 1));
      state.myTo = Math.max(-1, Math.min(1, (y / rect.height) * 2 - 1));
      kick();
    };
    const onPointerLeave = () => {
      asideEl.removeAttribute("data-spot");
      state.mxTo = 0;
      state.myTo = 0;
      kick();
    };

    // Active ou coupe la boucle selon la visibilité et le contexte (largeur, pointeur, préférences).
    const sync = () => {
      const on = visible && live();
      if (on) {
        write();
      } else if (!live()) {
        // Hors desktop à pointeur fin : aucun décalage résiduel.
        cancelAnimationFrame(raf);
        raf = 0;
        Object.assign(state, { mx: 0, my: 0, mxTo: 0, myTo: 0 });
        moving.forEach((element) => element?.style.removeProperty("transform"));
        asideEl.removeAttribute("data-spot");
      }
      // will-change seulement sur les calques qui bougent, pendant la visibilité (5 au plus).
      moving.forEach((element) => element?.style.setProperty("will-change", on ? "transform" : ""));
    };
    const syncScene = () => scene.setAttribute("data-inview", String(sceneIn && document.visibilityState === "visible"));

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          if (element === root) {
            visible = entry.isIntersecting;
            sync();
          }
          if (element === scene) {
            sceneIn = entry.isIntersecting;
            syncScene();
          }
          const target = element.dataset.fqTarget as Target | undefined;
          if (!target || !entry.isIntersecting) continue;
          // L'aside n'a sa propre entrée qu'en mobile (en desktop, elle suit l'en-tête).
          if (target === "b" && matches(DESKTOP_QUERY)) continue;
          const screen = entry.rootBounds?.height ?? window.innerHeight;
          if (entry.intersectionRatio < AMOUNTS[target] && entry.intersectionRect.height < screen * 0.5) continue;
          if (target === "a" ? root.hasAttribute("data-in-a") : root.hasAttribute("data-in-s")) continue;
          start(target);
        }
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5] },
    );
    [root, scene, ...root.querySelectorAll("[data-fq-target]")].forEach((element) => observer.observe(element));

    const queries = [DESKTOP_QUERY, FINE_QUERY, REDUCED_QUERY].map((query) => window.matchMedia(query));
    queries.forEach((query) => query.addEventListener("change", sync));
    document.addEventListener("visibilitychange", syncScene);
    asideEl.addEventListener("pointermove", onPointerMove, { passive: true });
    asideEl.addEventListener("pointerleave", onPointerLeave, { passive: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      queries.forEach((query) => query.removeEventListener("change", sync));
      document.removeEventListener("visibilitychange", syncScene);
      asideEl.removeEventListener("pointermove", onPointerMove);
      asideEl.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  return (
    <div ref={rootRef} className="faq-root relative pt-24 pb-32 lg:pt-28">
      {/* Liseré doré du haut et halo derrière le titre */}
      <div aria-hidden="true" className="faq-topline absolute inset-x-0 top-0 h-px" />
      <div aria-hidden="true" className="faq-glow pointer-events-none absolute" />

      {/* Zigzag doré (fond clair, statique) sur tout le fond */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-clip">
        <WaveMotif tone="light" mask="full" />
      </div>

      {/* Contenu ; marges identiques au header et aux autres sections */}
      <div className="relative z-10 mx-auto max-w-site px-6 md:px-10 xl:px-28">
        <div data-fq-target="a">
          {header}

          <div className="mt-8 lg:mt-10 lg:flex lg:items-start lg:gap-18">
            <div className="min-w-0 lg:flex-1">{children}</div>
            {aside}
          </div>
        </div>
      </div>
    </div>
  );
}
