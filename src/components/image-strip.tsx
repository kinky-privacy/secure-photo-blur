import { useEffect, useRef, useState } from 'preact/hooks'
import type { QueueItem } from '../types'
import { getRows } from '../utils/groups'
import { useTranslation } from '../i18n'

interface Props {
  queue: QueueItem[]
  currentIndex: number
  rowBreaks: number[]
  onNavigateTo: (index: number) => void
}

const THUMB_HEIGHT = 120

function fileKey(file: File): string {
  return `${file.name}|${file.size}|${file.lastModified}`
}

function isHeic(file: File): boolean {
  const ext = file.name.split('.').pop()?.toLowerCase()
  return ext === 'heic' || ext === 'heif' || file.type === 'image/heic' || file.type === 'image/heif'
}

async function generateThumbnail(file: File): Promise<string> {
  let blob: Blob = file
  try {
    // Try direct createImageBitmap first
    const bitmap = await createImageBitmap(blob)
    const url = drawThumb(bitmap)
    bitmap.close()
    return url
  } catch {
    // Fallback for HEIC
    if (isHeic(file)) {
      const { default: heic2any } = await import('heic2any')
      const result = await heic2any({ blob: file, toType: 'image/png' })
      const converted = Array.isArray(result) ? result[0] : result
      const bitmap = await createImageBitmap(converted)
      const url = drawThumb(bitmap)
      bitmap.close()
      return url
    }
    throw new Error('Thumbnail generation failed')
  }
}

function drawThumb(bitmap: ImageBitmap): string {
  const aspect = bitmap.width / bitmap.height
  const w = Math.round(THUMB_HEIGHT * aspect)
  const canvas = document.createElement('canvas')
  canvas.width = w
  canvas.height = THUMB_HEIGHT
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(bitmap, 0, 0, w, THUMB_HEIGHT)
  const dataUrl = canvas.toDataURL('image/jpeg', 0.7)
  canvas.width = 0
  canvas.height = 0
  return dataUrl
}

export function ImageStrip({ queue, currentIndex, rowBreaks, onNavigateTo }: Props) {
  const { t } = useTranslation()
  const [thumbUrls, setThumbUrls] = useState<Map<string, string>>(new Map())
  const activeRef = useRef<HTMLDivElement>(null)

  // Generate thumbnails in batches of 3
  useEffect(() => {
    let cancelled = false
    const cache = new Map(thumbUrls)
    const pending = queue.filter(item => !cache.has(fileKey(item.file)))
    if (pending.length === 0) return

    async function generateAll() {
      for (let i = 0; i < pending.length; i += 3) {
        if (cancelled) return
        const batch = pending.slice(i, i + 3)
        const results = await Promise.allSettled(
          batch.map(item => generateThumbnail(item.file))
        )
        results.forEach((r, j) => {
          if (r.status === 'fulfilled') {
            cache.set(fileKey(batch[j].file), r.value)
          }
        })
        if (!cancelled) setThumbUrls(new Map(cache))
      }
    }
    generateAll()
    return () => { cancelled = true }
  }, [queue.length])

  // Scroll active thumbnail into view
  useEffect(() => {
    activeRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [currentIndex])

  const rows = getRows(queue.length, rowBreaks)

  return (
    <div class="image-strip">
      {rows.map((row, rowIdx) => (
        <div class="strip-group" key={rowIdx}>
          <span class="body-text body-text--xs body-text--muted body-text--semi strip-group-label">{t('imageStrip.group', { n: rowIdx + 1 })}</span>
          <div class="strip-row">
          {row.map(imgIdx => {
            const item = queue[imgIdx]
            const url = thumbUrls.get(fileKey(item.file))
            const isActive = imgIdx === currentIndex
            const isExported = item.editState?.exported
            return (
              <div
                key={imgIdx}
                ref={isActive ? activeRef : undefined}
                class={`strip-thumb${isActive ? ' strip-thumb--active' : ''}${isExported ? ' strip-thumb--exported' : ''}`}
                onClick={() => onNavigateTo(imgIdx)}
                title={item.file.name}
              >
                {url ? (
                  <img src={url} alt={item.file.name} />
                ) : (
                  <div class="strip-thumb-placeholder" />
                )}
                <span class="strip-thumb-index">{imgIdx + 1}</span>
              </div>
            )
          })}
          </div>
        </div>
      ))}
      <style>{styles}</style>
    </div>
  )
}

const styles = `
  .image-strip {
    background: var(--bg-surface);
    border: 1px solid var(--border);
    border-radius: var(--radius);
    padding: var(--sp-sm);
    overflow-y: auto;
    max-height: 300px;
  }
  .strip-group {
    padding: var(--sp-xs) 0;
  }
  .strip-group + .strip-group {
    border-top: 1px solid var(--border-subtle);
    margin-top: var(--sp-xs);
    padding-top: var(--sp-sm);
  }
  .strip-group-label {
    display: block;
    letter-spacing: 0.04em;
    margin-bottom: var(--sp-xs);
  }
  .strip-row {
    display: flex;
    gap: var(--sp-xs);
    align-items: center;
    overflow-x: auto;
    padding-bottom: var(--sp-xs);
  }
  .strip-thumb {
    height: ${THUMB_HEIGHT}px;
    border-radius: var(--radius-sm);
    border: 2px solid transparent;
    cursor: pointer;
    overflow: hidden;
    transition: border-color var(--transition), opacity var(--transition);
    flex-shrink: 0;
    position: relative;
  }
  .strip-thumb img {
    height: 100%;
    width: auto;
    display: block;
    pointer-events: none;
  }
  .strip-thumb:hover {
    border-color: var(--border);
  }
  .strip-thumb--active {
    border-color: var(--accent) !important;
  }
  .strip-thumb--exported {
    opacity: 0.5;
  }
  .strip-thumb-placeholder {
    width: 80px;
    height: 100%;
    background: var(--bg-elevated);
  }
  .strip-thumb-index {
    position: absolute;
    bottom: 2px;
    right: 3px;
    font-size: 10px;
    font-weight: 600;
    color: #fff;
    text-shadow: 0 0 3px rgba(0,0,0,0.8);
    pointer-events: none;
    line-height: 1;
  }
`
