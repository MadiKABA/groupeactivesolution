"use client";

import { motion, MotionConfig, useMotionValue, useScroll, useSpring, useTransform, type Transition } from "motion/react";
import { memo, useEffect, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type PointerEvent } from "react";

import { SectionMotifLayers } from "@/components/sections/expertises/SectionMotif";
import { WordsTitle } from "@/components/ui/WordsTitle";
import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { EASE } from "@/lib/motion";
import { METHODE_CARD_SIDE, METHODE_LAYERS, methodeEtapes, methodeIntro } from "@/lib/methode";

import { MethodeCta } from "./MethodeCta";
import { MethodeLayers, type LayerState, type PileTiming } from "./MethodeLayers";
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
/** Desktop : part visible de la composition qui déclenche sa séquence (ou 60 % de l'écran si elle est plus haute). */
const COMPO_AMOUNT = 0.4;
/** Mobile : part visible d'une étape qui révèle sa carte. */
const CARD_AMOUNT = 0.25;
/**
 * Séquences d'entrée (s), jouées une fois, depuis le déclenchement de leur bloc.
 * Desktop : la pile s'assemble, puis chaque étape i (0 → 3) à firstStep + i × stepInterval :
 * nœud, traits, couche active, carte ; à l'étape suivante, la couche passe à « fait ».
 * Animations réduites (desktop) : fondus seuls, un élément à la fois — pile, puis liaison
 * (nœud et traits) et carte de chaque étape, un fondu toutes les fade + gap.
 * Mobile : pile à l'entrée de la scène, chaque carte à son passage.
 */
const SEQUENCE_DELAYS = {
  desktop: {
    layerDuration: 0.7,
    layerStagger: 0.1,
    firstStep: 0.8,
    stepInterval: 0.6,
    node: 0,
    nodeDuration: 0.35,
    ticks: 0.1,
    ticksDuration: 0.35,
    active: 0.2,
    card: 0.3,
    cardDuration: 0.5,
  },
  reduced: { fade: 0.25, gap: 0.2 },
  mobile: { layerDuration: 0.7, layerStagger: 0.08, nodeDuration: 0.5, cardDuration: 0.5 },
} as const;
const STEP_INDEXES = [0, 1, 2, 3] as const;
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

type Timeline = {
  pile: PileTiming;
  node: (index: number) => Transition;
  tick: (index: number) => Transition;
  card: (index: number) => Transition;
  /** Desktop : instants d'activation des étapes 1 → 4, puis de l'état « fait » de toutes (s). */
  tour: { steps: readonly number[]; done: number } | null;
};

/** Transitions de la composition, toutes tirées de SEQUENCE_DELAYS. */
function buildTimeline(desktop: boolean, reduce: boolean): Timeline {
  const { desktop: d, reduced: r, mobile: m } = SEQUENCE_DELAYS;
  const ease = EASE.reveal;
  if (!desktop) {
    const fade = reduce ? { duration: r.fade } : null;
    return {
      pile: { duration: fade ? r.fade : m.layerDuration, stagger: fade ? 0 : m.layerStagger, nodeDelays: null, nodeDuration: 0 },
      node: () => fade ?? { duration: m.nodeDuration, ease },
      tick: () => ({ duration: 0 }),
      card: () => fade ?? { duration: m.cardDuration, ease },
      tour: null,
    };
  }
  if (reduce) {
    const slot = (index: number) => ({ duration: r.fade, delay: index * (r.fade + r.gap) });
    const liaison = (index: number) => slot(1 + 2 * index);
    return {
      pile: { duration: r.fade, stagger: 0, nodeDelays: STEP_INDEXES.map((index) => liaison(index).delay), nodeDuration: r.fade },
      node: liaison,
      tick: liaison,
      card: (index) => slot(2 + 2 * index),
      tour: { steps: [], done: slot(8).delay },
    };
  }
  const step = (index: number) => d.firstStep + index * d.stepInterval;
  return {
    pile: { duration: d.layerDuration, stagger: d.layerStagger, nodeDelays: STEP_INDEXES.map((index) => step(index) + d.node), nodeDuration: d.nodeDuration },
    node: (index) => ({ duration: d.nodeDuration, delay: step(index) + d.node, ease }),
    tick: (index) => ({ duration: d.ticksDuration, delay: step(index) + d.ticks, ease }),
    card: (index) => ({ duration: d.cardDuration, delay: step(index) + d.card, ease }),
    tour: { steps: STEP_INDEXES.map((index) => step(index) + d.active), done: step(4) + d.active },
  };
}

/*
 * Sans JavaScript : annule l'état initial invisible posé en ligne par Motion (blocs marqués
 * data-reveal et mots du titre).
 */
const NOSCRIPT_STYLE =
  "<style>.methode-section [data-reveal],#methode-title>span>span{opacity:1!important;transform:none!important}</style>";

/**
 * Contenu interactif de la section Méthode : en-tête, pile de couches et étapes, bandeau.
 * Desktop : composition à l'échelle (--u), séquence d'entrée (pile, puis les étapes une par une),
 * survol et focus. Sous 1024px : pile sticky (CSS) au-dessus des étapes, étape active selon la lecture.
 * Un observateur par bloc (en-tête, composition, cartes mobiles, bandeau), joué une fois.
 * Un seul useScroll ; parallaxes et inclinaison en MotionValues, sans re-rendu React.
 */
export function MethodeClient() {
  const rootRef = useRef<HTMLDivElement>(null);
  const compoRef = useRef<HTMLDivElement>(null);
  const stackRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLLIElement | null)[]>([]);
  const reduce = usePrefersReducedMotion();
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const short = useMediaQuery(SHORT_QUERY);
  const finePointer = useMediaQuery(IMMERSIVE_QUERY);
  const saveData = useSaveData();
  const immersive = finePointer && !reduce && !saveData;

  const [headerOn, setHeaderOn] = useState(false);
  const [compoOn, setCompoOn] = useState(false);
  const [ctaOn, setCtaOn] = useState(false);
  const [appeared, setAppeared] = useState<readonly boolean[]>([false, false, false, false]);
  // Desktop : étape de la séquence (1 → 4, 0 hors séquence), interaction en cours, état « fait ».
  const [tourStep, setTourStep] = useState(0);
  const [hovered, setHovered] = useState<number | null>(null);
  // Focus clavier séparé du survol : une sortie du pointeur n'efface pas l'étape focalisée.
  const [focused, setFocused] = useState<number | null>(null);
  const [doneAll, setDoneAll] = useState(false);
  // Mobile : étape active selon la lecture (étape 1 avant tout défilement).
  const [mobileActive, setMobileActive] = useState(0);
  const timeline = useMemo(() => buildTimeline(desktop, reduce), [desktop, reduce]);

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

  // En-tête et pause : la section entre à l'écran.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let rootVisible = false;
    const updatePaused = () => {
      root.dataset.paused = String(!rootVisible || document.hidden);
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        rootVisible = entry.isIntersecting;
        if (rootVisible) setHeaderOn(true);
        updatePaused();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(root);
    document.addEventListener("visibilitychange", updatePaused);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updatePaused);
    };
  }, []);

  // Composition : desktop, visible à 40 % (ou sur 60 % de l'écran) ; mobile, la scène dès qu'elle entre.
  useEffect(() => {
    const compo = compoRef.current;
    if (!compo) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        const screen = entry.rootBounds?.height ?? window.innerHeight;
        const visible = window.matchMedia(DESKTOP_QUERY).matches
          ? entry.intersectionRatio >= COMPO_AMOUNT || entry.intersectionRect.height >= screen * 0.6
          : entry.isIntersecting;
        if (!visible) return;
        setCompoOn(true);
        observer.disconnect();
      },
      { threshold: [0, 0.1, 0.2, 0.3, COMPO_AMOUNT] },
    );
    observer.observe(compo);
    return () => observer.disconnect();
  }, []);

  // Cartes (mobile) : chacune à son passage, une seule fois.
  useEffect(() => {
    const steps = stepRefs.current.filter((element): element is HTMLLIElement => element !== null);
    const observer = new IntersectionObserver(
      (entries) => {
        const cards: number[] = [];
        for (const entry of entries) {
          if (entry.intersectionRatio < CARD_AMOUNT) continue;
          cards.push(steps.indexOf(entry.target as HTMLLIElement));
          observer.unobserve(entry.target);
        }
        if (cards.length > 0) setAppeared((current) => current.map((value, index) => value || cards.includes(index)));
      },
      { threshold: CARD_AMOUNT },
    );
    steps.forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, []);

  // Bandeau : à son entrée à l'écran.
  useEffect(() => {
    const cta = ctaRef.current;
    if (!cta) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setCtaOn(true);
        observer.disconnect();
      },
      { rootMargin: "0px 0px -10% 0px" },
    );
    observer.observe(cta);
    return () => observer.disconnect();
  }, []);

  // Desktop : étape active de la séquence, au plus 4 activations puis l'état « fait », une seule fois.
  // Aucune interaction ne l'interrompt ni ne l'accélère ; les timers ne sont nettoyés qu'au démontage.
  useEffect(() => {
    if (!compoOn || doneAll || !timeline.tour) return;
    const { steps, done } = timeline.tour;
    const timers = steps.map((at, index) => window.setTimeout(() => setTourStep(index + 1), at * 1000));
    timers.push(
      window.setTimeout(() => {
        setTourStep(0);
        setDoneAll(true);
      }, done * 1000),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [compoOn, doneAll, timeline.tour]);

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

  // Interactions desktop : survol d'une carte ou d'un nœud, ou focus d'un nœud ; la séquence continue.
  const hover = (index: number) => {
    if (desktop) setHovered(index);
  };
  const unhover = (index: number) => setHovered((current) => (current === index ? null : current));
  const focus = (index: number) => {
    if (desktop) setFocused(index);
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
        <noscript dangerouslySetInnerHTML={{ __html: NOSCRIPT_STYLE }} />
        {/* Filet doré du haut, tracé depuis le centre */}
        <motion.div
          data-reveal
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-gold/50 to-transparent"
          initial={{ scaleX: reduce ? 1 : 0, opacity: reduce ? 0 : 1 }}
          animate={headerOn ? { scaleX: 1, opacity: 1 } : undefined}
          transition={at(0, 0.8)}
        />

        {/* Motif du hero (variante claire) sur toute la section ; intensité --motif-strength-methode */}
        <div aria-hidden="true" className="methode-motif pointer-events-none absolute inset-0 z-0 overflow-clip">
          <motion.div
            data-reveal
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
                data-reveal
                aria-hidden="true"
                className="h-0.5 w-8 origin-left bg-brand-gold"
                initial={{ scaleX: reduce ? 1 : 0 }}
                animate={headerOn ? { scaleX: 1 } : undefined}
                transition={at(0.3)}
              />
              <motion.span data-reveal initial={{ opacity: 0 }} animate={headerOn ? { opacity: 1 } : undefined} transition={at(0.4)}>
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
              data-reveal
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
                      entered={compoOn}
                      timing={timeline.pile}
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
                      data-reveal
                      initial={{ opacity: 0, scale: reduce ? 1 : 0.6 }}
                      animate={compoOn ? { opacity: 1, scale: 1 } : undefined}
                      transition={timeline.node(index)}
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
                    data-reveal
                    aria-hidden="true"
                    className={`pointer-events-none absolute hidden h-[calc(var(--u)*12)] w-[calc(var(--u)*292)] -translate-y-1/2 lg:block ${left ? "left-[calc(var(--u)*300)] origin-right" : "left-[calc(var(--u)*624)] origin-left"}`}
                    style={{ top: `calc(var(--u) * ${METHODE_LAYERS[index + 1].cy})` }}
                    initial={{ scaleX: reduce ? 1 : 0, opacity: reduce ? 0 : 1 }}
                    animate={compoOn ? { scaleX: 1, opacity: 1 } : undefined}
                    transition={timeline.tick(index)}
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
                      aria-current={active ? "step" : undefined}
                      onPointerEnter={(event) => event.pointerType === "mouse" && hover(index)}
                      onPointerLeave={() => unhover(index)}
                      // Desktop : centrée verticalement sur le nœud de son étape (CSS pur, sans attendre le JS).
                      className={`methode-step relative min-h-[clamp(160px,26svh,240px)] last:min-h-0 lg:absolute lg:top-[calc(var(--u)*var(--node-y))] lg:min-h-0 lg:w-[calc(var(--u)*300)] lg:-translate-y-1/2 ${left ? "lg:left-0" : "lg:right-0"}`}
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
                        data-reveal
                        initial={{ opacity: 0, x: reduce || !desktop ? 0 : left ? -24 : 24, y: reduce || desktop ? 0 : 16 }}
                        animate={shown ? { opacity: 1, x: 0, y: 0 } : undefined}
                        transition={timeline.card(index)}
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
            </div>
          </div>

          {/* Au-dessus du fondu de la pile (mobile) quand celle-ci est libérée */}
          <div ref={ctaRef} className="relative z-30">
            <Cta revealed={ctaOn} reduce={reduce} immersive={immersive} />
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
