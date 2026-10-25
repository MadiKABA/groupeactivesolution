/*
 * Bande « Ils nous font confiance » (TrustBand) : la section Partenaires de l'accueil, réutilisée
 * à l'identique avant le footer des pages qui l'activent ici (`showOn`, désactivée par défaut).
 * Partenaires lus dans src/lib/partners.ts (source unique, champ `confirmed`) : en production,
 * la bande ne rend rien s'il n'y a aucun partenaire confirmé.
 *
 * Textes : formulation à valider par le propriétaire (aucune relation commerciale affirmée sans
 * confirmation). `needsValidation: true` → « [À valider] » en développement et échec de
 * `pnpm build:prod` (scripts/check-impact.mjs).
 *
 * Ce fichier ne dépend d'aucun alias ni module : il est relu tel quel par le script de contrôle.
 */

export type TrustContent = {
  /** Pages où la bande est affichée (chemin → true). Une page absente ne l'affiche pas. */
  showOn: Readonly<Record<string, boolean>>;
  /** En-tête de la section Partenaires : surtitre, titre en deux parties (la seconde en dégradé or), introduction. */
  eyebrow: string;
  title: string;
  titleHighlight: string;
  intro: string;
  listLabel: string;
  needsValidation: boolean;
};

export const trustContent: TrustContent = {
  showOn: { "/a-propos": true },
  eyebrow: "Partenaires",
  title: "Ils nous font",
  titleHighlight: "confiance.",
  intro: "Des établissements et des entreprises avec lesquels nous avons travaillé.",
  listLabel: "Organisations ayant travaillé avec Active Solution",
  needsValidation: true,
};
