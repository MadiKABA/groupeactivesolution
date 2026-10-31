/*
 * Section « Notre impact » (page /a-propos, ancre #impact).
 *
 * Les VALEURS (4+, 10+, 5, 4) viennent du propriétaire du site. Les phrases d'accompagnement,
 * l'introduction et la date sont des propositions : tout objet marqué `needsValidation: true`
 * affiche « [À valider] » en développement uniquement, et `pnpm build:prod` échoue tant qu'il en
 * reste un (voir scripts/check-impact.mjs). Le « + » signifie « au moins » : ne pas le retirer.
 *
 * Quand un chiffre change, mettre à jour `updatedAt` (une seule source pour la date affichée).
 * TODO : une fois les phrases confirmées, y nommer « Active Solution » (« Active Solution a livré
 * au moins dix applications ») pour qu'elles se citent seules.
 * TODO : aucune donnée structurée tant que les faits ne sont pas confirmés.
 *
 * Ce fichier ne dépend d'aucun alias ni module : il est relu tel quel par le script de contrôle.
 */

export type ImpactFigure = {
  id: string;
  value: number;
  /** « + » = au moins. */
  suffix?: "+";
  /** Premier mot de la ligne (blanc), puis `label` (doré) : « ans » + « d'expérience ». */
  unit: string;
  label: string;
  /** Phrase complète, lue par les lecteurs d'écran et les moteurs à la place du chiffre décoratif. */
  sentence: string;
  description: string;
  /** Précision facultative (ex. « dont 4 écoles »), affichée seulement une fois confirmée. */
  note: { text: string; confirmed: boolean } | null;
  needsValidation: boolean;
};

export type ImpactContent = {
  intro: {
    label: string;
    /** Deux lignes du titre ; `titleAccent` (doré) termine la seconde. */
    titleLines: readonly [string, string];
    titleAccent: string;
    paragraph: string;
    needsValidation: boolean;
  };
  figures: readonly ImpactFigure[];
  /** Date de mise à jour des chiffres : `iso` pour <time datetime>, `label` affiché. */
  updatedAt: { iso: string; label: string; needsValidation: boolean };
};

export const impactContent: ImpactContent = {
  intro: {
    label: "Notre impact",
    titleLines: ["L'expérience,", "en quatre "],
    titleAccent: "repères.",
    paragraph:
      "Des chiffres simples, tels que nous les connaissons aujourd'hui. Ils seront mis à jour à mesure que l'activité avance.",
    needsValidation: true,
  },
  figures: [
    {
      id: "experience",
      value: 4,
      suffix: "+",
      unit: "ans",
      label: "d'expérience",
      sentence: "Plus de quatre ans d'expérience",
      description: "Plus de quatre ans à concevoir des solutions numériques et à former.",
      note: null,
      needsValidation: true,
    },
    {
      id: "applications",
      value: 10,
      suffix: "+",
      unit: "applications",
      label: "livrées",
      sentence: "Au moins dix applications livrées",
      description: "Au moins dix projets d'application livrés à leurs utilisateurs.",
      note: null,
      needsValidation: true,
    },
    {
      id: "structures",
      value: 5,
      unit: "structures",
      label: "accompagnées",
      sentence: "Cinq structures accompagnées",
      description: "Cinq structures accompagnées dans leur transformation digitale.",
      // À confirmer : les quatre écoles font-elles partie de ces cinq structures ?
      note: { text: "dont 4 écoles", confirmed: false },
      needsValidation: true,
    },
    {
      id: "ecoles",
      value: 4,
      unit: "écoles",
      label: "accompagnées",
      sentence: "Quatre écoles accompagnées",
      description: "Quatre écoles accompagnées. [Précision à fournir : nature de l'accompagnement.]",
      note: null,
      needsValidation: true,
    },
  ],
  updatedAt: { iso: "2026-10", label: "octobre 2026", needsValidation: true },
};
