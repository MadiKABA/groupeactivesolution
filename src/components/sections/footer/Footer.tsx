import { existsSync } from "node:fs";
import { join } from "node:path";

import { ArrowUp, Mail, MapPin, Phone } from "lucide-react";
import { cacheLife } from "next/cache";
import Image from "next/image";

import { reveal } from "@/components/sections/formations/reveal";
import { SocialIcon } from "@/components/ui/icons/SocialIcons";
import { WaveMotif } from "@/components/ui/WaveMotif";
import { footerLabels, footerLegal, footerNavigation, footerServices, footerTagline, type FooterLink } from "@/lib/footer";
import { SITE_CONTACT, SOCIALS } from "@/lib/site";

import { BackToTop } from "./BackToTop";
import { FooterLive } from "./FooterLive";
import { FooterRings } from "./FooterRings";

/** Logo officiel pour fond sombre (le même que le header), viewBox 1000 × 550. */
const LOGO = { src: "/logos/logo.svg", width: 1000, height: 550 };

const PAGE_FILES = ["page.tsx", "page.ts", "page.jsx", "page.js"];

/** La route existe : src/app/<route>/page.(tsx|ts|jsx|js). Lu au build (page statique). */
const routeExists = (href: string) => PAGE_FILES.some((file) => existsSync(join(process.cwd(), "src", "app", href.replace(/^\//, ""), file)));

/** Année courante : `new Date()` exige un cache explicite avec cacheComponents (renouvelé chaque jour). */
async function CurrentYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

function LinkColumn({ title, links, delay }: { title: string; links: readonly FooterLink[]; delay: number }) {
  return (
    <nav aria-label={title} className="ft-col ft-a" {...reveal(delay, 550)}>
      <h2 className="ft-col-title">{title}</h2>
      <ul className="ft-col-list">
        {links.map((link) => (
          <li key={link.href}>
            <a href={link.href} className="ft-link">
              <span className="ft-link-text">{link.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/*
 * Footer du site (fond bleu nuit profond). Rendu côté serveur : marque, réseaux (site.ts), colonnes
 * Services et Navigation, coordonnées (site.ts), liens légaux seulement si la page existe, copyright.
 * Décor statique : filet doré, zigzag doré en haut à droite, anneaux concentriques (FooterRings).
 * Seuls composants client : FooterLive (révélation du contenu à l'entrée) et BackToTop.
 */
export function Footer() {
  const legal = footerLegal.filter((link) => routeExists(link.href));
  const contacts = [
    { key: "phone", href: SITE_CONTACT.phone.href, label: SITE_CONTACT.phone.display, icon: Phone, external: false },
    { key: "email", href: `mailto:${SITE_CONTACT.email}`, label: SITE_CONTACT.email, icon: Mail, external: false },
    { key: "address", href: SITE_CONTACT.address.mapsUrl, label: SITE_CONTACT.address.display, icon: MapPin, external: true },
  ];

  return (
    <footer className="ft relative isolate text-text-on-dark">
      <FooterLive />

      <div aria-hidden="true" className="ft-decor">
        <WaveMotif tone="dark" mask="tr" />
        <div className="ft-topline" />
      </div>

      <div className="ft-inner site-container">
        <div className="ft-top">
          <div className="ft-brand ft-a" {...reveal(200, 550)}>
            <Image src={LOGO.src} alt={footerLabels.logoAlt} width={LOGO.width} height={LOGO.height} className="ft-logo" />
            <p className="ft-tagline">
              {footerTagline.text} <span className="rz-gradient-text">{footerTagline.highlight}</span>
            </p>
            <ul className="ft-socials">
              {SOCIALS.map((social) => {
                const icon = <SocialIcon id={social.id} className="size-5" />;
                return (
                  <li key={social.id}>
                    {social.href.trim() ? (
                      <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`${social.label} ${footerLabels.newTab}`} className="ft-social">
                        {icon}
                      </a>
                    ) : (
                      <span role="link" aria-disabled="true" aria-label={`${social.label} ${footerLabels.soon}`} className="ft-social">
                        {icon}
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>

          {/* Services et Navigation ; les anneaux se centrent sur ce bloc (desktop : sur toute la zone haute) */}
          <div className="ft-links">
            <FooterRings />
            <LinkColumn title={footerLabels.services} links={footerServices} delay={320} />
            <LinkColumn title={footerLabels.navigation} links={footerNavigation} delay={440} />
          </div>
        </div>

        <div aria-hidden="true" className="ft-rule ft-a" {...reveal(560, 550, "scaleX(0)")} />
        <div className="ft-contact">
          <ul className="ft-contact-list ft-a" {...reveal(560, 550)}>
            {contacts.map(({ key, href, label, icon: Icon, external }) => (
              <li key={key}>
                <a href={href} className="ft-contact-link" {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                  <Icon aria-hidden="true" className="ft-contact-icon" />
                  <span>{label}</span>
                  {external && <span className="sr-only"> {footerLabels.newTab}</span>}
                </a>
              </li>
            ))}
          </ul>
          {legal.length > 0 && (
            <nav aria-label={footerLabels.legal} className="ft-legal ft-a" {...reveal(620, 550)}>
              <ul>
                {legal.map((link) => (
                  <li key={link.href}>
                    <a href={link.href} className="ft-legal-link">
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>
          )}
        </div>

        <div className="ft-bottom ft-a" {...reveal(680, 550)}>
          <p className="ft-copy">
            © <CurrentYear /> {footerLabels.copyright}
          </p>
          <BackToTop className="ft-totop">
            <span>{footerLabels.backToTop}</span>
            <span aria-hidden="true" className="ft-totop-circle">
              <ArrowUp className="ft-totop-arrow" strokeWidth={2.2} />
            </span>
          </BackToTop>
        </div>
      </div>
    </footer>
  );
}
