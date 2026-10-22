import Image from "next/image";
import Link from "next/link";

// Logos officiels : complet (viewBox 1000 × 550) et monogramme compact (1000 × 420).
// La hauteur est fixée par les classes, la largeur suit le ratio.
const logo = { src: "/logos/logo.svg", width: 1000, height: 550 };
const logoMark = { src: "/logos/logo-mark.svg", width: 1000, height: 420 };

const alt = "Active Solution Digital Service";

type LogoProps = {
  /** Classes du logo complet (taille, visibilité). */
  fullClassName?: string;
  /** Classes du monogramme compact (taille, visibilité). */
  markClassName?: string;
};

/*
 * Les deux versions sont rendues et basculées en CSS : aucune dépendance au
 * JavaScript pour choisir la bonne au premier affichage. `loading="eager"` plutôt
 * que `preload`, car l'image visible dépend de la largeur d'écran.
 */
export function Logo({ fullClassName = "", markClassName = "" }: LogoProps) {
  return (
    <Link href="/" className="inline-flex h-full items-center rounded-sm">
      <Image
        src={logo.src}
        alt={alt}
        width={logo.width}
        height={logo.height}
        loading="eager"
        className={`w-auto object-contain ${fullClassName}`}
      />
      <Image
        src={logoMark.src}
        alt={alt}
        width={logoMark.width}
        height={logoMark.height}
        loading="eager"
        className={`w-auto object-contain ${markClassName}`}
      />
    </Link>
  );
}
