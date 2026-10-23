/*
 * Section « Des idées aux réalisations » (page d'accueil).
 * Passer provisional à false et renseigner legende et alt une fois les vraies photos validées.
 * Aucune légende, date, lieu, client ni chiffre n'est inventé : la légende vient d'Active Solution.
 */

export type RealisationCategorie = "Formation" | "Atelier" | "Projet" | "Événement";

export type RealisationVisuelId = "principale" | "secondaire-1" | "secondaire-2";

export type RealisationVisuel = {
  id: RealisationVisuelId;
  /** Nom du fichier attendu dans public/realisations/. */
  fichier: string;
  categorie: RealisationCategorie;
  /** Légende courte (une ligne), fournie par Active Solution. */
  legende?: string;
  alt: string;
  /** Points focaux (object-position) : cadres desktop et mobile (4:3 et 4:5). */
  focalDesktop: string;
  focalMobile: string;
  /** true tant que la photo, la catégorie et la légende ne sont pas validées. */
  provisional: boolean;
};

export const realisationsIntro = {
  eyebrow: "Réalisations",
  /** Mots du titre, révélés un à un ; le dernier est en dégradé doré. Retour à la ligne après le 2e sous 640px. */
  titleWords: ["Des", "idées", "aux", "réalisations."],
  intro: "Un aperçu de nos activités sur le terrain : formations, ateliers et projets numériques.",
  // Destination à confirmer : /realisations n'existe pas encore.
  link: { label: "Voir toutes nos réalisations", href: "/realisations" },
} as const;

/** Texte alternatif générique, à remplacer par une description de la photo réelle. */
export const genericAlt = (categorie: RealisationCategorie) =>
  `Photo de réalisation, catégorie ${categorie.toLowerCase()} (description à compléter)`;

/** Texte de la pastille tant que la légende n'est pas validée (développement uniquement). */
export const PROVISIONAL_CAPTION = "[Légende à valider]";

export const realisationVisuels: readonly [RealisationVisuel, RealisationVisuel, RealisationVisuel] = [
  {
    id: "principale",
    fichier: "principale.webp",
    categorie: "Formation",
    legende: "",
    alt: genericAlt("Formation"),
    focalDesktop: "50% 50%",
    focalMobile: "50% 50%",
    provisional: true,
  },
  {
    id: "secondaire-1",
    fichier: "secondaire-1.webp",
    categorie: "Atelier",
    legende: "",
    alt: genericAlt("Atelier"),
    focalDesktop: "50% 50%",
    focalMobile: "50% 50%",
    provisional: true,
  },
  {
    id: "secondaire-2",
    fichier: "secondaire-2.webp",
    categorie: "Projet",
    legende: "",
    alt: genericAlt("Projet"),
    focalDesktop: "50% 50%",
    focalMobile: "50% 50%",
    provisional: true,
  },
];

/**
 * Chemin public d'un visuel. Formats attendus (WebP, < 220 Ko, sujet dans la moitié centrale
 * de la largeur : le recadrage mobile 4:5 en retire environ 43 %) :
 * principale 1800 × 1300, secondaire-1 et secondaire-2 1400 × 1000.
 */
export const realisationImagePath = (visuel: RealisationVisuel) => `/realisations/${visuel.fichier}`;

/**
 * Légende affichée : la légende validée ; en développement, un repère tant que le visuel est
 * provisoire ; rien en production tant qu'il n'est pas validé et légendé.
 */
export function captionFor(visuel: RealisationVisuel): string | null {
  if (!visuel.provisional && visuel.legende) return visuel.legende;
  if (visuel.provisional && process.env.NODE_ENV !== "production") return PROVISIONAL_CAPTION;
  return null;
}
