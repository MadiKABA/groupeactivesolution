// Contenu validé : novembre 2026 (document Textes validés de la page d'accueil). Modifier ces valeurs sans toucher aux composants.

export type Partner = {
  id: string;
  name: string;
  /** Fichier officiel public/partners/<id>.svg, .png ou .webp (fond transparent) ; null : le nom est affiché. */
  logo: { src: string; width: number; height: number } | null;
  /** Texte alternatif du logo (le nom est ajouté en texte masqué s'il n'y figure pas). */
  logoAlt: string;
  /** Site web, uniquement s'il est vérifié (null : carte non cliquable). */
  website: string | null;
  /** Nature de la relation (infobulle), uniquement si elle est validée. */
  relation?: string;
  /** Seuls les partenaires confirmés sont affichés. */
  confirmed: boolean;
};

export const partnersIntro = {
  eyebrow: "Partenaires",
  /** Titre en deux parties : la seconde est en dégradé or profond. */
  title: "Nos",
  titleHighlight: "partenaires.",
  intro: "Des organisations qui nous font confiance et avec qui nous construisons, de la formation aux solutions numériques.",
  listLabel: "Partenaires d'Active Solution",
  /** Affiché à la place de la liste tant qu'aucun partenaire n'est confirmé. */
  empty: "Nos partenaires seront présentés prochainement.",
  newTab: "(nouvel onglet)",
  /** Carte de débordement (plus de 12 partenaires), inerte tant qu'aucune page /partenaires n'existe. */
  more: (count: number) => `+${count} partenaires`,
} as const;

// Partenaires affichés, dans cet ordre (logos à fournir : public/partners/<id>.svg|png|webp).
export const partners: readonly Partner[] = [
  { id: "10htech", name: "10HTech", logo: null, logoAlt: "10HTech", website: null, confirmed: true },
  { id: "mondialehome", name: "MondialeHome", logo: null, logoAlt: "MondialeHome", website: null, confirmed: true },
  { id: "tme-education", name: "TME Education", logo: null, logoAlt: "TME Education", website: null, confirmed: true },
  { id: "lamtoro-automobil", name: "Lamtoro Automobil", logo: null, logoAlt: "Lamtoro Automobil", website: null, confirmed: true },
];

export const confirmedPartners = (list: readonly Partner[] = partners) => list.filter((partner) => partner.confirmed);
