// CONTENU PROVISOIRE : rédaction en cours. Remplacer ces valeurs sans toucher aux composants.

import { ROUTES } from "./routes";

export type FaqCategory = { id: string; label: string };

/** Segment de réponse : `strong` met le passage en gras (bleu nuit, 700), sans HTML libre. */
export type FaqSegment = { text: string; strong?: boolean };

export type FaqItem = {
  /** Numéro continu sur toute la FAQ (01 → 12), conservé quel que soit le filtre. */
  id: number;
  categoryId: string;
  question: string;
  answer: readonly FaqSegment[];
  /** "todo" : réponse neutre affichée en attendant la vraie réponse (jamais dans le JSON-LD). */
  status: "ready" | "todo";
};

export const faqIntro = {
  eyebrow: "FAQ",
  /** Titre en deux parties : la seconde est en dégradé or foncé. */
  title: "Vos questions, nos",
  titleHighlight: "réponses.",
  tablistLabel: "Catégories de questions",
} as const;

/** Bloc contact (aside) : le lien WhatsApp vient de src/lib/site.ts. */
export const faqContact = {
  label: "Contact",
  title: "Vous ne trouvez pas votre réponse ?",
  text: "Parlez-nous de votre projet ou de votre besoin de formation.",
  whatsapp: { label: "Écrire sur WhatsApp", ariaLabel: "Écrire sur WhatsApp (s'ouvre dans un nouvel onglet)" },
  cta: { label: "Nous contacter", href: ROUTES.contact },
} as const;

export const faqCategories: readonly FaqCategory[] = [
  { id: "entreprise", label: "L'entreprise" },
  { id: "formations", label: "Formations" },
  { id: "projets", label: "Projets numériques" },
  { id: "collaboration", label: "Collaboration" },
];

/** Réponse neutre des questions en attente de rédaction : aucune promesse. */
const PENDING_ANSWER: readonly FaqSegment[] = [{ text: "Chaque situation est différente. Contactez-nous pour en discuter." }];

export const faqItems: readonly FaqItem[] = [
  {
    id: 1,
    categoryId: "entreprise",
    question: "Qui est Active Solution Digital Service ?",
    status: "ready",
    answer: [
      { text: "Active Solution Digital Service est une entreprise basée à " },
      { text: "Dakar, au Sénégal", strong: true },
      {
        text: ". Elle forme aux métiers du numérique, conçoit des solutions digitales sur mesure et accompagne la transformation digitale des organisations.",
      },
    ],
  },
  {
    id: 2,
    categoryId: "entreprise",
    question: "Dans quels domaines intervenez-vous ?",
    status: "ready",
    answer: [
      { text: "Nous intervenons dans trois domaines : " },
      { text: "les formations", strong: true },
      { text: ", " },
      { text: "le développement de solutions numériques", strong: true },
      { text: " et " },
      { text: "la transformation digitale", strong: true },
      { text: " des organisations." },
    ],
  },
  // TODO(contenu) : réponse à fournir.
  { id: 3, categoryId: "entreprise", question: "Intervenez-vous en dehors de Dakar ?", status: "todo", answer: PENDING_ANSWER },
  {
    id: 4,
    categoryId: "formations",
    question: "Quelles formations proposez-vous, et pour qui ?",
    status: "ready",
    answer: [
      {
        text: "Programmation et développement web, robotique, électronique et systèmes embarqués, Internet des objets et intelligence artificielle, pour ",
      },
      { text: "les établissements scolaires, les organisations et les apprenants", strong: true },
      { text: "." },
    ],
  },
  // TODO(contenu) : réponse à fournir.
  { id: 5, categoryId: "formations", question: "Faut-il des connaissances préalables ?", status: "todo", answer: PENDING_ANSWER },
  // TODO(contenu) : réponse à fournir.
  {
    id: 6,
    categoryId: "formations",
    question: "Les formations ont-elles lieu en présentiel, en ligne ou dans les établissements ?",
    status: "todo",
    answer: PENDING_ANSWER,
  },
  {
    id: 7,
    categoryId: "projets",
    question: "Quels types de solutions réalisez-vous ?",
    status: "ready",
    answer: [
      {
        text: "Sites web, applications web et mobiles, logiciels de gestion, plateformes métier, solutions SaaS et automatisation de processus.",
      },
    ],
  },
  {
    id: 8,
    categoryId: "projets",
    question: "Comment se déroule un projet, de la première discussion à la livraison ?",
    status: "ready",
    answer: [
      { text: "En " },
      { text: "quatre étapes", strong: true },
      {
        text: " : comprendre votre besoin, définir la solution, la concevoir et la réaliser, puis vous accompagner et la faire évoluer.",
      },
    ],
  },
  {
    id: 9,
    categoryId: "projets",
    question: "Que recouvre concrètement la transformation digitale ?",
    status: "ready",
    answer: [
      {
        text: "C'est l'accompagnement d'une organisation pour digitaliser ses processus, intégrer des outils numériques et former ses équipes à leur usage.",
      },
    ],
  },
  // TODO(contenu) : réponse à fournir.
  { id: 10, categoryId: "collaboration", question: "Comment obtenir un devis, et quels sont vos tarifs ?", status: "todo", answer: PENDING_ANSWER },
  // TODO(contenu) : réponse à fournir.
  { id: 11, categoryId: "collaboration", question: "Quels sont les délais habituels ?", status: "todo", answer: PENDING_ANSWER },
  // TODO(contenu) : réponse à fournir.
  { id: 12, categoryId: "collaboration", question: "Assurez-vous un suivi après la livraison ?", status: "todo", answer: PENDING_ANSWER },
];

/** Nombre de questions par catégorie, calculé depuis les items (jamais écrit en dur). */
export function countByCategory(items: readonly FaqItem[] = faqItems): Record<string, number> {
  const counts: Record<string, number> = Object.fromEntries(faqCategories.map((category) => [category.id, 0]));
  for (const item of items) counts[item.categoryId] = (counts[item.categoryId] ?? 0) + 1;
  return counts;
}

export const faqItemsOf = (categoryId: string, items: readonly FaqItem[] = faqItems) =>
  items.filter((item) => item.categoryId === categoryId);

export const faqNumber = (item: FaqItem) => String(item.id).padStart(2, "0");
export const faqAnswerText = (item: FaqItem) => item.answer.map((segment) => segment.text).join("");

/** Identifiants stables (pattern accordéon et onglets WAI-ARIA). */
export const faqQuestionId = (item: FaqItem) => `faq-question-${item.id}`;
export const faqAnswerId = (item: FaqItem) => `faq-answer-${item.id}`;
export const faqTabId = (category: FaqCategory) => `faq-tab-${category.id}`;
export const FAQ_PANEL_ID = "faq-panel";

/** JSON-LD FAQPage : uniquement les réponses rédigées (status "ready"), jamais la réponse neutre. */
export function faqJsonLd(items: readonly FaqItem[] = faqItems) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items
      .filter((item) => item.status === "ready")
      .map((item) => ({
        "@type": "Question",
        name: item.question,
        acceptedAnswer: { "@type": "Answer", text: faqAnswerText(item) },
      })),
  };
}
