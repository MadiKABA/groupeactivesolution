import type { MetadataRoute } from "next";

import { SITE_URL } from "@/lib/site";

// Pages publiées uniquement (ajouter chaque nouvelle route ici).
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${SITE_URL}/`, changeFrequency: "monthly", priority: 1 },
    { url: `${SITE_URL}/a-propos`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE_URL}/services`, changeFrequency: "monthly", priority: 0.9 },
  ];
}
