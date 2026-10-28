import { WaveMotif } from "@/components/ui/WaveMotif";

/*
 * Fond d'une fiche de /services : zigzag doré WaveMotif fondu dans le coin bas droit ; halo sur
 * la fiche sombre. Opacités : --motif-zigzag et --motif-halo (globals.css, classes `xp-*`).
 */
export function SectionBackdrop({ dark }: { dark: boolean }) {
  return (
    <div aria-hidden="true" className="xp-backdrop">
      {dark && <div className="xp-halo" />}
      <div className="xp-wave-layer">
        <WaveMotif tone={dark ? "dark" : "light"} mask="br" />
      </div>
    </div>
  );
}
