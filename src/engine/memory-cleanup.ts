/** Best-effort memory cleanup after export */
export function cleanupCanvas(canvas: HTMLCanvasElement) {
  try {
    const ctx = canvas.getContext('2d')
    if (ctx) {
      const data = ctx.getImageData(0, 0, canvas.width, canvas.height)
      data.data.fill(0)
      ctx.putImageData(data, 0, 0)
      ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    canvas.width = 0
    canvas.height = 0
  } catch {
    // Ignore errors during cleanup
  }
}

export function revokeObjectUrls(urls: string[]) {
  for (const url of urls) {
    try { URL.revokeObjectURL(url) } catch { /* ignore */ }
  }
}

export function cleanupImageBitmap(bitmap: ImageBitmap) {
  try { bitmap.close() } catch { /* ignore */ }
}
