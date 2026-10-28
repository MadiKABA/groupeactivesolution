"use client";

import { useEffect, useLayoutEffect, useRef, type MouseEvent, type ReactNode } from "react";

import { WaveMotif } from "@/components/ui/WaveMotif";
import { projectAnnouncement, realisations } from "@/lib/realisations";

const FINE_QUERY = "(hover: hover) and (pointer: fine)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";
/** Part visible de chaque cible qui déclenche sa séquence (ou la moitié de l'écran si elle est plus haute). */
const AMOUNTS = { a: 0.3, c: 0.4 } as const;
type Target = keyof typeof AMOUNTS;

const TIMING = { reducedFade: 200, reducedStagger: 60 } as const;
/** Projecteur et décalage au pointeur (bento, cadre de la scène). */
const LERP = 0.1;
const SPOT_RADIUS = 130;

/** Découpe locale d'un projet de la scène (avancement p de 0 à 1). */
const PHASE = { curtain: 0.12, panStart: 0.32, panEnd: 0.72 } as const;
/** Positions cibles des clics : photo A, photo B, début d'un projet (rideau terminé). */
const GOTO = { photoA: 0.2, photoB: 0.86, project: 0.14 } as const;
/** Chargement des photos d'un projet quand P dépasse k/3 − 0.15. */
const PRELOAD = 0.15;

const COUNT = realisations.length;
const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
const smoothstep = (value: number) => value * value * (3 - 2 * value);
const matches = (query: string) => window.matchMedia(query).matches;
const reduced = () => matches(REDUCED_QUERY);
const delayOf = (element: Element) => Number(element.getAttribute("data-d") ?? 0);
const shown = (element: Element) => element.getClientRects().length > 0;

type Mode = "scene" | "bento";

/**
 * Seule île client de la section. Pose des attributs et des variables CSS, sans état React :
 * entrée (data-js, data-in-a|c), visibilité (data-inview), tuile active ou survolée (bento),
 * scène pilotée par le défilement (--p, --c1, --c2, --t0..2, --y, data-active, data-photo, data-pinned).
 * Une seule boucle requestAnimationFrame, active seulement quand il y a quelque chose à calculer.
 */
export function RealisationsController({ mode, children }: { mode: Mode; children: ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null);
  /** Défilement vers un projet / une photo (scène), renseigné par l'effet de la scène. */
  const goTo = useRef<(k: number | null, photo: number | null) => void>(() => {});

  useLayoutEffect(() => {
    rootRef.current?.setAttribute("data-js", "");
  }, []);

  // Entrées (une fois chacune) et visibilité de la section : un seul IntersectionObserver.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let visible = false;
    const syncView = () => {
      const inView = visible && document.visibilityState === "visible";
      root.setAttribute("data-inview", String(inView));
      // Pause globale des boucles (règle [data-paused="true"] * de globals.css, motif compris).
      root.setAttribute("data-paused", String(!inView));
    };

    const start = (target: Target) => {
      root.setAttribute(`data-in-${target}`, "");
      if (!reduced()) return;
      // Fondus seuls, bloc par bloc dans l'ordre de la séquence (data-d).
      const items = [...root.querySelectorAll(target === "a" ? ".rz-a" : ".rz-closing, .rz-closing-line")].filter(shown);
      const blocks = [...new Set(items.map(delayOf))].sort((a, b) => a - b);
      items.forEach((item) =>
        item.animate([{ opacity: 0 }, { opacity: 1 }], {
          duration: TIMING.reducedFade,
          delay: blocks.indexOf(delayOf(item)) * TIMING.reducedStagger,
          easing: "ease-out",
          fill: "backwards",
        }),
      );
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const element = entry.target as HTMLElement;
          if (element === root) {
            visible = entry.isIntersecting;
            syncView();
            continue;
          }
          const target = element.dataset.rzTarget as Target;
          if (!entry.isIntersecting || root.hasAttribute(`data-in-${target}`)) continue;
          const screen = entry.rootBounds?.height ?? window.innerHeight;
          if (entry.intersectionRatio < AMOUNTS[target] && entry.intersectionRect.height < screen * 0.5) continue;
          start(target);
        }
      },
      { threshold: [0, 0.1, 0.2, 0.3, 0.4, 0.5] },
    );
    [root, ...root.querySelectorAll("[data-rz-target]")].forEach((element) => observer.observe(element));
    document.addEventListener("visibilitychange", syncView);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", syncView);
    };
  }, []);

  // ---------- Bento : survol (pointeur fin) ou tuile la plus visible (tactile) ----------
  useEffect(() => {
    const root = rootRef.current;
    if (mode !== "bento" || !root) return;
    const tiles = [...root.querySelectorAll<HTMLElement>("[data-rz-tile]")];
    const list = tiles[0]?.parentElement;
    if (!list) return;

    // Tactile : la tuile la plus visible dans la bande centrale de l'écran devient active. L'observateur ne sert
    // que de déclencheur : les 3 rectangles sont relus ensemble (les ratios des autres tuiles seraient périmés).
    const activeObserver = new IntersectionObserver(
      () => {
        if (matches(FINE_QUERY)) return;
        const bandTop = window.innerHeight * 0.3;
        const bandBottom = window.innerHeight * 0.7;
        let best: Element | null = null;
        let bestVisible = 0;
        for (const tile of tiles) {
          const rect = tile.getBoundingClientRect();
          const visible = Math.min(rect.bottom, bandBottom) - Math.max(rect.top, bandTop);
          if (visible > bestVisible) {
            best = tile;
            bestVisible = visible;
          }
        }
        tiles.forEach((tile) => tile.toggleAttribute("data-active", tile === best));
      },
      { rootMargin: "-30% 0px -30% 0px", threshold: [0, 0.2, 0.4, 0.6, 0.8, 1] },
    );
    tiles.forEach((tile) => activeObserver.observe(tile));

    // Pointeur fin : projecteur et décalage de l'illustration (±6px), lissés dans une boucle rAF.
    let tile: HTMLElement | null = null;
    let raf = 0;
    const state = {
      sx: 0,
      sy: 0,
      sxTo: 0,
      syTo: 0,
      mx: 0,
      my: 0,
      mxTo: 0,
      myTo: 0,
    };
    const frame = () => {
      raf = 0;
      if (!tile) return;
      const step = (from: number, to: number) => (Math.abs(to - from) < 0.05 ? to : from + (to - from) * LERP);
      state.sx = step(state.sx, state.sxTo);
      state.sy = step(state.sy, state.syTo);
      state.mx = step(state.mx, state.mxTo);
      state.my = step(state.my, state.myTo);
      tile.style.setProperty("--sx", `${(state.sx - SPOT_RADIUS).toFixed(1)}px`);
      tile.style.setProperty("--sy", `${(state.sy - SPOT_RADIUS).toFixed(1)}px`);
      tile.style.setProperty("--mx", state.mx.toFixed(3));
      tile.style.setProperty("--my", state.my.toFixed(3));
      if (state.sx !== state.sxTo || state.sy !== state.syTo || state.mx !== state.mxTo || state.my !== state.myTo) raf = requestAnimationFrame(frame);
    };
    const release = () => {
      tile?.style.removeProperty("--mx");
      tile?.style.removeProperty("--my");
      tile = null;
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !matches(FINE_QUERY) || reduced()) return;
      const next = (event.target as Element).closest<HTMLElement>("[data-rz-tile]");
      if (next !== tile) {
        release();
        tile = next;
        if (!tile) return;
        const box = tile.getBoundingClientRect();
        state.sx = event.clientX - box.left;
        state.sy = event.clientY - box.top;
        state.mx = 0;
        state.my = 0;
      }
      if (!tile) return;
      const box = tile.getBoundingClientRect();
      state.sxTo = event.clientX - box.left;
      state.syTo = event.clientY - box.top;
      state.mxTo = clamp01((event.clientX - box.left) / box.width) * 2 - 1;
      state.myTo = clamp01((event.clientY - box.top) / box.height) * 2 - 1;
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onLeave = () => {
      cancelAnimationFrame(raf);
      raf = 0;
      release();
    };
    list.addEventListener("pointermove", onMove, { passive: true });
    list.addEventListener("pointerleave", onLeave, { passive: true });
    return () => {
      activeObserver.disconnect();
      cancelAnimationFrame(raf);
      list.removeEventListener("pointermove", onMove);
      list.removeEventListener("pointerleave", onLeave);
    };
  }, [mode]);

  // ---------- Scène : progression P pilotée par le défilement ----------
  useEffect(() => {
    const root = rootRef.current;
    const scene = root?.querySelector<HTMLElement>(".rz-scene");
    const track = root?.querySelector<HTMLElement>(".rz-track");
    const stage = root?.querySelector<HTMLElement>(".rz-stage");
    const frameEl = root?.querySelector<HTMLElement>(".rz-frame");
    if (mode !== "scene" || !root || !scene || !track || !stage || !frameEl) return;
    const strips = [...stage.querySelectorAll<HTMLElement>(".rz-strip")];
    const infos = [...stage.querySelectorAll<HTMLElement>("[data-rz-k]")];
    const live = stage.querySelector<HTMLElement>("[data-rz-live]");
    const linkA = root.querySelector<HTMLElement>('[data-rz-link="a"]');
    const linkB = root.querySelector<HTMLElement>('[data-rz-link="b"]');
    const spot = frameEl.querySelector<HTMLElement>(".rz-frame-spot");
    const loaded = new Set<number>([0]);

    const active = () => shown(scene);
    let visible = false;
    let raf = 0;
    let scrollDirty = true;
    let current = { k: -1, photo: -1, pinned: false };
    const pointer = { on: false, sx: 0, sy: 0, sxTo: 0, syTo: 0 };
    const geometry = () => {
      const rect = track.getBoundingClientRect();
      const top = parseFloat(getComputedStyle(stage).top) || 0;
      return {
        rect,
        top,
        distance: Math.max(1, rect.height - stage.offsetHeight),
      };
    };

    const load = (k: number) => {
      if (loaded.has(k)) return;
      loaded.add(k);
      strips[k]?.querySelectorAll<HTMLImageElement>("img[data-src]").forEach((img) => {
        img.srcset = img.dataset.srcset ?? "";
        img.src = img.dataset.src ?? img.src;
        img.removeAttribute("data-src");
      });
    };

    const apply = (P: number, pinned: boolean) => {
      const local = (k: number) => clamp01(P * COUNT - k);
      const pan = (k: number) => smoothstep(clamp01((local(k) - PHASE.panStart) / (PHASE.panEnd - PHASE.panStart)));
      const curtain = (k: number) => clamp01(local(k) / PHASE.curtain);
      // Écritures groupées (après la seule lecture de géométrie de l'image) : 7 variables sur la scène.
      const vars: Record<string, number> = {
        "--p": P,
        "--c1": curtain(1),
        "--c2": curtain(2),
        "--t0": pan(0),
        "--t1": pan(1),
        "--t2": pan(2),
        "--y": (P * 2 - 1) * 2,
      };
      for (const [name, value] of Object.entries(vars)) stage.style.setProperty(name, value.toFixed(4));

      let k = 0;
      for (let index = COUNT - 1; index > 0; index -= 1) {
        if (P * COUNT - index >= PHASE.curtain / 2) {
          k = index;
          break;
        }
      }
      const photo = pan(k) >= 0.5 ? 1 : 0;
      for (let index = 1; index < COUNT; index += 1) if (P > index / COUNT - PRELOAD) load(index);

      if (k !== current.k) {
        stage.dataset.active = String(k);
        infos.forEach((element) => element.toggleAttribute("data-on", Number(element.dataset.rzK) === k));
        stage.querySelectorAll<HTMLElement>("button[data-goto-k]").forEach((button) => {
          if (Number(button.dataset.gotoK) === k) button.setAttribute("aria-current", "step");
          else button.removeAttribute("aria-current");
        });
        // Annonce au changement de projet seulement (pas au premier calcul).
        if (current.k !== -1 && live) live.textContent = projectAnnouncement(k + 1, COUNT, realisations[k].name);
      }
      if (photo !== current.photo) stage.dataset.photo = String(photo);
      if (pinned !== current.pinned) {
        root.toggleAttribute("data-pinned", pinned);
        // Un seul lien focusable à la fois : celui de l'intro, puis celui de la barre compacte.
        linkA?.toggleAttribute("inert", pinned);
        linkB?.toggleAttribute("inert", !pinned);
      }
      current = { k, photo, pinned };
    };

    const frame = () => {
      raf = 0;
      if (!active()) return;
      if (scrollDirty) {
        scrollDirty = false;
        const { rect, top, distance } = geometry();
        apply(clamp01((top - rect.top) / distance), rect.top <= top + 1);
      }
      if (pointer.on && spot) {
        const step = (from: number, to: number) => (Math.abs(to - from) < 0.5 ? to : from + (to - from) * LERP);
        pointer.sx = step(pointer.sx, pointer.sxTo);
        pointer.sy = step(pointer.sy, pointer.syTo);
        spot.style.transform = `translate3d(${(pointer.sx - SPOT_RADIUS).toFixed(1)}px, ${(pointer.sy - SPOT_RADIUS).toFixed(1)}px, 0)`;
        if (pointer.sx !== pointer.sxTo || pointer.sy !== pointer.syTo) raf = requestAnimationFrame(frame);
      }
    };
    const kick = () => {
      if (!raf) raf = requestAnimationFrame(frame);
    };
    const onScroll = () => {
      scrollDirty = true;
      kick();
    };
    const onResize = () => {
      scrollDirty = true;
      kick();
    };
    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse" || !matches(FINE_QUERY)) return;
      const box = frameEl.getBoundingClientRect();
      pointer.sxTo = event.clientX - box.left;
      pointer.syTo = event.clientY - box.top;
      if (!pointer.on) {
        pointer.on = true;
        pointer.sx = pointer.sxTo;
        pointer.sy = pointer.syTo;
        frameEl.setAttribute("data-spot", "");
      }
      kick();
    };
    const onPointerLeave = () => {
      pointer.on = false;
      frameEl.removeAttribute("data-spot");
    };

    // Piste visible : écouteur de défilement et will-change sur les 3 bandes ; scène à 25 % : rideau du projet 1.
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.target === stage) {
            if (entry.intersectionRatio >= 0.25 && active()) stage.setAttribute("data-arrived", "");
            continue;
          }
          visible = entry.isIntersecting;
          window.removeEventListener("scroll", onScroll);
          if (visible && active()) {
            window.addEventListener("scroll", onScroll, { passive: true });
            onScroll();
          }
          strips.forEach((strip) => strip.style.setProperty("will-change", visible && active() ? "transform, clip-path" : ""));
        }
      },
      { threshold: [0, 0.25] },
    );
    observer.observe(track);
    observer.observe(stage);

    // État initial : lien B inerte, projet 1 actif (même hors écran).
    if (active()) apply(0, false);

    goTo.current = (k, photo) => {
      const { rect, top, distance } = geometry();
      const target = k ?? current.k;
      const local = photo === null ? GOTO.project : photo === 0 ? GOTO.photoA : GOTO.photoB;
      const y = window.scrollY + rect.top - top + ((target + local) / COUNT) * distance;
      window.scrollTo({
        top: Math.round(y),
        behavior: reduced() ? "auto" : "smooth",
      });
    };

    window.addEventListener("resize", onResize, { passive: true });
    frameEl.addEventListener("pointermove", onPointerMove, { passive: true });
    frameEl.addEventListener("pointerleave", onPointerLeave, { passive: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      frameEl.removeEventListener("pointermove", onPointerMove);
      frameEl.removeEventListener("pointerleave", onPointerLeave);
    };
  }, [mode]);

  // Rail, pastilles et points (boutons rendus au serveur) : délégation d'événements.
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const button = (event.target as Element).closest<HTMLElement>("[data-goto-k], [data-goto-photo]");
    if (!button) return;
    const { gotoK, gotoPhoto } = button.dataset;
    goTo.current(gotoK === undefined ? null : Number(gotoK), gotoPhoto === undefined ? null : Number(gotoPhoto));
  };

  return (
    // Délégation des clics : les cibles sont de vrais <button> (clavier natif).
    <div ref={rootRef} onClick={onClick} className="rz-root relative pt-18 pb-24 lg:pt-28 lg:pb-32">
      {/* Liseré doré du haut, halo bleu en haut à gauche */}
      <div aria-hidden="true" className="rz-topline absolute inset-x-0 top-0 h-px" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-clip">
        <div className="realisations-glow-blue absolute" />
      </div>

      {/* Zigzag doré (fond sombre, statique) sur tout le fond */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 overflow-clip">
        <WaveMotif tone="dark" mask="full" />
      </div>

      <div className="relative z-10 mx-auto max-w-site px-6 md:px-10 xl:px-28">{children}</div>
    </div>
  );
}
