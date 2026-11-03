import sharp from "sharp"
import { randomUUID } from "crypto"
import { TypeSafeImageAsset, UploadedImage } from "../types/interface"

// TypeSafe image rules: PNG/JPEG only, each side 280-1568 px, EXIF rotation is not applied.
// Docs: https://docs.typesafe.ai/go/images.md
const MIN_SIDE = 280
const MAX_SIDE = 1568
const MAX_IMAGES = 4

export type PreparedImage = { ref: string; asset: TypeSafeImageAsset }

// Turns uploaded images (data URLs from the post form) into upright JPEGs sized for TypeSafe.
// Only the first MAX_IMAGES images are checked; images that can't be converted are skipped.
export async function prepareImagesForTypeSafe(
  files: UploadedImage[] = []
): Promise<PreparedImage[]> {
  const images = files
    .filter((f) => f.fileType?.startsWith("image/"))
    .slice(0, MAX_IMAGES)

  const prepared = await Promise.all(images.map((f) => toTypeSafeJpeg(f)))
  return prepared.filter((img): img is PreparedImage => img !== null)
}

async function toTypeSafeJpeg(
  file: UploadedImage
): Promise<PreparedImage | null> {
  try {
    // strip the "data:image/png;base64," prefix
    const base64 = file.fileBase64.includes(",")
      ? file.fileBase64.split(",")[1]
      : file.fileBase64

    // rotate() applies EXIF orientation so the pixels are upright
    const { data, info } = await sharp(Buffer.from(base64, "base64"))
      .rotate()
      .toBuffer({ resolveWithObject: true })

    const scale = fitScale(info.width, info.height)
    if (!scale) return null

    const jpeg = await sharp(data)
      .resize(Math.round(info.width * scale), Math.round(info.height * scale))
      .flatten({ background: "#ffffff" }) // transparent PNGs get a white background
      .jpeg({ quality: 85 })
      .toBuffer()

    return {
      ref: `img-${randomUUID()}`,
      asset: {
        type: "image",
        format: "jpg",
        data_base64: jpeg.toString("base64")
      }
    }
  } catch (error: any) {
    console.error("[moderation] Could not prepare image:", error?.message)
    return null
  }
}

// Scale so both sides end up within MIN_SIDE..MAX_SIDE; null when the aspect ratio makes that impossible
function fitScale(width: number, height: number): number | null {
  let scale = Math.min(1, MAX_SIDE / Math.max(width, height))
  if (Math.min(width, height) * scale < MIN_SIDE) {
    scale = MIN_SIDE / Math.min(width, height)
  }
  return Math.max(width, height) * scale <= MAX_SIDE ? scale : null
}
