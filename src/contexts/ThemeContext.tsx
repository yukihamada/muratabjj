'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

type Theme = 'dark' | 'light'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // SSRでもダークモードをデフォルトに
  const [theme, setTheme] = useState<Theme>('dark')
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    
    // ローカルストレージから保存されたテーマを取得
    const savedTheme = localStorage.getItem('theme') as Theme | null
    if (savedTheme && (savedTheme === 'dark' || savedTheme === 'light')) {
      setTheme(savedTheme)
    } else {
      // 保存されていない場合はダークモードを設定
      localStorage.setItem('theme', 'dark')
    }
  }, [])

  useEffect(() => {
    if (!mounted) return

    const root = window.document.documentElement
    
    // テーマクラスを追加/削除（他のクラスを保持）
    if (theme === 'dark') {
      root.classList.add('dark')
      root.classList.remove('light')
    } else {
      root.classList.add('light')
      root.classList.remove('dark')
    }
    
    // localStorageに保存
    try {
      localStorage.setItem('theme', theme)
    } catch (e) {
      // Silently handle localStorage errors
    }
    
    // 背景色も変更
    if (theme === 'dark') {
      root.style.backgroundColor = '#0f0f12'
    } else {
      root.style.backgroundColor = '#ffffff'
    }
  }, [theme, mounted])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }

  // SSRとのhydrationエラーを防ぐため、マウント前もコンテキストを提供
  // ただし、toggleThemeはマウント後のみ動作
  const value = {
    theme,
    toggleTheme: mounted ? toggleTheme : () => {}
  }

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}