import { useState } from 'preact/hooks'
import { Landing } from './components/landing'
import { Editor } from './components/editor'
import type { LoadedImage } from './types'

export function App() {
  const [image, setImage] = useState<LoadedImage | null>(null)

  function handleImageLoaded(img: LoadedImage) {
    setImage(img)
  }

  function handleReset() {
    setImage(null)
  }

  return (
    <>
      {image ? (
        <Editor image={image} onReset={handleReset} onNewImage={handleImageLoaded} />
      ) : (
        <Landing onImageLoaded={handleImageLoaded} />
      )}

    </>
  )
}
