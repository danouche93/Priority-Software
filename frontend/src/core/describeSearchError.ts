import { ApiError } from '../api/types'

export function describeSearchError(error: unknown): string {
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
