import { useQuery } from '@tanstack/react-query'
import { useCallback, useMemo, useRef, useState } from 'react'
import { searchByCursor, searchByTerm } from '../api/searchApi'
import type { SearchResponse, TrackResult } from '../api/types'
import { debounce, type Debounced } from '../core/debounce'
import { describeSearchError } from '../core/describeSearchError'

export type SearchStatus = 'idle' | 'loading' | 'success' | 'empty' | 'error'

export interface SearchState {
  status: SearchStatus
  query: string
  items: TrackResult[]
  nextCursor: string | null
  previousCursor: string | null
  errorMessage: string | null
}

const initialState: SearchState = {
  status: 'idle',
  query: '',
  items: [],
  nextCursor: null,
  previousCursor: null,
  errorMessage: null,
}

type ActiveKey =
  | { type: 'idle' }
  | { type: 'term'; query: string }
  | { type: 'cursor'; cursor: string; query: string }

const DEBOUNCE_MS = 300

export interface UseSearchResult {
  state: SearchState
  liveQuery: (value: string) => void
  submit: (value: string) => void
  next: () => void
  previous: () => void
  retry: () => void
}

async function fetchSearch(key: ActiveKey, signal: AbortSignal): Promise<SearchResponse> {
  if (key.type === 'term') return searchByTerm({ query: key.query, limit: 6, signal })
  if (key.type === 'cursor') return searchByCursor({ cursor: key.cursor, signal })
  throw new Error('search query is idle')
}

export function useSearch(): UseSearchResult {
  const [activeKey, setActiveKey] = useState<ActiveKey>({ type: 'idle' })

  const result = useQuery({
    queryKey: ['search', activeKey],
    queryFn: ({ signal }) => fetchSearch(activeKey, signal),
    enabled: activeKey.type !== 'idle',
  })

  const dataRef = useRef<SearchResponse | undefined>(undefined)
  dataRef.current = result.data

  const debouncedRef = useRef<Debounced<[string]> | undefined>(undefined)
  debouncedRef.current ??= debounce((query: string) => {
    setActiveKey({ type: 'term', query })
  }, DEBOUNCE_MS)

  const liveQuery = useCallback((value: string) => {
    const trimmed = value.trim()
    if (trimmed.length === 0) {
      debouncedRef.current?.cancel()
      setActiveKey({ type: 'idle' })
      return
    }
    debouncedRef.current?.(trimmed)
  }, [])

  const submit = useCallback((value: string) => {
    debouncedRef.current?.cancel()
    const trimmed = value.trim()
    if (trimmed.length === 0) return
    setActiveKey({ type: 'term', query: trimmed })
  }, [])

  const next = useCallback(() => {
    const cursor = dataRef.current?.nextCursor
    setActiveKey((prev) => (prev.type === 'idle' || !cursor ? prev : { type: 'cursor', cursor, query: prev.query }))
  }, [])

  const previous = useCallback(() => {
    const cursor = dataRef.current?.previousCursor
    setActiveKey((prev) => (prev.type === 'idle' || !cursor ? prev : { type: 'cursor', cursor, query: prev.query }))
  }, [])

  const retry = useCallback(() => {
    void result.refetch()
  }, [result])

  const state = useMemo<SearchState>(() => {
    if (activeKey.type === 'idle') return initialState

    if (result.isPending) {
      return { ...initialState, status: 'loading', query: activeKey.query }
    }

    if (result.isError) {
      return { ...initialState, status: 'error', query: activeKey.query, errorMessage: describeSearchError(result.error) }
    }

    const data = result.data
    return {
      status: data.items.length === 0 ? 'empty' : 'success',
      query: activeKey.query,
      items: data.items,
      nextCursor: data.nextCursor,
      previousCursor: data.previousCursor,
      errorMessage: null,
    }
  }, [activeKey, result.isPending, result.isError, result.data, result.error])

  return { state, liveQuery, submit, next, previous, retry }
}
