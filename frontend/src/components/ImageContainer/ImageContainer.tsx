import { useEffect, useRef, useState } from 'react'
import type { TrackResult } from '../../api/types'
import { IMAGE_CONTAINER_SLOT_ID } from '../../core/imageContainerSlot'
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

      {/* Always rendered (even with no track selected) at a stable position/
          size, so FlyingImage always has a valid landing rect to measure -
          including for the very first selection. The image itself never
          animates; only the flying clone (rendered elsewhere, via a portal)
          moves - this element just swaps its picture instantly once the
          flight lands. */}
      <button
        type="button"
        ref={imageButtonRef}
        id={IMAGE_CONTAINER_SLOT_ID}
        className="image-container__image-button"
        onClick={handleImageClick}
        disabled={!track}
        aria-label={track ? `Play ${track.title} by ${track.ownerName}` : 'No track selected'}
      >
        {track && <img src={track.imageUrl} alt="" className="image-container__image" />}
      </button>

      {track ? (
        <p className="image-container__caption">
          <span className="image-container__title">{track.title}</span>
          <span className="image-container__owner">{track.ownerName}</span>
        </p>
      ) : (
        <p className="image-container__placeholder">Select a search result to see it here.</p>
      )}

      {isPlaying && track && (
        <iframe
          ref={iframeRef}
          title={`${track.title} player`}
          src={track.embedUrl}
          className="image-container__embed"
          allow="autoplay *;"
        />
      )}
    </section>
  )
}
