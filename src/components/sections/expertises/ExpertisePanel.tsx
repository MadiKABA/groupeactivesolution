"use client";

import { motion, type Variants } from "motion/react";
import { useState, type Ref } from "react";

import { GlassChip } from "@/components/ui/GlassChip";
import { GoldLink } from "@/components/ui/GoldLink";
import type { Expertise } from "@/lib/expertises";
import { EASE } from "@/lib/motion";

import { ExpertiseImage } from "./ExpertiseImage";

/*
 * Hauteurs minimales des blocs (contenu centré en desktop, en haut ailleurs).
 * Desktop : le premier bloc mesure au moins 100svh - 2 × --sticky-top, pour que le cadre
 * sticky soit déjà épinglé quand il est centré ; le dernier est plus court.
 * Mobile : chaque bloc occupe l'espace libre sous le visuel fixe.
 */
const BLOCK_MIN_HEIGHT = {
  first: "desk:min-h-[max(min(70svh,40rem),calc(100svh-2*var(--sticky-top)))]",
  middle: "desk:min-h-[min(70svh,40rem)]",
  last: "desk:min-h-[min(60svh,33.75rem)]",
} as const;
const MOBILE_MIN_HEIGHT = "mob:min-h-[calc(100svh-var(--sticky-top)-var(--visual-h)-0.75rem)]";

/** Position du bloc par rapport au bloc actif. */
export type BlockState = "active" | "upcoming" | "passed";

type ExpertisePanelProps = {
  expertise: Expertise;
  index: number;
  total: number;
  /** Photo disponible dans public/ (utilisée seulement dans le palier C). */
  imageSrc: string | null;
  state: BlockState;
  /** Palier « a » (desktop) : décalage horizontal des blocs inactifs. */
  desktop: boolean;
  /** Nœud allumé sur la ligne de progression (desktop). */
  lit: boolean;
  reduce: boolean;
  articleRef: Ref<HTMLElement>;
  /** Focus clavier dans le bloc : il devient actif. */
  onActivate: () => void;
  onNavigate: () => void;
};

export function ExpertisePanel({
  expertise,
  index,
  total,
  imageSrc,
  state,
  desktop,
  lit,
  reduce,
  articleRef,
  onActivate,
  onNavigate,
}: ExpertisePanelProps) {
  const [hovered, setHovered] = useState(false);
  const Icon = expertise.icon;
  const titleId = `expertise-${expertise.slug}-title`;
  const totalLabel = String(total).padStart(2, "0");
  const minHeight =
    index === 0 ? BLOCK_MIN_HEIGHT.first : index === total - 1 ? BLOCK_MIN_HEIGHT.last : BLOCK_MIN_HEIGHT.middle;

  /*
   * Blocs inactifs : le décor (numéro, icône, étiquettes) suit les opacités du design
   * (0.5 en desktop ; 0.55 à venir et 0.35 passés en mobile) ; les textes ne descendent
   * jamais sous 0.85 pour garder un contraste AA. Palier C : tout reste à 1.
   */
  const dim = state !== "active" && !hovered;
  const decoDim = !dim ? "" : desktop ? "opacity-50" : state === "passed" ? "mob:opacity-35" : "mob:opacity-55";
  const deco = `transition-opacity duration-500 ease-standard ${decoDim}`;
  const text = `transition-opacity duration-500 ease-standard ${dim ? "desk:opacity-85 mob:opacity-85" : ""}`;

  // Cascade d'apparition, jouée une seule fois à l'entrée du bloc dans l'écran.
  const step = reduce ? { duration: 0 } : { duration: 0.6, ease: EASE.reveal };
  const container: Variants = {
    hidden: {},
    visible: { transition: reduce ? { duration: 0 } : { staggerChildren: 0.08 } },
  };
  const item: Variants = { hidden: { opacity: 0, y: 12 }, visible: { opacity: 1, y: 0, transition: step } };
  const mask: Variants = {
    hidden: { y: "110%" },
    visible: { y: 0, transition: reduce ? { duration: 0 } : { duration: 0.8, ease: EASE.reveal } },
  };
  const tags: Variants = {
    hidden: {},
    visible: { transition: reduce ? { duration: 0 } : { staggerChildren: 0.04 } },
  };

  return (
    <article
      ref={articleRef}
      id={`expertise-${expertise.slug}`}
      data-index={index}
      aria-labelledby={titleId}
      onFocus={onActivate}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`expertise-block relative mob:pt-4 desk:flex desk:items-center ${minHeight} ${MOBILE_MIN_HEIGHT}`}
    >
      {/* Nœud de la ligne de progression (desktop), aligné sur le rail du conteneur */}
      <button
        type="button"
        onClick={onNavigate}
        aria-label={`Aller à l'expertise ${expertise.number} : ${expertise.name}`}
        aria-current={state === "active" ? "true" : undefined}
        className={`absolute top-1/2 -left-[calc(2.5rem+5px)] hidden size-3 -translate-y-1/2 rounded-full border-2 transition-[background-color,border-color,box-shadow] duration-500 ease-standard before:absolute before:-inset-2.5 before:content-[''] desk:block ${lit ? "border-brand-gold bg-brand-gold shadow-glow" : "border-brand-navy/25 bg-surface-warm"}`}
      />

      <motion.div
        className="w-full"
        variants={container}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
      >
        {/* Palier C uniquement (hauteur < 520px) : image dans le bloc, sans visuel fixe */}
        <div className="relative mb-6 hidden aspect-video overflow-hidden rounded-2xl border border-brand-gold/35 bg-brand-navy shadow-frame short:block">
          <ExpertiseImage expertise={expertise} src={imageSrc} />
          <GlassChip
            icon={Icon}
            label={expertise.name}
            current={expertise.number}
            total={totalLabel}
            compact
            className="glass-touch-solid absolute bottom-3 left-3"
          />
        </div>

        <div className={`transition-transform duration-500 ease-standard ${dim && desktop ? "translate-x-2" : ""}`}>
          {/* Grand numéro en contour (desktop) */}
          <motion.div variants={item} aria-hidden="true" className="hidden desk:block">
            <span className={`text-outline-gold block text-numeral font-extrabold ${deco}`}>
              {expertise.number}
            </span>
          </motion.div>

          <motion.p variants={item} className="flex items-center gap-3 desk:mt-4">
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-full border border-brand-gold/60 text-text-primary ${deco}`}
            >
              <Icon aria-hidden="true" className="size-4.5" />
            </span>
            {/* Petit numéro dans la ligne du libellé, hors desktop */}
            <span className={`text-sm font-semibold text-text-primary tabular-nums desk:hidden ${text}`}>
              {expertise.number}
            </span>
            <span className={`text-sm font-semibold tracking-caps text-text-primary uppercase ${text}`}>
              {expertise.name}
            </span>
          </motion.p>

          <h3
            id={titleId}
            className={`mt-3 overflow-hidden pb-[0.1em] text-h3 font-bold tracking-display text-text-primary desk:mt-5 desk:text-panel ${text}`}
          >
            <motion.span variants={mask} className="block">
              {expertise.tagline}
            </motion.span>
          </h3>

          <motion.p
            variants={item}
            className={`mt-3 max-w-[72ch] text-base leading-relaxed text-text-primary/72 desk:mt-4 desk:text-body-lg ${text}`}
          >
            {expertise.description}
          </motion.p>

          <motion.ul variants={tags} aria-label="Services" className="mt-3 flex flex-wrap gap-1.5 desk:mt-6 desk:gap-2">
            {expertise.services.map((service) => (
              <motion.li key={service} variants={item}>
                <span
                  className={`inline-block rounded-full border border-brand-navy/14 bg-surface px-2.5 py-1 text-xs text-text-primary transition-[translate,border-color,opacity] duration-(--duration-base) ease-standard hover:-translate-y-0.5 hover:border-brand-gold desk:px-3.5 desk:py-1.5 desk:text-tag ${decoDim}`}
                >
                  {service}
                </span>
              </motion.li>
            ))}
          </motion.ul>

          <motion.p
            variants={item}
            className={`mt-3 flex flex-wrap items-baseline gap-x-3 gap-y-1 desk:mt-6 ${text}`}
          >
            <span className="text-2xs font-semibold tracking-label text-text-primary/72 uppercase">
              Idéal pour
            </span>
            <span className="text-sm text-text-primary desk:text-nav">{expertise.idealFor.join(" · ")}</span>
          </motion.p>

          <motion.div variants={item} className={`mt-2 desk:mt-6 ${text}`}>
            <GoldLink href={expertise.link.href}>{expertise.link.label}</GoldLink>
          </motion.div>
        </div>
      </motion.div>
    </article>
  );
}
