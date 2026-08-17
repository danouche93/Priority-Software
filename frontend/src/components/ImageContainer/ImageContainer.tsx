import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useRef, useState } from 'react'
import type { TrackResult } from '../../api/types'
import { trackImageLayoutId } from '../../core/layoutIds'
import { loadMixcloudWidgetApi, type MixcloudPlayerWidget } from '../../core/mixcloudWidget'
import './ImageContainer.css'

export interface ImageContainerProps {
  track: TrackResult | null
}

export function ImageContainer({ track }: ImageContainerProps) {
  const imageButtonRef = useRef<HTMLButtonElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const widgetRef = useRef<MixcloudPlayerWidget | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    if (track) {
      imageButtonRef.current?.focus()
    }
  }, [track])

  // Hide the embed again whenever a different track is selected.
  useEffect(() => {
    setIsPlaying(false)
    widgetRef.current = null
  }, [track?.id])

  // Once the iframe is mounted (after the user clicks to play), set up the
  // widget and start playback as soon as it's ready.
  useEffect(() => {
    if (!isPlaying || !track) return

    let cancelled = false

    loadMixcloudWidgetApi()
      .then((Mixcloud) => {
        if (cancelled || !iframeRef.current) return
        const widget = Mixcloud.PlayerWidget(iframeRef.current)
        return widget.ready.then(() => {
          if (cancelled) return
          widgetRef.current = widget
          return widget.play()
        })
      })
      .catch((error: unknown) => {
        console.warn('Unable to start Mixcloud playback:', error)
      })

    return () => {
      cancelled = true
    }
  }, [isPlaying, track])

  const handleImageClick = () => {
    if (widgetRef.current) {
      widgetRef.current.togglePlay().catch((error: unknown) => {
        console.warn('Unable to toggle Mixcloud playback:', error)
      })
      return
    }
    setIsPlaying(true)
  }

  return (
    <section className="image-container" aria-labelledby="image-container-heading">
      <h2 id="image-container-heading" className="visually-hidden">
        Now viewing
      </h2>
      <AnimatePresence mode="popLayout">
        {track ? (
          <motion.div
            key={track.id}
            className="image-container__content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <button
              type="button"
              ref={imageButtonRef}
              className="image-container__image-button"
              onClick={handleImageClick}
              aria-label={`Play ${track.title} by ${track.ownerName}`}
            >
              <motion.img
                layoutId={trackImageLayoutId(track.id)}
                src={track.imageUrl}
                alt=""
                className="image-container__image"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ layout: { duration: 0.4, ease: 'easeInOut' }, opacity: { duration: 0.3 } }}
              />
            </button>
            <p className="image-container__caption">
              <span className="image-container__title">{track.title}</span>
              <span className="image-container__owner">{track.ownerName}</span>
            </p>
            {isPlaying && (
              <iframe
                ref={iframeRef}
                title={`${track.title} player`}
                src={track.embedUrl}
                className="image-container__embed"
                allow="autoplay *;"
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
