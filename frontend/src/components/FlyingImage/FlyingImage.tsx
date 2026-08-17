import { motion } from 'framer-motion'
import { createPortal } from 'react-dom'

export interface FlyRect {
  top: number
  left: number
  width: number
  height: number
}

export interface FlyingImageProps {
  src: string
  from: FlyRect
  to: FlyRect
  /** CSS border-radius at the start/end of the flight, e.g. the list
   * thumbnail's rounded square vs. the container's full circle. */
  fromRadius?: string
  toRadius?: string
  onComplete: () => void
}

// Renders a cloned <img> into document.body (via a portal) and animates it
// from `from` to `to` using `position: fixed`. Rendering at the body level
// - rather than in place inside the results list / image container - means
// the flight isn't clipped by any ancestor's `overflow: hidden` or stuck
// behind other elements' stacking contexts, which is what made the previous
// in-place `layoutId` shared-element animation look like it only moved
// inside its own little box.
export function FlyingImage({ src, from, to, fromRadius = '10px', toRadius = '10px', onComplete }: FlyingImageProps) {
  return createPortal(
    <motion.img
      src={src}
      alt=""
      aria-hidden="true"
      initial={{
        top: from.top,
        left: from.left,
        width: from.width,
        height: from.height,
        borderRadius: fromRadius,
      }}
      animate={{ top: to.top, left: to.left, width: to.width, height: to.height, borderRadius: toRadius }}
      transition={{ duration: 0.45, ease: 'easeInOut' }}
      onAnimationComplete={onComplete}
      style={{
        position: 'fixed',
        margin: 0,
        objectFit: 'cover',
        zIndex: 1000,
        pointerEvents: 'none',
      }}
    />,
    document.body,
  )
}
