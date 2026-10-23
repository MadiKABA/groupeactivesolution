"use client";

import { motion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useEffect, useRef, useState } from "react";

import { useMediaQuery, usePrefersReducedMotion } from "@/hooks/useMediaQuery";

/** Même condition que la variante `desk:` : parallaxe réservée au desktop. */
const DESK_QUERY = "(min-width: 64rem) and (min-height: 35rem)";
const DRIFT = 20;

// Points reliés (positions fixes en % : rendu identique serveur / client) ; les 3 premiers restent sur mobile.
const points = [
  { x: 4, y: 22, duration: 6.2, delay: 0.3 },
  { x: 94, y: 30, duration: 7.1, delay: 1.8 },
  { x: 52, y: 58, duration: 5.8, delay: 2.6 },
  { x: 96, y: 84, duration: 6.6, delay: 0.9 },
  { x: 9, y: 46, duration: 7.4, delay: 3.4 },
  { x: 5, y: 76, duration: 6.0, delay: 1.2 },
] as const;
const MOBILE_POINTS = 3;
const links = [[0, 4], [4, 5], [1, 3], [2, 4], [1, 2]] as const;

export type MotifTone = "light" | "dark";
/**
 * Calques du motif textile (tuiles, chevrons, liaisons, points, reflet), sans état : le
 * conteneur (opacité, masque, pause) et la dérive verticale sont fournis par l'appelant.
 * `light` : traits dorés et bleu nuit sur fond clair ; `dark` : traits dorés seuls sur bleu nuit.
 */
export function SectionMotifLayers({
  tone,
  leftY,
  rightY,
  reduce,
  willChange = true,
}: {
  tone: MotifTone;
  leftY: MotionValue<number>;
  rightY: MotionValue<number>;
  reduce: boolean;
  /** `will-change` permanent en desktop ; false si l'appelant le gère (seulement à l'écran). */
  willChange?: boolean;
}) {
  const tile = `${tone === "light" ? "section-motif-tile" : "section-motif-tile-dark"}${willChange ? " desk:will-change-transform" : ""}`;
  return (
    <>
      {/* will-change en desktop : ces calques suivent le défilement en continu (sinon repeints à chaque image) */}
      <motion.div
        style={{ y: leftY }}
        className={`${tile} absolute -inset-y-10 left-0 w-1/2`}
      />
      <motion.div
        style={{ y: rightY }}
        className={`${tile} absolute -inset-y-10 right-0 w-1/2`}
      />

      {/* Grandes bandes de chevrons, discrètes, en haut et en bas de la section ; liaisons entre les points */}
      <svg className="absolute inset-0 size-full text-brand-gold" viewBox="0 0 100 100" preserveAspectRatio="none">
        {[8, 94].map((y) => (
          <polyline
            key={y}
            points={Array.from({ length: 21 }, (_, i) => `${i * 5},${y + (i % 2 ? 1.2 : -1.2)}`).join(" ")}
            fill="none"
            stroke="currentColor"
            strokeOpacity="0.07"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        ))}
        {links.map(([from, to]) => (
          <line
            key={`${from}-${to}`}
            x1={points[from].x}
            y1={points[from].y}
            x2={points[to].x}
            y2={points[to].y}
            stroke="currentColor"
            strokeOpacity="0.05"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            className={from >= MOBILE_POINTS || to >= MOBILE_POINTS ? "hidden desk:inline" : ""}
          />
        ))}
      </svg>

      {/* Reflet lumineux lent (10 s), fond clair uniquement : seuls des transforms sont animés */}
      {!reduce && tone === "light" && (
        <div className="absolute inset-0 overflow-hidden">
          <div
            className="absolute inset-y-0 left-0 w-1/3 animate-motif-band [mask-image:linear-gradient(to_right,transparent,black,transparent)]"
            style={{ animationDuration: "10s" }}
          >
            <div
              className="section-motif-tile-light absolute inset-y-0 left-0 w-[300%] animate-motif-band-inner"
              style={{ animationDuration: "10s" }}
            />
          </div>
        </div>
      )}

      {/* Scintillement 0.44 → 1, × 0.22 puis × l'opacité du conteneur (intensité du motif) */}
      <div className="absolute inset-0 opacity-22">
        {points.map((point, index) => (
          <span
            key={`${point.x}-${point.y}`}
            className={`absolute size-1.5 -translate-1/2 rounded-full bg-brand-gold opacity-44 motion-safe:animate-twinkle-soft ${index >= MOBILE_POINTS ? "hidden desk:block" : ""}`}
            style={{
              left: `${point.x}%`,
              top: `${point.y}%`,
              animationDuration: `${point.duration}s`,
              animationDelay: `${point.delay}s`,
            }}
          />
        ))}
      </div>
    </>
  );
}

/**
 * Motif textile du hero en version claire, sur toute la section (marges, entre les
 * colonnes, derrière le cadre et les textes). Animations suspendues hors écran ou onglet masqué.
 */
export function SectionMotif() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = usePrefersReducedMotion();
  const desk = useMediaQuery(DESK_QUERY);
  const [paused, setPaused] = useState(false);

  // Dérive verticale opposée des deux moitiés pendant le défilement de la section (desktop).
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const drift = !reduce && desk;
  const leftY = useTransform(scrollYProgress, (value) => (drift ? -value * DRIFT : 0));
  const rightY = useTransform(scrollYProgress, (value) => (drift ? value * DRIFT : 0));

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    let visible = true;
    const update = () => setPaused(!visible || document.hidden);
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      update();
    });
    observer.observe(element);
    document.addEventListener("visibilitychange", update);
    return () => {
      observer.disconnect();
      document.removeEventListener("visibilitychange", update);
    };
  }, []);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      data-paused={paused}
      // Opacité globale : `--motif-strength` seule, identique à toutes les largeurs (globals.css, `.expertises-section`).
      // z-0, premier enfant de la section (isolate) : derrière le contenu (z-10), devant le fond.
      className="section-motif-mask pointer-events-none absolute inset-0 z-0"
    >
      <SectionMotifLayers tone="light" leftY={leftY} rightY={rightY} reduce={reduce} />
    </div>
  );
}
