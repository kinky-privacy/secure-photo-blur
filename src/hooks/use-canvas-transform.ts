import { useState } from 'preact/hooks'
import type { RefObject } from 'preact'
import type { Point } from '../types'

export interface Transform {
  scale: number
  x: number
  y: number
}

export function useCanvasTransform(containerRef: RefObject<HTMLElement>) {
  const [transform, setTransform] = useState<Transform>({ scale: 1, x: 0, y: 0 })

  function screenToCanvas(screenX: number, screenY: number, t: Transform): Point {
    const rect = containerRef.current?.getBoundingClientRect() ?? { left: 0, top: 0 }
    return {
      x: (screenX - rect.left - t.x) / t.scale,
      y: (screenY - rect.top - t.y) / t.scale,
    }
  }

  function onWheel(e: WheelEvent) {
    e.preventDefault()
  }

  function onPinchStart(_touches: TouchList) {}
  function onPinchMove(_touches: TouchList) {}
  function onPinchEnd() {}

  function resetTransform() {
    setTransform({ scale: 1, x: 0, y: 0 })
  }

  function fitToContainer(imgW: number, imgH: number) {
    const container = containerRef.current
    if (!container) return
    const { width: cw, height: ch } = container.getBoundingClientRect()
    const scale = Math.min(cw / imgW, ch / imgH, 1)
    setTransform({
      scale,
      x: (cw - imgW * scale) / 2,
      y: (ch - imgH * scale) / 2,
    })
  }

  return {
    transform,
    setTransform,
    screenToCanvas,
    onWheel,
    onPinchStart,
    onPinchMove,
    onPinchEnd,
    resetTransform,
    fitToContainer,
  }
}
