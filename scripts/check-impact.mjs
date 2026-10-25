/*
 * Contrôle avant un build de production (`pnpm build:prod`) : échoue tant qu'un contenu de la
 * section « Notre impact » (src/content/impact.ts) ou de la bande « Ils nous font confiance »
 * (src/content/trust.ts) porte `needsValidation: true`, en listant les champs concernés.
 * Les fichiers TypeScript sont transpilés à la volée avec le compilateur du projet (aucune dépendance).
 * Arguments facultatifs (tests) : chemins de remplacement pour impact.ts puis trust.ts.
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
const [impactPath, trustPath] = process.argv.slice(2);
const { impactContent } = await load(impactPath ?? fileURLToPath(new URL("../src/content/impact.ts", import.meta.url)));
const { trustContent } = await load(trustPath ?? fileURLToPath(new URL("../src/content/trust.ts", import.meta.url)));

const pending = [];
if (impactContent.intro.needsValidation) pending.push("impact.ts › intro : libellé, titre et introduction");
impactContent.figures.forEach((figure, i) => {
  if (figure.needsValidation) {
    pending.push(`impact.ts › figures[${i}] « ${figure.value}${figure.suffix ?? ""} ${figure.unit} ${figure.label} » : phrase et description`);
  }
});
if (impactContent.updatedAt.needsValidation) pending.push(`impact.ts › updatedAt : date « ${impactContent.updatedAt.label} »`);
if (trustContent.needsValidation) pending.push("trust.ts : surtitre, titre et phrase de la bande « Ils nous font confiance »");

if (pending.length > 0) {
  console.error(
    `\n✖ Build de production refusé : ${pending.length} contenu(s) « Notre impact » / « Ils nous font confiance » à valider\n` +
      `  dans src/content/ :\n\n${pending.map((item) => `  - ${item}`).join("\n")}\n\n` +
      "  Remplacez les textes provisoires par les contenus validés, puis passez needsValidation à false.\n",
  );
  process.exit(1);
}

console.log("✓ « Notre impact » et « Ils nous font confiance » : aucun contenu en attente de validation.");
