import type { ReactNode } from "react";

import type { SocialId } from "@/lib/site";

/*
 * Logos des réseaux sociaux (SVG inline au trait 1.8, couleur héritée, décoratifs) :
 * lucide-react ne les fournit pas tous, aucune dépendance ajoutée.
 */
const PATHS: Record<SocialId, ReactNode> = {
  linkedin: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="4" />
      <path d="M7.5 10.5v6M7.5 7.5v.01M11.5 16.5v-6M11.5 13c0-1.6 1.1-2.6 2.4-2.6 1.4 0 2.1.9 2.1 2.6v3.5" />
    </>
  ),
  facebook: <path d="M14.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.6-1.5h1.6V4.4a21 21 0 0 0-2.4-.1c-2.4 0-4 1.4-4 4.1v2.1H8.6v3h2.7V21" />,
  instagram: (
    <>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M17.5 6.5v.01" />
    </>
  ),
  tiktok: <path d="M12 3h3c.3 2.4 2 4.1 4.5 4.3v3a7.4 7.4 0 0 1-4.5-1.5V15a5.5 5.5 0 1 1-5.5-5.5v3.1A2.5 2.5 0 1 0 12 15Z" />,
};

export function SocialIcon({ id, className }: { id: SocialId; className?: string }) {
  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {PATHS[id]}
    </svg>
  );
}
