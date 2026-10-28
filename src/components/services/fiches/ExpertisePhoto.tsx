import Image from "next/image";

import type { ExpertiseFiche } from "@/lib/expertises";

import { WaveMotif } from "@/components/ui/WaveMotif";

/*
 * Photo d'une fiche dans un cadre à ratio fixe (9/10 desktop, 16/9 tablette, 10/7 mobile).
 * Fond de repli : dégradé bleu nuit et zigzag doré, seul affiché (et décoratif) sans photo.
 */
export function ExpertisePhoto({ src, photo }: { src?: string; photo: ExpertiseFiche["photo"] }) {
  return (
    <div className="xp-photo" aria-hidden={src ? undefined : true}>
      <div className="xp-photo-media">
        <div className="xp-photo-fallback">
          <WaveMotif tone="dark" mask="br" />
        </div>
        {src && (
          <Image
            src={src}
            alt={photo.alt}
            fill
            sizes="(min-width: 1024px) 40vw, (min-width: 768px) 90vw, 100vw"
            loading="lazy"
            className="xp-photo-img"
            style={{ objectPosition: photo.objectPosition }}
          />
        )}
      </div>
    </div>
  );
}
