// Textes de /services validés par l'équipe (novembre 2026), à ne pas reformuler. Les noms des expertises viennent de expertises.ts.

import { WHATSAPP_URL } from "./site";
import { typo } from "./typography";

export const servicesHero = {
  /** Trois lignes du h1, lues d'un seul tenant ; `highlight` est le mot en doré de la 2e ligne. */
  title: {
    line1: "À chaque besoin,",
    line2: { before: "son ", highlight: "expertise" },
    line3: "numérique.",
  },
  subtitle: typo("Vous avez un projet, une école à accompagner ou une équipe à former ? Parlons-en ensemble."),
  /** Mène à la première fiche (ancre lue dans expertises.ts). */
  ctaLabel: "Découvrir nos expertises",
  /** Nom accessible de la mosaïque (sommaire de la page). */
  mosaicLabel: "Nos expertises",
} as const;

/** Bande CTA finale de /services (CtaGlassBand) : textes validés (novembre 2026). Le lien WhatsApp vient de `WHATSAPP_URL` (site.ts). */
export const servicesCta = {
  title: typo("Une équipe à former, une activité à digitaliser,"),
  titleHighlight: typo("des élèves à initier au numérique ?"),
  support: "Dites-nous où vous en êtes. Nous vous répondons en moins de 24 heures, sans engagement.",
  cta: { label: "Écrivez-nous sur WhatsApp", href: WHATSAPP_URL, external: true },
} as const;
