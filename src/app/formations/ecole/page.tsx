import type { Metadata } from "next";

import { FormationsEcoleHero } from "@/components/formations/formations-ecole-hero";
import { FormationsEcoleNiveaux } from "@/components/formations/formations-ecole-niveaux";
import { FormationsEcoleRole } from "@/components/formations/formations-ecole-role";
import { JsonLd } from "@/components/seo/JsonLd";
import { pageRobots } from "@/lib/flags";
import { SITE_URL } from "@/lib/site";

const PATH = "/formations/ecole";
const title = "Formations écoles à Dakar : programmes par niveau | Active Solution";
// 148 caractères : la description du hero.
const description =
  "Active Solution accompagne les écoles primaires, collèges et lycées de Dakar : programmes par niveau, formateurs spécialisés et matériel nécessaire.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // `absolute` : le titre complet est imposé, sans le gabarit du layout.
  title: { absolute: title },
  description,
  alternates: { canonical: PATH },
  robots: pageRobots,
  // TODO : image Open Graph 1200 × 630 à fournir (aucune image de partage dans public/), puis l'ajouter ici.
  openGraph: { type: "website", siteName: "Active Solution", locale: "fr_SN", title, description, url: PATH },
  twitter: { card: "summary_large_image", title, description },
};

// « Formations » n'a pas de page propre (/formations redirige ici) : l'élément pointe vers cette page.
const breadcrumb = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "BreadcrumbList",
      "@id": `${SITE_URL}${PATH}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
        { "@type": "ListItem", position: 2, name: "Formations", item: `${SITE_URL}${PATH}` },
        { "@type": "ListItem", position: 3, name: "Pour les écoles", item: `${SITE_URL}${PATH}` },
      ],
    },
  ],
};

export default function FormationsEcolePage() {
  return (
    <main>
      <JsonLd data={breadcrumb} />
      <FormationsEcoleHero />
      <FormationsEcoleRole />
      <FormationsEcoleNiveaux />
    </main>
  );
}
