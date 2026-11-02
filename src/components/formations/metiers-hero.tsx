import { ArrowRight } from "lucide-react";
import { existsSync } from "node:fs";
import { join } from "node:path";
import Link from "next/link";

import { MetiersArche } from "@/components/formations/metiers-arche";
import { ROUTES } from "@/lib/routes";

/*
 * Hero de /formations/metiers-du-numerique (début de page). Server Component : texte, CTA et structure ;
 * l'entrée du texte est en CSS (classes `mh-*` de globals.css, keyframes `hero-fade`), l'arche est le seul
 * îlot client. Fond du hero de l'accueil (`hero-backdrop`). CTA = celui du hero de /formations/ecole (`sv-cta`).
 *
 * Photos (détectées au build, .avif | .webp | .jpg ; même cadrage et même ratio 3:4) :
 *   public/images/formations/metiers/en-formation.*   → image 1 (battants)
 *   public/images/formations/metiers/en-situation.*   → image 2 (révélée)
 * Tant qu'une photo manque : placeholder. Reste à confirmer : « référent digital », attestation par domaine.
 */

const DIR = "images/formations/metiers";

function findPhoto(name: string): string | null {
  for (const ext of ["avif", "webp", "jpg"]) {
    if (existsSync(join(process.cwd(), "public", DIR, `${name}.${ext}`))) return `/${DIR}/${name}.${ext}`;
  }
  return null;
}

const lines = ["Formez-vous", "aux métiers"] as const;

export function MetiersHero() {
  const photos = { formation: findPhoto("en-formation"), situation: findPhoto("en-situation") };

  return (
    <section aria-labelledby="metiers-title" className="mh">
      <div className="mh-bg" aria-hidden="true">
        <div className="hero-backdrop absolute inset-0" />
      </div>

      <div className="mh-grid site-container">
        <div className="mh-text">
          <h1 id="metiers-title" className="mh-title">
            {lines.map((line) => (
              <span key={line} className="mh-line">
                {line}{" "}
              </span>
            ))}
            <span className="mh-line mh-gold">du numérique.</span>
          </h1>

          {/* [À CONFIRMER] intitulé exact « référent digital » ; attestation pour tous les domaines */}
          <p className="mh-desc">
            Active Solution vous accompagne dans l&apos;apprentissage des métiers du numérique à Dakar :
            développement web et mobile, marketing digital, référent digital et d&apos;autres domaines. Des
            formations accessibles à différents profils, avec une attestation à l&apos;issue du parcours.
          </p>

          <Link href={`${ROUTES.contact}?sujet=candidature`} className="sv-cta mh-cta">
            Candidater à une formation
            <ArrowRight aria-hidden="true" className="sv-cta-icon" />
          </Link>
        </div>

        <MetiersArche photos={photos} />
      </div>
    </section>
  );
}
