import { createContext } from 'preact'
import { useContext, useState, useCallback, useMemo } from 'preact/hooks'
import type { ComponentChildren } from 'preact'
import { en } from './locales/en'
import { it } from './locales/it'

export type TranslationKey = keyof typeof en
export type Locale = 'en' | 'it'

const SUPPORTED_LOCALES: Locale[] = ['en', 'it']
const LS_LOCALE_KEY = 'photoblur-locale'

const dictionaries: Record<Locale, Record<string, string>> = { en, it }

function detectLocale(): Locale {
  try {
    const saved = localStorage.getItem(LS_LOCALE_KEY)
    if (saved && SUPPORTED_LOCALES.includes(saved as Locale)) return saved as Locale
  } catch {}
  const browserLang = navigator.language.split('-')[0]
  if (SUPPORTED_LOCALES.includes(browserLang as Locale)) return browserLang as Locale
  return 'en'
}

type TFunction = (key: TranslationKey, params?: Record<string, string | number>) => string

interface I18nContextValue {
  t: TFunction
  locale: Locale
  setLocale: (l: Locale) => void
}

const I18nContext = createContext<I18nContextValue>(null!)

export function I18nProvider({ children }: { children: ComponentChildren }) {
  const [locale, setLocaleState] = useState<Locale>(detectLocale)

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try { localStorage.setItem(LS_LOCALE_KEY, l) } catch {}
    document.documentElement.lang = l
  }, [])

  const t: TFunction = useCallback((key, params) => {
    let str = dictionaries[locale][key] ?? dictionaries.en[key] ?? key
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        str = str.replace(`{${k}}`, String(v))
      }
    }
    return str
  }, [locale])

  const value = useMemo(() => ({ t, locale, setLocale }), [t, locale, setLocale])

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useTranslation() {
  return useContext(I18nContext)
}

export { SUPPORTED_LOCALES }
