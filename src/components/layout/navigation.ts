import { ROUTES } from "@/lib/routes";

export type NavLink = {
  label: string;
  href: string;
  /** Sous-menu : l'entrée devient un bouton qui l'ouvre (elle ne navigue pas). */
  children?: readonly NavChild[];
};

export type NavChild = {
  label: string;
  href: string;
};

const formationsMenu: readonly NavChild[] = [
  { label: "Pour les écoles", href: "/formations/ecole" },
  { label: "Aux métiers du numérique", href: "/formations/metiers-du-numerique" },
  { label: "Pour les organisations", href: "/formations/organisations" },
];

export const navLinks: readonly NavLink[] = [
  { label: "Accueil", href: "/" },
  { label: "Nos services", href: "/services" },
  { label: "Réalisations", href: "/#realisations" },
  // `href` sert seulement à l'état actif (toute page sous /formations).
  { label: "Formations", href: "/formations", children: formationsMenu },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: ROUTES.contact },
];

export const ctaLink: NavLink = { label: "Parlons de votre projet", href: ROUTES.contact };

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
