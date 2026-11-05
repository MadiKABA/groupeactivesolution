// Contenu validé : novembre 2026 (document Textes validés de la page d'accueil). Modifier ces valeurs sans toucher aux composants.

import { ROUTES } from "./routes";
import { typo } from "./typography";

export type FaqItem = {
  /** Numéro affiché (01 → 03). */
  id: number;
  question: string;
  answer: string;
};

export const faqIntro = {
  eyebrow: "FAQ",
  /** Titre en deux parties : la seconde est en dégradé or foncé. */
  title: "Vos questions, nos",
  titleHighlight: "réponses.",
} as const;

/** Bloc contact (aside) : le lien WhatsApp vient de src/lib/site.ts. */
export const faqContact = {
  label: "Contact",
  title: typo("Vous ne trouvez pas votre réponse ?"),
  text: typo("Une question, un projet, un besoin de formation ? Écrivez-nous, nous vous répondons avec plaisir."),
  whatsapp: { label: "Écrire sur WhatsApp", ariaLabel: "Écrire sur WhatsApp (s’ouvre dans un nouvel onglet)" },
  cta: { label: "Nous contacter", href: ROUTES.contact },
} as const;

export const faqItems: readonly FaqItem[] = [
  {
    id: 1,
    question: typo("Comment fonctionne le partenariat avec une école ?"),
    answer:
      "Vous signez un partenariat avec Active Solution, et nous assurons les cours d’informatique de vos élèves dans votre école, avec nos formateurs, tout au long de l’année.",
  },
  {
    id: 2,
    question: typo("Combien de temps pour réaliser mon projet numérique ?"),
    answer:
      "Tout dépend de votre cahier des charges. En règle générale, un site vitrine est prêt en deux à quatre semaines, et une application sur mesure en deux à quatre mois. Après un premier échange, nous vous donnons un délai précis, et nous nous y tenons.",
  },
  {
    id: 3,
    question: typo("Intervenez-vous en dehors de Dakar ?"),
    answer: "Oui. Nous nous déplaçons dans les régions du Sénégal pour former et accompagner. Dites-nous où vous êtes.",
  },
];

export const faqNumber = (item: FaqItem) => String(item.id).padStart(2, "0");

/** JSON-LD FAQPage : exactement les questions et réponses affichées. */
export function faqJsonLd(items: readonly FaqItem[] = faqItems) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}
