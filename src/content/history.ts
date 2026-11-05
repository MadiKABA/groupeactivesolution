/*
 * Section « Notre histoire » (page /a-propos, ancre #histoire).
 *
 * Textes VALIDÉS (novembre 2026). Un futur contenu non validé se marque `needsValidation: true` :
 * « [À valider] » s'affiche alors en développement uniquement, et `pnpm build:prod` échoue tant
 * qu'il en reste un (voir scripts/check-history.mjs). Rien n'est inventé : les archives non
 * fournies restent des emplacements, visibles seulement avec les placeholders (`src: null`) ;
 * en production, une archive n'est rendue que si elle a une vraie image ET une vraie légende.
 * Le nom du client du chapitre 2022 n'est cité nulle part (volontairement).
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
  /** Chemin dans public/histoire/ ; null → emplacement « Archive à fournir » (développement seulement). */
  src: string | null;
  alt: string;
  /** « LIEU · ACTIVITÉ · ANNÉE » réels ; vide tant que l'archive n'est pas fournie. */
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

/** Légende d'un emplacement d'archive non fourni (jamais rendue en production). */
export const ARCHIVE_LEGEND_TODO = "Lieu · activité · année";

/**
 * Une archive n'est rendue en production qu'avec une vraie image ET une vraie légende ;
 * avec les placeholders, les emplacements restent visibles.
 */
export const isArchiveReady = (archive: HistoryArchive) =>
  archive.src !== null && archive.legend.trim() !== "" && archive.legend !== ARCHIVE_LEGEND_TODO;

/** Emplacement de photo de panneau : « en attente de données », non bloquant (rien n'est rendu en production). */
const PHOTO_TODO: HistoryPhoto = {
  src: null,
  alt: "",
  caption: "Photo à fournir · lieu · activité · année",
  needsValidation: false,
};

export const history: HistoryContent = {
  intro: {
    eyebrow: "Notre histoire",
    titleLine1: "Tout commence",
    titleLine2Lead: "par ",
    titleLine2Accent: "une idée.",
    paragraph: "Voici comment l’aventure Active Solution a commencé, et où elle en est aujourd’hui.",
    needsValidation: false,
  },
  chapters: [
    {
      id: "origines",
      number: "01",
      year: "2021",
      label: "Les origines",
      shortTitle: "Une conviction à l’origine de tout",
      title: "Une conviction à l’origine de tout",
      text: "En 2021, tout commence par une idée simple : le numérique peut changer la vie des gens, à condition de le partager. Active Solution naît de cette envie d’apprendre et de faire apprendre.",
      photo: PHOTO_TODO,
      archives: [
        {
          id: "origines-1",
          src: null,
          alt: "",
          legend: ARCHIVE_LEGEND_TODO,
          title: "[Archive à fournir]",
          story: "[Histoire de l’archive à fournir]",
          needsValidation: false,
        },
        {
          id: "origines-2",
          src: null,
          alt: "",
          legend: ARCHIVE_LEGEND_TODO,
          title: "[Archive à fournir]",
          needsValidation: false,
        },
      ],
      needsValidation: false,
    },
    {
      id: "developpement",
      number: "02",
      year: "2022",
      label: "Le développement",
      shortTitle: "Le développement",
      title: "Le développement",
      text: "En 2022, une boutique de parfumerie nous confie son premier projet de développement. Après les formations et les accompagnements, nous construisons notre première solution sur mesure, et nous découvrons le plaisir de voir un outil changer le quotidien d’une entreprise.",
      photo: PHOTO_TODO,
      archives: [
        {
          id: "developpement-1",
          src: null,
          alt: "",
          legend: ARCHIVE_LEGEND_TODO,
          title: "[Archive à fournir]",
          needsValidation: false,
        },
      ],
      needsValidation: false,
    },
    {
      id: "aujourdhui",
      number: "03",
      year: "2026",
      label: "Aujourd’hui",
      shortTitle: "Aujourd’hui",
      title: "Aujourd’hui",
      text: "En 2026, l’aventure prend de l’ampleur. Nous développons des applications et des boutiques en ligne, nous accompagnons les jeunes, et nous changeons la façon d’apprendre l’informatique dans les collèges et les lycées. Hier, les élèves apprenaient à utiliser Word et Excel. Aujourd’hui, ils créent leurs jeux, leurs robots, et apprennent à se protéger en ligne.",
      photo: PHOTO_TODO,
      archives: [],
      needsValidation: false,
    },
  ],
};
