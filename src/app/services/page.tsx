import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";

import { Partners } from "@/components/sections/partners/Partners";
import { CtaGlassBand } from "@/components/services/CtaGlassBand";
import { ExpertiseSection } from "@/components/services/fiches/ExpertiseSection";
import { FicheFocus } from "@/components/services/fiches/FicheFocus";
import { ServicesHero } from "@/components/services/ServicesHero";
import { SERVICES_DESCRIPTION, ServicesJsonLd } from "@/components/services/ServicesJsonLd";
import { expertises, servicesFicheImageBase, servicesImageBase, type ExpertiseSlug } from "@/lib/expertises";
import { servicesCta } from "@/lib/services";
import { pageRobots } from "@/lib/flags";
import { SITE_URL } from "@/lib/site";

const title = "Formation et développement digital à Dakar | Active Solution";
const description = SERVICES_DESCRIPTION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // `absolute` : le titre complet est imposé, sans le gabarit du layout.
  title: { absolute: title },
  description,
  alternates: { canonical: "/services" },
  robots: pageRobots,
  // TODO : image Open Graph 1200 × 630 (ex. public/og/services.jpg) à fournir, puis l'ajouter ici.
  openGraph: {
    type: "website",
    siteName: "Active Solution",
    locale: "fr_SN",
    title,
    description,
    url: "/services",
  },
  twitter: { card: "summary_large_image", title, description },
};

const PHOTO_EXTENSIONS = [".avif", ".webp", ".jpg"] as const;

/** Premier format présent dans public/ (vérifié au build, page statique). */
function findPhoto(base: string): string | undefined {
  return PHOTO_EXTENSIONS.map((ext) => `${base}${ext}`).find((path) => existsSync(join(process.cwd(), "public", path)));
}

export default function ServicesPage() {
  const tilePhotos: Partial<Record<ExpertiseSlug, string>> = {};
  const fichePhotos: Partial<Record<ExpertiseSlug, string>> = {};
  for (const { slug } of expertises) {
    tilePhotos[slug] = findPhoto(servicesImageBase(slug));
    fichePhotos[slug] = findPhoto(servicesFicheImageBase(slug));
  }

  return (
    <main>
      <ServicesJsonLd />
      <ServicesHero photos={tilePhotos} />

      <div id="expertises" className="xp-root">
        <FicheFocus />
        {expertises.map((expertise) => (
          <ExpertiseSection
            key={expertise.slug}
            expertise={expertise}
            photo={fichePhotos[expertise.slug]}
          />
        ))}
      </div>

      <CtaGlassBand {...servicesCta} />
      {/* Section Partenaires de l'accueil, à l'identique (fond clair : jonction directe avec le CTA sombre) */}
      <Partners />
    </main>
  );
}
