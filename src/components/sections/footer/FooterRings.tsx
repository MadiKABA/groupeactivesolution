import type { CSSProperties } from "react";

/** Rayons (px, identiques à toutes les largeurs) et opacités des 7 anneaux, du cœur vers l'extérieur. */
const RINGS = [
  { r: 62, a: 0.16 },
  { r: 112, a: 0.11 },
  { r: 172, a: 0.08 },
  { r: 242, a: 0.06 },
  { r: 322, a: 0.04 },
  { r: 412, a: 0.03 },
  { r: 512, a: 0.02 },
] as const;

/** Côté du SVG : plus grand anneau + marge. */
const SIZE = 1060;
const C = SIZE / 2;

/* Anneaux concentriques du footer (décoratifs, statiques, sans lueur), centrés par le CSS (--ft-rx, --ft-ry). */
export function FooterRings() {
  return (
    <div aria-hidden="true" className="ft-rings">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE}>
        {RINGS.map((ring) => (
          <circle key={ring.r} cx={C} cy={C} r={ring.r} className="ft-ring" style={{ "--a": ring.a } as CSSProperties} />
        ))}
      </svg>
    </div>
  );
}
