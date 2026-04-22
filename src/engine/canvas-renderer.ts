import type { Action, LoadedImage, Rect, RegionShape } from '../types'
import { applyBlurToRegion, applyBlurToEllipseRegion, applyBlurToOvalRegion, applyBlurToRotatedRectRegion, applyBrushStroke } from './blur-engine'

/** Compute the bounding box that a blur function will operate on (matching its internal expansion). */
function actionBbox(rect: Rect, shape: RegionShape, angle: number, canvasW: number, canvasH: number) {
  const x = Math.max(0, Math.floor(rect.x))
  const y = Math.max(0, Math.floor(rect.y))
  const w = Math.min(canvasW - x, Math.ceil(rect.width))
  const h = Math.min(canvasH - y, Math.ceil(rect.height))
  const halfW = w / 2
  const halfH = h / 2
  const cx = x + halfW
  const cy = y + halfH

  let ex: number, ey: number, ew: number, eh: number

  if (shape === 'face') {
    const feather = Math.max(3, Math.round(Math.min(halfW, halfH) * 0.08))
    ex = Math.max(0, x - feather)
    ey = Math.max(0, y - feather)
    ew = Math.min(canvasW - ex, w + 2 * feather)
    eh = Math.min(canvasH - ey, h + 2 * feather)
  } else if (shape === 'oval' || angle !== 0) {
    const feather = shape === 'oval'
      ? Math.max(3, Math.round(Math.min(halfW, halfH) * 0.06))
      : Math.max(3, Math.round(Math.min(halfW, halfH) * 0.04))
    const diagonal = Math.sqrt(halfW * halfW + halfH * halfH)
    ex = Math.max(0, Math.floor(cx - diagonal - feather))
    ey = Math.max(0, Math.floor(cy - diagonal - feather))
    ew = Math.min(canvasW - ex, Math.ceil(2 * (diagonal + feather)))
    eh = Math.min(canvasH - ey, Math.ceil(2 * (diagonal + feather)))
  } else {
    const feather = Math.max(3, Math.round(Math.min(w, h) * 0.04))
    ex = Math.max(0, x - feather)
    ey = Math.max(0, y - feather)
    ew = Math.min(canvasW - ex, w + 2 * feather)
    eh = Math.min(canvasH - ey, h + 2 * feather)
  }

  return { bboxX: ex, bboxY: ey, bboxW: ew, bboxH: eh }
}

function resolveShape(action: Action): RegionShape {
  if (action.type === 'brush-stroke') return 'rectangle'
  if (action.shape) return action.shape
  return action.type === 'auto-face' ? 'face' : 'rectangle'
}

/** Render all committed actions onto the canvas at display scale */
export function renderToCanvas(
  canvas: HTMLCanvasElement,
  image: LoadedImage,
  actions: Action[],
  displayScale: number, // canvas pixels per original image pixel
) {
  const ctx = canvas.getContext('2d', { willReadFrequently: true })
  if (!ctx) return

  const w = image.displayWidth * displayScale
  const h = image.displayHeight * displayScale

  if (canvas.width !== Math.round(w) || canvas.height !== Math.round(h)) {
    canvas.width = Math.round(w)
    canvas.height = Math.round(h)
  }

  ctx.drawImage(image.bitmap, 0, 0, canvas.width, canvas.height)

  for (let i = 0; i < actions.length; i++) {
    const action = actions[i]
    applyActionToCtx(ctx, action, canvas.width, canvas.height, displayScale)
  }

}

/** Apply a single action to a canvas context (both preview and export use this) */
export function applyActionToCtx(
  ctx: CanvasRenderingContext2D,
  action: Action,
  canvasW: number,
  canvasH: number,
  scale: number, // original→canvas scale
) {
  switch (action.type) {
    case 'brush-stroke': {
      const scaledPoints = action.points.map(p => ({ x: p.x * scale, y: p.y * scale }))
      applyBrushStroke(ctx, scaledPoints, action.brushSize * scale, action.method)
      break
    }
    case 'rectangle':
    case 'auto-face': {
      const rect: Rect = {
        x: action.rect.x * scale,
        y: action.rect.y * scale,
        width: action.rect.width * scale,
        height: action.rect.height * scale,
      }

      const paddedRect = rect

      const angle = action.type === 'auto-face' || action.type === 'rectangle' ? (action.angle ?? 0) : 0
      const cx = paddedRect.x + paddedRect.width / 2
      const cy = paddedRect.y + paddedRect.height / 2
      const shape = resolveShape(action)

      if (action.method === 'gaussian') {
        const blur = Math.max(8, Math.round(paddedRect.width / 6))
        const frx = paddedRect.width / 2
        const fry = paddedRect.height / 2
        const featherWidth = shape === 'face'
          ? Math.max(3, Math.round(Math.min(frx, fry) * 0.08))
          : shape === 'oval'
            ? Math.max(3, Math.round(Math.min(frx, fry) * 0.06))
            : Math.max(3, Math.round(Math.min(frx, fry) * 0.04))

        // Blur the entire canvas into a temp offscreen canvas
        const blurCanvas = new OffscreenCanvas(canvasW, canvasH)
        const blurCtx = blurCanvas.getContext('2d')!
        blurCtx.filter = `blur(${blur}px)`
        blurCtx.drawImage(ctx.canvas, 0, 0)
        blurCtx.filter = 'none'

        // Draw the shape mask (solid fill)
        const maskCanvas = new OffscreenCanvas(canvasW, canvasH)
        const maskCtx = maskCanvas.getContext('2d')!
        maskCtx.fillStyle = '#fff'
        if (shape === 'face') {
          const fcr = Math.min(frx, fry) * 0.55
          const kB = 0.55
          maskCtx.save()
          maskCtx.translate(cx, cy)
          maskCtx.rotate(angle)
          maskCtx.beginPath()
          maskCtx.moveTo(-frx + fcr, -fry)
          maskCtx.lineTo(frx - fcr, -fry)
          maskCtx.quadraticCurveTo(frx, -fry, frx, -fry + fcr)
          maskCtx.lineTo(frx, 0)
          maskCtx.bezierCurveTo(frx, kB * fry, kB * frx, fry, 0, fry)
          maskCtx.bezierCurveTo(-kB * frx, fry, -frx, kB * fry, -frx, 0)
          maskCtx.lineTo(-frx, -fry + fcr)
          maskCtx.quadraticCurveTo(-frx, -fry, -frx + fcr, -fry)
          maskCtx.closePath()
          maskCtx.fill()
          maskCtx.restore()
        } else if (shape === 'oval') {
          maskCtx.save()
          maskCtx.translate(cx, cy)
          maskCtx.rotate(angle)
          maskCtx.beginPath()
          maskCtx.ellipse(0, 0, frx, fry, 0, 0, Math.PI * 2)
          maskCtx.fill()
          maskCtx.restore()
        } else if (angle !== 0) {
          maskCtx.save()
          maskCtx.translate(cx, cy)
          maskCtx.rotate(angle)
          maskCtx.fillRect(-paddedRect.width / 2, -paddedRect.height / 2, paddedRect.width, paddedRect.height)
          maskCtx.restore()
        } else {
          maskCtx.fillRect(paddedRect.x, paddedRect.y, paddedRect.width, paddedRect.height)
        }

        // Soften mask edges to create the feather
        const softMask = new OffscreenCanvas(canvasW, canvasH)
        const softCtx = softMask.getContext('2d')!
        softCtx.filter = `blur(${featherWidth}px)`
        softCtx.drawImage(maskCanvas, 0, 0)

        // Apply soft mask to blurred content, then draw onto main canvas
        blurCtx.globalCompositeOperation = 'destination-in'
        blurCtx.drawImage(softMask, 0, 0)
        ctx.drawImage(blurCanvas, 0, 0)
      } else {
        const { bboxX, bboxY, bboxW, bboxH } = actionBbox(paddedRect, shape, angle, canvasW, canvasH)
        const imageData = ctx.getImageData(bboxX, bboxY, bboxW, bboxH)
        if (shape === 'face') {
          applyBlurToEllipseRegion(imageData.data, canvasW, canvasH, paddedRect, action.method, undefined, angle, bboxX, bboxY, bboxW)
        } else if (shape === 'oval') {
          applyBlurToOvalRegion(imageData.data, canvasW, canvasH, paddedRect, action.method, undefined, angle, bboxX, bboxY, bboxW)
        } else if (angle !== 0) {
          applyBlurToRotatedRectRegion(imageData.data, canvasW, canvasH, paddedRect, action.method, undefined, angle, bboxX, bboxY, bboxW)
        } else {
          const rectFeather = Math.max(3, Math.round(Math.min(paddedRect.width, paddedRect.height) * 0.04))
          applyBlurToRegion(imageData.data, canvasW, canvasH, paddedRect, action.method, undefined, rectFeather, bboxX, bboxY, bboxW)
        }
        ctx.putImageData(imageData, bboxX, bboxY)
      }
      break
    }
  }
}

/** Full-resolution export render */
export async function renderForExport(
  image: LoadedImage,
  actions: Action[],
  format: 'jpeg' | 'png',
): Promise<Blob> {
  const canvas = document.createElement('canvas')
  canvas.width = image.originalWidth
  canvas.height = image.originalHeight
  const ctx = canvas.getContext('2d', { willReadFrequently: true })!

  ctx.drawImage(image.bitmap, 0, 0, image.originalWidth, image.originalHeight)

  // Scale: original coords → original canvas (scale = 1 since working at full res)
  const exportScale = 1 / image.scale // display → original
  for (const action of actions) {
    applyActionToCtx(ctx, action, canvas.width, canvas.height, exportScale)
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('Export failed'))
      },
      format === 'jpeg' ? 'image/jpeg' : 'image/png',
      format === 'jpeg' ? 0.85 : undefined,
    )
  })
}
