import type { MetadataRoute } from "next";

import { allowIndexing } from "@/lib/flags";
import { SITE_URL } from "@/lib/site";

// Relecture du contenu : tout est interdit aux robots, sans sitemap. Lancement : accès libre + sitemap.
export default function robots(): MetadataRoute.Robots {
  if (!allowIndexing) return { rules: { userAgent: "*", disallow: "/" } };
  return { rules: { userAgent: "*", allow: "/" }, sitemap: `${SITE_URL}/sitemap.xml` };
}
