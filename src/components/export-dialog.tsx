import { useState } from 'preact/hooks'
import type { BlurMethod, ExportFormat } from '../types'
import { BLUR_SECURITY } from '../types'
import { SecurityBadge } from './security-badge'

interface Props {
  method: BlurMethod
  onExport: (format: ExportFormat) => Promise<void>
  onClose: () => void
}

export function ExportDialog({ method, onExport, onClose }: Props) {
  const format: ExportFormat = 'png'
  const [exporting, setExporting] = useState(false)
  const info = BLUR_SECURITY[method]

  async function handleExport() {
    setExporting(true)
    try {
      await onExport(format)
      onClose()
    } catch (e) {
      alert('Export failed: ' + (e instanceof Error ? e.message : String(e)))
    } finally {
      setExporting(false)
    }
  }

  return (
    <div class="overlay" onClick={onClose}>
      <div class="dialog" onClick={(e) => e.stopPropagation()}>
        <h2>Export photo</h2>

        {info.warning && (
          <div class="export-warning">
            <span>⚠</span>
            <span>{info.warning}</span>
          </div>
        )}

        <div class="export-method">
          <SecurityBadge method={method} />
        </div>


        <ul class="export-reassurance">
          <li>🛡️ Your original stays safe</li>
          <li>📁 A new copy is saved with the blur applied</li>
          <li>📍 All location data removed automatically</li>
        </ul>

        <div class="export-actions">
          <button class="btn-ghost" type="button" onClick={onClose} disabled={exporting}>
            Cancel
          </button>
          <button class="btn-primary" type="button" onClick={handleExport} disabled={exporting}>
            {exporting ? 'Exporting…' : 'Download anonymized pic'}
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
            font-size: 13px;
            color: var(--text-secondary);
            margin-bottom: var(--sp-md);
            line-height: 1.5;
          }
          .export-warning span:first-child {
            color: var(--accent-light);
            flex-shrink: 0;
            font-size: 15px;
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
            font-size: 13px;
            color: var(--text-secondary);
            display: flex;
            align-items: center;
            gap: 8px;
            line-height: 1.4;
          }
        `}</style>
      </div>
    </div>
  )
}
