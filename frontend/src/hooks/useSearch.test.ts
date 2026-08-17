import { act, renderHook, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as searchApi from '../api/searchApi'
import type { SearchResponse } from '../api/types'
import { useSearch } from './useSearch'

vi.mock('../api/searchApi', () => ({
  searchByTerm: vi.fn(),
  searchByCursor: vi.fn(),
}))

function makeResponse(overrides: Partial<SearchResponse> = {}): SearchResponse {
  return { items: [], nextCursor: null, previousCursor: null, ...overrides }
}

describe('useSearch', () => {
  beforeEach(() => {
    vi.mocked(searchApi.searchByTerm).mockReset()
    vi.mocked(searchApi.searchByCursor).mockReset()
  })

  it('starts idle and does not call the API until a query is provided', () => {
    const { result } = renderHook(() => useSearch())
    expect(result.current.state.status).toBe('idle')
    expect(searchApi.searchByTerm).not.toHaveBeenCalled()
  })

  it('debounces liveQuery by ~300ms before calling the API', async () => {
    vi.useFakeTimers()
    try {
      vi.mocked(searchApi.searchByTerm).mockResolvedValue(makeResponse())
      const { result } = renderHook(() => useSearch())

      act(() => {
        result.current.liveQuery('ad')
      })
      act(() => {
        result.current.liveQuery('adele')
      })

      expect(searchApi.searchByTerm).not.toHaveBeenCalled()

      await act(async () => {
        vi.advanceTimersByTime(300)
      })

      expect(searchApi.searchByTerm).toHaveBeenCalledTimes(1)
      expect(searchApi.searchByTerm).toHaveBeenCalledWith(
        expect.objectContaining({ query: 'adele', limit: 6 }),
      )
    } finally {
      vi.useRealTimers()
    }
  })

  it('submit() searches immediately, bypassing the debounce', async () => {
    vi.mocked(searchApi.searchByTerm).mockResolvedValue(makeResponse({ items: [] }))
    const { result } = renderHook(() => useSearch())

    await act(async () => {
      result.current.submit('adele')
    })

    expect(searchApi.searchByTerm).toHaveBeenCalledTimes(1)
  })

  it('moves to the empty status when a search returns no results', async () => {
    vi.mocked(searchApi.searchByTerm).mockResolvedValue(makeResponse({ items: [] }))
    const { result } = renderHook(() => useSearch())

    await act(async () => {
      result.current.submit('nonexistent')
    })

    await waitFor(() => expect(result.current.state.status).toBe('empty'))
  })

  it('moves to the error status and exposes a message on failure, then retry() replays the last action', async () => {
    vi.mocked(searchApi.searchByTerm).mockRejectedValueOnce(new Error('boom'))
    const { result } = renderHook(() => useSearch())

    await act(async () => {
      result.current.submit('adele')
    })

    await waitFor(() => expect(result.current.state.status).toBe('error'))
    expect(result.current.state.errorMessage).toBeTruthy()

    vi.mocked(searchApi.searchByTerm).mockResolvedValueOnce(makeResponse({ items: [] }))
    await act(async () => {
      result.current.retry()
    })

    await waitFor(() => expect(result.current.state.status).toBe('empty'))
    expect(searchApi.searchByTerm).toHaveBeenCalledTimes(2)
  })

  it('clearing the query (liveQuery("")) resets state without calling the API', async () => {
    vi.mocked(searchApi.searchByTerm).mockResolvedValue(makeResponse({ items: [] }))
    const { result } = renderHook(() => useSearch())

    await act(async () => {
      result.current.submit('adele')
    })
    await waitFor(() => expect(result.current.state.status).toBe('empty'))

    act(() => {
      result.current.liveQuery('')
    })

    expect(result.current.state.status).toBe('idle')
    expect(result.current.state.query).toBe('')
  })

  it('does nothing when next()/previous() are called with no cursor available', () => {
    const { result } = renderHook(() => useSearch())

    act(() => {
      result.current.next()
      result.current.previous()
    })

    expect(searchApi.searchByCursor).not.toHaveBeenCalled()
    expect(result.current.state.status).toBe('idle')
  })
})
