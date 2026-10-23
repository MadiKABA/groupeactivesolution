import { MethodeClient } from "./MethodeClient";

/*
 * Section « Notre méthode » (fond clair), après « Des idées aux réalisations ».
 * Coque rendue côté serveur ; le contenu (textes compris, rendus au serveur puis hydratés)
 * vit dans <MethodeClient>, unique composant client de la section.
 */
export function Methode() {
  return (
    <section
      id="methode"
      aria-labelledby="methode-title"
      className="methode-section relative isolate overflow-x-clip bg-surface-warm text-brand-navy"
    >
      <MethodeClient />
    </section>
  );
}
