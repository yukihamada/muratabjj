'use client'

import { useTheme } from '@/contexts/ThemeContext'
import { Moon, Sun } from 'lucide-react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()

  const handleClick = () => {
    console.log('[ThemeToggle] Button clicked, current theme:', theme)
    toggleTheme()
  }

  return (
    <button
      onClick={handleClick}
      className="p-2 rounded-lg bg-bjj-bg2 hover:bg-bjj-bg2/80 border border-bjj-line transition-all hover:border-bjj-accent/50"
      aria-label={`${theme === 'dark' ? 'ライト' : 'ダーク'}モードに切り替え`}
      title={`${theme === 'dark' ? 'ライト' : 'ダーク'}モードに切り替え`}
    >
      {theme === 'dark' ? (
        <Sun className="w-5 h-5 text-bjj-text hover:text-bjj-accent transition-colors" />
      ) : (
        <Moon className="w-5 h-5 text-bjj-text hover:text-bjj-accent transition-colors" />
      )}
    </button>
  )
}