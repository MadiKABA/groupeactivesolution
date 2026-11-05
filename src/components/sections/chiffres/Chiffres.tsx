import { ImpactFigures } from "@/components/ui/ImpactFigures";
import { chiffres, chiffresIntro, chiffresUpdatedAt } from "@/lib/chiffres";

/*
 * Section « Ce que nous avons déjà construit » (#chiffres), après la FAQ et avant les Partenaires :
 * même présentation et mêmes animations que « Notre impact » (page À propos), via `ImpactFigures`.
 * Seules les données changent (src/lib/chiffres.ts). Valeurs finales dans le HTML serveur.
 */
export function Chiffres() {
  return (
    <ImpactFigures
      sectionId="chiffres"
      titleId="chiffres-title"
      label={chiffresIntro.eyebrow}
      titleLines={chiffresIntro.titleLines}
      titleAccent={chiffresIntro.titleAccent}
      paragraph={chiffresIntro.intro}
      figures={chiffres}
      updatedAt={chiffresUpdatedAt}
    />
  );
}
