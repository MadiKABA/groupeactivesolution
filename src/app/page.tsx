import { Contact } from "@/components/sections/contact/Contact";
import { Expertises } from "@/components/sections/expertises/Expertises";
import { Faq } from "@/components/sections/faq/Faq";
import { Formations } from "@/components/sections/formations/Formations";
import { Hero } from "@/components/sections/hero/Hero";
import { Partners } from "@/components/sections/partners/Partners";
import { Methode } from "@/components/sections/methode/Methode";
import { Realisations } from "@/components/sections/realisations/Realisations";

export default function Home() {
  return (
    <main data-page="home">
      <Hero />
      <Expertises />
      <Realisations />
      <Methode />
      <Formations />
      <Faq />
      <Contact />
      <Partners motifMask="full" />
    </main>
  );
}
