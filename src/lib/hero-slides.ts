import { Code2, GraduationCap, Settings2, type LucideIcon } from "lucide-react";

import { EASE } from "@/lib/motion";

export type HeroSlide = {
  /** Ligne du titre (les 3 lignes forment le h1). */
  line: string;
  label: string;
  icon: LucideIcon;
  /** Chemin public de l'image (WebP, ≈ 1200 × 900, < 150 Ko). */
  image: string;
  /** Texte alternatif : à adapter aux photos réelles. */
  alt: string;
  caption: string;
  href: string;
};

export const heroSlides: readonly HeroSlide[] = [
  {
    line: "Former les talents,",
    label: "Éducation numérique",
    icon: GraduationCap,
    image: "/hero/education.webp",
    alt: "Apprenants en séance de formation au numérique",
    caption:
      "Programmation, robotique, intelligence artificielle et compétences digitales pour tous les niveaux.",
    href: "/education-numerique",
  },
  {
    line: "créer les solutions,",
    label: "Développement digital",
    icon: Code2,
    image: "/hero/developpement.webp",
    alt: "Développement d'une application web et mobile",
    caption: "Sites web, applications mobiles, plateformes et logiciels métier sur mesure.",
    href: "/services",
  },
  {
    line: "transformer les organisations.",
    label: "Transformation digitale",
    icon: Settings2,
    image: "/hero/transformation.webp",
    alt: "Équipe accompagnée dans sa transformation digitale",
    caption:
      "Conseil, automatisation, formation et optimisation des processus pour une performance durable.",
    href: "/services",
  },
];

/** Durée d'affichage d'un état du carrousel, en millisecondes. */
export const HERO_SLIDE_DURATION = 6000;

/** Courbes d'animation du hero (communes au site). */
export const HERO_EASE = EASE;

/** Séquence d'entrée au chargement, en secondes (délai total < 1.4 s). */
export const HERO_ENTRY_DELAY = {
  badge: 0,
  lines: 0.15,
  lineStagger: 0.12,
  caption: 0.6,
  actions: 0.75,
  visual: 0.85,
  scrollHint: 1,
} as const;

/** Libellé de position « 01 / 03 ». */
export function formatSlideCount(index: number, total: number): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(index + 1)} / ${pad(total)}`;
}
