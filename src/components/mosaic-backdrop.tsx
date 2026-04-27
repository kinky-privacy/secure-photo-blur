import { useEffect, useRef, useState } from 'preact/hooks'

const CELL_SIZE = 12
const UPDATE_INTERVAL = 80
const TRANSITION_MS = 150
const CELLS_PER_TICK = 8

// Theme-aligned palette: [r, g, b]
const PALETTE: [number, number, number][] = [
  [0x1a, 0x1a, 0x1a],
  [0x24, 0x24, 0x24],
  [0x2e, 0x2e, 0x2e],
  [0x33, 0x33, 0x33],
  [0x1f, 0x1f, 0x1f],
  [0x2a, 0x1a, 0x1a],
  [0x3a, 0x1a, 0x1a],
  [0x8b, 0x00, 0x00],
  [0x4a, 0x10, 0x10],
  [0x35, 0x20, 0x20],
]

function randomColor(): [number, number, number] {
  const i = Math.random() < 0.8
    ? Math.floor(Math.random() * 5)
    : 5 + Math.floor(Math.random() * 5)
  return PALETTE[i]
}

interface Cell {
  r: number; g: number; b: number
  tr: number; tg: number; tb: number
  progress: number
  visible: boolean
  weight: number
  a: number
}

// Spandrel in the bottom-right corner with density gradient.
// Core shape: region OUTSIDE a quarter-circle arc, INSIDE [0,R]x[0,R].
// Density fades from 1 at the corner vertex to 0 at the arc boundary.
function desktopVisible(col: number, row: number, cols: number, rows: number, _jitter: number): boolean {
  const shortDim = Math.min(cols - 1, rows - 1)
  const ndx = (cols - 1 - col) / shortDim  // 0 at right edge, increases left
  const ndy = (rows - 1 - row) / shortDim  // 0 at bottom edge, increases up

  const Ry = 1.25
  const Rx = Ry * 1.5

  if (ndx > Rx || ndy > Ry) return false

  // Normalize to unit circle (ellipse → circle mapping)
  const cx = (ndx - Rx) / Rx
  const cy = (ndy - Ry) / Ry
  const distSq = cx * cx + cy * cy
  if (distSq <= 1) return false

  // Dense near corner, sparse near arc
  const excess = Math.sqrt(distSq) - 1
  const maxExcess = Math.SQRT2 - 1  // at corner vertex
  const t = excess / maxExcess  // 0 at arc, 1 at corner

  return Math.random() < t
}

// Mobile: full width, linear gradient bottom → top (dense to sparse)
function mobileVisible(row: number, rows: number): boolean {
  const ny = (rows - 1 - row) / (rows - 1)  // 0 at bottom, 1 at top
  return Math.random() < 0.3 * (1 - ny)
}

export function MosaicBackdrop() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [epoch, setEpoch] = useState(0)

  useEffect(() => {
    const onResize = () => setEpoch(e => e + 1)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const reducedMotion = mq.matches

    const isMobile = window.innerWidth < 768
    const canvasW = window.innerWidth
    const canvasH = window.innerHeight

    canvas.width = canvasW
    canvas.height = canvasH

    const cellSize = CELL_SIZE
    const cols = Math.ceil(canvasW / cellSize)
    const rows = Math.ceil(canvasH / cellSize)
    const total = cols * rows

    const jitters: number[] = []
    for (let i = 0; i < total; i++) {
      jitters.push(Math.random())
    }

    const cells: Cell[] = []
    const visibleIndices: number[] = []
    let totalWeight = 0

    for (let i = 0; i < total; i++) {
      const col = i % cols
      const row = Math.floor(i / cols)
      const visible = isMobile
        ? mobileVisible(row, rows)
        : desktopVisible(col, row, cols, rows, jitters[i])
      const [r, g, b] = randomColor()
      // Weight: cells near edges animate more
      const dx = (cols - 1 - col) / (cols - 1)
      const dy = (rows - 1 - row) / (rows - 1)
      const edgeDist = Math.min(dx, dy)
      const weight = visible ? 1 - edgeDist * 0.8 : 0
      // Alpha: per-cell opacity gradient
      const a = visible
        ? isMobile
          ? 1 - dy  // linear bottom-to-top
          : Math.pow(1 - Math.sqrt(dx * dx + dy * dy) / Math.SQRT2, 1.5)
        : 0
      cells.push({ r, g, b, tr: r, tg: g, tb: b, progress: 1, visible, weight, a })
      if (visible) {
        visibleIndices.push(i)
        totalWeight += weight
      }
    }

    function pickWeightedCell(): number {
      let r = Math.random() * totalWeight
      for (let k = 0; k < visibleIndices.length; k++) {
        r -= cells[visibleIndices[k]].weight
        if (r <= 0) return visibleIndices[k]
      }
      return visibleIndices[visibleIndices.length - 1]
    }

    function draw() {
      ctx!.clearRect(0, 0, canvasW, canvasH)
      for (let i = 0; i < total; i++) {
        const c = cells[i]
        if (!c.visible) continue
        const x = (i % cols) * cellSize
        const y = Math.floor(i / cols) * cellSize
        ctx!.fillStyle = `rgba(${c.r | 0},${c.g | 0},${c.b | 0},${c.a})`
        ctx!.fillRect(x, y, cellSize, cellSize)
      }
    }

    draw()
    if (reducedMotion) return

    let rafId = 0
    let lastUpdate = 0
    let prevTime = 0

    function animate(time: number) {
      const dt = prevTime ? time - prevTime : 16
      prevTime = time

      if (time - lastUpdate > UPDATE_INTERVAL) {
        lastUpdate = time
        for (let n = 0; n < CELLS_PER_TICK; n++) {
          const idx = pickWeightedCell()
          const [tr, tg, tb] = randomColor()
          cells[idx].tr = tr
          cells[idx].tg = tg
          cells[idx].tb = tb
          cells[idx].progress = 0
        }
      }

      for (let i = 0; i < total; i++) {
        const c = cells[i]
        if (!c.visible || c.progress >= 1) continue
        c.progress = Math.min(1, c.progress + dt / TRANSITION_MS)
        const t = c.progress
        c.r += (c.tr - c.r) * t * 0.1
        c.g += (c.tg - c.g) * t * 0.1
        c.b += (c.tb - c.b) * t * 0.1
      }

      draw()
      rafId = requestAnimationFrame(animate)
    }

    rafId = requestAnimationFrame(animate)

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [epoch])

  return (
    <>
      <canvas ref={canvasRef} class="mosaic-backdrop" aria-hidden="true" />
      <style>{`
        .mosaic-backdrop {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          opacity: 0;
          animation: mosaic-fadein 1s ease forwards;
          z-index: 0;
        }
        @keyframes mosaic-fadein {
          to { opacity: 0.5; }
        }
      `}</style>
    </>
  )
}
