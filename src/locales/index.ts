import { ja } from './ja'
import { en } from './en'
import { pt } from './pt'
import { es } from './es'
import { fr } from './fr'
import { ko } from './ko'
import { ru } from './ru'

export const locales = {
  ja,
  en,
  pt,
  es,
  fr,
  ko,
  ru,
} as const

export type Locale = keyof typeof locales
export type TranslationKeys = typeof ja

export const defaultLocale: Locale = 'ja'

export const localeNames: Record<Locale, string> = {
  ja: '日本語',
  en: 'English',
  pt: 'Português',
  es: 'Español',
  fr: 'Français',
  ko: '한국어',
  ru: 'Русский',
}