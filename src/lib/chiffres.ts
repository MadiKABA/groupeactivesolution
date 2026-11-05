// Contenu validé : novembre 2026 (document Textes validés de la page d'accueil). Modifier ces valeurs sans toucher aux composants.

import { typo } from "./typography";

export type Chiffre = {
  id: string;
  /** Valeur finale, rendue telle quelle dans le HTML serveur. */
  value: number;
  /** « + » = au moins : ne pas le retirer. */
  suffix?: "+";
  /** Première partie de la ligne (« projets »), puis `label` en doré (« livrés »). */
  unit: string;
  label: string;
  /** Phrase lue par les lecteurs d'écran (« Au moins 11 projets livrés »). */
  sentence: string;
  /** Détail en texte courant. */
  description: string;
};

export const chiffresIntro = {
  /** Étiquette de section (à valider). */
  eyebrow: "En chiffres",
  /** « Ce que nous avons déjà construit. » : deux lignes, le dernier mot en doré. */
  titleLines: ["Ce que nous", "avons déjà "] as const,
  titleAccent: "construit.",
  intro: typo("Des chiffres simples, tels que nous les connaissons aujourd’hui."),
  listLabel: "Active Solution en chiffres",
} as const;

export const chiffres: readonly Chiffre[] = [
  {
    id: "projets",
    value: 11,
    suffix: "+",
    unit: "projets",
    label: "livrés",
    sentence: "Au moins 11 projets livrés",
    description: "sites web, applications et logiciels remis à leurs utilisateurs.",
  },
  {
    id: "structures",
    value: 7,
    suffix: "+",
    unit: "structures",
    label: "accompagnées",
    sentence: "Au moins 7 structures accompagnées",
    description: "entreprises et institutions dans leur transformation digitale.",
  },
  {
    id: "ecoles",
    value: 5,
    suffix: "+",
    unit: "écoles",
    label: "accompagnées",
    sentence: "Au moins 5 écoles accompagnées",
    description: "dans l’initiation de leurs élèves au numérique.",
  },
];

/** Date de mise à jour des chiffres (seule source de la mention de bas de section). */
export const chiffresUpdatedAt = { iso: "2026-11", label: "novembre 2026" } as const;
