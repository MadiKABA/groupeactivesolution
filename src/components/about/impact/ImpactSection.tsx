import { ImpactFigures } from "@/components/ui/ImpactFigures";
import { chiffres, chiffresIntro, chiffresUpdatedAt } from "@/lib/chiffres";

/*
 * Section chiffres de la page À propos (#impact) : mêmes textes validés (novembre 2026), mêmes
 * chiffres et même date que « Ce que nous avons déjà construit » de l'accueil, lus dans
 * src/lib/chiffres.ts (source unique pour les deux pages), via la présentation partagée `ImpactFigures`.
 * TODO : aucune donnée structurée pour ces chiffres tant qu'ils ne sont pas confirmés
 * (foundingDate de l'organisation : voir AboutJsonLd, année à confirmer).
 */
export function ImpactSection() {
  return (
    <ImpactFigures
      sectionId="impact"
      titleId="impact-titre"
      label={chiffresIntro.eyebrow}
      titleLines={chiffresIntro.titleLines}
      titleAccent={chiffresIntro.titleAccent}
      paragraph={chiffresIntro.intro}
      figures={chiffres}
      updatedAt={chiffresUpdatedAt}
    />
  );
}
