import { describe, expect, it, vi } from 'vitest'
import { ApiError, type SearchResponse } from '../api/types'
import { SearchController, type SearchClient } from './searchController'

function makeResponse(overrides: Partial<SearchResponse> = {}): SearchResponse {
  return {
    items: [],
    nextCursor: null,
    previousCursor: null,
    ...overrides,
  }
}

interface Deferred<T> {
  promise: Promise<T>
  resolve: (value: T) => void
  reject: (error: unknown) => void
}

function defer<T>(): Deferred<T> {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((res, rej) => {
    resolve = res
    reject = rej
  })
  return { promise, resolve, reject }
}

/** A SearchClient whose responses are resolved manually, so tests can
 * control the exact order in which requests settle. */
function createControllableClient() {
  const termDeferreds: Deferred<SearchResponse>[] = []
  const cursorDeferreds: Deferred<SearchResponse>[] = []
  const signals: AbortSignal[] = []

  const client: SearchClient = {
    searchByTerm: vi.fn(({ signal }) => {
      signals.push(signal)
      const d = defer<SearchResponse>()
      termDeferreds.push(d)
      return d.promise
    }),
    searchByCursor: vi.fn(({ signal }) => {
      signals.push(signal)
      const d = defer<SearchResponse>()
      cursorDeferreds.push(d)
      return d.promise
    }),
  }

  return { client, termDeferreds, cursorDeferreds, signals }
}

function createCallbacks() {
  return {
    onLoading: vi.fn(),
    onSuccess: vi.fn(),
    onError: vi.fn(),
  }
}

describe('SearchController', () => {
  it('reports loading then success for a simple term search', async () => {
    const { client, termDeferreds } = createControllableClient()
    const callbacks = createCallbacks()
    const controller = new SearchController(client, callbacks)

    const pending = controller.searchTerm('adele')
    expect(callbacks.onLoading).toHaveBeenCalledTimes(1)

    const response = makeResponse({ items: [] })
    termDeferreds[0].resolve(response)
    await pending

    expect(callbacks.onSuccess).toHaveBeenCalledWith(response)
    expect(callbacks.onError).not.toHaveBeenCalled()
  })

  it('never lets a stale response overwrite a newer one when the old request resolves last', async () => {
    const { client, termDeferreds } = createControllableClient()
    const callbacks = createCallbacks()
    const controller = new SearchController(client, callbacks)

    const first = controller.searchTerm('a')
    const second = controller.searchTerm('b')

    // Resolve the *first* (now-stale) request after the second has already
    // started - this is the "rapid typing/clicking" race.
    termDeferreds[0].resolve(makeResponse({ nextCursor: 'from-a' }))
    termDeferreds[1].resolve(makeResponse({ nextCursor: 'from-b' }))
    await Promise.all([first, second])

    expect(callbacks.onSuccess).toHaveBeenCalledTimes(1)
    expect(callbacks.onSuccess).toHaveBeenCalledWith(makeResponse({ nextCursor: 'from-b' }))
  })

  it('aborts the previous request when a new one starts', () => {
    const { client, signals } = createControllableClient()
    const controller = new SearchController(client, createCallbacks())

    void controller.searchTerm('a')
    const firstSignal = signals[0]
    expect(firstSignal.aborted).toBe(false)

    void controller.searchTerm('b')

    expect(firstSignal.aborted).toBe(true)
  })

  it('treats searchTerm and goToCursor as the same request sequence', async () => {
    const { client, termDeferreds, cursorDeferreds } = createControllableClient()
    const callbacks = createCallbacks()
    const controller = new SearchController(client, callbacks)

    const first = controller.searchTerm('a')
    const second = controller.goToCursor('cursor-1')

    termDeferreds[0].resolve(makeResponse({ nextCursor: 'stale' }))
    cursorDeferreds[0].resolve(makeResponse({ nextCursor: 'fresh' }))
    await Promise.all([first, second])

    expect(callbacks.onSuccess).toHaveBeenCalledTimes(1)
    expect(callbacks.onSuccess).toHaveBeenCalledWith(makeResponse({ nextCursor: 'fresh' }))
  })

  it('silently ignores AbortError from a cancelled request', async () => {
    const { client, termDeferreds } = createControllableClient()
    const callbacks = createCallbacks()
    const controller = new SearchController(client, callbacks)

    const first = controller.searchTerm('a')
    const second = controller.searchTerm('b')

    termDeferreds[0].reject(new DOMException('Aborted', 'AbortError'))
    termDeferreds[1].resolve(makeResponse())
    await Promise.all([first, second])

    expect(callbacks.onError).not.toHaveBeenCalled()
    expect(callbacks.onSuccess).toHaveBeenCalledTimes(1)
  })

  it('reports a friendly message and does not throw for a network error', async () => {
    const { client, termDeferreds } = createControllableClient()
    const callbacks = createCallbacks()
    const controller = new SearchController(client, callbacks)

    const pending = controller.searchTerm('adele')
    termDeferreds[0].reject(new ApiError('boom', 'network'))
    await pending

    expect(callbacks.onError).toHaveBeenCalledTimes(1)
    expect(callbacks.onError).toHaveBeenCalledWith(expect.stringContaining('Network error'))
  })

  it('ignores an error from a stale request', async () => {
    const { client, termDeferreds } = createControllableClient()
    const callbacks = createCallbacks()
    const controller = new SearchController(client, callbacks)

    const first = controller.searchTerm('a')
    const second = controller.searchTerm('b')

    termDeferreds[0].reject(new ApiError('boom', 'server'))
    termDeferreds[1].resolve(makeResponse())
    await Promise.all([first, second])

    expect(callbacks.onError).not.toHaveBeenCalled()
    expect(callbacks.onSuccess).toHaveBeenCalledTimes(1)
  })

  it('dispose() aborts any in-flight request', () => {
    const { client, signals } = createControllableClient()
    const controller = new SearchController(client, createCallbacks())

    void controller.searchTerm('a')
    controller.dispose()

    expect(signals[0].aborted).toBe(true)
  })
})
