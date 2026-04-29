import { useState } from 'preact/hooks'
import { useTranslation } from '../i18n'
import { LanguageModal, LOCALE_FLAGS, LOCALE_LABELS } from './language-modal'
import { FeedbackModal } from './feedback-modal'

export function FloatingLandingButtons() {
  const { t, locale } = useTranslation()
  const [showLangModal, setShowLangModal] = useState(false)
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)

  return (
    <>
      <div class="floating-landing-btns">
        <button class="floating-btn" type="button" onClick={() => setShowLangModal(true)}>
          {LOCALE_FLAGS[locale]} {LOCALE_LABELS[locale]}
        </button>
        <button
          class="floating-btn"
          aria-label={t('navbar.feedback.aria')}
          type="button"
          onClick={() => setShowFeedbackModal(true)}
        >
          {t('navbar.feedback')}
        </button>
      </div>
      {showLangModal && <LanguageModal onClose={() => setShowLangModal(false)} />}
      {showFeedbackModal && <FeedbackModal onClose={() => setShowFeedbackModal(false)} />}

      <style>{`
        .floating-landing-btns {
          position: fixed;
          top: var(--sp-md);
          right: var(--sp-md);
          z-index: 50;
          display: flex;
          gap: var(--sp-sm);
        }
        .floating-btn {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #1a1a1a;
          font-size: var(--fs-sm);
          font-family: var(--font-sans);
          font-weight: 500;
          cursor: pointer;
          padding: var(--sp-xs) var(--sp-sm);
          border-radius: var(--radius);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
          transition: background var(--transition), box-shadow var(--transition);
        }
        .floating-btn:hover {
          background: #fff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        }
      `}</style>
    </>
  )
}
