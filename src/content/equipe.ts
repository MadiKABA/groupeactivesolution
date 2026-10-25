/*
 * Section « Notre équipe » (page /a-propos, ancre #equipe) : « l'établi », un objet par savoir-faire.
 *
 * Textes PROVISOIRES : tout objet marqué `needsValidation: true` affiche « [À valider] » en
 * développement uniquement, et `pnpm build:prod` échoue tant qu'il en reste un (voir
 * scripts/check-equipe.mjs). Ce n'est pas une présentation des membres : aucun nom, aucune
 * photo, aucun chiffre n'est inventé. Une fois les textes validés, préférer « Active Solution »
 * à « l'équipe » dans les phrases pour qu'elles se comprennent hors contexte.
 *
 * Ce fichier ne dépend d'aucun alias ni module : il est relu tel quel par le script de contrôle.
 */

export type TeamPhoto = {
  /** Chemin dans public/ (ex. "/equipe/atelier.webp"). */
  src: string;
  /** Description factuelle de la photo réellement vue. */
  alt: string;
  width: number;
  height: number;
};

/** Membre affiché dans « Qui s'en occupe » (seulement avec des données confirmées). */
export type TeamMember = {
  /** Nom complet ou initiales, selon ce que la personne accepte de publier. */
  name: string;
  role: string;
  photo?: TeamPhoto;
};

export type TeamSkill = {
  /** Identifiant d'ancre : #equipe-<id>. */
  id: string;
  /** Numéro affiché (« 01 »). */
  number: string;
  /** Nom du savoir-faire (pastille, étiquette de la carte). */
  name: string;
  /** Phrase titre (h3). */
  title: string;
  text: string;
  tags: readonly string[];
  /** Vide tant qu'aucun membre n'est confirmé : la carte garde un emplacement (développement seulement). */
  members: readonly TeamMember[];
  /** Photo propre au savoir-faire, affichée en tête de carte (null tant qu'elle n'est pas fournie). */
  photo: TeamPhoto | null;
  needsValidation: boolean;
};

export type TeamIntro = {
  eyebrow: string;
  /**
   * Morceaux du titre, dans l'ordre de la phrase (le h2 reste une seule phrase) : les retours
   * à la ligne desktop (3 lignes) et mobile (4 lignes) sont posés par le composant.
   */
  titleParts: readonly [string, string, string, string, string];
  /** Mot du titre en doré (contenu dans l'un des morceaux). */
  titleAccent: string;
  hintFine: string;
  hintTouch: string;
  /** Phrase d'emplacement du bloc « Qui s'en occupe » (développement seulement). */
  membersPlaceholder: string;
  needsValidation: boolean;
};

export type TeamContent = {
  intro: TeamIntro;
  /** Photo réelle de l'atelier : remplace l'illustration de la scène (null → illustration). */
  workshopPhoto: TeamPhoto | null;
  skills: readonly TeamSkill[];
};

export const teamContent: TeamContent = {
  intro: {
    eyebrow: "04 — Notre équipe",
    titleParts: [
      "Derrière Active Solution,",
      "une équipe qui forme,",
      "développe,",
      "conseille",
      "et accompagne.",
    ],
    titleAccent: "équipe",
    hintFine: "Cliquez un objet pour découvrir le savoir-faire",
    hintTouch: "Touchez un savoir-faire pour le découvrir",
    membersPlaceholder: "Les membres concernés seront présentés ici (noms ou initiales à confirmer).",
    needsValidation: true,
  },
  workshopPhoto: null,
  skills: [
    {
      id: "former",
      number: "01",
      name: "Former",
      title: "Transmettre pour rendre autonome.",
      text: "Programmation, robotique, électronique, IoT et intelligence artificielle : l'équipe conçoit et anime des formations pour les établissements, les entreprises et les particuliers.",
      tags: ["Programmation", "Robotique", "IoT", "IA"],
      members: [],
      photo: null,
      needsValidation: true,
    },
    {
      id: "developper",
      number: "02",
      name: "Développer",
      title: "Concevoir des solutions qui servent.",
      text: "Sites web, applications web et mobiles, logiciels de gestion, plateformes métier, solutions SaaS : l'équipe conçoit et réalise des outils numériques adaptés à chaque organisation.",
      tags: ["Web", "Mobile", "Logiciels", "SaaS"],
      members: [],
      photo: null,
      needsValidation: true,
    },
    {
      id: "conseiller",
      number: "03",
      name: "Conseiller",
      title: "Éclairer avant de transformer.",
      text: "Analyse des besoins, digitalisation des processus, choix des outils : l'équipe accompagne les organisations dans leur transformation digitale.",
      tags: ["Audit", "Processus", "Outils", "Stratégie"],
      members: [],
      photo: null,
      needsValidation: true,
    },
    {
      id: "accompagner",
      number: "04",
      name: "Accompagner",
      title: "Rester présents après la livraison.",
      text: "Formation des équipes, prise en main des outils, suivi et évolution : l'équipe reste aux côtés de ses clients une fois la solution en service.",
      tags: ["Formation", "Suivi", "Évolution"],
      members: [],
      photo: null,
      needsValidation: true,
    },
  ],
};
