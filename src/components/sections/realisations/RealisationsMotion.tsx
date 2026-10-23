"use client";

import { ArrowRight } from "lucide-react";
import { motion, MotionConfig, useMotionValueEvent, useScroll, useTransform } from "motion/react";
import Link from "next/link";
import { Fragment, useEffect, useRef, useState, useSyncExternalStore, type PointerEvent } from "react";

import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";
import { EASE } from "@/lib/motion";
import { genericAlt, realisationsIntro, realisationVisuels } from "@/lib/realisations";

import { RealisationCard } from "./RealisationCard";

/** Effets immersifs (parallaxe, projecteur, inclinaison) : desktop avec souris. */
const IMMERSIVE_QUERY = "(min-width: 64rem) and (pointer: fine)";
const DESKTOP_QUERY = "(min-width: 64rem)";
/** Photos : seuil de visibilité, décalage entre elles et délai minimal après le début de la séquence (s). */
const IMAGE_RATIO = 0.25;
const STAGGER = 0.15;
const PHOTOS_AFTER = 1.0;
/** Lissage du projecteur et seuil d'arrêt du calcul (px). */
const LERP = 0.12;
const SETTLE = 0.5;

const IMAGE_KEYS = ["principale", "secondaire-1", "secondaire-2"] as const;
type RevealKey = "section" | (typeof IMAGE_KEYS)[number];
/** Délai (s) de chaque élément déjà déclenché. */
type Reveals = Partial<Record<RevealKey, number>>;

const SIZES = {
  main: "(min-width:1024px) 66vw, 100vw",
  secondary: "(min-width:1024px) 33vw, 50vw",
} as const;

/** Mode économie de données (Chrome, Android) : pas d'effets immersifs. */
function useSaveData(): boolean {
  return useSyncExternalStore(
    () => () => {},
    () => Boolean((navigator as Navigator & { connection?: { saveData?: boolean } }).connection?.saveData),
    () => false,
  );
}

/**
 * Mot en dégradé doré et reflet unique (1.2 s). Le reflet n'anime que des transforms :
 * une fenêtre aux bords fondus traverse le mot pendant que la copie claire qu'elle contient
 * glisse en sens inverse et reste en place.
 */
function GradientWord({ text, shine, play, delay }: { text: string; shine: boolean; play: boolean; delay: number }) {
  const transition = { duration: 1.2, delay, ease: "easeInOut" } as const;
  return (
    <span className="relative inline-block">
      <span className="hero-gradient-text">{text}</span>
      {shine && (
        <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
          <motion.span
            className="absolute inset-y-0 left-0 w-2/5 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black,transparent)]"
            initial={{ x: "-100%" }}
            animate={play ? { x: "250%" } : undefined}
            transition={transition}
          >
            <motion.span
              className="absolute inset-y-0 left-0 w-[250%] text-text-on-dark/60"
              initial={{ x: "40%" }}
              animate={play ? { x: "-100%" } : undefined}
              transition={transition}
            >
              {text}
            </motion.span>
          </motion.span>
        </span>
      )}
    </span>
  );
}

/** Lien « Voir toutes nos réalisations » : soulignement tracé et cercle doré qui pivote au survol / focus. */
function ProofLink({ className = "" }: { className?: string }) {
  const { link } = realisationsIntro;
  return (
    <Link
      href={link.href}
      className={`group inline-flex min-h-12 items-center gap-4 rounded-sm text-base font-semibold whitespace-nowrap text-text-on-dark ${className}`}
    >
      <span className="relative pb-1">
        {link.label}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 rounded-full bg-brand-gold transition-transform duration-(--duration-slow) ease-standard group-hover:scale-x-100 group-focus-visible:scale-x-100"
        />
      </span>
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-gold text-brand-navy transition-transform duration-(--duration-slow) ease-standard group-hover:-rotate-45 group-focus-visible:-rotate-45"
      >
        <ArrowRight className="size-4" />
      </span>
    </Link>
  );
}

/**
 * Contenu animé de la section Réalisations. Un seul useScroll (parallaxe : valeurs dérivées
 * sans re-rendu), un seul IntersectionObserver (séquence d'entrée, rideaux, pause des boucles) ;
 * le projecteur écrit deux variables CSS par requestAnimationFrame, sans état React.
 */
export function RealisationsMotion({ images }: { images: readonly (string | null)[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const spotRef = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const desktop = useMediaQuery(DESKTOP_QUERY);
  const finePointer = useMediaQuery(IMMERSIVE_QUERY);
  const saveData = useSaveData();
  const immersive = finePointer && !reduce && !saveData;
  const [reveals, setReveals] = useState<Reveals>({});

  // Progression 0 → 1 de la section dans l'écran ; toutes les parallaxes en dérivent.
  const { scrollYProgress } = useScroll({ target: rootRef, offset: ["start end", "end start"] });
  const centered = (value: number) => value * 2 - 1;
  // Image surdimensionnée à 108 % : ±3.7 % de sa hauteur ≈ ±4 % du cadre, sans bord vide.
  const mainInnerY = useTransform(scrollYProgress, (v) => (immersive ? `${centered(v) * 3.7}%` : "0%"));
  const firstY = useTransform(scrollYProgress, (v) => (immersive ? -centered(v) * 20 : 0));
  const secondY = useTransform(scrollYProgress, (v) => (immersive ? centered(v) * 20 : 0));
  const gridY = useTransform(scrollYProgress, (v) => (immersive ? centered(v) * 10 : 0));

  // Séquence d'entrée, rideaux (25 % visibles) et pause : un seul IntersectionObserver.
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    let rootVisible = false;
    let sequenceStart = Number.NaN;
    let lastStart = -Infinity;
    const done = new Set<RevealKey>();

    const updatePaused = () => {
      root.dataset.paused = String(!rootVisible || document.hidden);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        const now = performance.now() / 1000;
        const updates: Reveals = {};
        for (const entry of entries) {
          if (entry.target === root) {
            rootVisible = entry.isIntersecting;
            if (rootVisible && !done.has("section")) {
              done.add("section");
              sequenceStart = now;
              updates.section = 0;
            }
            continue;
          }
          const key = (entry.target as HTMLElement).dataset.reveal as (typeof IMAGE_KEYS)[number];
          const imageIndex = IMAGE_KEYS.indexOf(key);
          if (imageIndex === -1 || entry.intersectionRatio < IMAGE_RATIO) continue;
          // Ordre garanti : principale, secondaire-1, secondaire-2, après l'en-tête.
          for (const previous of IMAGE_KEYS.slice(0, imageIndex + 1)) {
            if (done.has(previous)) continue;
            const start = Math.max(now, (Number.isNaN(sequenceStart) ? now : sequenceStart) + PHOTOS_AFTER, lastStart + STAGGER);
            lastStart = start;
            done.add(previous);
            updates[previous] = start - now;
          }
          observer.unobserve(entry.target);
        }
        updatePaused();
        if (Object.keys(updates).length > 0) setReveals((current) => ({ ...current, ...updates }));
      },
      { rootMargin: "0px 0px -10% 0px", threshold: [0, IMAGE_RATIO] },
    );

    observer.observe(root);
    root.querySelectorAll<HTMLElement>("[data-reveal]").forEach((element) => observer.observe(element));
    document.addEventListener("visibilitychange", updatePaused);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", updatePaused);
    };
  }, []);

  // Projecteur : cible = curseur dans la couche de grille, rattrapée par lissage (rAF).
  const pointer = useRef({ clientX: 0, clientY: 0, inside: false });
  const spot = useRef({ x: 0, y: 0, tx: 0, ty: 0, frame: 0, primed: false });

  const step = () => {
    const s = spot.current;
    const element = spotRef.current;
    s.x += (s.tx - s.x) * LERP;
    s.y += (s.ty - s.y) * LERP;
    const settled = Math.abs(s.tx - s.x) < SETTLE && Math.abs(s.ty - s.y) < SETTLE;
    if (settled) {
      s.x = s.tx;
      s.y = s.ty;
    }
    element?.style.setProperty("--sx", `${s.x.toFixed(1)}px`);
    element?.style.setProperty("--sy", `${s.y.toFixed(1)}px`);
    s.frame = settled ? 0 : requestAnimationFrame(step);
  };

  const aim = () => {
    const element = spotRef.current;
    if (!element || !pointer.current.inside) return;
    const box = element.getBoundingClientRect();
    const s = spot.current;
    s.tx = pointer.current.clientX - box.left;
    s.ty = pointer.current.clientY - box.top;
    if (!s.primed) {
      // Première position : pas de balayage depuis l'origine.
      s.x = s.tx;
      s.y = s.ty;
      s.primed = true;
    }
    if (!s.frame) s.frame = requestAnimationFrame(step);
  };

  // Le défilement déplace la grille sous un curseur immobile : même cible recalculée.
  useMotionValueEvent(scrollYProgress, "change", () => {
    if (immersive) aim();
  });

  useEffect(() => () => cancelAnimationFrame(spot.current.frame), []);

  const onPointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (!immersive || event.pointerType !== "mouse") return;
    pointer.current = { clientX: event.clientX, clientY: event.clientY, inside: true };
    if (spotRef.current) spotRef.current.dataset.on = "true";
    aim();
  };
  const onPointerLeave = () => {
    pointer.current.inside = false;
    spot.current.primed = false;
    if (spotRef.current) spotRef.current.dataset.on = "false";
  };

  // Rappel en développement tant que les textes alternatifs sont génériques.
  useEffect(() => {
    if (process.env.NODE_ENV === "production") return;
    for (const visuel of realisationVisuels) {
      if (visuel.alt === genericAlt(visuel.categorie)) {
        console.warn(`[Réalisations] Texte alternatif générique pour « ${visuel.fichier} » : à compléter dans src/lib/realisations.ts.`);
      }
    }
  }, []);

  const started = reveals.section !== undefined;
  const isRevealed = (key: RevealKey) => reveals[key] !== undefined;
  const at = (delay: number, duration = 0.6) => ({ duration: reduce ? 0.4 : duration, delay: reduce ? 0 : delay, ease: EASE.reveal });
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    animate: started ? { opacity: 1, y: 0 } : undefined,
    transition: at(delay),
  });
  const card = (index: number) => {
    const visuel = realisationVisuels[index];
    return {
      visuel,
      src: images[index] ?? null,
      revealed: isRevealed(visuel.id),
      delay: reveals[visuel.id] ?? 0,
      reduce,
      desktop,
      immersive,
    };
  };

  const { titleWords } = realisationsIntro;
  const lastWord = titleWords.length - 1;
  const wordDelay = (index: number) => 0.6 + index * 0.08;

  return (
    <MotionConfig reducedMotion="user">
      <div
        ref={rootRef}
        data-paused="true"
        data-immersive={immersive}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="relative pt-24 pb-32 lg:pt-28"
      >
        {/* 1. Filet doré du haut, tracé du centre vers les bords */}
        <motion.div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-brand-gold/40 to-transparent"
          initial={{ scaleX: reduce ? 1 : 0, opacity: reduce ? 0 : 1 }}
          animate={started ? { scaleX: 1, opacity: 1 } : undefined}
          transition={at(0, 0.8)}
        />

        {/* Lueur bleue en haut à gauche, rognée à la section (décalée de -240px, elle débordait sur « Nos expertises ») */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-clip">
          <div className="realisations-glow-blue absolute" />
        </div>

        {/* 2. Grille dorée (bande droite), intensité --motif-grid-strength appliquée une seule fois */}
        <div aria-hidden="true" className="realisations-grid pointer-events-none absolute inset-y-0 right-0 z-0 overflow-clip">
          <motion.div
            className="absolute inset-x-0 -inset-y-3"
            style={{ y: gridY }}
            initial={{ opacity: 0, scale: reduce ? 1 : 1.04 }}
            animate={started ? { opacity: 1, scale: 1 } : undefined}
            transition={at(0.2, 1.2)}
          >
            <div className="realisations-grid-lines absolute inset-0" />
            {/* Reflet doré diagonal unique : fenêtre qui traverse, contenu qui glisse en sens inverse */}
            {!reduce && (
              <motion.div
                className="absolute inset-y-0 left-0 w-1/3 overflow-hidden [mask-image:linear-gradient(105deg,transparent,black,transparent)]"
                initial={{ x: "-100%" }}
                animate={started ? { x: "300%" } : undefined}
                transition={{ duration: 1.4, delay: 0.8, ease: "easeInOut" }}
              >
                <motion.div
                  className="realisations-grid-lines realisations-grid-bright absolute inset-y-0 left-0 w-[300%]"
                  initial={{ x: "33.333%" }}
                  animate={started ? { x: "-100%" } : undefined}
                  transition={{ duration: 1.4, delay: 0.8, ease: "easeInOut" }}
                />
              </motion.div>
            )}
            {/* Projecteur : grille lumineuse dans un rayon de 280px autour du curseur */}
            {immersive && (
              <div ref={spotRef} data-on="false" className="realisations-grid-lines realisations-grid-bright realisations-spotlight absolute inset-0" />
            )}
          </motion.div>
        </div>

        {/* Contenu au-dessus du motif, sans fond opaque ; marges identiques au header */}
        <div className="relative z-10 mx-auto max-w-site px-6 md:px-10 xl:px-28">
          <header>
            {/* 3. Trait doré de 32px et libellé */}
            <p className="flex items-center gap-3 text-xs font-semibold tracking-eyebrow text-brand-gold uppercase">
              <motion.span
                aria-hidden="true"
                className="h-0.5 w-8 origin-left bg-brand-gold"
                initial={{ scaleX: reduce ? 1 : 0 }}
                animate={started ? { scaleX: 1 } : undefined}
                transition={at(0.4)}
              />
              <motion.span initial={{ opacity: 0 }} animate={started ? { opacity: 1 } : undefined} transition={at(0.5)}>
                {realisationsIntro.eyebrow}
              </motion.span>
            </p>

            {/* 4. Titre : une ligne dès 640px ; mots révélés depuis un masque */}
            <h2
              id="realisations-title"
              className="mt-6 text-display-section-sm font-extrabold tracking-display-tight text-text-on-dark sm:text-display-wide sm:whitespace-nowrap"
            >
              {titleWords.map((word, index) => (
                <Fragment key={word}>
                  <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-top">
                    <motion.span
                      className="inline-block"
                      initial={{ y: reduce ? 0 : "110%", opacity: reduce ? 0 : 1 }}
                      animate={started ? { y: 0, opacity: 1 } : undefined}
                      transition={at(wordDelay(index), 0.9)}
                    >
                      {index === lastWord ? (
                        <GradientWord text={word} shine={!reduce} play={started} delay={wordDelay(lastWord) + 0.9} />
                      ) : (
                        word
                      )}
                    </motion.span>
                  </span>
                  {index === 1 && <br className="sm:hidden" />}
                  {index < lastWord && " "}
                </Fragment>
              ))}
            </h2>

            {/* 5. Introduction à gauche, lien à droite (desktop) */}
            <div className="mt-6 lg:flex lg:items-center lg:justify-between lg:gap-10">
              <motion.p {...rise(1.3)} className="max-w-140 text-lg leading-relaxed text-text-on-dark/78">
                {realisationsIntro.intro}
              </motion.p>
              <motion.div {...rise(1.4)} className="hidden shrink-0 lg:block">
                <ProofLink />
              </motion.div>
            </div>
          </header>

          {/* Bento : 12 colonnes en desktop (lignes de 23cqw), 2 colonnes en dessous */}
          <div className="realisations-bento relative mt-10 lg:mt-14">
            <div aria-hidden="true" className="realisations-glow-gold pointer-events-none absolute" />
            <div className="realisations-bento-grid relative grid grid-cols-2 gap-x-4 gap-y-8 lg:grid-cols-12 lg:gap-5">
              <div data-reveal="principale" className="col-span-2 lg:col-span-8 lg:row-span-2">
                <RealisationCard {...card(0)} main sizes={SIZES.main} innerY={immersive ? mainInnerY : undefined} className="lg:h-full" />
              </div>
              <div data-reveal="secondaire-1" className="col-start-1 lg:col-span-4 lg:col-start-9 lg:row-start-1">
                <RealisationCard {...card(1)} sizes={SIZES.secondary} y={firstY} className="lg:h-full" />
              </div>
              <div data-reveal="secondaire-2" className="col-start-2 mt-8 lg:col-span-4 lg:col-start-9 lg:row-start-2 lg:mt-0">
                <RealisationCard {...card(2)} sizes={SIZES.secondary} y={secondY} className="lg:h-full" />
              </div>

              {/* Lien sous les photos, dernier élément (mobile et tablette) */}
              <motion.div {...rise(1.4)} className="col-span-2 lg:hidden">
                <ProofLink className="w-full justify-between" />
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </MotionConfig>
  );
}
