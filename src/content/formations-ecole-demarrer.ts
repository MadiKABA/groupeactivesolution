/*
 * Section « Comment démarrer » de /formations/ecole : données seules, sans présentation.
 * `needsValidation: true` : texte à confirmer par le client. Aucun chiffre, durée ni promesse.
 */

type StepBase = { id: string; number: string; title: string; subtitle: string; needsValidation: boolean };

export type DemarrerStep =
  | (StepBase & { kind: "keywords"; keywords: readonly string[] })
  | (StepBase & { kind: "text"; text: string; photo: { src: string; alt: string } | null })
  | (StepBase & { kind: "list"; items: readonly string[] });

export const demarrerIntro = {
  eyebrow: "Comment démarrer",
  titleLines: ["Un programme se construit", "avec votre établissement."],
  text: "Chaque établissement a ses objectifs, ses élèves et ses contraintes. Nous construisons avec vous un parcours adapté, depuis le premier échange jusqu'à la mise en œuvre des activités.",
} as const;

export const demarrerSteps: readonly DemarrerStep[] = [
  {
    id: "echange",
    number: "01",
    title: "Échange",
    subtitle: "Comprendre votre établissement.",
    kind: "keywords",
    keywords: ["Objectifs", "Niveaux", "Contraintes"],
    needsValidation: false,
  },
  {
    id: "seance-pilote",
    number: "02",
    title: "Séance pilote",
    subtitle: "Faire découvrir notre approche.",
    kind: "text",
    text: "Une première expérience permet aux élèves de découvrir les activités et à l'établissement d'en apprécier la pertinence.",
    // Photo à fournir (public/…) ; alt rédigé seulement après l'avoir vue.
    photo: null,
    needsValidation: false,
  },
  {
    id: "programme",
    number: "03",
    title: "Programme sur mesure",
    subtitle: "Construire un parcours adapté.",
    kind: "list",
    items: ["Niveaux scolaires", "Domaines d'apprentissage", "Format d'intervention", "Organisation du programme"],
    needsValidation: false,
  },
  {
    id: "suivi",
    number: "04",
    title: "Suivi et valorisation",
    subtitle: "Faire vivre les réalisations.",
    kind: "text",
    text: "Nous accompagnons le déroulement des activités et contribuons à valoriser les réalisations des élèves à travers des projets et des événements, comme des hackathons ou des concours entre établissements.",
    photo: null,
    needsValidation: true,
  },
];
