/*
 * Section « Notre méthode » (page d'accueil) : quatre étapes.
 * Contenu validé : novembre 2026 (document Textes validés de la page d'accueil). Modifier ces valeurs sans toucher aux composants.
 * Les passages entre ** sont rendus en gras (<strong>) via splitStrong().
 */

import { ROUTES } from "./routes";
import { splitStrong, typo, type StrongSegment } from "./typography";

export type MethodeSegment = StrongSegment;

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
  titleWords: ["De", "l’idée", "à", "la", "solution."],
  intro: "Quatre étapes, pour que votre projet naisse d’une vraie écoute et grandisse avec vous.",
} as const;

export const methodeEtapes: readonly MethodeEtape[] = [
  {
    id: "comprendre",
    numero: "01",
    titre: "Comprendre",
    titreComplet: "Comprendre",
    segments: splitStrong("Nous prenons le temps de vous écouter, de comprendre votre réalité et vos **objectifs**."),
  },
  {
    id: "definir",
    numero: "02",
    titre: "Définir",
    titreComplet: "Définir",
    segments: splitStrong("Ensemble, nous choisissons les **fonctionnalités** et les technologies qui vous correspondent."),
  },
  {
    id: "concevoir",
    numero: "03",
    titre: "Concevoir et réaliser",
    titreComplet: "Concevoir et réaliser",
    segments: splitStrong("Nous construisons, testons et **livrons** votre solution, ou nous animons la formation."),
  },
  {
    id: "accompagner",
    numero: "04",
    titre: "Accompagner",
    titreComplet: "Accompagner",
    segments: splitStrong("Nous **formons vos équipes** et restons à vos côtés pour faire évoluer votre solution."),
  },
];

export const methodeCta = {
  title: "Parlons de votre projet, nous sommes là pour l’écouter.",
  text: typo("Un projet, une école, une idée ou une simple question : écrivez-nous, nous vous répondons avec plaisir."),
  label: "Nous écrire",
  href: ROUTES.contact,
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
