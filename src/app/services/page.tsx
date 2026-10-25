import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";

import { ServicesHero } from "@/components/services/ServicesHero";
import { SERVICES_DESCRIPTION, ServicesJsonLd } from "@/components/services/ServicesJsonLd";
import { expertises, servicesImageBase, type ExpertiseSlug } from "@/lib/expertises";
import { SITE_URL } from "@/lib/site";

const title = "Formation et développement digital à Dakar | Active Solution";
const description = SERVICES_DESCRIPTION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // `absolute` : le titre complet est imposé, sans le gabarit du layout.
  title: { absolute: title },
  description,
  alternates: { canonical: "/services" },
  robots: { index: true, follow: true },
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

export default function ServicesPage() {
  // Photo des vignettes : premier format présent dans public/ (vérifié au build, page statique).
  const photos: Partial<Record<ExpertiseSlug, string>> = {};
  for (const { slug } of expertises) {
    const src = PHOTO_EXTENSIONS.map((ext) => `${servicesImageBase(slug)}${ext}`).find((path) =>
      existsSync(join(process.cwd(), "public", path)),
    );
    if (src) photos[slug] = src;
  }

  return (
    <main className="bg-surface-warm">
      <ServicesJsonLd />
      <ServicesHero photos={photos} />

      {expertises.map((expertise) => (
        // TODO : fiche détaillée à venir (tâche distincte) ; seuls le nom et la phrase validés sont affichés.
        <section
          key={expertise.slug}
          id={expertise.anchor}
          aria-labelledby={`${expertise.anchor}-title`}
          className="sv-target"
        >
          {/* Anciennes ancres : mènent au début de la même fiche */}
          {expertise.anchorAliases.map((alias) => (
            <span key={alias} id={alias} aria-hidden="true" className="sv-target-alias" />
          ))}
          <div className="site-container">
            <h2 id={`${expertise.anchor}-title`} className="sv-target-title">
              {expertise.name}
            </h2>
            <p className="sv-target-text">{expertise.description}</p>
          </div>
        </section>
      ))}
    </main>
  );
}
