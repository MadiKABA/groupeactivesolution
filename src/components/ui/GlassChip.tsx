"use client";

import type { LucideIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";

import { EASE } from "@/lib/motion";

type GlassChipProps = {
  icon: LucideIcon;
  label: string;
  /** Position « 01 », total « 03 » : seul le numéro défile verticalement. */
  current: string;
  total: string;
  /** Version réduite (cadres bas, mobile). */
  compact?: boolean;
  className?: string;
};

const swap = {
  initial: { opacity: 0, y: 6 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -6 },
  transition: { duration: 0.3, ease: "easeOut" },
} as const;

/** Pastille en verre (classe `.glass`) : icône dans un cercle doré, libellé et compteur. */
export function GlassChip({ icon: Icon, label, current, total, compact = false, className = "" }: GlassChipProps) {
  const text = compact ? "text-xs" : "text-sm";
  return (
    <div
      className={`glass flex items-center rounded-full ${compact ? "gap-2 py-1.5 pr-3.5 pl-1.5" : "gap-3 py-2.5 pr-5 pl-2.5"} ${className}`}
    >
      <span
        className={`flex shrink-0 items-center justify-center rounded-full bg-brand-gold text-brand-navy ${compact ? "size-7" : "size-8"}`}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={label} {...swap} className="flex">
            <Icon aria-hidden="true" className={compact ? "size-3.5" : "size-4"} />
          </motion.span>
        </AnimatePresence>
      </span>
      <span className={`relative overflow-hidden font-semibold whitespace-nowrap text-text-on-dark ${text}`}>
        <AnimatePresence mode="wait" initial={false}>
          <motion.span key={label} {...swap} className="block">
            {label}
          </motion.span>
        </AnimatePresence>
      </span>
      <span className={`flex text-text-on-dark/60 tabular-nums ${text}`}>
        <span className="relative inline-flex h-5 overflow-hidden">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.span
              key={current}
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ duration: 0.35, ease: EASE.reveal }}
              className="block leading-5"
            >
              {current}
            </motion.span>
          </AnimatePresence>
        </span>
        <span className="leading-5">&nbsp;/ {total}</span>
      </span>
    </div>
  );
}
