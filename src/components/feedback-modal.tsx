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
          <a class="body-text feedback-contact" href="https://fetlife.com/presence_" target="_blank" rel="noopener noreferrer">
            <div class="feedback-contact-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
            </div>
            <div class="feedback-contact-text">
              <span class="feedback-contact-label">{t('feedbackModal.fetlife')}</span>
              <span class="feedback-contact-value">@presence_</span>
            </div>
          </a>
          <div class="feedback-anon-block">
            <div class="feedback-contact-icon">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
              </svg>
            </div>
            <div class="feedback-anon-right">
              <div class="feedback-contact-text">
                <span class="body-text feedback-contact-label">{t('feedbackModal.anonymous')}</span>
                <span class="body-text feedback-contact-value">{t('feedbackModal.anonymousDesc')}</span>
              </div>
              <div class="feedback-tally-wrap">
                <iframe
                  src="https://tally.so/embed/681pb5?alignLeft=1&hideTitle=1&transparentBackground=1"
                  width="100%"
                  height="400"
                  frameBorder={0}
                  title="Feedback form"
                />
              </div>
            </div>
          </div>
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
        .feedback-anon-block {
          display: flex;
          align-items: flex-start;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: var(--sp-sm) 0 0 var(--sp-md);
          gap: var(--sp-md);
          color: var(--text-secondary);
        }
        .feedback-anon-right {
          flex: 1;
          min-width: 0;
          display: flex;
          flex-direction: column;
          gap: var(--sp-sm);
        }
        .feedback-tally-wrap {
          overflow: hidden;
        }
        .feedback-tally-wrap iframe {
          display: block;
          margin-left: -6px;
          width: calc(100% + 6px);
        }
      `}</style>
    </div>
  )
}
