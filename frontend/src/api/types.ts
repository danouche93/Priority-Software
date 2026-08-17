export interface TrackResult {
  id: string
  title: string
  ownerName: string
  imageUrl: string
  pageUrl: string
  embedUrl: string
}

export interface SearchResponse {
  items: TrackResult[]
  nextCursor: string | null
  previousCursor: string | null
}

export type ApiErrorKind = 'network' | 'server' | 'client' | 'unknown'

export class ApiError extends Error {
  readonly kind: ApiErrorKind

  constructor(message: string, kind: ApiErrorKind) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
  }
}
