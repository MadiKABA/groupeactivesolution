"use client";

import {
  LazyMotion,
  domAnimation,
  m,
  useInView,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  type Transition,
} from "motion/react";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";

/*
 * « Sur le terrain » : aperçu fixe (sticky en CSS dès 1024px de large et 720px de haut) de l'intervention
 * active, et index des interventions qui défile avec la page. Mécanique adaptée de « Nos expertises » :
 * sticky natif, un seul IntersectionObserver pour l'entrée active, progression useScroll + useSpring ;
 * sans ses paliers ni son visuel à grands panneaux. L'aperçu est décoratif (aria-hidden, bouton inerte) :
 * titres et liens sont dans la liste. Motion : LazyMotion + domAnimation, composants `m`, strict.
 * Éléments à état initial caché marqués `data-reveal` (repli sans JavaScript côté serveur).
 */

export type TerrainItem = {
  slug: string;
  date: string;
  day: string;
  monthYear: string;
  type: string | null;
  heading: string;
  resume: string;
  detail: string;
  linkLabel: string;
  href: string | null;
  photo: { src: string; alt: string } | null;
};

type Intro = { eyebrow: string; titleLines: readonly string[]; text: string };

const EASE = [0.22, 1, 0.36, 1] as const;
const VIEWPORT = { once: true, amount: 0.3 } as const;
const MEDIA_SIZES = "(min-width: 900px) 50vw, 100vw";

function GlassLink({
  item,
  compact,
  inert,
  showDisabled,
}: {
  item: TerrainItem;
  compact?: boolean;
  inert?: boolean;
  showDisabled: boolean;
}) {
  const className = compact ? "tr-glass tr-glass-compact" : "tr-glass";
  const content = (
    <>
      Voir l&apos;intervention
      <ArrowRight aria-hidden="true" className="tr-glass-arrow" />
    </>
  );
  if (item.href) {
    return (
      <Link href={item.href} aria-label={item.linkLabel} tabIndex={inert ? -1 : undefined} className={className}>
        {content}
      </Link>
    );
  }
  // Page non publiée : jamais de lien ; en mode rédaction seulement, bouton désactivé
  return showDisabled ? (
    <span aria-disabled="true" className={`${className} tr-glass-disabled`}>
      {content}
    </span>
  ) : null;
}

function Media({ item }: { item: TerrainItem }) {
  return item.photo ? (
    <Image src={item.photo.src} alt={item.photo.alt} fill sizes={MEDIA_SIZES} className="tr-photo-img" />
  ) : (
    <div className="tr-placeholder" aria-hidden="true">
      <svg viewBox="0 0 96 96" focusable="false">
        <circle cx="48" cy="48" r="47" />
        <circle cx="48" cy="48" r="5" className="tr-placeholder-dot" />
      </svg>
    </div>
  );
}

export function TerrainJournal({
  intro,
  items,
  allHref,
  showDisabledLinks,
}: {
  intro: Intro;
  items: readonly TerrainItem[];
  allHref: string | null;
  showDisabledLinks: boolean;
}) {
  const reduce = useReducedMotion() ?? false;
  const count = items.length;
  const listRef = useRef<HTMLUListElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const entries = useRef<(HTMLLIElement | null)[]>([]);
  const previewInView = useInView(previewRef, { once: true, amount: 0.3 });
  const [active, setActive] = useState(0);
  const [lit, setLit] = useState(-1);
  const [wire, setWire] = useState<{ top: number; height: number } | null>(null);

  // Fil : du premier au dernier nœud (mesuré, suit les changements de mise en page)
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const measure = () => {
      const first = entries.current[0];
      const last = entries.current[count - 1];
      if (!first || !last) return;
      const node = (li: HTMLLIElement) => li.offsetTop + (li.querySelector<HTMLElement>(".tr-node")?.offsetTop ?? 0);
      const top = node(first);
      setWire({ top, height: Math.max(0, node(last) - top) });
    };
    const observer = new ResizeObserver(measure);
    observer.observe(list);
    return () => observer.disconnect();
  }, [count]);

  // Entrée active : celle qui traverse la bande centrale de l'écran (un seul observateur). Le survol
  // ou le focus la remplace aussitôt ; le prochain franchissement au défilement reprend la main.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (records) => {
        records.forEach((record) => {
          if (record.isIntersecting) setActive(Number((record.target as HTMLElement).dataset.index));
        });
      },
      { rootMargin: "-45% 0px -45% 0px" },
    );
    entries.current.forEach((li) => li && observer.observe(li));
    return () => observer.disconnect();
  }, [count]);

  // Tracé lié au défilement de la liste ; un nœud s'allume quand le tracé l'atteint
  const { scrollYProgress } = useScroll({ target: listRef, offset: ["start 70%", "end 55%"] });
  const drawn = useSpring(scrollYProgress, { stiffness: 120, damping: 28, restDelta: 0.001 });
  useMotionValueEvent(drawn, "change", (progress) => {
    const step = progress <= 0 ? -1 : Math.min(count - 1, Math.floor(progress * (count - 1) + 0.001));
    setLit((previous) => (step > previous ? step : previous));
  });

  const tween = (duration: number, delay = 0): Transition => (reduce ? { duration: 0 } : { duration, delay, ease: EASE });
  const rise = (y: number) => (reduce ? false : { opacity: 0, y });
  const shown = (index: number) => index === active && (reduce || previewInView);

  return (
    <LazyMotion features={domAnimation} strict>
      <div className="tr-root site-container">
        <header className="tr-header">
          <p className="tr-mark">
            <m.span
              className="tr-mark-line"
              aria-hidden="true"
              data-reveal=""
              initial={reduce ? false : { scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={VIEWPORT}
              transition={tween(0.5)}
            />
            {intro.eyebrow}
          </p>
          <h2 id="terrain-title" className="tr-title">
            {intro.titleLines.map((line, i) => (
              <span key={line} className="tr-line">
                <m.span
                  className={i === 1 ? "tr-line-inner tr-gold" : "tr-line-inner"}
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
            className="tr-intro"
            data-reveal=""
            initial={rise(12)}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={VIEWPORT}
            transition={tween(0.5, 0.3)}
          >
            {intro.text}
          </m.p>
        </header>

        <div className="tr-layout">
          {/* Aperçu décoratif de l'entrée active : couches empilées (opacité 0 ou 1), aucun remontage */}
          <div ref={previewRef} className="tr-preview" aria-hidden="true">
            <div className="tr-preview-stack tr-preview-meta">
              {items.map((item, index) => (
                <m.div
                  key={item.slug}
                  className="tr-feature-meta"
                  data-reveal={index === 0 ? "" : undefined}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: shown(index) ? 1 : 0 }}
                  transition={tween(0.35)}
                >
                  <span className="tr-date">
                    {item.day} {item.monthYear}
                  </span>
                  {item.type && <span className="tr-type">{item.type}</span>}
                </m.div>
              ))}
            </div>

            <div className="tr-photo">
              {items.map((item, index) => {
                const on = shown(index);
                return (
                  <m.div
                    key={item.slug}
                    className="tr-photo-reveal"
                    data-reveal={index === 0 ? "" : undefined}
                    initial={reduce ? false : { opacity: 0, clipPath: "inset(0 100% 0 0)" }}
                    animate={on ? { opacity: 1, clipPath: "inset(0 0% 0 0)" } : { opacity: 0, clipPath: "inset(0 100% 0 0)" }}
                    transition={
                      reduce
                        ? { duration: 0 }
                        : on
                          ? { opacity: { duration: 0 }, clipPath: { duration: 0.6, ease: EASE } }
                          : { opacity: { duration: 0.35, ease: EASE }, clipPath: { duration: 0, delay: 0.35 } }
                    }
                  >
                    <m.div
                      className="tr-photo-zoom"
                      data-reveal={index === 0 ? "" : undefined}
                      initial={reduce ? false : { scale: 1.04 }}
                      animate={{ scale: on ? 1 : 1.04 }}
                      transition={tween(on ? 0.9 : 0, on ? 0 : 0.35)}
                    >
                      <div className="tr-photo-hover">
                        <Media item={item} />
                      </div>
                    </m.div>
                  </m.div>
                );
              })}
            </div>

            <div className="tr-preview-stack">
              {items.map((item, index) => (
                <m.div
                  key={item.slug}
                  className="tr-preview-text"
                  data-reveal={index === 0 ? "" : undefined}
                  initial={reduce ? false : { opacity: 0 }}
                  animate={{ opacity: shown(index) ? 1 : 0 }}
                  transition={tween(0.35)}
                >
                  <p className="tr-feature-title">{item.heading}</p>
                  <p className="tr-feature-text">{item.detail}</p>
                  {index === active && <GlassLink item={item} inert showDisabled={showDisabledLinks} />}
                </m.div>
              ))}
            </div>
          </div>

          <div className="tr-aside">
            <ul ref={listRef} className="tr-list">
              {wire && (
                <m.span
                  className="tr-wire"
                  aria-hidden="true"
                  data-reveal=""
                  style={{ top: wire.top, height: wire.height, scaleY: reduce ? 1 : drawn } as CSSProperties}
                />
              )}
              {items.map((item, index) => (
                <m.li
                  key={item.slug}
                  ref={(node) => {
                    entries.current[index] = node;
                  }}
                  data-index={index}
                  data-active={active === index ? "" : undefined}
                  data-lit={reduce || lit >= index ? "" : undefined}
                  className="tr-entry"
                  data-reveal=""
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.4 }}
                  transition={tween(0.5, index * 0.12)}
                  onMouseEnter={() => setActive(index)}
                  onFocus={() => setActive(index)}
                >
                  <article className="tr-entry-inner" aria-labelledby={`tr-${item.slug}`}>
                    {/* Mobile : bloc complet (image 16/10) */}
                    <div className="tr-entry-media">
                      <Media item={item} />
                    </div>
                    <span className="tr-node" aria-hidden="true" />
                    <time dateTime={item.date} className="tr-entry-date">
                      <span className="tr-day">{item.day}</span>
                      <span className="tr-month">{item.monthYear}</span>
                    </time>
                    <div className="tr-entry-body">
                      {item.type && <p className="tr-entry-type">{item.type}</p>}
                      <h3 id={`tr-${item.slug}`} className="tr-entry-title">
                        {item.heading}
                      </h3>
                      <p className={item.detail !== item.resume ? "tr-entry-text tr-entry-resume" : "tr-entry-text"}>{item.resume}</p>
                      {item.detail !== item.resume && <p className="tr-entry-text tr-entry-detail">{item.detail}</p>}
                      <GlassLink item={item} compact showDisabled={showDisabledLinks} />
                    </div>
                  </article>
                </m.li>
              ))}
            </ul>
            {allHref && (
              <Link href={allHref} className="tr-all">
                Voir toutes les interventions <span aria-hidden="true">→</span>
              </Link>
            )}
          </div>
        </div>
      </div>
    </LazyMotion>
  );
}
