# Active Solution Digital Service — site web

Socle technique de la refonte du site institutionnel d'**Active Solution Digital Service** (Dakar, Sénégal), acteur de la formation et de l'éducation numérique, du développement de solutions digitales et de la transformation numérique des organisations.

Cette première phase pose uniquement les fondations : configuration du projet, charte graphique (design tokens) et typographie. Aucune page de contenu n'est encore développée.

## Technologies

| Outil | Version |
|---|---|
| Next.js (App Router, Turbopack) | 16.4.2 |
| React / React DOM | 19.3.0 |
| TypeScript (mode strict) | 5.9 |
| Tailwind CSS | 4.3 |
| ESLint (`eslint-config-next`) | 9.39 |
| Lucide React (icônes) | 1.61 |
| Motion (animations) | 14.6 |
| Manrope via `next/font/google` | — |

## Prérequis

- Node.js **≥ 20.9** (développé avec Node 24)
- pnpm **10** (`corepack enable` active la version déclarée dans `package.json`)

## Installation et démarrage

```bash
pnpm install
pnpm dev
```

L'application est alors disponible sur http://localhost:3000.

## Scripts

| Script | Rôle |
|---|---|
| `pnpm dev` | Serveur de développement |
| `pnpm build` | Build de production |
| `pnpm start` | Démarre le build de production |
| `pnpm lint` | Analyse ESLint |
| `pnpm typecheck` | Génère les types de routes (`next typegen`) puis lance `tsc --noEmit` |

Vérification complète : `pnpm lint && pnpm typecheck && pnpm build`.

## Structure

```text
.
├── public/
│   └── logos/            # logos officiels (à ajouter)
├── src/
│   └── app/
│       ├── globals.css   # design tokens + styles globaux
│       ├── layout.tsx    # layout racine : police, métadonnées, lang="fr"
│       └── page.tsx      # page minimale temporaire
├── AGENTS.md             # règles Next.js pour agents (géré par Next.js)
├── CLAUDE.md             # conventions du projet pour Claude Code
├── eslint.config.mjs
├── next.config.ts
├── package.json
├── pnpm-lock.yaml
├── pnpm-workspace.yaml
└── tsconfig.json
```

## Charte graphique et design tokens

Tous les tokens sont centralisés dans **`src/app/globals.css`**, via la directive `@theme` de Tailwind CSS v4 (pas de `tailwind.config`). Chaque token produit une variable CSS (`var(--color-brand-navy)`) et les utilitaires Tailwind correspondants (`bg-brand-navy`, `text-brand-gold`…).

### Couleurs de référence

| Token | Valeur | Usage |
|---|---|---|
| `brand-navy` | `#272332` | Couleur principale sombre |
| `brand-gold` | `#C39631` | Accent |
| `brand-white` | `#FFFFFF` | Blanc de référence |

### Couleurs secondaires

| Token | Valeur | Usage |
|---|---|---|
| `brand-navy-soft` | bleu nuit + 12 % de blanc (≈ `#413D4B`) | Fonds sombres secondaires |
| `brand-gold-hover` | doré + 15 % de noir (≈ `#A6802A`) | Survol des actions dorées |
| `surface` | `#FFFFFF` | Surface principale |
| `surface-muted` | `#F6F6F7` | Fonds secondaires |
| `text-primary` | `#272332` | Texte principal |
| `text-secondary` | `#52525B` | Texte secondaire (≈ 7.7:1 sur blanc) |
| `text-on-dark` | `#FFFFFF` | Texte sur fond sombre |
| `border-subtle` | `#E4E4E7` | Bordures discrètes |

Les variantes sont calculées avec `color-mix()` à partir des couleurs de référence (Tailwind génère un repli hexadécimal pour les anciens navigateurs).

La palette par défaut de Tailwind est volontairement désactivée : seules les couleurs de la charte existent. Le doré sur blanc (≈ 2.7:1) ne doit pas servir pour du texte courant ; sur un bouton doré, le texte est bleu nuit.

### Autres tokens

- **Typographie** : `text-sm` (0.875rem), `text-base` (1rem), `text-lg` (1.125rem), `text-h3`, `text-h2`, `text-h1` (tailles fluides `clamp()`), chacune avec sa hauteur de ligne ; graisses `font-normal` à `font-extrabold` (400–800) ; `leading-tight|snug|normal`.
- **Géométrie** : `rounded-sm|md|lg|xl`, `shadow-sm|md|lg` (ombres discrètes teintées de bleu nuit), `max-w-site` (76rem), `py-section` (espacement vertical fluide).
- **Interactions** : `ease-standard`, `ease-emphasized`, durées `--duration-fast|base|slow` (`duration-(--duration-fast)`).
- **Accessibilité** : focus visible global (`--focus-ring`), prise en compte de `prefers-reduced-motion`.

## Typographie : Manrope

Configurée dans **`src/app/layout.tsx`** avec `next/font/google` :

- graisses 400, 500, 600, 700 et 800, sous-ensemble `latin` (accents français inclus), `display: swap` ;
- polices de secours système (`system-ui`, `Segoe UI`, `Roboto`, `Arial`…) avec ajustement automatique pour limiter le décalage de mise en page ;
- exposée via la variable CSS `--font-manrope`, reliée au token `--font-sans` dans `globals.css`.

Les fichiers de police sont auto-hébergés au build : aucune requête n'est envoyée à Google par le navigateur.

## Logos officiels

Les fichiers du logo officiel (deux versions) doivent être déposés dans **`public/logos/`**. Ils ne sont pas encore présents dans le dépôt. Le logo ne doit jamais être redessiné en CSS ni remplacé par du texte ou une icône. Le favicon sera créé à partir de ces fichiers officiels.

## Conventions de développement

- Server Components par défaut ; `"use client"` uniquement si nécessaire.
- Imports via l'alias `@/*` (`@/app/...`).
- Utiliser exclusivement les tokens : pas de couleurs en dur ni de valeurs arbitraires dupliquant la charte.
- Accessibilité, responsive mobile-first et performance dès la conception.
- Ajouter une dépendance uniquement pour un besoin réel.
- Ne jamais inventer de coordonnées, partenaires, témoignages ou réalisations.

Voir `CLAUDE.md` pour le détail des conventions.
