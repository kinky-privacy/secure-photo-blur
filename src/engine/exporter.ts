import type { Action, ExportFormat, LoadedImage } from '../types'
import { renderForExport } from './canvas-renderer'

function isMobileDevice(): boolean {
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent)
}

function getExportFileName(original: string, format: ExportFormat): string {
  const base = original.replace(/\.[^.]+$/, '')
  return `${base}-blurred.${format === 'jpeg' ? 'jpg' : 'png'}`
}

export async function exportImage(
  image: LoadedImage,
  actions: Action[],
  format: ExportFormat,
): Promise<void> {
  const blob = await renderForExport(image, actions, format)
  const fileName = getExportFileName(image.fileName, format)

  // Try Web Share API on mobile (opens native share sheet for "Save to Photos" etc.)
  if (isMobileDevice() && navigator.share && navigator.canShare) {
    const file = new File([blob], fileName, { type: blob.type })
    if (navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Blurred photo' })
        return
      } catch (e) {
        // User cancelled or share failed — fall through to download
        if ((e as Error).name !== 'AbortError') {
          if (import.meta.env.DEV) console.warn('Share failed, falling back to download', e)
        } else {
          return // User cancelled
        }
      }
    }
  }

  // Fallback: trigger download
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  // Revoke after short delay to ensure download starts
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
