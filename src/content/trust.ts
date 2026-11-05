/*
 * Bande « Ils nous font confiance » (TrustBand) : la section Partenaires de l'accueil, réutilisée
 * à l'identique avant le footer des pages qui l'activent ici (`showOn`). Les textes (surtitre, titre,
 * introduction) sont ceux de l'accueil (`partnersIntro`, src/lib/partners.ts, validés en novembre
 * 2026) : aucun texte propre à cette bande. Partenaires lus dans src/lib/partners.ts (champ
 * `confirmed`) : en production, la bande ne rend rien s'il n'y a aucun partenaire confirmé.
 *
 * `needsValidation: true` → échec de `pnpm build:prod` (scripts/check-impact.mjs) : à utiliser si un
 * texte propre à la bande est ajouté un jour.
 *
 * Ce fichier ne dépend d'aucun alias ni module : il est relu tel quel par le script de contrôle.
 */

export type TrustContent = {
  /** Pages où la bande est affichée (chemin → true). Une page absente ne l'affiche pas. */
  showOn: Readonly<Record<string, boolean>>;
  needsValidation: boolean;
};

export const trustContent: TrustContent = {
  showOn: { "/a-propos": true },
  needsValidation: false,
};
