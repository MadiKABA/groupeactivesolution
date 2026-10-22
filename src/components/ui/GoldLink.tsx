import { ArrowRight } from "lucide-react";
import Link from "next/link";

type GoldLinkProps = {
  href: string;
  children: React.ReactNode;
  className?: string;
};

/**
 * Lien explicite sur fond clair : texte bleu nuit, pastille dorée avec flèche,
 * soulignement doré qui s'étend au survol. Le doré n'est jamais porteur du texte.
 */
export function GoldLink({ href, children, className = "" }: GoldLinkProps) {
  return (
    <Link
      href={href}
      // min-h-11 : zone de toucher de 44px.
      className={`group inline-flex min-h-11 items-center gap-3 rounded-sm text-nav font-semibold text-text-primary ${className}`}
    >
      <span className="relative pb-1">
        {children}
        <span
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-35 rounded-full bg-brand-gold transition-transform duration-(--duration-slow) ease-standard group-hover:scale-x-100 group-focus-visible:scale-x-100"
        />
      </span>
      <span
        aria-hidden="true"
        className="flex size-7 shrink-0 items-center justify-center rounded-full bg-brand-gold text-brand-navy"
      >
        <ArrowRight className="size-3.5 transition-transform duration-(--duration-base) ease-standard group-hover:translate-x-1" />
      </span>
    </Link>
  );
}
