"use client";

import { motion, useReducedMotion, type Transition, type Variants } from "motion/react";

import type { HistoryIntro } from "@/content/history";

import { ValidationMark } from "./ValidationMark";

// Même courbe que le hero À propos (--about-ease).
const EASE = [0.2, 0.7, 0.2, 1] as const;
const STAGGER = 0.09;

type Step = { delay: number; reduce: boolean };

const timing = ({ delay, reduce }: Step, duration = 0.5): Transition =>
  reduce ? { duration: 0 } : { duration, delay, ease: EASE };

// Montée de 16px avec fondu ; filets tracés de gauche à droite.
const rise: Variants = {
  hidden: { opacity: 0, y: 16 },
  visible: (step: Step) => ({ opacity: 1, y: 0, transition: timing(step) }),
};
const draw: Variants = {
  hidden: { scaleX: 0 },
  visible: (step: Step) => ({ scaleX: 1, transition: timing(step) }),
};

/*
 * En-tête éditorial de « Notre histoire », révélé une seule fois à l'entrée dans l'écran :
 * filet, surtitre, lignes du titre en cascade, puis « une idée. » et son soulignement,
 * enfin l'introduction. Sans JavaScript, la règle <noscript> de la section affiche tout.
 */
export function HistoryHeading({ intro }: { intro: HistoryIntro }) {
  const reduce = useReducedMotion() ?? false;
  const at = (index: number, extra = 0): Step => ({ delay: index * STAGGER + extra, reduce });

  return (
    <motion.header
      className="hs-head"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.5 }}
    >
      <div>
        <motion.p data-reveal variants={rise} custom={at(0)} className="hs-eyebrow">
          <motion.span data-reveal aria-hidden="true" variants={draw} custom={at(0)} className="hs-eyebrow-line" />
          {intro.eyebrow}
        </motion.p>
        <h2 id="histoire-titre" className="hs-title">
          <span className="hs-title-line">
            <motion.span data-reveal variants={rise} custom={at(1)} className="hs-title-part">
              {intro.titleLine1}
            </motion.span>
          </span>{" "}
          <span className="hs-title-line">
            <motion.span data-reveal variants={rise} custom={at(2)} className="hs-title-part">
              {intro.titleLine2Lead.trimEnd()}
            </motion.span>{" "}
            <motion.span data-reveal variants={rise} custom={at(3)} className="hs-title-part hs-accent">
              {intro.titleLine2Accent}
              <motion.span
                data-reveal
                aria-hidden="true"
                variants={draw}
                custom={at(3, 0.4)}
                className="hs-accent-line"
              />
            </motion.span>
          </span>
        </h2>
      </div>
      <motion.p data-reveal variants={rise} custom={at(3, 0.5 + 0.25)} className="hs-intro">
        {intro.paragraph} <ValidationMark pending={intro.needsValidation} />
      </motion.p>
    </motion.header>
  );
}
