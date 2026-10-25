import type { ReactNode } from "react";

/*
 * Objets de « l'établi », un par savoir-faire, en SVG inline décoratif (aria-hidden posé par le
 * conteneur). Couleurs par classes `eq-c-*` / `eq-s-*` (tokens de globals.css), aucun filtre SVG :
 * l'ombre au sol est un dégradé CSS (.eq-floor). Chaque viewBox est rogné sur la boîte réelle du
 * dessin (getBBox, traits compris) : le bord du SVG est le bord visible de l'objet, ce qui permet
 * d'aligner l'objet de gauche sur le conteneur. Rapport largeur/hauteur repris par TeamWorkbench.
 */

/** 01 Former : carte électronique (PCB bleu nuit, pistes dorées, puce). */
function Board() {
  return (
    <svg viewBox="4 4 222 149" className="eq-svg">
      <rect x="4" y="10" width="222" height="143" rx="12" className="eq-c-deep" />
      <rect x="4" y="4" width="222" height="143" rx="12" className="eq-c-navy" />
      <rect x="11" y="11" width="208" height="129" rx="7" fill="none" strokeWidth="1" className="eq-s-glow" />
      <g fill="none" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="eq-s-gold">
        <path d="M88 60H52L40 48H26" />
        <path d="M88 78H30" />
        <path d="M88 96H56L44 108H26" />
        <path d="M142 60H170L182 48H204" />
        <path d="M142 82H204" />
        <path d="M142 100H176L188 112V126" />
        <path d="M104 44V28H124V20" />
        <path d="M128 44V32" />
        <path d="M110 116V130" />
        <path d="M128 116V124H150" />
      </g>
      <g className="eq-c-gold">
        <circle cx="26" cy="48" r="3.4" />
        <circle cx="30" cy="78" r="3.4" />
        <circle cx="26" cy="108" r="3.4" />
        <circle cx="204" cy="48" r="3.4" />
        <circle cx="204" cy="82" r="3.4" />
        <circle cx="188" cy="126" r="3.4" />
        <circle cx="124" cy="20" r="3.4" />
        <circle cx="128" cy="32" r="3.4" />
        <circle cx="110" cy="130" r="3.4" />
        <circle cx="150" cy="124" r="3.4" />
      </g>
      <rect x="88" y="44" width="54" height="72" rx="6" strokeWidth="1.5" className="eq-c-deep eq-s-glow" />
      <rect x="96" y="52" width="38" height="56" rx="3" className="eq-c-raised" />
      <circle cx="103" cy="59" r="2.6" className="eq-c-gold" />
      <rect x="160" y="22" width="22" height="12" rx="2.5" className="eq-c-paper-2" />
      <rect x="40" y="122" width="26" height="10" rx="2.5" className="eq-c-gold-light" />
      <rect x="156" y="132" width="10" height="6" rx="1.5" className="eq-c-paper-2" />
      <g strokeWidth="2" className="eq-c-deep eq-s-gold">
        <circle cx="17" cy="17" r="4.5" />
        <circle cx="213" cy="17" r="4.5" />
        <circle cx="17" cy="134" r="4.5" />
        <circle cx="213" cy="134" r="4.5" />
      </g>
    </svg>
  );
}

/** 02 Développer : ordinateur portable, lignes de code or et gris, curseur qui clignote. */
function Laptop() {
  return (
    <svg viewBox="0 4 250 167" className="eq-svg">
      <rect x="30" y="4" width="190" height="128" rx="10" className="eq-c-raised" />
      <rect x="38" y="12" width="174" height="110" rx="4" className="eq-c-navy" />
      <circle cx="125" cy="8" r="1.6" className="eq-c-glow" />
      <g className="eq-c-code">
        <rect x="88" y="24" width="56" height="5" rx="2.5" />
        <rect x="62" y="36" width="40" height="5" rx="2.5" />
        <rect x="62" y="48" width="70" height="5" rx="2.5" />
        <rect x="106" y="60" width="48" height="5" rx="2.5" />
        <rect x="74" y="72" width="60" height="5" rx="2.5" />
        <rect x="62" y="84" width="36" height="5" rx="2.5" />
      </g>
      <g className="eq-c-gold">
        <rect x="50" y="24" width="34" height="5" rx="2.5" />
        <rect x="74" y="60" width="28" height="5" rx="2.5" />
        <rect x="50" y="96" width="22" height="5" rx="2.5" />
      </g>
      <rect x="106" y="36" width="30" height="5" rx="2.5" className="eq-c-gold-light" />
      <rect x="77" y="94" width="3" height="9" rx="1" className="eq-c-gold eq-cursor" />
      <path d="M14 132H236L249 158a6 6 0 0 1-5.4 8.6H6.4A6 6 0 0 1 1 158Z" strokeWidth="1" className="eq-c-paper eq-s-line" />
      <rect x="38" y="138" width="174" height="11" rx="3" className="eq-c-paper-2" />
      <rect x="100" y="152" width="50" height="9" rx="3" className="eq-c-paper-2" />
      <path d="M1 160h248v3a8 8 0 0 1-8 8H9a8 8 0 0 1-8-8Z" className="eq-c-line" />
    </svg>
  );
}

/** 03 Conseiller : carnet ouvert, coche dorée dans un cercle, post-it doré et stylo. */
function Notebook() {
  return (
    <svg viewBox="4 10 222 152" className="eq-svg">
      <rect x="4" y="10" width="222" height="152" rx="10" className="eq-c-navy" />
      <path d="M12 16h98a5 5 0 0 1 5 5v134H17a5 5 0 0 1-5-5Z" className="eq-c-paper" />
      <path d="M115 21a5 5 0 0 1 5-5h98v134a5 5 0 0 1-5 5h-98Z" className="eq-c-paper" />
      <rect x="111" y="16" width="8" height="139" className="eq-c-spine" />
      <g className="eq-c-line">
        <rect x="24" y="34" width="76" height="2.5" rx="1.25" />
        <rect x="24" y="46" width="76" height="2.5" rx="1.25" />
        <rect x="24" y="58" width="76" height="2.5" rx="1.25" />
        <rect x="24" y="70" width="50" height="2.5" rx="1.25" />
        <rect x="130" y="88" width="76" height="2.5" rx="1.25" />
        <rect x="130" y="100" width="62" height="2.5" rx="1.25" />
      </g>
      <circle cx="160" cy="50" r="18" fill="none" strokeWidth="3" className="eq-s-gold-line" />
      <path
        d="M151.5 50.5l6 6L169.5 43.5"
        fill="none"
        strokeWidth="3.4"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="eq-s-gold-line"
      />
      <g transform="rotate(-6 56 118)">
        <rect x="30" y="92" width="52" height="50" rx="3" className="eq-c-gold-light" />
        <path d="M70 142l12-12v9a3 3 0 0 1-3 3Z" className="eq-c-gold-deep" />
        <rect x="38" y="104" width="34" height="3" rx="1.5" className="eq-c-ink" />
        <rect x="38" y="113" width="24" height="3" rx="1.5" className="eq-c-ink" />
      </g>
      <g transform="rotate(-32 176 126)">
        <path d="M128 126l12-5v10Z" className="eq-c-paper-2 eq-s-line" strokeWidth="1" />
        <rect x="140" y="121" width="76" height="10" rx="5" className="eq-c-navy" />
        <rect x="194" y="121" width="8" height="10" className="eq-c-gold" />
      </g>
    </svg>
  );
}

/** 04 Accompagner : deux bulles de discussion (sombre à trois points, dorée à deux lignes). */
function Bubbles() {
  return (
    <svg viewBox="8 8 204 164" className="eq-svg">
      <path
        d="M32 8h104a24 24 0 0 1 24 24v32a24 24 0 0 1-24 24H58l-22 18V88h-4A24 24 0 0 1 8 64V32A24 24 0 0 1 32 8Z"
        className="eq-c-navy"
      />
      <g className="eq-c-paper">
        <circle cx="58" cy="48" r="7" className="eq-blink" />
        <circle cx="84" cy="48" r="7" className="eq-blink" />
        <circle cx="110" cy="48" r="7" className="eq-blink" />
      </g>
      <path
        d="M88 94h100a24 24 0 0 1 24 24v16a24 24 0 0 1-24 24h-2v14l-18-14H88a24 24 0 0 1-24-24v-16a24 24 0 0 1 24-24Z"
        className="eq-c-gold"
      />
      <rect x="86" y="112" width="100" height="7" rx="3.5" className="eq-c-ink" />
      <rect x="86" y="129" width="66" height="7" rx="3.5" className="eq-c-ink" />
    </svg>
  );
}

const OBJECTS: Record<string, ReactNode> = {
  former: <Board />,
  developper: <Laptop />,
  conseiller: <Notebook />,
  accompagner: <Bubbles />,
};

/** Objet d'un savoir-faire (null si aucun dessin n'existe pour cet identifiant). */
export function TeamObject({ id }: { id: string }) {
  return OBJECTS[id] ?? null;
}
