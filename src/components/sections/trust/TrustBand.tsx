import { Partners } from "@/components/sections/partners/Partners";
import { trustContent } from "@/content/trust";
import { showPlaceholders } from "@/lib/flags";
import { confirmedPartners, partners, partnersIntro, type Partner } from "@/lib/partners";


// Placeholders actifs, aucun partenaire confirmé : emplacements signalés (jamais rendus sinon).
const DEV_SLOTS: readonly Partner[] = [1, 2, 3, 4].map((n) => ({
  id: `a-valider-${n}`,
  name: "[À valider]",
  logo: null,
  logoAlt: "[À valider]",
  website: null,
  confirmed: true,
}));

/*
 * Bande « Ils nous font confiance », juste avant le footer : la section Partenaires de l'accueil,
 * à l'identique (même composant, mêmes classes `pt-*`), avec les textes de l'accueil (`partnersIntro`).
 * Activée page par page (`trustContent.showOn`) ; ne rend rien si la page ne l'active pas, ni sans
 * partenaire confirmé quand les placeholders sont masqués (aucun titre orphelin).
 */
export function TrustBand({ page }: { page: string }) {
  if (!trustContent.showOn[page]) return null;
  const confirmed = confirmedPartners(partners);
  if (confirmed.length === 0 && !showPlaceholders) return null;

  return (
    <Partners
      list={confirmed.length > 0 ? confirmed : DEV_SLOTS}
      texts={partnersIntro}
    />
  );
}
