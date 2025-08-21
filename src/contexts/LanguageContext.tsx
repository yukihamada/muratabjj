'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { locales, Locale, defaultLocale, TranslationKeys } from '@/locales'
import { useRouter, usePathname } from 'next/navigation'

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
  const router = useRouter()
  const pathname = usePathname()
  
  // URLから言語を取得（/en/... or /pt/...）
  const getLocaleFromPath = (): Locale => {
    if (initialLocale) return initialLocale
    
    // LocalStorageから保存された言語を取得
    if (typeof window !== 'undefined') {
      const savedLocale = localStorage.getItem('locale') as Locale
      if (savedLocale && savedLocale in locales) {
        return savedLocale
      }
    }
    
    const segments = pathname.split('/')
    const possibleLocale = segments[1] as Locale
    
    if (possibleLocale && possibleLocale in locales) {
      return possibleLocale
    }
    
    return defaultLocale
  }

  const [locale, setLocaleState] = useState<Locale>(getLocaleFromPath())

  useEffect(() => {
    // LocalStorageに保存（クライアントサイドのみ）
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', locale)
    }
  }, [locale])

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale)
    
    // URLを更新
    const segments = pathname.split('/')
    const currentLocale = segments[1] as Locale
    
    if (currentLocale in locales) {
      // 既存の言語パスを置換
      segments[1] = newLocale
      const newPath = segments.join('/')
      router.push(newPath)
    } else if (newLocale !== defaultLocale) {
      // 言語パスを追加
      const newPath = `/${newLocale}${pathname}`
      router.push(newPath)
    } else {
      // デフォルト言語の場合はパスから削除
      router.push(pathname)
    }
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