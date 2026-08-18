export function findTrackThumbSlotRect(trackId: string): DOMRect | null {
  const el = document.querySelector<HTMLElement>(`[data-track-thumb-id="${CSS.escape(trackId)}"]`)
  return el?.getBoundingClientRect() ?? null
}
