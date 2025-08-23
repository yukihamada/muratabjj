'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { locales, Locale, defaultLocale, TranslationKeys } from '@/locales'

interface LanguageContextType {
  locale: Locale
  language: Locale
  setLocale: (locale: Locale) => void
  t: TranslationKeys
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ 
  children,
  initialLocale 
}: { 
  children: ReactNode
  initialLocale?: Locale 
}) {
  // サーバーサイドレンダリング時はデフォルト言語を使用
  const getInitialLocale = (): Locale => {
    // サーバーサイドまたは初期ロケールが指定されている場合
    if (typeof window === 'undefined' || initialLocale) {
      return initialLocale || defaultLocale
    }
    
    // クライアントサイドでLocalStorageから保存された言語を取得
    const savedLocale = localStorage.getItem('murata-bjj-locale') as Locale
    if (savedLocale && savedLocale in locales) {
      return savedLocale
    }
    
    return defaultLocale
  }

  const [locale, setLocaleState] = useState<Locale>(getInitialLocale())

  // クライアントサイドで初回ロード時にlocalStorageから言語を復元
  useEffect(() => {
    if (typeof window !== 'undefined' && !initialLocale) {
      const savedLocale = localStorage.getItem('murata-bjj-locale') as Locale
      if (savedLocale && savedLocale in locales && savedLocale !== locale) {
        setLocaleState(savedLocale)
      }
    }
  }, [])

  // 言語変更時にlocalStorageに保存
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('murata-bjj-locale', locale)
    }
  }, [locale])

  // 言語変更（URL操作なし）
  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
  }

  const t = locales[locale]

  return (
    <LanguageContext.Provider value={{ locale, language: locale, setLocale, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

// テンプレート文字列の置換ヘルパー
export function interpolate(text: string, values: Record<string, string | number>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    return values[key]?.toString() || match
  })
}