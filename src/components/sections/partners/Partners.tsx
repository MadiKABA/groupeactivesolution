import Image from "next/image";
import type { CSSProperties } from "react";

import { reveal } from "@/components/sections/formations/reveal";
import { confirmedPartners, partners as allPartners, partnersIntro, type Partner } from "@/lib/partners";
import { layout, SCENE_WIDTH } from "@/lib/partners-layout";

import { PartnerCard } from "./PartnerCard";
import { PartnersStage } from "./PartnersStage";

/** Tracé des traits (ms) : traces depuis le cercle, 70 ms d'écart ; régime B : liaisons puis demi-arcs. */
const strokeDelay = (kind: "trace" | "arc" | "link", index: number) => (kind === "trace" ? 450 + index * 70 : kind === "link" ? 450 : 750);

/*
 * Section « Partenaires » (fond clair), entre Contact et le footer. Sans partenaire confirmé : en-tête,
 * cercle AS et phrase d'attente. Rendue côté serveur : en-tête, scène (traces SVG calculées par
 * layout(), cercle AS, liste des cartes) ; PartnersStage (client) pose les états et les lumières.
 * Un seul DOM : scène positionnée en desktop (avec JS), liste empilée sinon.
 */
export function Partners({ list = allPartners }: { list?: readonly Partner[] }) {
  const confirmed = confirmedPartners(list);
  const plan = layout(confirmed.length);
  const shown = confirmed.slice(0, plan.shown);
  const titleId = `partners-title`;

  return (
    <section id="partenaires" aria-labelledby={titleId} className="partners-section relative isolate overflow-x-clip bg-surface-warm text-brand-navy">
      <PartnersStage regime={plan.regime} routes={plan.routes} count={plan.cards.length} height={plan.height}>
        <header>
          <p className="flex items-center gap-3 text-tag font-bold tracking-eyebrow text-gold-ink-warm uppercase">
            <span aria-hidden="true" className="pt-a h-0.5 w-9 origin-left bg-gold-line" {...reveal(0, 500, "scaleX(0)")} />
            <span className="pt-a" {...reveal(0, 450)}>
              {partnersIntro.eyebrow}
            </span>
          </p>
          <h2 id={titleId} className="pt-a mt-5 text-display-partners font-extrabold tracking-display text-brand-navy" {...reveal(80, 600)}>
            {partnersIntro.title} <span className="gold-ink-text">{partnersIntro.titleHighlight}</span>
          </h2>
          <p className="pt-a mt-5 max-w-140 text-base leading-relaxed text-text-muted lg:text-lg" {...reveal(180, 550)}>
            {partnersIntro.intro}
          </p>
        </header>

        {/* Scène : 1248 px de large en desktop, réduite par --k ; flux empilé sous 1024px */}
        <div className="pt-wrap relative mt-12 lg:mt-16">
          <div className="pt-scene" style={{ "--h": `${plan.height}px`, "--cx": `${plan.center.x}px`, "--cy": `${plan.center.y}px`, "--sw": `${SCENE_WIDTH}px` } as CSSProperties}>
            <svg aria-hidden="true" className="pt-traces" viewBox={`0 0 ${SCENE_WIDTH} ${plan.height}`} fill="none">
              {plan.strokes.map((stroke, index) => (
                <path
                  key={index}
                  d={stroke.d}
                  pathLength={1}
                  data-kind={stroke.kind}
                  data-route={stroke.kind === "trace" ? index : undefined}
                  className="pt-stroke"
                  style={{ "--d": `${strokeDelay(stroke.kind, index)}ms` } as CSSProperties}
                />
              ))}
              {/* Surbrillance de la trace d'un partenaire (survol, focus, carte active) */}
              {plan.routes.map((route, index) => (
                <path key={`hl-${index}`} d={route} data-hl={index} className="pt-hl" />
              ))}
              {plan.nodes.map((node) => (
                <circle key={`${node.x}-${node.y}`} cx={node.x} cy={node.y} r="4" className="pt-node" />
              ))}
            </svg>

            {/* Trace verticale (mobile) */}
            <span aria-hidden="true" className="pt-mtrace" />

            {/* Cercle AS : anneaux, halo, sonar, ping ; sticky en mobile */}
            <div aria-hidden="true" className="pt-hub">
              <span className="pt-halo" />
              <span className="pt-ring pt-ring-1" />
              <span className="pt-ring pt-ring-2" />
              <span className="pt-sonar pt-sonar-1" />
              <span className="pt-sonar pt-sonar-2" />
              <span className="pt-ping" />
              <span className="pt-core">
                <Image src="/logos/logo-mark.svg" alt="" width={1000} height={420} unoptimized className="pt-mark h-auto w-[70%]" />
              </span>
              {confirmed.length >= 5 && <span className="pt-counter">01 / {String(plan.cards.length).padStart(2, "0")}</span>}
              <span className="pt-fade" />
            </div>

            {plan.cards.length > 0 && (
              <ul aria-label={partnersIntro.listLabel} className="pt-list">
                {plan.cards.map((box, index) => (
                  <PartnerCard key={shown[index]?.id ?? "more"} index={index} box={box} partner={shown[index] ?? null} overflow={plan.overflow} />
                ))}
              </ul>
            )}

            {/* Lumières (créées par PartnersStage) */}
            <div aria-hidden="true" className="pt-lights" />
          </div>
        </div>
        {plan.cards.length === 0 && <p className="pt-a mt-8 text-center text-base text-text-muted lg:text-lg">{partnersIntro.empty}</p>}
      </PartnersStage>
    </section>
  );
}
