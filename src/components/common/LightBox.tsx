"use client"
import { useEffect, useMemo, useRef } from "react"
import Lightbox from "yet-another-react-lightbox"
import Zoom from "yet-another-react-lightbox/plugins/zoom"
import "yet-another-react-lightbox/styles.css"
import { Download } from "lucide-react"
import { DownloadImageFromStorageAction } from "@/src/server-actions/storage/storage"
import { useServerAction } from "@/src/hooks/useServerAction"
import { toast } from "@/src/hooks/use-toast"

interface ImageLightboxProps {
  open: boolean
  images: string[]
  index: number
  onClose: () => void
  showDownload?: boolean
}

export default function ImageLightbox({
  open,
  images,
  index,
  onClose,
  showDownload = false
}: ImageLightboxProps) {
  const [, , , downloadFile] = useServerAction(DownloadImageFromStorageAction)

  const currentIndexRef = useRef(index)

  const slides = useMemo(() => images.map((src) => ({ src })), [images])

  useEffect(() => {
    if (open) {
      currentIndexRef.current = index
    }
  }, [open, index])

  const handleDownload = async () => {
    try {
      const activeSlide = slides[currentIndexRef.current]
      if (!activeSlide) return

      const result = await downloadFile(activeSlide.src)

      if (!result?.success || !result.data) {
        onClose()
        throw new Error("Failed to download file")
      }
      const { dataUrl, fileName } = result.data

      const response = await fetch(dataUrl)
      const blob = await response.blob()
      const objectUrl = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = objectUrl
      link.download = fileName || "image"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(objectUrl)
      onClose()
    } catch (error) {
      onClose()
      toast({
        title: "Download Failed",
        description: "There was an error downloading the image.",
        variant: "destructive"
      })
    }
  }

  if (!slides.length) return null

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
      on={{
        view: ({ index }) => {
          currentIndexRef.current = index
        }
      }}
      toolbar={{
        buttons: [
          ...(showDownload
            ? [
                <Download
                  key="download"
                  onClick={handleDownload}
                  className="mt-[6%] text-stone-300 w-6 h-7 hover:text-white cursor-pointer"
                />
              ]
            : []),
          "close"
        ]
      }}
    />
  )
}
