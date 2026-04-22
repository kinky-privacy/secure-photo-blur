import type { BlurMethod } from '../types'
import { BLUR_SECURITY } from '../types'

interface Props {
  method: BlurMethod
  compact?: boolean
}

const LEVEL_COLOR = {
  max: '#22c55e',
  high: '#f59e0b',
  low: '#b22222',
}

const LEVEL_LABEL = {
  max: 'MAX',
  high: 'HIGH',
  low: 'LOW',
}

export function SecurityBadge({ method, compact }: Props) {
  const info = BLUR_SECURITY[method]
  const color = LEVEL_COLOR[info.level]

  return (
    <div class={`security-badge${compact ? ' security-badge--compact' : ''}`}>
      <span class="security-badge-dot" style={{ background: color }} />
      <span class="security-badge-label">{info.label}</span>
      {!compact && (
        <span class="security-badge-level" style={{ color }}>
          {LEVEL_LABEL[info.level]}
        </span>
      )}
      {!compact && info.warning && (
        <div class="security-badge-warning" title={info.warning}>⚠</div>
      )}
      <style>{`
        .security-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .security-badge--compact {
          font-size: 11px;
        }
        .security-badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .security-badge-label {
          color: var(--text-secondary);
        }
        .security-badge-level {
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 0.06em;
        }
        .security-badge-warning {
          cursor: help;
          color: var(--accent-light);
          font-size: 13px;
        }
      `}</style>
    </div>
  )
}
