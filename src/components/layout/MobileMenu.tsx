"use client";

import { Menu, X } from "lucide-react";
import { motion, type Variants } from "motion/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

import { CtaLink } from "./CtaLink";
import { isActivePath, navLinks } from "./navigation";

const panel: Variants = {
  closed: { x: "100%" },
  open: {
    x: 0,
    transition: { duration: 0.3, ease: "easeOut", staggerChildren: 0.06, delayChildren: 0.1 },
  },
};

const item: Variants = {
  closed: { opacity: 0, x: 16 },
  open: { opacity: 1, x: 0, transition: { duration: 0.3, ease: "easeOut" } },
};

const DESKTOP_QUERY = "(min-width: 80rem)";

/*
 * Tiroir de navigation mobile basé sur <dialog> en mode modal : piège du focus,
 * fermeture par Échap, arrière-plan inerte et retour du focus sont natifs.
 */
export function MobileMenu({ pathname }: { pathname: string }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  const openMenu = () => {
    dialogRef.current?.showModal();
    setOpen(true);
  };
  const closeMenu = () => dialogRef.current?.close();

  // Referme le tiroir si la fenêtre repasse en affichage desktop.
  useEffect(() => {
    const query = window.matchMedia(DESKTOP_QUERY);
    const onChange = (event: MediaQueryListEvent) => {
      if (event.matches) dialogRef.current?.close();
    };
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={openMenu}
        aria-label="Ouvrir le menu"
        aria-expanded={open}
        aria-controls="mobile-menu"
        className="inline-flex size-11 items-center justify-center rounded-md text-text-on-dark xl:hidden"
      >
        <Menu aria-hidden="true" className="size-6" />
      </button>

      <dialog
        ref={dialogRef}
        id="mobile-menu"
        aria-label="Menu principal"
        onClose={() => setOpen(false)}
        onClick={(event) => {
          // Un clic hors du panneau atteint directement le <dialog> (zone du backdrop).
          if (event.target === event.currentTarget) closeMenu();
        }}
        className="fixed inset-y-0 right-0 left-auto m-0 h-dvh max-h-none w-full max-w-sm overflow-hidden bg-transparent p-0 text-text-on-dark [--focus-ring:var(--color-brand-gold)] backdrop:bg-brand-navy/60"
      >
        <motion.div
          variants={panel}
          initial="closed"
          animate={open ? "open" : "closed"}
          className="flex h-full flex-col bg-brand-navy px-6 pt-4 pb-8"
        >
          <div className="flex justify-end">
            <button
              type="button"
              onClick={closeMenu}
              aria-label="Fermer le menu"
              className="inline-flex size-11 items-center justify-center rounded-md"
            >
              <X aria-hidden="true" className="size-6" />
            </button>
          </div>

          <nav aria-label="Navigation principale" className="mt-6">
            <ul className="flex flex-col gap-1">
              {navLinks.map((link) => {
                const active = isActivePath(pathname, link.href);
                return (
                  <motion.li key={link.href} variants={item}>
                    <Link
                      href={link.href}
                      onClick={closeMenu}
                      aria-current={active ? "page" : undefined}
                      className={`block rounded-md py-3 text-lg font-medium transition-colors duration-(--duration-base) ease-standard hover:text-brand-gold ${active ? "text-brand-gold" : "text-text-on-dark"}`}
                    >
                      {link.label}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          <motion.div variants={item} className="mt-auto">
            <CtaLink onClick={closeMenu} className="w-full" />
          </motion.div>
        </motion.div>
      </dialog>
    </>
  );
}
