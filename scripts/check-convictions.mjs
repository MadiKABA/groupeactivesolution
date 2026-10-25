/*
 * Contrôle avant un build de production (`pnpm build:prod`) : échoue tant qu'un contenu de la
 * section « Nos convictions » (src/content/convictions.ts) porte `needsValidation: true`.
 * Le fichier TypeScript est transpilé à la volée avec le compilateur du projet (aucune dépendance).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const file = fileURLToPath(new URL("../src/content/convictions.ts", import.meta.url));
const { outputText } = ts.transpileModule(readFileSync(file, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { convictionsContent } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

const pending = [];
if (convictionsContent.intro.needsValidation) pending.push("intro (surtitre et titre)");
convictionsContent.convictions.forEach((conviction, i) => {
  const at = `convictions[${i}] « ${conviction.number} ${conviction.word} »`;
  if (conviction.needsValidation) pending.push(`${at} : mot de contexte, intitulé, titre, texte, preuve et photo`);
});

if (pending.length > 0) {
  console.error(
    `\n✖ Build de production refusé : ${pending.length} contenu(s) de « Nos convictions » à valider\n` +
      `  dans src/content/convictions.ts :\n\n${pending.map((item) => `  - ${item}`).join("\n")}\n\n` +
      "  Remplacez les textes et photos provisoires par les contenus validés, puis passez needsValidation à false.\n",
  );
  process.exit(1);
}

console.log("✓ « Nos convictions » : aucun contenu en attente de validation.");
