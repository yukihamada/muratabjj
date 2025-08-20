'use client'

import { useLanguage } from '@/contexts/LanguageContext'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const { t } = useLanguage()
  
  return (
    <footer className="border-t border-white/10 py-8">
      <div className="container mx-auto px-4">
        <small className="text-bjj-muted">
          © {currentYear} Murata BJJ — Flow × Video × Progress
        </small>
      </div>
    </footer>
  )
}