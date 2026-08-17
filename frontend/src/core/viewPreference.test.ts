import { describe, expect, it } from 'vitest'
import { createMemoryStore } from './storage'
import { loadViewMode, saveViewMode } from './viewPreference'

describe('viewPreference', () => {
  it('defaults to list view when nothing has been saved', () => {
    const store = createMemoryStore()
    expect(loadViewMode(store)).toBe('list')
  })

  it('remembers tile view once saved', () => {
    const store = createMemoryStore()
    saveViewMode(store, 'tile')
    expect(loadViewMode(store)).toBe('tile')
  })

  it('falls back to list for an unrecognized stored value', () => {
    const store = createMemoryStore()
    store.setItem('soundsearch.viewMode.v1', 'garbage')
    expect(loadViewMode(store)).toBe('list')
  })
})
