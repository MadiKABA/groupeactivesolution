import { existsSync } from "node:fs";
import { join } from "node:path";
import type { Metadata } from "next";

import { AboutHero } from "@/components/about/AboutHero";
import { ABOUT_DESCRIPTION, AboutJsonLd } from "@/components/about/AboutJsonLd";
import { ConvictionsSection } from "@/components/about/convictions/ConvictionsSection";
import { TeamSection } from "@/components/about/equipe/TeamSection";
import { HistorySection } from "@/components/about/history/HistorySection";
import { ImpactSection } from "@/components/about/impact/ImpactSection";
import { TrustBand } from "@/components/sections/trust/TrustBand";
import { aboutArches, type AboutArchId } from "@/lib/about";
import { pageRobots } from "@/lib/flags";
import { SITE_URL } from "@/lib/site";

const title = "À propos d'Active Solution | Agence digitale et formation à Dakar";
const description = ABOUT_DESCRIPTION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // `absolute` : le titre complet est imposé, sans le gabarit du layout.
  title: { absolute: title },
  description,
  alternates: { canonical: "/a-propos" },
  robots: pageRobots,
  // TODO : image Open Graph 1200 × 630 (ex. public/og/a-propos.jpg) à fournir, puis l'ajouter ici.
  openGraph: {
    type: "website",
    siteName: "Active Solution",
    locale: "fr_SN",
    title,
    description,
    url: "/a-propos",
  },
  twitter: { card: "summary_large_image", title, description },
  // Pas de geo.region / geo.placename ni de coordonnées tant qu'elles ne sont pas confirmées.
};

export default function AboutPage() {
  // Photo absente de public/ → fond bleu nuit de repli dans l'arche (vérifié au build, page statique).
  const photos: Partial<Record<AboutArchId, string>> = {};
  for (const id of Object.keys(aboutArches) as AboutArchId[]) {
    const { src } = aboutArches[id];
    if (existsSync(join(process.cwd(), "public", src))) photos[id] = src;
  }

  return (
    <main>
      <AboutJsonLd />
      <AboutHero photos={photos} />
      {/* Cible du bouton du hero ; scroll-margin-top : règle globale des section[id]. */}
      <HistorySection />
      <ConvictionsSection />
      <TeamSection />
      <ImpactSection />
      {/* Bande activée pour cette page dans src/content/trust.ts (showOn) ; rien sans partenaire confirmé */}
      <TrustBand page="/a-propos" />
    </main>
  );
}
