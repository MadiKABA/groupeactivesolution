import type { NextConfig } from "next";

import { allowIndexing } from "./src/lib/flags";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  images: {
    // 80 : visuels du hero ; 78 : section Expertises (Next 16 n'autorise que 75 par défaut).
    qualities: [75, 78, 80],
  },
  partialPrefetching: true,
  // Relecture du contenu (NEXT_PUBLIC_ALLOW_INDEXING différent de "true") : aucune page indexée.
  async headers() {
    if (allowIndexing) return [];
    return [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
