import { useEffect } from 'preact/hooks'
import { useTranslation } from '../i18n'

interface Props {
  onClose: () => void
}

export function FeedbackModal({ onClose }: Props) {
  const { t } = useTranslation()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div class="overlay" onClick={onClose}>
      <div class="dialog feedback-dialog" onClick={(e) => e.stopPropagation()}>
        <button class="feedback-close" type="button" onClick={onClose} aria-label="Close">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"/>
            <line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>

        <div class="feedback-tally-wrap">
          <iframe
            src="https://tally.so/embed/ja0e9E?alignLeft=1&hideTitle=1&transparentBackground=1"
            width="100%"
            height="240"
            frameBorder={0}
            title="Feedback form"
          />
        </div>

        <p class="body-text feedback-or-text">{t('feedbackModal.or')}</p>

        <div class="feedback-contacts">
          <a class="body-text feedback-contact" href="mailto:hello@securephotoblur.com">
            <div class="feedback-contact-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
              </svg>
            </div>
            <div class="feedback-contact-text">
              <span class="feedback-contact-label">{t('feedbackModal.email')}</span>
              <span class="feedback-contact-value">hello@securephotoblur.com</span>
            </div>
          </a>
        </div>
      </div>

      <style>{`
        .feedback-dialog {
          position: relative;
          max-width: 500px;
          width: calc(100vw - 2 * var(--sp-lg));
          padding: var(--sp-md);
        }
        .feedback-close {
          position: absolute;
          top: var(--sp-md);
          right: var(--sp-md);
          background: transparent;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: var(--sp-xs);
          border-radius: var(--radius-sm);
          transition: color var(--transition), background var(--transition);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .feedback-close:hover {
          color: var(--text-primary);
          background: var(--bg-elevated);
        }
        .feedback-contacts {
          display: flex;
          flex-direction: column;
          gap: var(--sp-xs);
        }
        .feedback-contact {
          display: flex;
          align-items: center;
          gap: var(--sp-md);
          padding: var(--sp-sm) var(--sp-md);
          border-radius: var(--radius);
          border: 1px solid var(--border);
          color: var(--text-secondary);
          text-decoration: none;
          transition: background var(--transition), color var(--transition), border-color var(--transition);
        }
        .feedback-contact:hover {
          background: var(--bg-elevated);
          border-color: var(--accent-light);
          color: var(--text-primary);
        }
        .feedback-contact:hover .feedback-contact-icon {
          background: var(--bg-surface);
          border-color: var(--accent-light);
        }
        .feedback-contact-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
          border: 1px solid var(--border);
          background: var(--bg-base);
          flex-shrink: 0;
          transition: background var(--transition), border-color var(--transition);
        }
        .feedback-contact-icon svg {
          opacity: 0.7;
        }
        .feedback-contact-text {
          display: flex;
          flex-direction: column;
          gap: 1px;
        }
        .feedback-contact-label {
          font-weight: 600;
        }
        .feedback-contact-value {
          color: var(--accent-light);
        }
        .feedback-tally-wrap {
          overflow: hidden;
        }
        .feedback-tally-wrap iframe {
          display: block;
        }
        .feedback-or-text {
          margin: var(--sp-md) 0 var(--sp-xs);
          color: var(--text-muted);
        }
      `}</style>
    </div>
  )
}
