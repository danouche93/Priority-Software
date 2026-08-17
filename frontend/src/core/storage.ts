/**
 * Minimal key/value contract we depend on, rather than the full `Storage`
 * interface. Keeping it small makes it trivial to swap `localStorage` for
 * an in-memory fake in tests, or for `sessionStorage`/a remote store later.
 */
export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

/**
 * Wraps `window.localStorage`, swallowing the exceptions browsers throw in
 * private-browsing/storage-disabled modes so a persistence failure never
 * breaks the app - it just behaves as if nothing was ever saved.
 */
export function createLocalStorageStore(): KeyValueStore {
  return {
    getItem(key) {
      try {
        return window.localStorage.getItem(key)
      } catch {
        return null
      }
    },
    setItem(key, value) {
      try {
        window.localStorage.setItem(key, value)
      } catch {
        // Storage full, disabled, or unavailable - fail silently.
      }
    },
  }
}

/** In-memory store used in tests and as a safe fallback. */
export function createMemoryStore(): KeyValueStore {
  const map = new Map<string, string>()
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value)
    },
  }
}
