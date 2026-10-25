# Active Solution Digital Service — site web

Socle technique de la refonte du site institutionnel d'**Active Solution Digital Service** (Dakar, Sénégal), acteur des formations, du développement de solutions digitales et de la transformation numérique des organisations.

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
| `pnpm test:impact` | Vérifie dans Chrome que les chiffres de « Notre impact » affichent exactement les valeurs des données (serveur lancé avant) |
| `pnpm check:content` | Liste les contenus de « Notre histoire », « Nos convictions », « Notre équipe », « Notre impact » et de la bande « Ils nous font confiance » encore marqués `needsValidation: true` |
| `pnpm build:prod` | `check:content` puis `next build` : échoue tant qu'un contenu reste à valider |

Vérification complète : `pnpm lint && pnpm typecheck && pnpm build`.

## Structure

```text
.
├── public/
│   ├── logos/            # logos officiels (à ajouter)
│   └── partners/         # logos officiels des partenaires (à ajouter)
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
| `brand-navy` | `#07172E` | Bleu nuit, couleur principale sombre |
| `brand-gold` | `#E3A93F` | Doré, accent |
| `brand-white` | `#FFFFFF` | Blanc de référence |

### Couleurs secondaires

| Token | Valeur | Usage |
|---|---|---|
| `brand-navy-soft` | bleu nuit + 12 % de blanc | Fonds sombres secondaires |
| `brand-gold-light` | `#EDB94D` | Dégradé du logo, survol des boutons dorés |
| `gold-ink-strong` | `#9C690E` | Seul doré autorisé en petit texte sur blanc (4.7:1) |
| `surface` | `#FFFFFF` | Surface principale |
| `surface-muted` | `#F6F6F7` | Fonds secondaires |
| `text-primary` | `#07172E` | Texte principal |
| `text-secondary` | `#52525B` | Texte secondaire (≈ 7.7:1 sur blanc) |
| `text-on-dark` | `#FFFFFF` | Texte sur fond sombre |
| `border-subtle` | `#E4E4E7` | Bordures discrètes |

Les variantes sont calculées avec `color-mix()` à partir des couleurs de référence (Tailwind génère un repli hexadécimal pour les anciens navigateurs).

La palette par défaut de Tailwind est volontairement désactivée : seules les couleurs de la charte existent. Le doré sur blanc (≈ 2.1:1) ne doit pas servir pour du texte courant ; sur un bouton doré, le texte est bleu nuit.

### Autres tokens

- **Typographie** : `text-sm` (0.875rem), `text-base` (1rem), `text-lg` (1.125rem), `text-h3`, `text-h2`, `text-h1` (tailles fluides `clamp()`), chacune avec sa hauteur de ligne ; graisses `font-normal` à `font-extrabold` (400–800) ; `leading-tight|snug|normal`.
- **Géométrie** : `rounded-sm|md|lg|xl`, `shadow-sm|md|lg` (ombres discrètes teintées de bleu nuit), `max-w-site` (105.25rem, soit 1684px, avec les marges de `site-container`), `py-section` (espacement vertical fluide).
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

## Page À propos

Route `/a-propos` (`src/app/a-propos/page.tsx`) : hero « Notre manifeste » (`src/components/about/AboutHero.tsx`, CSS `about-*` dans `globals.css`), données structurées (`AboutJsonLd.tsx`) et textes (`src/lib/about.ts`).

Photos des deux arches : **`public/about/hero-enseigner.jpg`** et **`public/about/hero-batir.jpg`** (JPEG ; rebuild après remplacement). Tant qu'un fichier manque, l'arche affiche un fond dégradé bleu nuit, sans erreur de build. Le sujet doit être au centre de la photo : c'est la zone visible quand les portes s'ouvrent. Cadrage réglé dans `globals.css` par `--photo-pos` (`15% 50%` pour « Enseigner », `25% 50%` pour « Bâtir »).

**Portes à deux battants** : au repos, chaque arche montre sa photo entière ; au survol (souris uniquement), les deux battants pivotent vers l'intérieur et révèlent une vitre dépolie avec une phrase décorative. Une invitation en boucle (battants entrouverts, fente de lumière) tourne sur tous les appareils ; sur écran tactile, les arches ne s'ouvrent jamais complètement. Avec les animations réduites, l'ouverture est instantanée. Tout est en CSS (classes `about-*`), sans JavaScript.

Tokens utilisés : `brand-navy`, `brand-gold`, `brand-gold-light` (survol du bouton), `navy-deep` (ombres des battants), `text-on-dark`, `text-on-dark-soft`, `text-on-dark-strong`, `placeholder-start|end` (repli).

Sitemap : `src/app/sitemap.ts` (`/`, `/a-propos`, `/services`). Aucun `robots.txt`.

### Section « Notre histoire » (`#histoire`)

Composants dans `src/components/about/history/` (section serveur, accordéon client, archive agrandie chargée à la demande), styles `hs-*` dans `globals.css`, contenus dans **`src/content/history.ts`** (provisoires).

- Tout contenu non validé porte `needsValidation: true` : le marqueur « [À valider] » s'affiche en développement seulement, et `pnpm build:prod` échoue en listant les contenus concernés.
- Photos et archives : déposer les fichiers dans **`public/histoire/`**, puis renseigner `src` (et `alt`, légende) dans `history.ts` ; tant que `src` vaut `null`, un placeholder rayé « Photo à fournir » s'affiche.
  - Photo de panneau : **1600 × 900 minimum**, sujet principal **à droite** (la moitié gauche est couverte par le verre), WebP ou JPEG.
  - Archive : **800 × 600**, orientation libre (affichée entière dans l'archive agrandie).

### Section « Nos convictions » (`#convictions`)

Section serveur `src/components/about/convictions/ConvictionsSection.tsx` (les quatre convictions sont dans le HTML initial), onglets client `ConvictionsTabs.tsx`, styles `cv-*` dans `globals.css`, contenus dans **`src/content/convictions.ts`** (provisoires).

- Même règle que « Notre histoire » : `needsValidation: true` affiche « [À valider] » en développement seulement, et `pnpm build:prod` échoue (`scripts/check-convictions.mjs`) tant qu'il en reste un.
- Liens profonds : `#conviction-partager`, `#conviction-utilite`, `#conviction-ensemble`, `#conviction-accessible` ouvrent directement l'onglet (et mènent au panneau sans JavaScript).
- Photos : déposer les fichiers dans **`public/convictions/`**, puis renseigner `photo.src`, `alt` (description factuelle) et `caption` dans `convictions.ts` ; tant que `src` vaut `null`, un placeholder rayé « Photo à fournir » s'affiche.
  - Photo de panneau : **940 × 560 minimum**, orientation paysage, sujet principal bien visible et centré (recadrée en 470 × 280 en desktop, 16/10 ou 2/1 en dessous), WebP ou JPEG.

### Section « Notre équipe » (`#equipe`)

« L'établi » : un objet dessiné par savoir-faire (Former, Développer, Conseiller, Accompagner). Section serveur `src/components/about/equipe/TeamSection.tsx` (les quatre cartes sont dans le HTML initial), objets SVG `TeamObjects.tsx`, interaction client `TeamWorkbench.tsx`, styles `eq-*` dans `globals.css`, contenus dans **`src/content/equipe.ts`** (provisoires).

- Même règle `needsValidation` (`scripts/check-equipe.mjs`).
- Liens profonds : `#equipe-former`, `#equipe-developper`, `#equipe-conseiller`, `#equipe-accompagner`.
- « Qui s'en occupe » : renseigner `members` (`name` = nom ou initiales acceptés par la personne, `role`, `photo` facultative) ; liste vide → emplacement visible en développement seulement.
- Photo réelle de l'atelier : la déposer dans `public/equipe/` et renseigner `workshopPhoto` (`src`, `alt` factuel, `width`, `height`) : elle remplace l'illustration (l'étiquette « Illustration provisoire » disparaît).

À fournir ou confirmer : légendes des photos (`caption`) et descriptions (`description`, utilisées en `aria-label`) dans `src/lib/about.ts` ; « Depuis 2021 » (aussi `foundingDate` du JSON-LD) ; URL directes Facebook et TikTok ; coordonnées Google Maps de Liberté 1 ; image Open Graph 1200 × 630 ; téléphone et e-mail.

### Section « Notre impact » (`#impact`) et bande « Ils nous font confiance »

- **Notre impact** : `src/components/about/impact/ImpactSection.tsx` (serveur), styles `im-*`, données dans **`src/content/impact.ts`**. Les valeurs (4+, 10+, 5, 4) viennent du propriétaire ; phrases, introduction et date sont provisoires (`needsValidation`). Quand un chiffre change, mettre à jour `updatedAt` (date affichée dans `<time>`). Le champ `note` (ex. « dont 4 écoles ») ne s'affiche qu'avec `confirmed: true`.
- **Ils nous font confiance** : `src/components/sections/trust/TrustBand.tsx` réutilise **à l'identique** la section Partenaires de l'accueil (`Partners`, classes `pt-*`), avec les textes de **`src/content/trust.ts`**. Activée page par page dans `trustContent.showOn` (seulement `/a-propos`) ; la page rend `<TrustBand page="/a-propos" />` à la fin de son `<main>`. Partenaires lus dans `src/lib/partners.ts` ; en production, rien n'est rendu sans partenaire `confirmed: true`. Logos : voir « Logos des partenaires » ci-dessous.
- Entrées animées par `src/components/ui/InViewReveal.tsx` (client, un seul IntersectionObserver, compteur des chiffres) ; contrôle avant production : `scripts/check-impact.mjs`.
- Test du compteur : `pnpm test:impact [url]` (serveur lancé avant, défaut `http://localhost:3000/a-propos`, `CHROME_PATH` si besoin) lit le texte visible des quatre repères après 4 s et le compare aux valeurs de `impact.ts` (sans dépendance : Chrome piloté par le protocole DevTools).

## Page Services

Route `/services` (`src/app/services/page.tsx`) : hero (`src/components/services/ServicesHero.tsx`, CSS `sv-*` dans `globals.css`), données structurées (`ServicesJsonLd.tsx`, via `src/components/seo/JsonLd.tsx`) et trois fiches provisoires `#former`, `#creer`, `#transformer` (titre et phrase seulement ; fiches détaillées à venir). Anciennes ancres conservées : `#developpement-digital` → `#creer`, `#transformation-digitale` → `#transformer`.

- **Données partagées** : les noms, phrases et ancres des trois expertises viennent de **`src/lib/expertises.ts`**, source unique de l'accueil (section Expertises) et de `/services` (champs `anchor`, `anchorAliases`, `servicesAlt`). Textes du hero : `src/lib/services.ts`.
- **Photos des vignettes** : déposer **`public/images/services/education`**, **`developpement`** et **`transformation`** en `.avif`, `.webp` ou `.jpg` (premier format trouvé, détecté au build : rebuilder après l'ajout), environ 120 Ko, sans texte ni logo incrusté. Cadrage : `education` en portrait **1:2** (ex. 800 × 1600), les deux autres en carré **1:1** (ex. 1000 × 1000), sujet centré. Renseigner ensuite `servicesAlt` (description factuelle de la photo) dans `expertises.ts`. Sans photo, la vignette garde son fond de couleur.
- **Mouvement** : entrée en CSS pur, parallaxe au pointeur (`MosaicParallax.tsx`, souris uniquement), profondeur au défilement en CSS (`animation-timeline`, si le navigateur la gère) ; rien avec les animations réduites.
- Sitemap : `/services` ajouté. À fournir : image Open Graph 1200 × 630.

## Logos des partenaires

Les logos officiels des partenaires (fournis par le client, jamais redessinés ni téléchargés) se déposent dans **`public/partners/`** sous le nom **`<id>.svg`** (ou `.png` / `.webp`, fond transparent), où `<id>` est l'identifiant du partenaire dans `src/lib/partners.ts`. Renseigner ensuite son entrée :

```ts
{ id: "simplon", name: "Simplon", logo: { src: "/partners/simplon.svg", width: 280, height: 88 }, logoAlt: "Simplon", website: null, confirmed: true }
```

`width` / `height` : dimensions intrinsèques du fichier (le logo est contenu dans une boîte de 140 × 44 px). Tant que `logo` vaut `null`, la carte affiche le nom du partenaire. `website` n'est renseigné qu'avec une URL vérifiée : la carte devient alors un lien (nouvel onglet).

## Conventions de développement

- Server Components par défaut ; `"use client"` uniquement si nécessaire.
- Imports via l'alias `@/*` (`@/app/...`).
- Utiliser exclusivement les tokens : pas de couleurs en dur ni de valeurs arbitraires dupliquant la charte.
- Accessibilité, responsive mobile-first et performance dès la conception.
- Ajouter une dépendance uniquement pour un besoin réel.
- Ne jamais inventer de coordonnées, partenaires, témoignages ou réalisations.

Voir `CLAUDE.md` pour le détail des conventions.
