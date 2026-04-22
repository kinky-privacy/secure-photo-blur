import type { LoadedImage } from '../types'

/** iOS Safari canvas pixel limit (16.7 MP) */
const IOS_CANVAS_LIMIT = 16_700_000

/** Max pixel dimension for the preview canvas — export always uses full resolution */
const MAX_DISPLAY_SIDE = 1920

/** Detect HEIC/HEIF by magic bytes or file extension */
function isHeic(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase()
  if (ext === 'heic' || ext === 'heif') return true
  if (file.type === 'image/heic' || file.type === 'image/heif') return true
  return false
}

async function convertHeic(file: File): Promise<Blob> {
  // Lazy-load heic2any only when needed
  const { default: heic2any } = await import('heic2any')
  const result = await heic2any({ blob: file, toType: 'image/png' })
  return Array.isArray(result) ? result[0] : result
}

export async function loadImage(file: File): Promise<LoadedImage> {
  let blob: Blob = file

  if (isHeic(file)) {
    blob = await convertHeic(file)
  }

  const bitmap = await createImageBitmap(blob)

  const originalWidth = bitmap.width
  const originalHeight = bitmap.height
  const pixels = originalWidth * originalHeight

  let displayWidth = originalWidth
  let displayHeight = originalHeight
  let scale = 1

  // Downscale for iOS canvas limit, then further cap for mobile preview performance
  if (pixels > IOS_CANVAS_LIMIT) {
    scale = Math.sqrt(IOS_CANVAS_LIMIT / pixels)
  }
  const maxSide = Math.max(originalWidth, originalHeight)
  if (maxSide * scale > MAX_DISPLAY_SIDE) {
    scale = MAX_DISPLAY_SIDE / maxSide
  }
  if (scale < 1) {
    displayWidth = Math.floor(originalWidth * scale)
    displayHeight = Math.floor(originalHeight * scale)
  }

  return {
    bitmap,
    originalWidth,
    originalHeight,
    displayWidth,
    displayHeight,
    scale,
    fileName: file.name,
    mimeType: file.type || 'image/jpeg',
  }
}
