import { useTranslation } from '../i18n'
import type { TranslationKey } from '../i18n'
import type { SecurityLevel } from '../types'

interface Props {
  onClose: () => void
}

const LEVEL_COLOR = {
  max: 'var(--color-success)',
  high: 'var(--color-warning)',
  low: 'var(--accent)',
}

const METHODS_INFO: Array<{ i18nPrefix: string; level: SecurityLevel; hasWarning: boolean }> = [
  { i18nPrefix: 'securityInfo.mosaic', level: 'high', hasWarning: false },
  { i18nPrefix: 'securityInfo.solid', level: 'max', hasWarning: false },
  { i18nPrefix: 'securityInfo.solidAvg', level: 'max', hasWarning: false },
  { i18nPrefix: 'securityInfo.gaussian', level: 'low', hasWarning: true },
]

export function SecurityInfoDialog({ onClose }: Props) {
  const { t } = useTranslation()

  return (
    <div class="overlay" onClick={onClose}>
      <div class="dialog si-dialog" onClick={(e) => e.stopPropagation()}>
        <h2>{t('securityInfo.title')}</h2>
        <p class="body-text body-text--relaxed">
          {t('securityInfo.intro')}
        </p>

        <div class="si-methods">
          {METHODS_INFO.map((m) => {
            const color = LEVEL_COLOR[m.level]
            const label = t(`${m.i18nPrefix}.label` as TranslationKey)
            return (
              <div key={m.i18nPrefix} class="si-method">
                <div class="si-method-header">
                  <span class="si-dot" style={{ background: color }} />
                  <span class="si-method-label">{label}</span>
                  <span class="si-level" style={{ color }}>{t(`security.level.${m.level}` as TranslationKey)}</span>
                </div>
                <p class="body-text body-text--primary si-simple">{t(`${m.i18nPrefix}.simple` as TranslationKey)}</p>
                <p class="body-text body-text--base body-text--muted body-text--relaxed si-technical">{t(`${m.i18nPrefix}.technical` as TranslationKey)}</p>
                {m.hasWarning && <p class="body-text body-text--base body-text--accent si-method-warning">{t('securityInfo.notRecommended')}</p>}
              </div>
            )
          })}
        </div>

        <div class="sep" />

        <div class="si-actions">
          <button class="btn-primary" type="button" onClick={onClose}>{t('securityInfo.gotIt')}</button>
        </div>

        <style>{`
          .si-dialog {
            max-width: 520px;
            max-height: 85vh;
            display: flex;
            flex-direction: column;
          }
          .si-methods {
            overflow-y: auto;
            flex: 1;
            display: flex;
            flex-direction: column;
            gap: var(--sp-md);
            margin-bottom: var(--sp-md);
          }
          .si-method {
            border: 1px solid var(--border);
            border-radius: var(--radius);
            padding: var(--sp-md);
            background: var(--bg-elevated);
          }
          .si-method-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: var(--sp-sm);
          }
          .si-dot {
            width: 8px;
            height: 8px;
            border-radius: 50%;
            flex-shrink: 0;
          }
          .si-method-label {
            font-weight: 600;
            font-size: var(--fs-lg);
            color: var(--text-primary);
            flex: 1;
          }
          .si-level {
            font-size: var(--fs-xs);
            font-weight: 700;
            letter-spacing: 0.08em;
          }
          .si-simple {
            margin-bottom: var(--sp-sm) !important;
          }
          .si-technical {
            margin-bottom: 0 !important;
          }
          .si-method-warning {
            margin-top: var(--sp-sm);
            margin-bottom: 0 !important;
          }
          .si-actions {
            display: flex;
            justify-content: flex-end;
          }
        `}</style>
      </div>
    </div>
  )
}
