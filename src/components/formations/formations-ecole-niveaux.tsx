import { existsSync } from "node:fs";
import path from "node:path";

import Image from "next/image";

import { NiveauxTabs } from "@/components/formations/niveaux-tabs";
import { WaveMotif } from "@/components/ui/WaveMotif";
import { niveaux, niveauxIntro, type Niveau } from "@/content/formations-ecole-niveaux";
import { showPlaceholders } from "@/lib/flags";

/*
 * « Nos programmes par niveau » (/formations/ecole), après « Notre rôle ». Server Component : structure,
 * titres et trois panneaux dans le HTML ; `NiveauxTabs` (seul îlot client) gère la sélection, l'adresse
 * (#primaire, #college, #lycee) et le clavier. Fond de la section Formations de l'accueil
 * (`formations-topline`, `formations-glow`, zigzag atténué `wave-motif--niveaux`). Classes `nv-*`.
 */

const FACT_LABELS = [
  ["classes", "Classes"],
  ["duration", "Durée"],
  ["groupSize", "Effectif"],
] as const;

// Photo détectée au build ; absente → placeholder (cercle doré et point central).
function hasPhoto(src: string) {
  return existsSync(path.join(process.cwd(), "public", src));
}

function Corner({ position }: { position: "tr" | "bl" }) {
  return (
    <svg className={`nv-corner nv-corner-${position}`} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
      {/* Suit l'arrondi de 16px du panneau */}
      <path d="M0 0.75 H47.25 A16 16 0 0 1 63.25 16.75 V64" />
    </svg>
  );
}

function Panel({ niveau }: { niveau: Niveau }) {
  const facts = FACT_LABELS.map(([key, label]) => ({ label, value: niveau.facts[key] })).filter(
    (fact) => fact.value !== null || showPlaceholders,
  );

  return (
    <>
      <Corner position="tr" />
      <Corner position="bl" />
      <div className="nv-media">
        <div className="nv-media-reveal">
          {hasPhoto(niveau.photo.src) ? (
            <Image
              src={niveau.photo.src}
              alt={niveau.photo.alt}
              fill
              sizes="(min-width: 1536px) 940px, (min-width: 768px) 62vw, 100vw"
              className="nv-photo"
            />
          ) : (
            <div className="nv-placeholder" aria-hidden="true">
              <svg viewBox="0 0 84 84" focusable="false">
                <circle cx="42" cy="42" r="41" />
                <circle cx="42" cy="42" r="5" className="nv-placeholder-dot" />
              </svg>
            </div>
          )}
        </div>
        <span className="nv-tag" aria-hidden="true">
          {niveau.number} · {niveau.label}
        </span>
      </div>

      <div className="nv-body">
        <h3 className="nv-h3">{niveau.title}</h3>
        <p className="nv-intent">{niveau.intent}</p>
        <ul className="nv-examples" aria-label="Exemples d'activités">
          {niveau.examples.map((example) => (
            <li key={example}>{example}</li>
          ))}
        </ul>
        {facts.length > 0 && (
          <dl className="nv-facts">
            {facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value ?? "À renseigner"}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </>
  );
}

export function FormationsEcoleNiveaux() {
  const header = (
    <header className="nv-header">
      <p className="nv-eyebrow">
        <span className="nv-eyebrow-line" aria-hidden="true" />
        {niveauxIntro.eyebrow}
      </p>
      <h2 id="niveaux-title" className="nv-title">
        {niveauxIntro.titleLines.map((line, i) => (
          <span key={line} className={i === 1 ? "nv-line nv-gold" : "nv-line"}>
            {line}{" "}
          </span>
        ))}
      </h2>
    </header>
  );

  return (
    <section aria-labelledby="niveaux-title" className="nv relative isolate overflow-x-clip bg-brand-navy text-text-on-dark">
      {/* Cibles des cadres du hero : le défilement natif de l'ancre amène ici, NiveauxTabs ouvre le niveau */}
      {niveaux.map((niveau) => (
        <span key={niveau.id} id={niveau.id} className="nv-anchor" aria-hidden="true" />
      ))}

      <div aria-hidden="true" className="formations-topline absolute inset-x-0 top-0 h-px" />
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-clip">
        <WaveMotif tone="dark" mask="full" className="wave-motif--niveaux" />
        <div className="formations-glow nv-glow absolute" />
      </div>

      {/* Sans JavaScript : les trois panneaux sont affichés. Couche `base` : seule façon de passer devant
          le `[hidden] { display: none !important }` du preflight de Tailwind (important dans une couche). */}
      <noscript>
        <style>{"@layer base{.nv .nv-panel[hidden]{display:block!important}}"}</style>
      </noscript>

      <NiveauxTabs
        header={header}
        items={niveaux.map(({ id, number, label, verb }) => ({ id, number, label, verb }))}
        panels={niveaux.map((niveau) => (
          <Panel key={niveau.id} niveau={niveau} />
        ))}
      />
    </section>
  );
}
