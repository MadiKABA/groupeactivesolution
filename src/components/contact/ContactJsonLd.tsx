import { JsonLd } from "@/components/seo/JsonLd";
import { ROUTES } from "@/lib/routes";
import { SITE_CONTACT, SITE_URL, SOCIALS } from "@/lib/site";

/*
 * Données structurées de /contact (@graph : organisation, site, page de contact, fil d'Ariane).
 * Mêmes @id que les autres pages. Ni horaires, ni avis, ni note, ni coordonnées GPS, ni délai de réponse.
 */

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const PAGE_URL = `${SITE_URL}${ROUTES.contact}`;

/** Description de /contact (metadata et JSON-LD), ≤ 160 caractères. */
export const CONTACT_DESCRIPTION =
  "Contactez Active Solution Digital Service à Dakar, Sénégal : formation, développement digital et transformation digitale. Téléphone, WhatsApp et e-mail.";

function contactJsonLd() {
  const { phone, email, address } = SITE_CONTACT;
  const telephone = phone.href.replace("tel:", "");
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ProfessionalService",
        "@id": ORG_ID,
        name: "Active Solution Digital Service",
        alternateName: "Active Solution",
        url: SITE_URL,
        logo: `${SITE_URL}/logos/logo.png`,
        telephone,
        email,
        address: {
          "@type": "PostalAddress",
          streetAddress: address.street,
          addressLocality: address.locality,
          addressCountry: address.countryCode,
        },
        contactPoint: {
          "@type": "ContactPoint",
          contactType: "customer service",
          telephone,
          email,
          areaServed: "SN",
          availableLanguage: "fr",
        },
        // URL directes des profils uniquement (les liens Facebook et TikTok sont des liens courts de partage, exclus).
        sameAs: SOCIALS.filter((social) => social.canonical).map((social) => social.href),
      },
      {
        "@type": "WebSite",
        "@id": WEBSITE_ID,
        url: SITE_URL,
        name: "Active Solution",
        inLanguage: "fr",
        publisher: { "@id": ORG_ID },
      },
      {
        "@type": "ContactPage",
        "@id": `${PAGE_URL}#page`,
        name: "Contact",
        description: CONTACT_DESCRIPTION,
        url: PAGE_URL,
        inLanguage: "fr",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORG_ID },
        mainEntity: { "@id": ORG_ID },
        breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Contact", item: PAGE_URL },
        ],
      },
    ],
  };
}

export function ContactJsonLd() {
  return <JsonLd data={contactJsonLd()} />;
}
