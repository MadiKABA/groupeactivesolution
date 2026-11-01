"use client";

import {
  LazyMotion,
  domAnimation,
  m,
  useInView,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  type Transition,
} from "motion/react";
import Image from "next/image";
import { useRef, useState } from "react";

import { demarrerIntro, demarrerSteps, type DemarrerStep } from "@/content/formations-ecole-demarrer";
import { useReducedMotionSafe } from "@/lib/use-reduced-motion-safe";

/*
 * « Comment démarrer » : repère, titre, introduction, plan des quatre étapes et tracé doré.
 * Motion (LazyMotion + domAnimation, composants `m`, strict) réservé à cette section.
 * Le tracé suit le défilement (useScroll → useSpring → pathLength) ; une étape apparaît quand le tracé
 * l'atteint (seuils 0, 0.22, 0.45, 0.59), une seule fois. Desktop (≥ 1024px) : plan 1152 × 578 en
 * unités `--u` ; dessous : plaques empilées et ligne verticale (scaleY). Éléments à état initial caché
 * marqués `data-reveal` (repli sans JavaScript dans formations-ecole-demarrer.tsx).
 */

const EASE = [0.22, 1, 0.36, 1] as const;
const THRESHOLDS = [0, 0.22, 0.45, 0.59] as const;
// Nœuds du tracé, dans le repère de la section (1280 × 976)
const NODES = [
  [64, 524],
  [420, 439],
  [880, 439],
  [880, 724],
] as const;

function StepNumber({ value, className = "" }: { value: string; className?: string }) {
  return (
    <span className={`dm-number ${className}`} aria-hidden="true">
      {value}
    </span>
  );
}

export function DemarrerParcours() {
  const reduce = useReducedMotionSafe();
  const planRef = useRef<HTMLOListElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.4 });
  const planInView = useInView(planRef, { once: true, amount: 0.15 });
  const [reached, setReached] = useState(-1);

  const { scrollYProgress } = useScroll({ target: planRef, offset: ["start 70%", "end 55%"] });
  const smooth = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });
  const drawn = useTransform(smooth, [0, 1], [0, 1]);

  // « Étape atteinte » : ne change qu'au franchissement d'un seuil et ne redescend jamais
  useMotionValueEvent(smooth, "change", (progress) => {
    const step = stepFor(progress);
    setReached((previous) => (step > previous ? step : previous));
  });

  // Plaque 01 dès l'entrée du plan (arrivée en milieu de section : le ressort rattrape la progression)
  const current = planInView ? Math.max(reached, 0) : reached;

  const shownHeader = reduce || headerInView;
  const isReached = (index: number) => reduce || current >= index;
  const tween = (duration: number, delay = 0): Transition => (reduce ? { duration: 0 } : { duration, delay, ease: EASE });
  const hover = reduce ? undefined : { y: -4, transition: { type: "spring" as const, stiffness: 300, damping: 24 } };

  const renderBody = (step: DemarrerStep, index: number) => {
    if (step.kind === "keywords") {
      return <p className="dm-keywords">{step.keywords.join(" · ")}</p>;
    }
    if (step.kind === "list") {
      return (
        <ul className="dm-list">
          {step.items.map((item, i) => (
            <m.li
              key={item}
              data-reveal=""
              initial={{ opacity: 0, x: -8 }}
              animate={isReached(index) ? { opacity: 1, x: 0 } : { opacity: 0, x: -8 }}
              transition={tween(0.5, 0.15 + i * 0.12)}
            >
              {item}
            </m.li>
          ))}
        </ul>
      );
    }
    return <p className="dm-text">{step.text}</p>;
  };

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="dm-root site-container">
        <header ref={headerRef} className="dm-header">
          <p className="dm-mark">
            <m.span
              className="dm-mark-line"
              aria-hidden="true"
              data-reveal=""
              initial={{ scaleX: 0 }}
              animate={{ scaleX: shownHeader ? 1 : 0 }}
              transition={tween(0.5)}
            />
            {demarrerIntro.eyebrow}
          </p>
          <h2 id="demarrer-title" className="dm-title">
            {demarrerIntro.titleLines.map((line, i) => (
              <span key={line} className="dm-line">
                <m.span
                  className={i === 1 ? "dm-line-inner dm-gold" : "dm-line-inner"}
                  data-reveal=""
                  initial={{ opacity: 0, y: 24 }}
                  animate={shownHeader ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                  transition={tween(0.65, 0.08 + i * 0.08)}
                >
                  {line}
                </m.span>{" "}
              </span>
            ))}
          </h2>
          <m.p
            className="dm-intro"
            data-reveal=""
            initial={{ opacity: 0, y: 12 }}
            animate={shownHeader ? { opacity: 1, y: 0 } : { opacity: 0, y: 12 }}
            transition={tween(0.5, 0.3)}
          >
            {demarrerIntro.text}
          </m.p>
        </header>

        <div className="dm-plan">
          {/* Desktop : tracé à angles droits derrière les plaques (repère de la section, rogné au plan) */}
          <svg className="dm-trace" viewBox="64 320 1152 578" aria-hidden="true" focusable="false">
            <m.path
              className="dm-trace-path"
              d="M64 524 H420 V439 H880 V724 H64"
              style={{ pathLength: reduce ? 1 : drawn }}
            />
            {NODES.map(([cx, cy], index) => (
              <g key={`${cx}-${cy}`}>
                <circle className="dm-node" cx={cx} cy={cy} r={5} />
                <m.circle
                  className="dm-node-on"
                  cx={cx}
                  cy={cy}
                  r={5}
                  data-reveal=""
                  initial={{ opacity: 0, scale: 0.6 }}
                  animate={isReached(index) ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.6 }}
                  transition={tween(0.4)}
                />
              </g>
            ))}
          </svg>

          {/* Mobile et tablette : ligne verticale qui se dessine vers le bas */}
          <m.span
            className="dm-rail"
            aria-hidden="true"
            data-reveal=""
            style={{ scaleY: reduce ? 1 : drawn }}
          />

          <ol ref={planRef} className="dm-steps">
            {demarrerSteps.map((step, index) => (
              <m.li
                key={step.id}
                className={`dm-step dm-step-${index + 1}`}
                data-reveal=""
                initial={{ opacity: 0, y: 24 }}
                animate={isReached(index) ? { opacity: 1, y: 0 } : { opacity: 0, y: 24 }}
                transition={tween(0.6)}
                whileHover={hover}
              >
                <span className="dm-step-shadow" aria-hidden="true" />
                <span className="dm-step-node" aria-hidden="true" />

                {step.kind === "text" && index === 1 ? (
                  <>
                    <div className="dm-media">
                      <m.div
                        className="dm-media-reveal"
                        data-reveal=""
                        initial={{ clipPath: "inset(0 100% 0 0)" }}
                        animate={{ clipPath: isReached(index) ? "inset(0 0% 0 0)" : "inset(0 100% 0 0)" }}
                        transition={tween(0.8)}
                      >
                        <m.div
                          className="dm-media-zoom"
                          data-reveal=""
                          initial={{ scale: 1.06 }}
                          animate={{ scale: isReached(index) ? 1 : 1.06 }}
                          transition={tween(1.2)}
                        >
                          {step.photo ? (
                            <Image
                              src={step.photo.src}
                              alt={step.photo.alt}
                              fill
                              sizes="(min-width: 1024px) 34vw, 100vw"
                              className="dm-photo"
                            />
                          ) : (
                            <div className="dm-placeholder" aria-hidden="true">
                              <svg viewBox="0 0 84 84" focusable="false">
                                <circle cx="42" cy="42" r="41" />
                                <circle cx="42" cy="42" r="5" className="dm-placeholder-dot" />
                              </svg>
                            </div>
                          )}
                        </m.div>
                      </m.div>
                      <StepNumber value={step.number} className="dm-number-on-image" />
                    </div>
                    <div className="dm-body">
                      <h3 className="dm-h3">{step.title}</h3>
                      <p className="dm-subtitle">{step.subtitle}</p>
                      {renderBody(step, index)}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="dm-head">
                      <StepNumber value={step.number} />
                      <h3 className="dm-h3">{step.title}</h3>
                      <p className="dm-subtitle">{step.subtitle}</p>
                      {step.kind === "keywords" && renderBody(step, index)}
                    </div>
                    {step.kind !== "keywords" && renderBody(step, index)}
                  </>
                )}
              </m.li>
            ))}
          </ol>
        </div>
      </div>
    </LazyMotion>
  );
}

// Dernier seuil franchi (-1 avant tout défilement dans la zone)
function stepFor(progress: number) {
  if (progress <= 0) return -1;
  return THRESHOLDS.findLastIndex((threshold) => progress >= threshold);
}
