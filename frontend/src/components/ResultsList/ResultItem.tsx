import { useRef } from 'react'
import type { TrackResult } from '../../api/types'
import type { ViewMode } from '../../core/viewPreference'

export interface ResultItemProps {
  item: TrackResult
  viewMode: ViewMode
  isSelected: boolean
  onSelect: (item: TrackResult, sourceRect: DOMRect | null) => void
}

export function ResultItem({ item, viewMode, isSelected, onSelect }: ResultItemProps) {
  const thumbSlotRef = useRef<HTMLSpanElement>(null)

  const handleClick = () => {
    onSelect(item, thumbSlotRef.current?.getBoundingClientRect() ?? null)
  }

  return (
    <li className={`result-item result-item--${viewMode}`} role="listitem">
      <button
        type="button"
        className="result-item__button"
        onClick={handleClick}
        aria-current={isSelected ? 'true' : undefined}
      >
        <span className="result-item__thumb-slot" ref={thumbSlotRef} data-track-thumb-id={item.id}>
          {!isSelected && (
            <img src={item.imageUrl} alt="" className="result-item__thumb" loading="lazy" />
          )}
        </span>
        <span className="result-item__meta">
          <span className="result-item__title">{item.title}</span>
          <span className="result-item__owner">{item.ownerName}</span>
        </span>
      </button>
    </li>
  )
}
