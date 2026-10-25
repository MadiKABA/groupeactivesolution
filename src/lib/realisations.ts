// CONTENU PROVISOIRE : rédaction en cours. Remplacer ces valeurs sans toucher aux composants.

export type RealisationDomain = "education" | "developpement" | "transformation";

/** Photo paysage 5:3 (2000 × 1200, WebP < 200 Ko) ; les deux photos d'un projet ont le même rapport. */
export type RealisationPhoto = { src: string; alt: string; width: number; height: number };

export type Realisation = {
  id: string;
  index: "01" | "02" | "03";
  domain: RealisationDomain;
  domainLabel: string;
  name: string;
  caption: string;
  /** 0 à 2 photos ; le projet n'est « photographié » que si ses 2 fichiers existent (vérifié côté serveur). */
  photos: RealisationPhoto[];
  /** Phrase de la tuile illustrée (mode bento, tant que la photo manque). */
  illustrationText: string;
  href?: string;
};

export const realisationsIntro = {
  eyebrow: "Réalisations",
  /** Titre en deux parties : la seconde est en dégradé doré. */
  title: "Des idées aux",
  titleHighlight: "réalisations.",
  intro: "Un aperçu de nos activités sur le terrain : formations, ateliers et projets numériques.",
  /** Rendu seulement si la route existe (src/app/realisations/page.tsx) et qu'au moins une vraie photo est présente. */
  link: { label: "Voir toutes nos réalisations", href: "/realisations" },
  sceneLabel: "Réalisations en images",
  skipLabel: "Passer la galerie",
  illustrationBadge: "Illustration",
} as const;

export const realisationsClosing = {
  text: "Chaque idée ouvre de nouvelles",
  highlight: "possibilités.",
} as const;

const PENDING_NAME = "[Nom du projet à valider]";
const PENDING_CAPTION = "[Légende à valider]";
const PENDING_ALT = "[Texte alternatif à valider]";

const photo = (file: string): RealisationPhoto => ({ src: `/realisations/${file}`, alt: PENDING_ALT, width: 2000, height: 1200 });

export const realisations: readonly Realisation[] = [
  {
    id: "projet-1",
    index: "01",
    domain: "education",
    domainLabel: "Formations",
    name: PENDING_NAME,
    caption: PENDING_CAPTION,
    photos: [photo("projet-1-a.webp"), photo("projet-1-b.webp")],
    illustrationText: "Transmettre les compétences. Préparer l'avenir.",
  },
  {
    id: "projet-2",
    index: "02",
    domain: "developpement",
    domainLabel: "Développement digital",
    name: PENDING_NAME,
    caption: PENDING_CAPTION,
    photos: [photo("projet-2-a.webp"), photo("projet-2-b.webp")],
    illustrationText: "Transformer les idées en solutions.",
  },
  {
    id: "projet-3",
    index: "03",
    domain: "transformation",
    domainLabel: "Transformation digitale",
    name: PENDING_NAME,
    caption: PENDING_CAPTION,
    photos: [photo("projet-3-a.webp"), photo("projet-3-b.webp")],
    illustrationText: "Faire évoluer les organisations.",
  },
];

/** Annonce vocale au changement de projet (scène). */
export const projectAnnouncement = (position: number, total: number, name: string) => `Projet ${position} sur ${total} : ${name}`;
