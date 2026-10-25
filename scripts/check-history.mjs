/*
 * Contrôle avant un build de production (`pnpm build:prod`) : échoue tant qu'un contenu de la
 * section « Notre histoire » (src/content/history.ts) porte `needsValidation: true`.
 * Le fichier TypeScript est transpilé à la volée avec le compilateur du projet (aucune dépendance).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const file = fileURLToPath(new URL("../src/content/history.ts", import.meta.url));
const { outputText } = ts.transpileModule(readFileSync(file, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { history } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

const pending = [];
if (history.intro.needsValidation) pending.push("intro (titre et paragraphe d'introduction)");
history.chapters.forEach((chapter, i) => {
  const at = `chapters[${i}] « ${chapter.label} »`;
  if (chapter.needsValidation) pending.push(`${at} : année, titre et texte`);
  if (chapter.photo.needsValidation) pending.push(`${at}.photo : fichier, alt et légende`);
  chapter.archives.forEach((archive, j) => {
    if (archive.needsValidation) pending.push(`${at}.archives[${j}] (${archive.id}) : image, légende, titre et histoire`);
  });
});

if (pending.length > 0) {
  console.error(
    `\n✖ Build de production refusé : ${pending.length} contenu(s) de « Notre histoire » à valider (needsValidation: true)\n` +
      `  dans src/content/history.ts :\n\n${pending.map((item) => `  - ${item}`).join("\n")}\n\n` +
      "  Remplacez les textes provisoires par les contenus validés, puis passez needsValidation à false.\n",
  );
  process.exit(1);
}

console.log("✓ « Notre histoire » : aucun contenu en attente de validation.");
