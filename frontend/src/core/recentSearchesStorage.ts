import { MAX_RECENT_SEARCHES } from './history'
import type { KeyValueStore } from './storage'

const STORAGE_KEY = 'soundsearch.recentSearches.v1'

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((entry) => typeof entry === 'string')
}

export function loadRecentSearches(store: KeyValueStore): string[] {
  const raw = store.getItem(STORAGE_KEY)
  if (raw === null) {
    return []
  }

  try {
    const parsed: unknown = JSON.parse(raw)
    return isStringArray(parsed) ? parsed.slice(0, MAX_RECENT_SEARCHES) : []
  } catch {
    return []
  }
}

export function saveRecentSearches(store: KeyValueStore, history: readonly string[]): void {
  store.setItem(STORAGE_KEY, JSON.stringify(history))
}
