"use client";

import { ArrowDown } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";

import { WaveMotif } from "@/components/ui/WaveMotif";
import { contactHero } from "@/lib/contact";
import { EASE } from "@/lib/motion";

/** Révélation du titre : un mot toutes les 60 ms, 550 ms chacun. */
const WORD_STAGGER = 0.06;
const WORD_DURATION = 0.55;

/** Sans JavaScript : état final (Motion rend l'état initial masqué côté serveur). */
const NOSCRIPT_STYLE =
  ".cth-hero [style*='opacity']{opacity:1!important;transform:none!important}.cth-swash path{stroke-dasharray:none!important;stroke-dashoffset:0!important}";

/*
 * Hero de /contact (bleu nuit, minimaliste) : titre révélé mot par mot, texte, un seul bouton vers la
 * section Contact ; à droite, « Réponse sous 24 h » (« 24 h » en manuscrit, police passée par la page
 * pour ne la charger que sur /contact) et un trait de plume qui se dessine. Transform et opacité seuls,
 * aucune boucle ; animations réduites : état final d'emblée. Zigzag du hero de l'accueil (masque
 * horizontal : presque effacé derrière le texte), statique.
 */
export function ContactHero({ scriptClassName }: { scriptClassName: string }) {
  const reduce = useReducedMotion();
  const words = contactHero.title.split(" ");
  const textAt = (words.length + 1) * WORD_STAGGER + 0.25;
  const enter = (delay: number, duration = 0.5) => ({ duration, delay, ease: EASE.reveal });

  return (
    <section aria-labelledby="contact-hero-title" className="cth-hero">
      <noscript>
        <style>{NOSCRIPT_STYLE}</style>
      </noscript>
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <WaveMotif tone="dark" mask="full" hero />
      </div>

      <div className="cth-grid site-container">
        <div className="cth-text">
          <h1 id="contact-hero-title" className="cth-title">
            {[...words, contactHero.titleHighlight].map((word, index) => (
              <span key={`${word}-${index}`}>
                <span className="cth-word">
                  <motion.span
                    className={`inline-block ${index === words.length ? "text-brand-gold" : ""}`}
                    initial={reduce ? false : { opacity: 0, y: "60%" }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={enter(index * WORD_STAGGER, WORD_DURATION)}
                  >
                    {word}
                  </motion.span>
                </span>
                {index < words.length ? " " : null}
              </span>
            ))}
          </h1>

          <motion.p
            className="cth-lead"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={enter(textAt)}
          >
            {contactHero.lead}
          </motion.p>

          {/* Défilement doux (règle globale) ; décalage sous le header : scroll-margin-top des section[id] */}
          <motion.a
            href="#contact"
            className="cth-cta"
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={enter(textAt + 0.1)}
          >
            {contactHero.cta}
            <ArrowDown aria-hidden="true" className="cth-cta-icon" />
          </motion.a>
        </div>

        {/* Lu « Réponse sous 24 h » ; « 24 h » est du texte réel, incliné de -4° */}
        <p className="cth-reply">
          <motion.span
            className="cth-reply-label"
            initial={reduce ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={enter(0.15, 0.6)}
          >
            {contactHero.replyLabel}
          </motion.span>{" "}
          <span className="cth-reply-tilt">
            <motion.span
              className={`cth-reply-value ${scriptClassName}`}
              initial={reduce ? false : { opacity: 0, scale: 0.96, rotate: 3 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={enter(0.25, 0.9)}
            >
              {contactHero.replyValue}
            </motion.span>
            <svg aria-hidden="true" className="cth-swash" viewBox="0 0 320 40" fill="none">
              <motion.path
                d="M6 28C62 12 120 8 178 16C226 23 270 30 314 10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                initial={reduce ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, delay: 0.65, ease: "easeInOut" }}
              />
            </svg>
          </span>
        </p>
      </div>
    </section>
  );
}
