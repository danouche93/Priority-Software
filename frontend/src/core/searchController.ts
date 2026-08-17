import { ApiError, type SearchResponse } from '../api/types'

export interface SearchClient {
  searchByTerm(params: { query: string; limit: number; signal: AbortSignal }): Promise<SearchResponse>
  searchByCursor(params: { cursor: string; signal: AbortSignal }): Promise<SearchResponse>
}

export interface SearchControllerCallbacks {
  onLoading: () => void
  onSuccess: (response: SearchResponse) => void
  onError: (message: string) => void
}

function isAbortError(error: unknown): boolean {
  return error instanceof DOMException && error.name === 'AbortError'
}

function describeError(error: unknown): string {
  if (error instanceof ApiError) {
    switch (error.kind) {
      case 'network':
        return 'Network error - check your connection and try again.'
      case 'server':
        return 'The search service is temporarily unavailable. Please try again.'
      default:
        return 'Something went wrong while searching. Please try again.'
    }
  }
  return 'Unexpected error. Please try again.'
}

/**
 * Owns every rule needed for "correct async handling": each call to
 * `searchTerm`/`goToCursor` aborts whatever request came before it and is
 * tagged with a monotonically increasing request id. A response is only
 * ever applied if it's still the most recent request in flight - so typing
 * quickly, or mashing Next/Previous, can never let a stale response
 * clobber newer results. This class has no React/DOM dependency beyond
 * `AbortController`, so it is unit-testable in isolation from any UI.
 */
export class SearchController {
  private readonly client: SearchClient
  private readonly callbacks: SearchControllerCallbacks
  private readonly limit: number
  private currentRequestId = 0
  private abortController: AbortController | null = null

  constructor(client: SearchClient, callbacks: SearchControllerCallbacks, limit = 6) {
    this.client = client
    this.callbacks = callbacks
    this.limit = limit
  }

  async searchTerm(query: string): Promise<void> {
    const { requestId, signal } = this.beginRequest()
    try {
      const response = await this.client.searchByTerm({ query, limit: this.limit, signal })
      this.applyIfCurrent(requestId, response)
    } catch (error) {
      this.applyErrorIfCurrent(requestId, error)
    }
  }

  async goToCursor(cursor: string): Promise<void> {
    const { requestId, signal } = this.beginRequest()
    try {
      const response = await this.client.searchByCursor({ cursor, signal })
      this.applyIfCurrent(requestId, response)
    } catch (error) {
      this.applyErrorIfCurrent(requestId, error)
    }
  }

  /** Aborts any in-flight request. Call on unmount. */
  dispose(): void {
    this.abortController?.abort()
  }

  private beginRequest(): { requestId: number; signal: AbortSignal } {
    this.abortController?.abort()
    const controller = new AbortController()
    this.abortController = controller
    const requestId = ++this.currentRequestId
    this.callbacks.onLoading()
    return { requestId, signal: controller.signal }
  }

  private isStale(requestId: number): boolean {
    return requestId !== this.currentRequestId
  }

  private applyIfCurrent(requestId: number, response: SearchResponse): void {
    if (this.isStale(requestId)) return
    this.callbacks.onSuccess(response)
  }

  private applyErrorIfCurrent(requestId: number, error: unknown): void {
    if (isAbortError(error) || this.isStale(requestId)) return
    this.callbacks.onError(describeError(error))
  }
}
