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
  fromRadius?: string
  toRadius?: string
  onComplete: () => void
}

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
