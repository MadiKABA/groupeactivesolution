import { existsSync } from "node:fs";
import path from "node:path";

import { CtaMotion, type CtaLink } from "@/components/formations/cta-motion";
import { ROUTES } from "@/lib/routes";

/*
 * Section 6 (dernière) de /formations/ecole : CTA final. Server Component : fond blanc pur, sans motif.
 * Liens de renvoi rendus seulement si leur page existe (détectée au build) : aucun lien mort ; aucun lien
 * → ni filet ni ligne de renvoi. Le contenu est rendu par `CtaMotion` (Motion), dans le HTML initial.
 * Classes `fc-*`.
 */

const CANDIDATES = [
  { href: "/formations/metiers-du-numerique", label: "Se former aux métiers du numérique", segment: "metiers-du-numerique" },
  { href: "/formations/organisations", label: "Pour les organisations", segment: "organisations" },
] as const;

export function FormationsEcoleCta() {
  const links: CtaLink[] = CANDIDATES.filter((link) => existsSync(path.join(process.cwd(), "src/app/formations", link.segment, "page.tsx"))).map(
    ({ href, label }) => ({ href, label }),
  );

  return (
    <section aria-labelledby="ecole-cta-title" className="fc relative isolate bg-brand-white text-brand-navy">
      {/* Sans JavaScript : états initiaux de Motion neutralisés */}
      <noscript>
        <style>{".fc [data-reveal]{opacity:1!important;transform:none!important}.fc .fc-dot{opacity:.7!important}.fc .fc-ring{stroke-dasharray:none!important;stroke-dashoffset:0!important}"}</style>
      </noscript>

      <CtaMotion
        eyebrow="Parlons-en"
        titleLines={["Parlons du numérique", "dans votre établissement."]}
        // À valider
        text="Dites-nous où en est votre établissement : ses élèves, ses niveaux, ses contraintes. Nous construisons la suite avec vous."
        cta={{ label: "Planifier un échange", href: `${ROUTES.contact}?sujet=ecole` }}
        links={links}
      />
    </section>
  );
}
