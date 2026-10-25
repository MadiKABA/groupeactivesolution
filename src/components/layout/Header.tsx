"use client";

import {
  motion,
  MotionConfig,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type FocusEvent } from "react";

import { CtaLink } from "./CtaLink";
import { Logo } from "./Logo";
import { MobileMenu } from "./MobileMenu";
import { isActivePath, navLinks } from "./navigation";

const SCROLL_THRESHOLD = 20;

type EntryCustom = { index: number; reduce: boolean };

// Apparition en cascade : logo, puis chaque lien, puis le CTA.
const entry: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: ({ index, reduce }: EntryCustom) => ({
    opacity: 1,
    y: 0,
    transition: reduce ? { duration: 0 } : { duration: 0.5, ease: "easeOut", delay: index * 0.08 },
  }),
};

export function Header() {
  const pathname = usePathname();
  const reduce = useReducedMotion() ?? false;

  const { scrollY, scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);
  useMotionValueEvent(scrollY, "change", (y) => setScrolled(y > SCROLL_THRESHOLD));

  const smoothProgress = useSpring(scrollYProgress, { stiffness: 120, damping: 30, restDelta: 0.001 });
  // Motion renvoie une progression de 1 sur une page sans défilement : la barre reste vide en haut.
  const progress = useTransform(smoothProgress, (value) => (scrollY.get() > 0 ? value : 0));

  // Lien survolé (ou focalisé au clavier) ; l'indicateur revient sur le lien actif sinon.
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const activeIndex = navLinks.findIndex((link) => isActivePath(pathname, link.href));
  const underlinedIndex = hoveredIndex ?? activeIndex;

  const onNavBlur = (event: FocusEvent<HTMLElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) setHoveredIndex(null);
  };

  const ctaIndex = navLinks.length + 1;

  return (
    <MotionConfig reducedMotion="user">
      <header
        data-scrolled={scrolled}
        className="group/header fixed inset-x-0 top-0 z-50 text-text-on-dark transition-shadow duration-300 ease-out [--focus-ring:var(--color-brand-gold)] data-[scrolled=true]:shadow-header"
      >
        {/*
          Fond et flou sur un calque séparé : un backdrop-filter sur <header> lui-même
          empêcherait la bande de verre (enfant) de flouter la page située dessous.
          Sans support de backdrop-filter, le fond reste navy opaque.
        */}
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-brand-navy transition-[background-color,backdrop-filter] duration-300 ease-out supports-[backdrop-filter:blur(1px)]:bg-brand-navy/95 supports-[backdrop-filter:blur(1px)]:backdrop-blur-md supports-[backdrop-filter:blur(1px)]:group-data-[scrolled=true]/header:bg-brand-navy/80 supports-[backdrop-filter:blur(1px)]:group-data-[scrolled=true]/header:backdrop-blur-xl"
        />

        {/* Grille 1fr / auto / 1fr : le menu est centré sur la page, pas entre le logo et le CTA. */}
        <div className="site-container flex h-18 items-center justify-between gap-8 transition-[height] duration-300 ease-out xl:grid xl:h-22.5 xl:grid-cols-[1fr_auto_1fr] xl:group-data-[scrolled=true]/header:h-18">
          <motion.div
            variants={entry}
            custom={{ index: 0, reduce }}
            initial="hidden"
            animate="visible"
            className="flex h-full shrink-0 items-center justify-self-start"
          >
            {/* Logo complet en haut de page (desktop) ; monogramme sur mobile et après défilement */}
            <Logo
              fullClassName="hidden h-17 xl:block xl:group-data-[scrolled=true]/header:hidden"
              markClassName="h-12 xl:hidden xl:h-13 xl:group-data-[scrolled=true]/header:block"
            />
          </motion.div>

          <nav
            aria-label="Navigation principale"
            className="hidden xl:block"
            onMouseLeave={() => setHoveredIndex(null)}
            onBlur={onNavBlur}
          >
            <ul className="flex items-center gap-12">
              {navLinks.map((link, index) => {
                const active = index === activeIndex;
                const highlighted = active || index === hoveredIndex;
                const dimmed = hoveredIndex !== null && index !== hoveredIndex;
                return (
                  <motion.li
                    key={link.href}
                    variants={entry}
                    custom={{ index: index + 1, reduce }}
                    initial="hidden"
                    animate="visible"
                  >
                    <Link
                      href={link.href}
                      aria-current={active ? "page" : undefined}
                      onMouseEnter={() => setHoveredIndex(index)}
                      onFocus={() => setHoveredIndex(index)}
                      className={`relative block rounded-sm py-2.5 text-nav font-medium whitespace-nowrap transition-[color,opacity] duration-(--duration-base) ease-standard ${highlighted ? "text-brand-gold" : "text-text-on-dark"} ${dimmed ? "opacity-70" : ""}`}
                    >
                      {link.label}
                      {index === underlinedIndex && (
                        <motion.span
                          layoutId="nav-underline"
                          aria-hidden="true"
                          transition={
                            reduce ? { duration: 0 } : { type: "spring", stiffness: 400, damping: 32 }
                          }
                          className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-brand-gold"
                        />
                      )}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          <motion.div
            variants={entry}
            custom={{ index: ctaIndex, reduce }}
            initial="hidden"
            animate="visible"
            className="hidden justify-self-end xl:block"
          >
            <CtaLink />
          </motion.div>

          <motion.div
            variants={entry}
            custom={{ index: 1, reduce }}
            initial="hidden"
            animate="visible"
            className="xl:hidden"
          >
            <MobileMenu pathname={pathname} />
          </motion.div>
        </div>

        {/* Bord bas, de dessous vers dessus : reflet de vitre, filet, liseré doré, progression */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 h-3 bg-linear-to-t from-text-on-dark/4 to-transparent"
        />
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-px bg-text-on-dark/15" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-px bg-linear-to-r from-transparent via-brand-gold/35 to-transparent"
        />
        <motion.div
          aria-hidden="true"
          style={{ scaleX: progress }}
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand-gold opacity-60"
        />

        {/* Bande de verre sous le header, en fondu ; plus marquée après défilement */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-full hidden h-5 bg-linear-to-b from-brand-navy/55 to-transparent opacity-60 backdrop-blur-md transition-opacity duration-300 ease-out [mask-image:linear-gradient(to_bottom,black,transparent)] group-data-[scrolled=true]/header:opacity-100 supports-[backdrop-filter:blur(1px)]:block"
        />
      </header>
    </MotionConfig>
  );
}
