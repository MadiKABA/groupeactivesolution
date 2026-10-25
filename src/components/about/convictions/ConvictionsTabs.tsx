"use client";

import { ArrowRight, Plus } from "lucide-react";
import {
  useEffect,
  useEffectEvent,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
} from "react";

import { usePrefersReducedMotion } from "@/hooks/useMediaQuery";

export type ConvictionTab = { id: string; number: string; word: string; micro: string };
type ConvictionPanel = { text: ReactNode; media: ReactNode };

// Même courbe que le hero À propos et « Notre histoire ».
const EASE = "cubic-bezier(0.2, 0.7, 0.2, 1)";
const REVEAL_MS = 750;
// Fondu de l'ancien panneau : transition CSS de [data-state="leaving"] (globals.css).
const LEAVE_MS = 300;
const FADE_MS = 200;
const LINE_MS = 450;
// Cascade du contenu (attribut data-enter) : la plus longue animation est le zoom de la photo.
const ENTER_MS = 1100;
// Séquence d'entrée de la section (data-intro, animations CSS) puis invitation unique sur un cercle.
const INTRO_MS = 2100;
const INVITE_DELAY_MS = 1800;
const INVITE_MS = 900;

type Mode = "instant" | "fade" | "reveal";

const panelId = (id: string) => `conviction-${id}`;
const tabId = (id: string) => `conviction-${id}-tab`;

// Vrai seulement après l'hydratation : rôles ARIA et inert ne sont posés qu'avec JavaScript.
const subscribeNothing = () => () => {};
const useHydrated = () =>
  useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );

/** Position d'un élément dans `root`, hors transforms (survol, entrée). */
function offsetWithin(element: HTMLElement, root: HTMLElement) {
  let x = 0;
  let y = 0;
  let node: HTMLElement | null = element;
  while (node && node !== root) {
    x += node.offsetLeft;
    y += node.offsetTop;
    node = node.offsetParent as HTMLElement | null;
  }
  return { x, y };
}

/** Trait de liaison : du bas de l'onglet actif au bord haut du panneau (variables --tx, --ty, --th). */
function placeTether(root: HTMLElement, tab: HTMLElement | null | undefined, stage: HTMLElement | null, snap: boolean) {
  if (!tab || !stage) return;
  const gap = parseFloat(getComputedStyle(root).getPropertyValue("--cv-tether-gap")) || 0;
  const t = offsetWithin(tab, root);
  const top = t.y + tab.offsetHeight + gap;
  // Redimensionnement : déplacement instantané (sinon le trait glisse à chaque image).
  if (snap) root.setAttribute("data-snap", "");
  root.style.setProperty("--tx", `${t.x + tab.offsetWidth / 2}px`);
  root.style.setProperty("--ty", `${top}px`);
  root.style.setProperty("--th", `${Math.max(0, offsetWithin(stage, root).y - top)}px`);
  if (snap) {
    root.getBoundingClientRect();
    root.removeAttribute("data-snap");
  }
}

/** Disque de révélation : centre du cercle actif dans le repère du panneau, rayon jusqu'au coin le plus éloigné + 40px. */
function revealFrames(root: HTMLElement, disc: HTMLElement, panel: HTMLElement): Keyframe[] {
  const d = offsetWithin(disc, root);
  const p = offsetWithin(panel, root);
  const x = d.x + disc.offsetWidth / 2 - p.x;
  const y = d.y + disc.offsetHeight / 2 - p.y;
  const w = panel.offsetWidth;
  const h = panel.offsetHeight;
  const r = Math.max(Math.hypot(x, y), Math.hypot(w - x, y), Math.hypot(x, h - y), Math.hypot(w - x, h - y)) + 40;
  return [{ clipPath: `circle(0px at ${x}px ${y}px)` }, { clipPath: `circle(${r}px at ${x}px ${y}px)` }];
}

// Révélation circulaire si clip-path est pris en charge ; fondu sur les appareils très modestes (≤ 2 cœurs).
const canReveal = () =>
  CSS.supports("clip-path", "circle(1px at 1px 1px)") && (navigator.hardwareConcurrency ?? 8) > 2;

/*
 * Onglets des convictions (motif WAI-ARIA Tabs, activation automatique). Les cercles sont des
 * liens d'ancre rendus au serveur : sans JavaScript, ils mènent aux panneaux empilés. Après
 * l'hydratation, ce composant pose les rôles, le tabindex itinérant et inert, et pilote le
 * trait de liaison, la révélation circulaire et le lien profond (#conviction-<id>).
 * Les panneaux (texte et photo) sont rendus par le Server Component parent.
 */
export function ConvictionsTabs({
  heading,
  tabs,
  panels,
}: {
  heading: ReactNode;
  tabs: readonly ConvictionTab[];
  panels: readonly ConvictionPanel[];
}) {
  const ready = useHydrated();
  const reduce = usePrefersReducedMotion();
  const [active, setActive] = useState(0);
  const [leaving, setLeaving] = useState<number | null>(null);

  const rootRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const lineRef = useRef<HTMLSpanElement>(null);
  const tabRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const panelRefs = useRef<(HTMLDivElement | null)[]>([]);
  const activeRef = useRef(0);
  const pending = useRef<{ from: number; mode: Mode } | null>(null);
  const running = useRef<Animation[]>([]);
  const timers = useRef({ enter: 0, leave: 0 });
  const interacted = useRef(false);
  const invite = useRef<Animation[]>([]);

  const markInteracted = () => {
    interacted.current = true;
    invite.current.forEach((animation) => animation.cancel());
  };

  // Au clic : si le haut du panneau n'est pas visible sous le header, on le ramène (scroll-margin-top).
  const revealStage = () => {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const margin = parseFloat(getComputedStyle(stage).scrollMarginTop) || 0;
    if (rect.top >= margin && rect.top <= window.innerHeight - 96) return;
    stage.scrollIntoView({
      block: rect.height + margin > window.innerHeight ? "start" : "nearest",
      behavior: reduce ? "instant" : "smooth",
    });
  };

  const go = (next: number, { focus = false, scroll = false } = {}) => {
    markInteracted();
    if (focus) tabRefs.current[next]?.focus();
    if (scroll) revealStage();
    if (next === active) return;
    const mode: Mode = reduce ? "instant" : canReveal() ? "reveal" : "fade";
    pending.current = { from: active, mode };
    setLeaving(mode === "reveal" ? active : null);
    setActive(next);
    // Lien profond sans empiler l'historique (l'état du routeur est conservé).
    window.history.replaceState(window.history.state, "", `#${panelId(tabs[next].id)}`);
  };

  const onTabClick = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    if (!ready) return;
    event.preventDefault();
    go(index, { scroll: true });
  };

  // Flèches droite/bas : suivant ; gauche/haut : précédent ; Début, Fin ; Entrée et Espace activent aussi.
  const onTabKeyDown = (event: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    const last = tabs.length - 1;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      go(index);
      return;
    }
    const target = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowDown: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      ArrowUp: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    }[event.key];
    if (target === undefined) return;
    event.preventDefault();
    go(target, { focus: true });
  };

  // Changement d'onglet : trait de liaison, révélation du nouveau panneau, cascade du contenu.
  useLayoutEffect(() => {
    activeRef.current = active;
    const root = rootRef.current;
    if (!root) return;
    const transition = pending.current;
    pending.current = null;

    running.current.forEach((animation) => animation.cancel());
    running.current = [];
    window.clearTimeout(timers.current.enter);
    window.clearTimeout(timers.current.leave);
    panelRefs.current.forEach((panel) => panel?.removeAttribute("data-enter"));

    const tab = tabRefs.current[active];
    placeTether(root, tab, stageRef.current, !transition || transition.mode === "instant");
    const panel = panelRefs.current[active];
    const disc = tab?.querySelector<HTMLElement>(".cv-disc");
    if (!transition || transition.mode === "instant" || !panel || !disc) return;

    const animations: Animation[] = [];
    if (lineRef.current) {
      animations.push(lineRef.current.animate([{ scale: "1 0" }, { scale: "1 1" }], { duration: LINE_MS, easing: EASE }));
    }
    if (transition.mode === "reveal") {
      panel.setAttribute("data-anim", "");
      const reveal = panel.animate(revealFrames(root, disc, panel), { duration: REVEAL_MS, easing: EASE });
      reveal.finished.then(
        () => panel.removeAttribute("data-anim"),
        () => panel.removeAttribute("data-anim"),
      );
      animations.push(reveal);
      panel.setAttribute("data-enter", "");
      timers.current.enter = window.setTimeout(() => panel.removeAttribute("data-enter"), ENTER_MS);
      timers.current.leave = window.setTimeout(() => setLeaving(null), LEAVE_MS);
    } else {
      animations.push(panel.animate([{ opacity: 0 }, { opacity: 1 }], { duration: FADE_MS, easing: "ease-out" }));
    }
    running.current = animations;
  }, [active]);

  // Montage : état d'entrée (sauf animations réduites), trait de liaison recalé à chaque redimensionnement.
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.setAttribute("data-js", "");
    const place = () => placeTether(root, tabRefs.current[activeRef.current], stageRef.current, true);
    place();
    root.setAttribute("data-measured", "");
    const observer = new ResizeObserver(place);
    observer.observe(root);
    if (stageRef.current) observer.observe(stageRef.current);
    return () => observer.disconnect();
  }, []);

  // Entrée unique à 25 % de visibilité, puis invitation (une seule fois) si rien n'a été touché.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const pendingTimers: number[] = [];
    const breathe = () => {
      if (interacted.current) return;
      const index = activeRef.current === 1 ? (activeRef.current + 1) % tabRefs.current.length : 1;
      const tab = tabRefs.current[index];
      const ring = tab?.querySelector<SVGCircleElement>(".cv-ring-base");
      if (!tab || !ring) return;
      const timing = { duration: INVITE_MS, easing: "ease-in-out" };
      invite.current = [
        tab.animate([{ scale: 1 }, { scale: 1.04 }, { scale: 1 }], timing),
        ring.animate([{ strokeOpacity: 0.32 }, { strokeOpacity: 0.8 }, { strokeOpacity: 0.32 }], timing),
      ];
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        observer.disconnect();
        root.setAttribute("data-in", "");
        if (!root.hasAttribute("data-js")) return;
        root.setAttribute("data-intro", "");
        pendingTimers.push(
          window.setTimeout(() => root.removeAttribute("data-intro"), INTRO_MS),
          window.setTimeout(breathe, INVITE_DELAY_MS),
        );
      },
      { threshold: 0.25 },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      pendingTimers.forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  // Lien profond : #conviction-<id> au chargement (onglet ouvert, section en haut) et à chaque changement de hash.
  const syncFromHash = useEffectEvent((initial: boolean) => {
    const hash = decodeURIComponent(window.location.hash);
    const index = tabs.findIndex((tab) => `#${panelId(tab.id)}` === hash);
    if (index < 0) return;
    if (!initial) {
      go(index);
      return;
    }
    setActive(index);
    rootRef.current?.closest("section")?.scrollIntoView({ block: "start", behavior: "instant" });
  });

  useEffect(() => {
    const frame = requestAnimationFrame(() => syncFromHash(true));
    const onHashChange = () => syncFromHash(false);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  return (
    <div ref={rootRef} className="cv-root">
      <div className="cv-intro">
        {heading}
        <div
          role={ready ? "tablist" : undefined}
          aria-label={ready ? "Nos quatre convictions" : undefined}
          className="cv-tabs"
          onPointerDown={markInteracted}
        >
          {tabs.map((tab, index) => {
            const selected = index === active;
            return (
              <a
                key={tab.id}
                ref={(node) => {
                  tabRefs.current[index] = node;
                }}
                id={tabId(tab.id)}
                href={`#${panelId(tab.id)}`}
                role={ready ? "tab" : undefined}
                aria-selected={ready ? selected : undefined}
                aria-controls={ready ? panelId(tab.id) : undefined}
                tabIndex={ready ? (selected ? 0 : -1) : undefined}
                data-active={selected || undefined}
                className="cv-tab"
                style={{ "--i": index } as CSSProperties}
                onClick={(event) => onTabClick(event, index)}
                onKeyDown={ready ? (event) => onTabKeyDown(event, index) : undefined}
              >
                <span aria-hidden="true" className="cv-disc">
                  {/* Sans viewBox : unités en pixels réels, rayon en CSS (pathLength exact pour le tracé) */}
                  <svg className="cv-rings">
                    <circle className="cv-ring-base" pathLength={1} />
                    <circle className="cv-ring-active" pathLength={1} />
                  </svg>
                </span>
                {/* Espaces entre les parties : nom accessible « 01 Partager le savoir » */}
                <span className="cv-num">{tab.number}</span> <span className="cv-word">{tab.word}</span>{" "}
                <span className="cv-micro">{tab.micro}</span>
                <span aria-hidden="true" className="cv-mark">
                  <Plus className="cv-plus" strokeWidth={2.25} />
                  <span className="cv-dot" />
                </span>
              </a>
            );
          })}
        </div>
      </div>

      <span aria-hidden="true" className="cv-tether">
        <span ref={lineRef} className="cv-tether-line" />
        <span className="cv-diamond" />
      </span>

      <div ref={stageRef} className="cv-panels">
        {/* Seul élément flouté de la section, sous les panneaux (qui ne portent que leur teinte) */}
        <div aria-hidden="true" className="cv-glass" />
        {panels.map((panel, index) => {
          const tab = tabs[index];
          const next = tabs[(index + 1) % tabs.length];
          const selected = index === active;
          return (
            <div
              key={tab.id}
              ref={(node) => {
                panelRefs.current[index] = node;
              }}
              id={panelId(tab.id)}
              role={ready ? "tabpanel" : undefined}
              aria-labelledby={ready ? tabId(tab.id) : undefined}
              tabIndex={ready ? 0 : undefined}
              inert={ready && !selected}
              data-state={selected ? "active" : index === leaving ? "leaving" : undefined}
              className="cv-panel"
            >
              <div className="cv-panel-text">
                {panel.text}
                <a
                  href={`#${panelId(next.id)}`}
                  className="cv-step cv-next"
                  style={{ "--i": 4 } as CSSProperties}
                  onClick={(event) => {
                    if (!ready) return;
                    event.preventDefault();
                    // Focus sur l'onglet suivant : le panneau courant devient inerte.
                    go((index + 1) % tabs.length, { focus: true });
                  }}
                >
                  Conviction suivante : <span className="cv-next-word">{next.word}</span>
                  <ArrowRight aria-hidden="true" className="cv-next-arrow" />
                </a>
              </div>
              {panel.media}
            </div>
          );
        })}
      </div>
    </div>
  );
}
