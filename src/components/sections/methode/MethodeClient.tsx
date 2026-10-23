"use client";

import { motion, MotionConfig, useMotionValue, useScroll, useSpring, useTransform } from "motion/react";
import { memo, useCallback, useEffect, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent } from "react";

import { SectionMotifLayers } from "@/components/sections/expertises/SectionMotif";
import { WordsTitle } from "@/components/ui/WordsTitle";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { EASE } from "@/lib/motion";
import { METHODE_CARD_SIDE, METHODE_LAYERS, methodeEtapes, methodeIntro } from "@/lib/methode";

import { MethodeCta } from "./MethodeCta";
import { MethodeLayers, type LayerState } from "./MethodeLayers";
import { MethodeStepCard } from "./MethodeStepCard";

/*
 * Briques mémoïsées : leurs props ne changent pas pendant le parcours ou les survols, ce qui évite
 * de re-rendre titre, motif, cartes et bandeau à chaque changement d'étape (tâches longues en 4x).
 */
const Title = memo(WordsTitle);
const Motif = memo(SectionMotifLayers);
const StepCard = memo(MethodeStepCard);
const Cta = memo(MethodeCta);

const DESKTOP_QUERY = "(min-width: 64rem)";
/** Effets immersifs (inclinaison, parallaxes, magnétisme, lueur suiveuse) : desktop avec souris. */
const IMMERSIVE_QUERY = "(min-width: 64rem) and (pointer: fine)";
/** Palier court (paysage) : pas d'épinglage de la pile. Même seuil que la variante `short:`. */
const SHORT_QUERY = "(max-height: 32.499rem)";
/** Haut de la pile fixe (header de 72px + 8px) et marge sous la pile pour la bande de lecture. */
const STICKY_TOP = 80;
const BAND_GAP = 16;
/** Desktop : début de l'assemblage après le début de l'en-tête, puis étapes de la séquence (s). */
const ASSEMBLE_AFTER_HEADER = 1.2;
const NODES_AT = 1.1;
const TICKS_AT = 1.3;
const CARDS_AT = 1.4;
const TOUR_AT = 2.4;
const TOUR_STEP_MS = 700;
const TILT = 2;
const POINTER_SPRING = { stiffness: 120, damping: 20, mass: 0.6 } as const;

/** Mode économie de données (Chrome, Android) : pas d'effets immersifs. */
function useSaveData(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData),
    () => false,
  );
}

type Started = { header?: number; compo?: number; cta?: number };

/**
 * Contenu interactif de la section Méthode : en-tête, pile de couches et étapes, bandeau.
 * Desktop : composition à l'échelle (--u), séquence d'entrée puis parcours automatique, survol et
 * focus. Sous 1024px : pile sticky (CSS) au-dessus des étapes, étape active selon la lecture.
 * Un seul useScroll ; parallaxes et inclinaison en MotionValues, sans re-rendu React.
 */
export function MethodeClient() {
  const rootRef = useRef<HTMLDivElement>(null);
  const compoRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const reduce = usePrefersReducedMotion();
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const short = useMediaQuery(SHORT_QUERY);
  const finePointer = useMediaQuery(IMMERSIVE_QUERY);
  const saveData = useSaveData();
  const immersive = finePointer && !reduce && !saveData;

  const [started, setStarted] = useState<Started>({});
  const [appeared, setAppeared] = useState<readonly boolean[]>([false, false, false, false]);
  // Desktop : étape du parcours automatique (1 → 4, 0 hors parcours), interaction en cours, état « fait ».
  const [tourStep, setTourStep] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  // Focus clavier séparé du survol : une sortie du pointeur n'efface pas l'étape focalisée.
  const [focused, setFocused] = useState<number | null>(null);
  const [doneAll, setDoneAll] = useState(false);
  // Mobile : étape active selon la lecture (étape 1 avant tout défilement).
  const [mobileActive, setMobileActive] = useState(0);
  const tourTimers = useRef<number[]>([]);
  const desktopRef = useRef(desktop);
  useEffect(() => {
    desktopRef.current = desktop;
  }, [desktop]);

  // Défilement : un seul useScroll ; motif ±10px, lueur ±20px (desktop avec souris).
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start end", "end start"] });
  const centered = (value: number) => value * 2 - 1;
  const motifLeftY = useTransform(scrollYProgress, (v) => (immersive ? -centered(v) * 10 : 0));
  const motifRightY = useTransform(scrollYProgress, (v) => (immersive ? centered(v) * 10 : 0));
  const glowY = useTransform(scrollYProgress, (v) => (immersive ? centered(v) * 20 : 0));

  // Inclinaison de la pile et profondeur des couches : pointeur normalisé (-1 → 1) sur ressorts.
  const pointerX = useSpring(useMotionValue(0), POINTER_SPRING);
  const pointerY = useSpring(useMotionValue(0), POINTER_SPRING);
  const rotateY = useTransform(pointerX, (v) => v * TILT);
  const rotateX = useTransform(pointerY, (v) => -v * TILT);

  // Entrée, pause et apparition des cartes : un IntersectionObserver.
  useEffect(() => {
    const root = rootRef.current;
    const compo = compoRef.current;
    if (!root || !compo) return;
    let rootVisible = false;
    let headerAt = Number.NaN;
    const updatePaused = () => {
      root.dataset.paused = String(!rootVisible || document.hidden);
    };
    const observer = new IntersectionObserver(
      (entries) => {
        const now = performance.now() / 1000;
        const next: Started = {};
        const cards: number[] = [];
        for (const entry of entries) {
          const key = (entry.target as HTMLElement).dataset.observe;
          if (entry.target === root) {
            rootVisible = entry.isIntersecting;
            if (rootVisible && Number.isNaN(headerAt)) {
              headerAt = now;
              next.header = 0;
            }
          } else if (key === "compo") {
            // Desktop : composition visible à 30 % ; mobile : la scène (haute) dès qu'elle entre.
            const visible = desktopRef.current ? entry.intersectionRatio >= 0.3 : entry.isIntersecting;
            if (visible) {
              const base = Number.isNaN(headerAt) ? now : headerAt;
              next.compo = Math.max(0, base + ASSEMBLE_AFTER_HEADER - now);
              observer.unobserve(entry.target);
            }
          } else if (key === "cta" && entry.isIntersecting) {
            next.cta = 0;
            observer.unobserve(entry.target);
          } else if (key?.startsWith("step-") && entry.isIntersecting) {
            cards.push(Number(key.slice(5)));
            observer.unobserve(entry.target);
          }
        }
        updatePaused();
        if (Object.keys(next).length > 0) setStarted((current) => ({ ...next, ...current }));
        if (cards.length > 0) setAppeared((current) => current.map((value, index) => value || cards.includes(index)));
      },
      { rootMargin: "0px 0px -10% 0px", threshold: [0, 0.3] },
    );
    observer.observe(root);
    root.querySelectorAll<HTMLElement>("[data-observe]").forEach((element) => observer.observe(element));
    document.addEventListener("visibilitychange", updatePaused);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updatePaused);
    };
  }, []);

  // Desktop : parcours automatique, une seule fois, après l'assemblage (sauf animations réduites).
  const stopTour = useCallback(() => {
    tourTimers.current.forEach((timer) => window.clearTimeout(timer));
    tourTimers.current = [];
  }, []);
  useEffect(() => {
    if (!desktop || reduce || started.compo === undefined || doneAll) return;
    const start = (started.compo + TOUR_AT) * 1000;
    const timers = [1, 2, 3, 4].map((step) => window.setTimeout(() => setTourStep(step), start + (step - 1) * TOUR_STEP_MS));
    timers.push(
      window.setTimeout(() => {
        setTourStep(0);
        setDoneAll(true);
      }, start + 4 * TOUR_STEP_MS),
    );
    tourTimers.current = timers;
    return stopTour;
    // Le parcours ne démarre qu'une fois : `doneAll` passe à true à la fin ou à la première interaction.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [desktop, reduce, started.compo, stopTour]);

  // Mobile : étape active = la plus basse des étapes dont le haut de carte est dans la bande de lecture.
  useEffect(() => {
    if (desktop) return;
    let observer: IntersectionObserver | null = null;
    const inBand = new Set<number>();
    const connect = () => {
      observer?.disconnect();
      inBand.clear();
      const stackHeight = short ? 0 : (stackRef.current?.offsetHeight ?? 0);
      const top = short ? 0 : STICKY_TOP + stackHeight + BAND_GAP;
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const index = Number((entry.target as HTMLElement).dataset.cardTop);
            if (entry.isIntersecting) inBand.add(index);
            else inBand.delete(index);
          }
          // Ensemble vide : on conserve l'étape précédente (jamais de retour à zéro).
          if (inBand.size > 0) setMobileActive(Math.max(...inBand));
        },
        { rootMargin: `-${top}px 0px -45% 0px` },
      );
      // Haut de chaque carte : à l'aller, l'étape s'active quand sa carte atteint la bande ; au retour,
      // l'étape précédente reprend la main quand le haut de sa carte réapparaît sous la pile.
      rootRef.current?.querySelectorAll("[data-card-top]").forEach((element) => observer?.observe(element));
    };
    connect();
    window.addEventListener("resize", connect);
    return () => {
      observer?.disconnect();
      window.removeEventListener("resize", connect);
    };
  }, [desktop, short]);

  // Interactions desktop : survol d'une carte ou d'un nœud, ou focus d'un nœud ; interrompt le parcours.
  const interrupt = () => {
    stopTour();
    setTourStep(0);
    setDoneAll(true);
  };
  const hover = (index: number) => {
    if (!desktop) return;
    interrupt();
    setHovered(index);
  };
  const unhover = (index: number) => setHovered((current) => (current === index ? null : current));
  const focus = (index: number) => {
    if (!desktop) return;
    interrupt();
    setFocused(index);
  };
  const blur = (index: number) => setFocused((current) => (current === index ? null : current));
  const interacting = hovered ?? focused;

  const stateOf = (index: number): LayerState => {
    if (!desktop) return index === mobileActive ? "active" : index < mobileActive ? "done" : "upcoming";
    if (interacting === index) return "active";
    if (doneAll) return "done";
    if (tourStep > 0) return index < tourStep - 1 ? "done" : index === tourStep - 1 ? "active" : "rest";
    return "rest";
  };
  const states = methodeEtapes.map((_, index) => stateOf(index));

  const onCompoPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!immersive || event.pointerType !== "mouse") return;
    const box = event.currentTarget.getBoundingClientRect();
    pointerX.set(((event.clientX - box.left) / box.width) * 2 - 1);
    pointerY.set(((event.clientY - box.top) / box.height) * 2 - 1);
  };
  const onCompoPointerLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  const onNodeClick = (index: number) => {
    if (desktop) return;
    stepRefs.current[index]?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  };

  const headerOn = started.header !== undefined;
  const compoOn = started.compo !== undefined;
  const compoDelay = started.compo ?? 0;
  const at = (delay: number, duration = 0.6) =>
    reduce ? { duration: 0.4 } : { duration, delay, ease: EASE.reveal };

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={rootRef}
        data-paused="true"
        data-immersive={immersive}
        className="relative pt-24 pb-32 lg:pt-28"
      >
        {/* Filet doré du haut, tracé depuis le centre */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-gold/50 to-transparent"
          initial={{ scaleX: reduce ? 1 : 0, opacity: reduce ? 0 : 1 }}
          animate={headerOn ? { scaleX: 1, opacity: 1 } : undefined}
          transition={at(0, 0.8)}
        />

        {/* Motif du hero (variante claire) sur toute la section ; intensité --motif-strength-methode */}
        <div aria-hidden="true" className="methode-motif pointer-events-none absolute inset-0 z-0 overflow-clip">
          <motion.div
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={headerOn ? { opacity: 1 } : undefined}
            transition={reduce ? { duration: 0.4 } : { duration: 1.2, ease: "easeOut" }}
          >
            <Motif tone="light" leftY={motifLeftY} rightY={motifRightY} reduce={reduce} willChange={false} />
          </motion.div>
        </div>

        {/* Contenu au-dessus du motif, sans fond opaque ; marges identiques au header */}
        <div className="relative z-10 mx-auto max-w-site px-6 md:px-10 xl:px-28">
          <header>
            <p className="flex items-center gap-3 text-xs font-semibold tracking-eyebrow text-brand-navy uppercase">
              <motion.span
                aria-hidden="true"
                className="h-0.5 w-8 origin-left bg-brand-gold"
                initial={{ scaleX: reduce ? 1 : 0 }}
                animate={headerOn ? { scaleX: 1 } : undefined}
                transition={at(0.3)}
              />
              <motion.span initial={{ opacity: 0 }} animate={headerOn ? { opacity: 1 } : undefined} transition={at(0.4)}>
                {methodeIntro.eyebrow}
              </motion.span>
            </p>
            <Title
              id="methode-title"
              words={methodeIntro.titleWords}
              highlightClass="gold-ink-text"
              breakAfter={1}
              play={headerOn}
              reduce={reduce}
              delay={0.4}
              className="mt-6 text-display-section-sm font-extrabold tracking-display-tight text-brand-navy sm:text-display-wide sm:whitespace-nowrap"
            />
            <motion.p
              initial={{ opacity: 0, y: reduce ? 0 : 16 }}
              animate={headerOn ? { opacity: 1, y: 0 } : undefined}
              transition={at(1.0)}
              className="mt-5 max-w-160 text-lg leading-relaxed text-brand-navy/72"
            >
              {methodeIntro.intro}
            </motion.p>
          </header>

          {/* Composition : 1216 unités de large (--u), 1360px au plus, centrée */}
          <div
            ref={compoRef}
            data-observe="compo"
            onPointerMove={onCompoPointerMove}
            onPointerLeave={onCompoPointerLeave}
            className="methode-compo relative mx-auto mt-10 w-full max-w-340 lg:mt-14"
          >
            <div className="methode-stage relative">
              {/*
                Pile : sticky sous le header (mobile et tablette), en position absolue dans la
                composition en desktop. Fond opaque sous 1024px : les cartes passent dessous.
              */}
              <div
                ref={stackRef}
                // Pleine largeur sous 1024px (marges négatives) : le fond opaque ne laisse pas de bords visibles.
                className="sticky top-20 z-20 -mx-6 h-(--stack-h) bg-surface-warm max-lg:short:static md:-mx-10 lg:absolute lg:mx-0 lg:top-0 lg:left-[calc(var(--u)*248)] lg:z-auto lg:h-[calc(var(--u)*740)] lg:w-[calc(var(--u)*720)] lg:bg-transparent"
              >
                {/* Lueur dorée derrière la pile (rognée au bloc sous 1024px) */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0 max-lg:overflow-clip">
                  <motion.div className="methode-glow methode-parallax absolute" style={{ y: glowY }} />
                </div>

                <div className="relative mx-auto aspect-720/740 h-full max-w-full lg:w-full">
                  <motion.div
                    className="pointer-events-none size-full"
                    style={immersive ? { rotateX, rotateY, transformPerspective: 1200 } : undefined}
                  >
                    <MethodeLayers
                      key={desktop ? "desktop" : "mobile"}
                      states={states}
                      entered={desktop ? compoOn : headerOn}
                      entryDelay={compoDelay}
                      mobile={!desktop}
                      reduce={reduce}
                      pointerX={pointerX}
                      pointerY={pointerY}
                    />
                  </motion.div>

                  {/* Boutons des nœuds (44 × 44px) : focus et survol en desktop, défilement vers l'étape sous 1024px */}
                  {methodeEtapes.map((etape, index) => (
                    <motion.button
                      key={etape.id}
                      type="button"
                      aria-label={`Étape ${index + 1} : ${etape.titreComplet}`}
                      aria-controls={`methode-etape-${etape.id}`}
                      onClick={() => onNodeClick(index)}
                      onPointerEnter={(event) => event.pointerType === "mouse" && hover(index)}
                      onPointerLeave={() => unhover(index)}
                      onFocus={() => focus(index)}
                      onBlur={() => blur(index)}
                      initial={{ opacity: 0, scale: reduce ? 1 : 0.6 }}
                      animate={(desktop ? compoOn : headerOn) ? { opacity: 1, scale: 1 } : undefined}
                      transition={desktop ? at(compoDelay + NODES_AT + index * 0.06, 0.5) : at(0, 0.5)}
                      // Position du nœud en CSS (hors du style géré par Motion) : y = cy / 740 de la pile.
                      className="absolute top-[calc(var(--node-y)/740*100%)] left-1/2 size-11 -translate-1/2 cursor-pointer rounded-full"
                      style={{ "--node-y": METHODE_LAYERS[index + 1].cy } as CSSProperties}
                    />
                  ))}
                </div>

                {/* Fondu de 28px sous la pile fixe (mobile et tablette) */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-x-0 top-full h-7 bg-linear-to-b from-surface-warm to-transparent max-lg:short:hidden lg:hidden"
                />
              </div>

              {/* Traits d'union carte ↔ nœud (desktop) : base, puis calque doré en opacité */}
              {methodeEtapes.map((etape, index) => {
                const left = METHODE_CARD_SIDE[index] === "left";
                const active = states[index] === "active";
                return (
                  <motion.div
                    key={etape.id}
                    aria-hidden="true"
                    className={`pointer-events-none absolute hidden h-[calc(var(--u)*12)] w-[calc(var(--u)*292)] -translate-y-1/2 lg:block ${left ? "left-[calc(var(--u)*300)] origin-right" : "left-[calc(var(--u)*624)] origin-left"}`}
                    style={{ top: `calc(var(--u) * ${METHODE_LAYERS[index + 1].cy})` }}
                    initial={{ scaleX: reduce ? 1 : 0, opacity: reduce ? 0 : 1 }}
                    animate={compoOn ? { scaleX: 1, opacity: 1 } : undefined}
                    transition={at(compoDelay + TICKS_AT + index * 0.06)}
                  >
                    <span className="methode-tick absolute inset-0" />
                    <span className={`methode-tick-active absolute inset-0 transition-opacity duration-300 ${active ? "opacity-100" : "opacity-0"}`} />
                  </motion.div>
                );
              })}

              {/* Étapes : liste ordonnée ; frise et pastilles sous 1024px, cartes placées autour de la pile en desktop */}
              <ol className="methode-frise relative mt-8 flex flex-col gap-5 pl-12 md:mx-auto md:max-w-140 lg:static lg:mt-0 lg:block lg:max-w-none lg:bg-none lg:pl-0">
                {methodeEtapes.map((etape, index) => {
                  const left = METHODE_CARD_SIDE[index] === "left";
                  const state = states[index];
                  const active = state === "active";
                  const shown = desktop ? compoOn : appeared[index];
                  return (
                    <li
                      key={etape.id}
                      id={`methode-etape-${etape.id}`}
                      ref={(element) => {
                        stepRefs.current[index] = element;
                      }}
                      data-observe={`step-${index}`}
                      aria-current={active ? "step" : undefined}
                      onPointerEnter={(event) => event.pointerType === "mouse" && hover(index)}
                      onPointerLeave={() => unhover(index)}
                      // Desktop : centrée verticalement sur le nœud de son étape (CSS pur, sans attendre le JS).
                      className={`methode-step relative min-h-[clamp(160px,26svh,240px)] lg:absolute lg:top-[calc(var(--u)*var(--node-y))] lg:min-h-0 lg:w-[calc(var(--u)*300)] lg:-translate-y-1/2 ${left ? "lg:left-0" : "lg:right-0"}`}
                      style={{ "--node-y": METHODE_LAYERS[index + 1].cy } as CSSProperties}
                    >
                      {/* Pastille numérotée sur la frise (mobile et tablette) */}
                      <span
                        aria-hidden="true"
                        className={`absolute top-5 -left-12 flex size-7.5 items-center justify-center rounded-full text-xs font-extrabold transition-colors duration-300 lg:hidden ${active ? "bg-brand-gold text-brand-navy" : state === "done" ? "bg-brand-navy text-text-on-dark" : "border border-brand-navy/25 bg-surface text-brand-navy"}`}
                      >
                        {index + 1}
                      </span>
                      <motion.div
                        // Remonté quand le palier est connu : la bonne entrée (x en desktop, y sinon).
                        key={desktop ? "desktop" : "mobile"}
                        initial={{ opacity: 0, x: reduce || !desktop ? 0 : left ? -24 : 24, y: reduce || desktop ? 0 : 16 }}
                        animate={shown ? { opacity: 1, x: 0, y: 0 } : undefined}
                        transition={desktop ? at(compoDelay + CARDS_AT + index * 0.1) : at(0)}
                      >
                        <div className="relative">
                          {/* Repère du haut de la carte : bande de lecture (mobile) */}
                          <span data-card-top={index} aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-0.5" />
                          <StepCard etape={etape} active={active} />
                        </div>
                      </motion.div>
                    </li>
                  );
                })}
              </ol>
              <div aria-hidden="true" className="methode-stage-end lg:hidden" />
            </div>
          </div>

          <div data-observe="cta">
            <Cta revealed={started.cta !== undefined} reduce={reduce} immersive={immersive} />
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
