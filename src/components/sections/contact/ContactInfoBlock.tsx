import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";

import { reveal } from "@/components/sections/formations/reveal";
import { contactInfoLabels } from "@/lib/contact";
import { SITE_CONTACT } from "@/lib/site";

import { CardMotif } from "./CardMotif";
import { CopyButton } from "./CopyButton";

/** Entrée des lignes : 60 ms d'intervalle après le bloc (ms). */
const ROWS_AT = 340;
const ROW_STAGGER = 60;

const ICON_BOX = "ct-icon flex size-13 shrink-0 items-center justify-center rounded-full border lg:size-14";

type RowProps = { index: number; icon: ReactNode; label: string; children: ReactNode; action: ReactNode; wrap?: boolean };

/** Rangée : icône, libellé et valeur, bouton à droite (`wrap` : bouton sous la valeur sous 640px). */
function Row({ index, icon, label, children, action, wrap = false }: RowProps) {
  return (
    <div className={`ct-row ct-a flex items-center gap-x-4 gap-y-3 py-4 ${wrap ? "flex-wrap sm:flex-nowrap" : ""}`} {...reveal(ROWS_AT + index * ROW_STAGGER, 450, "translateY(12px)")}>
      {icon}
      <div className="min-w-0 flex-1">
        <p className="text-label-xs font-bold tracking-category text-text-slate uppercase">{label}</p>
        <div className="mt-3">{children}</div>
      </div>
      {action}
    </div>
  );
}

/**
 * Bloc d'infos en verre clair : téléphone, e-mail, adresse (liens fonctionnels, avec ou sans JS), trois
 * rangées de même hauteur qui remplissent la carte. Seuls les boutons « Copier » sont des composants client.
 */
export function ContactInfoBlock() {
  const { phone, email, address } = SITE_CONTACT;
  return (
    <address className="ct-glass ct-a flex flex-1 flex-col rounded-hero px-4.5 py-2 not-italic lg:px-7 lg:py-3" {...reveal(280, 550)}>
      <CardMotif />
      <Row
        index={0}
        label={contactInfoLabels.phone}
        icon={
          <span aria-hidden="true" className={ICON_BOX}>
            <Phone className="size-5.5" />
          </span>
        }
        action={<CopyButton value={phone.display} label={contactInfoLabels.copyPhone} />}
      >
        <a href={phone.href} className="inline-flex min-h-11 items-center text-contact-value font-bold text-brand-navy">
          {phone.display}
        </a>
      </Row>
      <hr className="border-brand-navy/10" />
      <Row
        index={1}
        label={contactInfoLabels.email}
        icon={
          <span aria-hidden="true" className={ICON_BOX}>
            <Mail className="size-5.5" />
          </span>
        }
        action={<CopyButton value={email} label={contactInfoLabels.copyEmail} />}
      >
        <a href={`mailto:${email}`} className="inline-flex min-h-11 items-center text-email-sm font-bold wrap-anywhere text-brand-navy sm:text-contact-value">
          {email}
        </a>
      </Row>
      <hr className="border-brand-navy/10" />
      <Row
        index={2}
        wrap
        label={contactInfoLabels.address}
        icon={
          <a href={address.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label={contactInfoLabels.openMaps} className={ICON_BOX}>
            <MapPin aria-hidden="true" className="size-5.5" />
          </a>
        }
        action={
          // Sous 640px : pleine largeur sous l'adresse
          <a
            href={address.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={contactInfoLabels.seeMapsLabel}
            className="ct-maps flex h-11.5 w-full shrink-0 items-center justify-center gap-1.5 rounded-full border px-4 text-sm font-semibold sm:w-auto"
          >
            <span>{contactInfoLabels.seeMaps}</span>
            <ArrowUpRight aria-hidden="true" className="ct-maps-arrow size-4.5" />
          </a>
        }
      >
        <p className="text-contact-value font-bold text-brand-navy">{address.display}</p>
      </Row>
    </address>
  );
}
