import { useEffect, useRef } from 'preact/hooks'
import type { RefObject } from 'preact'
import type { Action, ActiveTool, LoadedImage } from '../types'
import type { Transform } from '../hooks/use-canvas-transform'
import { renderToCanvas } from '../engine/canvas-renderer'

interface Props {
  image: LoadedImage
  actions: Action[]
  transform: Transform
  activeTool: ActiveTool
  canvasRef: RefObject<HTMLCanvasElement>
  onPointerDown: (e: PointerEvent) => void
  onPointerMove: (e: PointerEvent) => void
  onPointerUp: (e: PointerEvent) => void
  onPointerCancel: (e: PointerEvent) => void
  onWheel: (e: WheelEvent) => void
  renderKey: number
}

export function CanvasView(props: Props) {
  const {
    image, actions, transform, activeTool, canvasRef,
    onPointerDown, onPointerMove, onPointerUp, onPointerCancel,
    onWheel, renderKey,
  } = props

  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    renderToCanvas(canvas, image, actions, 1)
  }, [actions, renderKey, image])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [onWheel])

  const cursor = activeTool === 'rectangle' ? 'crosshair' : 'default'
  const s = transform.scale

  return (
    <div ref={containerRef} class="canvas-container">
      <div
        class="canvas-transform"
        style={{
          transform: `translate(${transform.x}px, ${transform.y}px) scale(${s})`,
          transformOrigin: '0 0',
          position: 'absolute',
        }}
      >
        <canvas
          ref={canvasRef}
          class="canvas-main"
          style={{ cursor, display: 'block' }}
          width={image.displayWidth}
          height={image.displayHeight}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
        />

      </div>

      <style>{`
        .canvas-container {
          flex: 1;
          position: relative;
          overflow: hidden;
          background: #111;
          touch-action: none;
        }
        .canvas-main {
          user-select: none;
          -webkit-user-select: none;
        }
      `}</style>
    </div>
  )
}
