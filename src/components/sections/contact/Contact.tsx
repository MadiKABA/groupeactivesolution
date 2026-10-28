import { reveal } from "@/components/sections/formations/reveal";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import { SocialIcon } from "@/components/ui/icons/SocialIcons";
import { contactForm, contactInfoLabels, contactIntro } from "@/lib/contact";
import { getMailtoUrl, getWhatsAppUrl, SOCIALS } from "@/lib/site";

import { CardMotif } from "./CardMotif";
import { ContactForm } from "./ContactForm";
import { ContactInfoBlock } from "./ContactInfoBlock";
import { ContactReveal } from "./ContactReveal";

/** Pastilles sociales : 70 ms d'intervalle après la carte (ms). */
const SOCIALS_AT = 460;
const SOCIAL_STAGGER = 70;

/** Sans JS : formulaire remplacé par deux liens directs. */
const NOSCRIPT_STYLE = ".ct-form-js{display:none!important}.ct-form-fallback{display:flex!important}";

/*
 * Section « Contact » de la page /contact (fond blanc cassé à motif bleu nuit), entre le hero et le
 * footer. Rendue côté serveur : titre, coordonnées (liens fonctionnels sans JS), réseaux renseignés,
 * carte du formulaire. Composants client : ContactReveal (entrée), ContactForm, CopyButton.
 */
export function Contact() {
  return (
    <section id="contact" aria-labelledby="contact-title" className="ct-section relative isolate overflow-x-clip bg-surface-cream text-brand-navy">
      <ContactReveal>
        <div className="site-container relative z-10">
          {/* Deux colonnes égales (bas alignés), sur toute la largeur de site-container : mêmes bords que le header */}
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-x-14">
            <div className="ct-col flex flex-col gap-7">
              <p className="flex items-center gap-3 text-tag font-bold tracking-eyebrow text-gold-ink-warm uppercase">
                <span aria-hidden="true" className="ct-a h-0.5 w-9 origin-left bg-gold-line" {...reveal(0, 500, "scaleX(0)")} />
                <span className="ct-a" {...reveal(0, 450)}>
                  {contactIntro.eyebrow}
                </span>
              </p>
              <h2 id="contact-title" className="ct-title font-extrabold tracking-display text-brand-navy">
                {/* Mots en inline-block (retour à la ligne entre les mots en mobile) ; « projet. » 140 ms après */}
                {contactIntro.title.split(" ").map((word) => (
                  <span key={word}>
                    <span className="ct-a inline-block" {...reveal(80, 600)}>
                      {word}
                    </span>{" "}
                  </span>
                ))}
                <span className="ct-a inline-block" {...reveal(220, 600)}>
                  <span className="text-gold-ink-deep">{contactIntro.titleHighlight}</span>
                </span>
              </h2>
              <p className="ct-a max-w-130 text-base leading-relaxed text-text-slate lg:text-lg" {...reveal(180, 550)}>
                {contactIntro.intro}
              </p>

              <div className="flex flex-1 flex-col gap-7">
                <ContactInfoBlock />
                {/* Toujours affichée : un réseau sans URL est une icône désactivée (jamais un lien mort). Sous 480px, libellé au-dessus et pastilles sur toute la largeur */}
                <div className="ct-glass ct-a flex flex-col items-start gap-3 rounded-hero px-4.5 py-4 xs:flex-row xs:items-center xs:justify-between xs:gap-4 lg:px-6 lg:py-4.5" {...reveal(400, 550)}>
                  <CardMotif />
                  <h3 className="text-label-xs font-bold tracking-category whitespace-nowrap text-text-slate uppercase">{contactInfoLabels.follow}</h3>
                  <ul className="flex w-full justify-between xs:w-auto xs:justify-start xs:gap-2.5 lg:gap-3">
                    {SOCIALS.map((social, index) => {
                      const icon = <SocialIcon id={social.id} className="size-5.5" />;
                      const pill = "ct-social flex size-13 items-center justify-center rounded-full border lg:size-14";
                      return (
                        <li key={social.id} className="ct-pop" {...reveal(SOCIALS_AT + index * SOCIAL_STAGGER, 450)}>
                          {social.href.trim() ? (
                            <a href={social.href} target="_blank" rel="noopener noreferrer" aria-label={`${social.label} ${contactInfoLabels.newTab}`} className={pill}>
                              {icon}
                            </a>
                          ) : (
                            <span role="link" aria-disabled="true" aria-label={`${social.label} ${contactInfoLabels.soon}`} className={pill}>
                              {icon}
                            </span>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </div>
              </div>
            </div>

            {/* Colonne droite : formulaire de la hauteur de la colonne gauche (liens directs sans JS) */}
            <div className="ct-form-card ct-a flex flex-col rounded-hero border px-5 py-6 lg:px-8 lg:py-11" {...reveal(220, 600)}>
              <CardMotif />
              <noscript>
                <style>{NOSCRIPT_STYLE}</style>
              </noscript>
              <div className="ct-form-js flex flex-1 flex-col">
                <ContactForm />
              </div>
              <div className="ct-form-fallback hidden flex-1 flex-col justify-center gap-3">
                <h3 className="text-h3-lg font-extrabold text-brand-navy">{contactForm.title}</h3>
                <a
                  href={getWhatsAppUrl()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ct-primary mt-3 flex h-14 items-center justify-center gap-2.5 rounded-2xl text-base font-extrabold text-brand-navy"
                >
                  <WhatsAppIcon className="size-5.5" />
                  {contactForm.fallbackWhatsapp}
                </a>
                <a href={getMailtoUrl()} className="ct-secondary flex h-12 items-center justify-center rounded-2xl border text-base font-semibold">
                  {contactForm.fallbackEmail}
                </a>
              </div>
            </div>
          </div>
        </div>
      </ContactReveal>
    </section>
  );
}
