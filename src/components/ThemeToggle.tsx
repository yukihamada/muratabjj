'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg bg-bjj-bg2 hover:bg-bjj-line border border-white/10 transition-all"
      aria-label={`${theme === 'dark' ? 'ライト' : 'ダーク'}モードに切り替え`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-bjj-text" />
      ) : (
        <Moon className="w-5 h-5 text-bjj-text" />
      )}
    </button>
  )
}