import { useRef } from 'preact/hooks'
import type { RefObject } from 'preact'
import type { ActiveTool, BlurMethod, Point, RectangleAction } from '../types'
import type { Transform } from './use-canvas-transform'

interface Options {
  tool: ActiveTool
  method: BlurMethod
  onAddAction: (action: RectangleAction) => void
  transform: Transform
  canvasRef: RefObject<HTMLCanvasElement>
  onActionCommitted: () => void
  onPinchStart: (touches: TouchList) => void
  onPinchMove: (touches: TouchList) => void
  onPinchEnd: () => void
  defaultRectSize: number
}

function screenToImage(
  screenX: number,
  screenY: number,
  rect: DOMRect,
  transform: Transform,
): Point {
  return {
    x: (screenX - rect.left - transform.x) / transform.scale,
    y: (screenY - rect.top - transform.y) / transform.scale,
  }
}

export function usePointerDraw(opts: Options) {
  const {
    tool, method, onAddAction, transform, canvasRef, onActionCommitted,
    onPinchStart, onPinchMove, onPinchEnd, defaultRectSize,
  } = opts

  const activePointers = useRef<Map<number, PointerEvent>>(new Map())
  const clickStart = useRef<{ pt: Point; clientX: number; clientY: number } | null>(null)
  const drawing = useRef(false)

  function getContainerRect(): DOMRect | null {
    return canvasRef.current?.parentElement?.parentElement?.getBoundingClientRect() ?? null
  }

  function isPinching() {
    return activePointers.current.size >= 2
  }

  function onPointerDown(e: PointerEvent) {
    activePointers.current.set(e.pointerId, e)

    if (isPinching()) {
      drawing.current = false
      clickStart.current = null
      const touches = Array.from(activePointers.current.values())
      onPinchStart(buildFakeTouchList(touches))
      return
    }

    if (tool === 'auto') return

    drawing.current = true
    ;(e.target as HTMLElement).setPointerCapture(e.pointerId)

    const rect = getContainerRect()
    if (!rect) return
    const pt = screenToImage(e.clientX, e.clientY, rect, transform)
    clickStart.current = { pt, clientX: e.clientX, clientY: e.clientY }
  }

  function onPointerMove(e: PointerEvent) {
    activePointers.current.set(e.pointerId, e)

    if (isPinching()) {
      const touches = Array.from(activePointers.current.values())
      onPinchMove(buildFakeTouchList(touches))
      return
    }
  }

  function onPointerUp(e: PointerEvent) {
    activePointers.current.delete(e.pointerId)

    if (!drawing.current) {
      if (activePointers.current.size < 2) onPinchEnd()
      return
    }

    drawing.current = false

    if (clickStart.current) {
      const start = clickStart.current
      clickStart.current = null

      const movedPx = Math.abs(e.clientX - start.clientX) + Math.abs(e.clientY - start.clientY)
      if (movedPx < 10) {
        const half = defaultRectSize / 2
        const action: RectangleAction = {
          type: 'rectangle',
          method,
          rect: {
            x: start.pt.x - half,
            y: start.pt.y - half,
            width: defaultRectSize,
            height: defaultRectSize,
          },
        }
        onAddAction(action)
        onActionCommitted()
      }
    }
  }

  function onPointerCancel(e: PointerEvent) {
    activePointers.current.delete(e.pointerId)
    drawing.current = false
    clickStart.current = null
  }

  return {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  }
}

function buildFakeTouchList(events: PointerEvent[]): TouchList {
  return events as unknown as TouchList
}
