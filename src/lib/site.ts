// CONTENU PROVISOIRE : rédaction en cours. Remplacer ces valeurs sans toucher aux composants.

/*
 * Coordonnées du site : source UNIQUE (aucun numéro, e-mail ni lien WhatsApp en dur dans un composant).
 * NUMÉRO ISSU DE L'ANCIEN SITE (+221 76 809 51 59) : À CONFIRMER comme numéro WhatsApp valide avant publication.
 */
const ADDRESS = "Liberté 1, Dakar, Sénégal";

export const SITE_CONTACT = {
  whatsappNumber: "221768095159",
  whatsappMessage: "Bonjour, j'ai une question concernant ",
  phone: { display: "+221 76 809 51 59", href: "tel:+221768095159" },
  email: "contact@groupactivesolution.com",
  address: {
    display: ADDRESS,
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`,
  },
} as const;

export type SocialId = "linkedin" | "facebook" | "instagram" | "tiktok";
export type SocialLink = { id: SocialId; label: string; href: string };

// Source unique des réseaux (ordre d'affichage). Un futur réseau sans URL (href vide) s'affiche en icône désactivée.
export const SOCIALS: readonly SocialLink[] = [
  { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/actives-solutions/" },
  { id: "facebook", label: "Facebook", href: "https://www.facebook.com/share/1HX8JAow32/" },
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/active_solution_groupe" },
  { id: "tiktok", label: "TikTok", href: "https://vm.tiktok.com/ZS9UKhCFqLhBk-yJHdC/" },
];

/** Besoins proposés dans le formulaire de contact. */
export const CONTACT_NEEDS = ["Formation", "Développement digital", "Transformation digitale", "Autre"] as const;
export type ContactNeed = (typeof CONTACT_NEEDS)[number];

/** Lien wa.me avec message prérempli (encodé). */
export function getWhatsAppUrl(message: string = SITE_CONTACT.whatsappMessage): string {
  return `https://wa.me/${SITE_CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** Lien mailto (sujet et corps encodés). */
export function getMailtoUrl(subject?: string, body?: string): string {
  const params = [subject && `subject=${encodeURIComponent(subject)}`, body && `body=${encodeURIComponent(body)}`].filter(Boolean).join("&");
  return `mailto:${SITE_CONTACT.email}${params ? `?${params}` : ""}`;
}
