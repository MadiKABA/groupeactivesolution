"use client";

import { ChevronDown } from "lucide-react";
import {
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type CSSProperties,
  type KeyboardEvent,
  type ReactNode,
} from "react";

/*
 * Sélection du niveau de « Nos programmes par niveau » : onglets verticaux dès 768px, accordéon
 * en dessous (ARIA adapté au mode). Synchronise l'adresse (#primaire, #college, #lycee) sans
 * recharger ni faire défiler, et pose `data-inview` une seule fois pour l'entrée en CSS.
 * Panneaux toujours dans le DOM ; les inactifs portent `hidden` (affichage géré par globals.css).
 */

type Item = { id: string; number: string; label: string; verb: string };

const DESK_QUERY = "(min-width: 48rem)";

function subscribe(onChange: () => void) {
  const mql = window.matchMedia(DESK_QUERY);
  mql.addEventListener("change", onChange);
  return () => mql.removeEventListener("change", onChange);
}

export function NiveauxTabs({ header, items, panels }: { header: ReactNode; items: readonly Item[]; panels: readonly ReactNode[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [active, setActive] = useState(0);
  // Panneau affiché : suit `active` après la sortie en fondu (150 ms) de l'ancien contenu
  const [shown, setShown] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const timerRef = useRef<number | undefined>(undefined);
  const [switched, setSwitched] = useState(false);
  const [inView, setInView] = useState(false);
  const isDesk = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(DESK_QUERY).matches,
    () => true,
  );

  // Niveau demandé par l'adresse, au chargement et à chaque changement d'ancre (cadres du hero)
  useEffect(() => {
    const fromHash = () => {
      const index = items.findIndex((item) => `#${item.id}` === window.location.hash);
      if (index < 0) return;
      window.clearTimeout(timerRef.current);
      setActive(index);
      setShown(index);
      setLeaving(false);
    };
    fromHash();
    rootRef.current?.setAttribute("data-js", "");
    window.addEventListener("hashchange", fromHash);
    return () => {
      window.removeEventListener("hashchange", fromHash);
      window.clearTimeout(timerRef.current);
    };
  }, [items]);

  // Entrée de la section, une seule fois
  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const select = (index: number) => {
    if (index === active) return;
    setActive(index);
    setSwitched(true);
    window.history.replaceState(null, "", `#${items[index]?.id}`);
    window.clearTimeout(timerRef.current);
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setShown(index);
      return;
    }
    setLeaving(true);
    timerRef.current = window.setTimeout(() => {
      setShown(index);
      setLeaving(false);
    }, 150);
  };

  const onTabKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = items.length - 1;
    const next =
      event.key === "ArrowDown" ? (index === last ? 0 : index + 1)
      : event.key === "ArrowUp" ? (index === 0 ? last : index - 1)
      : event.key === "Home" ? 0
      : event.key === "End" ? last
      : null;
    if (next === null) return;
    event.preventDefault();
    select(next);
    tabRefs.current[next]?.focus();
  };

  return (
    <div
      ref={rootRef}
      className="nv-root site-container"
      data-inview={inView ? "" : undefined}
      data-switched={switched ? "" : undefined}
    >
      {header}

      <div className="nv-layout">
        <div className="nv-menu">
          <svg className="nv-wire" viewBox="-26 0 68 420" aria-hidden="true" focusable="false">
            <polyline pathLength={1} points="-20,86 -20,176 8,176 8,326 36,326 36,406" />
            <circle cx="-20" cy="86" r="5" />
            <circle cx="8" cy="246" r="5" />
            <circle cx="36" cy="406" r="5" />
          </svg>

          <div role="tablist" aria-orientation="vertical" aria-label="Niveaux" className="nv-tablist">
            {items.map((item, index) => {
              const selected = index === active;
              return (
                <button
                  key={item.id}
                  ref={(node) => {
                    tabRefs.current[index] = node;
                  }}
                  type="button"
                  role="tab"
                  id={`nv-tab-${item.id}`}
                  aria-selected={selected}
                  aria-controls={`nv-panel-${item.id}`}
                  tabIndex={selected ? 0 : -1}
                  className="nv-step"
                  style={{ "--i": index } as CSSProperties}
                  onClick={() => select(index)}
                  onKeyDown={(event) => onTabKey(event, index)}
                >
                  <span className="nv-step-label">
                    {item.number} · {item.label}
                  </span>
                  <span className="nv-step-verb">{item.verb}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="nv-stage">
          {items.map((item, index) => {
            const selected = index === active;
            const visible = index === shown;
            return (
              <div key={item.id} className="nv-item">
                <div className="nv-acc-heading">
                  <button
                    type="button"
                    id={`nv-acc-${item.id}`}
                    aria-expanded={selected}
                    aria-controls={`nv-panel-${item.id}`}
                    className="nv-acc"
                    onClick={() => select(index)}
                  >
                    <span className="nv-step-label">
                      {item.number} · {item.label}
                    </span>
                    <span className="nv-acc-verb">{item.verb}</span>
                    <ChevronDown aria-hidden="true" className="nv-acc-chevron" />
                  </button>
                </div>
                <div
                  id={`nv-panel-${item.id}`}
                  role={isDesk ? "tabpanel" : "region"}
                  aria-labelledby={isDesk ? `nv-tab-${item.id}` : `nv-acc-${item.id}`}
                  hidden={!visible}
                  data-leaving={visible && leaving ? "" : undefined}
                  className="nv-panel"
                >
                  {panels[index]}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
