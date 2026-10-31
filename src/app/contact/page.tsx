import type { Metadata } from "next";
import { Great_Vibes } from "next/font/google";

import { CONTACT_DESCRIPTION, ContactJsonLd } from "@/components/contact/ContactJsonLd";
import { ContactHero } from "@/components/contact/ContactHero";
import { Contact } from "@/components/sections/contact/Contact";
import { ROUTES } from "@/lib/routes";
import { pageRobots } from "@/lib/flags";
import { SITE_URL } from "@/lib/site";

// Écriture manuscrite du « 24 h » du hero, chargée sur cette page uniquement.
const greatVibes = Great_Vibes({ weight: "400", subsets: ["latin"], display: "swap", fallback: ["cursive"] });

const title = "Contact | Active Solution Digital Service, Dakar";
const description = CONTACT_DESCRIPTION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  // `absolute` : le titre complet est imposé, sans le gabarit du layout.
  title: { absolute: title },
  description,
  alternates: { canonical: ROUTES.contact },
  robots: pageRobots,
  // TODO : image Open Graph 1200 × 630 à fournir (aucune image de partage dans public/), puis l'ajouter ici.
  openGraph: {
    type: "website",
    siteName: "Active Solution",
    locale: "fr_SN",
    title,
    description,
    url: ROUTES.contact,
  },
  twitter: { card: "summary_large_image", title, description },
};

/* Hero, section Contact (cible du bouton du hero), puis le footer du layout : rien d'autre. */
export default function ContactPage() {
  return (
    <main>
      <ContactJsonLd />
      <ContactHero scriptClassName={greatVibes.className} />
      <Contact />
    </main>
  );
}
