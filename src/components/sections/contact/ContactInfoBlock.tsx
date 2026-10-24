import { ArrowUpRight, Mail, MapPin, Phone } from "lucide-react";
import type { ReactNode } from "react";

import { reveal } from "@/components/sections/formations/reveal";
import { contactInfoLabels } from "@/lib/contact";
import { SITE_CONTACT } from "@/lib/site";

import { CopyButton } from "./CopyButton";

/** Entrée des lignes : 60 ms d'intervalle après le bloc (ms). */
const ROWS_AT = 340;
const ROW_STAGGER = 60;

const ICON_BOX = "ct-icon flex size-13 shrink-0 items-center justify-center rounded-2xl border";

function Row({ index, icon, label, children, action }: { index: number; icon: ReactNode; label: string; children: ReactNode; action: ReactNode }) {
  return (
    <div className="ct-row ct-a flex items-center gap-4" {...reveal(ROWS_AT + index * ROW_STAGGER, 450, "translateY(12px)")}>
      {icon}
      <div className="min-w-0 flex-1">
        <p className="text-label-xs font-bold tracking-category text-text-on-dark/72 uppercase">{label}</p>
        <div className="mt-0.5">{children}</div>
      </div>
      {action}
    </div>
  );
}

/**
 * Bloc d'infos en verre : téléphone, e-mail, adresse (liens fonctionnels, avec ou sans JS).
 * Seuls les boutons « Copier » sont des composants client.
 */
export function ContactInfoBlock() {
  const { phone, email, address } = SITE_CONTACT;
  return (
    <div className="ct-glass ct-a flex flex-1 flex-col justify-between gap-4.5 rounded-2xl px-4.5 py-5 lg:p-7" {...reveal(280, 550)}>
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
        <a href={phone.href} className="inline-flex min-h-11 items-center text-lg font-semibold text-text-on-dark">
          {phone.display}
        </a>
      </Row>
      <hr className="border-text-on-dark/10" />
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
        <a href={`mailto:${email}`} className="inline-flex min-h-11 items-center text-email-sm font-semibold break-all text-text-on-dark xl:text-base">
          {email}
        </a>
      </Row>
      <hr className="border-text-on-dark/10" />
      <Row
        index={2}
        label={contactInfoLabels.address}
        icon={
          <a href={address.mapsUrl} target="_blank" rel="noopener noreferrer" aria-label={contactInfoLabels.openMaps} className={ICON_BOX}>
            <MapPin aria-hidden="true" className="size-5.5" />
          </a>
        }
        action={
          <a
            href={address.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={contactInfoLabels.seeMapsLabel}
            className="ct-maps flex size-11 shrink-0 items-center justify-center gap-1.5 rounded-lg border text-sm font-semibold text-text-on-dark lg:w-auto lg:px-4"
          >
            <span className="hidden lg:inline">{contactInfoLabels.seeMaps}</span>
            <ArrowUpRight aria-hidden="true" className="ct-maps-arrow size-4.5" />
          </a>
        }
      >
        <p className="text-lg font-semibold text-text-on-dark">{address.display}</p>
      </Row>
    </div>
  );
}
