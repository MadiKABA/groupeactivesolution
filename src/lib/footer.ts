// CONTENU PROVISOIRE : rédaction en cours. Remplacer ces valeurs sans toucher aux composants.

/*
 * Textes et liens du footer. Les coordonnées et les réseaux viennent de `site.ts` (source unique).
 * Ancres : la navigation du header pointe vers des routes qui n'existent pas encore (/services,
 * /realisations, /formations…) ; le footer renvoie donc aux sections de la page d'accueil
 * (ids existants : expertise-*, realisations, methode, formations, faq, contact).
 */

export type FooterLink = { label: string; href: string };

export const footerTagline = {
  text: "Former les talents, créer les solutions,",
  highlight: "transformer les organisations.",
} as const;

export const footerServices: readonly FooterLink[] = [
  { label: "Formation", href: "/#expertise-education" },
  { label: "Développement digital", href: "/#expertise-developpement" },
  { label: "Transformation digitale", href: "/#expertise-transformation" },
];

export const footerNavigation: readonly FooterLink[] = [
  { label: "Réalisations", href: "/#realisations" },
  { label: "Méthode", href: "/#methode" },
  { label: "Formations", href: "/#formations" },
  { label: "FAQ", href: "/#faq" },
  { label: "Contact", href: "/#contact" },
];

/** Chaque lien n'est rendu que si la page existe (src/app/<route>/page.tsx) : contenu juridique à fournir. */
export const footerLegal: readonly FooterLink[] = [
  { label: "CGU", href: "/cgu" },
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "Politique de confidentialité", href: "/politique-de-confidentialite" },
];

export const footerLabels = {
  services: "Services",
  navigation: "Navigation",
  legal: "Informations légales",
  newTab: "(nouvel onglet)",
  soon: "(bientôt disponible)",
  copyright: "Active Solution Digital Service. Tous droits réservés.",
  backToTop: "Retour en haut",
  logoAlt: "Active Solution Digital Service",
} as const;
