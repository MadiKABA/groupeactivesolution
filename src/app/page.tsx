import type { Metadata } from "next";

import { ContactHashRedirect } from "@/components/contact/ContactHashRedirect";
import { Expertises } from "@/components/sections/expertises/Expertises";
import { Faq } from "@/components/sections/faq/Faq";
import { Formations } from "@/components/sections/formations/Formations";
import { Hero } from "@/components/sections/hero/Hero";
import { Partners } from "@/components/sections/partners/Partners";
import { Methode } from "@/components/sections/methode/Methode";
import { Realisations } from "@/components/sections/realisations/Realisations";
import { Chiffres } from "@/components/sections/chiffres/Chiffres";
import { pageRobots } from "@/lib/flags";
import { SITE_URL } from "@/lib/site";

const title = "Active Solution — Formation et solutions numériques à Dakar";
const description =
  "À Dakar, Active Solution forme au numérique (Scratch, robotique, IA), développe vos sites, applications et logiciels, et accompagne la transformation digitale.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // `absolute` : le titre complet est imposé, sans le gabarit du layout.
  title: { absolute: title },
  description,
  alternates: { canonical: "/" },
  robots: pageRobots,
  openGraph: { type: "website", siteName: "Active Solution", locale: "fr_SN", title, description, url: "/" },
  twitter: { card: "summary_large_image", title, description },
};

export default function Home() {
  return (
    <main data-page="home">
      <ContactHashRedirect />
      <Hero />
      <Expertises />
      <Realisations />
      <Methode />
      <Formations />
      <Faq />
      <Chiffres />
      <Partners motifMask="full" joinedAbove />
    </main>
  );
}
