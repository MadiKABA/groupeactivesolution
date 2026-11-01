"use client";

import { ChevronDown } from "lucide-react";
import Link from "next/link";
import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";

import type { NavChild } from "./navigation";

type NavDropdownProps = {
  label: string;
  items: readonly NavChild[];
  pathname: string;
  /** Classes du bouton (mêmes états que les autres entrées du menu). */
  className: string;
  /** Soulignement animé du menu, rendu dans le bouton quand l'entrée est mise en avant. */
  underline: ReactNode;
  onHighlight: () => void;
};

/*
 * Entrée de menu à sous-menu (desktop) : bouton « disclosure » (aria-expanded, aria-controls) qui ne
 * navigue pas. Ouverture au survol et au clic ; fermeture à la sortie de la zone, au clic extérieur,
 * à Échap (focus rendu au bouton) et quand le focus quitte la zone (Tab). Flèches haut/bas : entrées.
 * Fermé par défaut (`hidden`, même sans CSS) ; apparition : `.nav-sub` de globals.css (opacity + translateY, 200ms).
 */
export function NavDropdown({ label, items, pathname, className, underline, onHighlight }: NavDropdownProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  // Ouvert par le survol : le clic qui suit le garde ouvert au lieu de le refermer.
  const openedByHover = useRef(false);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const links = () =>
    Array.from(rootRef.current?.querySelectorAll<HTMLAnchorElement>("[data-nav-item]") ?? []);

  const focusLink = (index: number) => {
    const list = links();
    list[(index + list.length) % list.length]?.focus();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "ArrowDown" && event.key !== "ArrowUp") return;
    event.preventDefault();
    const step = event.key === "ArrowDown" ? 1 : -1;
    const current = links().indexOf(document.activeElement as HTMLAnchorElement);
    if (current === -1) {
      // Depuis le bouton : première (ou dernière) entrée ; si le panneau est fermé, après son affichage.
      const target = step === 1 ? 0 : -1;
      if (open) focusLink(target);
      else {
        setOpen(true);
        requestAnimationFrame(() => focusLink(target));
      }
      return;
    }
    focusLink(current + step);
  };

  return (
    <div
      ref={rootRef}
      className="relative"
      onMouseEnter={() => {
        openedByHover.current = true;
        setOpen(true);
        onHighlight();
      }}
      onMouseLeave={() => {
        openedByHover.current = false;
        setOpen(false);
      }}
      onKeyDown={onKeyDown}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
      }}
    >
      <button
        ref={buttonRef}
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onFocus={onHighlight}
        onClick={() => {
          if (openedByHover.current && open) {
            openedByHover.current = false;
            return;
          }
          setOpen((value) => !value);
        }}
        className={className}
      >
        {label}
        <ChevronDown aria-hidden="true" className="nav-sub-chevron size-4" />
        {underline}
      </button>

      <div id={panelId} hidden={!open} className="nav-sub">
        <ul className="nav-sub-list">
          {items.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                data-nav-item=""
                aria-current={pathname === item.href ? "page" : undefined}
                onClick={() => setOpen(false)}
                className="nav-sub-link"
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
