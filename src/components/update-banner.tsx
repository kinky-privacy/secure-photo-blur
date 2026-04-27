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
  const dismiss = needRefresh[1] as (v: boolean) => void

  if (!show) return null

  return (
    <div class="update-banner" role="alert">
      <span class="update-banner-text">{t('update.available')}</span>
      <div class="update-banner-actions">
        <button
          class="btn-ghost update-banner-btn"
          onClick={() => dismiss(false)}
        >
          {t('update.dismiss')}
        </button>
        <button
          class="btn-primary update-banner-btn"
          onClick={() => updateServiceWorker()}
        >
          {t('update.reload')}
        </button>
      </div>

      <style>{`
        .update-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 900;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: var(--sp-md);
          padding: var(--sp-sm) var(--sp-md);
          background: var(--bg-surface);
          border-top: 1px solid var(--border);
          font-family: var(--font-sans);
          animation: update-slide-up 0.3s ease;
        }
        .update-banner-text {
          color: var(--text-primary);
          font-size: var(--fs-md);
        }
        .update-banner-actions {
          display: flex;
          gap: var(--sp-xs);
        }
        .update-banner-btn {
          padding: var(--sp-xs) var(--sp-sm);
          font-size: var(--fs-sm);
        }
        @keyframes update-slide-up {
          from { transform: translateY(100%); }
          to   { transform: translateY(0); }
        }
        @media (max-width: 480px) {
          .update-banner {
            flex-direction: column;
            gap: var(--sp-sm);
          }
          .update-banner-actions {
            width: 100%;
          }
          .update-banner-btn {
            flex: 1;
          }
        }
      `}</style>
    </div>
  )
}
