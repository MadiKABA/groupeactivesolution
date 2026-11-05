import { existsSync } from "node:fs";
import { join } from "node:path";

const PAGE_FILES = ["page.tsx", "page.ts", "page.jsx", "page.js"];

/** La route existe : src/app/<route>/page.(tsx|ts|jsx|js). Lu au build (pages statiques), côté serveur seulement. */
export function routeExists(href: string): boolean {
  return PAGE_FILES.some((file) => existsSync(join(process.cwd(), "src", "app", href.replace(/^\//, ""), file)));
}
