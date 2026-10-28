import { WaveMotif } from "@/components/ui/WaveMotif";

/** Motif bleu nuit d'une carte de la section Contact (8.5 %), rogné par son rayon, sous le contenu. */
export function CardMotif() {
  return (
    <div aria-hidden="true" className="ct-card-motif">
      <WaveMotif tone="navy" mask="full" />
    </div>
  );
}
