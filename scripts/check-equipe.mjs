/*
 * Contrôle avant un build de production (`pnpm build:prod`) : échoue tant qu'un contenu de la
 * section « Notre équipe » (src/content/equipe.ts) porte `needsValidation: true`.
 * Le fichier TypeScript est transpilé à la volée avec le compilateur du projet (aucune dépendance).
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const file = fileURLToPath(new URL("../src/content/equipe.ts", import.meta.url));
const { outputText } = ts.transpileModule(readFileSync(file, "utf8"), {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
});
const { teamContent } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);

const pending = [];
if (teamContent.intro.needsValidation) {
  pending.push("intro : surtitre, titre, indices d'interaction et phrase « Qui s'en occupe »");
}
teamContent.skills.forEach((skill, i) => {
  if (skill.needsValidation) pending.push(`skills[${i}] « ${skill.number} ${skill.name} » : titre, texte et étiquettes`);
});

if (pending.length > 0) {
  console.error(
    `\n✖ Build de production refusé : ${pending.length} contenu(s) de « Notre équipe » à valider\n` +
      `  dans src/content/equipe.ts :\n\n${pending.map((item) => `  - ${item}`).join("\n")}\n\n` +
      "  Remplacez les textes provisoires par les contenus validés, puis passez needsValidation à false.\n",
  );
  process.exit(1);
}

console.log("✓ « Notre équipe » : aucun contenu en attente de validation.");
