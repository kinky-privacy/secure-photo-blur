import { useRegisterSW } from 'virtual:pwa-register/preact'
import { useTranslation } from '../i18n'

const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000 // 60 minutes

export function UpdateBanner() {
  const { t } = useTranslation()

  const { needRefresh, updateServiceWorker } = useRegisterSW({
    onRegisteredSW(_swUrl, registration) {
      if (registration) {
        setInterval(() => { registration.update() }, UPDATE_CHECK_INTERVAL)
      }
    },
    onRegisterError(error) {
      console.error('SW registration error:', error)
    },
  })

  const show = needRefresh[0]

  if (!show) return null

  return (
    <div class="overlay" onClick={() => updateServiceWorker()}>
      <div class="dialog update-dialog" onClick={(e) => e.stopPropagation()}>
        <p class="update-text">{t('update.available')}</p>
        <div class="update-actions">
          <button
            class="btn-primary update-btn"
            onClick={() => updateServiceWorker()}
          >
            {t('update.reload')}
          </button>
        </div>
      </div>

      <style>{`
        .update-dialog {
          max-width: 320px;
          text-align: center;
        }
        .update-text {
          font-size: var(--fs-lg);
          color: var(--text-primary);
          margin: 0 0 var(--sp-lg);
        }
        .update-actions {
          display: flex;
          justify-content: center;
        }
        .update-btn {
          min-width: 140px;
        }
      `}</style>
    </div>
  )
}
