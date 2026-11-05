/*
 * Section « Notre équipe » (page /a-propos, ancre #equipe) : « l'établi », un objet par savoir-faire.
 *
 * Textes VALIDÉS (novembre 2026). Tout objet futur marqué `needsValidation: true` affiche « [À valider] » en
 * développement uniquement, et `pnpm build:prod` échoue tant qu'il en reste un (voir
 * scripts/check-equipe.mjs). Ce n'est pas une présentation des membres : aucun nom, aucune
 * photo, aucun chiffre n'est inventé.
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
  /** Accord de la personne obtenu : tant que ce n'est pas `true`, rien n'est affiché (ni nom, ni photo). */
  consent: boolean;
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
  /** Phrase d'emplacement en attente de données (champ distinct, non bloquant pour le build). */
  membersPlaceholderPending: boolean;
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
    // Placeholder « en attente de données » (développement seulement), non bloquant pour le build :
    // son texte visible reste à valider, ou la ligne à masquer, tant qu'aucun membre n'est renseigné.
    membersPlaceholderPending: true,
    needsValidation: false,
  },
  workshopPhoto: null,
  skills: [
    {
      id: "former",
      number: "01",
      name: "Former",
      title: "Transmettre pour rendre autonome.",
      text: "Nous formons les élèves, les professionnels et les équipes à la programmation, à la robotique et à l’intelligence artificielle. Nos méthodes sont pratiques et progressives, pour développer leur autonomie et leur confiance.",
      tags: ["Scratch", "Robotique", "IA", "Cybersécurité"],
      members: [],
      photo: null,
      needsValidation: false,
    },
    {
      id: "developper",
      number: "02",
      name: "Développer",
      title: "Concevoir des solutions qui servent.",
      text: "Sites web, applications web et mobiles, logiciels de gestion, solutions SaaS : nous concevons et réalisons des outils adaptés à votre activité. Chaque projet commence par l’écoute de vos besoins et de vos usages.",
      tags: ["Web", "Mobile", "Logiciels", "SaaS"],
      members: [],
      photo: null,
      needsValidation: false,
    },
    {
      id: "conseiller",
      number: "03",
      name: "Conseiller",
      title: "Éclairer avant de transformer.",
      text: "Avant de transformer, nous prenons le temps d’analyser vos besoins et vos processus. Nous vous aidons ensuite à choisir les outils les mieux adaptés à votre organisation, et à les mettre en place avec méthode.",
      tags: ["Audit", "Processus", "Outils", "Stratégie"],
      members: [],
      photo: null,
      needsValidation: false,
    },
    {
      id: "accompagner",
      number: "04",
      name: "Accompagner",
      title: "Rester présents après la livraison.",
      text: "Une fois la solution en service, nous restons à vos côtés. Nous formons vos équipes à la prise en main, assurons le suivi et la faisons évoluer selon vos besoins.",
      tags: ["Formation", "Suivi", "Évolution"],
      members: [],
      photo: null,
      needsValidation: false,
    },
  ],
};
