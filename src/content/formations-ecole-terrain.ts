/*
 * Section « Sur le terrain » de /formations/ecole : interventions, données seules.
 * Publication (production) : `accordEcrit: true` (accord écrit de l'établissement, et des parents si
 * des élèves sont visibles) et résumé renseigné. Moins de deux interventions publiables → section absente.
 * Lien rendu seulement si `href` et `published: true` (aucun lien mort). Aucun nom d'élève.
 */

export type Intervention = {
  slug: string;
  /** Date ISO (AAAA-MM-JJ) */
  date: string;
  /** Type (« Hackathon », « Atelier »…) ; `null` tant qu'il n'est pas confirmé */
  type: string | null;
  etablissement: string;
  /** Titre facultatif ; sinon le nom de l'établissement */
  title: string | null;
  /** Une ligne (liste) */
  resume: string;
  /** Texte plus long, facultatif (aperçu et blocs mobiles) ; sinon `resume` */
  detail: string | null;
  /** Libellé accessible du lien : « Voir l'intervention … » */
  linkLabel: string;
  /** Page de l'intervention ou de l'établissement : lien rendu seulement si `published` */
  href: string | null;
  published: boolean;
  /** Photo dans public/ : remplace le placeholder dès qu'elle est renseignée ; alt d'après la photo vue */
  photo: { src: string; alt: string } | null;
  accordEcrit: boolean;
  needsValidation: boolean;
};

export const terrainIntro = {
  eyebrow: "Sur le terrain",
  titleLines: ["Des interventions concrètes,", "avec des établissements de Dakar."],
  text: "Chaque établissement a sa page, avec son programme et ses activités.",
} as const;

/** Page de liste de toutes les interventions : route à confirmer (par défaut /activites), `null` tant qu'elle n'existe pas. */
export const terrainAllHref: string | null = null;

export const interventions: readonly Intervention[] = [
  {
    slug: "hackathon-inter-ecoles-2026",
    date: "2026-05-02",
    type: "Hackathon",
    etablissement: "Inter-écoles",
    title: "Hackathon inter-écoles",
    resume:
      "Une compétition réunissant des élèves de plusieurs établissements, autour d'un même objectif : concevoir et présenter un projet numérique.",
    // À confirmer : format, déroulement, nombre d'équipes ; à remplacer par les mots du client.
    detail:
      "Une compétition réunissant des élèves de plusieurs établissements, autour d'un même objectif : concevoir et présenter un projet numérique. Les équipes travaillent ensemble, puis montrent leurs réalisations.",
    linkLabel: "Voir l'intervention du hackathon inter-écoles",
    href: null,
    published: false,
    photo: null,
    accordEcrit: false,
    needsValidation: true,
  },
  {
    slug: "lycee-technique-arduino-2026",
    date: "2026-04-05",
    type: null,
    // Nom complet à confirmer
    etablissement: "Lycée Technique",
    title: null,
    detail: null,
    resume: "Atelier Arduino pour la filière technique.",
    linkLabel: "Voir l'intervention au Lycée Technique",
    href: null,
    published: false,
    photo: null,
    accordEcrit: false,
    needsValidation: true,
  },
  {
    slug: "ief-pikine-initiation-2026",
    date: "2026-03-28",
    type: null,
    etablissement: "IEF Pikine",
    title: null,
    detail: null,
    resume: "Initiation informatique, avec pratique sur ordinateurs.",
    linkLabel: "Voir l'intervention à IEF Pikine",
    href: null,
    published: false,
    photo: null,
    accordEcrit: false,
    needsValidation: false,
  },
  {
    slug: "tme-education-drones-2026",
    date: "2026-03-15",
    type: null,
    etablissement: "TME Education",
    title: null,
    detail: null,
    resume: "Drones et robotique : démonstration, puis atelier pratique.",
    linkLabel: "Voir l'intervention à TME Education",
    href: null,
    published: false,
    photo: null,
    accordEcrit: false,
    needsValidation: false,
  },
];
