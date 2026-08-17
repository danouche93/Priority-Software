/**
 * Shared `layoutId` naming so the same visual element (a result's
 * thumbnail) can hand off to Framer Motion's shared-layout animation when
 * it re-mounts in the ImageContainer.
 */
export function trackImageLayoutId(trackId: string): string {
  return `track-image-${trackId}`
}
