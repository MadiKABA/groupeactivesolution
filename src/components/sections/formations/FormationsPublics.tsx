import { formationPublics, formationsIntro } from "@/lib/formations";

import { reveal } from "./reveal";

/** Bande « Pour qui ? » : libellé puis trois cartes, une par une (cible b de l'observateur). */
export function FormationsPublics() {
  return (
    <div data-fo-target="b" className="mt-14 lg:mt-20">
      <p className="fo-b text-tag font-semibold tracking-eyebrow-wide text-text-on-dark/60 uppercase" {...reveal(0, 500)}>
        {formationsIntro.publicsLabel}
      </p>
      <ul className="mt-5 grid gap-3 md:grid-cols-3 md:gap-5">
        {formationPublics.map((item, index) => {
          const Icon = item.icon;
          return (
            <li
              key={item.id}
              className="fo-b rounded-[20px] border border-text-on-dark/12 bg-(--glass-bg) p-4.5 transition-[translate,border-color] duration-220 ease-out md:p-6 pointer-fine:hover:-translate-y-1 pointer-fine:hover:border-brand-gold/45"
              {...reveal(120 * (index + 1), 500, "translateY(24px)")}
            >
              <span className="flex size-11 items-center justify-center rounded-xl bg-brand-gold/14 text-brand-gold md:size-12">
                <Icon aria-hidden="true" strokeWidth={1.8} className="size-5.5" />
              </span>
              <h3 className="mt-4 text-lg leading-snug font-bold text-text-on-dark">{item.title}</h3>
              <p className="mt-1.5 text-card leading-relaxed text-text-on-dark/72">{item.text}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
