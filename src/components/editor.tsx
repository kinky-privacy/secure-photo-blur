import { useEffect, useMemo, useRef, useState } from 'preact/hooks'
import type { ActiveTool, BlurMethod, FaceDetectionResult, LoadedImage, Rect, RectangleAction, RegionShape } from '../types'
import { BLUR_SECURITY } from '../types'
import { CanvasView } from './canvas-view'
import { FaceList } from './face-list'
import { RegionEditModal } from './region-edit-modal'
import { SecurityBadge } from './security-badge'
import { SecurityInfoDialog } from './security-info-dialog'
import { useCanvasTransform } from '../hooks/use-canvas-transform'
import { usePointerDraw } from '../hooks/use-pointer-draw'
import { exportImage } from '../engine/exporter'
import type { ExportFormat } from '../types'

interface Props {
  image: LoadedImage
  onReset: () => void
  onNewImage: (img: LoadedImage) => void
}

interface FaceEntry {
  face: FaceDetectionResult
  visible: boolean
  angle: number
  shape: RegionShape
}

interface RectEntry {
  rect: Rect
  method: BlurMethod
  angle: number
  visible: boolean
  shape: RegionShape
}

const METHODS: BlurMethod[] = ['mosaic', 'solid', 'solid-avg', 'gaussian']
const LS_KEY = 'photoblur-method'

function getSavedMethod(): BlurMethod {
  const saved = localStorage.getItem(LS_KEY)
  return (saved && METHODS.includes(saved as BlurMethod)) ? saved as BlurMethod : 'mosaic'
}

export function Editor({ image, onReset: _onReset, onNewImage }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const [tool, setTool] = useState<ActiveTool>('rectangle')
  const [method, setMethod] = useState<BlurMethod>(getSavedMethod)
  const [showMethodModal, setShowMethodModal] = useState(false)
  const [renderKey, setRenderKey] = useState(0)
  const [showInfo, setShowInfo] = useState(false)
  const exportFormat: ExportFormat = 'png'
  const [exporting, setExporting] = useState(false)
  const [editingRegion, setEditingRegion] = useState<{ kind: 'face' | 'rect'; index: number } | null>(null)
  const regionSnapshotRef = useRef<{ rect: Rect; angle: number; visible: boolean; shape: RegionShape } | null>(null)
  const [detecting, setDetecting] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [dropActive, setDropActive] = useState(false)

  const [detectedFaces, setDetectedFaces] = useState<FaceEntry[]>([])

  const [rectEntries, setRectEntries] = useState<RectEntry[]>([])

  function onActionCommitted() {
    setRenderKey(k => k + 1)
  }

  const {
    transform,
    onWheel,
    onPinchStart,
    onPinchMove,
    onPinchEnd,
    fitToContainer,
  } = useCanvasTransform(containerRef)

  const defaultRectSize = Math.round(Math.min(image.displayWidth, image.displayHeight) * 0.15)

  const {
    onPointerDown,
    onPointerMove,
    onPointerUp,
    onPointerCancel,
  } = usePointerDraw({
    tool,
    method,
    onAddAction: (action: RectangleAction) => {
      setRectEntries(prev => {
        setEditingRegion({ kind: 'rect', index: prev.length })
        return [...prev, { rect: action.rect, method: action.method, angle: 0, visible: true, shape: 'rectangle' as RegionShape }]
      })
    },
    transform,
    canvasRef,
    onActionCommitted,
    onPinchStart,
    onPinchMove,
    onPinchEnd,
    defaultRectSize,
  })

  // Lock body scroll when any modal is open
  const anyModalOpen = showMethodModal || showInfo || !!editingRegion
  useEffect(() => {
    if (!anyModalOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [anyModalOpen])

  // Persist selected method to localStorage
  useEffect(() => {
    localStorage.setItem(LS_KEY, method)
  }, [method])

  // Auto-detect faces on image load
  useEffect(() => {
    runDetection()
  }, [image])

  // Fit image to container on mount
  useEffect(() => {
    if (containerRef.current) {
      fitToContainer(image.displayWidth, image.displayHeight)
    }
  }, [image])


  // Re-fit on container resize
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const observer = new ResizeObserver(() => {
      setIsMobile(window.innerWidth < 768)
      fitToContainer(image.displayWidth, image.displayHeight)
    })
    observer.observe(container)
    return () => observer.disconnect()
  }, [image])

  function onEditorDragOver(e: DragEvent) {
    if (e.dataTransfer?.types.includes('Files')) {
      e.preventDefault()
      setDropActive(true)
    }
  }

  function onEditorDragLeave(e: DragEvent) {
    if (!(e.currentTarget as Element).contains(e.relatedTarget as Node)) {
      setDropActive(false)
    }
  }

  async function onEditorDrop(e: DragEvent) {
    e.preventDefault()
    setDropActive(false)
    const file = e.dataTransfer?.files[0]
    if (!file || !file.type.startsWith('image/')) return
    try {
      const { loadImage } = await import('../engine/image-loader')
      const img = await loadImage(file)
      onNewImage(img)
    } catch {}
  }

  async function runDetection() {
    setDetecting(true)
    try {
      const { detectFaces } = await import('../detection/face-detector')
      const faces = await detectFaces(image)
      setDetectedFaces(faces.map(face => ({ face, visible: false, angle: 0, shape: 'face' as RegionShape })))
      setRenderKey(k => k + 1)
    } catch (e) {
      if (import.meta.env.DEV) console.error('Face detection failed:', e)
    } finally {
      setDetecting(false)
    }
  }

  function handleAutoDetect() {
    setDetectedFaces([])
    runDetection()
  }

  function handleFaceRectChange(index: number, rect: Rect) {
    setDetectedFaces(prev =>
      prev.map((entry, i) => i === index ? { ...entry, face: { ...entry.face, rect } } : entry)
    )
    setRenderKey(k => k + 1)
  }

  function handleFaceAngleChange(index: number, angle: number) {
    setDetectedFaces(prev =>
      prev.map((entry, i) => i === index ? { ...entry, angle } : entry)
    )
    setRenderKey(k => k + 1)
  }

  function handleRectChange(index: number, rect: Rect) {
    setRectEntries(prev => prev.map((e, i) => i === index ? { ...e, rect } : e))
    setRenderKey(k => k + 1)
  }

  function handleRectAngleChange(index: number, angle: number) {
    setRectEntries(prev => prev.map((e, i) => i === index ? { ...e, angle } : e))
    setRenderKey(k => k + 1)
  }

  function handleRectToggle(index: number) {
    setRectEntries(prev => prev.map((e, i) => i === index ? { ...e, visible: !e.visible } : e))
    setRenderKey(k => k + 1)
  }

  function handleFaceShapeChange(index: number, shape: RegionShape) {
    setDetectedFaces(prev => prev.map((e, i) => i === index ? { ...e, shape } : e))
    setRenderKey(k => k + 1)
  }

  function handleRectShapeChange(index: number, shape: RegionShape) {
    setRectEntries(prev => prev.map((e, i) => i === index ? { ...e, shape } : e))
    setRenderKey(k => k + 1)
  }

  function handleFaceDelete(index: number) {
    setDetectedFaces(prev => prev.filter((_, i) => i !== index))
    setRenderKey(k => k + 1)
  }

  function handleRectDelete(index: number) {
    setRectEntries(prev => prev.filter((_, i) => i !== index))
    setRenderKey(k => k + 1)
  }

  function handleToggleFace(index: number) {
    setDetectedFaces(prev =>
      prev.map((entry, i) => i === index ? { ...entry, visible: !entry.visible } : entry)
    )
    setRenderKey(k => k + 1)
  }

  function handleCancelRegionEdit() {
    const snap = regionSnapshotRef.current
    const reg  = editingRegion
    if (snap && reg) {
      if (reg.kind === 'face') {
        handleFaceRectChange(reg.index, snap.rect)
        handleFaceAngleChange(reg.index, snap.angle)
        handleFaceShapeChange(reg.index, snap.shape)
        if (detectedFaces[reg.index]?.visible !== snap.visible) handleToggleFace(reg.index)
      } else {
        handleRectChange(reg.index, snap.rect)
        handleRectAngleChange(reg.index, snap.angle)
        handleRectShapeChange(reg.index, snap.shape)
        if (rectEntries[reg.index]?.visible !== snap.visible) handleRectToggle(reg.index)
      }
    }
    regionSnapshotRef.current = null
    setEditingRegion(null)
  }

  async function handleExportDownload() {
    setExporting(true)
    try {
      await exportImage(image, allActions, exportFormat)
    } catch (e) {
      alert('Export failed: ' + (e instanceof Error ? e.message : String(e)))
    } finally {
      setExporting(false)
    }
  }

  const allActions = useMemo(() => {
    const autoFaceActions = detectedFaces
      .filter(e => e.visible)
      .map(e => ({
        type: 'auto-face' as const,
        method,
        rect: e.face.rect,
        angle: e.angle,
        shape: e.shape,
      }))

    const rectActions: RectangleAction[] = rectEntries
      .filter(e => e.visible)
      .map(e => ({ type: 'rectangle', method: e.method, rect: e.rect, angle: e.angle, shape: e.shape }))

    return [...autoFaceActions, ...rectActions]
  }, [detectedFaces, rectEntries, method])

  return (
    <div
      class="editor-card-wrapper"
      onDragOver={onEditorDragOver}
      onDragLeave={onEditorDragLeave}
      onDrop={onEditorDrop}
    >
      <div class="editor-layout">
        {/* Canvas block */}
        <div class="editor-block editor-block--canvas">
        <div ref={containerRef} class="editor-canvas-area">
          <CanvasView
            image={image}
            actions={allActions}
            transform={transform}
            activeTool={tool}
            canvasRef={canvasRef}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerCancel}
            onWheel={onWheel}
            renderKey={renderKey}
          />
        </div>
        </div>

        {/* Anonymize block */}
        <div class="editor-block">
          <FaceList
            faces={detectedFaces}
            rectEntries={rectEntries}
            onToggle={handleToggleFace}
            onRectToggle={handleRectToggle}
            onRectDelete={handleRectDelete}
            onOpenModal={(kind, index) => {
              if (kind === 'face' && detectedFaces[index]) {
                const e = detectedFaces[index]
                regionSnapshotRef.current = { rect: e.face.rect, angle: e.angle, visible: e.visible, shape: e.shape }
                if (!e.visible) handleToggleFace(index)
              } else if (kind === 'rect' && rectEntries[index]) {
                const e = rectEntries[index]
                regionSnapshotRef.current = { rect: e.rect, angle: e.angle, visible: e.visible, shape: e.shape }
                if (!e.visible) handleRectToggle(index)
              }
              setEditingRegion({ kind, index })
            }}
            detecting={detecting}
            isMobile={isMobile}
            image={image}
            method={method}
            onMethodClick={() => setShowMethodModal(true)}
          />
        </div>

        {/* Export block */}
        {(() => {
          const info = BLUR_SECURITY[method]
          return (
            <div class="editor-block">
              <div class="export-panel">
                {info.warning && (
                  <div class="export-warning">
                    <span>⚠</span>
                    <span>{info.warning}</span>
                  </div>
                )}
                <ul class="export-panel-reassurance">
                  <li>🛡️ Your original stays safe</li>
                  <li>📁 A new copy is saved with the blur applied</li>
                  <li>📍 All location data removed automatically</li>
                </ul>
                <div class="export-panel-actions">
                  <button class="btn-primary export-panel-dl-btn" type="button" onClick={handleExportDownload} disabled={exporting}>
                    {exporting ? 'Exporting…' : 'Download anonymized pic'}
                  </button>
                </div>
              </div>
            </div>
          )
        })()}
      </div>

      {/* Drop overlay */}
      {dropActive && (
        <div class="editor-drop-overlay">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          <span>Drop to replace image</span>
        </div>
      )}

      {showMethodModal && (
        <div class="overlay" onClick={() => setShowMethodModal(false)}>
          <div class="method-modal" onClick={(e) => e.stopPropagation()}>
            <div class="method-modal-header">
              <span class="method-modal-title">Select method</span>
              <button class="btn-icon info-btn-sm" type="button" title="How blur methods work" onClick={() => { setShowMethodModal(false); setShowInfo(true) }}>
                <IconInfo />
              </button>
            </div>
            <div class="method-modal-list">
              {METHODS.map(m => {
                const info = BLUR_SECURITY[m]
                const dotColor = info.level === 'max' ? '#22c55e' : info.level === 'high' ? '#f59e0b' : '#b22222'
                return (
                  <button
                    key={m}
                    class={`method-row${method === m ? ' method-row--active' : ''}`}
                    onClick={() => { setMethod(m); setShowMethodModal(false) }}
                    type="button"
                  >
                    <div class="method-row-top">
                      <div class="method-row-left">
                        <span class="method-row-dot" style={{ background: dotColor }} />
                        <span class="method-row-name">{info.label}</span>
                      </div>
                      <span class={`method-row-level method-row-level--${info.level}`}>
                        {info.level === 'max' ? 'Very safe' : info.level === 'high' ? 'Safe' : 'Not safe'}
                      </span>
                    </div>
                    <p class="method-row-desc">{info.description}</p>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {editingRegion && (() => {
        const { kind, index } = editingRegion
        if (kind === 'face' && detectedFaces[index]) {
          const entry = detectedFaces[index]
          return (
            <RegionEditModal
              kind="face"
              index={index}
              rect={entry.face.rect}
              angle={entry.angle}
              visible={entry.visible}
              shape={entry.shape}
              image={image}
              isMobile={isMobile}
              onRectChange={(rect) => handleFaceRectChange(index, rect)}
              onAngleChange={(angle) => handleFaceAngleChange(index, angle)}
              onToggle={() => handleToggleFace(index)}
              onShapeChange={(shape) => handleFaceShapeChange(index, shape)}
              onDelete={() => { handleFaceDelete(index); setEditingRegion(null) }}
              onClose={() => { regionSnapshotRef.current = null; setEditingRegion(null) }}
              onCancel={handleCancelRegionEdit}
            />
          )
        }
        if (kind === 'rect' && rectEntries[index]) {
          const entry = rectEntries[index]
          return (
            <RegionEditModal
              kind="rect"
              index={index}
              rect={entry.rect}
              angle={entry.angle}
              visible={entry.visible}
              shape={entry.shape}
              image={image}
              isMobile={isMobile}
              onRectChange={(rect) => handleRectChange(index, rect)}
              onAngleChange={(angle) => handleRectAngleChange(index, angle)}
              onToggle={() => handleRectToggle(index)}
              onShapeChange={(shape) => handleRectShapeChange(index, shape)}
              onDelete={() => { handleRectDelete(index); setEditingRegion(null) }}
              onClose={() => { regionSnapshotRef.current = null; setEditingRegion(null) }}
              onCancel={handleCancelRegionEdit}
            />
          )
        }
        return null
      })()}

      {showInfo && <SecurityInfoDialog onClose={() => setShowInfo(false)} />}

      <style>{`
        .editor-card-wrapper {
          display: flex;
          align-items: flex-start;
          justify-content: center;
          min-height: 100%;
          width: 100%;
          padding: var(--sp-lg);
          position: relative;
          box-sizing: border-box;
        }
        .editor-layout {
          display: flex;
          flex-direction: column;
          gap: var(--sp-md);
          width: 100%;
          max-width: 1200px;
        }
        .editor-block {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: hidden;
        }
        .editor-block--canvas {
          overflow: hidden;
        }
        .method-row {
          width: 100%;
          text-align: left;
          background: transparent;
          border: 1px solid transparent;
          border-radius: var(--radius);
          padding: var(--sp-sm) var(--sp-md);
          cursor: pointer;
          font-family: var(--font-sans);
          transition: background var(--transition), border-color var(--transition);
        }
        .method-row:hover {
          background: var(--bg-elevated);
        }
        .method-row--active {
          background: var(--bg-elevated);
          border-color: var(--border);
        }
        .method-row-top {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: var(--sp-xs);
        }
        .method-row-left {
          display: flex;
          align-items: center;
          gap: var(--sp-sm);
        }
        .method-row-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .method-row-name {
          font-size: 14px;
          color: var(--text-primary);
          font-weight: 500;
        }
        .method-row-level {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          padding: 2px 7px;
          border-radius: var(--radius-pill);
        }
        .method-row-level--max {
          background: rgba(34,197,94,0.12);
          color: #22c55e;
        }
        .method-row-level--high {
          background: rgba(245,158,11,0.12);
          color: #f59e0b;
        }
        .method-row-level--low {
          background: rgba(178,34,34,0.12);
          color: var(--accent-light);
        }
        .method-row-desc {
          font-size: 12px;
          color: var(--text-secondary);
          line-height: 1.45;
          margin: 0;
        }
        .info-btn-sm {
          width: 28px;
          height: 28px;
          padding: 0;
          border-radius: 50%;
          flex-shrink: 0;
          opacity: 0.6;
        }
        .info-btn-sm:hover {
          opacity: 1;
        }
        .editor-canvas-area {
          display: flex;
          overflow: hidden;
          position: relative;
          height: 65vh;
          min-height: 320px;
          background: var(--bg-base);
        }
        .method-section {
          background: var(--bg-surface);
        }
        .method-section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--sp-sm) var(--sp-md) var(--sp-xs);
        }
        .method-section-title {
          font-size: 14px;
          color: rgba(255,255,255,0.8);
          letter-spacing: 0.08em;
          font-weight: 500;
        }
        .method-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: var(--sp-xs) var(--sp-md) var(--sp-md);
        }
        .method-trigger-wrap {
          padding: var(--sp-xs) var(--sp-md) var(--sp-md);
        }
        .method-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: var(--sp-sm) var(--sp-md);
          cursor: pointer;
          font-family: var(--font-sans);
          transition: border-color var(--transition), background var(--transition);
        }
        .method-trigger:hover {
          border-color: #555;
        }
        .method-trigger-left {
          display: flex;
          align-items: center;
          gap: var(--sp-sm);
        }
        .method-trigger-right {
          display: flex;
          align-items: center;
          gap: var(--sp-sm);
          color: var(--text-muted);
        }
        .method-modal {
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          width: 100%;
          max-width: 480px;
          max-height: 90vh;
          overflow-y: auto;
        }
        .method-modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--sp-md) var(--sp-md) var(--sp-sm);
          border-bottom: 1px solid var(--border);
        }
        .method-modal-title {
          font-size: 16px;
          font-weight: 600;
          color: var(--text-primary);
        }
        .method-modal-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
          padding: var(--sp-sm) var(--sp-md) var(--sp-md);
        }
        .export-panel {
          background: var(--bg-surface);
        }
        .export-panel-actions {
          padding: var(--sp-sm) var(--sp-md) var(--sp-md);
        }
        .export-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: var(--sp-sm) var(--sp-md) var(--sp-xs);
        }
        .export-panel-title {
          font-size: 14px;
          color: rgba(255,255,255,0.8);
          letter-spacing: 0.08em;
          font-weight: 500;
        }
        .export-warning {
          display: flex;
          align-items: flex-start;
          gap: var(--sp-sm);
          background: rgba(178,34,34,0.1);
          border: 1px solid var(--accent);
          border-radius: var(--radius);
          padding: var(--sp-sm) var(--sp-md);
          font-size: 13px;
          color: var(--text-secondary);
          margin: 0 var(--sp-md) var(--sp-md);
          line-height: 1.5;
        }
        .export-warning span:first-child {
          color: var(--accent-light);
          flex-shrink: 0;
          font-size: 15px;
        }
        .export-panel-reassurance {
          list-style: none;
          padding: var(--sp-md) var(--sp-md) var(--sp-sm);
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 9px;
        }
        .export-panel-reassurance li {
          font-size: 13px;
          color: var(--text-secondary);
          display: flex;
          align-items: center;
          gap: 8px;
          line-height: 1.4;
        }
        .export-panel-actions .export-panel-dl-btn {
          width: 100%;
          padding: 10px 0;
          font-size: 14px;
        }
        .editor-drop-overlay {
          position: absolute;
          inset: 0;
          z-index: 100;
          background: rgba(0,0,0,0.6);
          backdrop-filter: blur(4px);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: var(--sp-md);
          color: #fff;
          font-size: 16px;
          font-weight: 500;
          pointer-events: none;
          border: 3px dashed var(--accent);
          border-radius: var(--radius);
        }
      `}</style>
    </div>
  )
}

function IconRect() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
      <line x1="9" y1="9" x2="15" y2="9" stroke-dasharray="2 2"/>
      <line x1="9" y1="12" x2="15" y2="12" stroke-dasharray="2 2"/>
      <line x1="9" y1="15" x2="15" y2="15" stroke-dasharray="2 2"/>
    </svg>
  )
}

function IconFace() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M9 10h.01M15 10h.01"/>
      <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
      <path d="M8 14s1.5 2 4 2 4-2 4-2"/>
      <line x1="3" y1="3" x2="5" y2="5"/>
      <line x1="19" y1="3" x2="21" y2="5"/>
      <line x1="3" y1="21" x2="5" y2="19"/>
      <line x1="19" y1="21" x2="21" y2="19"/>
    </svg>
  )
}

function IconInfo() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="8.5"/>
      <line x1="12" y1="12" x2="12" y2="16"/>
    </svg>
  )
}

function IconChevron() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  )
}

function IconClose() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <line x1="18" y1="6" x2="6" y2="18"/>
      <line x1="6" y1="6" x2="18" y2="18"/>
    </svg>
  )
}
