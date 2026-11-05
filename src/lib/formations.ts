// Contenu validé : novembre 2026 (document Textes validés de la page d'accueil). Modifier ces valeurs sans toucher aux composants.

import { Briefcase, GraduationCap, Users, type LucideIcon } from "lucide-react";

import { typo } from "./typography";

/**
 * Libellés des publics, source unique partagée par l'expertise 01 (« Idéal pour ») et le bloc « Pour qui ? ».
 * `schools` ne sert qu'à l'expertise : le bloc « Pour qui ? » garde son titre validé « Établissements scolaires ».
 */
export const FORMATION_AUDIENCES = {
  schools: "Écoles primaires, collèges et lycées",
  youth: "Jeunes et apprenants",
  organisations: "Entreprises et organisations",
} as const;

export type FormationDomain = {
  id: string;
  /** Numéro affiché (« 01 »…), aussi dans le nœud du circuit. */
  num: string;
  /** Libellé de l'onglet (et de la pastille mobile). */
  tab: string;
  /** Libellé court sous le nœud du circuit (masqué sur mobile). */
  nodeLabel: string;
  /** Titre du panneau de description (mobile). */
  title: string;
  text: string;
  tags: readonly [string, string, string];
};

export type FormationPublic = {
  id: string;
  title: string;
  text: string;
  icon: LucideIcon;
};

export const formationsIntro = {
  eyebrow: "Formations",
  /** Titre en deux parties : la seconde est en dégradé doré. */
  title: "Apprendre en",
  titleHighlight: "construisant.",
  intro: typo("Scratch, robotique, intelligence artificielle, cybersécurité : des cours pratiques où chaque élève crée, essaie et comprend."),
  tablistLabel: "Domaines de formation",
  publicsLabel: typo("Pour qui ?"),
  /** Rendu seulement si la route existe (vérification serveur). */
  cta: { label: "Découvrir nos formations", href: "/formations" },
} as const;

// Exactement 5 domaines, dans l'ordre des nœuds du circuit (src/lib/formations-circuit.ts).
export const formationDomains: readonly FormationDomain[] = [
  {
    id: "scratch",
    num: "01",
    tab: "Scratch et programmation",
    nodeLabel: "Scratch",
    title: "Scratch et programmation",
    text: "Créer ses premiers jeux et animations, et comprendre comment pensent les ordinateurs.",
    tags: ["Scratch", "Jeux", "Logique"],
  },
  {
    id: "robotique",
    num: "02",
    tab: "Robotique",
    nodeLabel: "Robotique",
    title: "Robotique",
    text: "Construire et programmer ses premiers robots, et les voir prendre vie.",
    tags: ["Robots", "Capteurs", "Créativité"],
  },
  {
    id: "objets-connectes",
    num: "03",
    tab: "Objets connectés",
    nodeLabel: "Objets connectés",
    title: "Objets connectés",
    text: "Faire dialoguer des objets du quotidien avec un téléphone, comme de vrais inventeurs.",
    tags: ["Capteurs", "Maison connectée", "Arduino"],
  },
  {
    id: "ia",
    num: "04",
    tab: "Intelligence artificielle",
    nodeLabel: "IA",
    title: "Intelligence artificielle",
    text: "Comprendre comment l’IA fonctionne, s’en servir intelligemment et garder l’esprit critique.",
    tags: ["ChatGPT", "Créativité", "Esprit critique"],
  },
  {
    id: "cybersecurite",
    num: "05",
    tab: "Cybersécurité et protection en ligne",
    nodeLabel: "Cybersécurité",
    title: "Cybersécurité et protection en ligne",
    text: "Apprendre à se protéger sur internet, à protéger ses données et à rester en sécurité.",
    tags: ["Mots de passe", "Vie privée", "Sécurité des enfants"],
  },
];

export const formationPublics: readonly FormationPublic[] = [
  {
    id: "etablissements",
    title: "Établissements scolaires",
    text: "Vos élèves ont de vrais cours d’informatique, donnés par nos formateurs, dans votre école.",
    icon: GraduationCap,
  },
  {
    id: "organisations",
    title: FORMATION_AUDIENCES.organisations,
    text: "Des formations pour que vos équipes maîtrisent les outils numériques.",
    icon: Briefcase,
  },
  {
    id: "apprenants",
    title: FORMATION_AUDIENCES.youth,
    text: "Des camps et des ateliers pour découvrir la programmation et la robotique en s’amusant.",
    icon: Users,
  },
];

/** Identifiants partagés par la pastille et son panneau (pattern WAI-ARIA Tabs, sous 1100px). */
export const formationTabId = (domain: FormationDomain) => `formations-tab-${domain.id}`;
export const formationPanelId = (domain: FormationDomain) => `formations-panel-${domain.id}`;
/** Identifiants partagés par l'en-tête et la région d'un volet (pattern WAI-ARIA Accordion, dès 1100px). */
export const formationTriggerId = (domain: FormationDomain) => `formations-trigger-${domain.id}`;
export const formationRegionId = (domain: FormationDomain) => `formations-region-${domain.id}`;
