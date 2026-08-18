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
