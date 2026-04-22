import type { FaceDetectionResult, LoadedImage } from '../types'

let humanInstance: import('@vladmandic/human').Human | null = null

/** Minimal @vladmandic/human config — only BlazeFace, models self-hosted */
function getConfig() {
  return {
    backend: 'webgl' as const,
    // Models served locally from /models/ — works offline after first cache
    modelBasePath: `${window.location.origin}/models/`,
    debug: false,
    async: true,
    face: {
      enabled: true,
      detector: { enabled: true, rotation: false, maxDetected: 20, skipFrames: 0 },
      mesh: { enabled: false },
      iris: { enabled: false },
      emotion: { enabled: false },
      description: { enabled: false },
      age: { enabled: false },
      gender: { enabled: false },
      antispoof: { enabled: false },
      liveness: { enabled: false },
    },
    body: { enabled: false },
    hand: { enabled: false },
    object: { enabled: false },
    gesture: { enabled: false },
    segmentation: { enabled: false },
  }
}

async function getHuman() {
  if (humanInstance) return humanInstance
  const { Human } = await import('@vladmandic/human')
  humanInstance = new Human(getConfig())
  await humanInstance.load()
  await humanInstance.warmup()
  return humanInstance
}

export async function detectFaces(image: LoadedImage): Promise<FaceDetectionResult[]> {
  const human = await getHuman()

  // Draw image to a temporary canvas for detection
  const canvas = document.createElement('canvas')
  canvas.width = image.displayWidth
  canvas.height = image.displayHeight
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(image.bitmap, 0, 0, image.displayWidth, image.displayHeight)

  const result = await human.detect(canvas)

  const faces: FaceDetectionResult[] = []
  for (const face of result.face ?? []) {
    // face.box = [x, y, width, height] in input canvas pixel coordinates
    const box = face.box
    if (!box || box[2] === 0 || box[3] === 0) continue
    faces.push({
      rect: {
        x: box[0],
        y: box[1],
        width: box[2],
        height: box[3],
      },
      confidence: face.score ?? 0,
    })
  }

  // Cleanup temporary canvas
  canvas.width = 0
  canvas.height = 0

  return faces
}
