export const MAX_RECENT_SEARCHES = 5

function normalize(term: string): string {
  return term.trim().toLowerCase()
}

/**
 * Adds `term` to the front of `history`, removing any existing entry that
 * is the same search (case-insensitively) so re-searching a term moves it
 * to the top instead of creating a duplicate, then caps the list length.
 */
export function addSearchTerm(history: readonly string[], term: string): string[] {
  const trimmed = term.trim()
  if (trimmed.length === 0) {
    return [...history]
  }

  const normalized = normalize(trimmed)
  const withoutDuplicate = history.filter((existing) => normalize(existing) !== normalized)

  return [trimmed, ...withoutDuplicate].slice(0, MAX_RECENT_SEARCHES)
}
