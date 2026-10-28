"use client";

import { Send } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { ButtonShine } from "@/components/ui/ButtonShine";

import { ctaLink, isActivePath } from "./navigation";

type CtaLinkProps = {
  className?: string;
  onClick?: () => void;
};

export function CtaLink({ className = "", onClick }: CtaLinkProps) {
  const pathname = usePathname();
  return (
    // Apparence (fond, survol, pression) : `.btn-gold` de globals.css, partagée avec le hero À propos.
    // Sur /contact : aria-current, sans changement d'apparence.
    <Link
      href={ctaLink.href}
      onClick={onClick}
      aria-current={isActivePath(pathname, ctaLink.href) ? "page" : undefined}
      className={`btn-gold group inline-flex h-11.25 items-center justify-center gap-2.5 rounded-full px-6.5 text-sm font-semibold whitespace-nowrap ${className}`}
    >
      <Send
        aria-hidden="true"
        className="size-3.5 transition-transform duration-(--duration-base) ease-standard group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
      {ctaLink.label}
      <ButtonShine />
    </Link>
  );
}
