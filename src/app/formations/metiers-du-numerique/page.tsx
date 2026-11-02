import type { Metadata } from "next";

import { MetiersHero } from "@/components/formations/metiers-hero";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageRobots } from "@/lib/flags";
import { SITE_URL } from "@/lib/site";

const PATH = "/formations/metiers-du-numerique";
const title = "Se former aux métiers du numérique à Dakar | Active Solution";
// Description du hero, abrégée pour tenir en 160 caractères.
const description =
  "Active Solution vous accompagne dans l'apprentissage des métiers du numérique à Dakar : développement web et mobile, marketing digital et référent digital.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  robots: pageRobots,
  // TODO : image Open Graph 1200 × 630 à fournir (aucune image de partage dans public/).
  openGraph: { type: "website", siteName: "Active Solution", locale: "fr_SN", title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
};

// « Formations » n'a pas de page propre (/formations redirige vers /formations/ecole).
const breadcrumb = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}${PATH}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Formations", item: `${SITE_URL}/formations/ecole` },
        { "@type": "ListItem", position: 3, name: "Se former aux métiers du numérique", item: `${SITE_URL}${PATH}` },
      ],
    },
  ],
};

export default function MetiersDuNumeriquePage() {
  return (
    <main>
      <JsonLd data={breadcrumb} />
      <MetiersHero />
    </main>
  );
}
