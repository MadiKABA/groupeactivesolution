import { JsonLd } from "@/components/seo/JsonLd";
import { expertises } from "@/lib/expertises";
import { SITE_CONTACT, SITE_URL } from "@/lib/site";

/*
 * Données structurées de /services (@graph : organisation, site, page, fil d'Ariane, 3 services).
 * Mêmes @id que la page À propos. Ni avis, ni prix, ni offre, ni chiffre.
 */

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const PAGE_URL = `${SITE_URL}/services`;

/** Description de /services (metadata et JSON-LD), ≤ 160 caractères. */
export const SERVICES_DESCRIPTION =
  "Formation au numérique et à la programmation, développement de sites, d'applications et de logiciels, transformation digitale : nos services à Dakar, Sénégal.";

const areaServed = [
  { "@type": "City", name: SITE_CONTACT.address.locality },
  { "@type": "Country", name: "Sénégal" },
];

function servicesJsonLd() {
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
        address: {
          "@type": "PostalAddress",
          streetAddress: SITE_CONTACT.address.street,
          addressLocality: SITE_CONTACT.address.locality,
          addressCountry: SITE_CONTACT.address.countryCode,
        },
        // TODO : telephone et email seulement une fois confirmés (numéro WhatsApp repris de l'ancien site).
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
        "@type": "WebPage",
        "@id": `${PAGE_URL}#page`,
        name: "Nos services",
        description: SERVICES_DESCRIPTION,
        url: PAGE_URL,
        inLanguage: "fr",
        isPartOf: { "@id": WEBSITE_ID },
        about: { "@id": ORG_ID },
        hasPart: expertises.map((expertise) => ({ "@id": `${PAGE_URL}#${expertise.anchor}` })),
        breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "Services", item: PAGE_URL },
        ],
      },
      // Contenu des fiches visibles ; domaines en catalogue sans prix (aucun prix, avis ni note).
      ...expertises.map(({ anchor, name, fiche }) => ({
        "@type": "Service",
        "@id": `${PAGE_URL}#${anchor}`,
        name,
        description: fiche.paragraph,
        serviceType: fiche.serviceType,
        url: `${PAGE_URL}#${anchor}`,
        provider: { "@id": ORG_ID },
        areaServed,
        audience: { "@type": "Audience", audienceType: fiche.audienceType },
        hasOfferCatalog: {
          "@type": "OfferCatalog",
          name: `${name} : domaines`,
          itemListElement: fiche.domains.map((domain) => ({
            "@type": "Offer",
            itemOffered: { "@type": "Service", name: domain.label },
          })),
        },
      })),
    ],
  };
}

export function ServicesJsonLd() {
  return <JsonLd data={servicesJsonLd()} />;
}
