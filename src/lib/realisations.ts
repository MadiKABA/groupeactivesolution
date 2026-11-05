// Contenu validé : novembre 2026 (document Textes validés de la page d'accueil). Modifier ces valeurs sans toucher aux composants.

import { typo } from "./typography";

export type RealisationDomain = "education" | "developpement" | "transformation";

/** Photo paysage 5:3 (2000 × 1200, WebP < 200 Ko). */
export type RealisationPhoto = { src: string; alt: string; width: number; height: number };

export type Realisation = {
  id: string;
  index: "01" | "02" | "03";
  domain: RealisationDomain;
  domainLabel: string;
  /** Légende : affichée seulement si la photo de la carte existe (vérifié côté serveur). */
  caption: string;
  /** Une photo par carte (la « scène », qui exige 2 photos par projet, ne s'active donc pas : mode bento). */
  photos: RealisationPhoto[];
};

export const realisationsIntro = {
  eyebrow: "Réalisations",
  /** Titre en deux parties : la seconde est en dégradé doré. */
  title: "Des idées aux",
  titleHighlight: "réalisations.",
  intro: typo("Sur le terrain, avec des élèves, des entrepreneurs et des équipes : voici ce que nous construisons ensemble."),
  /** Rendu seulement si la route existe (src/app/realisations/page.tsx) et qu'au moins une vraie photo est présente. */
  link: { label: "Voir toutes nos réalisations", href: "/realisations" },
  sceneLabel: "Réalisations en images",
  skipLabel: "Passer la galerie",
} as const;

export const realisationsClosing = {
  text: "Chaque idée ouvre de nouvelles",
  highlight: "possibilités.",
} as const;

const photo = (file: string, alt: string): RealisationPhoto => ({ src: `/realisations/${file}`, alt, width: 2000, height: 1200 });

export const realisations: readonly Realisation[] = [
  {
    id: "projet-1",
    index: "01",
    domain: "education",
    domainLabel: "Formations",
    caption: "Des élèves qui créent, pas seulement qui consomment.",
    photos: [photo("carte-1.webp", "Atelier de formation au numérique avec des élèves et des ordinateurs")],
  },
  {
    id: "projet-2",
    index: "02",
    domain: "developpement",
    domainLabel: "Développement digital",
    caption: "Des outils pensés pour les commerçants d’ici.",
    photos: [photo("carte-2.webp", "Capture d’écran d’un projet réalisé par Active Solution")],
  },
  {
    id: "projet-3",
    index: "03",
    domain: "transformation",
    domainLabel: "Transformation digitale",
    caption: "Des entrepreneurs qui gagnent du temps.",
    photos: [photo("carte-3.webp", "Tournée numérique d’Active Solution")],
  },
];

/** Annonce vocale au changement de projet (scène). */
export const projectAnnouncement = (position: number, total: number, label: string) => `Carte ${position} sur ${total} : ${label}`;
