/*
 * Section « Nos convictions » (page /a-propos, ancre #convictions).
 *
 * Textes VALIDÉS (novembre 2026) pour les titres, textes et blocs « Ce que nous en faisons ». Tout objet marqué `needsValidation: true` affiche « [À valider] » en
 * développement uniquement, et `pnpm build:prod` échoue tant qu'il en reste un (voir
 * scripts/check-convictions.mjs). Chaque phrase doit rester compréhensible seule (citable).
 *
 * Photos : `src: null` → placeholder rayé « Photo à fournir ». Une vraie photo se déclare ici
 * (chemin dans public/convictions/, 940 × 560 minimum, paysage), sans toucher aux composants.
 *
 * Ce fichier ne dépend d'aucun alias ni module : il est relu tel quel par le script de contrôle.
 */

export type ConvictionPhoto = {
  /** Chemin dans public/ (ex. "/convictions/partager.webp") ; null → placeholder. */
  src: string | null;
  /** Description factuelle de la photo ; placeholder : « Photo à venir : … ». */
  alt: string;
  /** Légende affichée sur la photo (seulement avec une vraie photo). */
  caption: string;
};

export type Conviction = {
  /** Identifiant d'ancre : #conviction-<id>. */
  id: string;
  /** Numéro affiché (« 01 »). */
  number: string;
  /** Mot du cercle, affiché en capitales par le CSS (accents conservés : « Utilité »). */
  word: string;
  /** Mot de contexte sous le mot du cercle (« le savoir »). */
  micro: string;
  /** Intitulé de la conviction (étiquette du panneau). */
  label: string;
  /** Phrase titre (h3), autonome. */
  title: string;
  text: string;
  /** Bloc « Ce que nous en faisons ». */
  proof: string;
  photo: ConvictionPhoto;
  needsValidation: boolean;
};

export type ConvictionsIntro = {
  surtitre: string;
  /** Trois lignes du titre ; la dernière est suivie du mot en doré. */
  titreLignes: readonly [string, string, string];
  titreAccent: string;
  needsValidation: boolean;
};

export type ConvictionsContent = {
  intro: ConvictionsIntro;
  convictions: readonly Conviction[];
};

const photoTodo = (label: string): ConvictionPhoto => ({
  src: null,
  alt: `Photo à venir : illustration de la conviction « ${label} »`,
  caption: "Légende à fournir",
});

export const convictionsContent: ConvictionsContent = {
  intro: {
    surtitre: "03 — Ce qui nous anime",
    titreLignes: ["Nos convictions", "donnent du sens", "à ce que nous"],
    titreAccent: "construisons.",
    needsValidation: false,
  },
  convictions: [
    {
      id: "partager",
      number: "01",
      word: "Partager",
      micro: "le savoir",
      label: "La connaissance transforme",
      title: "Le savoir prend toute sa valeur lorsqu’il se partage.",
      text: "Ce que nous savons ne vaut que s’il aide quelqu’un d’autre à avancer. Alors nous formons, nous accompagnons et nous transmettons, pour que chacun puisse relever ses propres défis.",
      proof: "Des cours de programmation, de robotique et d’intelligence artificielle, pour les jeunes comme pour les équipes.",
      photo: photoTodo("La connaissance transforme"),
      needsValidation: false,
    },
    {
      id: "utilite",
      number: "02",
      word: "Utilité",
      micro: "la technologie",
      label: "La technologie doit être utile",
      title: "Innover n’a de sens que lorsque cela répond à un besoin réel.",
      text: "Une technologie qui ne sert à personne ne vaut rien. Nous construisons des solutions qui simplifient vraiment la vie de ceux qui s’en servent.",
      proof: "Chaque projet part d’un besoin que nous avons vu sur le terrain.",
      photo: photoTodo("La technologie doit être utile"),
      needsValidation: false,
    },
    {
      id: "ensemble",
      number: "03",
      word: "Ensemble",
      micro: "le progrès",
      label: "Le progrès se construit ensemble",
      title: "Les grandes avancées naissent de l’intelligence collective.",
      text: "Seuls, nous allons vite. Ensemble, nous allons plus loin. Les meilleures idées naissent quand on partage son expérience et ses compétences.",
      proof: "Nous construisons avec nos clients et nos partenaires, jamais à leur place.",
      photo: photoTodo("Le progrès se construit ensemble"),
      needsValidation: false,
    },
    {
      id: "accessible",
      number: "04",
      word: "Accessible",
      micro: "le numérique",
      label: "Le numérique doit être accessible",
      title: "Le progrès numérique doit être une opportunité pour tous.",
      text: "Peu importe d’où l’on part : chacun mérite de pouvoir apprendre, créer et saisir sa chance dans le numérique.",
      proof: "Des parcours ouverts à tous les âges et à tous les niveaux.",
      photo: photoTodo("Le numérique doit être accessible"),
      needsValidation: false,
    },
  ],
};
