/*
 * Typographie française, appliquée une fois au chargement des données (jamais à chaque rendu) :
 * espace insécable avant « : », espace fine insécable avant « ? ! ; ».
 * Les URL, adresses e-mail et numéros ne sont jamais modifiés.
 */
const NBSP = " ";
const NNBSP = " ";

// Segments protégés : URL, e-mails, numéros de téléphone (ex. « +221 76 809 51 59 »).
const PROTECTED = /(https?:\/\/\S+|\S+@\S+\.\S+|\+?\d[\d ]{6,}\d)/g;

function fix(segment: string): string {
  return segment.replace(/ +:/g, `${NBSP}:`).replace(/ +([?!;])/g, `${NNBSP}$1`);
}

/** Applique les règles d'espacement de la typographie française à un texte. */
export function typo(text: string): string {
  return text
    .split(PROTECTED)
    .map((part, index) => (index % 2 === 1 ? part : fix(part)))
    .join("");
}

/** Segment de texte courant ou en gras. */
export type StrongSegment = { texte: string; fort?: boolean };

/**
 * Convertit un texte contenant des passages **en gras** en segments (rendus en <strong> par les composants).
 * Jamais de HTML : le texte reste du texte.
 */
export function splitStrong(text: string): StrongSegment[] {
  return text
    .split(/\*\*(.+?)\*\*/g)
    .map((part, index) => (index % 2 === 1 ? { texte: typo(part), fort: true } : { texte: typo(part) }))
    .filter((segment) => segment.texte !== "");
}

/**
 * Lie la fin d'une phrase par des espaces insécables pour qu'elle ne soit jamais coupée :
 * le dernier mot est toujours lié au précédent, et on remonte tant que le mot lié est court
 * (≤ 2 lettres : « de A à Z. », « du temps. »). Évite le dernier mot seul sur une ligne.
 */
export function glueTail(text: string): string {
  const words = text.split(" ");
  if (words.length < 2) return text;
  let from = words.length - 2;
  while (from > 0 && words[from].replace(/[^\p{L}\p{N}]/gu, "").length <= 2) from -= 1;
  return [...words.slice(0, from), words.slice(from).join(NBSP)].join(" ");
}
