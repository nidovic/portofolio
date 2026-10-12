import i18n from 'i18next'
import BrowserLanguageDetector from 'i18next-browser-languagedetector'
import { initReactI18next } from 'react-i18next'
import { translations } from '@/i18n/translations.js'

i18n
  .use(BrowserLanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: translations.en },
      fr: { translation: translations.fr },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'fr'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'portfolio-language',
      caches: [],
    },
    interpolation: {
      escapeValue: false,
    },
  })

export default i18n