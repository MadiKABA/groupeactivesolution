/*
 * Contrôle avant un build de production (`pnpm build:prod`) : échoue tant qu'un contenu de la
 * bande « Ils nous font confiance » (src/content/trust.ts) porte `needsValidation: true`. Les chiffres de
 * « Notre impact » viennent de l'accueil (src/lib/chiffres.ts, validés), sans marqueur.
 * Les fichiers TypeScript sont transpilés à la volée avec le compilateur du projet (aucune dépendance).
 * Argument facultatif (tests) : chemin de remplacement pour trust.ts.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const load = async (path) => {
  const { outputText } = ts.transpileModule(readFileSync(path, "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
};
const [trustPath] = process.argv.slice(2);
const { trustContent } = await load(trustPath ?? fileURLToPath(new URL("../src/content/trust.ts", import.meta.url)));

const pending = [];
if (trustContent.needsValidation) pending.push("trust.ts : texte propre à la bande « Ils nous font confiance »");

if (pending.length > 0) {
  console.error(
    `\n✖ Build de production refusé : ${pending.length} contenu(s) « Ils nous font confiance » à valider\n` +
      `  dans src/content/ :\n\n${pending.map((item) => `  - ${item}`).join("\n")}\n\n` +
      "  Remplacez les textes provisoires par les contenus validés, puis passez needsValidation à false.\n",
  );
  process.exit(1);
}

console.log("✓ « Ils nous font confiance » : aucun contenu en attente de validation.");
