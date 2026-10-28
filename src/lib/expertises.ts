import { Code2, GraduationCap, Settings2, type LucideIcon } from "lucide-react";

import { ROUTES } from "./routes";

export type ExpertiseSlug = "education" | "developpement" | "transformation";
/** Ancre de la fiche de l'expertise sur la page /services. */
export type ExpertiseAnchor = "former" | "creer" | "transformer";

/**
 * Icônes des domaines (noms lucide-react). Des noms et non des composants : ce module est aussi
 * importé par un composant client de l'accueil, les icônes restent dans le rendu serveur des fiches.
 */
export type DomainIcon =
  | "Code" | "Bot" | "Cpu" | "Wifi" | "Sparkles" | "Lightbulb"
  | "Globe" | "Smartphone" | "Layers" | "LayoutDashboard" | "Cloud" | "Zap"
  | "MessagesSquare" | "Plug" | "Users" | "RefreshCw" | "LineChart";

/** Fiche détaillée de l'expertise sur /services (contenus validés : ne pas reformuler). */
export type ExpertiseFiche = {
  /** Accroche du titre ; `highlight` est le groupe de mots en doré. */
  hook: { before: string; highlight: string; after?: string };
  paragraph: string;
  audience: readonly string[];
  approach: readonly string[];
  domains: readonly { label: string; icon: DomainIcon }[];
  link: { label: string; href: string };
  /** Photo de la fiche (`public/images/services/fiche-<slug>`, détectée au build). */
  photo: { alt: string; objectPosition: string };
  theme: "clair" | "sombre";
  photoSide: "droite" | "gauche";
  /** Type de service (JSON-LD) et public (audienceType). */
  serviceType: string;
  audienceType: string;
};

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
  /** Page /services : ancre de la fiche et anciennes ancres qui y mènent encore. */
  anchor: ExpertiseAnchor;
  anchorAliases: readonly string[];
  /**
   * Texte alternatif de la vignette du hero de /services (photo distincte de celle de l'accueil).
   * Vide tant que la photo n'a pas été vue : décrire ensuite ce qu'elle montre réellement.
   */
  servicesAlt: string;
  fiche: ExpertiseFiche;
};

export const expertisesIntro = {
  eyebrow: "Nos expertises",
  titleLines: ["Trois expertises.", "Une vision."],
  intro:
    "Nous connectons l'éducation, la technologie et la stratégie pour transformer les idées en compétences et en solutions concrètes.",
} as const;

// Destinations à confirmer : /formations et /ecole n'existent pas encore (fiches : sections de l'accueil).
export const expertises = [
  {
    slug: "education",
    number: "01",
    name: "Formations",
    icon: GraduationCap,
    tagline: "Donner aux talents les moyens de créer le futur.",
    description:
      "Des programmes qui permettent aux jeunes de découvrir la programmation, la robotique et les technologies émergentes.",
    services: ["Programmation", "Robotique", "Électronique", "Internet des objets", "Intelligence artificielle"],
    idealFor: ["Établissements scolaires", "Jeunes talents"],
    link: { label: "Découvrir les programmes", href: "/formations" },
    alt: "Jeunes apprenants en atelier de programmation et de robotique",
    focalDesktop: "50% 45%",
    focalMobile: "50% 40%",
    anchor: "former",
    anchorAliases: [],
    servicesAlt: "", // TODO : à rédiger quand la photo sera déposée
    fiche: {
      hook: { before: "De la première ligne de code au ", highlight: "premier robot." },
      paragraph:
        "Nous concevons et animons des programmes pour les établissements scolaires : programmation, robotique, électronique, objets connectés et intelligence artificielle. L'objectif : développer la créativité, la logique et l'esprit d'initiative des jeunes.",
      audience: ["Écoles primaires", "Collèges", "Lycées"],
      approach: ["Partenariats sur mesure", "Conception pédagogique", "Encadrement par des formateurs spécialisés"],
      domains: [
        { label: "Programmation et développement web", icon: "Code" },
        { label: "Robotique éducative", icon: "Bot" },
        { label: "Électronique et systèmes embarqués", icon: "Cpu" },
        { label: "Internet des objets", icon: "Wifi" },
        { label: "Intelligence artificielle", icon: "Sparkles" },
        { label: "Culture numérique et innovation", icon: "Lightbulb" },
      ],
      // TODO : « Voir la page École » vers /ecole quand la page existera ; en attendant, section Formations de l'accueil.
      link: { label: "Découvrir les programmes", href: "/#formations" },
      photo: { alt: "", objectPosition: "50% 50%" }, // TODO : alt factuel quand la photo sera déposée
      theme: "clair",
      photoSide: "droite",
      serviceType: "Formation au numérique, à la programmation et à la robotique éducative",
      audienceType: "Écoles primaires, collèges et lycées",
    },
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
    link: { label: "Découvrir nos solutions", href: "/services#creer" },
    alt: "Interface d'application web et mobile en cours de développement",
    focalDesktop: "50% 50%",
    focalMobile: "50% 45%",
    anchor: "creer",
    anchorAliases: ["developpement-digital"],
    servicesAlt: "", // TODO : à rédiger quand la photo sera déposée
    fiche: {
      hook: { before: "Des solutions numériques construites autour de ", highlight: "votre métier." },
      paragraph:
        "Sites web professionnels, applications web et mobiles, plateformes, logiciels métiers et solutions SaaS : nous concevons et réalisons des outils adaptés à la façon dont vous travaillez.",
      audience: ["Entreprises", "Startups", "ONG", "Institutions"],
      approach: ["Des solutions numériques sur mesure", "Un projet qui commence par l'écoute de vos besoins métier"],
      domains: [
        { label: "Sites web professionnels", icon: "Globe" },
        { label: "Applications web et mobiles", icon: "Smartphone" },
        { label: "Plateformes numériques sur mesure", icon: "Layers" },
        { label: "Logiciels métiers", icon: "LayoutDashboard" },
        { label: "Solutions SaaS", icon: "Cloud" },
        { label: "Intégration de l'IA et automatisation", icon: "Zap" },
      ],
      link: { label: "Discuter de votre projet", href: ROUTES.contact },
      photo: { alt: "", objectPosition: "50% 50%" }, // TODO : alt factuel quand la photo sera déposée
      theme: "sombre",
      photoSide: "gauche",
      serviceType: "Développement de sites web, d'applications et de logiciels métiers",
      audienceType: "Entreprises, startups, ONG et institutions",
    },
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
    link: { label: "Transformer votre organisation", href: "/services#transformer" },
    alt: "Équipe accompagnée dans l'adoption de nouveaux outils numériques",
    focalDesktop: "50% 45%",
    focalMobile: "50% 35%",
    anchor: "transformer",
    anchorAliases: ["transformation-digitale"],
    servicesAlt: "", // TODO : à rédiger quand la photo sera déposée
    fiche: {
      hook: { before: "Passer au numérique sans perdre ", highlight: "vos équipes", after: " en route." },
      paragraph:
        "Conseil, outils digitaux, formation des équipes, optimisation des processus et exploitation des données : nous accompagnons les organisations vers des usages numériques qui renforcent leur performance.",
      audience: ["Organisations qui évoluent vers le numérique"],
      approach: ["Un accompagnement au-delà des seuls outils", "Des ateliers adaptés au niveau et au rythme des équipes"],
      domains: [
        { label: "Conseil numérique", icon: "MessagesSquare" },
        { label: "Déploiement d'outils digitaux", icon: "Plug" },
        { label: "Formation des équipes et séminaires", icon: "Users" },
        { label: "Optimisation des processus internes", icon: "RefreshCw" },
        { label: "Exploitation des données pour la décision", icon: "LineChart" },
      ],
      link: { label: "Discuter de votre projet", href: ROUTES.contact },
      photo: { alt: "", objectPosition: "50% 50%" }, // TODO : alt factuel quand la photo sera déposée
      theme: "clair",
      photoSide: "droite",
      serviceType: "Accompagnement à la transformation digitale des organisations",
      audienceType: "Organisations qui évoluent vers le numérique",
    },
  },
] satisfies readonly Expertise[];

/** Chemin public attendu pour la photo d'une expertise (carré 1600 × 1600, WebP < 220 Ko, sujet centré). */
export const expertiseImagePath = (slug: ExpertiseSlug) => `/expertises/${slug}.webp`;

/** Libellé accessible des vignettes du hero de /services (« Formations : voir la fiche »). */
export const servicesTileLinkLabel = "voir la fiche";

/**
 * Photo de la vignette du hero de /services, sans extension : `public/images/services/<slug>`
 * en .avif, .webp ou .jpg (détectée au build). Cadrage : portrait 1:2 pour la première, carré 1:1
 * pour les deux autres ; environ 120 Ko ; ni texte, ni chiffre, ni logo incrusté.
 */
export const servicesImageBase = (slug: ExpertiseSlug) => `/images/services/${slug}`;

/**
 * Photo d'une fiche de /services, sans extension : `public/images/services/fiche-<slug>` en .avif,
 * .webp ou .jpg (détectée au build). Image maîtresse ≈ 1600 × 1600, sujet centré (recadrée en 9/10
 * en desktop, 16/9 en tablette, 10/7 en mobile), 100 à 150 Ko.
 */
export const servicesFicheImageBase = (slug: ExpertiseSlug) => `/images/services/fiche-${slug}`;
