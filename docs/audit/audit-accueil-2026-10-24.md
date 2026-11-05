# Audit complet de la page d'accueil — Active Solution Digital Service

- **Date** : 24 octobre 2026
- **Périmètre** : page `/` uniquement (header, 8 sections, footer), build de production servi en local.
- **Nature** : phase 1, lecture seule. Aucun fichier du projet n'a été modifié. Seul `docs/audit/` a été créé. Aucune dépendance n'a été ajoutée. Les outils ont tourné depuis un dossier temporaire hors du dépôt.
- **Règle de preuve** : chaque constat cite une mesure (commande ou outil), une capture ou une référence `fichier:ligne`. Ce qui n'a pas pu être mesuré est signalé comme tel.

---

## 0. Méthode et environnement de mesure

| Élément | Valeur |
|---|---|
| Framework | Next.js 16.4.2 (Turbopack, `cacheComponents`, `partialPrefetching`), React 19.3.0, TypeScript 5.9.3 |
| Styles / libs | Tailwind CSS 4.3.3, motion 14.6.0, lucide-react 1.61.0 |
| Exécution | `pnpm build` puis `pnpm exec next start -p 3100` (jamais `pnpm dev` pour les mesures), Node 24.13.1 |
| Navigateur | Google Chrome 144.0.7559.132 (headless) |
| Outils (hors dépôt, via `npx` / dossier temporaire) | Lighthouse 12.8.2, axe-core 4.10.3, puppeteer-core 24.10.0 (pilotage CDP, équivalent Playwright) |
| Viewports | 320, 360, 390, 640, 720, 768, 1024, 1440, 1920 px |
| Mobile émulé | Lighthouse « mobile » : RTT 150 ms, 1,6 Mbit/s (Slow 4G), CPU ×4. Variantes : throttling appliqué (`--throttling-method=devtools`), CPU ×6 |
| Variantes | JavaScript désactivé, `prefers-reduced-motion: reduce`, reflow 320/640/720 px (≈ zoom 400 % et 200 %), espacement WCAG 1.4.12 injecté, `forced-colors: active` (CDP), clavier seul (160 tabulations), menu mobile |

**Limites, à dire honnêtement :**

- **Pas de mesures terrain.** Aucun appareil réel, aucun vrai lecteur d'écran (NVDA, VoiceOver), aucune donnée CrUX.
- **TTFB non représentatif.** Les mesures sont faites sur le serveur local (TTFB 6 à 18 ms) : la valeur réelle dépendra de l'hébergement.
- **Lighthouse très variable sur cette machine.** Le TBT mobile va de 85 à 5 916 ms selon l'exécution. J'ai donc fait **5 exécutions mobiles** au lieu de 3 et je donne les deux médianes.
- **Playwright demandé, puppeteer-core utilisé.** C'est le même protocole CDP et le même Chrome. Il n'y a pas d'`ariaSnapshot` : les noms accessibles ont été lus dans le DOM (`aria-label`, `textContent`) et via axe.
- **Contrastes sur dégradés.** Pour le texte sur dégradé ou en `background-clip: text`, j'ai calculé à la main, couleur par couleur (stop le plus défavorable).

**Artefacts** (dans `docs/audit/artefacts/`) :

- `lighthouse/` :
  - `lh-summary.md` (les 10 exécutions) ;
  - rapports HTML et JSON de la médiane mobile (`mobile-4`) et desktop (`desktop-3`) ;
  - `mobile-devtools.report.json` (throttling appliqué).
- `mesures/` :
  - résultats axe et recensements (`results-*.json`) ;
  - contrastes (`contrast.json`) ;
  - URL de l'ancien sitemap ;
  - scripts de mesure (renommés `.mjs.txt` pour ne pas être lintés).
- `captures/` : 25 captures (sections à 1440 et 390, sans JS, contraste forcé, 360, 1920).

---

## 1. Résumé exécutif

**État général.** La page est techniquement soignée :

- **Accessibilité** : bons patterns ARIA (onglets, accordéons, dialog natif) et focus visible partout.
- **Mise en page** : CLS = 0 et aucun défilement horizontal de 320 à 1920 px.
- **Mouvement** : `prefers-reduced-motion` coupe 100 % des animations.

Elle n'est pourtant **pas publiable en l'état**. La navigation promet des pages qui n'existent pas, le premier écran dépend entièrement de JavaScript, et les fondations SEO et de migration sont absentes.

**5 problèmes majeurs :**

1. **17 liens mènent à des 404** (6 URL distinctes). Ce sont tous les liens du menu principal, le bouton du header, les 2 boutons du hero, 3 liens Expertises, le bouton Formations et « Nous contacter » de la FAQ. La page 404 est celle de Next.js, **en anglais**.
2. **Premier écran vide sans JavaScript.** Logo, menu, h1 et boutons sont rendus à `opacity: 0` par Motion : 71 blocs de texte sont invisibles. Avec le throttling appliqué, **LCP mobile = 5,1 s** (cible 2,5 s) : l'élément LCP (légende du hero) attend l'hydratation de 243 Kio de JS (gzip).
3. **SEO et migration non préparés** :
   - ni `robots.txt`, ni `sitemap.xml`, ni canonical, ni `og:image`, ni `metadataBase` ;
   - titre de 31 caractères sans « Dakar », en régression par rapport au site actuel ;
   - aucune redirection prévue pour les **11 URL** indexables du site actuel ;
   - données structurées réduites à `FAQPage` (le site actuel publie déjà `ProfessionalService`).
4. **Lisibilité machine et clarté d'entité (GEO)** :
   - le h1 ne nomme pas Active Solution ;
   - son texte est **servi trois fois** dans le HTML (« Former les talents,Former les talents,Former les talents,créer… ») ;
   - aucune phrase de définition citable dans le premier écran.
5. **Accessibilité AA** :
   - les pastilles de services des expertises inactives tombent à **3,41:1** (desktop) et **2,22:1** (mobile) ;
   - plus de 50 animations décoratives tournent en boucle sans moyen de pause dans la page (WCAG 2.2.2, lecture stricte) ;
   - les points de pagination du hero font 16 × 24 px (2.5.8).

**5 forces à conserver :**

1. CLS = 0 sur toutes les exécutions et tous les viewports.
2. Patterns WAI-ARIA corrects et testés au clavier : onglets FAQ et Formations (flèches, Home/End, roving tabindex), accordéons, menu mobile `<dialog>` (piège natif, Échap, retour du focus, `aria-expanded`, défilement bloqué).
3. `prefers-reduced-motion` exemplaire : 0 animation active en mode réduit, carrousel sans lecture automatique, pause manuelle du carrousel sinon.
4. Formulaire honnête (aucun « envoyé » sans backend), erreurs reliées (`aria-invalid` + `aria-describedby`), focus sur la première erreur, repli `<noscript>`.
5. Typographie et poids : police variable unique (24 Kio, préchargée par en-tête `Link`), cache immuable sur `/_next/static`, gzip actif, aucun script tiers.

---

## 2. Tableau de bord

### 2.1 Lighthouse 12.8.2

**Mobile** (simulate : Slow 4G, CPU ×4) :

| Exécution | Perf | Accessibilité | Bonnes pratiques | SEO |
|---|---|---|---|---|
| Médiane de 3 (protocole) | 90 | 97 | 96 | 100 |
| Médiane de 5 | 75 | 97 | 96 | 100 |
| Plage observée | 36 → 91 | 93 → 97 | 96 | 100 |

**Desktop** (simulate, médiane de 3) : Performance 94 (plage 82 → 98), Accessibilité 100, Bonnes pratiques 96, SEO 100.

- **Bonnes pratiques à 96** : erreurs console 404 (favicon et préchargements RSC de pages inexistantes).
- **SEO à 100** : ce score ne vérifie ni canonical, ni sitemap, ni og:image. Il ne reflète pas l'état réel (voir la section D).

### 2.2 Core Web Vitals (laboratoire) et métriques

| Métrique | Mobile, simulate (médiane de 5) | Mobile, devtools (appliqué) | Mobile, CPU ×6 | Desktop (médiane de 3) | Cible | Écart mobile |
|---|---|---|---|---|---|---|
| LCP | **3 376 ms** | **5 118 ms** | 3 479 ms | 702 ms | ≤ 2 500 ms | +876 à +2 618 ms ❌ |
| CLS | 0,000 | 0,000 | 0,000 | 0,000 | ≤ 0,1 | ✅ |
| TBT (proxy INP) | **616 ms** (plage 85 → 5 916) | 169 ms | 370 ms | 75 ms | ≤ 200 ms | +416 ms ❌ (médiane) |
| FCP | 1 366 ms | 1 862 ms | 1 358 ms | 464 ms | ≤ 1 800 ms | ✅ / ❌ en appliqué |
| Speed Index | 3 509 ms | 3 508 ms | 2 389 ms | 1 837 ms | ≤ 3 400 ms | +109 ms ⚠️ |
| TTI | 3 444 ms | 4 020 ms | 3 778 ms | 1 308 ms | — | — |
| TTFB | 6–18 ms (local, non représentatif) | — | — | 12–14 ms | ≤ 800 ms | à mesurer en ligne |

- **Élément LCP mobile** : `<p style="opacity: 0; transform: translateY(-8px);">`, la légende du hero. Répartition : TTFB 457 ms, retard de rendu **2 851 ms**.
- **Élément LCP desktop** : `div.hero-grain` (texture du hero).

### 2.3 axe-core 4.10.3

Règles `wcag2a, wcag2aa, wcag21aa, wcag22aa, best-practice` ; page entièrement défilée.

| Viewport | Critique | Sérieuse | Modérée | Mineure | Détail |
|---|---|---|---|---|---|
| 360 | 0 | 1 règle (2 nœuds) | 1 (1 nœud) | 0 | `target-size` (points du hero), `landmark-complementary-is-top-level` (`aside` FAQ) |
| 390 | 0 | 1 (2) | 1 (1) | 0 | idem |
| 768 | 0 | 1 (2) | 1 (1) | 0 | idem |
| 1024 | 0 | 0 | 1 (1) | 0 | `landmark-complementary-is-top-level` |
| 1440 | 0 | 0 | 1 (1) | 0 | idem |
| 1920 | 0 | 0 | 1 (1) | 0 | idem |

- **« À vérifier » (incomplete)** : 160 à 190 nœuds `color-contrast` que l'outil ne sait pas calculer (texte sur dégradé, sur verre, en `background-clip: text`). Je les ai calculés à part (section B.3).
- **Faux positifs relevés** : 3 nœuds `target-size` absents à 1024+ (zone de clic agrandie par `::before`, conforme). Contrastes « 1:1 » du header, de l'onglet FAQ actif et du bouton WhatsApp : leur fond est un calque frère ou un dégradé, pas un ancêtre.

### 2.4 Liens, poids, DOM

| Indicateur | Mesure | Outil |
|---|---|---|
| Liens internes vers une page 404 | **17 liens, 6 URL distinctes** (`/services` ×3, `/realisations` ×2, `/formations` ×4, `/a-propos` ×2, `/contact` ×4, `/services#…` ×2) | fetch de chaque `href`, `results-structure.json` |
| Ancres internes | 12/12 valides | idem |
| Liens externes `target=_blank` sans `rel="noopener noreferrer"` | 0 | idem |
| Poids transféré, cache vide | **352 Kio** : JS 243,4 Kio (9 fichiers), HTML 47,9 Kio, CSS 30,3 Kio, police 24,3 Kio, images 4,1 Kio | CDP `encodedDataLength`, `weight.mjs` |
| Poids transféré, cache chaud | 1,1 Kio (22 requêtes revalidées) | idem |
| JS brut (non compressé) | ≈ 894 Ko (9 chunks) | `curl` + `wc -c` |
| HTML | 358 Ko brut / 48 Ko gzip (dont 108 Ko de charge RSC, 100 `<svg>`, 516 attributs `style`) | `curl` |
| DOM | 1 997 à 2 044 nœuds, profondeur 18 | Lighthouse `dom-size`, recensement |
| Requêtes au chargement | 25 (mobile), 28 (desktop) | Lighthouse |

---

## 3. Constats par domaine

Format de chaque constat : **ID — titre**, puis section, description, preuve, impact, gravité, effort (S ≤ 1 h, M ≤ 1 jour, L > 1 jour), correction et critère de validation.

### A. UX / UI

**UX-01 — La navigation principale et les appels à l'action mènent à des pages 404** — Header, menu mobile, Hero, Expertises, Formations, FAQ

- **Description.** 17 liens pointent vers 6 routes inexistantes. L'application ne contient que `src/app/page.tsx`.
- **Preuve.**
  - `src/components/layout/navigation.ts:8-14` (`/services`, `/realisations`, `/formations`, `/a-propos`, CTA `/contact`) ;
  - `src/components/sections/hero/HeroCarouselText.tsx:209` (`/services`) et `:223` (`/contact`) ;
  - `src/lib/expertises.ts:42,63,78` ; `src/lib/formations.ts:35` ; `src/lib/faq.ts:32` ;
  - `curl -o /dev/null -w '%{http_code}'` donne 404 pour les 6 routes ;
  - Next.js précharge ces routes : 11 requêtes RSC en 404 ou interrompues, 11 erreurs console (`results-structure.json`).
- **Impact.** Utilisateur : les 2 boutons principaux du premier écran ne mènent nulle part, et sur mobile les 5 entrées du menu non plus. SEO : liens cassés. Bonnes pratiques : 96.
- **Gravité** : **Bloquant**. **Effort** : S.
- **Correction.** Tant que les pages n'existent pas :
  - faire pointer chaque lien vers l'ancre de la page d'accueil (`/#expertises`, `/#realisations`, `/#formations`, `/#contact` ; « À propos » retiré, ou ancre vers la FAQ « L'entreprise ») ;
  - `/services#developpement` et `/services#transformation` vers `/#expertise-developpement` et `/#expertise-transformation` (ancres existantes, utilisées par le footer) ;
  - ou bien créer les pages (Lot 2).
- **Validation.** Script de liens : 0 destination interne en 404 ; console sans erreur 404 ; Lighthouse Bonnes pratiques = 100.

**UX-02 — Page 404 par défaut, en anglais, avec deux `<title>`** — Toutes pages

- **Preuve.**
  - `curl localhost:3100/page-inexistante` affiche « 404: This page could not be found. » ;
  - la page contient deux `<title>` (« 404: This page could not be found. » et « Active Solution Digital Service ») ;
  - il n'y a pas de `src/app/not-found.tsx`.
- **Impact.** Utilisateur : c'est la page d'arrivée de tous les liens de UX-01 et des anciennes URL (SEO-02).
- **Gravité** : **Majeur**. **Effort** : S.
- **Correction.** Créer `src/app/not-found.tsx` en français : titre, phrase d'aide, liens vers l'accueil, les ancres principales et le contact.
- **Validation.** `/xyz` répond 404, en français, avec un seul `<title>`.

**UX-03 — Le premier écran ne nomme pas l'entreprise et ne dit pas « pour qui »** — Hero

- **Description.**
  - Le h1 (« Former les talents, créer les solutions, transformer les organisations. ») dit **quoi**, mais pas **qui** : le nom n'apparaît que dans le logo, une image.
  - Il ne dit pas non plus **pour qui** : la légende tourne toutes les 6 s et ne montre qu'un domaine à la fois.
  - Le « où » est présent (badge « Dakar · Sénégal · Depuis 2021 »).
  - Les 3 domaines sont lisibles sans défiler (3 lignes du h1) : point positif.
- **Preuve.** `HeroCarouselText.tsx:158-176` ; `hero-slides.ts:20-45` ; captures `s-1440-00-hero.png` et `s-390-00-hero.png`.
- **Impact.** Utilisateur (test des 5 secondes partiellement réussi) ; GEO (aucune phrase de définition, voir GEO-01).
- **Gravité** : **Majeur**. **Effort** : S (contenu) à M (mise en page).
- **Correction.** Ajouter sous le h1 une phrase fixe (hors carrousel), du type : « Active Solution Digital Service accompagne, à Dakar, les entreprises, établissements scolaires et institutions : formation au numérique, développement de solutions sur mesure et transformation digitale. » Texte à valider par vous ; ne pas inventer.
- **Validation.** Le HTML serveur du premier écran contient le nom, la ville, les 3 domaines et les cibles dans une même phrase.

**UX-04 — Libellés d'action incohérents ; même libellé, destinations différentes** — Toute la page

- **Description.**
  - Le contact s'appelle « Parlons de votre projet » (header, hero), « Nous contacter » (Méthode, qui mène à `#contact`, ancre valide ; FAQ, qui mène à `/contact`, en 404), « Envoyer sur WhatsApp » et « Écrire sur WhatsApp ».
  - Les liens de découverte s'appellent « Découvrir nos services », « Découvrir nos solutions », « Découvrir les programmes », « Découvrir nos formations » et « Transformer votre organisation ».
  - « Formations » mène à `/formations` (404) dans le header, à `/#formations` dans le footer.
- **Preuve.** Tableau des liens en annexe 4.1.
- **Impact.** Utilisateur : prévisibilité. A11y : WCAG 3.2.4 (identification cohérente), risque.
- **Gravité** : Mineur. **Effort** : S.
- **Correction.** Un libellé par intention : « Nous contacter » mène toujours à la même destination, « Découvrir nos formations » toujours à la même.
- **Validation.** Deux liens de même libellé ont la même destination (script de liens).

**UX-05 — Nom du domaine 1 instable** — Hero, Expertises, Réalisations, Footer, métadonnées

- **Description.** Le même domaine s'appelle :
  - « Éducation numérique » (pastille du hero, footer, Réalisations) ;
  - « Formations » (Expertise 01, section Formations) ;
  - « formation numérique » (meta description) ;
  - « la formation et l'éducation numérique » (FAQ 02).
- **Preuve.**
  - `hero-slides.ts:21` (« Éducation numérique ») ;
  - `expertises.ts:35` (« Formations ») ;
  - `footer.ts:18` (« Éducation numérique ») ;
  - `layout.tsx:17` (« formation numérique ») ;
  - `faq.ts:66` (« la formation et l'éducation numérique »).
- **Impact.** Utilisateur ; SEO et GEO : l'entité « service » est floue.
- **Gravité** : Mineur. **Effort** : S.
- **Correction.** Choisir un nom canonique (décision éditoriale, annexe 3) et l'appliquer partout.

**UX-06 — Page très longue sur mobile, trois visuels collants qui réduisent la zone de lecture** — Expertises, Méthode, Partenaires

- **Description.** La page mesure **12 959 px à 390** (≈ 15,4 écrans de 844 px) et **10 479 px à 1440** (≈ 11,6 écrans). Hauteurs à 390 :
  - Expertises 2 068 px ;
  - Méthode 1 889 px ;
  - Formations 1 827 px ;
  - Contact 1 722 px.

  Sur mobile, le visuel collant des Expertises, la pile collante de la Méthode et le cercle AS collant des Partenaires occupent chacun 290 à 300 px sous le header de 72 px : il reste environ 55 % de l'écran pour le texte.
- **Preuve.** Recensement (`results-axe.json`, champ `census.heights`) ; captures `s-390-01-expertises.png`, `s-390-03-methode.png`, `s-390-07-partenaires.png` ; tableau en annexe 4.2.
- **Impact.** Utilisateur : fatigue, contenu clé (Contact) à environ 10 000 px.
- **Gravité** : Mineur. **Effort** : M.
- **Correction.**
  - Réduire la hauteur des visuels collants à 360/390 (`--visual-h`, `--stack-h`) ou les rendre non collants sous 400 px de large.
  - Raccourcir Méthode et Contact sur mobile (ex. réseaux sociaux seulement dans le footer).
  - Ajouter un accès au contact plus tôt (bouton du menu mobile, déjà présent).
- **Validation.** Hauteur totale à 390 ≤ 11 000 px ; zone de lecture ≥ 60 % de l'écran dans les sections collantes.

**UX-07 — Budget doré dépassé dans le premier écran desktop (contestation d'une décision, mesurée)** — Header et Hero

- **Description.** À 1440, éléments dorés forts visibles en même temps :
  1. bouton du header (fond doré) ;
  2. bouton « Découvrir nos services » (fond doré) ;
  3. ligne active du h1 (dégradé doré) et sa barre de progression ;
  4. pastille ronde dorée de l'icône du visuel.

  S'y ajoutent les accents : point du badge, ellipse dorée en orbite, motif doré, halo doré. Cela fait **4 éléments forts**, pour une règle de 3 au plus.
- **Preuve.** Capture `s-1440-00-hero.png`.
- **Impact.** Hiérarchie : deux boutons dorés se concurrencent (header et hero).
- **Gravité** : Mineur. **Effort** : S.
- **Correction (au choix).** Bouton du header en contour tant que le hero est visible ; ou icône de la pastille en bleu nuit sur verre.
- **Validation.** ≤ 3 éléments dorés forts au premier écran (relevé visuel sur capture).

**UX-08 — La confirmation du formulaire peut être fausse** — Contact

- **Description.** Après validation, le message « Message préparé. Il s'ouvre dans WhatsApp. » (ou « … dans votre messagerie ») s'affiche sans vérifier que l'ouverture a réussi :
  - `window.open` peut être bloqué ;
  - `mailto:` est sans effet sans client de messagerie configuré (cas fréquent sur desktop).
- **Preuve.** `src/components/sections/contact/ContactForm.tsx:104-110`.
- **Impact.** Confiance : l'utilisateur croit avoir écrit alors que rien ne part. Il n'y a ni backend ni stockage, comme décidé ; ce constat ne remet pas cette décision en cause.
- **Gravité** : Mineur. **Effort** : S.
- **Correction.**
  - Tester la valeur de retour de `window.open`. Si elle est `null`, afficher le lien `wa.me` cliquable.
  - Pour l'e-mail, formuler « Si votre messagerie ne s'ouvre pas, copiez notre adresse : … » avec le bouton Copier existant.
- **Validation.** Avec les pop-ups bloquées, un lien de secours s'affiche.

**UX-09 — La preuve et la confiance reposent sur du provisoire** — Réalisations, Partenaires, FAQ

- **Description.**
  - Réalisations : 3 tuiles étiquetées « Illustration », aucun projet réel.
  - Partenaires : 5 noms sans logo ni lien.
  - FAQ : 6 réponses sur 12 sont la phrase neutre ; l'onglet « Collaboration » (devis, délais, suivi) n'en contient **aucune** de réelle.
  - Le site actuel publie déjà 5 pages d'activités (annexe 3) qui pourraient, une fois validées, alimenter les Réalisations.
- **Preuve.** `realisations.ts:40-76` ; `partners.ts:34-39` ; `faq.ts:75,90,92-98,135-139` ; `old-urls.txt`.
- **Impact.** Conversion et E-E-A-T. Ce constat n'est pas un défaut de code : c'est la liste des dépendances de contenu (annexe 2).
- **Gravité** : Majeur (avant mise en ligne). **Effort** : contenu (vous).
- **Correction.** Fournir le contenu (annexes 2 et 3). Côté code, rien à changer : les mécanismes de bascule (scène, logos, `status: "ready"`) existent.

**UX-10 — Le header ne reflète pas la position dans la page** — Header

- **Description.** « Accueil » reste souligné et marqué `aria-current="page"` sur toute la page. Les autres liens visent des routes (404), pas des sections : il n'y a donc aucun repère de section. Le footer, lui, utilise des ancres.
- **Preuve.** `Header.tsx:50,112` ; captures `s-1440-07-partenaires.png` (« Accueil » souligné au niveau des Partenaires).
- **Impact.** Orientation dans une page de 11 écrans.
- **Gravité** : Mineur. **Effort** : M.
- **Correction.** Après UX-01 (liens en ancres), ajouter un suivi de section (IntersectionObserver) avec `aria-current="location"` sur l'ancre de la section visible. `aria-current="page"` reste sur « Accueil » seulement si c'est une route.
- **Validation.** Au niveau de #formations, le lien « Formations » est souligné et porte `aria-current="location"`.

### B. Accessibilité (WCAG 2.2 AA)

**ACC-01 — Contenu essentiel invisible sans JavaScript (ou avant l'hydratation)** — Header, Hero, Expertises

- **Description.** Motion pose `opacity: 0` (et `y`) dans le HTML serveur. Si le JS échoue, est bloqué ou tarde, ces éléments ne s'affichent pas :
  - logo, 5 liens et bouton du header ;
  - tout le hero : badge, h1 (lignes en `translateY(110%)` dans un masque), légende, 2 boutons, « Défiler » ;
  - en-tête et contenus des Expertises.

  **71 blocs de texte invisibles** à 390 comme à 1440. Les sections Méthode (`<noscript>` dédié), Formations, Réalisations, FAQ, Contact, Partenaires et Footer utilisent déjà le motif « état masqué posé par JS (`data-js`) » et restent lisibles.
- **Preuve.**
  - `results-nojs.json` (répartition : hero 14–15, header 2–8, expertises 29–32, méthode 3, formations 16–20 ; ces derniers sont des panneaux d'onglets inactifs, normal) ;
  - capture `nojs-1440-top.png` (premier écran entièrement vide) ;
  - code : `Header.tsx:27-34,77-81` ; `HeroCarouselText.tsx:34-37,73-77,183-186,202-205` ; `HeroStage.tsx:88-93,105-109` ; `SectionHeader.tsx:51` ; `ExpertisePanel.tsx:113-118`.
- **Impact.**
  - Robustesse : réseau 4G instable, bloqueurs, erreur JS.
  - Performance : c'est la cause du LCP tardif (PERF-01).
  - SEO et GEO : les robots qui ne rendent pas le JS lisent le texte, mais un rendu sans JS montre une page vide.
- **Gravité** : **Majeur**. **Effort** : M.
- **Correction.** Aligner Header, Hero et Expertises sur le motif déjà utilisé dans le reste du site : contenu visible par défaut ; état masqué posé seulement après `useLayoutEffect` (`data-js`), animations CSS (`fo-enter`) déclenchées par attribut. À défaut, un `<noscript>` comme Méthode (`MethodeClient.tsx:123-124,348`). Le texte LCP (légende du hero) ne doit jamais partir d'`opacity: 0`.
- **Validation.** JS désactivé : 0 bloc de texte invisible hors panneaux inactifs (`audit.mjs nojs`) ; capture du premier écran lisible.

**ACC-02 — Contraste insuffisant des pastilles de services dans les expertises inactives (1.4.3)** — Expertises

- **Description.** La variable `decoDim`, prévue pour le décor, est appliquée aussi aux pastilles de texte. Le commentaire du fichier promet pourtant que les textes ne descendent jamais sous 0,85. Mesures :
  - desktop, bloc inactif : `opacity: 0.5` → texte bleu nuit 13 px sur blanc = **3,41:1** ;
  - mobile, bloc passé : `opacity: 0.35` → 12 px = **2,22:1** ;
  - mobile, bloc à venir : `opacity: 0.55` → **3,98:1**.
- **Preuve.** `ExpertisePanel.tsx:73` (définition) et `:176` (application aux `<span>` de services) ; mesure DOM (`probe-rz.mjs` : `expertise-education chips op=0.5`) ; `contrast.json`.
- **Impact.** Utilisateurs malvoyants. Non-conformité AA.
- **Gravité** : **Majeur**. **Effort** : S.
- **Correction.** Remplacer `${decoDim}` par la classe `text` (0,85 au plus bas, 6,7:1) sur les pastilles, ou n'atténuer que leur bordure.
- **Validation.** Recalcul : toutes les paires du bloc inactif ≥ 4,5:1.

**ACC-03 — Points de pagination du hero trop petits (2.5.8)** — Hero (< 1024 px)

- **Description.** Les 3 boutons font **16 × 24 px** (actif : 36 × 24) et sont espacés de 4 px. axe classe la règle `target-size` « serious » à 360, 390 et 768.
- **Preuve.** `HeroVisual.tsx:217-224` (`h-6 px-1`) ; axe `results-axe.json`.
- **Impact.** Usage tactile (zone du pouce).
- **Gravité** : Mineur. **Effort** : S.
- **Correction.** Zone de clic d'au moins 24 × 24 px, idéalement 44 × 44 : `min-w-11 h-11`, avec la pastille visuelle inchangée au centre.
- **Validation.** axe : 0 `target-size`.

**ACC-04 — Pas de lien d'évitement** — Header

- **Description.** Au clavier, il faut 7 tabulations en desktop (logo, 5 liens, bouton du header) avant le contenu. Le critère 2.4.1 est techniquement satisfait par le landmark `<main>` (technique ARIA11), mais le RGAA (12.7) exige un lien d'évitement et c'est l'usage attendu.
- **Preuve.** Séquence clavier `results-keyboard.json` (étapes 1 à 7) ; les 3 premiers liens de la page sont `/`, `/`, `/services`.
- **Impact.** Utilisateurs du clavier et de lecteurs d'écran.
- **Gravité** : Mineur. **Effort** : S.
- **Correction.** Ajouter un lien « Aller au contenu » vers `<main id="contenu" tabIndex={-1}>`, visible au focus, premier élément du `<body>`.
- **Validation.** 1re tabulation = « Aller au contenu » ; Entrée amène le focus dans `main`.

**ACC-05 — Le h1 est un groupe de 3 boutons de carrousel** — Hero

- **Description.** Les 3 lignes du h1 sont des `<button>` (`aria-current`, `aria-controls="hero-visual"`). Un lecteur d'écran annonce « titre de niveau 1, bouton Former les talents… ». La navigation par titres mène à une commande, pas à un titre. Les doublons visuels sont bien en `aria-hidden`, mais le `textContent` du h1 contient chaque ligne 2 ou 3 fois (voir SEO-05).
- **Preuve.** `HeroCarouselText.tsx:87-124,158-176` ; liste des titres (`results-structure.json`).
- **Impact.** Lecteur d'écran (sémantique inhabituelle) ; SEO.
- **Gravité** : Mineur. **Effort** : M.
- **Correction.** h1 en texte simple (trois `<span>`), commandes du carrousel séparées (onglets ou boutons « 1, 2, 3 » existants, en `role="tablist"`). Le dégradé et le reflet passent en pseudo-éléments ou en `aria-hidden` hors du h1.
- **Validation.** `document.querySelector('h1').textContent` égale la phrase une seule fois ; aucun bouton dans un titre.

**ACC-06 — `aside` imbriqué dans une section (landmark complémentaire non racine)** — FAQ

- **Preuve.** axe `landmark-complementary-is-top-level` (modérée) à toutes les largeurs ; `FaqAside.tsx:22-26`.
- **Gravité** : Mineur. **Effort** : S.
- **Correction.** Remplacer `<aside aria-label="Contact">` par `<div role="group" aria-labelledby=…>` ou une `<section>` titrée.
- **Validation.** axe : 0 violation à toutes les largeurs.

**ACC-07 — 17 régions nommées (landmarks) pour des panneaux** — FAQ, Formations

- **Description.** Les 12 réponses de la FAQ et les 5 volets de l'accordéon Formations ont `role="region"` et un nom : la liste des landmarks d'un lecteur d'écran passe de 13 à 30 entrées. Le guide APG recommande d'éviter `region` au-delà de 6 panneaux.
- **Preuve.** Liste des landmarks (`results-structure.json`) ; `FaqItem.tsx:63` ; `FormationsAccordion.tsx:79`.
- **Gravité** : Mineur. **Effort** : S.
- **Correction.** Retirer `role="region"` des réponses de la FAQ (garder `id` + `aria-controls`).

**ACC-08 — Le nom accessible ne contient pas le libellé visible (2.5.3)** — Hero, desktop

- **Description.** Le lien affiche « Défiler » mais son nom accessible est « Aller à la section suivante ». La commande vocale « cliquer sur Défiler » échoue.
- **Preuve.** Lighthouse desktop `label-content-name-mismatch` ; `HeroScrollHint.tsx:22`.
- **Gravité** : Mineur. **Effort** : S.
- **Correction.** `aria-label="Défiler vers la section suivante"`, ou supprimer l'`aria-label` et ajouter un texte `sr-only` complémentaire.

**ACC-09 — Animations décoratives continues sans moyen de pause dans la page (2.2.2, lecture stricte)** — Hero, Expertises, Formations, FAQ, Contact, Partenaires

- **Description.** En haut de page à 1440 : **52 animations infinies actives**, dont 30 hors écran (voir PERF-04). Sources :
  - hero : scintillement × 16, balayage du motif, point lumineux en orbite (SVG `animateMotion`, 14 s), anneau pulsant, point « Défiler » ;
  - Formations : impulsion et respiration ;
  - Partenaires : lumières toutes les 1,4 s, sonar, respiration ;
  - scène du « ? » de la FAQ ;
  - points `twinkle-soft` de 5 sections.

  Le carrousel a un bouton pause (conforme), et `prefers-reduced-motion` coupe tout (0 animation, mesuré). Mais 2.2.2 exige un **mécanisme dans la page** pour tout mouvement automatique de plus de 5 s affiché en parallèle d'autre contenu. Le réglage système n'est pas reconnu par toutes les grilles d'audit comme un mécanisme suffisant.
- **Preuve.** `results-structure.json` (`anim1440Top`, `anim1440Bottom`) ; `results-reduce.json` (0 animation en mode réduit) ; `HeroMotif.tsx:59-67,93` ; `HeroVisual.tsx:104-107` ; `PartnersStage.tsx:15-27`.
- **Impact.** Utilisateurs sensibles au mouvement ou ayant des troubles de l'attention ; risque de non-conformité.
- **Gravité** : **Majeur** (conformité). **Effort** : M.
- **Correction (au choix).**
  - Un interrupteur global « Mettre en pause les animations » (footer ou header), mémorisé, qui pose `data-motion="paused"` sur `<html>`. Le CSS met alors `animation-play-state: paused` sur toutes les boucles. Le motif `data-paused` existe déjà dans plusieurs sections.
  - Ou bien arrêter chaque boucle au bout de 5 s.
- **Validation.** Après activation : `document.getAnimations().filter(a => a.playState === 'running' && a.effect.getComputedTiming().iterations === Infinity).length === 0`.

**ACC-10 — Ordre de tabulation différent de l'ordre visuel (2.4.3)** — Expertises, mobile

- **Description.** Sous 1024 px, le visuel collant (3 boutons de segment) est affiché **au-dessus** des blocs (`order-first`) mais vient **après** eux dans le DOM. Le clavier passe d'abord par « Découvrir les programmes / nos solutions / Transformer » (y = 2 018 à 3 022), puis remonte aux segments (y = 1 366).
- **Preuve.** `results-keyboard.json` (390, étapes 12 à 17) ; `ExpertisesScroller.tsx:301-303`.
- **Gravité** : Mineur. **Effort** : S.
- **Correction.** Placer le visuel avant les blocs dans le DOM (l'ordre desktop reste réglé par la grille), ou sortir les segments de la tabulation (`tabIndex={-1}`) : ils doublonnent les liens.

**ACC-11 — Focus partiellement masqué par le header fixe** — Hero, mobile

- **Description.** À 390, la 2e ligne du h1 reçoit le focus avec 28 px sur 39 recouverts par le header (71 %). Le critère 2.4.11 (AA, focus pas *entièrement* masqué) passe ; 2.4.12 (AAA) échoue. Il n'y a pas de `scroll-padding-top` sur `html` : les éléments focalisés près du haut peuvent passer sous le header.
- **Preuve.** `results-keyboard.json` (390, étape 4 : `obscuredPx: 28`) ; `globals.css:488-493` (`scroll-margin-top` seulement sur `section[id]`).
- **Gravité** : Mineur. **Effort** : S.
- **Correction.** `html { scroll-padding-top: 72px }`, et `90px` à partir de `xl`.

**ACC-12 — Mode contraste forcé : boutons pleins sans contour, onglet actif indiscernable** — Header, Hero, FAQ, Contact

- **Description.** En `forced-colors: active`, les boutons à fond doré (header, « Découvrir nos services », « Écrire sur WhatsApp », « Envoyer sur WhatsApp ») perdent leur fond et n'ont pas de bordure : ils ressemblent à du texte. L'onglet actif de la FAQ (signalé par un calque bleu nuit frère) n'est plus distinguable des autres.
- **Preuve.** Captures `forced-colors-1440-top.png`, `forced-colors-1440-faq.png`, `forced-colors-1440-contact.png`.
- **Impact.** Utilisateurs du contraste élevé Windows.
- **Gravité** : Mineur. **Effort** : S.
- **Correction.**
  - `border: 1px solid transparent` sur les boutons pleins (le mode forcé la rend visible).
  - `@media (forced-colors: active) { [role=tab][aria-selected=true] { outline: 2px solid Highlight } }`.

**ACC-13 — Étiquettes en capitales de 10,5 à 12 px très espacées** — Expertises, Réalisations, Contact, Footer

- **Description.** Relevé à 390 et 1440 (texte visible) :
  - 10,5 px « ILLUSTRATION » ;
  - 11 px « IDÉAL POUR » et domaines de Réalisations ;
  - 11,5 px étiquettes de Contact (« TÉLÉPHONE », « VOTRE NOM »…) et titres du footer ;
  - 12 px libellés de section ;
  - 12 px corps des pastilles d'Expertises sur mobile.

  Le contraste est conforme (≥ 7:1 sauf ACC-02), mais la lecture est difficile (capitales et espacement de 0,12 à 0,2 em).
- **Preuve.** Recensement `census.small` (`results-axe.json`).
- **Gravité** : Amélioration. **Effort** : S.
- **Correction.** Plancher à 12 px pour les étiquettes en capitales et à 13 px pour le texte courant des pastilles.

**ACC-14 — À vérifier avec un vrai lecteur d'écran (non mesurable ici)**

- **Gravité** : à vérifier. **Effort** : M.
- **Points à tester (NVDA + Firefox, VoiceOver + Safari iOS) :**
  - annonces du carrousel (`aria-live` passe de `off` à `polite` en pause) ;
  - annonce de projet de la scène Réalisations (`data-rz-live`) ;
  - groupe radio personnalisé du formulaire (`button role="radio"`) ;
  - bouton Copier (statut « Copié dans le presse-papiers ») ;
  - ordre de lecture de la pile Méthode (`role="img"`).

### B.3 Contrastes mesurés

Couleur du texte composée avec l'opacité, fond composé ; script `contrast.mjs`, 91 à 93 paires distinctes par largeur.

**Paires réellement sous le seuil** : seulement ACC-02 (3,41:1 et 2,22:1).

**Paires conformes mais à faible marge :**

| Élément | Couleurs | Taille | Ratio | Seuil | Verdict |
|---|---|---|---|---|---|
| Lignes inactives du h1 | blanc 35 % sur `#07172E` | 36–45 px gras | 3,18:1 | 3:1 (grand texte) | ✅ marge 0,18 |
| Mot en `.gold-ink-text` (« solution. », « réponses. », « partenaires. ») | stop clair `#B3811B` sur `#F8F7F4` | 33–72 px gras | 3,23:1 | 3:1 | ✅ marge 0,23 |
| Libellé « PARTENAIRES » | `gold-ink-warm` `#96650D` sur `#F8F7F4` | 13 px gras | 4,71:1 | 4,5:1 | ✅ |
| Texte des cartes Méthode | bleu nuit 75 % | 15 px | 4,61:1 (pendant la transition) puis ≥ 7:1 | 4,5:1 | ✅ |

**Textes en dégradé** (calcul sur le stop le plus défavorable) :

- `rz-gradient-text` sur `#07172E` : le pire stop est `#D89F37`, à **7,63:1** ✅ ;
- sur le footer `#050F1F` : 8,16:1 ✅ ;
- `formations-gradient-text` : 7,63:1 ✅ ;
- `hero-gradient-text` : 7,63:1 ✅.

**Opacités de blanc sur bleu nuit utilisées** (toutes ✅ pour du texte courant) : 60 % = 6,98:1, 64 % = 7,78:1, 68 % = 8,69:1, 72 % = 9,61:1, 76 % = 10,56:1, 78 % = 11,11:1, 82 % = 12,18:1.

### C. Performance et chargement

**PERF-01 — LCP mobile au-dessus de la cible, retardé par l'animation d'entrée pilotée par JS** — Hero

- **Description.** L'élément LCP mobile est la légende du hero, rendue à `opacity: 0` au serveur : **2 851 ms de retard de rendu** sur 3 308 ms.
  - Médiane de 5 exécutions : LCP 3 376 ms.
  - Throttling appliqué : **5 118 ms**.
  - Le texte n'apparaît qu'après le téléchargement de 243 Kio de JS (gzip), son évaluation (4,1 s de thread principal en CPU ×4), l'hydratation, puis l'animation (délai de 0,6 s et durée de 0,45 s, `hero-slides.ts:61`).
- **Preuve.** Lighthouse `largest-contentful-paint-element` (`mobile-3`, `mobile-devtools`) ; `HeroCarouselText.tsx:183-199`.
- **Impact.** Core Web Vitals (classement Google), perception sur 4G.
- **Gravité** : **Majeur**. **Effort** : M (lié à ACC-01).
- **Correction.** Rendre la première légende et le h1 visibles dès le HTML (animation CSS d'opacité à partir de 1, ou aucune entrée pour l'élément LCP), et garder Motion pour les changements de diapositive seulement.
- **Validation.** LCP mobile ≤ 2,5 s en `--throttling-method=devtools`, médiane de 3.

**PERF-02 — Trop de JavaScript pour une page vitrine** — Global

- **Description.** 243,4 Kio de JS transférés (≈ 894 Ko bruts), dont :
  - chunk `1py18mvnmfoi4.js` (motion complet, `MotionConfig`, `layoutId`) : 54,3 Kio gzip ;
  - `43ab9gstha5ke.js` (composants des sections) : 43,7 Kio ;
  - `2od9uxm_fjm2m.js` : 44,6 Kio ;
  - React DOM et Next : 70,7 Kio.

  Lighthouse estime 51 Kio de JS inutilisé. TBT médian mobile 616 ms (plage 85 → 5 916). 29 fichiers `"use client"`. Motion est importé en entier (`motion`, pas `LazyMotion` + `m`) dans Header, CtaLink, Hero, SectionHeader, WordsTitle, GlassChip, Expertises et Méthode.
- **Preuve.** `weight.mjs` ; Lighthouse `unused-javascript`, `bootup-time` (`260lv0xr7-tdp.js` 1 020 ms, `1py18mvnmfoi4.js` 1 184 ms) ; `grep -rl '"use client"' src` (liste en annexe 4.6).
- **Impact.** Interactivité sur Android d'entrée de gamme, consommation de données.
- **Gravité** : **Majeur**. **Effort** : M à L.
- **Correction (par gain décroissant).**
  1. Remplacer les entrées Motion du Header et du Hero, `CtaLink` (`whileHover`, `whileTap`), `HeroScrollHint` (`useScroll` de fondu) et `SectionHeader` par du CSS. Le motif `data-js` + `fo-enter` est déjà en place ailleurs.
  2. Utiliser `LazyMotion` + `domAnimation` + `m` là où Motion reste utile (carrousel, Méthode).
  3. Charger à la demande les îlots sous la ligne de flottaison si le découpage le permet.
- **Budget proposé.** JS ≤ 170 Kio gzip au premier chargement (aujourd'hui 243) ; total ≤ 300 Kio hors images (aujourd'hui 352).
- **Validation.** `weight.mjs` : Script ≤ 170 Kio ; TBT médian mobile ≤ 200 ms.

**PERF-03 — HTML lourd et contenus rendus en double** — Global

- **Description.** HTML de 358 Ko brut (48 Ko gzip), dont :
  - 108 Ko de charge RSC ;
  - 100 `<svg>` en ligne et 516 attributs `style` ;
  - des contenus rendus plusieurs fois :
    - h1 × 3 (SEO-05) ;
    - les 5 domaines de Formations (accordéon desktop + panneaux mobiles, tous deux dans le DOM) ;
    - la FAQ complète (cartes + repli `<noscript>`) ;
    - deux logos (complet + monogramme) dans le header.

  DOM : 1 997 nœuds (Lighthouse signale au-delà de 1 400).
- **Preuve.** `curl` + analyse (`raw.html`) ; Lighthouse `dom-size`.
- **Impact.** Analyse et style (`styleLayout` 912 ms sur mobile), mémoire.
- **Gravité** : Mineur. **Effort** : M.
- **Correction.** Un seul DOM pour Formations (accordéon et onglets stylés selon le palier) ; motifs SVG répétés en `background-image` (déjà le cas pour `section-motif-tile`) plutôt qu'en `<svg>` en ligne ; h1 unique (ACC-05).
- **Validation.** DOM ≤ 1 400 nœuds ; HTML ≤ 35 Ko gzip.

**PERF-04 — Boucles d'animation actives hors écran** — Hero, sections

- **Description.** Les deux mesures ont été faites à 1440 px :
  - **en haut de page** : 52 animations infinies actives, 30 hors écran (`twinkle-soft` des Expertises, Formations, FAQ, Contact et Partenaires) ;
  - **en bas de page** : les 20 boucles du hero tournent toujours (scintillement × 16, balayage, anneau, point).

  Le hero n'a pas de pause hors écran, contrairement au motif des Expertises et aux sections pilotées par `data-paused`. Le SVG `animateMotion` (orbite) n'est jamais suspendu.
- **Preuve.** `results-structure.json` (`anim1440Top`, `anim1440Bottom`) ; `HeroMotif.tsx:93` ; `HeroVisual.tsx:104-107`.
- **Impact.** Batterie et CPU (animations d'opacité composées, coût faible mais permanent).
- **Gravité** : Mineur. **Effort** : S.
- **Correction.** Appliquer au hero et aux points des sections le mécanisme `data-paused` (IntersectionObserver + `visibilitychange`) déjà présent dans `SectionMotif` et `RealisationsController`.
- **Validation.** En bas de page : 0 animation infinie active hors écran.

**PERF-05 — Polyfills inutiles et CSS bloquant**

- **Description.**
  - 13,7 Kio de polyfills hérités (`Array.prototype.at`, `flat`, `flatMap`, `Object.fromEntries`, `Object.hasOwn`, `trimStart`/`trimEnd`).
  - CSS de 181 Ko brut / 29 Kio gzip bloquant le rendu (gain estimé de 320 ms sur mobile). `globals.css` fait 4 142 lignes.
- **Preuve.** Lighthouse `legacy-javascript`, `render-blocking-insight`.
- **Gravité** : Amélioration. **Effort** : S (browserslist) à M (CSS).
- **Correction.** Déclarer un `browserslist` moderne dans `package.json` après validation de la cible navigateur (annexe 3). Surveiller la taille du CSS : budget ≤ 25 Kio gzip.

**PERF-06 — Préchargement d'un logo masqué sur mobile**

- **Description.** L'en-tête `Link` précharge `logo.svg` et `logo-mark.svg` alors qu'un seul est visible selon la largeur (`loading="eager"` sur les deux).
- **Preuve.** `curl -I` (en-tête `link`) ; `Logo.tsx:26-41`.
- **Gravité** : Amélioration. **Effort** : S.
- **Correction.** `<picture>` avec `media`, ou ne précharger que le monogramme.

### D. SEO technique et local

**SEO-01 — Fichiers et balises d'indexation absents** — Global

- **Description.** `robots.txt` → 404, `sitemap.xml` → 404, pas de `<link rel="canonical">`, pas de `metadataBase`, pas d'`og:url`, pas d'`og:image`, `twitter:card` en `summary` sans image, pas de favicon ni d'icônes (`/favicon.ico` → 404), pas de manifeste.
- **Preuve.** `curl` (tableau en annexe 4.5) ; `layout.tsx:19-33`.
- **Impact.** Indexation, partage (aperçus LinkedIn, WhatsApp et Facebook sans image), onglet sans icône.
- **Gravité** : **Majeur**. **Effort** : S.
- **Correction.**
  - `src/app/robots.ts` et `src/app/sitemap.ts` (conventions App Router, à vérifier dans `node_modules/next/dist/docs/`) ;
  - `metadataBase: new URL("https://www.groupactivesolution.com")` (domaine à confirmer) et `alternates.canonical: "/"` ;
  - image sociale 1200 × 630 (annexe 1) ;
  - favicon à partir des fichiers officiels (annexe 3, ne pas les fabriquer).
- **Validation.** 200 sur `/robots.txt` et `/sitemap.xml` ; canonical présent ; débogueur de partage LinkedIn et Facebook avec image.

**SEO-02 — Migration : 11 URL du site actuel sans redirection** — Global, mise en ligne

- **Description.** Le sitemap public du site actuel liste 11 URL :
  - `/`, `/a-propos`, `/services`, `/ecole`, `/activites`, `/contact` ;
  - `/activites/atelier-drones-tme-education`, `/activites/atelier-informatique-ief-pikine`, `/activites/atelier-arduino-lycee-technique`, `/activites/formation-equipe-outils-digitaux`, `/activites/hackathon-inter-ecoles`.

  Sur la refonte, toutes renvoient 404 sauf `/`. Le site actuel redirige `groupactivesolution.com` vers `www.` (307), sert un canonical, du HSTS et une CSP.
- **Preuve.** `curl https://www.groupactivesolution.com/sitemap.xml` → `artefacts/mesures/anciennes-urls-sitemap.txt` ; `curl -D -` de l'ancien site.
- **Impact.** Perte des positions et des liens entrants accumulés.
- **Gravité** : **Bloquant** (pour la mise en ligne). **Effort** : S (une fois les destinations décidées).
- **Correction.** Table de redirections 301 dans `next.config.ts` (`redirects()`), par exemple :
  - `/services` → `/#expertises` (ou la future page) ;
  - `/a-propos` → future page ou `/#faq` ;
  - `/ecole` → `/#formations` ;
  - `/activites` et `/activites/*` → future page Réalisations (ou `/#realisations`) ;
  - `/contact` → `/#contact`.

  Les destinations sont à valider (annexe 3). Garder la redirection apex → `www` (permanente : 308 plutôt que 307).
- **Validation.** `curl -I` sur les 11 URL : 301 ou 308 vers une page en 200.

**SEO-03 — Titre et description sans localisation, en régression** — `<head>`

- **Description.**
  - Titre actuel : « Active Solution Digital Service » (**31 caractères**, ni mot-clé ni lieu).
  - Ancien titre : « Active Solution — Former, créer, transformer · Dakar, Sénégal » (61 caractères).
  - Description : 144 caractères, sans « Dakar » ni « Sénégal », sans appel à l'action.
- **Preuve.** `layout.tsx:15-24` ; `<title>` de l'ancien site (`curl`).
- **Gravité** : **Majeur**. **Effort** : S.
- **Correction.** Proposition à valider :
  - **Titre** (≈ 55–60 caractères) : « Active Solution — Formation numérique et digital à Dakar ».
  - **Description** (≈ 150 caractères) : « À Dakar, Active Solution forme aux métiers du numérique (robotique, programmation, IA), développe vos sites et applications et accompagne votre transformation digitale. »
- **Validation.** Titre de 50 à 60 caractères avec la marque et le lieu ; description de 140 à 160 caractères avec le lieu.

**SEO-04 — Données structurées incomplètes (régression)** — `<head>` et FAQ

- **Description.** Seul un `FAQPage` est publié : 6 questions « prêtes », les 6 « todo » sont correctement exclues. Le site actuel publie déjà `ProfessionalService` (avec `PostalAddress`) et `FAQPage`.
- **Preuve.** `Faq.tsx:70-73` ; `results-structure.json` (champ `jsonld`) ; analyse de l'ancien site (types `ProfessionalService`, `PostalAddress`, `Country`, `FAQPage`).
- **Gravité** : **Majeur**. **Effort** : S.
- **Correction.** Ajouter dans `layout.tsx` un JSON-LD généré **uniquement** depuis `src/lib/site.ts` :
  - `Organization` + `ProfessionalService` (ou `EducationalOrganization` si vous le validez) ;
  - `name` (« Active Solution Digital Service »), `url`, `logo` (`/logos/logo.png`), `telephone` (`SITE_CONTACT.phone`), `email` ;
  - `address` (`PostalAddress` : `streetAddress` « Liberté 1 », `addressLocality` « Dakar », `addressCountry` « SN ») ;
  - `sameAs` (les 4 URL de `SOCIALS`) ;
  - un `WebSite` avec `inLanguage: "fr"`.

  Ni horaires, ni avis, ni notes, ni prix, ni identifiant légal. Le `FAQPage` reste utile à la compréhension machine, même si Google n'affiche plus les résultats enrichis FAQ que pour une minorité de sites (restriction annoncée en 2023).
- **Validation.** Validator schema.org (validator.schema.org) et Rich Results Test sans erreur.

**SEO-05 — Texte du h1 et de certains titres dupliqué dans le HTML** — Hero, Méthode

- **Description.**
  - Le HTML serveur contient le h1 « Former les talents,Former les talents,Former les talents,créer les solutions,créer les solutions,transformer les organisations.transformer les organisations. » : calques de couleur et de reflet en `aria-hidden`, mais présents dans le texte, sans espace entre les lignes.
  - Le h2 de la Méthode donne « De l'idée à la solution.solution. » (reflet de `WordsTitle`).
  - Les h3 de la Méthode donnent « ComprendreÉtape 1 : Comprendre le besoin/01 ».
- **Preuve.** Extraction `<h1>` de `raw.html` ; `HeroCarouselText.tsx:97-111` ; `WordsTitle.tsx:59-74` ; `MethodeStepCard.tsx:17-23`.
- **Impact.** SEO (titre principal bruité) et GEO (extraction de texte brute par les robots IA).
- **Gravité** : **Majeur**. **Effort** : S à M.
- **Correction.** Calques décoratifs rendus en pseudo-éléments CSS (`content: attr(data-text)`) ou injectés côté client après l'hydratation ; espace réel entre les lignes du h1 (`{" "}`) ; h3 de la Méthode avec une seule forme textuelle.
- **Validation.** Le `textContent` de chaque titre contient sa phrase une seule fois, avec les espaces.

**SEO-06 — Cohérence NAP** — Contact, Footer, balisage

- **Constat** :
  - Nom : « Active Solution Digital Service » (header, alt, FAQ, footer, métadonnées). Le site actuel dit « Active Solution » ; l'URL LinkedIn dit « actives-solutions ».
  - Adresse : « Liberté 1, Dakar, Sénégal », identique dans Contact, Footer et le site actuel (FAQ : « Notre agence est basée à Liberté 1, Dakar, Sénégal »).
  - Téléphone : « +221 76 809 51 59 », identique dans Contact et Footer. Il n'apparaît pas en lien `tel:` sur l'accueil actuel, et `site.ts:5` le note « à confirmer ».
- **Preuve.** `site.ts:7-18` ; extraction de l'ancien site.
- **Gravité** : Mineur. **Effort** : S (vous).
- **Correction.** Arrêter un nom officiel unique (annexe 3), l'aligner sur Google Business Profile et les réseaux, et confirmer le numéro.

**SEO-07 — Requêtes cibles : couverture partielle, « Dakar » rarement associé aux services**

| Requête envisagée (sans bourrage) | Section qui y répond | État |
|---|---|---|
| Active Solution Dakar (marque) | Titre, FAQ 01, footer | ⚠️ le h1 ne nomme pas la marque |
| formation robotique Dakar | Formations (02 Robotique) | ⚠️ « Dakar » absent de la section |
| cours de programmation / code pour jeunes Dakar | Formations (01), Expertise 01 | ⚠️ idem |
| formation intelligence artificielle Sénégal | Formations (05) | ⚠️ idem |
| atelier Arduino / électronique / IoT Sénégal | Formations (03, 04) | ⚠️ « Arduino » absent (présent sur l'ancien site) |
| robotique éducative établissements scolaires Sénégal | Formations, « Pour qui ? » | ⚠️ partiel |
| création de site web Dakar | Expertise 02 (pastille « Sites web ») | ⚠️ une pastille, aucune phrase |
| développement d'application mobile Sénégal | Expertise 02 | ⚠️ idem |
| logiciel de gestion sur mesure Dakar | Expertise 02 (pastille) | ⚠️ idem |
| transformation digitale entreprises Sénégal | Expertise 03, FAQ 09 | ⚠️ partiel |
| formation des équipes aux outils numériques Dakar | Formations « Pour qui ? », Méthode 04 | ⚠️ partiel |

- **Gravité** : Mineur. **Effort** : M (contenu).
- **Correction.** Une phrase localisée par domaine (« … à Dakar et dans tout le Sénégal », si vous le confirmez), sans répétition artificielle ; à terme, une page par service.

**SEO-08 — Ancres stables et sans JS** — Conforme, avec une réserve

- **Constat.** `#expertises`, `#realisations`, `#methode`, `#formations`, `#faq`, `#contact`, `#partenaires`, `#expertise-*` et `#top` existent et fonctionnent sans JS (ancres natives), avec `scroll-margin-top`.
- **Réserve.** Les Expertises réécrivent le hash (`history.replaceState`) pendant le défilement (`ExpertisesScroller.tsx:204-228`). Ce n'est pas un problème SEO, mais une URL partagée après défilement contient `#expertise-…`.
- **Gravité** : Amélioration.

### E. GEO et moteurs de recherche IA

Niveau de preuve : **établi** (pratique documentée et mesurable), **probable** (consensus, effet non garanti), **spéculatif** (effet non démontré).

| ID | Pratique | État actuel (mesuré) | Impact attendu | Effort | Preuve |
|---|---|---|---|---|---|
| GEO-01 | Paragraphe de définition citable, « réponse d'abord », dans le 1er écran : qui, où, quoi, pour qui | **Absent.** La seule définition est la FAQ 01 (ouverte par défaut) et la meta description. Le h1 ne nomme pas l'entité. | Élevé | S | Probable |
| GEO-02 | Texte clé dans le HTML initial | ✅ Les textes de toutes les sections, de la FAQ (12 réponses, y compris les catégories masquées par `hidden`) et des 5 domaines de formation sont dans le HTML serveur. ⚠️ Mais hero, header et expertises sont à `opacity: 0` (ACC-01), et le h1 est dupliqué (SEO-05). | Élevé | M | Établi |
| GEO-03 | Balisage d'entité (`Organization`/`ProfessionalService`, `sameAs`) | Absent (SEO-04) | Moyen | S | Probable |
| GEO-04 | Couverture des questions (tableau ci-dessous) | 7 sur 15 couvertes | Élevé | contenu | Probable |
| GEO-05 | Signaux E-E-A-T : équipe, réalisations réelles, partenaires vérifiables, mentions légales | Équipe : absente. Réalisations : illustrations. Partenaires : noms sans lien. Mentions légales : absentes (pages non créées). | Élevé | contenu (L) | Probable |
| GEO-06 | Accès des robots IA | Pas de `robots.txt` : tout est autorisé par défaut, sans `Sitemap:` | Moyen | S | Établi |
| GEO-07 | `/llms.txt` | Absent (404) | Faible, non démontré | S | **Spéculatif** |
| GEO-08 | Cohérence multi-sources (nom, adresse, téléphone, réseaux) | Nom variable (SEO-06) ; `sameAs` absent | Moyen | S | Probable |
| GEO-09 | Performance suffisante pour l'exploration | HTML servi en 6–18 ms en local, 48 Ko gzip : ✅ (à remesurer en ligne) | Faible | — | Établi |
| GEO-10 | Pas de texte dans des images | ✅ Aucune image de texte ; le logo a un `alt` | — | — | Établi |

**Questions qu'un utilisateur poserait à un assistant IA, et où la page y répond :**

| Question | Réponse sur la page | État |
|---|---|---|
| Qu'est-ce qu'Active Solution ? | FAQ 01, meta description | ✅ (hors 1er écran) |
| Où est située l'entreprise ? | Badge « Dakar · Sénégal », Contact et Footer « Liberté 1, Dakar » | ✅ |
| Que fait-elle ? (3 domaines) | h1, Expertises, FAQ 02 | ✅ |
| Quelles formations ? | Section Formations (5 domaines), FAQ 04 | ✅ |
| Pour qui ? | « Pour qui ? » (Formations), « Idéal pour » (Expertises) | ✅ |
| Quels types de solutions développe-t-elle ? | Expertise 02, FAQ 07 | ✅ |
| Comment la contacter ? | Section Contact (téléphone, e-mail, WhatsApp, adresse, réseaux) | ✅ |
| Intervient-elle hors de Dakar ? | FAQ 03 : réponse neutre (le site actuel répond « dans tout le pays ») | ❌ à rédiger |
| Faut-il des prérequis pour les formations ? | FAQ 05 : réponse neutre | ❌ |
| Présentiel, en ligne, dans les établissements ? | FAQ 06 : réponse neutre | ❌ |
| Tarifs, devis ? | FAQ 10 : réponse neutre | ❌ |
| Délais ? | FAQ 11 : réponse neutre | ❌ |
| Suivi après livraison ? | FAQ 12 : réponse neutre (Méthode 04 en parle) | ⚠️ |
| Références, projets réalisés ? | Illustrations seulement | ❌ |
| Depuis quand existe-t-elle ? | Badge « Depuis 2021 », repris du site actuel, à confirmer | ⚠️ |

**Robots IA : options (décision business, que je ne prends pas) :**

| Option | Mise en œuvre (`robots.ts`) | Conséquences |
|---|---|---|
| A. Tout autoriser (état de fait aujourd'hui) | `User-agent: *` `Allow: /` + `Sitemap:` | Visibilité maximale dans ChatGPT Search (OAI-SearchBot), Perplexity, Claude, Gemini et AI Overviews ; contenu utilisable pour l'entraînement (GPTBot, ClaudeBot, Google-Extended, CCBot). |
| B. Recherche oui, entraînement non | `Allow` pour OAI-SearchBot, PerplexityBot, Googlebot ; `Disallow` pour GPTBot, Google-Extended, CCBot, ClaudeBot (à vérifier : la liste des agents évolue) | Visibilité dans les réponses avec citation, pas de réutilisation pour l'entraînement (pour les acteurs qui respectent `robots.txt`). |
| C. Tout bloquer côté IA | `Disallow` pour tous les agents IA | Absence probable des réponses génératives ; Google Search classique non affecté (Google-Extended ne touche pas l'indexation). |

`/llms.txt` : un fichier Markdown court (entité, services, contact, liens) coûte moins d'une heure. Aucun moteur majeur n'a confirmé l'utiliser : impact **non démontré**.

**À aligner hors du site** (je n'ai consulté que le site actuel, accessible) :

- Google Business Profile : nom, adresse « Liberté 1 », téléphone, catégorie, site, horaires réels.
- LinkedIn (`/company/actives-solutions/` : nom de la page à vérifier), Facebook, Instagram (`active_solution_groupe`), TikTok : même nom, même description d'une ligne, lien vers le nouveau site.
- Annuaires sénégalais éventuels, et les partenaires (lien retour depuis leurs sites si possible).

### F. Lisibilité

**LIS-01 — Typographie française : espaces insécables partiels, apostrophes droites**

- **Description.**
  - Dans le HTML rendu, 27 signes `? ! : ;` sont précédés d'une insécable (FAQ), mais **18** d'une espace ordinaire : risque de « : » ou « ? » seul en début de ligne. Exemples :
    - « sur le terrain : » ;
    - « Étape 1 : » ;
    - « une approche adaptée : » ;
    - « intelligence artificielle : » ;
    - « Pour qui ? » ;
    - « transformation digitale : » ;
    - « ne stocke rien : ».
  - 27 apostrophes droites (`'`) pour 1 typographique (`’`). Aucun guillemet dans les textes.
- **Preuve.** Extraction de `raw.html` ; `formations.ts:32,34` ; `methode.ts:45` ; `contact.ts:9,40` ; `realisations.ts:27`.
- **Gravité** : Mineur. **Effort** : S.
- **Correction.** Espace fine insécable (` `) avant `? ! ;`, insécable (` `) avant `:` dans tous les fichiers `src/lib/*.ts` ; apostrophe `’`. Une fonction utilitaire peut le faire au rendu.

**LIS-02 — Longueurs de ligne**

- **Description.** Les textes courants mesurent 38 à 64 caractères par ligne à 1440 et 1920 ✅. Deux exceptions :
  - le texte du bandeau Méthode (« Contactez-nous pour discuter… ») : **89 caractères** sur une ligne, à 1440 et à 1920 ;
  - la notice du formulaire (« Ce formulaire ne stocke rien… ») : **79 caractères** à 1920.

  Sur mobile, cartes Méthode et réponses FAQ : 22 à 27 caractères par ligne à 360 (colonne étroite à cause de la frise et des marges), lecture hachée.
- **Preuve.** `lines.mjs`.
- **Gravité** : Mineur. **Effort** : S.
- **Correction.** `max-w-[60ch]` sur le texte du bandeau et la notice. À 360, réduire le retrait de la frise Méthode (`pl-12`) et le padding gauche des réponses FAQ.

**LIS-03 — Niveau de lecture**

- **Estimation** (méthode approximative, syllabes comptées par groupes vocaliques) sur 46 paragraphes (621 mots) : 11,9 mots par phrase (court ✅), 2,45 syllabes par mot (vocabulaire technique). Indice Kandel-Moles ≈ 15, soit « difficile » ; c'est attendu pour un lexique technique (programmation, IoT, SaaS, embarqué).
- **Jargon non expliqué** : « IoT » (déplié une fois en « Internet des objets »), « SaaS », « plateformes métier », « systèmes embarqués », « digitalisation des processus ».
- **Phrases de plus de 25 mots** : aucune.
- **Ton** : vouvoiement cohérent.
- **Gravité** : Amélioration. **Correction.** Une brève explication de « SaaS » et « embarqué », ou des termes plus accessibles pour la cible « apprenants » et « établissements ».

**LIS-04 — Contraste perçu et confort**

- **Constat.**
  - Les sections sombres alternent avec les claires (rythme régulier : bleu nuit, clair, bleu nuit…), ce qui limite la fatigue.
  - Corps de texte sur fond sombre : 72 à 82 % de blanc (9,6 à 12,2:1), confortable.
  - Le motif zigzag derrière les textes est discret (opacités mesurées faibles), et l'espacement WCAG 1.4.12 ne provoque aucun texte rogné (0 élément à 390 et 1440).
- **Gravité** : conforme.

**LIS-05 — Grands écrans et zoom**

- **Constat.**
  - À 1920, la largeur du contenu est plafonnée (`max-w-site` 1684 px) et les lignes ne s'étirent pas ✅ (capture `viewport-1920-top.png`).
  - Reflow à 320 px (≈ 400 %) et 640/720 px (≈ 200 %) : aucun défilement horizontal de la page. Seules les rangées d'onglets Formations et FAQ défilent dans leur propre conteneur (acceptable).
- **Preuve.** `results-reflow.json`.
- **Gravité** : conforme.

### G. Navigation

**NAV-01 — Deux modèles de navigation concurrents**

- **Description.** Le header et le menu mobile envoient vers des **routes** (inexistantes) ; le footer envoie vers des **ancres** de la page d'accueil, qui fonctionnent. Le footer documente lui-même ce choix (`footer.ts:5-8`).
- **Gravité** : **Bloquant** (même cause que UX-01). **Effort** : S.
- **Correction.** Voir UX-01. Décider de la cible : page unique avec ancres maintenant, pages dédiées plus tard.

**NAV-02 — Pages promises ou suggérées mais inexistantes**

- `/services`
- `/realisations`
- `/formations`
- `/a-propos`
- `/contact`
- `/cgu`, `/mentions-legales`, `/politique-de-confidentialite` : non rendues, prévues dans `footer.ts:32-36`
- `/partenaires` : carte « +N », inerte au-delà de 12 partenaires
- page de détail des projets (`realisationsIntro.link`)

**NAV-03 — Parcours jusqu'au contact**

- **Mesures.**
  - **Desktop.** Le bouton du header (1 action) mène aujourd'hui à une 404. Le chemin qui marche passe par le bas de la page : bandeau Méthode « Nous contacter » (`#contact`), ou défilement, puis le formulaire. En tout : 1 clic pour arriver au formulaire + 5 actions de remplissage (besoin, nom, message, envoyer, valider WhatsApp).
  - **Mobile.** Menu, puis « Parlons de votre projet » : 404. Le bouton WhatsApp de l'aside FAQ (1 action) fonctionne, mais il est à environ 9 300 px (390).
- **Chemins par cible.**
  - Entreprise : hero → Expertises 02/03 (liens en 404) → Méthode → Contact.
  - École : Formations → « Pour qui ? » → bouton (404).
  - Apprenant : Formations → bouton (404).

  **Aucune cible n'a un parcours sans impasse aujourd'hui.**
- **Gravité** : **Bloquant** (même cause que UX-01).
- **Correction.** Après UX-01 : chaque bouton « parler / contacter » mène à `#contact`. Ajouter un accès WhatsApp ou contact constant sur mobile, par exemple dans le menu (bouton déjà présent mais cassé).

**NAV-04 — Robustesse**

- **Clavier seul** : 68 arrêts de tabulation en desktop, 62 en mobile, ordre cohérent sauf ACC-10, aucun piège. Le menu mobile :
  - garde le focus dans le dialog (le passage par l'interface du navigateur est le comportement natif) ;
  - se ferme avec Échap ;
  - rend le focus au bouton ;
  - met à jour `aria-expanded` ;
  - bloque le défilement (`html:has(dialog[open]:modal)`).
- **Toucher** : les effets de survol ont des équivalents tactiles (tuile active, carte de partenaire active par bande de lecture).
- **Sans JS** : les ancres fonctionnent, mais le premier écran est vide (ACC-01).
- **Retour arrière et hash** : les ancres natives conservent l'historique. La réécriture du hash par les Expertises utilise `replaceState`, donc sans entrée d'historique (correct).
- **Défilement doux** : désactivé en mouvement réduit (`globals.css:506-521`) ✅. « Retour en haut » met ensuite le focus sur `#top` ✅.

**NAV-05 — Cartographie complète des liens** : annexe 4.1.

### H. Bonnes pratiques complémentaires

**BP-01 — En-têtes de sécurité absents, `X-Powered-By` exposé**

- **Description.** `next start` ne renvoie ni CSP, ni HSTS, ni `X-Content-Type-Options`, ni `Referrer-Policy`, ni `Permissions-Policy`, ni `frame-ancestors`. En revanche, il envoie `X-Powered-By: Next.js`. Le site actuel (Vercel) sert une CSP stricte et HSTS `preload` : **risque de régression** si l'hébergement change.
- **Preuve.** `curl -sI localhost:3100/` ; `curl -D - https://www.groupactivesolution.com/`.
- **Gravité** : **Majeur** (avant mise en ligne). **Effort** : S.
- **Correction.**
  - `poweredByHeader: false` et `headers()` dans `next.config.ts` : `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy: camera=(), microphone=(), geolocation=()`, `X-Frame-Options: DENY` (ou `frame-ancestors 'none'`).
  - HSTS au niveau de l'hébergeur.
  - CSP à construire en fonction de Next (scripts en ligne de RSC : nonce ou `'unsafe-inline'`, à valider).

**BP-02 — Secrets, traceurs, consentement**

- **Constat.** Aucune variable d'environnement, aucun `NEXT_PUBLIC_*`, aucun fichier `.env` (`grep`). Aucun script tiers, cookie ni outil d'analyse. Aucun consentement n'est donc requis aujourd'hui. Le site actuel charge Vercel Analytics : décider si vous le reprenez (annexe 3).
- **Gravité** : conforme.

**BP-03 — Console et hydratation**

- **Constat.** Aucun avertissement React ni erreur d'hydratation sur les pages mesurées. Il y a 11 erreurs console, toutes des 404 réseau (favicon + préchargements RSC, voir UX-01).
- **Gravité** : Mineur (disparaît avec UX-01 et SEO-01).

**BP-04 — Propreté du code et dérive du design system**

- **Constat.**
  - Aucun `console.log`.
  - 6 `TODO(contenu)` (`faq.ts:74,89,91,134,136,138`).
  - Aucun fichier orphelin dans `src/components`, `src/lib` ou `src/hooks`.
  - Un hex en dur : `themeColor: "#07172e"` (`layout.tsx:36`), inévitable dans `viewport` mais en doublon du token.
  - **Rayons arbitraires** hors tokens : `rounded-[14px]` ×3, `[17px]`, `[18px]` ×4, `[20px]` ×3, `[1.25rem]`.
  - **104 tokens `--text-*`** dans `globals.css`, contre environ 25 décrits dans `CLAUDE.md`.
  - **4 classes de texte en dégradé** proches : `hero-gradient-text`, `rz-gradient-text`, `formations-gradient-text`, `gold-ink-text` (deux définitions, `globals.css:1499` et `:3006`).
  - **6 variantes du bouton doré principal** : hauteurs 45, 48, 52, 54, 56 px ; `rounded-full`, sauf Contact en `rounded-2xl` ; `text-sm` ou `text-base`.
- **Preuve.** `grep` (dans le rapport) ; `HeroCarouselText.tsx:212` ; `CtaLink.tsx:25` ; `MethodeCta.tsx:121` ; `Formations.tsx:70` ; `FaqAside.tsx:48` ; `globals.css:2885` (`.ct-primary`).
- **Gravité** : Mineur. **Effort** : M.
- **Correction.**
  - Un composant `Button` (variantes `primary`, `outline`, `ghost` ; tailles `md` 48 et `lg` 56).
  - Tokens `--radius-card` (18–20 px) et `--radius-field` (14 px).
  - Réduire les tokens de texte aux usages réels.

**BP-05 — Métadonnées de partage** : voir SEO-01 (pas d'image ni d'URL ; `og:locale` `fr_SN` ✅).

---

## 4. Points conformes (avec preuve)

| Domaine | Point | Preuve |
|---|---|---|
| Mise en page | CLS = 0,000 sur les 10 exécutions Lighthouse et dans les mesures navigateur | `lh-summary.md` |
| Mise en page | Aucun défilement horizontal de 320 à 1920 px | `results-reflow.json`, recensement |
| A11y | `lang="fr"`, un seul `<main>`, un seul h1, hiérarchie h2/h3 sans saut, aucun id dupliqué | `results-structure.json` |
| A11y | Focus visible partout : contour de 2 px, doré sur fond sombre, bleu nuit sur fond clair ; accordéon Formations via le parent (`has-[]`) | `results-keyboard.json`, `globals.css:482-485` |
| A11y | Onglets FAQ et Formations : `role="tablist"`/`tab`/`tabpanel`, roving tabindex, flèches, Home/End ; accordéons `aria-expanded`/`aria-controls`, réponses fermées en `inert` | code (`FaqTabs.tsx`, `FormationsTabs.tsx`, `FormationsAccordion.tsx`, `FaqItem.tsx`) et parcours clavier |
| A11y | Menu mobile `<dialog>` : piège, Échap, retour du focus, `aria-expanded`, défilement bloqué | `results-keyboard.json` (`mobileMenu`) |
| A11y | Carrousel : pause manuelle, pause au survol et au focus, pas de lecture automatique en mouvement réduit, `aria-live` adapté | `useHeroCarousel.ts:78-114`, `HeroVisual.tsx:113,193-209` |
| A11y | Mouvement réduit : 0 animation active (390 et 1440), fondus de remplacement de 150–200 ms en WAAPI | `results-reduce.json` |
| A11y | Formulaire : labels associés, `legend`, `autocomplete="name"`, `aria-invalid` + `aria-describedby`, focus sur la première erreur, résumé `role="alert"`, confirmation `role="status"`, repli sans JS | `ContactForm.tsx:118-217`, `Contact.tsx:84-104` |
| A11y | Liens externes : `target=_blank` + `rel="noopener noreferrer"` + « (nouvel onglet) » dans le nom accessible | tableau des liens |
| A11y | Réseaux sans URL rendus en `span aria-disabled` (mécanisme prêt, non utilisé aujourd'hui car les 4 URL sont renseignées) | `Footer.tsx`, `Contact.tsx:65-72` |
| A11y | Espacement du texte (1.4.12) : 0 texte rogné | `results-reflow.json` |
| A11y | Contrastes des textes courants sur fond sombre (6,98 à 13,4:1) et des dégradés dorés sur bleu nuit (≥ 7,63:1) | section B.3 |
| Perf | Police : un seul fichier variable Manrope de 24 Kio, préchargé (en-tête `Link`), `display: swap`, sous-ensemble latin | `curl -I`, réseau |
| Perf | Cache : `/_next/static` en `public, max-age=31536000, immutable` ; HTML compressé en gzip ; rechargement à chaud de 1,1 Kio | `curl`, `weight.mjs` |
| Perf | Aucun script tiers | réseau |
| Perf | Images : `next/image`, dimensions explicites ; `preload` réservé à la 1re image du hero ; images suivantes préchargées après coup ; images des Réalisations différées | `HeroVisual.tsx:146-156`, `RealisationsScene.tsx` |
| SEO | HTML rendu au serveur (page statique) ; textes de toutes les sections et réponses FAQ présents dans le HTML brut | `raw.html` |
| SEO | `FAQPage` limité aux réponses rédigées | `faq.ts:162-174` |
| Contenu | Aucune coordonnée en dur hors de `site.ts`, aucun partenaire non confirmé affiché, réalisations étiquetées « Illustration » | code, captures |

---

## 5. À vérifier après mise en ligne

1. **Search Console et Bing Webmaster Tools** : propriété du domaine, envoi du sitemap, couverture de l'index, rapports de redirection (11 anciennes URL).
2. **Données terrain Core Web Vitals** (CrUX, PageSpeed Insights) après 28 jours de trafic ; INP réel (non mesurable en laboratoire).
3. **TTFB réel** selon l'hébergeur (cible ≤ 800 ms depuis Dakar) ; présence de Brotli.
4. **En-têtes de sécurité** effectivement servis (securityheaders.com, Mozilla Observatory) ; HSTS.
5. **Indexation de la page d'accueil** : contenu indexé, extrait choisi par Google, titre réécrit ou non.
6. **Google Business Profile** : création ou mise à jour, catégorie, NAP identique au site.
7. **Aperçus de partage** : LinkedIn Post Inspector, débogueur Facebook, WhatsApp.
8. **Liens entrants et positions** avant et après la migration (outil de suivi au choix).
9. **Lecteurs d'écran réels** : NVDA + Firefox (Windows) et VoiceOver + Safari (iOS) sur hero, FAQ, Formations, formulaire.
10. **Appareil Android d'entrée de gamme réel** en 4G à Dakar : LCP et réactivité perçus.
11. **Mode contraste élevé de Windows réel** (l'émulation Chrome reste une approximation).

---

## Annexe 1 — Images attendues

Spécifications reprises du code quand elles y figurent.

| # | Section | Rôle | Fichier attendu | Ratio / taille cible | Format, poids | Texte alternatif à prévoir (actuel, à adapter) |
|---|---|---|---|---|---|---|
| 1 | Hero, état 01 | Visuel « Éducation numérique » (candidat LCP sur desktop une fois fourni) | `public/hero/education.webp` | 4:3, ≈ 1200 × 900 (`hero-slides.ts:10`) ; affiché jusqu'à 620 px de large | WebP < 150 Ko | « Apprenants en séance de formation au numérique » (`hero-slides.ts:24`) |
| 2 | Hero, état 02 | « Développement digital » | `public/hero/developpement.webp` | idem | idem | « Développement d'une application web et mobile » |
| 3 | Hero, état 03 | « Transformation digitale » | `public/hero/transformation.webp` | idem | idem | « Équipe accompagnée dans sa transformation digitale » |
| 4 | Expertises 01 | Photo du bloc Formations | `public/expertises/education.webp` | 1:1, 1600 × 1600, sujet centré (`expertises.ts:85`) | WebP < 220 Ko | « Jeunes apprenants en atelier de programmation et de robotique » |
| 5 | Expertises 02 | Développement digital | `public/expertises/developpement.webp` | idem | idem | « Interface d'application web et mobile en cours de développement » |
| 6 | Expertises 03 | Transformation digitale | `public/expertises/transformation.webp` | idem | idem | « Équipe accompagnée dans l'adoption de nouveaux outils numériques » |
| 7–12 | Réalisations, projets 1 à 3 | 2 photos par projet (le mode « scène » s'active quand les 6 sont présentes) | `public/realisations/projet-{1,2,3}-{a,b}.webp` | 5:3, 2000 × 1200 (`realisations.ts:5`) | WebP < 200 Ko | à rédiger par projet (aujourd'hui « [Texte alternatif à valider] ») |
| 13–17 | Partenaires | Logos officiels (IISAN, 10HTech, Simplon, MondialeHome, ODC) | `public/partners/<id>.svg` (ou `.png`/`.webp`) | hauteur affichée ≤ 44 px, largeur ≤ 140 px | SVG de préférence, fond transparent | nom du partenaire (champ `logoAlt`) |
| 18 | Partage social | Image Open Graph / Twitter | `src/app/opengraph-image.png` ou `public/og.jpg` | 1200 × 630 | JPG/PNG < 300 Ko, texte lisible en petit | « Active Solution Digital Service — formation numérique, développement et transformation digitale à Dakar » |
| 19 | Onglet, écran d'accueil mobile | Favicon et icônes | `src/app/favicon.ico`, `icon.png` (512), `apple-icon.png` (180) | carrés | à partir du **monogramme officiel** fourni par vous (ne pas fabriquer) | — |
| 20 | (option) Page À propos / équipe | Photos d'équipe | à définir | à définir | WebP | nom et rôle de chaque personne |

Rappels : une photo n'est utilisée que dans une seule section, et il ne faut jamais committer d'images de test (`CLAUDE.md`).

---

## Annexe 2 — Contenus provisoires à remplacer avant publication

| # | Emplacement | Élément provisoire | Visible en production ? | Risque de tromperie |
|---|---|---|---|---|
| 1 | Hero, visuel (×3 états) | « Image à fournir » + chemin `public/hero/….webp` | **Oui** (capture `s-1440-00-hero.png`) | Fort : expose un chemin technique. À remplacer impérativement (images de l'annexe 1). |
| 2 | Expertises, visuel | Composition graphique (icône + grand numéro) | Oui | Faible (graphique honnête, pas une fausse photo) |
| 3 | Réalisations | 3 tuiles « Illustration » ; noms `[Nom du projet à valider]`, légendes `[Légende à valider]`, alt `[Texte alternatif à valider]` (non affichés en mode bento) | Tuiles oui, crochets non | Faible : clairement étiquetées. Mais la section n'apporte aucune preuve réelle (UX-09). |
| 4 | FAQ 03, 05, 06, 10, 11, 12 | Réponse neutre « Chaque situation est différente. Contactez-nous pour en discuter. » | **Oui** | Moyen : l'onglet « Collaboration » n'a aucune réponse réelle. |
| 5 | Partenaires | Orthographe de « MondialeHome » et nom complet d'« ODC » à valider ; aucun logo, aucun lien | Oui | Faible |
| 6 | Hero, badge | « Depuis 2021 » (repris du site actuel) | Oui | À confirmer (chiffre) |
| 7 | `site.ts` | Numéro WhatsApp « à confirmer » (`site.ts:5`) | Oui (WhatsApp, téléphone) | Fort si le numéro n'est pas joignable sur WhatsApp |
| 8 | Footer | Liens légaux (CGU, mentions légales, confidentialité) non rendus : pages absentes | Non | Pages à créer ; contenu juridique à fournir |
| 9 | `src/lib/realisations.ts`, `formations.ts`, `faq.ts`, `contact.ts`, `partners.ts`, `footer.ts`, `site.ts` | En-tête « CONTENU PROVISOIRE : rédaction en cours » | Non (commentaire) | Textes à valider par vous |
| 10 | Méthode | « Textes à valider par Active Solution » (`methode.ts:3`) | Oui | Faible |
| 11 | Expertises | « Destinations à confirmer : /formations et /services n'existent pas encore » (`expertises.ts:30`) | Liens oui (404) | Voir UX-01 |

---

## Annexe 3 — Informations et décisions dont j'ai besoin

1. **Domaine final** : `www.groupactivesolution.com` conservé ? (`metadataBase`, canonical, sitemap, redirection apex → www).
2. **Anciennes URL** : je les ai relevées dans le sitemap public (11 URL, `anciennes-urls-sitemap.txt`). Il me faut :
   - (a) la confirmation qu'il n'y en a pas d'autres (Search Console de l'ancien site, ou export d'URL) ;
   - (b) la destination de chacune (page à créer ou ancre) ;
   - (c) si les 5 pages `/activites/*` (atelier drones TME Education, atelier informatique IEF Pikine, atelier Arduino lycée technique, formation équipe outils digitaux, hackathon inter-écoles) peuvent devenir les **Réalisations** réelles, avec photos et textes validés.
3. **Pages à créer ou non** : Services, Réalisations, Formations, À propos, Contact (ou page unique avec ancres pour l'instant).
4. **Pages légales** : contenu des mentions légales (raison sociale, forme, siège, responsable de publication, hébergeur) et de la politique de confidentialité (WhatsApp, e-mail). La loi sénégalaise n° 2008-12 sur les données personnelles s'applique sans doute ; à faire confirmer par votre conseil.
5. **Nom officiel unique** : « Active Solution Digital Service », « Active Solution » ou « Groupe Active Solution » ? Et pour le domaine 1 : « Formations », « Éducation numérique » ou « Formation numérique » ?
6. **Numéro WhatsApp** confirmé ; e-mail `contact@groupactivesolution.com` actif ; « Depuis 2021 » confirmé.
7. **Partenaires** : logos officiels, sites vérifiés, orthographe (MondialeHome) et nom complet (ODC).
8. **Réponses FAQ manquantes** (6) ; le site actuel dit « nous intervenons dans tout le pays » : à confirmer pour la FAQ 03.
9. **Robots IA** : option A, B ou C (section E) ; souhaitez-vous un `/llms.txt` ?
10. **Analyse d'audience** : reprendre Vercel Analytics (actuel, sans cookie), un autre outil, ou rien ? Cela conditionne le consentement.
11. **Hébergement visé** (Vercel ou autre) : en-têtes de sécurité, Brotli, cache.
12. **Navigateurs cibles** (pour le `browserslist` de PERF-05).
13. **Fichiers officiels** pour le favicon et les icônes (annexe 1, n° 19).
14. **Budget doré du premier écran** (UX-07) : quelle option retenez-vous ?
15. **Pause des animations** (ACC-09) : interrupteur global ou arrêt automatique après 5 s ?

---

## Feuille de route (3 lots, à valider)

### Lot 1 — Bloquants et gains rapides (≈ 1 à 2 jours, aucune dépendance de contenu sauf indication)

Ordre recommandé :

1. **UX-01 / NAV-01 / NAV-03** : tous les liens internes vers des ancres existantes (ou retrait d'« À propos »). Cela supprime aussi les erreurs console (BP-03, PERF-05 partiel).
2. **UX-02** : page 404 en français.
3. **SEO-03** : titre et description (textes à valider).
4. **SEO-01** : `robots.ts`, `sitemap.ts`, `metadataBase`, canonical, Open Graph. *Dépend du domaine (Q1) et de l'image sociale (annexe 1, n° 18, possible plus tard).*
5. **SEO-04** : JSON-LD `Organization`/`ProfessionalService` + `WebSite` depuis `site.ts`. *Dépend du nom officiel (Q5).*
6. **SEO-02** : redirections 301. *Dépend de Q2.*
7. **ACC-02** : opacité des pastilles des Expertises.
8. **ACC-03, ACC-04, ACC-06, ACC-08, ACC-11** : cibles des points du hero, lien d'évitement, `aside`, nom « Défiler », `scroll-padding-top`.
9. **BP-01** : `poweredByHeader: false` et en-têtes de sécurité de base. *Dépend de l'hébergeur (Q11) pour HSTS et CSP.*

### Lot 2 — Majeurs (≈ 3 à 5 jours)

1. **ACC-01 + PERF-01** (même chantier) : Header, Hero et Expertises visibles sans JS. Entrées passées au motif CSS `data-js`, légende LCP jamais à `opacity: 0`. *Prérequis de PERF-02.*
2. **PERF-02** : allègement de Motion (CSS pour les entrées et survols, `LazyMotion` ailleurs) ; budget JS ≤ 170 Kio gzip.
3. **SEO-05 + ACC-05** : h1 en texte unique, commandes du carrousel séparées ; calques décoratifs hors du texte des titres.
4. **UX-03 / GEO-01** : phrase de définition dans le hero. *Dépend du texte validé.*
5. **ACC-09** : mécanisme de pause des animations. *Dépend du choix (Q15).*
6. **ACC-12** : contraste forcé (bordures transparentes, onglet actif).
7. **UX-09 / GEO-04 / GEO-05** : intégration du contenu fourni (FAQ, réalisations, logos). *Dépend de vous (annexes 2 et 3).*

### Lot 3 — Améliorations (au fil de l'eau)

- UX-04, UX-05 (libellés et nom canonique), UX-06 (longueur mobile, visuels collants), UX-07 (budget doré), UX-08 (secours du formulaire), UX-10 (suivi de section dans le header).
- PERF-03 (DOM et HTML), PERF-04 (pause hors écran), PERF-05 (polyfills, budget CSS), PERF-06 (préchargement des logos).
- LIS-01 (insécables, apostrophes), LIS-02 (longueurs de ligne), LIS-03 (jargon), ACC-07, ACC-10, ACC-13.
- BP-04 (composant `Button`, tokens de rayon et de texte).
- GEO-06 / GEO-07 (`robots.txt` selon la décision, `/llms.txt` optionnel), SEO-07 (formulations localisées).

**Dépendances clés** :

- ACC-01 précède PERF-01 et PERF-02.
- UX-01 précède UX-10.
- SEO-01, SEO-02 et SEO-04 attendent le domaine et le nom officiel.
- Le contenu (annexes 2 et 3) conditionne UX-09, GEO-04, GEO-05 et le passage des Réalisations en mode « scène ».

---

## Annexe 4 — Relevés détaillés

### 4.1 Cartographie de tous les liens (1440 px, DOM complet, y compris le menu mobile)

| Section | Destination | Libellé ou nom accessible | Type | Statut |
|---|---|---|---|---|
| header | `/` | logo (alt « Active Solution Digital Service ») | interne | 200 |
| header | `/` | Accueil | interne | 200 |
| header | `/services` | Nos services | interne | **404** |
| header | `/realisations` | Réalisations | interne | **404** |
| header | `/formations` | Formations | interne | **404** |
| header | `/a-propos` | À propos | interne | **404** |
| header | `/contact` | Parlons de votre projet | interne | **404** |
| menu mobile | `/` | Accueil | interne | 200 |
| menu mobile | `/services` | Nos services | interne | **404** |
| menu mobile | `/realisations` | Réalisations | interne | **404** |
| menu mobile | `/formations` | Formations | interne | **404** |
| menu mobile | `/a-propos` | À propos | interne | **404** |
| menu mobile | `/contact` | Parlons de votre projet | interne | **404** |
| hero | `/services` | Découvrir nos services | interne | **404** |
| hero | `/contact` | Parlons de votre projet | interne | **404** |
| hero | `#expertises` | Aller à la section suivante (« Défiler ») | ancre | OK |
| expertises | `/formations` | Découvrir les programmes | interne | **404** |
| expertises | `/services#developpement` | Découvrir nos solutions | interne | **404**, ancre absente |
| expertises | `/services#transformation` | Transformer votre organisation | interne | **404**, ancre absente |
| methode | `#contact` | Nous contacter | ancre | OK |
| formations | `/formations` | Découvrir nos formations | interne | **404** |
| faq | `https://wa.me/221768095159?text=…` | Écrire sur WhatsApp (s'ouvre dans un nouvel onglet) | externe, `_blank` + `noopener noreferrer` | — |
| faq | `/contact` | Nous contacter | interne | **404** |
| contact | `tel:+221768095159` | +221 76 809 51 59 | tel | — |
| contact | `mailto:contact@groupactivesolution.com` | contact@groupactivesolution.com | mailto | — |
| contact | Google Maps (`search/?api=1&query=Liberté 1, Dakar, Sénégal`) | Ouvrir l'adresse dans Google Maps (nouvel onglet) | externe | — |
| contact | Google Maps (idem) | Voir sur Maps (nouvel onglet) | externe | — |
| contact | `https://www.linkedin.com/company/actives-solutions/` | LinkedIn (nouvel onglet) | externe | non vérifié (hors périmètre) |
| contact | `https://www.facebook.com/share/1HX8JAow32/` | Facebook (nouvel onglet) | externe | non vérifié |
| contact | `https://www.instagram.com/active_solution_groupe` | Instagram (nouvel onglet) | externe | non vérifié |
| contact | `https://vm.tiktok.com/ZS9UKhCFqLhBk-yJHdC/` | TikTok (nouvel onglet) | externe | non vérifié |
| contact (sans JS) | `https://wa.me/…` | Écrire sur WhatsApp | externe | — |
| contact (sans JS) | `mailto:…` | Écrire par e-mail | mailto | — |
| footer | LinkedIn, Facebook, Instagram, TikTok (mêmes URL) | « … (nouvel onglet) » | externe | non vérifié |
| footer | `/#expertise-education` | Éducation numérique | ancre | 200 + ancre OK |
| footer | `/#expertise-developpement` | Développement digital | ancre | OK |
| footer | `/#expertise-transformation` | Transformation digitale | ancre | OK |
| footer | `/#realisations` | Réalisations | ancre | OK |
| footer | `/#methode` | Méthode | ancre | OK |
| footer | `/#formations` | Formations | ancre | OK |
| footer | `/#faq` | FAQ | ancre | OK |
| footer | `/#contact` | Contact | ancre | OK |
| footer | `tel:+221768095159` | +221 76 809 51 59 | tel | — |
| footer | `mailto:contact@groupactivesolution.com` | contact@groupactivesolution.com | mailto | — |
| footer | Google Maps | Liberté 1, Dakar, Sénégal (nouvel onglet) | externe | — |
| footer | `#top` | Retour en haut | ancre | OK |

Aucun `href="#"` ni lien vide. Les réseaux sociaux n'ont pas été appelés (pages de connexion, et appels vers des tiers hors périmètre) : à vérifier à la main.

### 4.2 Hauteur des sections (px)

| Largeur | Hero | Expertises | Réalisations | Méthode | Formations | FAQ | Contact | Partenaires | Footer | **Total** |
|---|---|---|---|---|---|---|---|---|---|---|
| 360 | 989 | 2 096 | 1 275 | 1 915 | 1 836 | 1 214 | 1 880 | 958 | 1 024 | **13 187** |
| 390 | 973 | 2 068 | 1 310 | 1 889 | 1 827 | 1 187 | 1 722 | 958 | 1 024 | **12 959** |
| 768 | 1 126 | 2 247 | 1 195 | 1 828 | 1 594 | 1 019 | 1 505 | 938 | 1 045 | **12 496** |
| 1024 | 804 | 2 255 | 1 162 | 1 212 | 1 642 | 943 | 1 054 | 783 | 1 045 | **10 901** |
| 1440 | 804 | 2 306 | 1 192 | 1 362 | 1 289 | 944 | 1 054 | 897 | 631 | **10 479** |
| 1920 | 804 | 2 284 | 1 192 | 1 456 | 1 439 | 944 | 976 | 907 | 631 | **10 633** |

Rythme mesuré : bleu nuit (hero) → clair (Expertises) → bleu nuit (Réalisations) → clair (Méthode) → bleu nuit (Formations) → clair (FAQ) → bleu nuit (Contact) → clair (Partenaires) → bleu nuit profond (footer). L'alternance est respectée.

### 4.3 Ordre de tabulation (1440, extrait des 68 arrêts)

Header (7) → Hero (lignes du h1 × 3, 2 boutons, pause, « Défiler ») → Expertises (nœud + lien × 3) → Méthode (nœuds × 4, « Nous contacter ») → Formations (volets × 5, bouton) → FAQ (onglet actif, 3 questions, WhatsApp, « Nous contacter ») → Contact (téléphone, copier, e-mail, copier, Maps × 2, réseaux × 4, radio « Formation », nom, message, WhatsApp, e-mail) → Footer (réseaux × 4, services × 3, navigation × 5, téléphone, e-mail, adresse, « Retour en haut »).

Aucun focus masqué en desktop. En mobile : voir ACC-10 et ACC-11. Détail complet : `results-keyboard.json`.

### 4.4 Textes de moins de 14 px (390 et 1440)

| Taille | Casse | Espacement | Graisse | Occurrences | Exemples |
|---|---|---|---|---|---|
| 10,5 px | capitales | 1,47 px | 700 | 3 | « Illustration » |
| 11 px | capitales | 2,2 px | 600 | 3 | « Idéal pour » |
| 11 px | capitales | 1,54 px | 700 | 3 | domaines des tuiles de Réalisations |
| 11,5 px | capitales | 1,61 px | 700 | 7 | Téléphone, E-mail, Adresse, Suivez-nous, Votre besoin, Votre nom |
| 11,5 px | capitales | 1,84 px | 700 | 2 | Services, Navigation (footer) |
| 12 px | normale | 0,48 px | 500–600 | 4 | badge : Dakar, Sénégal, Depuis 2021 |
| 12 px | capitales | 2,16 px | 600 | 5 | Nos expertises, Réalisations, Notre méthode, Formations, FAQ |
| 12 px (390) / 13 px (1440) | normale | — | 400 | 17–18 | pastilles des Expertises |
| 12 px | normale | 0,48 px | 800 | 5 | numéros 01–05 (Formations) |
| 13 px | capitales | 2,08–2,34 px | 600–700 | 3 | Pour qui ?, Contact, Partenaires |
| 13 px | normale | — | 400 | 4 | notice du formulaire, copyright |
| 13,5 px | normale | — | 600 | 4–15 | pastilles Formations, e-mail (contact) |

### 4.5 Réponses HTTP (serveur de production local)

| URL | Statut | Remarque |
|---|---|---|
| `/` | 200 | gzip, `Cache-Control: s-maxage=86400, stale-while-revalidate=518400`, `X-Powered-By: Next.js` |
| `/robots.txt` | 404 | |
| `/sitemap.xml` | 404 | |
| `/favicon.ico` | 404 | |
| `/manifest.webmanifest` | 404 | |
| `/llms.txt` | 404 | |
| `/services`, `/contact`, `/formations`, `/realisations`, `/a-propos`, `/cgu` | 404 | page par défaut, en anglais |
| `/_next/static/*` | 200 | `public, max-age=31536000, immutable` |

### 4.6 Composants `"use client"` (29) et potentiel de conversion

| Fichier | Besoin réel du client | Peut devenir serveur ou CSS ? |
|---|---|---|
| `layout/Header.tsx` | défilement (ombre, barre de progression), soulignement animé (`layoutId`) | partiellement : entrée et ombre en CSS (scroll-driven), garder un petit îlot |
| `layout/CtaLink.tsx` | `whileHover`/`whileTap` seulement | **oui** (CSS) |
| `layout/MobileMenu.tsx` | `dialog`, état | non |
| `hero/HeroStage.tsx`, `HeroCarouselText.tsx`, `HeroVisual.tsx` | carrousel, parallaxe | partiellement (entrées en CSS) |
| `hero/HeroMotif.tsx` | parallaxe pointeur et défilement | partiellement |
| `hero/HeroScrollHint.tsx` | fondu au défilement | **oui** (CSS `animation-timeline: scroll()` avec repli) |
| `ui/SectionHeader.tsx`, `ui/WordsTitle.tsx` | entrée au défilement | **oui** (motif `data-js` + CSS) |
| `ui/GlassChip.tsx` | bascule animée du libellé | partiellement |
| `expertises/*` (4) | bloc actif, visuel collant, segments | non (logique), entrées en CSS |
| `methode/*` (3) | séquence, pile | non |
| `formations/FormationsInteractive.tsx`, `faq/FaqInteractive.tsx`, `realisations/RealisationsController.tsx`, `partners/PartnersStage.tsx`, `contact/ContactReveal.tsx`, `footer/FooterLive.tsx` | déjà en îlots minimaux (attributs, sans état React pendant les animations) | modèle à généraliser |
| `contact/ContactForm.tsx`, `CopyButton.tsx`, `footer/BackToTop.tsx` | interaction | non |
| `hooks/useHeroCarousel.ts`, `useMediaQuery.ts` | hooks | — |

### 4.7 Commandes et outils utilisés

- **Build et serveur** : `pnpm build` (cache Turbopack vidé avant), `pnpm exec next start -p 3100`.
- **Lighthouse** : `CHROME_PATH=/usr/bin/google-chrome npx lighthouse http://localhost:3100/ --chrome-flags="--headless=new --no-sandbox" --form-factor=mobile` (×5), `--preset=desktop` (×3), `--throttling-method=devtools`, `--throttling.cpuSlowdownMultiplier=6`.
- **Mesures navigateur** : `node audit.mjs structure|axe|nojs|reduce|reflow|keyboard`, `node contrast.mjs`, `node weight.mjs`, `node lines.mjs`, `node shots.mjs`. Scripts copiés dans `artefacts/mesures/*.mjs.txt`.
- **HTTP** : `curl -s -o /dev/null -w '%{http_code}'`, `curl -sI`, `curl -D -` (en-têtes de l'ancien site), `curl …/sitemap.xml`.
- **Code** : `grep` (clients, TODO, valeurs arbitraires, typographie, secrets).
