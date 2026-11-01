import { DemarrerParcours } from "@/components/formations/demarrer-parcours";
import { WaveMotif } from "@/components/ui/WaveMotif";

/*
 * Section 4 de /formations/ecole, « Comment démarrer ». Server Component : fond blanc, zigzag bleu nuit
 * à peine visible (`wave-motif--demarrer`) et repli sans JavaScript. Le contenu (repère, titre,
 * introduction, quatre étapes) est rendu par `DemarrerParcours`, seul composant de la page animé
 * avec Motion, et figure dans le HTML initial. Classes `dm-*`.
 */
export function FormationsEcoleDemarrer() {
  return (
    <section aria-labelledby="demarrer-title" className="dm relative isolate overflow-x-clip bg-brand-white text-brand-navy">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-clip">
        <WaveMotif tone="navy" mask="full" className="wave-motif--demarrer" />
      </div>

      {/* Sans JavaScript : états initiaux de Motion neutralisés */}
      <noscript>
        <style>{".dm [data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}.dm .dm-trace-path{stroke-dasharray:none!important;stroke-dashoffset:0!important}"}</style>
      </noscript>

      <DemarrerParcours />
    </section>
  );
}
