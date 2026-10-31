import { ContactHashRedirect } from "@/components/contact/ContactHashRedirect";
import { Expertises } from "@/components/sections/expertises/Expertises";
import { Faq } from "@/components/sections/faq/Faq";
import { Formations } from "@/components/sections/formations/Formations";
import { Hero } from "@/components/sections/hero/Hero";
import { Partners } from "@/components/sections/partners/Partners";
import { Methode } from "@/components/sections/methode/Methode";
import { Realisations } from "@/components/sections/realisations/Realisations";
import { ImpactSection } from "@/components/about/impact/ImpactSection";

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
      <ImpactSection />
      <Partners motifMask="full" />
    </main>
  );
}
