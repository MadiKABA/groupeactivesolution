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
  - Bleu nuit `#07172E` → `brand-navy`
  - Doré `#E3A93F` → `brand-gold` ; dégradé du logo : `brand-gold-light` `#EDB94D` (aussi survol des boutons dorés), `brand-gold-deep` `#D89F37`
  - Blanc `#FFFFFF` → `brand-white`
- Autres tokens : `brand-navy-soft`, `brand-navy-glow`, `surface`, `surface-muted`, `surface-warm`, `text-primary`, `text-secondary`, `text-on-dark`, `border-subtle` (ex. `bg-surface-muted`, `text-text-secondary`, `border-border-subtle`).
- La palette par défaut de Tailwind est désactivée : **aucun code hex en dur ni valeur arbitraire `[#...]`**. Une nouvelle couleur s'ajoute dans `globals.css`, justifiée.
- Direction « hybride premium » : bleu nuit pour les zones fortes, doré en accent (actions, détails) sans envahir, blanc comme surface principale. Pas de dégradés ni d'effets décoratifs gratuits. **Exceptions validées : le header** (bande de verre, liseré doré et reflet en dégradé, reflet du CTA), **le hero** (dégradés radiaux, grain, titre en dégradé doré, motif et reflets ; classes `hero-*` de `globals.css`) **et la section Réalisations** (filet haut, lueurs radiales, grille dorée et projecteur, mot du titre en dégradé ; classes `realisations-*`). Les éléments en verre utilisent tous la classe `.glass` (variables `--glass-bg`, `--glass-border`, `--glass-blur`) et éventuellement `.glass-sweep`, à ne pas étendre au reste du site sans décision explicite.
- Contrastes : doré sur blanc ≈ 2:1 → **jamais pour du texte**. Sur un bouton doré, texte bleu nuit (≈ 8.5:1), pas blanc. Doré sur bleu nuit ≈ 8.5:1 : OK. Blanc à 35 % sur bleu nuit ≈ 3.2:1 : réservé aux grands titres (≥ 24px gras).
- Focus : variable `--focus-ring` (bleu nuit par défaut) ; la redéfinir en `var(--color-brand-gold)` sur fond sombre.
- Police : **Manrope** via `next/font/google` dans `src/app/layout.tsx` (400, 500, 600, 700, 800) → utilitaire `font-sans` (appliqué au `body`).
- Échelle : `text-2xs` (11px), `text-xs` (12px), `text-tag` (13px), `text-sm`, `text-nav` (15px, menu), `text-base`, `text-lg`, `text-h3`, `text-h2`, `text-h1`, `text-body-lg` (17px), `text-section`, `text-display-section` (+ `-sm`, titre phare sur une ligne en desktop), `text-display-wide` (titre sur une ligne dès 640px), `text-panel`, `text-numeral`, `text-hero` (fluides) ; `tracking-display|display-tight|label|badge|eyebrow|caps|category` ; `.text-outline-gold` (numéros décoratifs) ; `leading-tight|snug|normal`.
- Géométrie : `rounded-sm|md|lg|xl`, `rounded-2xl|hero`, `shadow-sm|md|lg|header|gold|hero|glow|frame|photo`, point de rupture `xs` (480px), `h-hero` (hero desktop : écran moins 96px de teaser, en `svh`), `max-w-site` (1684px, avec les marges `px-6 md:px-10 xl:px-28`), `py-section`.
- Animations : `ease-standard`, `ease-emphasized`, `duration-(--duration-fast|base|slow)`. `prefers-reduced-motion` est géré globalement ; avec Motion, utiliser aussi `useReducedMotion`.
- Header fixe (72px, 90px à partir de `xl`) : chaque page compense sa hauteur elle-même (le hero le fait avec `pt-18 xl:pt-22.5`) ; il n'y a plus d'espaceur global dans le layout. Les `section[id]` ont une `scroll-margin-top` égale à la hauteur du header pour les ancres.
- Alterner la position du visuel d'une section à l'autre (Hero : visuel à droite ; Expertises : visuel à gauche), et réutiliser les variables de couleurs et de verre existantes.
- Paliers de mise en page (CSS pur, `globals.css`) : `desk:` (≥ 1024px de large **et** ≥ 560px de haut, visuel sticky à gauche), `mob:` (mobile, tablette et desktop très bas : visuel sticky en haut), `short:` (hauteur < 520px : liste simple). La section Expertises lit son palier et ses dimensions dans le DOM (`--tier`, `--sticky-top`, `--visual-h` sur `.expertise-stage`) ; `useMediaQuery` ne pilote que de la logique JS. Jamais d’`overflow: hidden|auto|scroll` sur un parent d’un élément sticky (utiliser `overflow-x: clip`) ; l’élément sticky est un enfant direct de sa « scène », qui porte aussi l’espace bas de la section.
- Une `@custom-variant` avec plusieurs requêtes s’écrit en blocs `@media { @slot; }` distincts : Tailwind ne garde que la première d’une liste séparée par des virgules.
- Briques partagées : `SectionHeader` (libellé + titre + intro), `GlassChip`, `GoldLink`, `MotifPattern`, `ButtonShine` dans `src/components/ui/` ; courbes d'animation dans `src/lib/motion.ts`.
- Intensité des motifs : une seule variable par motif (`--motif-strength` pour Expertises, `--motif-grid-strength` pour la grille de Réalisations), appliquée une seule fois sur le conteneur, identique à toutes les largeurs.
- Icônes : `lucide-react`. Animations : `motion` (`motion/react`), à réserver aux composants client.

## Ressources

- La section Réalisations n'est publiée en production que si les 3 photos existent dans public/realisations/ ; une photo n'est utilisée que dans une seule section. (`SHOW_PLACEHOLDER_SECTIONS=true` force l'affichage des emplacements, pour les tests uniquement.)
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
