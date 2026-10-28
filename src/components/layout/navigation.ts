import { ROUTES } from "@/lib/routes";

export type NavLink = {
  label: string;
  href: string;
};

export const navLinks: readonly NavLink[] = [
  { label: "Accueil", href: "/" },
  { label: "Nos services", href: "/services" },
  { label: "Réalisations", href: "/realisations" },
  { label: "Formations", href: "/formations" },
  { label: "À propos", href: "/a-propos" },
  { label: "Contact", href: ROUTES.contact },
];

export const ctaLink: NavLink = { label: "Parlons de votre projet", href: ROUTES.contact };

export function isActivePath(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
