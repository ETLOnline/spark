"use client"

import Lightbox from "yet-another-react-lightbox"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"

interface ImageLightboxProps {
  open: boolean
  images: string[]
  index: number
  onClose: () => void
}

export default function ImageLightbox({
  open,
  images,
  index,
  onClose
}: ImageLightboxProps) {
  const slides = images.map((src) => ({ src }))

  return (
    <Lightbox
      open={open}
      index={index}
      close={onClose}
      slides={slides}
      plugins={[Zoom]}
      portal={{ root: document.body }}
      styles={{
        container: { zIndex: 9999, pointerEvents: "auto" }
      }}
    />
  )
}
