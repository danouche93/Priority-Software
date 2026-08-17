import type { ViewMode } from '../../core/viewPreference'
import './PaginationControls.css'

export interface PaginationControlsProps {
  hasNext: boolean
  hasPrevious: boolean
  onNext: () => void
  onPrevious: () => void
  viewMode: ViewMode
  onSetViewMode: (mode: ViewMode) => void
}

export function PaginationControls({
  hasNext,
  hasPrevious,
  onNext,
  onPrevious,
  viewMode,
  onSetViewMode,
}: PaginationControlsProps) {
  return (
    <div className="pagination-controls">
      <div className="pagination-controls__group" role="group" aria-label="Result paging">
        <button type="button" onClick={onPrevious} disabled={!hasPrevious}>
          Previous
        </button>
        <button type="button" onClick={onNext} disabled={!hasNext}>
          Next
        </button>
      </div>
      <div className="pagination-controls__group" role="group" aria-label="Result view">
        <button
          type="button"
          aria-pressed={viewMode === 'list'}
          className={viewMode === 'list' ? 'is-active' : undefined}
          onClick={() => onSetViewMode('list')}
        >
          List
        </button>
        <button
          type="button"
          aria-pressed={viewMode === 'tile'}
          className={viewMode === 'tile' ? 'is-active' : undefined}
          onClick={() => onSetViewMode('tile')}
        >
          Tile
        </button>
      </div>
    </div>
  )
}
