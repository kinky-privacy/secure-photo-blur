import { useState } from 'preact/hooks'
import type { BlurMethod, ExportFormat } from '../types'
import { BLUR_SECURITY } from '../types'
import { SecurityBadge } from './security-badge'
import { useTranslation } from '../i18n'
import type { TranslationKey } from '../i18n'

interface Props {
  method: BlurMethod
  onExport: (format: ExportFormat) => Promise<void>
  onClose: () => void
}

export function ExportDialog({ method, onExport, onClose }: Props) {
  const { t } = useTranslation()
  const format: ExportFormat = 'png'
  const [exporting, setExporting] = useState(false)
  const info = BLUR_SECURITY[method]

  async function handleExport() {
    setExporting(true)
    try {
      await onExport(format)
      onClose()
    } catch (e) {
      alert(t('editor.exportFailed', { error: e instanceof Error ? e.message : String(e) }))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div class="overlay" onClick={onClose}>
      <div class="dialog" onClick={(e) => e.stopPropagation()}>
        <h2>{t('export.title')}</h2>

        {info.hasWarning && (
          <div class="body-text export-warning">
            <span>⚠</span>
            <span>{t(`${info.i18nKey}.warning` as TranslationKey)}</span>
          </div>
        )}

        <div class="export-method">
          <SecurityBadge method={method} />
        </div>


        <ul class="export-reassurance">
          <li class="body-text">{t('export.originalSafe')}</li>
          <li class="body-text">{t('export.newCopy')}</li>
          <li class="body-text">{t('export.locationRemoved')}</li>
        </ul>

        <div class="export-actions">
          <button class="btn-ghost" type="button" onClick={onClose} disabled={exporting}>
            {t('export.cancel')}
          </button>
          <button class="btn-primary" type="button" onClick={handleExport} disabled={exporting}>
            {exporting ? t('editor.exporting') : t('editor.downloadAnonymized')}
          </button>
        </div>

        <style>{`
          .export-warning {
            display: flex;
            align-items: flex-start;
            gap: var(--sp-sm);
            background: rgba(178, 34, 34, 0.1);
            border: 1px solid var(--accent);
            border-radius: var(--radius);
            padding: var(--sp-sm) var(--sp-md);
            margin-bottom: var(--sp-md);
          }
          .export-warning span:first-child {
            color: var(--accent-light);
            flex-shrink: 0;
            font-size: var(--fs-xl);
          }
          .export-method {
            margin-bottom: var(--sp-md);
          }
          .export-actions {
            display: flex;
            justify-content: flex-end;
            gap: var(--sp-sm);
          }
          .export-reassurance {
            list-style: none;
            padding: 0;
            margin: 0 0 var(--sp-md);
            display: flex;
            flex-direction: column;
            gap: 9px;
          }
          .export-reassurance li {
            display: flex;
            align-items: center;
            gap: var(--sp-sm);
          }
        `}</style>
      </div>
    </div>
  )
}
