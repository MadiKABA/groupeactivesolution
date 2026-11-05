// Textes du hero « Notre manifeste » (page /a-propos) : validés, ne pas les reformuler.

export const aboutHero = {
  badge: "Dakar · Sénégal · Depuis 2021",
  // Deux lignes en desktop ; `highlight` est le mot en doré de la 1re ligne.
  title: {
    line1: { before: "Enseigner le ", highlight: "futur," },
    line2: "bâtir le présent.",
  },
  paragraphs: [
    "Chez Active Solution, nous croyons que chaque jeune a en lui de quoi créer le numérique de demain. Alors nous l’aidons à apprendre, nous accompagnons les entreprises et les organisations, et nous avançons à leurs côtés.",
    "Notre engagement : rendre le numérique accessible à tous, et former ceux qui le feront grandir en Afrique.",
  ],
  cta: { label: "Découvrir notre histoire", href: "#histoire" },
  // Indice décoratif sous les arches (appareils à souris uniquement).
  hint: "Survolez les arches pour les ouvrir",
  // TODO : vraies légendes (lieu · activité · année) à fournir avec les photos.
  caption: "[Légendes des photos : lieu · activité · année]",
} as const;

export type AboutArchId = "enseigner" | "batir";

type AboutArch = {
  label: string;
  src: string;
  /** Photo provisoire (banque d'images) : listée par scripts/check-images.mjs, à remplacer par une vraie photo. */
  provisional: boolean;
  /** Description de la photo (aria-label de l'arche, role="img"). */
  description: string;
  /** Phrase révélée à l'ouverture des battants (décorative), une entrée par ligne. */
  phrase: readonly [string, string];
};

/*
 * Photos des deux arches. Une photo n'est utilisée que si son fichier existe dans public/
 * (vérifié au build par la page) ; sinon l'arche affiche un fond bleu nuit de repli.
 * TODO : descriptions définitives à fournir. Celles-ci décrivent seulement ce que montrent les
 * photos actuelles, sans les attribuer à Active Solution (lieu et équipe non confirmés).
 */
export const aboutArches: Readonly<Record<AboutArchId, AboutArch>> = {
  enseigner: {
    label: "Enseigner",
    src: "/about/hero-enseigner.jpg",
    provisional: true,
    description: "Un formateur présente des graphiques à un groupe d’apprenants dans une salle de formation",
    phrase: ["Former", "les talents"],
  },
  batir: {
    label: "Bâtir",
    src: "/about/hero-batir.jpg",
    provisional: true,
    description: "Deux jeunes femmes travaillent sur ordinateur dans un espace de travail partagé",
    phrase: ["Créer", "les solutions"],
  },
};
