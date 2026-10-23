"use client";

import { useMotionValue } from "motion/react";
import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";

import { SectionMotifLayers } from "@/components/sections/expertises/SectionMotif";
import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { countByCategory, FAQ_PANEL_ID, faqCategories, faqItems, faqItemsOf, faqTabId } from "@/lib/faq";

import { FaqItem } from "./FaqItem";
import { FaqTabs } from "./FaqTabs";

const DESKTOP_QUERY = "(min-width: 64rem)";
const FINE_QUERY = "(hover: hover) and (pointer: fine)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
/** Part visible de chaque cible qui déclenche sa séquence (ou la moitié de l'écran si elle est plus haute). */
const AMOUNTS = { a: 0.3, b: 0.4 } as const;
type Target = keyof typeof AMOUNTS;

/** Séquences (ms) : entrée de l'aside et première ouverture, changement de catégorie, indicateur, pulsation du « ? ». */
const TIMING = {
  asideAt: 900,
  firstOpenAt: 1500,
  outDuration: 160,
  outStagger: 30,
  inDuration: 420,
  inStagger: 80,
  heightDuration: 350,
  resizeDebounce: 100,
  reducedFade: 200,
  reducedStagger: 60,
  reducedQuick: 120,
  reducedHold: 700,
} as const;
const EASE_OUT_EXPO = "cubic-bezier(.16,1,.3,1)";
const EASE_OVERSHOOT = "cubic-bezier(.34,1.56,.64,1)";

/** Profondeur au pointeur et parallaxe (px) ; lissage par image. */
const DEPTH = { net: 10, rings: 3, mark: 6 } as const;
const PARALLAX = 20;
const SPOT_RADIUS = 130;
const LERP = { depth: 0.08, spot: 0.1 } as const;

const counts = countByCategory();
/** Rang de chaque question dans sa catégorie. */
const ranks = new Map(faqCategories.flatMap((category) => faqItemsOf(category.id).map((item, rank) => [item.id, rank] as const)));
const firstIdOf = (index: number) => faqItemsOf(faqCategories[index].id)[0]?.id ?? null;
const delayOf = (element: Element) => Number(element.getAttribute("data-d") ?? 0);
const matches = (query: string) => window.matchMedia(query).matches;
const reduced = () => matches(REDUCED_QUERY);

/**
 * « Ouverture » visuelle d'une carte déjà ouverte dans la mise en page (hauteur finale réservée,
 * donc aucun décalage) : réponse dévoilée par masque puis fondu, plus qui tourne, bouton, barre et anneau.
 */
function revealOpen(card: Element | null, delay: number): Animation[] {
  if (!card) return [];
  const at = (selector: string, keyframes: Keyframe[], duration: number, easing = EASE_OUT_EXPO, offset = 0) =>
    card.querySelector(selector)?.animate(keyframes, { duration, delay: delay + offset, easing, fill: "backwards" });
  const animations = reduced()
    ? [at(".faq-answer-inner", [{ opacity: 0 }, { opacity: 1 }], TIMING.reducedQuick, "ease-out"), at(".faq-ring", [{ opacity: 0 }, { opacity: 1 }], TIMING.reducedQuick, "ease-out")]
    : [
        at(".faq-answer", [{ clipPath: "inset(0 0 100% 0)" }, { clipPath: "inset(0 0 0 0)" }], 380),
        at(".faq-answer-inner", [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], 320, EASE_OUT_EXPO, 90),
        at(".faq-ring", [{ opacity: 0 }, { opacity: 1 }], 240),
        at(".faq-plus-icon", [{ transform: "rotate(0deg)" }, { transform: "rotate(45deg)" }], 320, EASE_OVERSHOOT),
        at(".faq-plus", [{ transform: "scale(1)" }, { transform: "scale(1.06)" }, { transform: "scale(1)" }], 240),
        at(".faq-bar", [{ transform: "scaleY(0)" }, { transform: "scaleY(1)" }], 360),
      ];
  return animations.filter((animation): animation is Animation => Boolean(animation));
}

/** Position et largeur de l'onglet actif, lues en une fois, appliquées à l'indicateur (translate + width). */
function placeIndicator(list: HTMLElement | null, indicator: HTMLElement | null, index: number, animate: boolean) {
  const tab = list?.querySelectorAll<HTMLElement>('[role="tab"]')[index];
  if (!list || !indicator || !tab) return;
  // Rectangles (sous-pixel) : les translations d'entrée des onglets sont verticales, x reste exact.
  const box = tab.getBoundingClientRect();
  const left = box.left - list.getBoundingClientRect().left + list.scrollLeft;
  const width = box.width;
  indicator.style.transition = animate && !reduced() ? "" : "none";
  indicator.style.translate = `${left}px 0`;
  indicator.style.width = `${width}px`;
}

type FaqInteractiveProps = {
  header: ReactNode;
  /** Bloc contact (rendu serveur) : à droite des cartes en desktop, après elles sinon. */
  aside: ReactNode;
  /** Sans JavaScript : toutes les catégories en <details> (dans <noscript>). */
  fallback: ReactNode;
};

/**
 * Seul composant client de la section : catégorie affichée, question ouverte, indicateur d'onglet,
 * un IntersectionObserver (en-tête + colonnes, aside, scène du « ? », section) et une boucle rAF
 * (parallaxe du motif, profondeur du « ? », projecteur de l'aside ; desktop à pointeur fin).
 * États posés en attributs : data-js, data-in-a|s (entrées), data-swapped, data-inview, data-pulse, data-spot.
 */
export function FaqInteractive({ header, aside, fallback }: FaqInteractiveProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const tablistRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const motifRef = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  // Onglet sélectionné (immédiat), catégorie affichée (après la sortie des cartes), question ouverte.
  const [selected, setSelected] = useState(0);
  const [shown, setShown] = useState(0);
  const [open, setOpen] = useState<number | null>(firstIdOf(0));
  const swap = useRef<{ timer: number; target: number } | null>(null);
  // Libération de la hauteur figée de la liste : une seule à la fois (sinon un ancien délai la coupe en pleine transition).
  const heightTimer = useRef(0);
  const intro0 = useRef<Animation[]>([]);
  const pulses = useRef({ count: 0, reduced: [] as Animation[] });

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
    const moving = [motifRef.current, spot, ...layers.map((layer) => layer.element)];

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
        if (target === "a") intro0.current = revealOpen(root.querySelector(".faq-card.is-open"), blocks.length * TIMING.reducedStagger);
      } else if (target === "a") {
        intro0.current = revealOpen(root.querySelector(".faq-card.is-open"), TIMING.firstOpenAt);
      }
    };

    // ---- Boucle rAF partagée (desktop, pointeur fin, mouvements autorisés, section visible) ----
    const live = () => matches(DESKTOP_QUERY) && matches(FINE_QUERY) && !reduced();
    let visible = false;
    let sceneIn = false;
    let raf = 0;
    let scrollDirty = false;
    const state = { par: 0, parTo: 0, mx: 0, my: 0, mxTo: 0, myTo: 0, sx: 0, sy: 0, sxTo: 0, syTo: 0 };

    const readScroll = () => {
      const rect = root.getBoundingClientRect();
      const screen = window.innerHeight;
      const progress = Math.min(1, Math.max(0, (screen - rect.top) / (screen + rect.height)));
      state.parTo = (progress * 2 - 1) * PARALLAX;
    };
    const write = () => {
      if (motifRef.current) motifRef.current.style.transform = `translate3d(0, ${state.par.toFixed(2)}px, 0)`;
      for (const { element, depth } of layers) {
        element?.style.setProperty("transform", `translate(${(state.mx * depth).toFixed(2)}px, ${(state.my * depth).toFixed(2)}px)`);
      }
      if (spot) spot.style.transform = `translate3d(${(state.sx - SPOT_RADIUS).toFixed(1)}px, ${(state.sy - SPOT_RADIUS).toFixed(1)}px, 0)`;
    };
    const frame = () => {
      raf = 0;
      if (scrollDirty) {
        scrollDirty = false;
        readScroll();
      }
      const step = (from: number, to: number, amount: number) => (Math.abs(to - from) < 0.01 ? to : from + (to - from) * amount);
      state.par = step(state.par, state.parTo, LERP.depth);
      state.mx = step(state.mx, state.mxTo, LERP.depth);
      state.my = step(state.my, state.myTo, LERP.depth);
      state.sx = step(state.sx, state.sxTo, LERP.spot);
      state.sy = step(state.sy, state.syTo, LERP.spot);
      write();
      const settled =
        state.par === state.parTo && state.mx === state.mxTo && state.my === state.myTo && state.sx === state.sxTo && state.sy === state.syTo;
      if (!settled) raf = requestAnimationFrame(frame);
    };
    const kick = () => {
      if (!raf && visible && live()) raf = requestAnimationFrame(frame);
    };
    const onScroll = () => {
      scrollDirty = true;
      kick();
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
      window.removeEventListener("scroll", onScroll);
      if (on) {
        window.addEventListener("scroll", onScroll, { passive: true });
        readScroll();
        if (!motifRef.current?.style.transform) state.par = state.parTo;
        write();
      } else if (!live()) {
        // Hors desktop à pointeur fin : aucun décalage résiduel.
        cancelAnimationFrame(raf);
        raf = 0;
        Object.assign(state, { par: 0, parTo: 0, mx: 0, my: 0, mxTo: 0, myTo: 0 });
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
      window.removeEventListener("scroll", onScroll);
      queries.forEach((query) => query.removeEventListener("change", sync));
      document.removeEventListener("visibilitychange", syncScene);
      asideEl.removeEventListener("pointermove", onPointerMove);
      asideEl.removeEventListener("pointerleave", onPointerLeave);
    };
  }, []);

  // Indicateur d'onglet : recalé à chaque changement d'onglet (glissé), et sans glisser au redimensionnement.
  const selectedRef = useRef(selected);
  const placed = useRef(false);
  useLayoutEffect(() => {
    selectedRef.current = selected;
    placeIndicator(tablistRef.current, indicatorRef.current, selected, placed.current);
    placed.current = true;
  }, [selected]);
  useEffect(() => {
    const list = tablistRef.current;
    if (!list) return;
    let timer = 0;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => placeIndicator(list, indicatorRef.current, selectedRef.current, false), TIMING.resizeDebounce);
    });
    [list, ...list.querySelectorAll('[role="tab"]')].forEach((element) => observer.observe(element));
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  // Pastilles défilantes : l'onglet actif est amené dans la vue en ne faisant défiler que leur conteneur.
  useEffect(() => {
    const list = tablistRef.current;
    if (!list || list.scrollWidth <= list.clientWidth) return;
    const tab = list.querySelectorAll<HTMLElement>('[role="tab"]')[selected];
    if (!tab) return;
    const pad = 24;
    const left = tab.offsetLeft;
    if (left >= list.scrollLeft + pad && left + tab.offsetWidth <= list.scrollLeft + list.clientWidth - pad) return;
    list.scrollTo({ left: Math.max(0, left - pad), behavior: reduce ? "auto" : "smooth" });
  }, [selected, reduce]);

  useEffect(
    () => () => {
      window.clearTimeout(swap.current?.timer);
      window.clearTimeout(heightTimer.current);
    },
    [],
  );

  const stopIntro = () => {
    intro0.current.forEach((animation) => animation.cancel());
    intro0.current = [];
  };

  const visibleCards = () => [...(listRef.current?.querySelectorAll<HTMLElement>("[data-faq-card]:not([hidden])") ?? [])];

  // Nouvelle catégorie affichée : hauteur de la liste animée de l'ancienne à la nouvelle (ouverte comprise),
  // cascade d'entrée, puis « ouverture » de la première question en fin de cascade.
  const pendingIn = useRef(false);
  useLayoutEffect(() => {
    const list = listRef.current;
    if (!pendingIn.current || !list) return;
    pendingIn.current = false;
    const from = parseFloat(list.style.height) || list.offsetHeight;
    list.style.height = "auto";
    const to = list.offsetHeight;
    list.style.height = `${from}px`;
    void list.offsetHeight;
    list.style.height = `${to}px`;
    window.clearTimeout(heightTimer.current);
    heightTimer.current = window.setTimeout(() => {
      if (!swap.current) list.style.height = "";
    }, TIMING.heightDuration);
    const cards = visibleCards();
    if (reduced()) {
      list.animate([{ opacity: 0 }, { opacity: 1 }], { duration: TIMING.reducedQuick, easing: "ease-out" });
      return;
    }
    cards.forEach((card, index) =>
      card.animate(
        [
          { opacity: 0, transform: "translateY(18px)" },
          { opacity: 1, transform: "none" },
        ],
        { duration: TIMING.inDuration, delay: index * TIMING.inStagger, easing: EASE_OUT_EXPO, fill: "backwards" },
      ),
    );
    intro0.current = revealOpen(list.querySelector(".faq-card.is-open"), TIMING.inDuration + (cards.length - 1) * TIMING.inStagger);
  }, [shown]);

  const select = (index: number) => {
    setSelected(index);
    stopIntro();
    // Sortie en cours : seule la destination change (la dernière action gagne, aucune sortie empilée).
    if (swap.current) {
      swap.current.target = index;
      return;
    }
    if (index === shown) return;
    const list = listRef.current;
    if (!list) return;
    // Les cartes ne rejouent plus l'entrée initiale (CSS) : les cascades passent en WAAPI.
    rootRef.current?.setAttribute("data-swapped", "");
    window.clearTimeout(heightTimer.current);
    list.style.height = `${list.offsetHeight}px`;
    const cards = visibleCards();
    const done = () => {
      const target = swap.current?.target ?? index;
      swap.current = null;
      pendingIn.current = true;
      setShown(target);
      setOpen(firstIdOf(target));
    };
    if (reduced()) {
      swap.current = { timer: 0, target: index };
      done();
      return;
    }
    cards.forEach((card, cardIndex) => {
      // Reprise depuis l'état courant (cascade d'entrée éventuellement en cours) : pas de saut.
      const style = getComputedStyle(card);
      const current = { opacity: style.opacity, transform: style.transform === "none" ? "none" : style.transform };
      card.getAnimations().forEach((animation) => animation.cancel());
      card.animate([current, { opacity: 0, transform: "translateY(-10px)" }], {
        duration: TIMING.outDuration,
        delay: cardIndex * TIMING.outStagger,
        easing: "ease-out",
        fill: "forwards",
      });
    });
    const total = TIMING.outDuration + Math.max(0, cards.length - 1) * TIMING.outStagger;
    swap.current = { timer: window.setTimeout(done, total), target: index };
  };

  // Les animations de sortie (fill: forwards) des cartes masquées sont nettoyées une fois remplacées.
  useEffect(() => {
    listRef.current
      ?.querySelectorAll<HTMLElement>("[data-faq-card][hidden]")
      .forEach((card) => card.getAnimations().forEach((animation) => animation.cancel()));
  }, [shown]);

  // Ouverture d'une question : le « ? » laisse place à une coche (CSS, relancée en alternant data-pulse) ;
  // en animations réduites, simple fondu de 120 ms.
  const pulse = () => {
    const scene = rootRef.current?.querySelector<HTMLElement>(".faq-scene");
    if (!scene) return;
    if (reduced()) {
      pulses.current.reduced.forEach((animation) => animation.cancel());
      const total = TIMING.reducedQuick * 2 + TIMING.reducedHold;
      const edge = TIMING.reducedQuick / total;
      const fade = (selector: string, from: number) =>
        scene.querySelector(selector)?.animate(
          [
            { opacity: from },
            { opacity: 1 - from, offset: edge },
            { opacity: 1 - from, offset: 1 - edge },
            { opacity: from },
          ],
          { duration: total },
        );
      pulses.current.reduced = [fade(".fqm-mark", 1), fade(".fqm-check", 0)].filter((animation): animation is Animation => Boolean(animation));
      return;
    }
    pulses.current.count += 1;
    scene.setAttribute("data-pulse", pulses.current.count % 2 ? "odd" : "even");
  };

  const toggle = (id: number) => {
    stopIntro();
    const next = open === id ? null : id;
    setOpen(next);
    if (next === null) return;
    pulse();
    if (reduced()) {
      document.getElementById(`faq-answer-${next}`)?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: TIMING.reducedQuick, easing: "ease-out" });
    }
  };

  const shownId = faqCategories[shown].id;

  return (
    <div ref={rootRef} className="faq-root relative pt-24 pb-32 lg:pt-28">
      {/* Liseré doré du haut et halo derrière le titre */}
      <div aria-hidden="true" className="faq-topline absolute inset-x-0 top-0 h-px" />
      <div aria-hidden="true" className="faq-glow pointer-events-none absolute" />

      {/* Motif clair (variante vivid) sur toute la section, plus grand qu'elle pour la parallaxe ; intensité --motif-strength-faq */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-clip">
        <div ref={motifRef} className="faq-motif absolute -inset-10">
          <MotifLayer reduce={reduce} />
        </div>
      </div>

      {/* Contenu ; marges identiques au header et aux autres sections */}
      <div className="relative z-10 mx-auto max-w-site px-6 md:px-10 xl:px-28">
        <div data-fq-target="a">
          {header}
          <FaqTabs selected={selected} counts={counts} onSelect={select} listRef={tablistRef} indicatorRef={indicatorRef} />

          <div className="mt-6 lg:mt-8 lg:flex lg:items-start lg:gap-18">
            <div role="tabpanel" id={FAQ_PANEL_ID} aria-labelledby={faqTabId(faqCategories[selected])} className="min-w-0 lg:flex-1">
              <ul ref={listRef} className="faq-list flex flex-col gap-3">
                {faqItems.map((item) => (
                  <FaqItem
                    key={item.id}
                    item={item}
                    open={open === item.id}
                    hidden={item.categoryId !== shownId}
                    index={ranks.get(item.id) ?? 0}
                    onToggle={toggle}
                  />
                ))}
              </ul>
              {fallback}
            </div>
            {aside}
          </div>
        </div>
      </div>
    </div>
  );
}

/** Motif statique dans sa couche (la parallaxe déplace le conteneur entier). */
function MotifLayer({ reduce }: { reduce: boolean }) {
  const still = useMotionValue(0);
  return <SectionMotifLayers tone="vivid" leftY={still} rightY={still} reduce={reduce} willChange={false} />;
}
