import './StatusStates.css'

export interface EmptyStateProps {
  query: string
}

export function EmptyState({ query }: EmptyStateProps) {
  return (
    <div className="status-state status-state--empty">
      <p>No results found for “{query}”. Try a different search.</p>
    </div>
  )
}
