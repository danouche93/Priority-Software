import { useCallback, useRef, useState } from 'react'
import { addSearchTerm } from '../core/history'
import { loadRecentSearches, saveRecentSearches } from '../core/recentSearchesStorage'
import { createLocalStorageStore } from '../core/storage'

export interface UseRecentSearchesResult {
  history: string[]
  addTerm: (term: string) => void
}

export function useRecentSearches(): UseRecentSearchesResult {
  const storeRef = useRef(createLocalStorageStore())
  const [history, setHistory] = useState<string[]>(() => loadRecentSearches(storeRef.current))

  const addTerm = useCallback((term: string) => {
    setHistory((previous) => {
      const updated = addSearchTerm(previous, term)
      saveRecentSearches(storeRef.current, updated)
      return updated
    })
  }, [])

  return { history, addTerm }
}
