import { ja } from './ja'
import { en } from './en'
import { pt } from './pt'

export const locales = {
  ja,
  en,
  pt,
} as const

export type Locale = keyof typeof locales
export type TranslationKeys = typeof ja

export const defaultLocale: Locale = 'ja'

export const localeNames: Record<Locale, string> = {
  ja: '日本語',
  en: 'English',
  pt: 'Português',
}