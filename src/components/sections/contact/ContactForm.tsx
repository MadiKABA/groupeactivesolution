"use client";

import { useEffect, useId, useRef, useState, type FormEvent, type KeyboardEvent } from "react";

import { reveal } from "@/components/sections/formations/reveal";
import { WhatsAppIcon } from "@/components/ui/icons/WhatsAppIcon";
import { buildContactMessage, contactForm } from "@/lib/contact";
import { CONTACT_NEEDS, getMailtoUrl, getWhatsAppUrl } from "@/lib/site";

type Field = "need" | "name" | "message";
type Errors = Partial<Record<Field, string>>;
type Channel = "whatsapp" | "email";

/** Cascade des champs : 50 ms d'intervalle après la carte (ms). */
const FIELDS_AT = 300;
const FIELD_STAGGER = 50;
/** Confirmation « Message préparé » : visible 6 s. */
const CONFIRM_FOR = 6000;
const ORDER: readonly Field[] = ["need", "name", "message"];

function validate(need: number | null, name: string, message: string): Errors {
  const errors: Errors = {};
  if (need === null) errors.need = contactForm.errors.need;
  if (name.trim().length < 2) errors.name = contactForm.errors.name;
  if (message.trim().length < 10) errors.message = contactForm.errors.message;
  return errors;
}

const field = (index: number) => reveal(FIELDS_AT + index * FIELD_STAGGER, 450, "translateY(12px)");

/**
 * Formulaire sans backend ni stockage : il prépare le message et l'ouvre dans WhatsApp ou la
 * messagerie. Validation au clic (pas à la frappe), erreurs effacées dès que le champ redevient valide.
 */
export function ContactForm() {
  const id = useId();
  const ids = { need: `${id}-need`, name: `${id}-name`, message: `${id}-message`, summary: `${id}-summary` };
  const [need, setNeed] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState<Errors>({});
  const [shake, setShake] = useState(0);
  const [confirm, setConfirm] = useState<Channel | null>(null);
  const [confirmShown, setConfirmShown] = useState(false);
  const radios = useRef<(HTMLButtonElement | null)[]>([]);
  const nameRef = useRef<HTMLInputElement>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  const timer = useRef(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  // Soumission refusée : brève secousse (±4px, 3 oscillations, 320 ms) des champs invalides, une fois.
  const groupRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (shake === 0 || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const targets = { need: groupRef.current, name: nameRef.current, message: messageRef.current };
    for (const key of ORDER) {
      if (!errors[key]) continue;
      targets[key]?.animate([0, -4, 4, -4, 4, -4, 0].map((x) => ({ transform: `translateX(${x}px)` })), { duration: 320, easing: "ease-in-out" });
    }
    // Uniquement à chaque soumission refusée (shake), pas à chaque changement d'erreur.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shake]);

  // Une erreur affichée disparaît dès que son champ devient valide (aucune nouvelle erreur à la frappe).
  const refresh = (nextNeed: number | null, nextName: string, nextMessage: string) => {
    setErrors((current) => {
      if (Object.keys(current).length === 0) return current;
      const now = validate(nextNeed, nextName, nextMessage);
      const kept: Errors = {};
      for (const key of ORDER) if (current[key] && now[key]) kept[key] = now[key];
      return kept;
    });
  };

  const choose = (index: number, focus = false) => {
    setNeed(index);
    refresh(index, name, message);
    if (focus) radios.current[index]?.focus();
  };

  // Groupe radio : flèches (avec bouclage), roving tabindex.
  const onRadioKey = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const total = CONTACT_NEEDS.length;
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[event.key];
    if (step === undefined) return;
    event.preventDefault();
    choose((index + step + total) % total, true);
  };

  const send = (channel: Channel) => {
    const found = validate(need, name, message);
    setErrors(found);
    const first = ORDER.find((key) => found[key]);
    if (first) {
      setShake((count) => count + 1);
      if (first === "need") radios.current[need ?? 0]?.focus();
      else if (first === "name") nameRef.current?.focus();
      else messageRef.current?.focus();
      return;
    }
    const label = CONTACT_NEEDS[need ?? 0];
    const text = buildContactMessage(label, name.trim(), message.trim());
    if (channel === "whatsapp") window.open(getWhatsAppUrl(text), "_blank", "noopener,noreferrer");
    else window.open(getMailtoUrl(`${label} — ${contactForm.emailSubjectSuffix}`, text), "_self");
    setConfirm(channel);
    setConfirmShown(true);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setConfirmShown(false), CONFIRM_FOR);
  };

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    send("whatsapp");
  };

  const count = Object.keys(errors).length;
  const invalid = (key: Field) => (errors[key] ? { "aria-invalid": true as const, "aria-describedby": `${ids[key]}-error` } : {});
  const error = (key: Field) =>
    errors[key] ? (
      <p id={`${ids[key]}-error`} className="ct-error mt-2 text-sm font-semibold text-error-on-light">
        {errors[key]}
      </p>
    ) : null;

  return (
    <form noValidate onSubmit={onSubmit} className="flex flex-1 flex-col gap-5.5">
      <div className="ct-a" {...field(0)}>
        <h3 className="text-h3-lg font-extrabold text-brand-navy">{contactForm.title}</h3>
        <p className="mt-1.5 text-nav leading-relaxed text-text-slate">{contactForm.text}</p>
      </div>

      <fieldset className="ct-a ct-chips" {...field(1)}>
        <legend id={ids.need} className="text-label-xs font-bold tracking-category text-text-slate uppercase">
          {contactForm.needLegend}
        </legend>
        <div ref={groupRef} className="ct-chip-list mt-3">
          <div role="radiogroup" aria-labelledby={ids.need} {...invalid("need")} className="contents">
            {CONTACT_NEEDS.map((label, index) => {
              const checked = need === index;
              return (
                <button
                  key={label}
                  ref={(element) => {
                    radios.current[index] = element;
                  }}
                  type="button"
                  role="radio"
                  aria-checked={checked}
                  tabIndex={checked || (need === null && index === 0) ? 0 : -1}
                  onClick={() => choose(index)}
                  onKeyDown={(event) => onRadioKey(event, index)}
                  className="ct-chip cursor-pointer rounded-full border font-semibold"
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
        {error("need")}
      </fieldset>

      <div className="ct-a" {...field(2)}>
        <label htmlFor={ids.name} className="text-label-xs font-bold tracking-category text-text-slate uppercase">
          {contactForm.nameLabel}
        </label>
        <input
          ref={nameRef}
          id={ids.name}
          type="text"
          autoComplete="name"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            refresh(need, event.target.value, message);
          }}
          {...invalid("name")}
          className="ct-field mt-2 h-13 w-full rounded-2xl border px-4 text-base"
        />
        {error("name")}
      </div>

      <div className="ct-a flex flex-1 flex-col" {...field(3)}>
        <label htmlFor={ids.message} className="text-label-xs font-bold tracking-category text-text-slate uppercase">
          {contactForm.messageLabel}
        </label>
        <textarea
          ref={messageRef}
          id={ids.message}
          rows={4}
          value={message}
          onChange={(event) => {
            setMessage(event.target.value);
            refresh(need, name, event.target.value);
          }}
          {...invalid("message")}
          className="ct-field mt-2 block min-h-30 w-full flex-1 resize-y rounded-2xl border px-4 py-3 text-base leading-relaxed"
        />
        {error("message")}
      </div>

      <div className="ct-a flex flex-col gap-3" {...field(4)}>
        <p id={ids.summary} role="alert" aria-live="assertive" className="text-sm font-semibold text-error-on-light empty:hidden">
          {count > 0 ? contactForm.errors.summary(count) : ""}
        </p>
        <button type="submit" className="ct-primary relative flex h-14.5 w-full cursor-pointer items-center justify-center gap-2.5 overflow-hidden rounded-2xl text-base font-extrabold text-brand-navy">
          <WhatsAppIcon className="relative size-5.5" />
          <span className="relative">{contactForm.whatsapp}</span>
        </button>
        <button type="button" onClick={() => send("email")} className="ct-secondary h-13.5 w-full cursor-pointer rounded-2xl border text-base font-semibold">
          {contactForm.email}
        </button>
        {/* Confirmation : hauteur réservée (aucun décalage), annoncée poliment */}
        <p role="status" aria-live="polite" data-show={confirmShown ? "" : undefined} className="ct-confirm min-h-5 text-sm font-semibold text-gold-ink-strong">
          {confirm ? contactForm.confirm[confirm] : ""}
        </p>
        <p className="text-tag leading-relaxed text-text-slate">{contactForm.notice}</p>
      </div>
    </form>
  );
}
