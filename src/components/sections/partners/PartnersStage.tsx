"use client";

import { useEffect, useLayoutEffect, useRef, type CSSProperties, type ReactNode } from "react";

import { WaveMotif, type WaveMask } from "@/components/ui/WaveMotif";
import { SCENE_WIDTH } from "@/lib/partners-layout";

const DESKTOP_QUERY = "(min-width: 64rem)";
const FINE_QUERY = "(hover: hover) and (pointer: fine)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

/** Rythmes (ms) : impulsions ambiantes, trajet d'une lumière, survol, réaction du cercle, mobile. */
const TIMING = {
  ambientEvery: 1400,
  ambientTravel: 1600,
  flash: 600,
  hoverTravel: 750,
  hoverEvery: 1600,
  ping: 900,
  halo: 700,
  mark: 500,
  mobileEvery: 2400,
  mobileTravel: 1600,
  entry: 2200,
  reducedFade: 150,
} as const;
const HOVER_EASE = "cubic-bezier(.65,0,.35,1)";

const matches = (query: string) => window.matchMedia(query).matches;

/** Ordre fixe « mélangé » des partenaires (même à chaque chargement) : pas multiplicatif premier avec n. */
function shuffledOrder(count: number): number[] {
  const step = [5, 7, 3, 11, 13].find((candidate) => gcd(candidate, count) === 1 && candidate < count) ?? 1;
  return Array.from({ length: count }, (_, index) => (index * step + 1) % count);
}
function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

type StageProps = {
  regime: "A" | "B" | "C";
  /** Chemin AS → carte de chaque carte (coordonnées de la scène). */
  routes: readonly string[];
  count: number;
  height: number;
  children: ReactNode;
  /** Masque du zigzag : coin bas droit par défaut, tout le fond sur l'accueil. */
  motifMask?: WaveMask;
  joinedAbove?: boolean;
};

/**
 * Seule île client de la section : pose data-js / data-in / data-visible, l'échelle de la scène
 * (--k, ResizeObserver), crée les lumières (WAAPI sur offset-distance ou transform) et gère le survol,
 * le focus et la carte active en mobile. Un IntersectionObserver pour l'entrée, un pour la visibilité,
 * un seul setInterval pour les impulsions ambiantes (effacé hors écran ou onglet masqué).
 */
export function PartnersStage({ regime, routes, count, height, children, motifMask = "br", joinedAbove = false }: StageProps) {
  const rootRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    root.setAttribute("data-js", "");
    // Échelle de la scène (desktop) : lue une fois par redimensionnement, écrite sur le wrapper.
    const wrap = root.querySelector<HTMLElement>(".pt-wrap");
    if (!wrap) return;
    const resize = () => wrap.style.setProperty("--k", String(Math.min(1, wrap.clientWidth / SCENE_WIDTH)));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(wrap);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const root = rootRef.current;
    const scene = root?.querySelector<HTMLElement>(".pt-scene");
    const lights = root?.querySelector<HTMLElement>(".pt-lights");
    const hub = root?.querySelector<HTMLElement>(".pt-hub");
    if (!root || !scene || !lights || !hub) return;
    const items = [...root.querySelectorAll<HTMLElement>("[data-pt-card]")];
    const highlights = [...root.querySelectorAll<SVGPathElement>("[data-hl]")];
    const counter = hub.querySelector<HTMLElement>(".pt-counter");
    const order = shuffledOrder(count);
    const desktop = () => matches(DESKTOP_QUERY);
    const timers = new Set<number>();
    const later = (fn: () => void, ms: number) => {
      const id = window.setTimeout(() => {
        timers.delete(id);
        fn();
      }, ms);
      timers.add(id);
      return id;
    };

    // ---------- Lumières ----------
    /** Lumière (tête + traînée) le long d'une route de la scène ; résout à l'arrivée de la tête. */
    const travel = (route: string, reverse: boolean, duration: number, easing: string, strong: boolean): Animation | null => {
      if (matches(REDUCED_QUERY)) return null;
      const trail = strong ? 3 : 2;
      let head: Animation | null = null;
      for (let index = 0; index <= trail; index += 1) {
        const dot = document.createElement("span");
        dot.className = `pt-light${index ? " pt-light-trail" : ""}${strong ? " pt-light-strong" : ""}`;
        dot.style.offsetPath = `path("${route}")`;
        dot.style.opacity = String(1 - index * 0.28);
        lights.append(dot);
        const animation = dot.animate([{ offsetDistance: reverse ? "100%" : "0%" }, { offsetDistance: reverse ? "0%" : "100%" }], {
          duration,
          easing,
          delay: index * 45,
          fill: "both",
        });
        animation.onfinish = () => dot.remove();
        animation.oncancel = () => dot.remove();
        head ??= animation;
      }
      return head;
    };

    /** Réaction du cercle AS à l'arrivée d'une lumière : ping, halo, lueur du monogramme. */
    const react = () => {
      if (matches(REDUCED_QUERY)) return;
      hub.querySelector(".pt-ping")?.animate(
        [
          { transform: "scale(1)", opacity: 0.5 },
          { transform: "scale(1.35)", opacity: 0 },
        ],
        { duration: TIMING.ping, easing: "ease-out" },
      );
      hub.querySelector(".pt-halo")?.animate([{ opacity: 1 }, { opacity: 0.55 }], { duration: TIMING.halo, easing: "ease-out" });
      hub.querySelector(".pt-mark")?.animate([{ filter: "brightness(1)" }, { filter: "brightness(1.25)" }, { filter: "brightness(1)" }], {
        duration: TIMING.mark,
        easing: "ease-out",
      });
    };

    const flash = (index: number) => {
      const item = items[index];
      if (!item) return;
      item.setAttribute("data-flash", "");
      later(() => item.removeAttribute("data-flash"), TIMING.flash);
    };

    // ---------- Carte en avant (survol / focus en desktop, bande sous le cercle en mobile) ----------
    let current: number | null = null;
    const setActive = (index: number | null) => {
      if (index === current) return;
      if (current !== null) {
        items[current]?.removeAttribute("data-active");
        highlights[current]?.removeAttribute("data-on");
      }
      current = index;
      root.toggleAttribute("data-focus", index !== null);
      if (index === null) return;
      items[index]?.setAttribute("data-active", "");
      highlights[index]?.setAttribute("data-on", "");
      if (counter) counter.textContent = `${String(index + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`;
    };

    // Survol : une lumière part de la carte vers le cercle toutes les 1.6 s ; l'impulsion en cours se
    // termine avant que la suivante (éventuellement pour une autre carte) ne parte.
    let target: number | null = null;
    let inflight = false;
    let nextTimer = 0;
    const launch = () => {
      if (target === null || inflight || !desktop()) return;
      const route = routes[target];
      const head = route ? travel(route, true, TIMING.hoverTravel, HOVER_EASE, true) : null;
      if (!head) return;
      inflight = true;
      const launchedFor = target;
      root.setAttribute("data-pulsing", "");
      head.finished
        .then(() => {
          react();
          inflight = false;
          root.removeAttribute("data-pulsing");
          // Autre carte survolée pendant le trajet : elle part tout de suite ; sinon, cadence de 1.6 s.
          if (target !== null && target !== launchedFor) launch();
          else if (target !== null) nextTimer = later(launch, TIMING.hoverEvery - TIMING.hoverTravel);
        })
        .catch(() => {
          inflight = false;
        });
    };
    const engage = (index: number | null) => {
      setActive(index);
      target = index;
      window.clearTimeout(nextTimer);
      timers.delete(nextTimer);
      if (index !== null) launch();
    };

    const cardIndex = (node: EventTarget | null) => {
      const item = (node as Element | null)?.closest?.<HTMLElement>("[data-pt-card]");
      if (!item || item.hasAttribute("data-more")) return null;
      return Number(item.dataset.ptCard);
    };
    const onOver = (event: PointerEvent) => {
      if (event.pointerType === "mouse" && desktop() && matches(FINE_QUERY)) engage(cardIndex(event.target));
    };
    const onLeave = () => {
      if (desktop() && !root.contains(document.activeElement)) engage(null);
    };
    const onFocusIn = (event: FocusEvent) => {
      if ((event.target as Element).matches?.(":focus-visible")) engage(cardIndex(event.target));
    };
    const onFocusOut = (event: FocusEvent) => {
      if (!root.contains(event.relatedTarget as Node | null)) engage(null);
    };
    const list = root.querySelector<HTMLElement>(".pt-list");
    list?.addEventListener("pointerover", onOver);
    list?.addEventListener("pointerleave", onLeave);
    list?.addEventListener("focusin", onFocusIn);
    list?.addEventListener("focusout", onFocusOut);

    // ---------- Mobile : lumières sur la trace verticale ----------
    const verticalTravel = (fromY: number, toY: number, duration: number, strong: boolean) => {
      if (matches(REDUCED_QUERY)) return null;
      const x = scene.clientWidth / 2;
      return travel(`M${x} ${fromY}V${toY}`, false, duration, strong ? HOVER_EASE : "ease-in-out", strong);
    };
    const hubCenterY = () => {
      const sceneTop = scene.getBoundingClientRect().top;
      const box = hub.querySelector(".pt-core")?.getBoundingClientRect();
      return box ? box.top + box.height / 2 - sceneTop : 48;
    };
    const lastCardY = () => {
      const last = items.at(-1);
      return last ? last.offsetTop + last.offsetHeight / 2 : scene.clientHeight;
    };
    const activateMobile = (index: number) => {
      if (index === current) return;
      setActive(index);
      const item = items[index];
      if (!item) return;
      const head = verticalTravel(item.offsetTop + item.offsetHeight / 2, hubCenterY(), TIMING.hoverTravel, true);
      head?.finished.then(react).catch(() => {});
    };

    // ---------- Impulsions ambiantes : un seul intervalle, actif seulement si la section est visible ----------
    let interval = 0;
    let step = 0;
    let visible = false;
    const ambient = () => {
      if (desktop()) {
        const index = order[step % order.length];
        step += 1;
        const route = routes[index];
        const head = route ? travel(route, false, TIMING.ambientTravel, "ease-in-out", false) : null;
        head?.finished.then(() => flash(index)).catch(() => {});
      } else {
        verticalTravel(hubCenterY(), lastCardY(), TIMING.mobileTravel, false);
      }
    };
    const sync = () => {
      const on = visible && document.visibilityState === "visible" && !matches(REDUCED_QUERY);
      root.toggleAttribute("data-visible", on);
      window.clearInterval(interval);
      interval = 0;
      if (on) interval = window.setInterval(ambient, desktop() ? TIMING.ambientEvery : TIMING.mobileEvery);
      // Lumières en cours : en pause hors écran.
      lights.getAnimations({ subtree: true }).forEach((animation) => (on ? animation.play() : animation.pause()));
    };

    const visibility = new IntersectionObserver(
      ([entry]) => {
        visible = Boolean(entry?.isIntersecting);
        sync();
      },
      { threshold: 0.15 },
    );
    visibility.observe(root);
    document.addEventListener("visibilitychange", sync);
    const desktopQuery = window.matchMedia(DESKTOP_QUERY);
    desktopQuery.addEventListener("change", sync);

    // ---------- Entrée (une fois) ----------
    const entry = new IntersectionObserver(
      ([first]) => {
        if (!first?.isIntersecting) return;
        entry.disconnect();
        root.setAttribute("data-in", "");
        root.setAttribute("data-animating", "");
        later(() => root.removeAttribute("data-animating"), TIMING.entry);
        if (matches(REDUCED_QUERY)) {
          // Fondus d'opacité seuls (la règle globale des animations réduites neutralise les animations CSS).
          root.querySelectorAll<HTMLElement>(".pt-a, .pt-hub, .pt-item, .pt-traces").forEach((element) =>
            element.animate([{ opacity: 0 }, { opacity: 1 }], { duration: TIMING.reducedFade, easing: "ease-out", fill: "backwards" }),
          );
        }
      },
      // Haut de la section au quart bas de l'écran : atteignable quelle que soit sa hauteur.
      { rootMargin: "0px 0px -25% 0px" },
    );
    entry.observe(root);

    // Mobile : chaque carte entre à son arrivée à l'écran ; la carte active est celle qui croise une
    // bande 40 px sous le cercle fixe.
    const seen = new IntersectionObserver(
      (entries) => {
        for (const item of entries) {
          if (!item.isIntersecting) continue;
          item.target.setAttribute("data-seen", "");
          seen.unobserve(item.target);
        }
      },
      { threshold: 0.2 },
    );
    items.forEach((item) => seen.observe(item));

    let band: IntersectionObserver | null = null;
    const watchBand = () => {
      band?.disconnect();
      band = null;
      if (desktop()) return;
      const hubBox = hub.querySelector(".pt-core")?.getBoundingClientRect();
      const stickyTop = parseFloat(getComputedStyle(hub).top) || 0;
      const line = stickyTop + (hubBox?.height ?? 96) + 40;
      band = new IntersectionObserver(
        (entries) => {
          for (const item of entries) if (item.isIntersecting) activateMobile(Number((item.target as HTMLElement).dataset.ptCard));
        },
        { rootMargin: `-${Math.round(line)}px 0px -${Math.max(0, Math.round(window.innerHeight - line - 2))}px 0px` },
      );
      items.forEach((item) => band?.observe(item));
    };
    watchBand();
    window.addEventListener("resize", watchBand, { passive: true });
    desktopQuery.addEventListener("change", watchBand);

    return () => {
      visibility.disconnect();
      entry.disconnect();
      seen.disconnect();
      band?.disconnect();
      window.clearInterval(interval);
      timers.forEach((id) => window.clearTimeout(id));
      document.removeEventListener("visibilitychange", sync);
      desktopQuery.removeEventListener("change", sync);
      desktopQuery.removeEventListener("change", watchBand);
      window.removeEventListener("resize", watchBand);
      list?.removeEventListener("pointerover", onOver);
      list?.removeEventListener("pointerleave", onLeave);
      list?.removeEventListener("focusin", onFocusIn);
      list?.removeEventListener("focusout", onFocusOut);
    };
  }, [routes, count]);

  return (
    <div ref={rootRef} data-regime={regime} style={{ "--h": `${height}px` } as CSSProperties} className={`pt-root relative pb-16 lg:pb-30 ${joinedAbove ? "pt-8 lg:pt-12" : "pt-16 lg:pt-28"}`}>
      {/* Zigzag doré (fond clair, statique) : coin bas droit, tout le fond sur l'accueil */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-clip">
        <WaveMotif tone="light" mask={motifMask} />
      </div>
      <div className="relative z-10 mx-auto max-w-site px-5 md:px-10 xl:px-28">{children}</div>
    </div>
  );
}
