import type { MetadataRoute } from "next";

import { allowIndexing } from "@/lib/flags";
import { ROUTES } from "@/lib/routes";
import { SITE_URL } from "@/lib/site";

// Pages publiées uniquement (ajouter chaque nouvelle route ici). Vide tant que l'indexation est fermée.
export default function sitemap(): MetadataRoute.Sitemap {
  if (!allowIndexing) return [];
  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/a-propos`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE_URL}/services`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}${ROUTES.contact}`, changeFrequency: "yearly", priority: 0.7 },
  ];
}
