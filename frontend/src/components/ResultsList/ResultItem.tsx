import { motion } from 'framer-motion'
import type { TrackResult } from '../../api/types'
import { trackImageLayoutId } from '../../core/layoutIds'
import type { ViewMode } from '../../core/viewPreference'

export interface ResultItemProps {
  item: TrackResult
  viewMode: ViewMode
  isSelected: boolean
  onSelect: (item: TrackResult) => void
}

export function ResultItem({ item, viewMode, isSelected, onSelect }: ResultItemProps) {
  return (
    <li className={`result-item result-item--${viewMode}`}>
      <button
        type="button"
        className="result-item__button"
        onClick={() => onSelect(item)}
        aria-current={isSelected ? 'true' : undefined}
      >
        <span className="result-item__thumb-slot">
          {!isSelected && (
            <motion.img
              layoutId={trackImageLayoutId(item.id)}
              src={item.imageUrl}
              alt=""
              className="result-item__thumb"
              loading="lazy"
              transition={{ duration: 0.4, ease: 'easeInOut' }}
            />
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
