import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { realisationsIntro } from "@/lib/realisations";

type RealisationsLinkProps = {
  /** a : rangée d'introduction ; b : barre compacte de la scène (réduit au rond sous 1024px). */
  slot: "a" | "b";
  className?: string;
  inert?: boolean;
};

/** « Voir toutes nos réalisations » : soulignement tracé et rond doré (40px) qui pivote au survol / focus. */
export function RealisationsLink({ slot, className = "", inert }: RealisationsLinkProps) {
  const { link } = realisationsIntro;
  return (
    <Link
      href={link.href}
      data-rz-link={slot}
      inert={inert}
      aria-label={slot === "b" ? link.label : undefined}
      className={`group inline-flex min-h-11 shrink-0 items-center gap-4 rounded-sm text-base font-semibold whitespace-nowrap text-text-on-dark ${className}`}
    >
      <span className={`relative pb-1 ${slot === "b" ? "max-lg:hidden" : ""}`}>
        {link.label}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 rounded-full bg-brand-gold transition-transform duration-(--duration-slow) ease-standard group-hover:scale-x-100 group-focus-visible:scale-x-100"
        />
      </span>
      <span
        aria-hidden="true"
        className="flex size-10 shrink-0 items-center justify-center rounded-full bg-brand-gold text-brand-navy transition-transform duration-(--duration-slow) ease-standard group-hover:-rotate-45 group-focus-visible:-rotate-45"
      >
        <ArrowRight className="size-4" />
      </span>
    </Link>
  );
}
