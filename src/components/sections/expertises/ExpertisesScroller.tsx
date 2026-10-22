"use client";

import {
  motion,
  motionValue,
  MotionConfig,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { getImageProps } from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent } from "react";

import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { expertises } from "@/lib/expertises";

import { EXPERTISE_IMAGE_QUALITY, EXPERTISE_IMAGE_SIZES } from "./ExpertiseImage";
import { ExpertisePanel, type BlockState } from "./ExpertisePanel";
import { ExpertiseVisual } from "./ExpertiseVisual";

const FRAME_SHIFT = 8;
const IMAGE_PARALLAX = 20;
// Après un focus clavier, le bloc focalisé reste actif le temps du défilement automatique.
const FOCUS_LOCK_MS = 800;
// Fréquence maximale de mise à jour du hash (#expertise-…).
const HASH_THROTTLE_MS = 250;
// Ligne d'activation en mobile : 35 % de la zone libre sous le visuel fixe.
const MOBILE_LINE_RATIO = 0.35;

type Tier = "a" | "b" | "c";
type Slide = { index: number; direction: 1 | -1 };
/** Mesures lues dans le DOM (palier défini en CSS, position du bas du visuel). */
type Layout = { tier: Tier; line: number; viewport: number };

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

/**
 * Partie interactive de la section : palier (lu dans le CSS), bloc actif
 * (IntersectionObserver), progression, visuel sticky, navigation et liens profonds.
 * Le défilement reste natif : aucun écouteur de scroll manuel.
 */
export function ExpertisesScroller({ images }: { images: readonly (string | null)[] }) {
  const reduce = usePrefersReducedMotion();
  const finePointer = useMediaQuery("(hover: hover) and (pointer: fine)");
  const count = expertises.length;

  const stageRef = useRef<HTMLDivElement>(null);
  const visualRef = useRef<HTMLDivElement>(null);
  const blocksRef = useRef<HTMLDivElement>(null);
  const articles = useRef<(HTMLElement | null)[]>([]);
  const focusedAt = useRef(0);

  const [layout, setLayout] = useState<Layout>({ tier: "c", line: 0, viewport: 0 });
  const [{ index: activeIndex, direction }, setSlide] = useState<Slide>({ index: 0, direction: 1 });
  const desktop = layout.tier === "a";
  const sticky = layout.tier !== "c";

  const activate = useCallback((index: number) => {
    setSlide((current) =>
      current.index === index ? current : { index, direction: index > current.index ? 1 : -1 },
    );
  }, []);

  // Palier et ligne d'activation, mesurés dans le DOM (resize + taille réelle du visuel).
  useEffect(() => {
    const stage = stageRef.current;
    const visual = visualRef.current;
    if (!stage || !visual) return;
    const measure = () => {
      const tier = getComputedStyle(stage).getPropertyValue("--tier").trim() as Tier;
      const viewport = window.innerHeight;
      let line = viewport / 2;
      if (tier === "b") {
        const top = parseFloat(getComputedStyle(visual).top);
        const imageBottom = (Number.isFinite(top) ? top : 0) + visual.offsetHeight;
        line = imageBottom + (viewport - imageBottom) * MOBILE_LINE_RATIO;
      }
      // Ligne toujours dans l'écran (marge d'IntersectionObserver valide quoi qu'il arrive).
      line = Math.round(Math.min(Math.max(line, 1), viewport - 1));
      setLayout((current) =>
        current.tier === tier && current.line === line && current.viewport === viewport
          ? current
          : { tier, line, viewport },
      );
    };
    measure();
    const resizeObserver = new ResizeObserver(measure);
    resizeObserver.observe(visual);
    window.addEventListener("resize", measure);
    return () => {
      resizeObserver.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, []);

  // Un seul IntersectionObserver : le bloc qui franchit la ligne d'activation devient actif.
  useEffect(() => {
    if (!sticky || !layout.viewport || !Number.isFinite(layout.line)) return;
    // Desktop : bande centrale (40 % / 40 %). Mobile : ligne de 1px sous le visuel fixe.
    const rootMargin = desktop
      ? "-40% 0px -40% 0px"
      : `-${Math.max(0, layout.line)}px 0px -${Math.max(0, layout.viewport - layout.line - 1)}px 0px`;
    const line = desktop ? layout.viewport / 2 : layout.line;
    const observer = new IntersectionObserver(
      (entries) => {
        if (performance.now() - focusedAt.current < FOCUS_LOCK_MS) return;
        // Plusieurs blocs peuvent être dans la bande : on retient celui qui contient la ligne.
        const onLine = articles.current.findIndex((article) => {
          const rect = article?.getBoundingClientRect();
          return rect ? rect.top <= line && rect.bottom > line : false;
        });
        if (onLine >= 0) return activate(onLine);
        const entering = entries.find((entry) => entry.isIntersecting);
        if (entering) activate(Number((entering.target as HTMLElement).dataset.index));
      },
      { rootMargin },
    );
    for (const article of articles.current) if (article) observer.observe(article);
    return () => observer.disconnect();
  }, [sticky, desktop, layout.line, layout.viewport, activate]);

  // Progression le long des blocs, calée sur la ligne d'activation.
  const linePercent = layout.viewport ? Math.round((layout.line / layout.viewport) * 1000) / 10 : 50;
  const anchor = desktop ? 55 : linePercent;
  const { scrollYProgress } = useScroll({
    target: blocksRef,
    offset: [`start ${anchor}%`, `end ${anchor}%`],
  });

  // Desktop : ligne dorée lissée ; avec animations réduites, elle suit le bloc actif.
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const steppedProgress = useMotionValue(0.5 / count);
  useEffect(() => {
    steppedProgress.set((activeIndex + 0.5) / count);
  }, [activeIndex, count, steppedProgress]);

  // Mobile : progression de chaque segment, dérivée de la progression globale et des
  // bornes réelles des blocs (MotionValues : aucun re-rendu pendant le défilement).
  const segments = useMemo(() => expertises.map(() => motionValue(0)), []);
  const updateSegments = useCallback(
    (value: number) => {
      const container = blocksRef.current;
      if (!container) return;
      const height = container.offsetHeight || 1;
      articles.current.forEach((article, index) => {
        if (!article) return;
        const start = article.offsetTop / height;
        const end = (article.offsetTop + article.offsetHeight) / height;
        segments[index].set(clamp01((value - start) / Math.max(end - start, 0.0001)));
      });
    },
    [segments],
  );
  useMotionValueEvent(scrollYProgress, "change", updateSegments);
  useEffect(() => updateSegments(scrollYProgress.get()), [layout, scrollYProgress, updateSegments]);

  const parallaxY = useTransform(scrollYProgress, (value) =>
    reduce || !desktop ? 0 : IMAGE_PARALLAX - value * IMAGE_PARALLAX * 2,
  );

  // Parallaxe souris du cadre (desktop, souris).
  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const frameX = useSpring(useTransform(pointerX, (v) => v * FRAME_SHIFT), { stiffness: 80, damping: 20 });
  const frameY = useSpring(useTransform(pointerY, (v) => v * FRAME_SHIFT), { stiffness: 80, damping: 20 });
  const parallax = desktop && finePointer && !reduce;
  const onMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (!parallax) return;
    pointerX.set((event.clientX / window.innerWidth) * 2 - 1);
    pointerY.set((event.clientY / window.innerHeight) * 2 - 1);
  };
  const onMouseLeave = () => {
    pointerX.set(0);
    pointerY.set(0);
  };

  // Préchargement de l'image suivante uniquement, en basse priorité (sauf économie de données).
  useEffect(() => {
    if (!sticky) return;
    const connection = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    if (connection?.saveData) return;
    const src = images[activeIndex + 1];
    if (!src) return;
    const { props } = getImageProps({
      src,
      alt: "",
      fill: true,
      sizes: EXPERTISE_IMAGE_SIZES,
      quality: EXPERTISE_IMAGE_QUALITY,
    });
    const img = new window.Image();
    img.fetchPriority = "low";
    img.decoding = "async";
    if (props.sizes) img.sizes = props.sizes;
    if (props.srcSet) img.srcset = props.srcSet;
    img.src = props.src;
  }, [sticky, activeIndex, images]);

  // Liens profonds : #expertise-<slug> suit le bloc actif (sans historique ni saut de page).
  const hashTimer = useRef<number | undefined>(undefined);
  const hasChanged = useRef(false);
  useEffect(() => {
    if (!hasChanged.current) {
      hasChanged.current = true;
      return;
    }
    window.clearTimeout(hashTimer.current);
    hashTimer.current = window.setTimeout(() => {
      const hash = `#expertise-${expertises[activeIndex].slug}`;
      if (window.location.hash !== hash) window.history.replaceState(null, "", hash);
    }, HASH_THROTTLE_MS);
    return () => window.clearTimeout(hashTimer.current);
  }, [activeIndex]);

  // Hash retiré quand la section quitte l'écran (par le haut ou par le bas).
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting || !window.location.hash.startsWith("#expertise-")) return;
      window.clearTimeout(hashTimer.current);
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const navigate = (index: number) =>
    articles.current[index]?.scrollIntoView({
      block: desktop ? "center" : "start",
      behavior: reduce ? "auto" : "smooth",
    });

  const blockState = (index: number): BlockState =>
    index === activeIndex ? "active" : index < activeIndex ? "passed" : "upcoming";

  return (
    <MotionConfig reducedMotion="user">
      {/*
        Scène : visuel sticky + blocs + espace bas de la section, dans un seul conteneur
        qui s'étend jusqu'à la fin de la section. Aucun parent n'a d'overflow hidden/auto/scroll.
      */}
      <div
        ref={stageRef}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="expertise-stage mt-16 flex flex-col lg:mt-24 desk:grid desk:grid-cols-[minmax(0,45fr)_minmax(0,55fr)] desk:items-start desk:gap-x-(--stage-gap)"
      >
        {/*
          Blocs de texte : premiers dans le DOM, colonne de droite en desktop, sous le visuel
          ailleurs. L'espace bas (padding de la section) prolonge la scène.
        */}
        <div className="desk:col-start-2 desk:row-start-1">
          {/* Les blocs remplissent la colonne (55 %), la ligne dorée sur son bord gauche */}
          <div ref={blocksRef} className="relative flex flex-col short:gap-16 desk:pl-10">
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 hidden w-0.5 overflow-hidden rounded-full bg-brand-navy/12 desk:block"
            >
              <motion.div
                className="size-full origin-top bg-brand-gold"
                style={{ scaleY: reduce ? steppedProgress : smoothProgress }}
              />
            </div>

            {expertises.map((expertise, index) => (
              <ExpertisePanel
                key={expertise.slug}
                expertise={expertise}
                index={index}
                total={count}
                imageSrc={images[index]}
                state={sticky ? blockState(index) : "active"}
                desktop={desktop}
                lit={index <= activeIndex}
                reduce={reduce}
                articleRef={(element) => {
                  articles.current[index] = element;
                }}
                onActivate={() => {
                  focusedAt.current = performance.now();
                  activate(index);
                }}
                onNavigate={() => navigate(index)}
              />
            ))}
          </div>
          {/* Desktop : assez d'espace pour que le cadre reste collé jusqu'au centrage du dernier bloc */}
          <div
            aria-hidden="true"
            className="h-24 desk:h-[max(8rem,calc(50svh-2rem-min(30svh,16.875rem)))]"
          />
        </div>

        {/*
          Visuel sticky, enfant direct de la scène : à gauche en desktop (alternance avec
          le hero), en haut ailleurs (fond de la section + fondu de 28px sous son bord).
        */}
        <div
          ref={visualRef}
          className="z-20 order-first short:hidden mob:sticky mob:top-[calc(var(--sticky-top)-0.5rem)] mob:-mx-2 mob:bg-surface-warm mob:pt-2 md:mob:-mx-6 desk:sticky desk:top-(--sticky-top) desk:col-start-1 desk:row-start-1 desk:self-start"
        >
          <ExpertiseVisual
            activeIndex={activeIndex}
            direction={direction}
            images={images}
            reduce={reduce}
            desktop={desktop}
            parallaxY={parallaxY}
            offsetX={parallax ? frameX : pointerX}
            offsetY={parallax ? frameY : pointerY}
            segments={segments}
            onNavigate={navigate}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-full h-7 bg-linear-to-b from-surface-warm to-transparent desk:hidden"
          />
        </div>
      </div>
    </MotionConfig>
  );
}
