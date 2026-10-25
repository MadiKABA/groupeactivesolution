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
  type PointerEvent,
  type ReactNode,
} from "react";

import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";

export type TeamTab = { id: string; number: string; name: string };

// Courbe principale de la section (identique à --eq-ease de globals.css).
const EASE = "cubic-bezier(0.22, 0.7, 0.2, 1)";
const LINK_MS = 450;
// Séquence d'entrée (data-intro, animations CSS) : pastilles en cascade puis halo balayeur.
const INTRO_MS = 3200;
// Survol et parallaxe : tablette et desktop avec souris uniquement (même requête que globals.css).
const HOVER_MODE = "(min-width: 48rem) and (hover: hover) and (pointer: fine)";
// Carte à droite de la scène (trait de liaison) dès 1024px.
const DESK = "(min-width: 64rem)";

/*
 * Disposition de la scène, en unités du repère desktop (536 × 488) et mobile (350 × 218) :
 * coin haut gauche (x, y) et largeur (w) de chaque objet, coin de sa pastille (px, py),
 * profondeur de parallaxe (d). La hauteur suit le viewBox de l'objet (TeamObjects).
 * Repère desktop rogné : l'objet de gauche et sa pastille touchent x = 0 (bord du conteneur),
 * le plus haut y = 0 ; la largeur 536 est le bord droit de l'ordinateur.
 */
type Placement = { x: number; y: number; w: number; sx: number; sy: number; sw: number; px: number; py: number; d: number };
const LAYOUT: Record<string, Placement> = {
  former: { x: 0, y: 10, w: 222, sx: 32.1, sy: 20.1, sw: 115.8, px: 0, py: 188, d: 1 },
  developper: { x: 286, y: 0, w: 250, sx: 190, sy: 12.1, sw: 130, px: 292, py: 194, d: 0.7 },
  conseiller: { x: 0, y: 256, w: 222, sx: 32.1, sy: 121.2, sw: 115.8, px: 0, py: 436, d: 0.8 },
  accompagner: { x: 304, y: 256, w: 204, sx: 200.3, sy: 122.3, sw: 109.4, px: 310, py: 436, d: 0.6 },
};
// Savoir-faire sans disposition dédiée : pastille seule, en grille de deux colonnes.
const fallback = (index: number): Placement => ({
  x: 0, y: 0, w: 0, sx: 0, sy: 0, sw: 0,
  px: (index % 2) * 292,
  py: 188 + Math.floor(index / 2) * 248,
  d: 0,
});

const panelId = (id: string) => `equipe-${id}`;
const tabId = (id: string) => `equipe-${id}-tab`;

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

/*
 * Trait de liaison (desktop) : du bord droit de la pastille active au bord gauche de la carte.
 * Si une autre pastille se trouve sur le trajet (colonne de droite), le trait passe juste
 * au-dessus d'elle, dans l'espace libre sous les objets.
 */
function placeLink(board: HTMLElement, pins: readonly (HTMLElement | null)[], index: number, card: HTMLElement | null, path: SVGPathElement | null, dot: SVGCircleElement | null) {
  const pin = pins[index];
  if (!pin || !card || !path || !dot || !window.matchMedia(DESK).matches) return false;
  const p = offsetWithin(pin, board);
  const c = offsetWithin(card, board);
  const sx = p.x + pin.offsetWidth + 6;
  const sy = p.y + pin.offsetHeight / 2;
  const ex = c.x - 2;
  const ey = Math.min(Math.max(sy, c.y + 56), c.y + card.offsetHeight - 56);
  const blocking = pins
    .filter((other): other is HTMLElement => !!other && other !== pin)
    .map((other) => ({ ...offsetWithin(other, board), h: other.offsetHeight }))
    .filter((other) => other.x > sx && other.y - 12 < sy && other.y + other.h + 12 > sy);
  if (blocking.length > 0) {
    const lane = Math.min(...blocking.map((other) => other.y)) - 12;
    const x1 = Math.min(...blocking.map((other) => other.x)) - 24;
    const x2 = Math.max(x1 + 48, ex - 40);
    path.setAttribute(
      "d",
      `M${sx} ${sy}C${(sx + x1) / 2} ${sy} ${(sx + x1) / 2} ${lane} ${x1} ${lane}L${x2} ${lane}C${(x2 + ex) / 2} ${lane} ${(x2 + ex) / 2} ${ey} ${ex} ${ey}`,
    );
  } else {
    const mx = (sx + ex) / 2;
    path.setAttribute("d", `M${sx} ${sy}C${mx} ${sy} ${mx} ${ey} ${ex} ${ey}`);
  }
  dot.setAttribute("cx", `${ex}`);
  dot.setAttribute("cy", `${ey}`);
  return true;
}

/*
 * « L'établi » : objets de la scène, pastilles (motif WAI-ARIA Tabs, activation automatique)
 * et carte du savoir-faire. Les pastilles sont des liens d'ancre rendus au serveur : sans
 * JavaScript, elles mènent aux cartes empilées. Après l'hydratation, ce composant pose les
 * rôles, le tabindex itinérant et inert, et pilote l'invitation, le survol, la parallaxe,
 * le trait de liaison et le lien profond (#equipe-<id>). Le contenu des cartes et les objets
 * sont rendus par le Server Component parent.
 */
export function TeamWorkbench({
  heading,
  hintFine,
  hintTouch,
  skills,
  objects,
  scene,
  panels,
  devLabel,
}: {
  heading: ReactNode;
  hintFine: string;
  hintTouch: string;
  skills: readonly TeamTab[];
  objects: readonly ReactNode[];
  /** Rendu alternatif de la scène (vraie photo) : remplace les objets dessinés. */
  scene: ReactNode;
  panels: readonly ReactNode[];
  devLabel: string | null;
}) {
  const ready = useHydrated();
  const reduce = usePrefersReducedMotion();
  const hoverMode = useMediaQuery(HOVER_MODE);
  const [active, setActive] = useState(0);
  const [hover, setHover] = useState<number | null>(null);
  // Savoir-faire déjà ouverts (bits), en mémoire seulement : leur pastille ne pulse plus.
  const [seen, setSeen] = useState(0);
  const [interacted, setInteracted] = useState(false);
  // Hors mode survol, aucun état « survolé » n'est conservé.
  const hovered = hoverMode ? hover : null;

  const rootRef = useRef<HTMLDivElement>(null);
  const boardRef = useRef<HTMLDivElement>(null);
  const artRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const dotRef = useRef<SVGCircleElement>(null);
  const pinRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const activeRef = useRef(0);
  const animate = useRef(false);
  const running = useRef<Animation[]>([]);
  const frame = useRef(0);

  const markInteracted = (index = active) => {
    setInteracted(true);
    setSeen((bits) => bits | (1 << index));
  };

  // Mobile et tablette : si le haut de la carte n'est pas visible sous le header, on la ramène.
  const revealCard = () => {
    const card = cardRef.current;
    if (!card || window.matchMedia(DESK).matches) return;
    const rect = card.getBoundingClientRect();
    const margin = parseFloat(getComputedStyle(card).scrollMarginTop) || 0;
    if (rect.top >= margin && rect.top <= window.innerHeight - 120) return;
    card.scrollIntoView({ block: "nearest", behavior: reduce ? "instant" : "smooth" });
  };

  const go = (next: number, { focus = false, scroll = false } = {}) => {
    markInteracted();
    setSeen((bits) => bits | (1 << next));
    if (focus) pinRefs.current[next]?.focus();
    if (scroll) revealCard();
    if (next === active) return;
    animate.current = !reduce;
    setActive(next);
    // Lien profond sans empiler l'historique (l'état du routeur est conservé).
    window.history.replaceState(window.history.state, "", `#${panelId(skills[next].id)}`);
  };

  const onPinClick = (event: MouseEvent<HTMLAnchorElement>, index: number) => {
    if (!ready) return;
    event.preventDefault();
    go(index, { scroll: true });
  };

  // Flèches droite/bas : suivant ; gauche/haut : précédent ; Début, Fin. Entrée et Espace activent aussi.
  const onPinKeyDown = (event: KeyboardEvent<HTMLAnchorElement>, index: number) => {
    const last = skills.length - 1;
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

  // Parallaxe (±6px, CSS) : position du curseur dans la scène, de -1 à 1. Écouteur posé seulement en mode survol.
  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== "mouse") return;
    const board = event.currentTarget;
    const { clientX, clientY } = event;
    cancelAnimationFrame(frame.current);
    frame.current = requestAnimationFrame(() => {
      const art = artRef.current;
      if (!art) return;
      const rect = board.getBoundingClientRect();
      art.style.setProperty("--eq-px", (((clientX - rect.left) / rect.width) * 2 - 1).toFixed(3));
      art.style.setProperty("--eq-py", (((clientY - rect.top) / rect.height) * 2 - 1).toFixed(3));
    });
  };
  const onPointerLeave = () => {
    cancelAnimationFrame(frame.current);
    artRef.current?.style.setProperty("--eq-px", "0");
    artRef.current?.style.setProperty("--eq-py", "0");
    setHover(null);
  };

  // Survol d'un objet ou de sa pastille (mode survol uniquement) : l'objet se soulève, la pastille se dilate.
  const hoverProps = (index: number) =>
    hoverMode
      ? { onPointerEnter: () => setHover(index), onPointerLeave: () => setHover((current) => (current === index ? null : current)) }
      : {};

  // Changement de savoir-faire : trait de liaison recalé, puis tracé (450ms) s'il y a eu une action.
  useLayoutEffect(() => {
    activeRef.current = active;
    const board = boardRef.current;
    if (!board) return;
    running.current.forEach((animation) => animation.cancel());
    running.current = [];
    const placed = placeLink(board, pinRefs.current, active, cardRef.current, pathRef.current, dotRef.current);
    if (!placed || !animate.current || !pathRef.current || !dotRef.current) return;
    animate.current = false;
    running.current = [
      pathRef.current.animate([{ strokeDashoffset: 1 }, { strokeDashoffset: 0 }], { duration: LINK_MS, easing: EASE }),
      dotRef.current.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 150, delay: LINK_MS - 100, easing: EASE, fill: "backwards" }),
    ];
  }, [active]);

  // Montage : état d'entrée (sauf animations réduites), trait recalé à chaque redimensionnement.
  useLayoutEffect(() => {
    const root = rootRef.current;
    const board = boardRef.current;
    if (!root || !board) return;
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) root.setAttribute("data-js", "");
    const place = () => placeLink(board, pinRefs.current, activeRef.current, cardRef.current, pathRef.current, dotRef.current);
    const observer = new ResizeObserver(place);
    observer.observe(board);
    return () => observer.disconnect();
  }, []);

  /*
   * Un seul IntersectionObserver : entrée unique quand la section atteint les deux tiers haut de
   * l'écran (séquence d'invitation), puis data-playing suit la visibilité pour suspendre les boucles.
   */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let timer = 0;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry) return;
        root.toggleAttribute("data-playing", entry.isIntersecting);
        if (!entry.isIntersecting || root.hasAttribute("data-in")) return;
        root.setAttribute("data-in", "");
        if (!root.hasAttribute("data-js")) return;
        root.setAttribute("data-intro", "");
        timer = window.setTimeout(() => root.removeAttribute("data-intro"), INTRO_MS);
      },
      { rootMargin: "0px 0px -35% 0px" },
    );
    observer.observe(root);
    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  // Lien profond : #equipe-<id> au chargement (savoir-faire ouvert, section en haut) et à chaque changement de hash.
  const syncFromHash = useEffectEvent((initial: boolean) => {
    const hash = decodeURIComponent(window.location.hash);
    const index = skills.findIndex((skill) => `#${panelId(skill.id)}` === hash);
    if (index < 0) return;
    if (!initial) {
      go(index);
      return;
    }
    setActive(index);
    rootRef.current?.closest("section")?.scrollIntoView({ block: "start", behavior: "instant" });
  });

  useEffect(() => {
    const raf = requestAnimationFrame(() => syncFromHash(true));
    const onHashChange = () => syncFromHash(false);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  useEffect(() => () => cancelAnimationFrame(frame.current), []);

  const hint = (
    <span className="eq-hint-dot" aria-hidden="true">
      <span className="eq-hint-pulse" />
    </span>
  );

  return (
    <div ref={rootRef} className="eq-root" data-interacted={interacted || undefined}>
      <div className="eq-head">
        {heading}
        <p aria-hidden="true" className="eq-hint eq-hint-head">
          {hint}
          <span className="eq-hint-fine">{hintFine}</span>
          <span className="eq-hint-touch">{hintTouch}</span>
        </p>
      </div>

      <div
        ref={boardRef}
        className="eq-board"
        onPointerMove={hoverMode && !reduce ? onPointerMove : undefined}
        onPointerLeave={hoverMode ? onPointerLeave : undefined}
      >
        <div ref={artRef} className="eq-art">
          {scene ??
            skills.map((skill, index) => {
              const at = LAYOUT[skill.id];
              if (!at || !objects[index]) return null;
              return (
                // Objet décoratif : le clic délègue au savoir-faire (la pastille reste le seul élément focalisable).
                <div
                  key={skill.id}
                  aria-hidden="true"
                  className="eq-obj"
                  data-active={index === active || undefined}
                  data-hover={index === hovered || undefined}
                  style={{ "--x": at.x, "--y": at.y, "--w": at.w, "--sx": at.sx, "--sy": at.sy, "--sw": at.sw, "--d": at.d } as CSSProperties}
                  onClick={() => go(index, { scroll: true })}
                  {...hoverProps(index)}
                >
                  <span className="eq-floor" />
                  <div className="eq-lift">{objects[index]}</div>
                </div>
              );
            })}
        </div>
        {devLabel && (
          <p aria-hidden="true" className="eq-devlabel">
            {devLabel}
          </p>
        )}

        <p aria-hidden="true" className="eq-hint eq-hint-stage">
          {hint}
          <span>{hintTouch}</span>
        </p>

        <div
          role={ready ? "tablist" : undefined}
          aria-label={ready ? "Nos quatre savoir-faire" : undefined}
          className="eq-pins"
          onFocus={() => markInteracted()}
        >
          {skills.map((skill, index) => {
            const selected = index === active;
            const at = LAYOUT[skill.id] ?? fallback(index);
            return (
              <a
                key={skill.id}
                ref={(node) => {
                  pinRefs.current[index] = node;
                }}
                id={tabId(skill.id)}
                href={`#${panelId(skill.id)}`}
                role={ready ? "tab" : undefined}
                aria-selected={ready ? selected : undefined}
                aria-controls={ready ? panelId(skill.id) : undefined}
                tabIndex={ready ? (selected ? 0 : -1) : undefined}
                data-active={selected || undefined}
                data-seen={(seen >> index) & 1 ? true : undefined}
                data-hover={index === hovered || undefined}
                className="eq-pin"
                style={{ "--i": index, "--px": at.px, "--py": at.py } as CSSProperties}
                onClick={(event) => onPinClick(event, index)}
                onKeyDown={ready ? (event) => onPinKeyDown(event, index) : undefined}
                {...hoverProps(index)}
              >
                {/* Espace entre les parties : nom accessible « 01 Former » */}
                <span className="eq-pin-num">{skill.number}</span> <span className="eq-pin-name">{skill.name}</span>
                <span aria-hidden="true" className="eq-pin-mark">
                  <Plus className="eq-pin-plus" strokeWidth={2.25} />
                  <span className="eq-pin-dot" />
                </span>
              </a>
            );
          })}
        </div>

        <svg aria-hidden="true" className="eq-link">
          <path ref={pathRef} pathLength={1} className="eq-link-path" />
          <circle ref={dotRef} r="4" className="eq-link-dot" />
        </svg>

        <div ref={cardRef} className="eq-card">
          {panels.map((panel, index) => {
            const skill = skills[index];
            const next = skills[(index + 1) % skills.length];
            const selected = index === active;
            return (
              <div
                key={skill.id}
                id={panelId(skill.id)}
                role={ready ? "tabpanel" : undefined}
                aria-labelledby={ready ? tabId(skill.id) : undefined}
                tabIndex={ready ? 0 : undefined}
                inert={ready && !selected}
                data-active={selected || undefined}
                className="eq-panel"
              >
                {panel}
                <a
                  href={`#${panelId(next.id)}`}
                  className="eq-step eq-next"
                  style={{ "--i": 5 } as CSSProperties}
                  onClick={(event) => {
                    if (!ready) return;
                    event.preventDefault();
                    // Focus sur la pastille suivante : la carte courante devient inerte.
                    go((index + 1) % skills.length, { focus: true });
                  }}
                >
                  <span className="eq-next-lead">Savoir-faire suivant :</span>{" "}
                  <span className="eq-next-target">
                    <span className="eq-next-name">{next.name}</span>
                    <ArrowRight aria-hidden="true" className="eq-next-arrow" />
                  </span>
                </a>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
