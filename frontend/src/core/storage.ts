export interface KeyValueStore {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
}

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
        // ignore
      }
    },
  }
}

export function createMemoryStore(): KeyValueStore {
  const map = new Map<string, string>()
  return {
    getItem: (key) => map.get(key) ?? null,
    setItem: (key, value) => {
      map.set(key, value)
    },
  }
}
