import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { WaveMotif } from "@/components/ui/WaveMotif";
import { ROUTES } from "@/lib/routes";

/*
 * Hero de /formations/ecole. Server Component, aucun JavaScript client : l'entrée et les survols sont
 * en CSS pur (classes `fh-*` de globals.css), le contenu est visible sans animation.
 * Fond identique au hero de l'accueil (`hero-backdrop`, `hero-grain`) ; le padding-top compense le header fixe.
 * Bloc de gauche : classes du hero de /services (`sv-title`, `sv-subtitle`, `sv-cta`, `sv-cta-icon`) ;
 * les classes `fh-*` n'y ajoutent que la taille du titre (3 lignes) et la séquence d'entrée.
 */

const PAGE = "/formations/ecole";

type Level = {
  id: "primaire" | "college" | "lycee";
  label: string;
  ariaLabel: string;
  /**
   * Photo réelle (public/…) et sa description, à renseigner seulement après l'avoir vue.
   * Rendu par next/image en `fill` dans le cadre 3:4 (ratio réservé : aucun CLS) ; `priority`
   * uniquement sur la première photo visible (Primaire).
   */
  photo?: { src: string; alt: string };
};

// Ordre de l'escalier : bas-gauche → haut-droit.
const levels: readonly Level[] = [
  { id: "primaire", label: "Primaire", ariaLabel: "Niveau primaire : voir le programme" },
  { id: "college", label: "Collège", ariaLabel: "Niveau collège : voir le programme" },
  { id: "lycee", label: "Lycée", ariaLabel: "Niveau lycée : voir le programme" },
];

const lines = ["Vos élèves ne", "consomment pas le numérique,"] as const;

export function FormationsEcoleHero() {
  return (
    <section aria-labelledby="formations-ecole-title" className="fh">
      <div className="fh-bg" aria-hidden="true">
        <div className="hero-backdrop absolute inset-0" />
        <div className="hero-grain absolute inset-0" />
        <WaveMotif tone="dark" mask="full" />
      </div>

      <div className="fh-grid site-container">
        <div className="fh-text">
          {/* Une ligne par <span> (bloc, sans retour) ; espaces entre les lignes pour la lecture */}
          <h1 id="formations-ecole-title" className="sv-title fh-title">
            {lines.map((line) => (
              <span key={line} className="fh-line">
                {line}{" "}
              </span>
            ))}
            <span className="fh-line fh-gold">ils le créent.</span>
          </h1>

          <p className="sv-subtitle fh-desc">
            Active Solution accompagne les écoles primaires, collèges et lycées de Dakar : des programmes
            par niveau, des formateurs spécialisés et le matériel nécessaire.
          </p>

          <Link href={`${ROUTES.contact}?sujet=ecole`} className="sv-cta fh-cta">
            Planifier une séance pilote
            <ArrowRight aria-hidden="true" className="sv-cta-icon" />
          </Link>
        </div>

        <div className="fh-visual">
          {/* Trait doré qui passe d'un cadre à l'autre (escalier, dès 768px) */}
          <svg className="fh-trail" viewBox="0 0 100 77.333" aria-hidden="true" focusable="false">
            {/* Du bord droit de Primaire au bas de Collège, puis du bord droit de Collège au bas de Lycée */}
            <path pathLength={1} d="M 40 71 C 47 71 52 69.5 54 65.33" />
            <path pathLength={1} d="M 70 59 C 76 59 80 57.5 82 53.33" />
          </svg>

          <ul className="fh-stairs">
            {levels.map((level, index) => (
              <li key={level.id} className="fh-step" style={{ "--i": index } as CSSProperties}>
                <Link href={`${PAGE}#${level.id}`} aria-label={level.ariaLabel} className="fh-frame">
                  {level.photo && (
                    <Image
                      src={level.photo.src}
                      alt={level.photo.alt}
                      fill
                      priority={index === 0}
                      sizes="(min-width: 1024px) 20vw, (min-width: 768px) 30vw, 33vw"
                      className="fh-photo"
                    />
                  )}
                  <svg className="fh-mark" viewBox="0 0 48 48" aria-hidden="true" focusable="false">
                    <circle cx="24" cy="24" r="20" />
                    <circle cx="24" cy="24" r="3.5" className="fh-mark-dot" />
                  </svg>
                  <span className="fh-tag" aria-hidden="true">
                    {level.label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
