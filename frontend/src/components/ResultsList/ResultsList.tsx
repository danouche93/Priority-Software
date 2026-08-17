import type { TrackResult } from '../../api/types'
import type { ViewMode } from '../../core/viewPreference'
import { ResultItem } from './ResultItem'
import './ResultsList.css'

export interface ResultsListProps {
  items: TrackResult[]
  viewMode: ViewMode
  selectedId: string | null
  onSelect: (item: TrackResult, sourceRect: DOMRect | null) => void
}

export function ResultsList({ items, viewMode, selectedId, onSelect }: ResultsListProps) {
  return (
    <ul className={`results-list results-list--${viewMode}`} role="list" aria-label="Search results">
      {items.map((item) => (
        <ResultItem
          key={item.id}
          item={item}
          viewMode={viewMode}
          isSelected={item.id === selectedId}
          onSelect={onSelect}
        />
      ))}
    </ul>
  )
}
