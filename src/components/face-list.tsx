import { useEffect, useRef, useState } from 'preact/hooks'
import type { BlurMethod, FaceEntry, LoadedImage, Rect, RectEntry } from '../types'
import { BLUR_SECURITY } from '../types'
import { useTranslation } from '../i18n'
import type { TranslationKey } from '../i18n'

interface Props {
  faces: FaceEntry[]
  rectEntries: RectEntry[]
  onToggle: (index: number) => void
  onRectToggle?: (index: number) => void
  onRectDelete?: (index: number) => void
  onOpenModal: (kind: 'face' | 'rect', index: number) => void
  detecting: boolean
  isMobile: boolean
  image: LoadedImage
  method: BlurMethod
  onMethodClick: () => void
}

const THUMB_CSS = 112
const CONTEXT   = 2.2

interface ThumbData {
  blobUrl: string
}

function makeThumbnailAsync(bitmap: ImageBitmap, rect: Rect, scale: number): Promise<Blob> {
  const vSize = Math.max(rect.width, rect.height) * CONTEXT
  const vx = rect.x + rect.width  / 2 - vSize / 2
  const vy = rect.y + rect.height / 2 - vSize / 2

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
  const dx = ((sx - sx0) / srcSize) * THUMB_CSS
  const dy = ((sy - sy0) / srcSize) * THUMB_CSS
  const dw = ((sx1 - sx) / srcSize) * THUMB_CSS
  const dh = ((sy1 - sy) / srcSize) * THUMB_CSS

  const canvas = document.createElement('canvas')
  canvas.width  = THUMB_CSS
  canvas.height = THUMB_CSS
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
      0.85,
    )
  })
}

function rectsFingerprint(rects: Rect[]): string {
  return rects.map(r => `${r.x},${r.y},${r.width},${r.height}`).join('|')
}

export function FaceList({
  faces, rectEntries, onToggle, onRectToggle, onRectDelete, onOpenModal, detecting, isMobile, image, method, onMethodClick,
}: Props) {
  const { t } = useTranslation()
  const faceRects = faces.map(e => e.face.rect)
  const faceFingerprint = rectsFingerprint(faceRects)
  const [faceThumbData, setFaceThumbData] = useState<ThumbData[]>([])
  const faceUrlsRef = useRef<string[]>([])

  useEffect(() => {
    let cancelled = false
    const prevUrls = faceUrlsRef.current
    if (faceRects.length === 0) {
      prevUrls.forEach(u => { try { URL.revokeObjectURL(u) } catch {} })
      faceUrlsRef.current = []
      setFaceThumbData([])
      return
    }
    Promise.all(faceRects.map(rect => makeThumbnailAsync(image.bitmap, rect, image.scale))).then(blobs => {
      if (cancelled) return
      prevUrls.forEach(u => { try { URL.revokeObjectURL(u) } catch {} })
      const urls = blobs.map(b => URL.createObjectURL(b))
      faceUrlsRef.current = urls
      setFaceThumbData(urls.map(u => ({ blobUrl: u })))
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [faceFingerprint, image])

  useEffect(() => () => { faceUrlsRef.current.forEach(u => { try { URL.revokeObjectURL(u) } catch {} }) }, [])

  const rectRects = rectEntries.map(e => e.rect)
  const rectFingerprint = rectsFingerprint(rectRects)
  const [rectThumbData, setRectThumbData] = useState<ThumbData[]>([])
  const rectUrlsRef = useRef<string[]>([])

  useEffect(() => {
    let cancelled = false
    const prevUrls = rectUrlsRef.current
    if (rectRects.length === 0) {
      prevUrls.forEach(u => { try { URL.revokeObjectURL(u) } catch {} })
      rectUrlsRef.current = []
      setRectThumbData([])
      return
    }
    Promise.all(rectRects.map(rect => makeThumbnailAsync(image.bitmap, rect, image.scale))).then(blobs => {
      if (cancelled) return
      prevUrls.forEach(u => { try { URL.revokeObjectURL(u) } catch {} })
      const urls = blobs.map(b => URL.createObjectURL(b))
      rectUrlsRef.current = urls
      setRectThumbData(urls.map(u => ({ blobUrl: u })))
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rectFingerprint, image])

  useEffect(() => () => { rectUrlsRef.current.forEach(u => { try { URL.revokeObjectURL(u) } catch {} }) }, [])

  if (detecting) {
    return (
      <div class="face-list body-text body-text--muted face-list--loading">
        <div class="spinner" style={{ width: 16, height: 16 }} />
        <span>{t('faceList.detecting')}</span>
        <style>{styles}</style>
      </div>
    )
  }

  if (faces.length === 0 && rectEntries.length === 0) return null

  return (
    <div class={`face-list${isMobile ? ' face-list--mobile' : ''}`}>
      <div class="face-list-header">
        <span class="face-list-title">{t('faceList.header')}</span>
        {(() => {
          const info = BLUR_SECURITY[method]
          const isMosaicGreen = method === 'mosaic'
          const dotColor = (info.level === 'max' || isMosaicGreen) ? 'var(--color-success)' : info.level === 'high' ? 'var(--color-warning)' : 'var(--accent)'
          const levelClass = isMosaicGreen ? 'method-trigger-mini-level--max' : `method-trigger-mini-level--${info.level}`
          return (
            <button class="method-trigger-mini" type="button" onClick={onMethodClick}>
              <span class="method-row-dot" style={{ background: dotColor }} />
              <span class={`body-text body-text--medium body-text--primary method-trigger-mini-name${isMosaicGreen ? ' method-trigger-mini-name--max' : ''}`}>{t(`${info.i18nKey}.label` as TranslationKey)}</span>
              <span class={`method-trigger-mini-level ${levelClass}`}>
                {info.level === 'max' ? t('security.verySafe') : info.level === 'high' ? t('security.safe') : t('security.notSafe')}
              </span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
          )
        })()}
      </div>
      <div class="face-list-items">

        {/* Face items */}
        {faces.map((entry, i) => {
          const td = faceThumbData[i]
          return (
            <div
              key={`f${i}`}
              class={`face-item${entry.visible ? ' face-item--active' : ''}`}
            >
              <div
                class="face-item-thumb-wrap"
                role="button"
                tabIndex={0}
                title={t('faceList.editRegion')}
                onClick={() => onOpenModal('face', i)}
                onKeyDown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onOpenModal('face', i) }}
              >
                {td
                  ? <img class="face-item-thumb" src={td.blobUrl} alt={t('faceList.face', { n: i + 1 })} />
                  : <div class="face-item-thumb" style={{ background: 'var(--bg-base)' }} />
                }
                <div class="face-item-edit-hint">
                  <IconEdit />
                </div>
              </div>
            </div>
          )
        })}

        {/* Rectangle items */}
        {rectEntries.map((entry, i) => {
          const td = rectThumbData[i]
          return (
            <div
              key={`r${i}`}
              class={`face-item${entry.visible ? ' face-item--active' : ''} face-item--rect`}
            >
              <div
                class="face-item-thumb-wrap"
                role="button"
                tabIndex={0}
                title={t('faceList.editRegion')}
                onClick={() => onOpenModal('rect', i)}
                onKeyDown={(e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') onOpenModal('rect', i) }}
              >
                {td
                  ? <img class="face-item-thumb" src={td.blobUrl} alt={t('faceList.region', { n: i + 1 })} />
                  : <div class="face-item-thumb" style={{ background: 'var(--bg-base)' }} />
                }
                <div class="face-item-edit-hint">
                  <IconEdit />
                </div>
                <button
                  class="face-item-delete-btn"
                  type="button"
                  title={t('faceList.removeRegion')}
                  onClick={(e: MouseEvent) => { e.stopPropagation(); onRectDelete?.(i) }}
                >×</button>
              </div>
            </div>
          )
        })}

        <div class="body-text body-text--sm body-text--muted body-text--tight face-item-hint-box">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <line x1="12" y1="8" x2="12" y2="16"/>
            <line x1="8" y1="12" x2="16" y2="12"/>
          </svg>
          <span><span class="body-text body-text--sm body-text--medium face-item-hint-box-cta">{t('faceList.hintCta')}</span> {t('faceList.hintText')}</span>
        </div>
      </div>
      <style>{styles}</style>
    </div>
  )
}

function IconEdit() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  )
}

const styles = `
  .face-list {
    background: var(--bg-surface);
    flex: 1;
    min-height: 0;
    overflow-y: auto;
  }
  .face-list--loading {
    display: flex;
    align-items: center;
    gap: var(--sp-sm);
    padding: var(--sp-sm) var(--sp-md);
    min-height: 44px;
  }
  .face-list-header {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    gap: var(--sp-xs);
    padding: var(--sp-sm) var(--sp-sm) var(--sp-xs);
  }
  .face-list-title {
    font-size: var(--fs-lg);
    color: rgba(255,255,255,0.8);
    letter-spacing: 0.08em;
    font-weight: 500;
  }
  .method-trigger-mini {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    background: var(--bg-elevated);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: 5px 10px 5px 8px;
    cursor: pointer;
    font-family: var(--font-sans);
    color: var(--text-secondary);
    transition: border-color var(--transition), color var(--transition);
  }
  .method-trigger-mini:hover {
    border-color: #555;
    color: var(--text-primary);
  }
  .method-trigger-mini-name {
  }
  .method-trigger-mini-name--max {
    color: var(--color-success);
  }
  .method-trigger-mini-level {
    font-size: var(--fs-xs);
    font-weight: 600;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    padding: 2px 6px;
    border-radius: var(--radius-pill);
  }
  .method-trigger-mini-level--max {
    background: rgba(34,197,94,0.12);
    color: #16a34a;
  }
  .method-trigger-mini-level--high {
    background: rgba(245,158,11,0.12);
    color: var(--color-warning);
  }
  .method-trigger-mini-level--low {
    background: rgba(178,34,34,0.12);
    color: var(--accent-light);
  }
  .face-list-items {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    gap: var(--sp-sm);
    padding: var(--sp-xs) var(--sp-sm) var(--sp-md);
    overflow-x: auto;
  }
  @media (min-width: 768px) {
    .face-list-items {
      flex-wrap: wrap;
    }
  }
  .face-item {
    flex-shrink: 0;
    padding: 0;
    background: transparent;
    border: none;
    border-radius: var(--radius-lg);
    user-select: none;
    -webkit-user-select: none;
  }
  .face-item-thumb-wrap {
    position: relative;
    display: block;
    border-radius: var(--radius-lg);
    overflow: visible;
    border: 2px solid transparent;
    transition: border-color var(--transition);
    width: ${THUMB_CSS}px;
    height: ${THUMB_CSS}px;
    cursor: pointer;
  }
  .face-item--active .face-item-thumb-wrap {
    border-color: var(--accent);
  }
  .face-item--rect.face-item--active .face-item-thumb-wrap {
    border-color: var(--color-info);
  }
  .face-item:not(.face-item--active) .face-item-thumb,
  .face-item:not(.face-item--active) .face-item-edit-hint {
    opacity: 0.55;
  }
  .face-item-thumb {
    display: block;
    width: ${THUMB_CSS}px;
    height: ${THUMB_CSS}px;
    object-fit: cover;
    border-radius: var(--radius);
    pointer-events: none;
  }
  .face-item-edit-hint {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0,0,0,0);
    border-radius: var(--radius);
    color: #fff;
    opacity: 0;
    transition: opacity var(--transition), background var(--transition);
    pointer-events: none;
  }
  .face-item-thumb-wrap:hover .face-item-edit-hint {
    opacity: 1;
    background: rgba(0,0,0,0.35);
  }
  .face-item-anon-btn {
    position: absolute;
    bottom: 3px;
    left: 3px;
    right: 3px;
    z-index: 5;
    padding: 3px 0;
    border: none;
    border-radius: var(--radius-sm);
    background: var(--color-error);
    color: #fff;
    font-size: 9px;
    font-weight: 600;
    font-family: var(--font-sans, sans-serif);
    letter-spacing: 0.03em;
    cursor: pointer;
    text-align: center;
    pointer-events: all;
    transition: background var(--transition);
  }
  .face-item-anon-btn:hover {
    background: var(--color-error-dark);
  }
  .face-item-anon-btn--active {
    background: rgba(120,120,120,0.75);
  }
  .face-item-anon-btn--active:hover {
    background: rgba(90,90,90,0.9);
  }
  .face-item-delete-btn {
    position: absolute;
    top: 3px;
    right: 3px;
    z-index: 10;
    width: 16px;
    height: 16px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: rgba(0,0,0,0.55);
    color: #fff;
    font-size: var(--fs-base);
    line-height: 1;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: all;
    transition: background var(--transition);
  }
  .face-item-delete-btn:hover {
    background: rgba(220, 38, 38, 0.85);
  }
  .face-item-hint-box {
    flex-shrink: 0;
    width: ${THUMB_CSS}px;
    height: ${THUMB_CSS}px;
    border: 1px dashed var(--border);
    border-radius: var(--radius-lg);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: var(--sp-sm);
    padding: var(--sp-sm);
    text-align: center;
    pointer-events: none;
  }
  .face-item-hint-box-cta {
    color: rgba(255,255,255,0.85);
  }
`
