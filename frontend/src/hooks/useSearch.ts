import { useCallback, useEffect, useReducer, useRef } from 'react'
import { searchByCursor, searchByTerm } from '../api/searchApi'
import type { SearchResponse, TrackResult } from '../api/types'
import { debounce, type Debounced } from '../core/debounce'
import { SearchController } from '../core/searchController'

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

type Action =
  | { type: 'loading'; query?: string }
  | { type: 'success'; response: SearchResponse }
  | { type: 'error'; message: string }
  | { type: 'reset' }

function reducer(state: SearchState, action: Action): SearchState {
  switch (action.type) {
    case 'loading':
      return {
        ...state,
        status: 'loading',
        query: action.query ?? state.query,
        errorMessage: null,
      }
    case 'success':
      return {
        ...state,
        status: action.response.items.length === 0 ? 'empty' : 'success',
        items: action.response.items,
        nextCursor: action.response.nextCursor,
        previousCursor: action.response.previousCursor,
        errorMessage: null,
      }
    case 'error':
      return {
        ...state,
        status: 'error',
        errorMessage: action.message,
      }
    case 'reset':
      return initialState
    default:
      return state
  }
}

type LastAction = { type: 'term'; query: string } | { type: 'cursor'; cursor: string } | null

const DEBOUNCE_MS = 300

export interface UseSearchResult {
  state: SearchState
  /** Called on every keystroke; debounced ~300ms before actually searching. */
  liveQuery: (value: string) => void
  /** Called on explicit submit (Enter / Go button / recent-search click); searches immediately. */
  submit: (value: string) => void
  next: () => void
  previous: () => void
  retry: () => void
}

export function useSearch(): UseSearchResult {
  const [state, dispatch] = useReducer(reducer, initialState)

  const stateRef = useRef(state)
  stateRef.current = state

  const lastActionRef = useRef<LastAction>(null)

  const controllerRef = useRef<SearchController | undefined>(undefined)
  controllerRef.current ??= new SearchController(
    { searchByTerm, searchByCursor },
    {
      onLoading: () => dispatch({ type: 'loading' }),
      onSuccess: (response) => dispatch({ type: 'success', response }),
      onError: (message) => dispatch({ type: 'error', message }),
    },
  )

  useEffect(() => {
    const controller = controllerRef.current
    return () => controller?.dispose()
  }, [])

  const debouncedSearchRef = useRef<Debounced<[string]> | undefined>(undefined)
  debouncedSearchRef.current ??= debounce((query: string) => {
    lastActionRef.current = { type: 'term', query }
    dispatch({ type: 'loading', query })
    void controllerRef.current?.searchTerm(query)
  }, DEBOUNCE_MS)

  const liveQuery = useCallback((value: string) => {
    const trimmed = value.trim()
    if (trimmed.length === 0) {
      debouncedSearchRef.current?.cancel()
      controllerRef.current?.dispose()
      lastActionRef.current = null
      dispatch({ type: 'reset' })
      return
    }
    debouncedSearchRef.current?.(trimmed)
  }, [])

  const submit = useCallback((value: string) => {
    debouncedSearchRef.current?.cancel()
    const trimmed = value.trim()
    if (trimmed.length === 0) return
    lastActionRef.current = { type: 'term', query: trimmed }
    dispatch({ type: 'loading', query: trimmed })
    void controllerRef.current?.searchTerm(trimmed)
  }, [])

  const next = useCallback(() => {
    const cursor = stateRef.current.nextCursor
    if (!cursor) return
    lastActionRef.current = { type: 'cursor', cursor }
    dispatch({ type: 'loading' })
    void controllerRef.current?.goToCursor(cursor)
  }, [])

  const previous = useCallback(() => {
    const cursor = stateRef.current.previousCursor
    if (!cursor) return
    lastActionRef.current = { type: 'cursor', cursor }
    dispatch({ type: 'loading' })
    void controllerRef.current?.goToCursor(cursor)
  }, [])

  const retry = useCallback(() => {
    const action = lastActionRef.current
    if (!action) return
    dispatch({ type: 'loading', query: action.type === 'term' ? action.query : undefined })
    if (action.type === 'term') {
      void controllerRef.current?.searchTerm(action.query)
    } else {
      void controllerRef.current?.goToCursor(action.cursor)
    }
  }, [])

  return { state, liveQuery, submit, next, previous, retry }
}
