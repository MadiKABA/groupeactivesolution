// CONTENU PROVISOIRE : textes du hero de /services, à valider. Les noms des expertises viennent de expertises.ts.

import { ROUTES } from "./routes";

export const servicesHero = {
  /** Trois lignes du h1, lues d'un seul tenant ; `highlight` est le mot en doré de la 2e ligne. */
  title: {
    line1: "À chaque besoin,",
    line2: { before: "son ", highlight: "expertise" },
    line3: "numérique.",
  },
  subtitle:
    "De l'élève qui écrit sa première ligne de code à l'organisation qui adopte de nouveaux outils : trois façons de rendre le numérique utile, à Dakar et partout au Sénégal.",
  /** Mène à la première fiche (ancre lue dans expertises.ts). */
  ctaLabel: "Découvrir nos expertises",
  /** Nom accessible de la mosaïque (sommaire de la page). */
  mosaicLabel: "Nos expertises",
} as const;

/** Bande CTA finale de /services (CtaGlassBand) : textes fournis, à ne pas modifier sans validation. */
export const servicesCta = {
  title: "Envie de former vos équipes, digitaliser votre activité ou donner à vos élèves",
  titleHighlight: "les clés du numérique de demain ?",
  support: "Chaque projet commence par une écoute de vos besoins.",
  cta: { label: "Parlons de votre projet", href: ROUTES.contact },
} as const;
