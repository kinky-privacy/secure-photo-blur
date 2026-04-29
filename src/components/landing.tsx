import { useRef, useState } from 'preact/hooks'
import { MosaicBackdrop } from './mosaic-backdrop'
import { useTranslation } from '../i18n'

const REPO_URL = 'https://github.com/secure-photo-blur/secure-photo-blur'

interface Props {
  onFilesSelected: (files: File[]) => void
  loading?: boolean
  error?: string | null
}

const ACCEPTED = '.jpg,.jpeg,.png,.webp,.heic,.heif'

export function Landing({ onFilesSelected, loading, error }: Props) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)

  function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return
    const valid = Array.from(fileList).filter(f => f.type.startsWith('image/'))
    if (valid.length > 0) onFilesSelected(valid)
  }

  function onInputChange(e: Event) {
    handleFiles((e.target as HTMLInputElement).files)
  }

  function onDrop(e: DragEvent) {
    e.preventDefault()
    setDragging(false)
    handleFiles(e.dataTransfer?.files ?? null)
  }

  function onDragOver(e: DragEvent) {
    e.preventDefault()
    setDragging(true)
  }

  function onDragLeave() {
    setDragging(false)
  }

  return (
    <div class="landing-wrap">
      <MosaicBackdrop />
      <div class="landing">
      <main class="landing-main">
        <h1 class="landing-hero">
          {t('landing.hero')} <em>{t('landing.heroAccent')}</em>
        </h1>
        <div
          class={`drop-zone${dragging ? ' drop-zone--active' : ''}`}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onClick={() => inputRef.current?.click()}
          role="button"
          tabIndex={0}
          aria-label={t('landing.dropzone.aria')}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              inputRef.current?.click()
            }
          }}
        >
          <input
            ref={inputRef}
            type="file"
            accept={ACCEPTED}
            multiple
            onChange={onInputChange}
            style={{ display: 'none' }}
          />
          {loading ? (
            <div class="drop-zone-loading">
              <div class="spinner" />
              <span>{t('landing.dropzone.loading')}</span>
            </div>
          ) : (
            <>
              <svg class="drop-zone-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="17 8 12 3 7 8"/>
                <line x1="12" y1="3" x2="12" y2="15"/>
              </svg>
              <span class="body-text drop-zone-label">{t('landing.dropzone.label')}</span>
              <button class="btn-primary" type="button" onClick={(e) => { e.stopPropagation(); inputRef.current?.click() }}>
                {t('landing.dropzone.button')}
              </button>
              <span class="body-text body-text--base body-text--muted drop-zone-formats">{t('landing.dropzone.formats')}</span>
            </>
          )}
        </div>

        <p class="body-text body-text--relaxed landing-tagline">
          {t('landing.tagline.line1')}<br />
          {t('landing.tagline.line2')}<br />
          {t('landing.tagline.line3')}<br />
          {t('landing.tagline.line4')}
        </p>

        {error && <p class="body-text body-text--accent landing-error">{error}</p>}

        <p class="body-text body-text--relaxed landing-nerdy-link">
          {t('landing.nerdy.text')}{' '}
          <a class="landing-oss-link" href={REPO_URL} target="_blank" rel="noopener noreferrer">{t('landing.nerdy.linkText')}</a>.<br />
          {t('landing.nerdy.dmPrefix')}{' '}
          <a class="landing-oss-link" href="https://fetlife.com/presence_" target="_blank" rel="noopener noreferrer">@presence_</a>{' '}
          {t('landing.nerdy.or')}{' '}
          <a class="landing-oss-link" href="mailto:hello@securephotoblur.com">hello@securephotoblur.com</a>
        </p>

      </main>
      </div>

      <style>{`
        .landing-wrap {
          position: relative;
          height: 100vh;
          overflow: hidden;
        }
        .landing {
          display: flex;
          flex-direction: column;
          height: 100%;
          overflow-y: auto;
        }
        .landing-main {
          position: relative;
          z-index: 1;
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          padding: var(--sp-xl);
          max-width: 600px;
          margin: 0;
          width: 100%;
          gap: var(--sp-lg);
        }
        .landing-hero {
          font-family: var(--font-serif);
          font-size: clamp(32px, 8vw, 48px);
          font-weight: 700;
          text-align: left;
          line-height: 1.15;
        }
        .landing-hero em {
          font-style: italic;
          font-weight: 400;
          color: var(--accent-light);
        }
        .landing-tagline {
          text-align: left;
        }
        .drop-zone {
          width: 100%;
          max-width: 480px;
          align-self: flex-start;
          border: 2px dashed var(--border);
          border-radius: var(--radius);
          padding: var(--sp-xl) var(--sp-lg);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--sp-sm);
          cursor: pointer;
          transition: border-color var(--transition), background var(--transition);
          background: var(--bg-surface);
        }
        .drop-zone:hover,
        .drop-zone--active {
          border-color: var(--accent);
          background: var(--bg-elevated);
        }
        .drop-zone-icon {
          color: var(--text-muted);
          margin-bottom: var(--sp-xs);
        }
        .drop-zone-label {
        }
        .drop-zone-formats {
          margin-top: var(--sp-xs);
        }
        .drop-zone-loading {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: var(--sp-sm);
          color: var(--text-secondary);
        }
        .landing-error {
          text-align: left;
        }
.landing-oss-link {
          color: var(--link-accent);
          text-decoration: none;
        }
        .landing-oss-link:hover {
          text-decoration: underline;
        }
        .landing-nerdy-link {
          margin-top: auto;
          text-align: left;
          padding-bottom: var(--sp-md);
        }
        @media (min-width: 768px) {
          .landing-main {
            align-items: flex-start;
            justify-content: flex-start;
            margin: 0;
            padding-left: 6vw;
            padding-top: 8vh;
          }
          .landing-hero {
            text-align: left;
          }
          .landing-tagline {
            text-align: left;
          }
        }
      `}</style>
    </div>
  )
}
