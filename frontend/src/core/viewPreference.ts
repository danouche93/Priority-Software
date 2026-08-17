import type { KeyValueStore } from './storage'

export type ViewMode = 'list' | 'tile'

const STORAGE_KEY = 'soundsearch.viewMode.v1'

export function loadViewMode(store: KeyValueStore): ViewMode {
  return store.getItem(STORAGE_KEY) === 'tile' ? 'tile' : 'list'
}

export function saveViewMode(store: KeyValueStore, mode: ViewMode): void {
  store.setItem(STORAGE_KEY, mode)
}
