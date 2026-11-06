// Contenu validé : novembre 2026 (document Textes validés de la page d'accueil). Modifier ces valeurs sans toucher aux composants.

import { Code2, GraduationCap, Settings2, type LucideIcon } from "lucide-react";

import { FORMATION_AUDIENCES } from "./formations";
import { ROUTES } from "./routes";
import { typo } from "./typography";

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
  | "ShieldCheck" | "ReceiptText" | "Workflow"
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
  intro: typo(
    "Nous formons les talents, nous développons vos outils numériques et nous accompagnons la transformation de votre organisation.",
  ),
} as const;

// Textes de l'accueil validés (novembre 2026) ; les fiches de /services (champ `fiche`) sont indépendantes.
export const expertises = [
  {
    slug: "education",
    number: "01",
    name: "Formations",
    icon: GraduationCap,
    tagline: "Donner aux talents les moyens de créer le futur.",
    description:
      "Votre école s’associe à Active Solution, et nous venons apprendre à vos élèves à comprendre, créer et maîtriser le numérique.",
    services: ["Scratch", "Robotique", "Intelligence artificielle", "Objets connectés", "Cybersécurité", "Protection des enfants en ligne"],
    idealFor: [FORMATION_AUDIENCES.schools, FORMATION_AUDIENCES.youth, FORMATION_AUDIENCES.organisations],
    link: { label: "Devenir école partenaire", href: ROUTES.contact },
    alt: "Élèves suivant un atelier Scratch projeté sur un écran interactif",
    focalDesktop: "50% 45%",
    focalMobile: "50% 40%",
    anchor: "former",
    anchorAliases: [],
    servicesAlt: "", // TODO : à rédiger quand la photo sera déposée
    fiche: {
      hook: { before: "De la première ligne de code au ", highlight: "premier robot." },
      paragraph:
        "Chez nous, les élèves ne regardent pas le numérique, ils le fabriquent. Nous venons dans votre école leur apprendre à coder, à construire des robots et à utiliser l’intelligence artificielle sans danger.",
      audience: ["Écoles primaires", "Collèges", "Lycées"],
      approach: ["Un partenariat adapté à votre école", "Des cours pensés pour chaque âge", "Des formateurs passionnés dans vos classes"],
      domains: [
        { label: "Scratch et programmation", icon: "Code" },
        { label: "Robotique", icon: "Bot" },
        { label: "Objets connectés", icon: "Wifi" },
        { label: "Intelligence artificielle", icon: "Sparkles" },
        { label: "Cybersécurité et protection en ligne", icon: "ShieldCheck" },
        { label: "Culture numérique et créativité", icon: "Lightbulb" },
      ],
      link: { label: "Devenir école partenaire", href: ROUTES.contact },
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
    description: typo(
      "Vous avez une idée, un besoin, un projet qui vous tient à cœur ? Nous en faisons un site, une application ou un logiciel qui vous ressemble et qui vous fait gagner du temps.",
    ),
    services: [
      "Sites web",
      "Applications web et mobiles",
      "Logiciels de gestion",
      "Plateformes métier",
      "Solutions SaaS",
    ],
    idealFor: ["Entreprises", "Collectivités", "Entrepreneurs"],
    link: { label: "Voir nos réalisations", href: "/#realisations" },
    alt: "Tableau de bord d'une application de gestion avec chiffre d'affaires, ventes et graphique",
    focalDesktop: "50% 50%",
    focalMobile: "50% 45%",
    anchor: "creer",
    anchorAliases: ["developpement-digital"],
    servicesAlt: "", // TODO : à rédiger quand la photo sera déposée
    fiche: {
      hook: { before: "Des solutions numériques construites autour de ", highlight: "votre métier." },
      paragraph:
        "Votre activité mérite des outils qui lui ressemblent. Nous créons votre site, votre application ou votre logiciel de gestion en partant de votre façon de travailler, pour vous faire gagner du temps dès le premier jour.",
      audience: ["Entreprises", "Startups", "Entrepreneurs", "Collectivités", "Associations"],
      approach: ["Des outils pensés pour les réalités d’ici", "Un projet qui commence par vous écouter"],
      domains: [
        { label: "Sites vitrines et boutiques en ligne", icon: "Globe" },
        { label: "Applications mobiles", icon: "Smartphone" },
        { label: "Plateformes de gestion", icon: "Layers" },
        { label: "Logiciels de facturation et de stock", icon: "ReceiptText" },
        { label: "Solutions SaaS", icon: "Cloud" },
        { label: "IA et automatisation", icon: "Zap" },
      ],
      link: { label: "Discuter de votre projet", href: ROUTES.contact },
      photo: { alt: "", objectPosition: "50% 50%" }, // TODO : alt factuel quand la photo sera déposée
      theme: "sombre",
      photoSide: "gauche",
      serviceType: "Développement de sites web, d'applications et de logiciels de gestion",
      audienceType: "Entreprises, startups, entrepreneurs, collectivités et associations",
    },
  },
  {
    slug: "transformation",
    number: "03",
    name: "Transformation digitale",
    icon: Settings2,
    tagline: "Faire évoluer les organisations durablement.",
    description: typo(
      "Vos équipes perdent du temps sur des tâches répétitives ? Nous les accompagnons pour adopter les bons outils et travailler plus simplement, plus vite, avec moins de stress.",
    ),
    services: ["Conseil", "Digitalisation des processus", "Formation des équipes", "Automatisation"],
    idealFor: ["Entreprises", "Institutions", "Associations"],
    link: { label: "Transformer votre organisation", href: ROUTES.contact },
    alt: "Participants à une formation montrant un code QR affiché sur leur téléphone",
    focalDesktop: "50% 45%",
    focalMobile: "50% 35%",
    anchor: "transformer",
    anchorAliases: ["transformation-digitale"],
    servicesAlt: "", // TODO : à rédiger quand la photo sera déposée
    fiche: {
      hook: { before: "Passer au numérique sans perdre ", highlight: "vos équipes", after: " en route." },
      paragraph:
        typo("Vos équipes passent trop de temps sur des tâches répétitives ? Nous les aidons à adopter les bons outils, à automatiser ce qui peut l’être et à travailler plus simplement, à leur rythme."),
      audience: ["Entreprises", "Institutions", "Associations", "Équipes en croissance"],
      approach: ["Un accompagnement qui va au-delà des outils", "Des ateliers adaptés au niveau et au rythme de chaque équipe"],
      domains: [
        { label: "Conseil numérique", icon: "MessagesSquare" },
        { label: "Déploiement d’outils", icon: "Plug" },
        { label: "Formation des équipes", icon: "Users" },
        { label: "Automatisation des tâches", icon: "Workflow" },
        { label: "Tableaux de bord et décisions", icon: "LayoutDashboard" },
      ],
      link: { label: "Discuter de votre projet", href: ROUTES.contact },
      photo: { alt: "", objectPosition: "50% 50%" }, // TODO : alt factuel quand la photo sera déposée
      theme: "clair",
      photoSide: "droite",
      serviceType: "Accompagnement à la transformation digitale des organisations",
      audienceType: "Entreprises, institutions, associations et équipes en croissance",
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
