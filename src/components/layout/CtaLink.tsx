"use client";

import { Send } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";

import { ctaLink } from "./navigation";

const MotionLink = motion.create(Link);

type CtaLinkProps = {
  className?: string;
  onClick?: () => void;
};

export function CtaLink({ className = "", onClick }: CtaLinkProps) {
  return (
    <MotionLink
      href={ctaLink.href}
      onClick={onClick}
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.97 }}
      className={`group relative inline-flex h-11.25 overflow-hidden items-center justify-center gap-2.5 rounded-full bg-brand-gold px-6.5 text-sm font-semibold whitespace-nowrap text-brand-navy transition-[background-color,box-shadow] duration-(--duration-base) ease-standard hover:bg-brand-gold-light hover:shadow-gold ${className}`}
    >
      <Send
        aria-hidden="true"
        className="size-3.5 transition-transform duration-(--duration-base) ease-standard group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
      />
      {ctaLink.label}
      {/* Reflet qui traverse le bouton au survol ; revient sans transition à la sortie. */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-20 bg-linear-to-r from-transparent via-text-on-dark/40 to-transparent motion-safe:group-hover:translate-x-[450%] motion-safe:group-hover:transition-transform motion-safe:group-hover:duration-700 motion-safe:group-hover:ease-out"
      />
    </MotionLink>
  );
}
