import { describe, expect, it } from 'vitest'
import { loadRecentSearches, saveRecentSearches } from './recentSearchesStorage'
import { createMemoryStore } from './storage'

describe('recentSearchesStorage', () => {
  it('returns an empty list when nothing has been saved yet', () => {
    const store = createMemoryStore()
    expect(loadRecentSearches(store)).toEqual([])
  })

  it('round-trips a saved history', () => {
    const store = createMemoryStore()
    saveRecentSearches(store, ['adele', 'daft punk'])
    expect(loadRecentSearches(store)).toEqual(['adele', 'daft punk'])
  })

  it('ignores corrupted JSON and falls back to an empty list', () => {
    const store = createMemoryStore()
    store.setItem('soundsearch.recentSearches.v1', '{not valid json')
    expect(loadRecentSearches(store)).toEqual([])
  })

  it('ignores a saved value that is not a string array', () => {
    const store = createMemoryStore()
    store.setItem('soundsearch.recentSearches.v1', JSON.stringify({ not: 'an array' }))
    expect(loadRecentSearches(store)).toEqual([])
  })

  it('truncates an oversized saved history to the max length on load', () => {
    const store = createMemoryStore()
    store.setItem('soundsearch.recentSearches.v1', JSON.stringify(['1', '2', '3', '4', '5', '6', '7']))
    expect(loadRecentSearches(store)).toEqual(['1', '2', '3', '4', '5'])
  })
})
