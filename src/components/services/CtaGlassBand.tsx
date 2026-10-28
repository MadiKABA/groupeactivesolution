import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { WaveMotif } from "@/components/ui/WaveMotif";

/*
 * Bande CTA sur fond bleu nuit (fin de /services) : titre, ligne de soutien et un seul bouton dans
 * un panneau de verre presque invisible (seul backdrop-filter de la section). Lueurs en dégradés
 * radiaux, zigzag doré dans les deux coins bas. Server Component, sans JavaScript : entrées et
 * dérive en CSS (animation-timeline: view()), contenu visible d'emblée sans prise en charge.
 * Classes `cg-*` de globals.css.
 */
export function CtaGlassBand({
  id = "contact-cta",
  titleId = "cta-title",
  title,
  titleHighlight,
  support,
  cta,
}: {
  id?: string;
  titleId?: string;
  title: string;
  /** Fin du titre, en dégradé doré. */
  titleHighlight: string;
  support: string;
  cta: { label: string; href: string };
}) {
  return (
    <section id={id} aria-labelledby={titleId} className="cg-section">
      <div aria-hidden="true" className="cg-backdrop">
        <div className="cg-glow cg-glow--gold" />
        <div className="cg-glow cg-glow--blue" />
        <div className="cg-glow cg-glow--low" />
        <WaveMotif tone="dark" mask="bl" />
        <WaveMotif tone="dark" mask="br" />
      </div>

      <div className="cg-panel">
        <h2 id={titleId} className="cg-title">
          <span className="cg-line">
            <span className="cg-line-inner">{title}</span>
          </span>{" "}
          <span className="cg-line">
            <span className="cg-line-inner cg-line-inner--late cg-gold">{titleHighlight}</span>
          </span>
        </h2>
        <p className="cg-support">{support}</p>
        <Link href={cta.href} className="cg-button">
          {cta.label}
          <ArrowRight aria-hidden="true" className="cg-button-icon" />
        </Link>
      </div>
    </section>
  );
}
