/*
 * Coordonnées du site : source UNIQUE (aucun numéro ni lien WhatsApp en dur dans un composant).
 * NUMÉRO ISSU DE L'ANCIEN SITE (+221 76 809 51 59) : À CONFIRMER comme numéro WhatsApp valide avant publication.
 */
export const SITE_CONTACT = {
  whatsappNumber: "221768095159",
  whatsappMessage: "Bonjour, j'ai une question concernant ",
} as const;

/** Lien wa.me avec message prérempli (encodé). */
export function getWhatsAppUrl(message: string = SITE_CONTACT.whatsappMessage): string {
  return `https://wa.me/${SITE_CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;
}
