// Contenu validé : novembre 2026 (document Textes validés de la page d'accueil). Modifier ces valeurs sans toucher aux composants.

import { Code2, GraduationCap, Settings2, type LucideIcon } from "lucide-react";

import { EASE } from "@/lib/motion";
import { ROUTES } from "@/lib/routes";
import { glueTail, typo } from "@/lib/typography";

/** Titre fixe du hero, identique sur les 3 diapos : une ligne visuelle par segment. */
export const HERO_TITLE_LINES = [
  "Former les talents,",
  "créer les solutions,",
  "transformer les organisations.",
] as const;

/** Bouton secondaire, identique sur les 3 diapos. */
export const HERO_SECONDARY_CTA = { label: "Parlons de votre projet", href: ROUTES.contact } as const;

export type HeroSlide = {
  /** Nom de la diapo (pastille du visuel). */
  label: string;
  icon: LucideIcon;
  /** Chemin public de l'image (WebP, ≈ 1200 × 900, < 150 Ko). */
  image: string;
  /** Texte alternatif : à adapter aux photos réelles. */
  alt: string;
  caption: string;
  /** Bouton principal de la diapo. */
  cta: { label: string; href: string };
};

export const heroSlides: readonly HeroSlide[] = [
  {
    label: "Formations",
    icon: GraduationCap,
    image: "/hero/education.webp",
    alt: "Apprenants en séance de formation au numérique",
    caption: glueTail(typo("Scratch, robotique, intelligence artificielle : des formations pratiques pour les écoles, les jeunes et les professionnels.")),
    cta: { label: "Voir nos formations", href: "/#formations" },
  },
  {
    label: "Développement digital",
    icon: Code2,
    image: "/hero/developpement.webp",
    alt: "Développement d'une application web et mobile",
    caption: glueTail(typo("Des sites et des applications pensés pour les réalités d’ici, livrés de A à Z.")),
    cta: { label: "Voir nos réalisations", href: "/#realisations" },
  },
  {
    label: "Transformation digitale",
    icon: Settings2,
    image: "/hero/transformation.webp",
    alt: "Équipe accompagnée dans sa transformation digitale",
    caption: glueTail(typo("Automatisez vos tâches répétitives, digitalisez votre gestion et gagnez du temps.")),
    cta: { label: "Demander un audit", href: ROUTES.contact },
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
