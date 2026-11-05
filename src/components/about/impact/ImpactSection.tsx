import { ImpactFigures } from "@/components/ui/ImpactFigures";
import { impactContent } from "@/content/impact";

/*
 * Section « Notre impact » (page /a-propos, #impact) : données de src/content/impact.ts, rendu
 * par la présentation partagée `ImpactFigures` (aussi utilisée par la section Chiffres de l'accueil).
 * TODO : aucune donnée structurée pour ces chiffres tant qu'ils ne sont pas confirmés
 * (foundingDate de l'organisation : voir AboutJsonLd, année à confirmer).
 */
export function ImpactSection() {
  const { intro, figures, updatedAt } = impactContent;

  return (
    <ImpactFigures
      sectionId="impact"
      titleId="impact-titre"
      label={intro.label}
      titleLines={intro.titleLines}
      titleAccent={intro.titleAccent}
      paragraph={intro.paragraph}
      paragraphNeedsValidation={intro.needsValidation}
      figures={figures}
      updatedAt={updatedAt}
    />
  );
}
