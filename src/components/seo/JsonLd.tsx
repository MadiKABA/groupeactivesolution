/** Données structurées rendues côté serveur ; `<` échappé pour qu'aucune chaîne ne ferme la balise. */
export function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
