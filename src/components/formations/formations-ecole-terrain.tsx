import { TerrainJournal, type TerrainItem } from "@/components/formations/terrain-journal";
import { WaveMotif } from "@/components/ui/WaveMotif";
import { interventions, terrainAllHref, terrainIntro } from "@/content/formations-ecole-terrain";
import { showPlaceholders } from "@/lib/flags";

/*
 * Section 5 de /formations/ecole, « Sur le terrain ». Server Component : règles de publication, tri,
 * dates et décors (fond de la section Formations de l'accueil : `formations-topline`, `formations-glow`,
 * zigzag `wave-motif--niveaux`). Le contenu est rendu par `TerrainJournal` (Motion), dans le HTML initial :
 * aperçu fixe de l'intervention active à gauche (décoratif), index des interventions à droite.
 * Aucun `overflow: hidden` ici ni sur les parents : l'aperçu est sticky. Classes `tr-*`.
 */

const MAX_ITEMS = 5;
const MONTHS = ["JAN", "FÉV", "MAR", "AVR", "MAI", "JUIN", "JUIL", "AOÛT", "SEPT", "OCT", "NOV", "DÉC"] as const;

function splitDate(iso: string) {
  const [year = "", month = "1", day = ""] = iso.split("-");
  return { day, monthYear: `${MONTHS[Number(month) - 1] ?? ""} ${year}` };
}

export function FormationsEcoleTerrain() {
  // Mode rédaction : toutes les interventions documentées ; production : accord écrit obligatoire
  const valid = interventions
    .filter((item) => item.resume.trim() !== "" && (item.accordEcrit || showPlaceholders))
    .toSorted((a, b) => b.date.localeCompare(a.date));

  if (valid.length < 2) return null;

  const items: TerrainItem[] = valid.slice(0, MAX_ITEMS).map((item) => ({
    slug: item.slug,
    date: item.date,
    ...splitDate(item.date),
    type: item.type,
    heading: item.title ?? item.etablissement,
    resume: item.resume,
    detail: item.detail ?? item.resume,
    linkLabel: item.linkLabel,
    href: item.published ? item.href : null,
    photo: item.photo,
  }));

  const allHref = valid.length > MAX_ITEMS ? terrainAllHref : null;

  return (
    <section aria-labelledby="terrain-title" className="tr relative isolate overflow-x-clip bg-brand-navy text-brand-white">
      <div aria-hidden="true" className="formations-topline absolute inset-x-0 top-0 h-px" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-clip">
        <WaveMotif tone="dark" mask="full" className="wave-motif--niveaux" />
        <div className="formations-glow tr-glow absolute" />
      </div>

      {/* Sans JavaScript : états initiaux de Motion neutralisés */}
      <noscript>
        <style>{".tr [data-reveal]{opacity:1!important;transform:none!important;clip-path:none!important}"}</style>
      </noscript>

      <TerrainJournal intro={terrainIntro} items={items} allHref={allHref} showDisabledLinks={showPlaceholders} />
    </section>
  );
}
