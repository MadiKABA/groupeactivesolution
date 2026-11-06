// Contenu validé : novembre 2026 (document Textes validés de la page d'accueil). Modifier ces valeurs sans toucher aux composants.

import { typo } from "./typography";

export type RealisationDomain = "education" | "developpement" | "transformation";

/** Photo paysage 5:3 (1280 × 768, WebP < 200 Ko). */
export type RealisationPhoto = { src: string; alt: string; width: number; height: number };

export type Realisation = {
  id: string;
  index: "01" | "02" | "03";
  domain: RealisationDomain;
  domainLabel: string;
  /** Légende : affichée seulement si la photo de la carte existe (vérifié côté serveur). */
  caption: string;
  /** Deux photos par projet : la « scène » s'active quand les 6 fichiers existent (sinon mode bento). */
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

const photo = (file: string, alt: string): RealisationPhoto => ({ src: `/realisations/${file}`, alt, width: 1280, height: 768 });

export const realisations: readonly Realisation[] = [
  {
    id: "projet-1",
    index: "01",
    domain: "education",
    domainLabel: "Formations",
    caption: "Des élèves qui créent, pas seulement qui consomment.",
    photos: [
      photo("projet-1-a.webp", "Élèves en blouse bleue et rose devant des ordinateurs portables, autour d’une grande table, pendant un atelier numérique"),
      photo("projet-1-b.webp", "Élèves en blouse bleue réunis autour d’une grande feuille de papier sur un bureau d’école, en plein travail de groupe"),
    ],
  },
  {
    id: "projet-2",
    index: "02",
    domain: "developpement",
    domainLabel: "Développement digital",
    caption: "Des outils pensés pour les commerçants d’ici.",
    photos: [
      photo("projet-2-a.webp", "Page d’accueil de Tam Tam FinConnect : des mains autour d’une calebasse remplie de billets"),
      photo("projet-2-b.webp", "Page d’accueil de Topoto, l’assistant digital pour véhicule, avec son titre et ses boutons de téléchargement"),
    ],
  },
  {
    id: "projet-3",
    index: "03",
    domain: "transformation",
    domainLabel: "Transformation digitale",
    caption: "Des entrepreneurs qui gagnent du temps.",
    photos: [
      photo("projet-3-a.webp", "Salle informatique remplie de jeunes travaillant sur des ordinateurs, écrans habillés de tissus colorés"),
      photo("projet-3-b.webp", "Un formateur penché vers des enfants devant un ordinateur portable affichant Scratch"),
    ],
  },
];

/** Annonce vocale au changement de projet (scène). */
export const projectAnnouncement = (position: number, total: number, label: string) => `Carte ${position} sur ${total} : ${label}`;
