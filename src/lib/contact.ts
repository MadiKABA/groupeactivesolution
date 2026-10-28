// CONTENU PROVISOIRE : rédaction en cours. Remplacer ces valeurs sans toucher aux composants.
// Coordonnées, réseaux et besoins : src/lib/site.ts (source unique).

export const contactIntro = {
  eyebrow: "Contact",
  /** Titre en deux parties : la seconde est en dégradé doré. */
  title: "Parlons de votre",
  titleHighlight: "projet.",
  intro: "Formation, application, site web ou transformation digitale : décrivez-nous votre besoin, nous vous répondons directement.",
} as const;

/** Hero de la page /contact (titre en mots ; « Parlons-en. » en doré). */
export const contactHero = {
  // Espace insécable avant le « ? ».
  title: "Une idée, un besoin, une question\u00a0?",
  titleHighlight: "Parlons-en.",
  lead: "Écrivez-nous ou contactez-nous directement : nous lisons chaque message et revenons vers vous.",
  cta: "Écrire un message",
  replyLabel: "Réponse sous",
  replyValue: "24\u00a0h",
} as const;

export const contactInfoLabels = {
  phone: "Téléphone",
  email: "E-mail",
  address: "Adresse",
  copyPhone: "Copier le numéro de téléphone",
  copyEmail: "Copier l'adresse e-mail",
  openMaps: "Ouvrir l'adresse dans Google Maps (nouvel onglet)",
  seeMaps: "Voir sur Maps",
  seeMapsLabel: "Voir sur Maps (nouvel onglet)",
  follow: "Suivez-nous",
  newTab: "(nouvel onglet)",
  soon: "(bientôt disponible)",
} as const;

export const contactCopy = {
  copied: "Copié ✓",
  announced: "Copié dans le presse-papiers",
  failed: "Copie impossible",
} as const;

export const contactForm = {
  title: "Décrivez votre besoin",
  text: "Votre message est préparé ici, puis envoyé depuis WhatsApp ou votre messagerie.",
  needLegend: "Votre besoin",
  nameLabel: "Votre nom",
  messageLabel: "Votre message",
  whatsapp: "Envoyer sur WhatsApp",
  email: "Ou par e-mail",
  notice: "Ce formulaire ne stocke rien : il prépare votre message et l'ouvre dans WhatsApp ou votre application de messagerie.",
  errors: {
    need: "Choisissez votre besoin.",
    name: "Indiquez votre nom (2 caractères au moins).",
    message: "Décrivez votre besoin (10 caractères au moins).",
    summary: (count: number) => `${count === 1 ? "Un champ est à compléter" : `${count} champs sont à compléter`} avant l'envoi.`,
  },
  confirm: {
    whatsapp: "Message préparé. Il s'ouvre dans WhatsApp.",
    email: "Message préparé. Il s'ouvre dans votre messagerie.",
  },
  /** Sans JavaScript : liens directs. */
  fallbackWhatsapp: "Écrire sur WhatsApp",
  fallbackEmail: "Écrire par e-mail",
  emailSubjectSuffix: "Contact via le site",
} as const;

/** Message préparé (identique pour WhatsApp et l'e-mail). */
export const buildContactMessage = (need: string, name: string, message: string) =>
  `Bonjour Active Solution, je souhaite vous parler d'un projet.\nBesoin : ${need}\nNom : ${name}\n\n${message}`;
