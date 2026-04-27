import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { LoadedImage, Rect, RegionShape } from '../types'
import { useTranslation } from '../i18n'

interface Props {
  kind: 'face' | 'rect'
  index: number
  rect: Rect
  angle: number
  visible: boolean
  shape: RegionShape
  image: LoadedImage
  isMobile: boolean
  onRectChange: (rect: Rect) => void
  onAngleChange: (angle: number) => void
  onToggle: () => void
  onShapeChange: (shape: RegionShape) => void
  onDelete?: () => void
  onClose: () => void
  onCancel: () => void
}

const CONTEXT     = 2.2
const HANDLE_DIST = 20

type Handle = 'move' | 'nw' | 'ne' | 'sw' | 'se' | 'rotate'

interface DragState {
  handle: Handle
  startClientX: number
  startClientY: number
  startRect: Rect
  currentRect: Rect
  thumbScale: number
  hasMoved: boolean
  startAngle: number
  currentAngle: number
  startPointerAngle: number
  rectCenterScreen: { x: number; y: number }
}

interface ThumbData {
  blobUrl: string | null
  vx: number
  vy: number
  vSize: number
}

function computeViewport(rect: Rect): { vx: number; vy: number; vSize: number } {
  const vSize = Math.max(rect.width, rect.height) * CONTEXT
  const vx = rect.x + rect.width  / 2 - vSize / 2
  const vy = rect.y + rect.height / 2 - vSize / 2
  return { vx, vy, vSize }
}

function renderThumbnailBlob(
  bitmap: ImageBitmap,
  vx: number, vy: number, vSize: number,
  scale: number, outputSize: number,
): Promise<Blob> {
  // Convert viewport to source (bitmap) coordinates
  const sx0 = vx / scale
  const sy0 = vy / scale
  const srcSize = vSize / scale

  // Clamp source to bitmap bounds — iOS Safari produces black pixels for negative source coords
  const sx = Math.max(0, sx0)
  const sy = Math.max(0, sy0)
  const sx1 = Math.min(bitmap.width, sx0 + srcSize)
  const sy1 = Math.min(bitmap.height, sy0 + srcSize)

  // Map clamped source region to destination proportionally
  const dx = ((sx - sx0) / srcSize) * outputSize
  const dy = ((sy - sy0) / srcSize) * outputSize
  const dw = ((sx1 - sx) / srcSize) * outputSize
  const dh = ((sy1 - sy) / srcSize) * outputSize

  const canvas = document.createElement('canvas')
  canvas.width  = outputSize
  canvas.height = outputSize
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, sx, sy, sx1 - sx, sy1 - sy, dx, dy, dw, dh)
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      blob => {
        canvas.width = 0
        canvas.height = 0
        blob ? resolve(blob) : reject(new Error('toBlob failed'))
      },
      'image/jpeg',
      0.9,
    )
  })
}

function rectToSvg(rect: Rect, vx: number, vy: number, vSize: number, outputSize: number) {
  const ts = outputSize / vSize
  return {
    x:  (rect.x - vx) * ts,
    y:  (rect.y - vy) * ts,
    w:  rect.width  * ts,
    h:  rect.height * ts,
    ts,
  }
}

export function RegionEditModal({
  kind, index, rect, angle, visible, shape, image, isMobile,
  onRectChange, onAngleChange, onToggle, onShapeChange, onDelete, onClose, onCancel,
}: Props) {
  const modalSize = Math.min(
    window.innerWidth  - (isMobile ? 16 : 32),
    window.innerHeight - (isMobile ? 64 : 96),
  )

  const viewport = useMemo(
    () => computeViewport(rect),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rect.x, rect.y, rect.width, rect.height],
  )

  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const blobUrlRef = useRef<string | null>(null)

  useEffect(() => {
    let cancelled = false
    renderThumbnailBlob(image.bitmap, viewport.vx, viewport.vy, viewport.vSize, image.scale, modalSize).then(blob => {
      if (cancelled) return
      if (blobUrlRef.current) { try { URL.revokeObjectURL(blobUrlRef.current) } catch {} }
      const url = URL.createObjectURL(blob)
      blobUrlRef.current = url
      setBlobUrl(url)
    })
    return () => { cancelled = true }
  }, [image, viewport.vx, viewport.vy, viewport.vSize, modalSize])

  useEffect(() => () => {
    if (blobUrlRef.current) { try { URL.revokeObjectURL(blobUrlRef.current) } catch {} }
  }, [])

  const td: ThumbData = { blobUrl, ...viewport }

  const dragRef   = useRef<DragState | null>(null)
  const svgRef    = useRef<SVGSVGElement>(null)
  const [dragDisplay, setDragDisplay] = useState<{ rect: Rect; angle: number } | null>(null)

  const onRectChangeRef  = useRef(onRectChange)
  const onAngleChangeRef = useRef(onAngleChange)
  onRectChangeRef.current  = onRectChange
  onAngleChangeRef.current = onAngleChange

  // Window-level drag listeners
  useEffect(() => {
    function onMove(e: PointerEvent) {
      const d = dragRef.current
      if (!d) return
      const moved = Math.abs(e.clientX - d.startClientX) > 2 || Math.abs(e.clientY - d.startClientY) > 2

      if (d.handle === 'rotate') {
        const dx = e.clientX - d.rectCenterScreen.x
        const dy = e.clientY - d.rectCenterScreen.y
        const newAngle = d.startAngle + (Math.atan2(dy, dx) - d.startPointerAngle)
        dragRef.current = { ...d, currentAngle: newAngle, hasMoved: moved }
        setDragDisplay({ rect: d.currentRect, angle: newAngle })
        return
      }

      const dx = (e.clientX - d.startClientX) / d.thumbScale
      const dy = (e.clientY - d.startClientY) / d.thumbScale
      let { x, y, width, height } = d.startRect

      switch (d.handle) {
        case 'move': x += dx; y += dy; break
        case 'nw':   x += dx; y += dy; width -= dx; height -= dy; break
        case 'ne':              y += dy; width += dx; height -= dy; break
        case 'sw':   x += dx;           width -= dx; height += dy; break
        case 'se':                       width += dx; height += dy; break
      }

      const newRect: Rect = { x, y, width: Math.max(10, width), height: Math.max(10, height) }
      dragRef.current = { ...d, currentRect: newRect, hasMoved: moved }
      setDragDisplay({ rect: newRect, angle: d.currentAngle })
    }

    function onUp() {
      const d = dragRef.current
      if (!d) return
      if (d.hasMoved) {
        if (d.handle === 'rotate') {
          onAngleChangeRef.current(d.currentAngle)
        } else {
          onRectChangeRef.current(d.currentRect)
        }
      }
      dragRef.current = null
      setDragDisplay(null)
    }

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup',   onUp)
    return () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup',   onUp)
    }
  }, [])

  // ESC to close
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCancel()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onCancel])

  function startDrag(e: PointerEvent, handle: Handle) {
    e.stopPropagation()
    e.preventDefault()
    ;(e.currentTarget as Element).setPointerCapture(e.pointerId)

    const liveRect  = dragDisplay?.rect  ?? rect
    const liveAngle = dragDisplay?.angle ?? angle
    const sv = rectToSvg(liveRect, td.vx, td.vy, td.vSize, modalSize)
    const ts = modalSize / td.vSize

    let startPointerAngle = 0
    let rectCenterScreen  = { x: 0, y: 0 }

    if (handle === 'rotate' && svgRef.current) {
      const bounds = svgRef.current.getBoundingClientRect()
      rectCenterScreen  = { x: bounds.left + sv.x + sv.w / 2, y: bounds.top + sv.y + sv.h / 2 }
      startPointerAngle = Math.atan2(e.clientY - rectCenterScreen.y, e.clientX - rectCenterScreen.x)
    }

    dragRef.current = {
      handle,
      startClientX: e.clientX, startClientY: e.clientY,
      startRect: { ...liveRect }, currentRect: { ...liveRect },
      thumbScale: ts, hasMoved: false,
      startAngle: liveAngle, currentAngle: liveAngle,
      startPointerAngle, rectCenterScreen,
    }
    setDragDisplay({ rect: liveRect, angle: liveAngle })
  }

  const liveRect  = dragDisplay?.rect  ?? rect
  const liveAngle = dragDisplay?.angle ?? angle
  const sv        = rectToSvg(liveRect, td.vx, td.vy, td.vSize, modalSize)
  const angleDeg  = liveAngle * 180 / Math.PI
  const rcx       = sv.x + sv.w / 2
  const rcy       = sv.y + sv.h / 2
  const hs        = 8

  const { t } = useTranslation()
  const color  = kind === 'face' ? 'var(--color-face)' : 'var(--color-info)'
  const fillRgb = kind === 'face' ? '255,51,51' : '99,179,237'
  const label  = kind === 'face' ? t('regionEdit.face', { n: index + 1 }) : t('regionEdit.region', { n: index + 1 })

  const corners: Array<{ key: Handle; cx: number; cy: number }> = [
    { key: 'nw', cx: sv.x,        cy: sv.y         },
    { key: 'ne', cx: sv.x + sv.w, cy: sv.y         },
    { key: 'sw', cx: sv.x,        cy: sv.y + sv.h  },
    { key: 'se', cx: sv.x + sv.w, cy: sv.y + sv.h  },
  ]

  return (
    <div class="overlay" onClick={onCancel}>
      <div class="rem-modal" onClick={(e: MouseEvent) => e.stopPropagation()}>
        {/* Top bar */}
        <div class="rem-topbar">
          <button class="rem-close-btn" type="button" onClick={onCancel} title={t('regionEdit.close')}>×</button>
          <span class="rem-label">{label}</span>
        </div>

        {/* Main area */}
        <div class="rem-main">
          <div class="rem-thumb-wrap" style={{ width: modalSize, height: modalSize }}>
            {td.blobUrl
              ? <img class="rem-thumb" src={td.blobUrl} alt={label} width={modalSize} height={modalSize} />
              : <div class="rem-thumb" style={{ width: modalSize, height: modalSize, background: 'var(--bg-base)' }} />
            }

            <svg
              ref={svgRef}
              class="rem-svg"
              viewBox={`0 0 ${modalSize} ${modalSize}`}
              xmlns="http://www.w3.org/2000/svg"
            >
              <g transform={`rotate(${angleDeg}, ${rcx}, ${rcy})`}>
                {/* Main rect (move handle) */}
                <rect
                  x={sv.x} y={sv.y} width={sv.w} height={sv.h}
                  fill={`rgba(${fillRgb},0.08)`}
                  stroke={color}
                  stroke-width="2"
                  stroke-dasharray="6 3"
                  style={{ cursor: 'move', pointerEvents: 'all' }}
                  onPointerDown={(e: PointerEvent) => startDrag(e, 'move')}
                />

                {/* Shape overlay */}
                {shape === 'face' && (() => {
                  const rx = sv.w / 2, ry = sv.h / 2
                  const cx = rcx, cy = rcy
                  const kB = 0.55
                  const cr = Math.min(rx, ry) * 0.55
                  const d = [
                    `M ${cx - rx + cr} ${cy - ry}`,
                    `L ${cx + rx - cr} ${cy - ry}`,
                    `Q ${cx + rx} ${cy - ry} ${cx + rx} ${cy - ry + cr}`,
                    `L ${cx + rx} ${cy}`,
                    `C ${cx + rx} ${cy + kB*ry} ${cx + kB*rx} ${cy + ry} ${cx} ${cy + ry}`,
                    `C ${cx - kB*rx} ${cy + ry} ${cx - rx} ${cy + kB*ry} ${cx - rx} ${cy}`,
                    `L ${cx - rx} ${cy - ry + cr}`,
                    `Q ${cx - rx} ${cy - ry} ${cx - rx + cr} ${cy - ry}`,
                    'Z',
                  ].join(' ')
                  return <path d={d} fill="none" stroke={color} stroke-width="2" style={{ pointerEvents: 'none' }} />
                })()}
                {shape === 'oval' && (
                  <ellipse
                    cx={rcx} cy={rcy} rx={sv.w / 2} ry={sv.h / 2}
                    fill="none" stroke={color} stroke-width="2"
                    style={{ pointerEvents: 'none' }}
                  />
                )}

                {/* Corner handles */}
                {corners.map(({ key, cx, cy }) => (
                  <rect
                    key={key}
                    x={cx - hs} y={cy - hs}
                    width={hs * 2} height={hs * 2}
                    fill={color} stroke="#fff" stroke-width="1.5" rx="2"
                    style={{ pointerEvents: 'all', cursor: `${key}-resize` }}
                    onPointerDown={(e: PointerEvent) => startDrag(e, key)}
                  />
                ))}

                {/* Rotation line + handle */}
                <line
                  x1={rcx} y1={sv.y} x2={rcx} y2={sv.y - HANDLE_DIST}
                  stroke={color} stroke-width="2" stroke-dasharray="4 3"
                  style={{ pointerEvents: 'none' }}
                />
                <circle
                  cx={rcx} cy={sv.y - HANDLE_DIST} r={hs + 2}
                  fill="white" stroke={color} stroke-width="2"
                  style={{ pointerEvents: 'all', cursor: 'grab' }}
                  onPointerDown={(e: PointerEvent) => startDrag(e, 'rotate')}
                />
              </g>
            </svg>
          </div>
        </div>

        {/* Shape selector */}
        <div class="rem-shape-row">
          {(['rectangle', 'oval', 'face'] as RegionShape[]).map(s => (
            <button
              key={s}
              class={`rem-shape-btn${shape === s ? ' rem-shape-btn--active' : ''}`}
              type="button"
              onClick={() => onShapeChange(s)}
              style={shape === s ? { borderColor: color, color } : {}}
            >
              {s === 'face' && <IconShapeFace />}
              {s === 'rectangle' && <IconShapeRect />}
              {s === 'oval' && <IconShapeOval />}
              <span class="body-text body-text--sm body-text--medium rem-shape-label">
                {s === 'face' ? t('regionEdit.shapeFace') : s === 'rectangle' ? t('regionEdit.shapeRectangle') : t('regionEdit.shapeOval')}
              </span>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div class="rem-footer">
          {visible ? (
            <button class="rem-delete-footer-btn" type="button" onClick={onDelete}>
              <IconTrash />
              {t('regionEdit.delete')}
            </button>
          ) : (
            <button class="rem-anon-btn" type="button" onClick={onToggle}>
              {t('regionEdit.anonymize')}
            </button>
          )}
          <button class="rem-save-btn" type="button" onClick={onClose}>
            {t('regionEdit.save')}
          </button>
        </div>
      </div>

      <style>{`
        .rem-modal {
          width: calc(100vw - ${isMobile ? 16 : 32}px);
          height: calc(100vh - ${isMobile ? 16 : 32}px);
          max-width: 100%;
          max-height: 100%;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }
        .rem-topbar {
          display: flex;
          align-items: center;
          gap: var(--sp-sm);
          padding: 0 var(--sp-md);
          height: 52px;
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
        }
        .rem-close-btn {
          width: 36px;
          height: 36px;
          border: none;
          border-radius: 50%;
          background: transparent;
          color: var(--text-secondary);
          font-size: 22px;
          line-height: 1;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background var(--transition), color var(--transition);
        }
        .rem-close-btn:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }
        .rem-label {
          font-size: var(--fs-lg);
          font-weight: 600;
          color: var(--text-primary);
          font-family: var(--font-sans);
          flex: 1;
        }
        .rem-shape-row {
          display: flex;
          flex-direction: row;
          gap: var(--sp-sm);
          padding: var(--sp-sm) var(--sp-md);
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }
        .rem-shape-btn {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          padding: 8px 4px;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: transparent;
          color: var(--text-muted);
          cursor: pointer;
          font-family: var(--font-sans);
          transition: border-color var(--transition), color var(--transition), background var(--transition);
        }
        .rem-shape-btn:hover {
          background: var(--bg-elevated);
          color: var(--text-secondary);
        }
        .rem-shape-btn--active {
          background: var(--bg-elevated);
        }
        .rem-shape-label {
          letter-spacing: 0.02em;
        }
        .rem-footer {
          display: flex;
          flex-direction: row;
          gap: var(--sp-sm);
          padding: var(--sp-md);
          border-top: 1px solid var(--border);
          flex-shrink: 0;
        }
        .rem-save-btn {
          flex: 1;
          padding: 10px 0;
          border: none;
          border-radius: var(--radius);
          background: var(--accent);
          color: #fff;
          font-size: var(--fs-lg);
          font-weight: 600;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: opacity var(--transition);
        }
        .rem-save-btn:hover {
          opacity: 0.85;
        }
        .rem-anon-btn {
          flex: 1;
          padding: 8px 0;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: var(--color-error);
          color: #fff;
          font-size: var(--fs-md);
          font-weight: 600;
          font-family: var(--font-sans);
          cursor: pointer;
          transition: background var(--transition);
        }
        .rem-anon-btn:hover {
          background: var(--color-error-dark);
        }
        .rem-delete-footer-btn {
          flex: 1;
          padding: 8px 0;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          background: transparent;
          color: var(--text-secondary);
          font-size: var(--fs-md);
          font-weight: 600;
          font-family: var(--font-sans);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          transition: background var(--transition), border-color var(--transition), color var(--transition);
        }
        .rem-delete-footer-btn:hover {
          background: rgba(255,255,255,0.06);
          border-color: var(--text-secondary);
        }
        .rem-main {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: var(--bg-base);
          padding: var(--sp-md);
        }
        .rem-thumb-wrap {
          position: relative;
          flex-shrink: 0;
        }
        .rem-thumb {
          display: block;
          border-radius: var(--radius);
          pointer-events: none;
          object-fit: cover;
        }
        .rem-svg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          pointer-events: none;
          overflow: visible;
        }
      `}</style>
    </div>
  )
}

function IconShapeRect() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="5" width="18" height="14" rx="2"/>
    </svg>
  )
}

function IconShapeOval() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
      <ellipse cx="12" cy="12" rx="9" ry="6"/>
    </svg>
  )
}

function IconShapeFace() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M5 7 Q5 3 12 3 Q19 3 19 7 L19 14 Q19 21 12 21 Q5 21 5 14 Z"/>
    </svg>
  )
}

function IconTrash() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
      <path d="M10 11v6M14 11v6"/>
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
    </svg>
  )
}
