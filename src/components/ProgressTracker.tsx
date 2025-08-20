'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'

interface ProgressTrackerProps {
  currentLevel: number
  onLevelChange: (level: number) => void
  techniqueId: string
}

const translations = {
  ja: {
    progressLevel: '習得度',
    level1: '初めて見た',
    level2: '基本を理解',
    level3: '練習中',
    level4: 'スパーリングで使える',
    level5: '完全に習得',
  },
  en: {
    progressLevel: 'Progress Level',
    level1: 'First time',
    level2: 'Basic understanding',
    level3: 'Practicing',
    level4: 'Can use in sparring',
    level5: 'Mastered',
  },
  pt: {
    progressLevel: 'Nível de Progresso',
    level1: 'Primeira vez',
    level2: 'Compreensão básica',
    level3: 'Praticando',
    level4: 'Pode usar no sparring',
    level5: 'Dominado',
  },
}

export default function ProgressTracker({ currentLevel, onLevelChange, techniqueId }: ProgressTrackerProps) {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations]
  const [hoveredLevel, setHoveredLevel] = useState(0)

  const levels = [
    { level: 1, label: t.level1 },
    { level: 2, label: t.level2 },
    { level: 3, label: t.level3 },
    { level: 4, label: t.level4 },
    { level: 5, label: t.level5 },
  ]

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-medium text-bjj-muted">{t.progressLevel}</h3>
      
      <div className="flex gap-2">
        {levels.map(({ level }) => (
          <button
            key={level}
            onClick={() => onLevelChange(level)}
            onMouseEnter={() => setHoveredLevel(level)}
            onMouseLeave={() => setHoveredLevel(0)}
            className="relative group"
          >
            <Star
              className={`w-8 h-8 transition-all ${
                level <= (hoveredLevel || currentLevel)
                  ? 'fill-bjj-accent text-bjj-accent'
                  : 'fill-transparent text-bjj-muted/50'
              }`}
            />
          </button>
        ))}
      </div>
      
      <p className="text-sm text-bjj-muted">
        {levels.find(l => l.level === (hoveredLevel || currentLevel))?.label}
      </p>
    </div>
  )
}