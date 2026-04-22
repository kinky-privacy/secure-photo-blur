import type { BlurMethod, Point, Rect } from '../types'

/** Target number of mosaic blocks across the shortest face dimension (~5×5 effective pixels). */
const TARGET_MOSAIC_BLOCKS = 5
/** Minimum block size in canvas pixels. Blocks ≤8px are trivially reversible via super-resolution. */
const MIN_MOSAIC_BLOCK = 12

function computeBlockSize(region: Rect): number {
  const shortest = Math.min(region.width, region.height)
  return Math.max(MIN_MOSAIC_BLOCK, Math.ceil(shortest / TARGET_MOSAIC_BLOCKS))
}

/** Apply mosaic pixelization to a region on ImageData */
function applyMosaic(data: Uint8ClampedArray, stride: number, region: Rect, blockSize: number, dataX = 0, dataY = 0) {
  const { x, y, width: rw, height: rh } = region
  for (let by = y; by < y + rh; by += blockSize) {
    for (let bx = x; bx < x + rw; bx += blockSize) {
      // Sample center pixel of block for color average
      let r = 0, g = 0, b = 0, count = 0
      const bxMax = Math.min(bx + blockSize, x + rw)
      const byMax = Math.min(by + blockSize, y + rh)
      for (let py = by; py < byMax; py++) {
        for (let px = bx; px < bxMax; px++) {
          const i = ((py - dataY) * stride + (px - dataX)) * 4
          r += data[i]
          g += data[i + 1]
          b += data[i + 2]
          count++
        }
      }
      if (count === 0) continue
      const ar = Math.round(r / count)
      const ag = Math.round(g / count)
      const ab = Math.round(b / count)
      for (let py = by; py < byMax; py++) {
        for (let px = bx; px < bxMax; px++) {
          const i = ((py - dataY) * stride + (px - dataX)) * 4
          data[i] = ar
          data[i + 1] = ag
          data[i + 2] = ab
        }
      }
    }
  }
}

/** Apply a brush stroke as a series of filled circles */
function applyBrushMask(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  brushSize: number,
  method: BlurMethod,
  imageData: ImageData,
  canvasWidth: number,
) {
  if (points.length === 0) return

  // Create a mask: for each pixel covered by brush, apply blur
  const mask = new OffscreenCanvas(canvasWidth, imageData.height)
  const mCtx = mask.getContext('2d', { willReadFrequently: true })!
  mCtx.fillStyle = '#000'
  mCtx.beginPath()
  const r = brushSize / 2
  for (let i = 0; i < points.length; i++) {
    mCtx.moveTo(points[i].x + r, points[i].y)
    mCtx.arc(points[i].x, points[i].y, r, 0, Math.PI * 2)
    if (i > 0) {
      // Connect consecutive points with a line for smooth stroke
      mCtx.lineTo(points[i].x, points[i].y)
    }
  }
  mCtx.fill()

  // Get bounding box of the stroke for efficiency
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
  for (const p of points) {
    minX = Math.min(minX, p.x - r)
    minY = Math.min(minY, p.y - r)
    maxX = Math.max(maxX, p.x + r)
    maxY = Math.max(maxY, p.y + r)
  }
  const rx = Math.max(0, Math.floor(minX))
  const ry = Math.max(0, Math.floor(minY))
  const rw = Math.min(canvasWidth - rx, Math.ceil(maxX - minX) + Math.ceil(r) * 2)
  const rh = Math.min(imageData.height - ry, Math.ceil(maxY - minY) + Math.ceil(r) * 2)

  if (rw <= 0 || rh <= 0) return

  const maskData = mCtx.getImageData(rx, ry, rw, rh)
  const clampedRegion: Rect = { x: rx, y: ry, width: rw, height: rh }

  if (method === 'solid' || method === 'solid-avg') {
    let fillR = 0, fillG = 0, fillB = 0
    if (method === 'solid-avg') {
      let totalR = 0, totalG = 0, totalB = 0, count = 0
      for (let py = ry; py < ry + rh; py++) {
        for (let px = rx; px < rx + rw; px++) {
          const mi = ((py - ry) * rw + (px - rx)) * 4
          if (maskData.data[mi] > 128) {
            const i = (py * canvasWidth + px) * 4
            totalR += imageData.data[i]
            totalG += imageData.data[i + 1]
            totalB += imageData.data[i + 2]
            count++
          }
        }
      }
      if (count > 0) {
        fillR = Math.round(totalR / count)
        fillG = Math.round(totalG / count)
        fillB = Math.round(totalB / count)
      }
    }
    for (let py = ry; py < ry + rh; py++) {
      for (let px = rx; px < rx + rw; px++) {
        const mi = ((py - ry) * rw + (px - rx)) * 4
        if (maskData.data[mi] > 128) {
          const i = (py * canvasWidth + px) * 4
          imageData.data[i] = fillR
          imageData.data[i + 1] = fillG
          imageData.data[i + 2] = fillB
        }
      }
    }
    return
  }

  // For mosaic: apply to whole bounding rect, then mask
  const backup = new Uint8ClampedArray(imageData.data)
  applyBlurToRegion(imageData.data, canvasWidth, imageData.height, clampedRegion, method)

  // Restore pixels outside mask
  for (let py = ry; py < ry + rh; py++) {
    for (let px = rx; px < rx + rw; px++) {
      const mi = ((py - ry) * rw + (px - rx)) * 4
      if (maskData.data[mi] <= 128) {
        const i = (py * canvasWidth + px) * 4
        imageData.data[i] = backup[i]
        imageData.data[i + 1] = backup[i + 1]
        imageData.data[i + 2] = backup[i + 2]
      }
    }
  }
}

export function applyBlurToRegion(
  data: Uint8ClampedArray,
  canvasWidth: number,
  canvasHeight: number,
  region: Rect,
  method: BlurMethod,
  blockSize?: number,
  feather?: number,
  dataX = 0,
  dataY = 0,
  dataStride = canvasWidth,
) {
  // Clamp region to canvas bounds
  const x = Math.max(0, Math.floor(region.x))
  const y = Math.max(0, Math.floor(region.y))
  const w = Math.min(canvasWidth - x, Math.ceil(region.width))
  const h = Math.min(canvasHeight - y, Math.ceil(region.height))
  if (w <= 0 || h <= 0) return

  const clampedRegion = { x, y, width: w, height: h }
  const effectiveBlockSize = blockSize ?? computeBlockSize(clampedRegion)
  const featherWidth = feather ?? 0

  if (featherWidth > 0) {
    // Expand region for feather transition zone
    const ex = Math.max(0, x - featherWidth)
    const ey = Math.max(0, y - featherWidth)
    const ew = Math.min(canvasWidth - ex, w + 2 * featherWidth)
    const eh = Math.min(canvasHeight - ey, h + 2 * featherWidth)
    const expandedRegion = { x: ex, y: ey, width: ew, height: eh }

    // Backup the expanded region
    const backup = new Uint8ClampedArray(ew * eh * 4)
    for (let py = ey; py < ey + eh; py++) {
      for (let px = ex; px < ex + ew; px++) {
        const src = ((py - dataY) * dataStride + (px - dataX)) * 4
        const dst = ((py - ey) * ew + (px - ex)) * 4
        backup[dst] = data[src]; backup[dst + 1] = data[src + 1]
        backup[dst + 2] = data[src + 2]; backup[dst + 3] = data[src + 3]
      }
    }

    // Apply blur (no feather) to expanded region
    applyBlurToRegion(data, canvasWidth, canvasHeight, expandedRegion, method, effectiveBlockSize, 0, dataX, dataY, dataStride)

    // Blend per-pixel in the feather zone
    for (let py = ey; py < ey + eh; py++) {
      for (let px = ex; px < ex + ew; px++) {
        const dist = rectDistance(px, py, x, y, w, h)
        const alpha = computeFeatherAlpha(dist, featherWidth)
        if (alpha >= 1) continue
        const dstIdx = ((py - dataY) * dataStride + (px - dataX)) * 4
        const srcIdx = ((py - ey) * ew + (px - ex)) * 4
        if (alpha <= 0) {
          data[dstIdx] = backup[srcIdx]; data[dstIdx + 1] = backup[srcIdx + 1]
          data[dstIdx + 2] = backup[srcIdx + 2]; data[dstIdx + 3] = backup[srcIdx + 3]
        } else {
          const inv = 1 - alpha
          data[dstIdx]     = Math.round(alpha * data[dstIdx]     + inv * backup[srcIdx])
          data[dstIdx + 1] = Math.round(alpha * data[dstIdx + 1] + inv * backup[srcIdx + 1])
          data[dstIdx + 2] = Math.round(alpha * data[dstIdx + 2] + inv * backup[srcIdx + 2])
        }
      }
    }
    return
  }

  switch (method) {
    case 'mosaic':
      applyMosaic(data, dataStride, clampedRegion, effectiveBlockSize, dataX, dataY)
      break
    case 'solid':
      for (let py = y; py < y + h; py++) {
        for (let px = x; px < x + w; px++) {
          const i = ((py - dataY) * dataStride + (px - dataX)) * 4
          data[i] = 0
          data[i + 1] = 0
          data[i + 2] = 0
        }
      }
      break
    case 'solid-avg': {
      let totalR = 0, totalG = 0, totalB = 0, count = 0
      for (let py = y; py < y + h; py++) {
        for (let px = x; px < x + w; px++) {
          const i = ((py - dataY) * dataStride + (px - dataX)) * 4
          totalR += data[i]
          totalG += data[i + 1]
          totalB += data[i + 2]
          count++
        }
      }
      if (count > 0) {
        const avgR = Math.round(totalR / count)
        const avgG = Math.round(totalG / count)
        const avgB = Math.round(totalB / count)
        for (let py = y; py < y + h; py++) {
          for (let px = x; px < x + w; px++) {
            const i = ((py - dataY) * dataStride + (px - dataX)) * 4
            data[i] = avgR
            data[i + 1] = avgG
            data[i + 2] = avgB
          }
        }
      }
      break
    }
    case 'gaussian':
      // Gaussian is applied via canvas filter (ctx.filter) in the renderer
      // This path is only used for ImageData-level operations (export)
      applyMosaic(data, dataStride, clampedRegion, effectiveBlockSize, dataX, dataY)
      break
  }
}

/** Signed distance to an ellipse boundary. Positive = inside, negative = outside. */
function ovalDistance(lx: number, ly: number, halfW: number, halfH: number): number {
  const t = Math.sqrt(lx * lx / (halfW * halfW) + ly * ly / (halfH * halfH))
  return (1 - t) * Math.min(halfW, halfH)
}

/** Signed distance to the face shape boundary. Positive = inside, negative = outside. */
function faceShapeDistance(lx: number, ly: number, halfW: number, halfH: number, cr: number): number {
  if (ly >= 0) {
    // Bottom half: ellipse — radial approximation
    const t = Math.sqrt(lx * lx / (halfW * halfW) + ly * ly / (halfH * halfH))
    return (1 - t) * Math.min(halfW, halfH)
  }
  // Top half: rounded rectangle
  const ax = Math.abs(lx)
  if (ax > halfW - cr && ly < -(halfH - cr)) {
    // Corner region: distance to corner arc
    const ddx = ax - (halfW - cr)
    const ddy = -(ly + (halfH - cr))
    return cr - Math.sqrt(ddx * ddx + ddy * ddy)
  }
  // Flat regions: distance to nearest edge
  return Math.min(halfW - ax, halfH + ly)
}

function isInsideFaceShape(lx: number, ly: number, halfW: number, halfH: number, cr: number): boolean {
  return faceShapeDistance(lx, ly, halfW, halfH, cr) >= 0
}

/** Signed distance to a rectangle boundary. Positive = inside, negative = outside. */
function rectDistance(px: number, py: number, rx: number, ry: number, rw: number, rh: number): number {
  const inner = Math.min(px - rx, rx + rw - 1 - px, py - ry, ry + rh - 1 - py)
  if (inner >= 0) return inner
  const nx = Math.max(rx, Math.min(rx + rw - 1, px))
  const ny = Math.max(ry, Math.min(ry + rh - 1, py))
  return -Math.sqrt((px - nx) * (px - nx) + (py - ny) * (py - ny))
}

function smoothstep(edge0: number, edge1: number, x: number): number {
  const t = Math.max(0, Math.min(1, (x - edge0) / (edge1 - edge0)))
  return t * t * (3 - 2 * t)
}

/** Blend alpha from signed distance: inside (dist >= 0) -> 1, fades to 0 at -featherWidth. */
function computeFeatherAlpha(distance: number, featherWidth: number): number {
  if (distance >= 0) return 1
  if (distance <= -featherWidth) return 0
  return smoothstep(-featherWidth, 0, distance)
}

/** Apply blur only within the (optionally rotated) face shape inscribed in `region`, with feathered edges */
export function applyBlurToEllipseRegion(
  data: Uint8ClampedArray,
  canvasWidth: number,
  canvasHeight: number,
  region: Rect,
  method: BlurMethod,
  blockSize?: number,
  angle = 0,
  dataX = 0,
  dataY = 0,
  dataStride = canvasWidth,
) {
  const x = Math.max(0, Math.floor(region.x))
  const y = Math.max(0, Math.floor(region.y))
  const w = Math.min(canvasWidth - x, Math.ceil(region.width))
  const h = Math.min(canvasHeight - y, Math.ceil(region.height))
  if (w <= 0 || h <= 0) return

  const halfW = w / 2
  const halfH = h / 2
  const cr = Math.min(halfW, halfH) * 0.55
  const featherWidth = Math.max(3, Math.round(Math.min(halfW, halfH) * 0.08))
  const cx = x + halfW
  const cy = y + halfH
  const cosA = Math.cos(-angle)
  const sinA = Math.sin(-angle)

  // Expand bounding box for the feather zone (clamped to canvas)
  const ex = Math.max(0, x - featherWidth)
  const ey = Math.max(0, y - featherWidth)
  const ew = Math.min(canvasWidth - ex, w + 2 * featherWidth)
  const eh = Math.min(canvasHeight - ey, h + 2 * featherWidth)
  const expandedRegion = { x: ex, y: ey, width: ew, height: eh }
  const effectiveBlockSize = blockSize ?? computeBlockSize({ x, y, width: w, height: h })

  // Backup the expanded region before blurring
  const backup = new Uint8ClampedArray(ew * eh * 4)
  for (let py = ey; py < ey + eh; py++) {
    for (let px = ex; px < ex + ew; px++) {
      const src = ((py - dataY) * dataStride + (px - dataX)) * 4
      const dst = ((py - ey) * ew + (px - ex)) * 4
      backup[dst]     = data[src]
      backup[dst + 1] = data[src + 1]
      backup[dst + 2] = data[src + 2]
      backup[dst + 3] = data[src + 3]
    }
  }

  // Apply blur to the expanded rect (no inner feathering)
  applyBlurToRegion(data, canvasWidth, canvasHeight, expandedRegion, method, effectiveBlockSize, 0, dataX, dataY, dataStride)

  // Blend each pixel based on distance to the face shape boundary
  for (let py = ey; py < ey + eh; py++) {
    for (let px = ex; px < ex + ew; px++) {
      const dx = px - cx
      const dy = py - cy
      const lx = dx * cosA - dy * sinA
      const ly = dx * sinA + dy * cosA
      const dist = faceShapeDistance(lx, ly, halfW, halfH, cr)
      const alpha = computeFeatherAlpha(dist, featherWidth)
      if (alpha >= 1) continue
      const dstIdx = ((py - dataY) * dataStride + (px - dataX)) * 4
      const srcIdx = ((py - ey) * ew + (px - ex)) * 4
      if (alpha <= 0) {
        data[dstIdx]     = backup[srcIdx]
        data[dstIdx + 1] = backup[srcIdx + 1]
        data[dstIdx + 2] = backup[srcIdx + 2]
        data[dstIdx + 3] = backup[srcIdx + 3]
      } else {
        const inv = 1 - alpha
        data[dstIdx]     = Math.round(alpha * data[dstIdx]     + inv * backup[srcIdx])
        data[dstIdx + 1] = Math.round(alpha * data[dstIdx + 1] + inv * backup[srcIdx + 1])
        data[dstIdx + 2] = Math.round(alpha * data[dstIdx + 2] + inv * backup[srcIdx + 2])
      }
    }
  }
}

/** Apply blur only within an oval (pure ellipse) inscribed in `region`, with feathered edges */
export function applyBlurToOvalRegion(
  data: Uint8ClampedArray,
  canvasWidth: number,
  canvasHeight: number,
  region: Rect,
  method: BlurMethod,
  blockSize?: number,
  angle = 0,
  dataX = 0,
  dataY = 0,
  dataStride = canvasWidth,
) {
  const x = Math.max(0, Math.floor(region.x))
  const y = Math.max(0, Math.floor(region.y))
  const w = Math.min(canvasWidth - x, Math.ceil(region.width))
  const h = Math.min(canvasHeight - y, Math.ceil(region.height))
  if (w <= 0 || h <= 0) return

  const halfW = w / 2
  const halfH = h / 2
  const featherWidth = Math.max(3, Math.round(Math.min(halfW, halfH) * 0.06))
  const cx = x + halfW
  const cy = y + halfH
  const cosA = Math.cos(-angle)
  const sinA = Math.sin(-angle)

  const diagonal = Math.sqrt(halfW * halfW + halfH * halfH)
  const ex = Math.max(0, Math.floor(cx - diagonal - featherWidth))
  const ey = Math.max(0, Math.floor(cy - diagonal - featherWidth))
  const ew = Math.min(canvasWidth - ex, Math.ceil(2 * (diagonal + featherWidth)))
  const eh = Math.min(canvasHeight - ey, Math.ceil(2 * (diagonal + featherWidth)))
  const expandedRegion = { x: ex, y: ey, width: ew, height: eh }
  const effectiveBlockSize = blockSize ?? computeBlockSize({ x, y, width: w, height: h })

  const backup = new Uint8ClampedArray(ew * eh * 4)
  for (let py = ey; py < ey + eh; py++) {
    for (let px = ex; px < ex + ew; px++) {
      const src = ((py - dataY) * dataStride + (px - dataX)) * 4
      const dst = ((py - ey) * ew + (px - ex)) * 4
      backup[dst]     = data[src]
      backup[dst + 1] = data[src + 1]
      backup[dst + 2] = data[src + 2]
      backup[dst + 3] = data[src + 3]
    }
  }

  applyBlurToRegion(data, canvasWidth, canvasHeight, expandedRegion, method, effectiveBlockSize, 0, dataX, dataY, dataStride)

  for (let py = ey; py < ey + eh; py++) {
    for (let px = ex; px < ex + ew; px++) {
      const dx = px - cx
      const dy = py - cy
      const lx = dx * cosA - dy * sinA
      const ly = dx * sinA + dy * cosA
      const dist = ovalDistance(lx, ly, halfW, halfH)
      const alpha = computeFeatherAlpha(dist, featherWidth)
      if (alpha >= 1) continue
      const dstIdx = ((py - dataY) * dataStride + (px - dataX)) * 4
      const srcIdx = ((py - ey) * ew + (px - ex)) * 4
      if (alpha <= 0) {
        data[dstIdx]     = backup[srcIdx]
        data[dstIdx + 1] = backup[srcIdx + 1]
        data[dstIdx + 2] = backup[srcIdx + 2]
        data[dstIdx + 3] = backup[srcIdx + 3]
      } else {
        const inv = 1 - alpha
        data[dstIdx]     = Math.round(alpha * data[dstIdx]     + inv * backup[srcIdx])
        data[dstIdx + 1] = Math.round(alpha * data[dstIdx + 1] + inv * backup[srcIdx + 1])
        data[dstIdx + 2] = Math.round(alpha * data[dstIdx + 2] + inv * backup[srcIdx + 2])
      }
    }
  }
}

/** Apply blur within a rotated rectangle region, with feathered edges */
export function applyBlurToRotatedRectRegion(
  data: Uint8ClampedArray,
  canvasWidth: number,
  canvasHeight: number,
  region: Rect,
  method: BlurMethod,
  blockSize?: number,
  angle = 0,
  dataX = 0,
  dataY = 0,
  dataStride = canvasWidth,
) {
  const x = Math.max(0, Math.floor(region.x))
  const y = Math.max(0, Math.floor(region.y))
  const w = Math.min(canvasWidth - x, Math.ceil(region.width))
  const h = Math.min(canvasHeight - y, Math.ceil(region.height))
  if (w <= 0 || h <= 0) return

  const halfW = w / 2
  const halfH = h / 2
  const featherWidth = Math.max(3, Math.round(Math.min(halfW, halfH) * 0.04))
  const cx = x + halfW
  const cy = y + halfH
  const cosA = Math.cos(-angle)
  const sinA = Math.sin(-angle)

  const diagonal = Math.sqrt(halfW * halfW + halfH * halfH)
  const ex = Math.max(0, Math.floor(cx - diagonal - featherWidth))
  const ey = Math.max(0, Math.floor(cy - diagonal - featherWidth))
  const ew = Math.min(canvasWidth - ex, Math.ceil(2 * (diagonal + featherWidth)))
  const eh = Math.min(canvasHeight - ey, Math.ceil(2 * (diagonal + featherWidth)))
  const expandedRegion = { x: ex, y: ey, width: ew, height: eh }
  const effectiveBlockSize = blockSize ?? computeBlockSize({ x, y, width: w, height: h })

  const backup = new Uint8ClampedArray(ew * eh * 4)
  for (let py = ey; py < ey + eh; py++) {
    for (let px = ex; px < ex + ew; px++) {
      const src = ((py - dataY) * dataStride + (px - dataX)) * 4
      const dst = ((py - ey) * ew + (px - ex)) * 4
      backup[dst]     = data[src]
      backup[dst + 1] = data[src + 1]
      backup[dst + 2] = data[src + 2]
      backup[dst + 3] = data[src + 3]
    }
  }

  applyBlurToRegion(data, canvasWidth, canvasHeight, expandedRegion, method, effectiveBlockSize, 0, dataX, dataY, dataStride)

  for (let py = ey; py < ey + eh; py++) {
    for (let px = ex; px < ex + ew; px++) {
      const dx = px - cx
      const dy = py - cy
      const lx = dx * cosA - dy * sinA
      const ly = dx * sinA + dy * cosA
      const dist = Math.min(halfW - Math.abs(lx), halfH - Math.abs(ly))
      const alpha = computeFeatherAlpha(dist, featherWidth)
      if (alpha >= 1) continue
      const dstIdx = ((py - dataY) * dataStride + (px - dataX)) * 4
      const srcIdx = ((py - ey) * ew + (px - ex)) * 4
      if (alpha <= 0) {
        data[dstIdx]     = backup[srcIdx]
        data[dstIdx + 1] = backup[srcIdx + 1]
        data[dstIdx + 2] = backup[srcIdx + 2]
        data[dstIdx + 3] = backup[srcIdx + 3]
      } else {
        const inv = 1 - alpha
        data[dstIdx]     = Math.round(alpha * data[dstIdx]     + inv * backup[srcIdx])
        data[dstIdx + 1] = Math.round(alpha * data[dstIdx + 1] + inv * backup[srcIdx + 1])
        data[dstIdx + 2] = Math.round(alpha * data[dstIdx + 2] + inv * backup[srcIdx + 2])
      }
    }
  }
}

export function applyBrushStroke(
  ctx: CanvasRenderingContext2D,
  points: Point[],
  brushSize: number,
  method: BlurMethod,
) {
  if (method === 'gaussian') {
    const w = ctx.canvas.width
    const h = ctx.canvas.height
    const r = brushSize / 2

    const blurCanvas = new OffscreenCanvas(w, h)
    const blurCtx = blurCanvas.getContext('2d')!
    blurCtx.filter = `blur(${Math.round(brushSize / 3)}px)`
    blurCtx.drawImage(ctx.canvas, 0, 0)
    blurCtx.filter = 'none'

    const maskCanvas = new OffscreenCanvas(w, h)
    const maskCtx = maskCanvas.getContext('2d')!
    maskCtx.fillStyle = '#fff'
    maskCtx.beginPath()
    for (const p of points) {
      maskCtx.arc(p.x, p.y, r, 0, Math.PI * 2)
    }
    maskCtx.fill()

    blurCtx.globalCompositeOperation = 'destination-in'
    blurCtx.drawImage(maskCanvas, 0, 0)

    ctx.drawImage(blurCanvas, 0, 0)
    return
  }

  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
  applyBrushMask(ctx, points, brushSize, method, imageData, ctx.canvas.width)
  ctx.putImageData(imageData, 0, 0)
}
