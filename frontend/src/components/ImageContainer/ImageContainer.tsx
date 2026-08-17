import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef } from 'react'
import type { TrackResult } from '../../api/types'
import { trackImageLayoutId } from '../../core/layoutIds'
import './ImageContainer.css'

export interface ImageContainerProps {
  track: TrackResult | null
  isPlaying: boolean
  onPlay: () => void
}

export function ImageContainer({ track, isPlaying, onPlay }: ImageContainerProps) {
  const imageButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (track) {
      imageButtonRef.current?.focus()
    }
  }, [track])

  return (
    <section className="image-container" aria-labelledby="image-container-heading">
      <h2 id="image-container-heading" className="visually-hidden">
        Now viewing
      </h2>
      <AnimatePresence mode="wait">
        {track ? (
          <motion.div
            key={track.id}
            className="image-container__content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <button
              type="button"
              ref={imageButtonRef}
              className="image-container__image-button"
              onClick={onPlay}
              aria-label={`Play ${track.title} by ${track.ownerName}`}
            >
              <motion.img
                layoutId={trackImageLayoutId(track.id)}
                src={track.imageUrl}
                alt=""
                className="image-container__image"
                transition={{ duration: 0.4, ease: 'easeInOut' }}
              />
            </button>
            <p className="image-container__caption">
              <span className="image-container__title">{track.title}</span>
              <span className="image-container__owner">{track.ownerName}</span>
            </p>
            {isPlaying && (
              <iframe
                key={track.id}
                title={`${track.title} player`}
                src={track.embedUrl}
                className="image-container__embed"
                allow="autoplay"
              />
            )}
          </motion.div>
        ) : (
          <motion.p
            key="placeholder"
            className="image-container__placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            Select a search result to see it here.
          </motion.p>
        )}
      </AnimatePresence>
    </section>
  )
}
