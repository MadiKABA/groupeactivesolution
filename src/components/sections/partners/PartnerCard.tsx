import Image from "next/image";
import type { CSSProperties } from "react";

import { partnersIntro, type Partner } from "@/lib/partners";
import type { CardBox } from "@/lib/partners-layout";

type PartnerCardProps = {
  index: number;
  box: CardBox;
  /** Partenaire, ou carte de débordement « +N » (inerte). */
  partner: Partner | null;
  overflow?: number;
};

/**
 * Carte d'un partenaire : logo (monochrome au repos, couleurs au survol / focus) ou, sans logo, son
 * nom en mot-symbole ; lien vers son site seulement si website est vérifié (sinon simple <li>, jamais
 * de lien mort ni de tabindex). Position desktop lue dans --x, --y, --w, --h (centre dans la scène) ;
 * empilée en flux normal sous 1024px.
 */
export function PartnerCard({ index, box, partner, overflow = 0 }: PartnerCardProps) {
  const style = { "--x": `${box.x}px`, "--y": `${box.y}px`, "--w": `${box.w}px`, "--h": `${box.h}px`, "--i": index } as CSSProperties;
  const tooltipId = partner?.relation ? `partner-tip-${partner.id}` : undefined;
  const content = partner ? (
    partner.logo ? (
      <>
        <Image
          src={partner.logo.src}
          alt={partner.logoAlt}
          width={partner.logo.width}
          height={partner.logo.height}
          sizes="140px"
          unoptimized={partner.logo.src.endsWith(".svg")}
          className="pt-logo max-h-11 w-auto max-w-35 object-contain"
        />
        {!partner.logoAlt.toLowerCase().includes(partner.name.toLowerCase()) && <span className="sr-only">{partner.name}</span>}
      </>
    ) : (
      <span className="pt-logo text-body-lg leading-tight font-bold tracking-wordmark text-brand-navy">{partner.name}</span>
    )
  ) : (
    <span className="text-base font-bold text-brand-navy/80">{partnersIntro.more(overflow)}</span>
  );
  const card = "pt-card relative flex h-full w-full items-center justify-center rounded-[20px] border px-5 text-center";

  return (
    <li data-pt-card={index} data-more={partner ? undefined : ""} className="pt-item" style={style}>
      {partner?.website ? (
        <a href={partner.website} target="_blank" rel="noopener noreferrer" aria-label={`${partner.name} ${partnersIntro.newTab}`} aria-describedby={tooltipId} className={card}>
          {content}
        </a>
      ) : (
        // Carte sans site : ni lien ni tabindex (effets au survol souris seulement) ; « +N » inerte.
        <div className={card} aria-describedby={tooltipId}>
          {content}
        </div>
      )}
      {partner?.relation && (
        <span id={tooltipId} role="tooltip" className="pt-tooltip pointer-events-none absolute top-full left-1/2 z-20 mt-2.5 w-max max-w-60 rounded-xl bg-brand-navy px-3.5 py-2.5 text-left">
          <span className="block text-2xs font-bold tracking-category text-brand-gold-light uppercase">{partner.name}</span>
          <span className="mt-0.5 block text-tag text-text-on-dark">{partner.relation}</span>
        </span>
      )}
    </li>
  );
}
