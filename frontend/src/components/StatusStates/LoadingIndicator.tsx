import './StatusStates.css'

export function LoadingIndicator() {
  return (
    <div className="status-state status-state--loading" role="status">
      <span className="status-state__spinner" aria-hidden="true" />
      <span>Searching…</span>
    </div>
  )
}
