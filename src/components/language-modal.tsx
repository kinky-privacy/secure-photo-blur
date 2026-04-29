import { useEffect } from 'preact/hooks'
import { useTranslation, SUPPORTED_LOCALES } from '../i18n'
import type { Locale } from '../i18n'

export const LOCALE_FLAGS: Record<Locale, string> = {
  en: '🇬🇧',
  it: '🇮🇹',
  de: '🇩🇪',
  fr: '🇫🇷',
  es: '🇪🇸',
  pl: '🇵🇱',
}

export const LOCALE_LABELS: Record<Locale, string> = {
  en: 'EN',
  it: 'IT',
  de: 'DE',
  fr: 'FR',
  es: 'ES',
  pl: 'PL',
}

const LOCALE_NAMES: Record<Locale, string> = {
  en: 'English',
  it: 'Italiano',
  de: 'Deutsch',
  fr: 'Français',
  es: 'Español',
  pl: 'Polski',
}

interface Props {
  onClose: () => void
}

export function LanguageModal({ onClose }: Props) {
  const { t, locale, setLocale } = useTranslation()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  function handleSelect(l: Locale) {
    setLocale(l)
    onClose()
  }

  return (
    <div class="overlay" onClick={onClose}>
      <div class="dialog lang-dialog" onClick={(e) => e.stopPropagation()}>
        <h2 class="lang-heading">{t('languageModal.title')}</h2>
        <div class="lang-list">
          {SUPPORTED_LOCALES.map(l => (
            <button
              key={l}
              class={`lang-option${locale === l ? ' lang-option--active' : ''}`}
              type="button"
              onClick={() => handleSelect(l)}
            >
              <span class="lang-flag">{LOCALE_FLAGS[l]}</span>
              <span class="lang-name">{LOCALE_NAMES[l]}</span>
              {locale === l && (
                <svg class="lang-check" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              )}
            </button>
          ))}
        </div>
      </div>

      <style>{`
        .lang-dialog {
          max-width: 320px;
        }
        .lang-heading {
          margin: 0 0 var(--sp-md);
          font-size: var(--fs-2xl);
          font-weight: 600;
          color: var(--text-primary);
        }
        .lang-list {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .lang-option {
          display: flex;
          align-items: center;
          gap: var(--sp-sm);
          width: 100%;
          padding: var(--sp-sm) var(--sp-md);
          background: transparent;
          border: none;
          border-radius: var(--radius-sm);
          cursor: pointer;
          font-family: var(--font-sans);
          font-size: var(--fs-base);
          color: var(--text-secondary);
          transition: background var(--transition), color var(--transition);
        }
        .lang-option:hover {
          background: var(--bg-elevated);
          color: var(--text-primary);
        }
        .lang-option--active {
          background: var(--bg-elevated);
          color: var(--text-primary);
          font-weight: 600;
        }
        .lang-flag {
          font-size: 1.25em;
          line-height: 1;
        }
        .lang-name {
          flex: 1;
          text-align: left;
        }
        .lang-check {
          color: var(--accent-light);
          flex-shrink: 0;
        }
      `}</style>
    </div>
  )
}
