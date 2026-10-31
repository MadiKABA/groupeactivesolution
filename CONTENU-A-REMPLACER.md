# Contenus à fournir ou à remplacer

Ce document liste, page par page, les textes et les images provisoires du site. En ligne, ils sont signalés par :

- **« [À valider] »** à la fin d'un texte : texte provisoire, à relire ou à réécrire ;
- un cadre bleu nuit ou rayé, souvent marqué **« Photo à fournir »**, « Image à fournir » ou « Archive à fournir » : photo manquante (les dimensions attendues sont indiquées ci-dessous) ;
- des textes entre crochets, comme **« [Nom du projet à valider] »** : information manquante.

Envoyez les textes dans un document (en indiquant la page et la section) et les photos en fichiers séparés, nommés comme indiqué. La colonne « Où » sert à l'intégration : vous n'avez rien à modifier vous-même.

**Règles communes aux photos**

- Photos réelles uniquement (pas de photo de banque d'images présentée comme une photo de l'entreprise), sans texte, chiffre ni logo incrusté.
- Pour chaque photo, donner une **courte description factuelle** de ce qu'elle montre (elle sert aux personnes malvoyantes) et, si possible, une légende : lieu · activité · année.
- Accord des personnes visibles sur les photos.
- Le poids indiqué est un maximum après compression ; si vous ne savez pas compresser, envoyez l'original en bonne qualité, il sera optimisé à l'intégration.

**Longueur des textes** : les longueurs sont celles des textes actuels, à respecter à peu près pour ne pas déséquilibrer la mise en page (1 ligne ≈ 60 caractères).

---

## 1. Accueil

| Section | Provisoire | Attendu | Où |
|---|---|---|---|
| Haut de page (carrousel) | Trois cadres « Image à fournir » | 3 photos : formation, développement, transformation. Paysage 4:3, **1200 × 900**, WebP, 150 Ko max. Noms : `education.webp`, `developpement.webp`, `transformation.webp` | `public/hero/` |
| Haut de page | Les trois phrases sous le titre (une par photo) | Relecture : 1 phrase de 80 à 100 caractères chacune | `src/lib/hero-slides.ts` |
| Nos expertises | Trois visuels bleu nuit (icône et numéro), sans photo | 3 photos carrées **1600 × 1600**, sujet centré, WebP, 220 Ko max. Noms : `education.webp`, `developpement.webp`, `transformation.webp` | `public/expertises/` |
| Réalisations | Tuiles « Illustration », « [Nom du projet à valider] », « [Légende à valider] » | Pour 3 projets réels : nom (30 à 50 caractères), légende (1 phrase, 80 à 120 caractères), **2 photos par projet**, paysage 5:3, **2000 × 1200**, WebP, 200 Ko max. Noms : `projet-1-a.webp`, `projet-1-b.webp`… `projet-3-b.webp`. Projet 1 = formation, 2 = développement, 3 = transformation. Tant qu'un projet n'a pas ses deux photos, la section reste en mode « illustrations » | `public/realisations/`, `src/lib/realisations.ts` |
| Notre méthode | Textes des étapes | Relecture seulement (ne pas ajouter de durées, livrables ou garanties qui ne sont pas réels) | `src/lib/methode.ts` |
| Formations | Titre, introduction, 5 domaines (titre + 1 phrase de 70 à 110 caractères), 3 publics (titre + 1 phrase) | Relecture ou réécriture ; liste des domaines réellement enseignés à confirmer | `src/lib/formations.ts` |
| FAQ | 6 questions sans réponse (texte neutre affiché) : intervention hors de Dakar, connaissances préalables, présentiel / en ligne / établissements, devis et tarifs, délais habituels, suivi après livraison | Une réponse de 2 à 4 phrases (200 à 400 caractères) par question, ou indiquer les questions à retirer | `src/lib/faq.ts` |
| Notre impact | Phrases sous les chiffres, introduction, date de mise à jour, « [Précision à fournir : nature de l'accompagnement.] » | Chiffres confirmés (4+, 10+, 5, 4) ; 1 phrase (60 à 120 caractères) par chiffre ; date à laquelle les chiffres sont à jour | `src/content/impact.ts` |
| Partenaires | Noms affichés en texte (aucun logo) | Logo officiel de chaque partenaire : SVG de préférence, sinon PNG ou WebP à fond transparent. Orthographe exacte de « MondialeHome », nom complet d'« ODC ». Adresse du site de chaque partenaire (facultatif) | `public/partners/`, `src/lib/partners.ts` |

## 2. Services (`/services`)

| Section | Provisoire | Attendu | Où |
|---|---|---|---|
| Haut de page | Trois vignettes de couleur, sans photo | 3 photos : `education` en **portrait 1:2 (800 × 1600)**, `developpement` et `transformation` en **carré 1:1 (1000 × 1000)**, sujet centré, 120 Ko max (WebP, AVIF ou JPEG) + une description factuelle par photo | `public/images/services/` |
| Haut de page | Titre et texte d'introduction | Relecture (texte actuel : 1 à 2 phrases) | `src/lib/services.ts` |
| Fiches Former / Créer / Transformer | Trois cadres bleu nuit à motif doré, sans photo | 3 photos **1600 × 1600**, sujet centré (recadrées automatiquement), 100 à 150 Ko. Noms : `fiche-education`, `fiche-developpement`, `fiche-transformation` (+ .webp, .avif ou .jpg) + une description factuelle par photo | `public/images/services/` |
| Fiches | Accroche, paragraphe, « Pour qui », façon de faire, domaines | Relecture : garder à peu près la longueur actuelle de chaque bloc | `src/lib/expertises.ts` |
| Bande d'appel à l'action | Titre et phrase | Relecture | `src/lib/services.ts` |

## 3. Réalisations

Il n'y a pas encore de page « Réalisations » : seule la section de l'accueil existe (voir ci-dessus). Une page dédiée et le lien « Voir toutes nos réalisations » pourront être ajoutés quand les projets et leurs photos seront disponibles. Contenu de cette future page : **à fournir**.

## 4. Formations

Il n'y a pas encore de page « Formations » : seule la section de l'accueil existe (voir ci-dessus). Les liens « Découvrir nos formations » et « Formations » du carrousel mènent à une adresse `/formations` qui n'existe pas encore. Contenu de cette future page (programmes, durées, public, modalités, tarifs éventuels) : **à fournir**.

## 5. À propos (`/a-propos`)

| Section | Provisoire | Attendu | Où |
|---|---|---|---|
| Haut de page (arches) | Photos présentes ; légende « [Légendes des photos : lieu · activité · année] » ; descriptions provisoires ; « Depuis 2021 » | Confirmer la légende de chaque photo, leur description et l'année de création | `src/lib/about.ts` |
| Notre histoire | Chapitre 1 et 2 provisoires, « [Titre du chapitre à fournir] », « [Texte à fournir…] », année « 20XX » | Pour chaque chapitre : année, titre (40 à 60 caractères), texte de 2 à 3 phrases (200 à 350 caractères). **Jalons réels de l'entreprise** | `src/content/history.ts` |
| Notre histoire | Trois cadres rayés « Photo à fournir » | 1 photo par chapitre, **1600 × 900 minimum**, sujet principal **à droite** (la moitié gauche est recouverte par le texte), WebP ou JPEG + légende lieu · activité · année | `public/histoire/` |
| Notre histoire | Archives « Archive à fournir » (3) | Documents ou photos d'époque, **800 × 600**, orientation libre ; pour chacun : titre court et petite histoire (1 à 2 phrases) | `public/histoire/`, `src/content/history.ts` |
| Nos convictions | Introduction et textes des **4 convictions** marqués « [À valider] » | Pour chacune : titre (50 à 70 caractères), texte (1 à 2 phrases, 120 à 200 caractères), « Ce que nous en faisons » (1 phrase) | `src/content/convictions.ts` |
| Nos convictions | Quatre cadres rayés « Photo à fournir » | 1 photo par conviction, paysage, **940 × 560 minimum**, sujet centré + légende et description | `public/convictions/` |
| Notre équipe | Textes des 4 savoir-faire (Former, Développer, Conseiller, Accompagner) marqués « [À valider] » | Relecture, longueur actuelle | `src/content/equipe.ts` |
| Notre équipe | « Les membres concernés seront présentés ici… » | Pour chaque savoir-faire : membres qui acceptent d'apparaître (nom ou initiales, rôle, photo portrait carrée facultative). Sinon le bloc disparaît au lancement | `src/content/equipe.ts`, `public/equipe/` |
| Notre équipe | « Illustration provisoire · remplaçable par une photo de l'atelier » | Facultatif : une photo réelle de l'atelier / des locaux (paysage, haute définition) | `public/equipe/` |
| Notre impact | Comme sur l'accueil | Voir « Accueil » | `src/content/impact.ts` |
| Ils nous font confiance | Titre et phrase marqués « [À valider] » ; partenaires affichés par leur nom | Formulation à valider ; logos (voir « Accueil → Partenaires ») | `src/content/trust.ts` |

## 6. Contact (`/contact`)

| Section | Provisoire | Attendu | Où |
|---|---|---|---|
| Haut de page et formulaire | Titres, textes d'aide, « 24 h » de délai de réponse | Relecture ; confirmer que le délai de réponse annoncé est réaliste | `src/lib/contact.ts` |
| Coordonnées | Numéro WhatsApp +221 76 809 51 59 (repris de l'ancien site) | **Confirmer** que c'est le bon numéro WhatsApp | `src/lib/site.ts` |
| Coordonnées | Adresse « Liberté 1, Dakar » | Confirmer ; rue précise et point Google Maps exact si vous souhaitez les afficher | `src/lib/site.ts` |
| Horaires | Aucun horaire affiché | Horaires d'ouverture, si vous souhaitez les afficher : **à fournir** | — |

## 7. Partout sur le site

| Élément | Attendu | Où |
|---|---|---|
| Réseaux sociaux | **Adresse directe** de la page Facebook et du compte TikTok (pas un lien de partage court comme `facebook.com/share/…` ou `vm.tiktok.com/…`) | `src/lib/site.ts` |
| Pages légales | Textes des CGU, des mentions légales et de la politique de confidentialité (les liens apparaîtront dans le pied de page quand les pages existeront) : **à fournir** | — |
| Image de partage | Image affichée quand on partage un lien du site (WhatsApp, LinkedIn…) : **1200 × 630**, JPEG ou PNG, 300 Ko max, une par page si possible (accueil, services, à propos, contact) | `public/og/` |
| Icône d'onglet (favicon) | À créer à partir du logo officiel : fichier source du logo en haute définition (SVG) si disponible | `public/logos/` |
