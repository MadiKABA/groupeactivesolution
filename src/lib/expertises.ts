import { Code2, GraduationCap, Settings2, type LucideIcon } from "lucide-react";

export type ExpertiseSlug = "education" | "developpement" | "transformation";

export type Expertise = {
  slug: ExpertiseSlug;
  /** Numéro affiché (« 01 »…). */
  number: string;
  name: string;
  icon: LucideIcon;
  tagline: string;
  description: string;
  services: readonly string[];
  idealFor: readonly string[];
  link: { label: string; href: string };
  /** Texte alternatif de la photo : à adapter aux photos réelles. */
  alt: string;
  /** Points focaux (object-position) : cadre desktop presque carré, cadre mobile large et bas. */
  focalDesktop: string;
  focalMobile: string;
};

export const expertisesIntro = {
  eyebrow: "Nos expertises",
  titleLines: ["Trois expertises.", "Une vision."],
  intro:
    "Nous connectons l'éducation, la technologie et la stratégie pour transformer les idées en compétences et en solutions concrètes.",
} as const;

// Destinations à confirmer : /education-numerique et /services n'existent pas encore.
export const expertises: readonly Expertise[] = [
  {
    slug: "education",
    number: "01",
    name: "Éducation numérique",
    icon: GraduationCap,
    tagline: "Donner aux talents les moyens de créer le futur.",
    description:
      "Des programmes qui permettent aux jeunes de découvrir la programmation, la robotique et les technologies émergentes.",
    services: ["Programmation", "Robotique", "Électronique", "Internet des objets", "Intelligence artificielle"],
    idealFor: ["Établissements scolaires", "Jeunes talents"],
    link: { label: "Découvrir les programmes", href: "/education-numerique" },
    alt: "Jeunes apprenants en atelier de programmation et de robotique",
    focalDesktop: "50% 45%",
    focalMobile: "50% 40%",
  },
  {
    slug: "developpement",
    number: "02",
    name: "Développement digital",
    icon: Code2,
    tagline: "Transformer les idées en solutions numériques.",
    description:
      "Des sites web, applications et logiciels conçus autour des besoins réels des entreprises et des organisations.",
    services: [
      "Sites web",
      "Applications web et mobiles",
      "Logiciels de gestion",
      "Plateformes métier",
      "Solutions SaaS",
    ],
    idealFor: ["Entreprises", "Organisations", "Entrepreneurs"],
    link: { label: "Découvrir nos solutions", href: "/services#developpement" },
    alt: "Interface d'application web et mobile en cours de développement",
    focalDesktop: "50% 50%",
    focalMobile: "50% 45%",
  },
  {
    slug: "transformation",
    number: "03",
    name: "Transformation digitale",
    icon: Settings2,
    tagline: "Faire évoluer les organisations durablement.",
    description:
      "Nous accompagnons les équipes dans l'adoption des outils numériques et l'amélioration de leurs processus.",
    services: ["Conseil", "Digitalisation des processus", "Formation des équipes", "Intégration d'outils"],
    idealFor: ["Entreprises", "Institutions", "Organisations"],
    link: { label: "Transformer votre organisation", href: "/services#transformation" },
    alt: "Équipe accompagnée dans l'adoption de nouveaux outils numériques",
    focalDesktop: "50% 45%",
    focalMobile: "50% 35%",
  },
];

/** Chemin public attendu pour la photo d'une expertise (carré 1600 × 1600, WebP < 220 Ko, sujet centré). */
export const expertiseImagePath = (slug: ExpertiseSlug) => `/expertises/${slug}.webp`;
