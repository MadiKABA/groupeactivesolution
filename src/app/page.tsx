import { Expertises } from "@/components/sections/expertises/Expertises";
import { Hero } from "@/components/sections/hero/Hero";
import { Methode } from "@/components/sections/methode/Methode";
import { Realisations } from "@/components/sections/realisations/Realisations";

export default function Home() {
  return (
    <main>
      <Hero />
      <Expertises />
      <Realisations />
      <Methode />
    </main>
  );
}
