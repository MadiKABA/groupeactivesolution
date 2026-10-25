import { SITE_CONTACT, SITE_URL, SOCIALS } from "@/lib/site";

/*
 * Données structurées de la page /a-propos (@graph : organisation, site, page, fil d'Ariane).
 * Uniquement des informations confirmées : aucune rue précise, aucun code postal, aucune coordonnée GPS.
 */

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;
const PAGE_URL = `${SITE_URL}/a-propos`;

/** Description de la page /a-propos (metadata et JSON-LD). 155 caractères (limite : 160). */
export const ABOUT_DESCRIPTION =
  "Active Solution, agence digitale à Dakar : formation au numérique, développement de solutions et transformation digitale. Notre histoire et notre ambition.";

export function aboutJsonLd() {
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
        // TODO : année de création à confirmer (« Depuis 2021 » dans le hero).
        foundingDate: "2021",
        address: {
          "@type": "PostalAddress",
          streetAddress: SITE_CONTACT.address.street,
          addressLocality: SITE_CONTACT.address.locality,
          addressCountry: SITE_CONTACT.address.countryCode,
        },
        // TODO : `geo` (GeoCoordinates) seulement avec la latitude et la longitude exactes relevées sur Google Maps.
        telephone: SITE_CONTACT.phone.display,
        email: SITE_CONTACT.email,
        areaServed: { "@type": "Country", name: "Sénégal" },
        knowsAbout: [
          "Formation numérique",
          "Développement web et mobile",
          "Transformation digitale",
        ],
        // URL directes des profils uniquement. TODO : URL directes des pages Facebook et TikTok
        // (les liens actuels sont des liens courts de partage, exclus).
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
        "@type": "AboutPage",
        "@id": `${PAGE_URL}#page`,
        name: "À propos d'Active Solution",
        description: ABOUT_DESCRIPTION,
        url: PAGE_URL,
        inLanguage: "fr",
        about: { "@id": ORG_ID },
        isPartOf: { "@id": WEBSITE_ID },
        breadcrumb: { "@id": `${PAGE_URL}#breadcrumb` },
      },
      {
        "@type": "BreadcrumbList",
        "@id": `${PAGE_URL}#breadcrumb`,
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
          { "@type": "ListItem", position: 2, name: "À propos", item: PAGE_URL },
        ],
      },
    ],
  };
}

export function AboutJsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(aboutJsonLd()).replace(/</g, "\\u003c") }}
    />
  );
}
