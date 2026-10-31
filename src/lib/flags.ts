/*
 * Interrupteurs de déploiement, lus au build (les variables NEXT_PUBLIC_ sont intégrées au code :
 * changer leur valeur sur Vercel demande un nouveau déploiement). Seul fichier qui décide de
 * l'affichage des contenus provisoires selon l'environnement.
 */

/**
 * Placeholders et repères de contenu provisoire (« [À valider] », « Photo à fournir »…) :
 * visibles en développement local, ou en ligne avec NEXT_PUBLIC_SHOW_PLACEHOLDERS=true (relecture).
 */
export const showPlaceholders =
  process.env.NEXT_PUBLIC_SHOW_PLACEHOLDERS === "true" || process.env.NODE_ENV === "development";

/** Indexation par les moteurs : seulement avec NEXT_PUBLIC_ALLOW_INDEXING=true (lancement officiel). */
export const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";

/** Métadonnée `robots` des pages : noindex tant que l'indexation n'est pas ouverte. */
export const pageRobots = { index: allowIndexing, follow: allowIndexing } as const;
