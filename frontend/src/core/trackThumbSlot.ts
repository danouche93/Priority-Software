// Looks up a specific result's thumbnail slot in the DOM (see the
// `data-track-thumb-id` attribute on ResultItem), so a track that's leaving
// the ImageContainer can fly back to its own place in the results list.
// Returns null if that result isn't currently rendered there (e.g. it
// scrolled off after pagination or a new search ran).
export function findTrackThumbSlotRect(trackId: string): DOMRect | null {
  const el = document.querySelector<HTMLElement>(`[data-track-thumb-id="${CSS.escape(trackId)}"]`)
  return el?.getBoundingClientRect() ?? null
}
