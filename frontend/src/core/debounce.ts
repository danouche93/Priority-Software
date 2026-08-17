/**
 * A debounced function that also exposes `cancel()` so a caller (e.g. a
 * component unmounting, or an explicit "submit now" action) can drop a
 * pending, not-yet-fired invocation.
 */
export interface Debounced<Args extends unknown[]> {
  (...args: Args): void
  cancel: () => void
}

export function debounce<Args extends unknown[]>(
  fn: (...args: Args) => void,
  delayMs: number,
): Debounced<Args> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined

  const debounced = ((...args: Args) => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
    }
    timeoutId = setTimeout(() => {
      timeoutId = undefined
      fn(...args)
    }, delayMs)
  }) as Debounced<Args>

  debounced.cancel = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId)
      timeoutId = undefined
    }
  }

  return debounced
}
