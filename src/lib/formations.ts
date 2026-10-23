// CONTENU PROVISOIRE : rédaction en cours. Remplacer ces valeurs sans toucher aux composants.

import { Briefcase, GraduationCap, Users, type LucideIcon } from "lucide-react";

export type FormationDomain = {
  id: string;
  /** Numéro affiché (« 01 »…), aussi dans le nœud du circuit. */
  num: string;
  /** Libellé de l'onglet (et de la pastille mobile). */
  tab: string;
  /** Libellé court sous le nœud du circuit (masqué sur mobile). */
  nodeLabel: string;
  /** Titre du panneau de description. */
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
  intro:
    "Programmation, robotique, électronique, IoT et intelligence artificielle : des formations pratiques pour les établissements, les organisations et les apprenants.",
  tablistLabel: "Domaines de formation",
  panelKicker: "Formation",
  publicsLabel: "Pour qui ?",
  cta: { label: "Découvrir nos formations", href: "/formations" },
} as const;

// Exactement 5 domaines, dans l'ordre des nœuds du circuit (src/lib/formations-circuit.ts).
export const formationDomains: readonly FormationDomain[] = [
  {
    id: "web",
    num: "01",
    tab: "Programmation web",
    nodeLabel: "Web",
    title: "Programmation web",
    text: "Créer des sites et des applications web : structurer, styliser et programmer des interfaces modernes.",
    tags: ["HTML et CSS", "JavaScript", "Applications web"],
  },
  {
    id: "robotique",
    num: "02",
    tab: "Robotique",
    nodeLabel: "Robotique",
    title: "Robotique",
    text: "Découvrir la robotique en construisant : assembler, programmer et piloter des robots.",
    tags: ["Capteurs", "Moteurs", "Programmation"],
  },
  {
    id: "electronique",
    num: "03",
    tab: "Électronique et embarqué",
    nodeLabel: "Électronique",
    title: "Électronique et embarqué",
    text: "Comprendre les circuits électroniques et programmer des systèmes embarqués.",
    tags: ["Circuits", "Microcontrôleurs", "Prototypage"],
  },
  {
    id: "iot",
    num: "04",
    tab: "Internet des objets",
    nodeLabel: "IoT",
    title: "Internet des objets",
    text: "Connecter des objets au numérique : collecter, transmettre et exploiter des données.",
    tags: ["Capteurs", "Connectivité", "Données"],
  },
  {
    id: "ia",
    num: "05",
    tab: "Intelligence artificielle",
    nodeLabel: "IA",
    title: "Intelligence artificielle",
    text: "Comprendre l'intelligence artificielle et l'utiliser pour résoudre des problèmes concrets.",
    tags: ["Notions de base", "Cas d'usage", "Outils"],
  },
];

export const formationPublics: readonly FormationPublic[] = [
  {
    id: "etablissements",
    title: "Établissements scolaires",
    text: "Un accompagnement pour intégrer le numérique à l'enseignement.",
    icon: GraduationCap,
  },
  {
    id: "organisations",
    title: "Entreprises et organisations",
    text: "La formation de vos équipes aux outils et aux usages du numérique.",
    icon: Briefcase,
  },
  {
    id: "apprenants",
    title: "Jeunes et apprenants",
    text: "Une première approche concrète de la programmation et de la robotique.",
    icon: Users,
  },
];

/** Identifiants partagés par l'onglet et son panneau (pattern WAI-ARIA Tabs). */
export const formationTabId = (domain: FormationDomain) => `formations-tab-${domain.id}`;
export const formationPanelId = (domain: FormationDomain) => `formations-panel-${domain.id}`;
