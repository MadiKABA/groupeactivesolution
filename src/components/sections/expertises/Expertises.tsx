/*
 * Section « Nos expertises » — amorce seulement (surtitre + titre de la maquette).
 * Sur desktop, son padding-top réduit laisse voir le surtitre et le haut du titre
 * dans les 96px de teaser sous le hero.
 * TODO : intro et cartes des trois expertises, à construire à partir des contenus validés.
 */
export function Expertises() {
  return (
    <section
      id="expertises"
      aria-labelledby="expertises-title"
      className="bg-surface-warm pt-16 pb-section lg:pt-10"
    >
      <div className="mx-auto max-w-site px-6 md:px-10 xl:px-28">
        <p className="flex items-center gap-3 text-xs font-semibold tracking-label text-text-primary uppercase">
          <span aria-hidden="true" className="h-0.5 w-9 bg-brand-gold" />
          Nos expertises
        </p>
        <h2 id="expertises-title" className="mt-3 text-h2 font-bold tracking-display text-text-primary">
          Trois expertises, un même engagement
        </h2>
      </div>
    </section>
  );
}
