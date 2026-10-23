"use client";

import { motion } from "motion/react";
import { Fragment } from "react";

import { EASE } from "@/lib/motion";

type WordsTitleProps = {
  id: string;
  words: readonly string[];
  /** Classe du dernier mot (dégradé doré : `hero-gradient-text` sur fond sombre, `gold-ink-text` sur fond clair). */
  highlightClass: string;
  /** Retour à la ligne après ce mot sous 640px (titre sur une ligne au-delà). */
  breakAfter?: number;
  /** Révélation déclenchée par la section. */
  play: boolean;
  reduce: boolean;
  /** Début de la révélation (s) et décalage entre les mots. */
  delay?: number;
  stagger?: number;
  className?: string;
};

/**
 * Titre (h2) révélé mot par mot depuis un masque (y 110 % → 0, 0.9 s), puis reflet unique
 * (1.2 s) sur le dernier mot. Le reflet n'anime que des transforms : une fenêtre aux bords
 * fondus traverse le mot pendant que la copie claire qu'elle contient glisse en sens inverse.
 */
export function WordsTitle({
  id,
  words,
  highlightClass,
  breakAfter,
  play,
  reduce,
  delay = 0,
  stagger = 0.08,
  className = "",
}: WordsTitleProps) {
  const last = words.length - 1;
  const wordDelay = (index: number) => delay + index * stagger;
  const shine = { duration: 1.2, delay: wordDelay(last) + 0.9, ease: "easeInOut" } as const;

  return (
    <h2 id={id} className={className}>
      {words.map((word, index) => (
        <Fragment key={word}>
          <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] align-top">
            <motion.span
              className="inline-block"
              initial={{ y: reduce ? 0 : "110%", opacity: reduce ? 0 : 1 }}
              animate={play ? { y: 0, opacity: 1 } : undefined}
              transition={reduce ? { duration: 0.4 } : { duration: 0.9, delay: wordDelay(index), ease: EASE.reveal }}
            >
              {index === last ? (
                <span className="relative inline-block">
                  <span className={highlightClass}>{word}</span>
                  {!reduce && (
                    <span aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
                      <motion.span
                        className="absolute inset-y-0 left-0 w-2/5 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black,transparent)]"
                        initial={{ x: "-100%" }}
                        animate={play ? { x: "250%" } : undefined}
                        transition={shine}
                      >
                        <motion.span
                          className="absolute inset-y-0 left-0 w-[250%] text-text-on-dark/60"
                          initial={{ x: "40%" }}
                          animate={play ? { x: "-100%" } : undefined}
                          transition={shine}
                        >
                          {word}
                        </motion.span>
                      </motion.span>
                    </span>
                  )}
                </span>
              ) : (
                word
              )}
            </motion.span>
          </span>
          {index === breakAfter && <br className="sm:hidden" />}
          {index < last && " "}
        </Fragment>
      ))}
    </h2>
  );
}
