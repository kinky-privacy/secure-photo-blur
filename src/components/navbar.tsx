import { useState, useEffect } from 'preact/hooks'
import { useTranslation } from '../i18n'
import { LanguageModal, LOCALE_FLAGS, LOCALE_LABELS } from './language-modal'

interface NavbarProps {
  phase: 'grouping' | 'editing' | null
  isMulti: boolean
  onPhaseChange?: (phase: 'grouping' | 'editing') => void
  onReset?: () => void
}

export function Navbar({ phase, isMulti, onPhaseChange, onReset }: NavbarProps) {
  const { t, locale } = useTranslation()
  const showTabs = isMulti && phase !== null
  const canGoHome = phase !== null
  const [showConfirm, setShowConfirm] = useState(false)
  const [showLangModal, setShowLangModal] = useState(false)

  useEffect(() => {
    if (!showConfirm) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setShowConfirm(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [showConfirm])

  function handleBrandClick() {
    if (!canGoHome || !onReset) return
    setShowConfirm(true)
  }

  function handleConfirm() {
    setShowConfirm(false)
    onReset?.()
  }

  return (
    <>
    <nav class={`navbar${phase === null ? ' navbar--landing' : ''}`}>
      <div class="navbar-left">
        {canGoHome ? (
          <button class="navbar-brand" type="button" onClick={handleBrandClick}>
            <svg class="navbar-brand-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"/>
              <polyline points="12 19 5 12 12 5"/>
            </svg>
            {t('navbar.brand')} <em>{t('navbar.brandAccent')}</em>
          </button>
        ) : (
          <span class="navbar-brand navbar-brand--static">
            {t('navbar.brand')} <em>{t('navbar.brandAccent')}</em>
          </span>
        )}
      </div>

      <div class="navbar-center">
        {showTabs && (
          <div class="navbar-tabs">
            <button
              class={`navbar-tab${phase === 'grouping' ? ' navbar-tab--active' : ''}`}
              type="button"
              onClick={() => onPhaseChange?.('grouping')}
            >
              {t('navbar.tab.grouping')}
            </button>
            <button
              class={`navbar-tab${phase === 'editing' ? ' navbar-tab--active' : ''}`}
              type="button"
              onClick={() => onPhaseChange?.('editing')}
            >
              {t('navbar.tab.anonymize')}
            </button>
          </div>
        )}
      </div>

      <div class="navbar-right">
        <button class="navbar-lang-btn" type="button" onClick={() => setShowLangModal(true)}>
          {LOCALE_FLAGS[locale]} {LOCALE_LABELS[locale]}
        </button>
        <button
          class="navbar-feedback-btn"
          data-tally-open="681pb5"
          data-tally-emoji-text="👋"
          data-tally-emoji-animation="wave"
          data-tally-auto-close="3000"
          aria-label={t('navbar.feedback.aria')}
          type="button"
        >
          {t('navbar.feedback')}
        </button>
      </div>

      <style>{`
        .navbar {
          display: flex;
          align-items: center;
          justify-content: space-between;
          height: var(--navbar-height, 48px);
          padding: 0 var(--sp-md);
          background: var(--bg-surface);
          border-bottom: 1px solid var(--border);
          flex-shrink: 0;
          z-index: 100;
        }
        .navbar-left,
        .navbar-right {
          flex: 1 1 0;
          display: flex;
          align-items: center;
        }
        .navbar-right {
          justify-content: flex-end;
        }
        .navbar-center {
          flex: 0 0 auto;
        }
        .navbar-brand {
          font-family: var(--font-serif);
          font-size: var(--fs-2xl);
          font-weight: 700;
          color: var(--text-primary);
          background: none;
          border: none;
          cursor: pointer;
          display: inline-flex;
          align-items: center;
          gap: var(--sp-sm);
          padding: 0;
          line-height: 1;
          transition: color var(--transition);
        }
        .navbar-brand:hover {
          color: var(--accent-light);
        }
        .navbar-brand em {
          font-style: italic;
          font-weight: 400;
          color: var(--accent-light);
        }
        .navbar-brand--static {
          cursor: default;
        }
        .navbar-brand--static:hover {
          color: var(--text-primary);
        }
        .navbar-brand-icon {
          opacity: 0.5;
          flex-shrink: 0;
        }
        .navbar-brand:hover .navbar-brand-icon {
          opacity: 1;
        }
        .navbar-tabs {
          display: flex;
          gap: 2px;
          background: var(--bg-base);
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: 2px;
        }
        .navbar-tab {
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          padding: var(--sp-xs) var(--sp-md);
          font-family: var(--font-sans);
          font-size: 14px;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
          transition: color var(--transition), background var(--transition);
          white-space: nowrap;
        }
        .navbar-tab:hover {
          color: var(--text-secondary);
        }
        .navbar-tab--active {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }
        .navbar-feedback-btn {
          background: rgba(255, 255, 255, 0.9);
          border: 1px solid rgba(255, 255, 255, 0.3);
          color: #1a1a1a;
          font-size: var(--fs-sm);
          font-family: var(--font-sans);
          font-weight: 500;
          cursor: pointer;
          padding: var(--sp-xs) var(--sp-sm);
          border-radius: var(--radius);
          transition: background var(--transition), box-shadow var(--transition);
          box-shadow: 0 1px 4px rgba(0, 0, 0, 0.25);
        }
        .navbar-feedback-btn:hover {
          background: #fff;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.35);
        }
        .navbar-lang-btn {
          background: transparent;
          border: 1px solid var(--border);
          border-radius: var(--radius);
          padding: var(--sp-xs) var(--sp-sm);
          font-size: var(--fs-sm);
          font-family: var(--font-sans);
          font-weight: 600;
          color: var(--text-primary);
          cursor: pointer;
          margin-right: var(--sp-sm);
          transition: background var(--transition), color var(--transition);
        }
        .navbar-lang-btn:hover {
          background: var(--bg-elevated);
        }
        .navbar--landing {
          display: none;
        }
        @media (max-width: 480px) {
          .navbar {
            padding: 0 var(--sp-sm);
          }
          .navbar-brand {
            font-size: var(--fs-lg);
          }
          .navbar-tab {
            padding: var(--sp-xs) var(--sp-sm);
            font-size: var(--fs-base);
          }
        }
      `}</style>
    </nav>

    {showConfirm && (
      <div class="overlay" onClick={() => setShowConfirm(false)}>
        <div class="dialog confirm-dialog" onClick={(e) => e.stopPropagation()}>
          <h2 class="confirm-heading">{t('navbar.confirm.title')}</h2>
          <p class="body-text confirm-body">{t('navbar.confirm.body')}</p>
          <div class="confirm-actions">
            <button class="btn-ghost" type="button" onClick={() => setShowConfirm(false)}>
              {t('navbar.confirm.cancel')}
            </button>
            <button class="btn-primary" type="button" onClick={handleConfirm}>
              {t('navbar.confirm.go')}
            </button>
          </div>
        </div>

        <style>{`
          .confirm-heading {
            margin: 0 0 var(--sp-sm);
            font-size: var(--fs-2xl);
            font-weight: 600;
            color: var(--text-primary);
          }
          .confirm-body {
            margin: 0 0 var(--sp-lg);
          }
          .confirm-actions {
            display: flex;
            justify-content: flex-end;
            gap: var(--sp-sm);
          }
        `}</style>
      </div>
    )}

    {showLangModal && <LanguageModal onClose={() => setShowLangModal(false)} />}
    </>
  )
}
