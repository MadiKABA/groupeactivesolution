/*
 * Images encore provisoires de la page /a-propos : AVERTISSEMENT non bloquant listé avant le build
 * de production. Avec STRICT_PUBLISH=1, le même avertissement fait échouer le build.
 * Sources : src/lib/about.ts (photos du hero), src/content/history.ts (photos de panneau et archives),
 * src/content/equipe.ts (photo de l'atelier, photos des membres). Les fichiers TypeScript sont
 * transpilés à la volée avec le compilateur du projet (aucune dépendance).
 * Photos d'élèves mineurs : autorisation écrite (école ou parents) requise avant publication.
 */
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const load = async (relative) => {
  const { outputText } = ts.transpileModule(readFileSync(fileURLToPath(new URL(relative, import.meta.url)), "utf8"), {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 },
  });
  return import(`data:text/javascript;base64,${Buffer.from(outputText).toString("base64")}`);
};

const { aboutArches } = await load("../src/lib/about.ts");
const { history, isArchiveReady } = await load("../src/content/history.ts");
const { teamContent } = await load("../src/content/equipe.ts");

const pending = [];
for (const arch of Object.values(aboutArches)) {
  if (arch.provisional) pending.push(`Hero › arche « ${arch.label} » (${arch.src}) : photo de banque d'images à remplacer par une vraie photo`);
}
for (const chapter of history.chapters) {
  if (!chapter.photo.src) pending.push(`Histoire › chapitre ${chapter.year} « ${chapter.label} » : photo du panneau à fournir (lieu, activité, année)`);
  chapter.archives.forEach((archive) => {
    if (!isArchiveReady(archive)) pending.push(`Histoire › archive ${archive.id} (${chapter.year}) : image et légende réelle (lieu · activité · année) à fournir`);
  });
}
if (!teamContent.workshopPhoto) pending.push("Équipe › « l'établi » : illustration provisoire (photo réelle de l'atelier facultative)");

if (pending.length === 0) {
  console.log("✓ Images de /a-propos : aucune image provisoire.");
} else {
  const strict = process.env.STRICT_PUBLISH === "1";
  const out = strict ? console.error : console.warn;
  out(
    `\n${strict ? "✖ STRICT_PUBLISH=1 : build refusé" : "⚠ Avertissement"} : ${pending.length} image(s) provisoire(s) sur /a-propos\n\n` +
      `${pending.map((item) => `  - ${item}`).join("\n")}\n\n` +
      "  Photos d'élèves mineurs : autorisation écrite (école ou parents) requise avant publication.\n",
  );
  if (strict) process.exit(1);
}
