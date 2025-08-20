'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { localeNames, Locale } from '@/locales'
import { Globe } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'

export default function LanguageSwitcher() {
  const { locale, setLocale } = useLanguage()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm hover:text-bjj-accent transition-colors"
        aria-label="Change language"
      >
        <Globe size={18} />
        <span className="hidden sm:inline">{localeNames[locale]}</span>
        <span className="sm:hidden">{locale.toUpperCase()}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-bjj-bg2 border border-white/10 rounded-lg shadow-lg overflow-hidden animate-fade-in">
          {(Object.keys(localeNames) as Locale[]).map((lang) => (
            <button
              key={lang}
              onClick={() => {
                setLocale(lang)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-2 text-sm transition-colors ${
                locale === lang
                  ? 'bg-bjj-accent text-white'
                  : 'hover:bg-white/5 hover:text-bjj-accent'
              }`}
            >
              {localeNames[lang]}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}