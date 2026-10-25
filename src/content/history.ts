/*
 * Section « Notre histoire » (page /a-propos, ancre #histoire).
 *
 * Textes PROVISOIRES : tout objet marqué `needsValidation: true` affiche « [À valider] » en
 * développement uniquement, et `pnpm build:prod` échoue tant qu'il en reste un (voir
 * scripts/check-history.mjs). Rien n'est inventé : les années, titres, légendes et archives
 * non fournis restent des emplacements signalés.
 *
 * Photos : `src: null` → placeholder rayé « Photo à fournir ». Une vraie photo se déclare ici
 * (chemin dans public/histoire/), sans toucher aux composants.
 *
 * Ce fichier ne dépend d'aucun alias ni module : il est relu tel quel par le script de contrôle.
 */

export type HistoryPhoto = {
  /** Chemin dans public/ (ex. "/histoire/origines.webp") ; null → placeholder. */
  src: string | null;
  /** Description factuelle de la photo (vide tant qu'elle n'est pas fournie). */
  alt: string;
  /** Légende affichée en pastille : « lieu · activité · année ». */
  caption: string;
  needsValidation: boolean;
};

export type HistoryArchive = {
  id: string;
  src: string | null;
  alt: string;
  /** « LIEU · ACTIVITÉ · ANNÉE » */
  legend: string;
  title: string;
  /** Histoire racontée dans l'archive agrandie (facultative). */
  story?: string;
  needsValidation: boolean;
};

export type HistoryChapter = {
  id: string;
  /** Numéro affiché (« 01 »). */
  number: string;
  year: string;
  /** Libellé du chapitre (« Les origines »). */
  label: string;
  /** Titre court du panneau fermé. */
  shortTitle: string;
  title: string;
  text: string;
  cta?: { label: string; href: string };
  photo: HistoryPhoto;
  /** 0 à 2 archives. */
  archives: readonly [] | readonly [HistoryArchive] | readonly [HistoryArchive, HistoryArchive];
  needsValidation: boolean;
};

export type HistoryIntro = {
  eyebrow: string;
  titleLine1: string;
  /** Début de la 2e ligne du titre, avant le mot en doré. */
  titleLine2Lead: string;
  titleLine2Accent: string;
  paragraph: string;
  needsValidation: boolean;
};

export type HistoryContent = {
  intro: HistoryIntro;
  chapters: readonly HistoryChapter[];
};

const PHOTO_TODO: HistoryPhoto = {
  src: null,
  alt: "",
  caption: "Photo à fournir · lieu · activité · année",
  needsValidation: true,
};

export const history: HistoryContent = {
  intro: {
    eyebrow: "Notre histoire",
    titleLine1: "Tout commence",
    titleLine2Lead: "par ",
    titleLine2Accent: "une idée.",
    paragraph:
      "Retour sur les étapes qui ont façonné Active Solution, de ses débuts à Dakar à son activité d'aujourd'hui.",
    needsValidation: true,
  },
  chapters: [
    {
      id: "origines",
      number: "01",
      year: "2021",
      label: "Les origines",
      shortTitle: "Les origines",
      title: "Une conviction à l'origine de tout.",
      text: "Active Solution prend forme autour d'une conviction : la technologie et le partage des connaissances peuvent contribuer concrètement au développement des organisations et des compétences.",
      photo: PHOTO_TODO,
      archives: [
        {
          id: "origines-1",
          src: null,
          alt: "",
          legend: "Lieu · activité · année",
          title: "[Archive à fournir]",
          story: "[Histoire de l'archive à fournir]",
          needsValidation: true,
        },
        {
          id: "origines-2",
          src: null,
          alt: "",
          legend: "Lieu · activité · année",
          title: "[Archive à fournir]",
          needsValidation: true,
        },
      ],
      needsValidation: true,
    },
    {
      id: "developpement",
      number: "02",
      year: "20XX",
      label: "Le développement",
      shortTitle: "Le développement",
      title: "[Titre du chapitre à fournir]",
      text: "[Texte à fournir : les grandes étapes du développement d'Active Solution.]",
      photo: PHOTO_TODO,
      archives: [
        {
          id: "developpement-1",
          src: null,
          alt: "",
          legend: "Lieu · activité · année",
          title: "[Archive à fournir]",
          needsValidation: true,
        },
      ],
      needsValidation: true,
    },
    {
      id: "aujourdhui",
      number: "03",
      year: "2026",
      label: "Aujourd'hui",
      shortTitle: "Aujourd'hui",
      title: "Une histoire qui continue de s'écrire.",
      text: "Aujourd'hui, Active Solution poursuit son développement avec la volonté de renforcer son impact et de contribuer à l'évolution de l'écosystème numérique africain.",
      cta: { label: "La suite reste à construire", href: "/#contact" },
      photo: PHOTO_TODO,
      archives: [],
      needsValidation: true,
    },
  ],
};
