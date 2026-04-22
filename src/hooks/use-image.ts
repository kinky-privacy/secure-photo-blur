import { useState } from 'preact/hooks'
import { loadImage } from '../engine/image-loader'
import type { LoadedImage } from '../types'

export function useImage() {
  const [image, setImage] = useState<LoadedImage | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load(file: File) {
    setError(null)
    setLoading(true)
    try {
      const img = await loadImage(file)
      setImage(img)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load image')
    } finally {
      setLoading(false)
    }
  }

  function clear() {
    setImage(null)
    setError(null)
  }

  return { image, loading, error, load, clear }
}
