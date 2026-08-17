import type { TrackResult } from '../../api/types'
import './ImageContainer.css'

export interface ImageContainerProps {
  track: TrackResult | null
  isPlaying: boolean
  onPlay: () => void
}

export function ImageContainer({ track, isPlaying, onPlay }: ImageContainerProps) {
  return (
    <section className="image-container" aria-labelledby="image-container-heading">
      <h2 id="image-container-heading" className="visually-hidden">
        Now viewing
      </h2>
      {track ? (
        <>
          <button
            type="button"
            className="image-container__image-button"
            onClick={onPlay}
            aria-label={`Play ${track.title} by ${track.ownerName}`}
          >
            <img src={track.imageUrl} alt="" className="image-container__image" />
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
        </>
      ) : (
        <p className="image-container__placeholder">Select a search result to see it here.</p>
      )}
    </section>
  )
}
