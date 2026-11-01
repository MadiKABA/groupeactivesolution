"use client";

import { LazyMotion, domAnimation, m, useReducedMotion, type Transition } from "motion/react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

/*
 * CTA final de /formations/ecole : entrée unique (repère, titre, texte, bouton, cercles tracés, renvoi).
 * Configuration Motion de « Comment démarrer » : LazyMotion + domAnimation, composants `m`, strict,
 * courbe (0.22, 1, 0.36, 1). Éléments à état initial caché marqués `data-reveal`.
 */

export type CtaLink = { href: string; label: string };

const EASE = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, amount: 0.3 } as const;
// Repère 1280 × 580 : cercles centrés en (1046, 268), du plus petit au plus grand. Le viewBox est rogné
// sur le grand cercle (trait compris) : le SVG ne couvre que les cercles, placés en CSS (`.fc-rings`).
const CX = 1046;
const CY = 268;
const RINGS = [
  { r: 60, opacity: 0.5 },
  { r: 115, opacity: 0.28 },
  { r: 170, opacity: 0.18 },
] as const;

export function CtaMotion({
  eyebrow,
  titleLines,
  text,
  cta,
  links,
}: {
  eyebrow: string;
  titleLines: readonly [string, string];
  text: string;
  cta: CtaLink;
  links: readonly CtaLink[];
}) {
  const reduce = useReducedMotion() ?? false;
  const tween = (duration: number, delay = 0): Transition => (reduce ? { duration: 0 } : { duration, delay, ease: EASE });
  const rise = (y: number) => (reduce ? false : { opacity: 0, y });
  const ringsEnd = 0.3 + 0.9 + 0.12 * (RINGS.length - 1);

  return (
    <LazyMotion features={domAnimation} strict>

      <div className="fc-root site-container">
        <svg className="fc-rings" viewBox="875 97 342 342" aria-hidden="true" focusable="false">
          {RINGS.map((ring, i) => (
            <m.circle
              key={ring.r}
              className="fc-ring"
              cx={CX}
              cy={CY}
              r={ring.r}
              strokeWidth={1}
              style={{ opacity: ring.opacity }}
              initial={reduce ? false : { pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={VIEWPORT}
              transition={tween(0.9, 0.3 + i * 0.12)}
            />
          ))}
          <m.circle
            className="fc-dot"
            cx={CX}
            cy={CY}
            r={4}
            data-reveal=""
            initial={reduce ? false : { opacity: 0, scale: 0.6 }}
            whileInView={{ opacity: 0.7, scale: 1 }}
            viewport={VIEWPORT}
            transition={tween(0.4, ringsEnd)}
          />
        </svg>
        <p className="fc-mark">
          <m.span
            className="fc-mark-line"
            aria-hidden="true"
            data-reveal=""
            initial={reduce ? false : { scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={VIEWPORT}
            transition={tween(0.5)}
          />
          {eyebrow}
        </p>
        <h2 id="ecole-cta-title" className="fc-title">
          {titleLines.map((line, i) => (
            <span key={line} className="fc-line">
              <m.span
                className={i === 1 ? "fc-line-inner fc-gold" : "fc-line-inner"}
                data-reveal=""
                initial={rise(24)}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={VIEWPORT}
                transition={tween(0.65, 0.08 + i * 0.08)}
              >
                {line}
              </m.span>{" "}
            </span>
          ))}
        </h2>
        <m.p
          className="fc-text"
          data-reveal=""
          initial={rise(12)}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={tween(0.5, 0.3)}
        >
          {text}
        </m.p>
        <m.div
          className="fc-cta-wrap"
          data-reveal=""
          initial={rise(12)}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={VIEWPORT}
          transition={tween(0.5, 0.42)}
        >
          <Link href={cta.href} className="fc-cta">
            {cta.label}
            <ArrowRight aria-hidden="true" className="fc-arrow" />
          </Link>
        </m.div>

        {links.length > 0 && (
          <m.div
            className="fc-more"
            data-reveal=""
            initial={reduce ? false : { opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={VIEWPORT}
            transition={tween(0.5, ringsEnd)}
          >
            <p className="fc-more-label">Vous êtes plutôt concerné par :</p>
            <ul className="fc-more-list">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="fc-more-link">
                    <span className="fc-more-text">{link.label}</span>
                    <ArrowRight aria-hidden="true" className="fc-arrow" />
                  </Link>
                </li>
              ))}
            </ul>
          </m.div>
        )}
      </div>
    </LazyMotion>
  );
}
