import {
  Bot, Cloud, Code, Cpu, Globe, Layers, LayoutDashboard, Lightbulb, LineChart, MessagesSquare,
  Plug, ReceiptText, RefreshCw, ShieldCheck, Smartphone, Sparkles, Users, Wifi, Workflow, Zap, type LucideIcon,
} from "lucide-react";
import type { CSSProperties } from "react";

import type { DomainIcon, ExpertiseFiche } from "@/lib/expertises";

// Correspondance nom → icône, côté serveur uniquement (aucune icône dans le bundle client).
const ICONS: Record<DomainIcon, LucideIcon> = {
  Bot, Cloud, Code, Cpu, Globe, Layers, LayoutDashboard, Lightbulb, LineChart, MessagesSquare,
  Plug, ReceiptText, RefreshCw, ShieldCheck, Smartphone, Sparkles, Users, Wifi, Workflow, Zap,
};

/**
 * Domaines d'une fiche : cartes non cliquables dès 768px (3 par ligne en desktop ; avec 5 cartes,
 * 3 puis 2 plus larges), pastilles de texte en mobile pour garder la fiche courte.
 */
export function DomainGrid({ label, domains }: { label: string; domains: ExpertiseFiche["domains"] }) {
  return (
    <ul aria-label={label} className="xp-domains" data-count={domains.length}>
      {domains.map(({ label: domain, icon }, index) => {
        const Icon = ICONS[icon];
        return (
          <li key={domain} className="xp-domain" style={{ "--i": index } as CSSProperties}>
            <span aria-hidden="true" className="xp-domain-icon">
              <Icon />
            </span>
            {domain}
          </li>
        );
      })}
    </ul>
  );
}
