import type { Expertise } from "@/lib/expertises";
import { MotifPattern } from "@/components/ui/MotifPattern";

/**
 * Emplacement affiché tant que la photo de l'expertise n'est pas fournie :
 * composition graphique (jamais une fausse photo), purement décorative.
 * Icône et numéro côte à côte, dimensionnés sur la hauteur du cadre : lisible dans le
 * cadre desktop presque carré comme dans le cadre mobile large et bas.
 */
export function ExpertisePlaceholder({ expertise }: { expertise: Expertise }) {
  const Icon = expertise.icon;
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 overflow-hidden bg-linear-to-br from-brand-navy to-brand-navy-glow"
      // Conteneur de requêtes en taille : unités `cqh` relatives à la hauteur du cadre.
      style={{ containerType: "size" }}
    >
      <MotifPattern className="text-brand-gold opacity-40" />
      {/* Légèrement remonté pour laisser la place à la pastille en verre du bas */}
      <div className="absolute inset-0 flex items-center justify-center gap-[6cqh] pb-[12cqh]">
        <Icon className="size-[22cqh] text-brand-gold" strokeWidth={1.25} />
        <span className="text-outline-gold text-[38cqh] leading-none font-extrabold">{expertise.number}</span>
      </div>
    </div>
  );
}
