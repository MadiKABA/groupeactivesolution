import type { MethodeEtape } from "@/lib/methode";

type MethodeStepCardProps = {
  etape: MethodeEtape;
  active: boolean;
};

/**
 * Carte d'une étape : titre court et numéro « /01 » affichés, titre complet annoncé aux
 * lecteurs d'écran ; mots clés en <strong>. Carte active : bordure dorée, halo, numéro doré foncé.
 */
export function MethodeStepCard({ etape, active }: MethodeStepCardProps) {
  return (
    <article
      className={`rounded-[1.25rem] border bg-surface p-5 shadow-card transition-[border-color,box-shadow,translate] duration-300 ease-standard lg:p-6 max-[1100px]:lg:p-5 ${active ? "border-gold-line/55 ring-4 ring-brand-gold/16 lg:motion-safe:-translate-y-1" : "border-brand-navy/8"}`}
    >
      <h3 className="text-step-sm font-bold tracking-[-0.01em] text-brand-navy lg:text-step max-[1100px]:lg:text-step-sm">
        <span aria-hidden="true">{etape.titre}</span>
        <span className="sr-only">{`Étape ${Number(etape.numero)} : ${etape.titreComplet}`}</span>
        <span aria-hidden="true" className={`ml-2 transition-colors duration-300 ${active ? "text-gold-ink-end" : "text-brand-navy/50"}`}>
          /{etape.numero}
        </span>
      </h3>
      <p className="mt-2 text-nav leading-relaxed text-brand-navy/75">
        {etape.segments.map((segment, index) =>
          segment.fort ? (
            <strong key={index} className="font-bold text-brand-navy">
              {segment.texte}
            </strong>
          ) : (
            <span key={index}>{segment.texte}</span>
          ),
        )}
      </p>
    </article>
  );
}
