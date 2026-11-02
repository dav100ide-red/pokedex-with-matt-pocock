/** How the selected values are matched: `'any'` needs at least one of them, `'all'` needs every one. */
export type MatchMode = 'any' | 'all';

/**
 * Whether an item's `values` match the `selected` values in the given mode.
 * In `'all'` mode the item may have other values too. With nothing selected, everything matches.
 */
export function matchesValues<T>(
  values: readonly T[],
  selected: readonly T[],
  mode: MatchMode,
): boolean {
  if (selected.length === 0) {
    return true;
  }
  return mode === 'any'
    ? selected.some((value) => values.includes(value))
    : selected.every((value) => values.includes(value));
}
