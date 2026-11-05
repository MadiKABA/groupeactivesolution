// Contenu validé : novembre 2026 (document Textes validés de la page d'accueil). Modifier ces valeurs sans toucher aux composants.

/*
 * Coordonnées du site : source UNIQUE (aucun numéro, e-mail ni lien WhatsApp en dur dans un composant).
 */
const STREET = "Liberté 1";
const CITY = "Dakar";
const ADDRESS = `${STREET}, ${CITY}, Sénégal`;

/**
 * URL publique du site (metadataBase, canonical, Open Graph, JSON-LD, sitemap), sans barre finale.
 * NEXT_PUBLIC_SITE_URL : URL *.vercel.app pendant la relecture ; par défaut, le domaine officiel.
 */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://www.groupactivesolution.com").replace(/\/+$/, "");

export const SITE_CONTACT = {
  whatsappNumber: "221768095159",
  whatsappMessage: "Bonjour, j'ai une question concernant ",
  phone: { display: "+221 76 809 51 59", href: "tel:+221768095159" },
  email: "contact.activesolution@gmail.com",
  address: {
    display: ADDRESS,
    // Champs du PostalAddress (JSON-LD) : ni rue précise ni code postal connus, ne pas en inventer.
    street: STREET,
    locality: CITY,
    countryCode: "SN",
    mapsUrl: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ADDRESS)}`,
  },
} as const;

export type SocialId = "linkedin" | "facebook" | "instagram" | "tiktok";
/** `canonical` : URL directe du profil, seule admise dans `sameAs` (JSON-LD) ; pas un lien court de partage. */
export type SocialLink = { id: SocialId; label: string; href: string; canonical?: boolean };

// Source unique des réseaux (ordre d'affichage). Un futur réseau sans URL (href vide) s'affiche en icône désactivée.
export const SOCIALS: readonly SocialLink[] = [
  { id: "linkedin", label: "LinkedIn", href: "https://www.linkedin.com/company/actives-solutions/", canonical: true },
  { id: "facebook", label: "Facebook", href: "https://www.facebook.com/share/1HX8JAow32/" },
  { id: "instagram", label: "Instagram", href: "https://www.instagram.com/active_solution_groupe", canonical: true },
  { id: "tiktok", label: "TikTok", href: "https://vm.tiktok.com/ZS9UKhCFqLhBk-yJHdC/" },
];

/** Besoins proposés dans le formulaire de contact. */
export const CONTACT_NEEDS = ["Formation", "Développement digital", "Transformation digitale", "Autre"] as const;
export type ContactNeed = (typeof CONTACT_NEEDS)[number];

/** Lien wa.me avec message prérempli (encodé). */
export function getWhatsAppUrl(message: string = SITE_CONTACT.whatsappMessage): string {
  return `https://wa.me/${SITE_CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/** Lien wa.me sans message prérempli (numéro de SITE_CONTACT, confirmé : identique au téléphone). */
export const WHATSAPP_URL = `https://wa.me/${SITE_CONTACT.whatsappNumber}`;

/** Lien mailto (sujet et corps encodés). */
export function getMailtoUrl(subject?: string, body?: string): string {
  const params = [subject && `subject=${encodeURIComponent(subject)}`, body && `body=${encodeURIComponent(body)}`].filter(Boolean).join("&");
  return `mailto:${SITE_CONTACT.email}${params ? `?${params}` : ""}`;
}
