/**
 * Reflet translucide incliné qui traverse un bouton au survol.
 * Le parent doit porter `group`, `relative` et `overflow-hidden`.
 * À la sortie du survol, le reflet revient sans transition.
 */
export function ButtonShine() {
  return (
    <span
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 -left-1/2 w-1/3 -skew-x-20 bg-linear-to-r from-transparent via-text-on-dark/40 to-transparent motion-safe:group-hover:translate-x-[450%] motion-safe:group-hover:transition-transform motion-safe:group-hover:duration-700 motion-safe:group-hover:ease-out"
    />
  );
}
