import { AnimatePresence, motion } from 'framer-motion'
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
    <li className={`result-item result-item--${viewMode}`} role="listitem">
      <button
        type="button"
        className="result-item__button"
        onClick={() => onSelect(item)}
        aria-current={isSelected ? 'true' : undefined}
      >
        <span className="result-item__thumb-slot">
          <AnimatePresence>
            {!isSelected && (
              <motion.img
                layoutId={trackImageLayoutId(item.id)}
                src={item.imageUrl}
                alt=""
                className="result-item__thumb"
                loading="lazy"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ layout: { duration: 0.4, ease: 'easeInOut' }, opacity: { duration: 0.3 } }}
              />
            )}
          </AnimatePresence>
        </span>
        <span className="result-item__meta">
          <span className="result-item__title">{item.title}</span>
          <span className="result-item__owner">{item.ownerName}</span>
        </span>
      </button>
    </li>
  )
}
