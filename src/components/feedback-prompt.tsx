import { useEffect, useState } from 'preact/hooks'
import { useTranslation } from '../i18n'
import { FeedbackModal } from './feedback-modal'

const LS_FEEDBACK_KEY = 'photoblur-feedback-asked'
const ASK_EVERY = 7 * 24 * 60 * 60 * 1000 // 7 days
const THANKS_DURATION = 2500

type Answer = 'all-good' | 'suggestion' | 'dismissed'

/** The dialog shows only when online and at most once every 7 days per device */
export function shouldAskFeedback(): boolean {
  if (!navigator.onLine) return false
  try {
    const last = Number(localStorage.getItem(LS_FEEDBACK_KEY))
    return !last || Date.now() - last > ASK_EVERY
  } catch {
    return false
  }
}

interface Props {
  onClose: () => void
}

export function FeedbackPrompt({ onClose }: Props) {
  const { t } = useTranslation()
  const [step, setStep] = useState<'question' | 'form' | 'thanks'>('question')

  // Remember when the dialog was shown, so it stays away for the next 7 days
  useEffect(() => {
    try { localStorage.setItem(LS_FEEDBACK_KEY, String(Date.now())) } catch {}
  }, [])

  // Escape counts as closing with the X
  useEffect(() => {
    if (step !== 'question') return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') answer('dismissed')
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [step])

  // The thanks stays up for a moment, then the dialog closes by itself
  useEffect(() => {
    if (step !== 'thanks') return
    const timer = setTimeout(onClose, THANKS_DURATION)
    return () => clearTimeout(timer)
  }, [step])

  // Only the choice the user clicks is sent: one of three fixed words, with no identifier.
  // Showing the dialog sends nothing.
  function answer(value: Answer) {
    navigator.sendBeacon('/api/feedback', value)
    if (value === 'dismissed') onClose()
    else setStep(value === 'suggestion' ? 'form' : 'thanks')
  }

  if (step === 'form') return <FeedbackModal onClose={() => setStep('thanks')} />

  return (
    <div class="overlay feedback-prompt-overlay" onClick={step === 'thanks' ? onClose : undefined}>
      <div class="dialog feedback-prompt" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        {step === 'thanks' ? (
          <p class="feedback-prompt-text">{t('feedbackPrompt.thanks')}</p>
        ) : (
          <>
            <button class="btn-icon feedback-prompt-close" type="button" onClick={() => answer('dismissed')} aria-label={t('feedbackPrompt.close')}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
            <p class="feedback-prompt-text feedback-prompt-question">{t('feedbackPrompt.question')}</p>
            <div class="feedback-prompt-actions">
              <button class="btn-ghost" type="button" onClick={() => answer('suggestion')}>
                {t('feedbackPrompt.suggestion')}
              </button>
              <button class="btn-primary" type="button" onClick={() => answer('all-good')}>
                {t('feedbackPrompt.allGood')}
              </button>
            </div>
          </>
        )}
      </div>

      <style>{`
        .overlay.feedback-prompt-overlay {
          background: rgba(0, 0, 0, 0.82);
          -webkit-backdrop-filter: blur(8px);
          backdrop-filter: blur(8px);
        }
        .feedback-prompt {
          position: relative;
          max-width: 440px;
          padding: var(--sp-xl) var(--sp-lg);
          text-align: center;
        }
        .feedback-prompt .feedback-prompt-text {
          margin: 0;
          font-size: var(--fs-3xl);
          line-height: 1.4;
          color: var(--text-primary);
        }
        .feedback-prompt .feedback-prompt-question {
          padding: 0 var(--sp-lg);
        }
        .feedback-prompt-close {
          position: absolute;
          top: var(--sp-sm);
          right: var(--sp-sm);
        }
        .feedback-prompt-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: var(--sp-md);
          margin-top: var(--sp-xl);
        }
        .feedback-prompt-actions button {
          padding: 12px 22px;
          font-size: var(--fs-2xl);
        }
      `}</style>
    </div>
  )
}
