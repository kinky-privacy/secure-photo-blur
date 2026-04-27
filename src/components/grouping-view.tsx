import { useEffect, useRef, useState } from 'preact/hooks'
import { ImageStrip } from './image-strip'
import type { LoadedImage, QueueItem } from '../types'
import { useTranslation } from '../i18n'

interface Props {
  image: LoadedImage
  queuePosition: { current: number; total: number }
  groupNumber: number
  queue: QueueItem[]
  currentIndex: number
  rowBreaks: number[]
  onNavigateTo: (index: number) => void
  onAdvance: () => void
}

const CAROUSEL_H = 140

function isHeic(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ext === 'heic' || ext === 'heif' || file.type === 'image/heic' || file.type === 'image/heif'
}

async function generatePreview(file: File): Promise<string> {
  try {
    const bitmap = await createImageBitmap(file)
    const url = drawPreview(bitmap)
    bitmap.close()
    return url
  } catch {
    if (isHeic(file)) {
      const { default: heic2any } = await import('heic2any')
      const result = await heic2any({ blob: file, toType: 'image/png' })
      const converted = Array.isArray(result) ? result[0] : result
      const bitmap = await createImageBitmap(converted)
      const url = drawPreview(bitmap)
      bitmap.close()
      return url
    }
    throw new Error('Preview generation failed')
  }
}

function drawPreview(bitmap: ImageBitmap): string {
  const canvas = document.createElement('canvas')
  const dpr = Math.min(window.devicePixelRatio || 1, 3)
  const targetH = CAROUSEL_H * dpr
  const targetW = 600 * dpr
  const scale = Math.min(targetW / bitmap.width, targetH / bitmap.height, 1)
  const w = Math.round(bitmap.width * scale)
  const h = Math.round(bitmap.height * scale)
  canvas.width = w
  canvas.height = h
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, w, h)
  const dataUrl = canvas.toDataURL('image/jpeg', 0.85)
  canvas.width = 0
  canvas.height = 0
  return dataUrl
}

export function GroupingView({ image, queuePosition, groupNumber, queue, currentIndex, rowBreaks, onNavigateTo, onAdvance }: Props) {
  const { t } = useTranslation()
  const [previews, setPreviews] = useState<Map<number, string>>(new Map())

  // Indices for the visible window: 2 before split + 2 after split = 4 total
  const windowStart = Math.max(0, currentIndex - 1)
  const windowEnd = Math.min(queue.length - 1, currentIndex + 2)

  useEffect(() => {
    let cancelled = false
    async function loadPreviews() {
      for (let i = windowStart; i <= windowEnd; i++) {
        if (cancelled) return
        if (previews.has(i)) continue
        try {
          const url = await generatePreview(queue[i].file)
          if (!cancelled) {
            setPreviews(prev => new Map(prev).set(i, url))
          }
        } catch {}
      }
    }
    loadPreviews()
    return () => { cancelled = true }
  }, [windowStart, windowEnd, queue.length])

  // Check if there's a break between two indices
  function hasBreakBetween(a: number, b: number): boolean {
    return rowBreaks.includes(b)
  }

  // Whether to show the "press down to split" hint at the current position
  const showSplitHint = currentIndex > 0 && !rowBreaks.includes(currentIndex)

  // Build the items to render
  const items: { index: number; separatorBefore?: boolean; splitHintBefore?: boolean; undoHint?: boolean }[] = []
  for (let i = windowStart; i <= windowEnd; i++) {
    if (i > windowStart && rowBreaks.includes(i)) {
      // Show separator line always; show undo hint only when this break is selected
      items.push({ index: i, separatorBefore: true, undoHint: i === currentIndex })
    } else if (i === currentIndex && showSplitHint) {
      items.push({ index: i, splitHintBefore: true })
    } else {
      items.push({ index: i })
    }
  }

  return (
    <div class="grouping-view">
      <div class="grouping-top-row">
        <div class="grouping-desc">
          <h2 class="grouping-desc-title">{t('grouping.title')}</h2>
          <p class="body-text">{t('grouping.desc.line1')}<br />
          {t('grouping.desc.line2')}<br />
          {t('grouping.desc.line3')}</p>
        </div>
        <div class="grouping-instructions">
          <span class="grouping-instructions-title">{t('grouping.keyboardShortcuts')}</span>
          <div class="grouping-instructions-row">
            <kbd>←</kbd> <kbd>→</kbd>
            <span>{t('grouping.nav')}</span>
          </div>
          <div class="grouping-instructions-row">
            <kbd>↓</kbd>
            <span>{t('grouping.split')}</span>
          </div>
          <div class="grouping-instructions-row">
            <kbd>↑</kbd>
            <span>{t('grouping.undo')}</span>
          </div>
        </div>
      </div>
      <div class="grouping-carousel-wrap">
        <div class="grouping-carousel-header">
          <span class="body-text grouping-info-pos">{t('grouping.position', { current: queuePosition.current, total: queuePosition.total })}</span>
        </div>
        <div class="grouping-carousel">
          {items.map((item) => {
            const url = previews.get(item.index)
            return (
              <>
                {(item.separatorBefore || item.splitHintBefore) && (
                  <div class={`carousel-divider${item.splitHintBefore ? ' carousel-divider--hint' : ''}`}>
                    {item.splitHintBefore && (
                      <div class="body-text body-text--xs body-text--muted split-hint-label">
                        <span>{t('grouping.splitHint.press')}</span>
                        <kbd>&#x25BE;</kbd>
                        <span>{t('grouping.splitHint.toSplit')}</span>
                      </div>
                    )}
                    {item.undoHint && (
                      <div class="body-text body-text--xs body-text--muted split-hint-label split-hint-label--undo">
                        <span>{t('grouping.splitHint.press')}</span>
                        <kbd>&#x25B4;</kbd>
                        <span>{t('grouping.undoHint.toUndo')}</span>
                      </div>
                    )}
                  </div>
                )}
                <div
                  key={item.index}
                  class="carousel-item"
                  onClick={() => onNavigateTo(item.index)}
                >
                  {url ? (
                    <img src={url} alt={t('grouping.photo', { n: item.index + 1 })} />
                  ) : (
                    <div class="carousel-item-placeholder" />
                  )}
                  <span class="carousel-item-num">{item.index + 1}</span>
                </div>
              </>
            )
          })}
        </div>
        <div class="grouping-carousel-footer">
          <button class="btn-primary grouping-advance-btn" type="button" onClick={onAdvance}>
            {rowBreaks.length > 0 ? t('grouping.continueAnonymize') : t('grouping.continueWithout')}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="5" y1="12" x2="19" y2="12"/>
              <polyline points="12 5 19 12 12 19"/>
            </svg>
          </button>
        </div>
      </div>

      <style>{`
        .grouping-view {
          display: flex;
          flex-direction: column;
          gap: var(--sp-md);
          width: 100%;
          padding: var(--sp-lg) var(--sp-lg) var(--sp-lg);
          flex: 1;
          min-height: 0;
        }
        .grouping-top-row {
          display: flex;
          align-items: flex-start;
          gap: var(--sp-lg);
        }
        .grouping-desc {
          margin: 0;
          flex: 1;
          min-width: 0;
        }
        .grouping-desc-title {
          font-family: var(--font-serif);
          font-size: clamp(20px, 4vw, 28px);
          font-weight: 600;
          margin: 0 0 var(--sp-xs);
          color: var(--text-primary);
        }
        .grouping-desc .body-text {
          margin: 0;
        }
        /* Carousel block — header + images as a single unit */
        .grouping-carousel-wrap {
          position: relative;
          background: var(--bg-base);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          overflow: visible;
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }
        .grouping-carousel-header {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: var(--sp-sm);
          border-bottom: 1px solid var(--border);
          background: var(--bg-elevated);
        }
        .grouping-info-pos {
          min-width: 60px;
          text-align: center;
        }
        .grouping-instructions {
          display: flex;
          flex-direction: column;
          gap: 6px;
          padding: var(--sp-sm);
          flex-shrink: 0;
          background: var(--bg-surface);
          border: 1px solid var(--border);
          border-radius: var(--radius);
        }
        .grouping-instructions-title {
          font-size: var(--fs-sm);
          font-weight: 600;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .grouping-instructions-row {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: var(--fs-md);
          color: var(--text-secondary);
        }
        .grouping-instructions-row kbd {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 3px;
          padding: 0 5px;
          font-family: inherit;
          font-size: var(--fs-md);
          font-weight: 600;
          box-shadow: 0 1px 0 var(--border);
          line-height: 1.5;
          min-width: 22px;
          color: var(--text-primary);
        }
        .grouping-instructions-row span {
          font-weight: 500;
        }
        .grouping-carousel {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 4px;
          padding: var(--sp-sm);
          overflow: visible;
          flex: 1;
          min-height: 0;
        }
        .carousel-item {
          flex: 1 1 0;
          min-width: 0;
          aspect-ratio: 1;
          border-radius: var(--radius-sm);
          overflow: hidden;
          cursor: pointer;
          position: relative;
        }
        .carousel-item img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          pointer-events: none;
        }
        .carousel-item-placeholder {
          width: 100%;
          height: 100%;
          background: var(--bg-elevated);
        }
        .carousel-item-num {
          position: absolute;
          bottom: 3px;
          right: 4px;
          font-size: 11px;
          font-weight: 600;
          color: #fff;
          text-shadow: 0 0 4px rgba(0,0,0,0.9);
          pointer-events: none;
          line-height: 1;
        }

        /* Dashed divider line between photos */
        .carousel-divider {
          flex: 0 0 16px;
          align-self: stretch;
          position: relative;
          z-index: 2;
        }
        .carousel-divider::before {
          content: '';
          position: absolute;
          top: -4px;
          bottom: -4px;
          left: 50%;
          border-left: 2px dashed rgba(255,255,255,0.8);
        }
        .carousel-divider--hint::before {
          border-left-color: var(--text-muted);
          border-left-style: dashed;
        }

        /* Hint label — pill anchored below the dashed line */
        .split-hint-label {
          position: absolute;
          top: calc(100% + 4px);
          left: 50%;
          transform: translateX(-50%);
          display: flex;
          align-items: center;
          gap: 5px;
          white-space: nowrap;
          background: var(--bg-surface);
          border: 1px dashed var(--text-muted);
          border-radius: var(--radius-pill);
          padding: 3px 12px;
        }
        .split-hint-label span {
          font-weight: 600;
        }
        .split-hint-label kbd {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          background: var(--bg-elevated);
          border: 1px solid var(--border);
          border-radius: 3px;
          padding: 0 5px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 600;
          box-shadow: 0 1px 0 var(--border);
          line-height: 1.5;
        }
        .split-hint-label--undo {
          background: rgba(220, 50, 50, 0.15);
          border-color: rgba(220, 50, 50, 0.6);
          color: #e05555;
        }
        .split-hint-label--undo kbd {
          background: rgba(220, 50, 50, 0.2);
          border-color: rgba(220, 50, 50, 0.4);
          color: #e05555;
          box-shadow: 0 1px 0 rgba(220, 50, 50, 0.3);
        }

        .grouping-carousel-footer {
          display: flex;
          align-items: center;
          justify-content: flex-end;
          padding: var(--sp-sm);
          border-top: 1px solid var(--border);
          background: var(--bg-elevated);
          gap: var(--sp-sm);
        }
        .grouping-advance-btn {
          display: flex;
          align-items: center;
          gap: var(--sp-sm);
          padding: 10px 24px;
          font-size: var(--fs-lg);
          font-weight: 600;
          margin-left: auto;
        }
        @media (max-width: 600px) {
          .grouping-advance-btn {
            width: 100%;
            justify-content: center;
          }
        }
      `}</style>
    </div>
  )
}
