import { history } from "@/content/history";

import { HistoryAccordion } from "./HistoryAccordion";
import { HistoryHeading } from "./HistoryHeading";

/*
 * Section « Notre histoire » (page /a-propos, cible du bouton du hero). Server Component :
 * les trois chapitres sont dans le HTML initial, y compris ceux des panneaux fermés.
 * Styles : classes `hs-*` de globals.css. Sans JavaScript, la règle <noscript> annule les
 * états d'entrée de Motion : le chapitre 1 est ouvert et le survol fonctionne en CSS.
 */
export function HistorySection() {
  return (
    <section id="histoire" aria-labelledby="histoire-titre" className="hs">
      <noscript>
        <style>{".hs [data-reveal]{opacity:1!important;transform:none!important}"}</style>
      </noscript>
      <div aria-hidden="true" className="hs-waves" />
      <div className="site-container">
        <HistoryHeading intro={history.intro} />
        <HistoryAccordion chapters={history.chapters} />
      </div>
    </section>
  );
}
