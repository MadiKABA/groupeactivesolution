/*
 * Section « Notre méthode » (page d'accueil) : quatre étapes.
 * Textes à valider par Active Solution : ne pas les enrichir (ni durées, ni livrables, ni garanties).
 */

export type MethodeSegment = { texte: string; fort?: boolean };

export type MethodeEtape = {
  id: string;
  /** Numéro affiché (« 01 »…). */
  numero: string;
  /** Titre court affiché. */
  titre: string;
  /** Titre complet, annoncé aux lecteurs d'écran. */
  titreComplet: string;
  /** Description ; les segments `fort` sont rendus en <strong>. */
  segments: readonly MethodeSegment[];
};

export const methodeIntro = {
  eyebrow: "Notre méthode",
  /** Mots du titre, révélés un à un ; le dernier est en dégradé doré. Retour à la ligne après le 2e sous 640px. */
  titleWords: ["De", "l'idée", "à", "la", "solution."],
  intro: "Quatre étapes, de l'écoute de votre besoin à l'évolution de votre solution.",
} as const;

export const methodeEtapes: readonly MethodeEtape[] = [
  {
    id: "comprendre",
    numero: "01",
    titre: "Comprendre",
    titreComplet: "Comprendre le besoin",
    segments: [
      { texte: "Nous écoutons, analysons votre contexte et cadrons vos " },
      { texte: "objectifs", fort: true },
      { texte: "." },
    ],
  },
  {
    id: "definir",
    numero: "02",
    titre: "Définir",
    titreComplet: "Définir la solution",
    segments: [
      { texte: "Nous proposons une approche adaptée : " },
      { texte: "fonctionnalités", fort: true },
      { texte: ", parcours et technologies." },
    ],
  },
  {
    id: "concevoir",
    numero: "03",
    titre: "Concevoir & réaliser",
    titreComplet: "Concevoir et réaliser",
    segments: [
      { texte: "Nous développons, testons et " },
      { texte: "livrons", fort: true },
      { texte: " la solution, ou nous animons la formation." },
    ],
  },
  {
    id: "accompagner",
    numero: "04",
    titre: "Accompagner",
    titreComplet: "Accompagner et faire évoluer",
    segments: [
      { texte: "Nous " },
      { texte: "formons vos équipes", fort: true },
      { texte: ", assurons le suivi et faisons évoluer la solution." },
    ],
  },
];

export const methodeCta = {
  title: "Créons ensemble votre prochain projet numérique.",
  text: "Contactez-nous pour discuter de votre projet, d'une collaboration ou simplement échanger.",
  // Destination à confirmer : /contact n'existe pas encore.
  label: "Nous contacter",
  href: "/contact",
} as const;

/**
 * Géométrie de la pile (unités du viewBox 720 × 740) : demi-largeur visible `hw`, centre `cy`
 * de la face supérieure et opacité du trait au repos. Index 0 : couche du logo ; 1 à 4 : étapes.
 */
export const METHODE_LAYERS = [
  { hw: 80, cy: 90, stroke: 0.3 },
  { hw: 120, cy: 180, stroke: 0.4 },
  { hw: 160, cy: 290, stroke: 0.5 },
  { hw: 200, cy: 420, stroke: 0.6 },
  { hw: 240, cy: 570, stroke: 0.75 },
] as const;

/** Position des cartes en desktop (unités de conception, composition de 1216 de large). */
export const METHODE_CARD_SIDE = ["left", "right", "left", "right"] as const;
