import type { BlurMethod } from '../types'
import { BLUR_SECURITY } from '../types'
import { useTranslation } from '../i18n'
import type { TranslationKey } from '../i18n'

interface Props {
  method: BlurMethod
  compact?: boolean
}

const LEVEL_COLOR = {
  max: 'var(--color-success)',
  high: 'var(--color-warning)',
  low: 'var(--accent)',
}

export function SecurityBadge({ method, compact }: Props) {
  const { t } = useTranslation()
  const info = BLUR_SECURITY[method]
  const color = LEVEL_COLOR[info.level]
  const label = t(`${info.i18nKey}.label` as TranslationKey)
  const warning = info.hasWarning ? t(`${info.i18nKey}.warning` as TranslationKey) : null

  return (
    <div class={`security-badge${compact ? ' security-badge--compact' : ''}`}>
      <span class="security-badge-dot" style={{ background: color }} />
      <span class="body-text body-text--base security-badge-label">{label}</span>
      {!compact && (
        <span class="security-badge-level" style={{ color }}>
          {t(`security.level.${info.level}` as TranslationKey)}
        </span>
      )}
      {!compact && warning && (
        <div class="security-badge-warning" title={warning}>⚠</div>
      )}
      <style>{`
        .security-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: var(--fs-base);
          color: var(--text-secondary);
        }
        .security-badge--compact {
          font-size: var(--fs-sm);
        }
        .security-badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .security-badge-label {
        }
        .security-badge-level {
          font-weight: 700;
          font-size: var(--fs-xs);
          letter-spacing: 0.06em;
        }
        .security-badge-warning {
          cursor: help;
          color: var(--accent-light);
          font-size: var(--fs-md);
        }
      `}</style>
    </div>
  )
}
