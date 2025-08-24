import { ja } from './ja'
import { en } from './en'
import { pt } from './pt'
import { es } from './es'
import { fr } from './fr'
import { ko } from './ko'
import { ru } from './ru'
import { zh } from './zh'
import { de } from './de'
import { it } from './it'

export const locales = {
  ja,
  en,
  pt,
  es,
  fr,
  ko,
  ru,
  zh,
  de,
  it,
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
  zh: '中文',
  de: 'Deutsch',
  it: 'Italiano',
}