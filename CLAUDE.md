@AGENTS.md

# Active Solution Digital Service — site institutionnel

Refonte du site de https://www.groupactivesolution.com/ (Dakar, Sénégal). Langue du site : **français**.

## Commandes

```bash
pnpm dev        # serveur de développement
pnpm lint       # ESLint
pnpm typecheck  # next typegen + tsc --noEmit
pnpm build      # build de production
```

Après tout changement pertinent : `pnpm lint && pnpm typecheck && pnpm build`. Ne jamais annoncer qu'une commande réussit sans l'avoir exécutée.

## Architecture

- Next.js 16 (App Router, Turbopack, `cacheComponents` activé), React 19, TypeScript **strict**.
- Code dans `src/`, alias `@/*` → `src/*`.
- Server Components par défaut ; `"use client"` uniquement si état, effets, événements ou API navigateur.
- Next.js 16 diffère des versions antérieures : consulter `node_modules/next/dist/docs/` avant d'utiliser une API.
- Les helpers de types globaux (`LayoutProps`, `PageProps`) sont générés par `next dev` / `next build` / `next typegen`.
- Pas de backend, base de données, authentification ni CMS sans décision explicite.

## Design system

- Tous les tokens sont dans `src/app/globals.css` (`@theme` Tailwind CSS v4). Pas de `tailwind.config`.
- Couleurs officielles (ne jamais modifier) :
  - Bleu nuit `#0B1730` → `brand-navy`
  - Doré `#E8B04A` → `brand-gold` (survol des boutons dorés : `brand-gold-light` `#F0BE5E`)
  - Blanc `#FFFFFF` → `brand-white`
- Autres tokens : `brand-navy-soft`, `brand-gold-hover`, `surface`, `surface-muted`, `text-primary`, `text-secondary`, `text-on-dark`, `border-subtle` (ex. `bg-surface-muted`, `text-text-secondary`, `border-border-subtle`).
- La palette par défaut de Tailwind est désactivée : **aucun code hex en dur ni valeur arbitraire `[#...]`**. Une nouvelle couleur s'ajoute dans `globals.css`, justifiée.
- Direction « hybride premium » : bleu nuit pour les zones fortes, doré en accent (actions, détails) sans envahir, blanc comme surface principale. Pas de dégradés ni d'effets décoratifs gratuits. **Exception validée : le header** (bande de verre, liseré doré et reflet en dégradé, reflet du CTA), à ne pas étendre au reste du site sans décision explicite.
- Contrastes : doré sur blanc ≈ 2:1 → **jamais pour du texte**. Sur un bouton doré, texte bleu nuit (≈ 9.1:1), pas blanc. Doré sur bleu nuit ≈ 9:1 : OK.
- Focus : variable `--focus-ring` (bleu nuit par défaut) ; la redéfinir en `var(--color-brand-gold)` sur fond sombre.
- Police : **Plus Jakarta Sans** via `next/font/google` dans `src/app/layout.tsx` (400, 500, 600, 700, 800) → utilitaire `font-sans` (appliqué au `body`).
- Échelle : `text-sm`, `text-nav` (15px, menu), `text-base`, `text-lg`, `text-h3`, `text-h2`, `text-h1` (fluides) ; `leading-tight|snug|normal`.
- Géométrie : `rounded-sm|md|lg|xl`, `shadow-sm|md|lg|header|gold`, `max-w-site` (1684px, avec les marges `px-6 md:px-10 xl:px-28`), `py-section`.
- Animations : `ease-standard`, `ease-emphasized`, `duration-(--duration-fast|base|slow)`. `prefers-reduced-motion` est géré globalement ; avec Motion, utiliser aussi `useReducedMotion`.
- Icônes : `lucide-react`. Animations : `motion` (`motion/react`), à réserver aux composants client.

## Ressources

- Logos officiels dans `public/logos/` (à fournir). Ne jamais redessiner le logo en CSS ni le remplacer par du texte ou une icône générique. Ne pas fabriquer de favicon tant que les fichiers officiels ne sont pas disponibles.

## Qualité

- Accessibilité (WCAG AA : sémantique, contrastes, focus visible, textes alternatifs, navigation clavier).
- Responsive mobile-first ; performance (Server Components, `next/image`, peu de JS client).
- Code lisible ; composants petits et typés ; dépendances limitées au besoin réel.
- Créer `components/`, `sections/`, etc. seulement quand un besoin réel apparaît.

## Données de l'entreprise

- Ne jamais inventer de coordonnées (adresse, téléphone, e-mail, réseaux sociaux).
- Ne jamais inventer de partenaires, clients, témoignages, chiffres ou réalisations.
- En l'absence de contenu validé, laisser un emplacement clairement signalé et demander l'information.
- Ne jamais prétendre qu'une fonctionnalité fonctionne sans l'avoir vérifiée.
