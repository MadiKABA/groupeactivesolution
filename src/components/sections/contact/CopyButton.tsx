"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { contactCopy } from "@/lib/contact";

/** Durée de l'état « Copié ✓ » (ms). */
const FEEDBACK = 1500;

/** Copie via un textarea hors écran (navigateurs sans Clipboard API ou permission refusée). */
function legacyCopy(value: string): boolean {
  const area = document.createElement("textarea");
  area.value = value;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "-9999px";
  document.body.append(area);
  area.select();
  try {
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    area.remove();
  }
}

/**
 * Bouton « Copier » (44 × 44) : Clipboard API, repli execCommand, sinon « Copie impossible ».
 * Succès : coche dorée en fondu croisé, infobulle « Copié ✓ » (position absolue : aucun décalage)
 * et annonce « Copié dans le presse-papiers » pour les lecteurs d'écran.
 */
export function CopyButton({ value, label }: { value: string; label: string }) {
  const [status, setStatus] = useState<"idle" | "copied" | "failed">("idle");
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = async () => {
    let done = false;
    try {
      await navigator.clipboard.writeText(value);
      done = true;
    } catch {
      done = legacyCopy(value);
    }
    setStatus(done ? "copied" : "failed");
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setStatus("idle"), FEEDBACK);
  };

  const message = status === "copied" ? contactCopy.copied : status === "failed" ? contactCopy.failed : "";
  return (
    <span className="relative inline-flex shrink-0">
      <button type="button" aria-label={label} onClick={copy} data-status={status} className="ct-copy relative flex size-11 cursor-pointer items-center justify-center rounded-lg border">
        <Copy aria-hidden="true" className="ct-copy-idle absolute size-4.5" />
        <Check aria-hidden="true" className="ct-copy-done absolute size-4.5" />
      </button>
      <span aria-hidden="true" data-show={message ? "" : undefined} className="ct-tooltip pointer-events-none absolute bottom-full left-1/2 mb-2 rounded-md px-2.5 py-1 text-xs font-bold whitespace-nowrap">
        {message}
      </span>
      <span role="status" aria-live="polite" className="sr-only">
        {status === "copied" ? contactCopy.announced : status === "failed" ? contactCopy.failed : ""}
      </span>
    </span>
  );
}
