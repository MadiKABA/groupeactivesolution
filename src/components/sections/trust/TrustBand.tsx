import { ValidationMark } from "@/components/about/history/ValidationMark";
import { Partners } from "@/components/sections/partners/Partners";
import { trustContent } from "@/content/trust";
import { confirmedPartners, partners, type Partner } from "@/lib/partners";

const isDev = process.env.NODE_ENV !== "production";

// Développement, aucun partenaire confirmé : emplacements signalés (jamais rendus en production).
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
 * à l'identique (même composant, mêmes classes `pt-*`), avec les textes de src/content/trust.ts.
 * Activée page par page (`trustContent.showOn`) ; ne rend rien si la page ne l'active pas, ni en
 * production sans partenaire confirmé (aucun titre orphelin).
 */
export function TrustBand({ page }: { page: string }) {
  if (!trustContent.showOn[page]) return null;
  const confirmed = confirmedPartners(partners);
  if (confirmed.length === 0 && !isDev) return null;

  return (
    <Partners
      list={confirmed.length > 0 ? confirmed : DEV_SLOTS}
      texts={trustContent}
      introSuffix={<ValidationMark pending={trustContent.needsValidation} />}
    />
  );
}
