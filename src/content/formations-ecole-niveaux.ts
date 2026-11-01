/*
 * Section « Nos programmes par niveau » de /formations/ecole : données seules, sans présentation.
 * `id` = ancre de l'adresse (#primaire, #college, #lycee), reprise par les cadres du hero.
 * `needsValidation: true` : exemples d'activités et textes d'intention à confirmer par le client.
 * `facts` : une valeur `null` n'est jamais affichée en production (« À renseigner » avec placeholders).
 * Aucun chiffre, durée ou effectif sans confirmation.
 */

export type NiveauId = "primaire" | "college" | "lycee";

export type Niveau = {
  id: NiveauId;
  number: string;
  label: string;
  verb: string;
  title: string;
  intent: string;
  examples: readonly string[];
  facts: { classes: string | null; duration: string | null; groupSize: string | null };
  /** Photo dans public/ (ignorée si le fichier est absent) et sa description vérifiée. */
  photo: { src: string; alt: string };
  needsValidation: boolean;
};

export const niveauxIntro = {
  eyebrow: "Nos programmes",
  titleLines: ["Un programme adapté à chaque niveau,", "du primaire au lycée."],
} as const;

export const niveaux: readonly Niveau[] = [
  {
    id: "primaire",
    number: "01",
    label: "Primaire",
    verb: "Comprendre",
    title: "Primaire : comprendre la logique par la pratique",
    intent:
      "Les élèves découvrent la logique et la programmation par le jeu et la manipulation. Chaque séance part d'un défi simple, résolu en groupe, puis présenté à la classe.",
    examples: ["Programmation visuelle", "Jeux de logique", "Robotique de découverte"],
    facts: { classes: null, duration: null, groupSize: null },
    photo: {
      src: "/images/formations/ecole/niveau-primaire.webp",
      // Image générée par IA (filigrane « Meta AI » dans le fichier source) : à remplacer par une vraie photo.
      alt: "Image d'illustration : des enfants assis à des pupitres travaillent sur des ordinateurs portables, face à un écran de projection.",
    },
    needsValidation: true,
  },
  {
    id: "college",
    number: "02",
    label: "Collège",
    verb: "Expérimenter",
    title: "Collège : passer de l'usage à la création",
    intent:
      "Les élèves passent d'utilisateurs à créateurs de projets. Ils conçoivent, testent et améliorent de petits programmes, puis les montrent à leurs camarades.",
    examples: ["Premiers projets avec Scratch", "Bases d'électronique", "Projet en équipe"],
    facts: { classes: null, duration: null, groupSize: null },
    photo: {
      src: "/images/formations/ecole/niveau-college.webp",
      alt: "Deux élèves assemblent un robot en pièces métalliques sur une table, pendant un atelier de robotique.",
    },
    needsValidation: true,
  },
  {
    id: "lycee",
    number: "03",
    label: "Lycée",
    verb: "Créer",
    title: "Lycée : concevoir un projet complet",
    intent:
      "Les élèves conçoivent un projet technique de bout en bout. Ils choisissent leurs outils, construisent un prototype, puis le documentent et le présentent.",
    examples: [
      "Arduino et systèmes embarqués",
      "Objets connectés",
      "Développement web",
      "Initiation à l'intelligence artificielle",
    ],
    facts: { classes: null, duration: null, groupSize: null },
    photo: {
      src: "/images/formations/ecole/niveau-lycee.webp",
      alt: "Trois jeunes autour d'un ordinateur portable et d'un circuit électronique câblé sur une plaque d'essai.",
    },
    needsValidation: true,
  },
];
