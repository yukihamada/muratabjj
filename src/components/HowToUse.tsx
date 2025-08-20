'use client'

import { useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface Step {
  number: string
  title: { [key: string]: string }
  description: { [key: string]: string }
}

const steps: Step[] = [
  {
    number: '01',
    title: {
      ja: 'プロフィール作成',
      en: 'Create Profile',
      pt: 'Criar Perfil'
    },
    description: {
      ja: '帯・体格・得意技を設定 → スターターフローを自動提案',
      en: 'Set belt, physique, and specialties → Auto-suggest starter flows',
      pt: 'Configure faixa, físico e especialidades → Sugestão automática de fluxos iniciais'
    }
  },
  {
    number: '02',
    title: {
      ja: '動画で理解',
      en: 'Learn from Videos',
      pt: 'Aprender com Vídeos'
    },
    description: {
      ja: 'チャプターと要点でコツを把握',
      en: 'Grasp tips through chapters and key points',
      pt: 'Compreenda dicas através de capítulos e pontos-chave'
    }
  },
  {
    number: '03',
    title: {
      ja: 'ドリルで再現',
      en: 'Practice with Drills',
      pt: 'Praticar com Exercícios'
    },
    description: {
      ja: '回数・左右・抵抗％を記録。つなぎ目を重点練習',
      en: 'Record reps, sides, resistance%. Focus on transitions',
      pt: 'Registre repetições, lados, resistência%. Foque nas transições'
    }
  },
  {
    number: '04',
    title: {
      ja: 'スパーで適用',
      en: 'Apply in Sparring',
      pt: 'Aplicar no Sparring'
    },
    description: {
      ja: 'イベントをログ化。ダッシュボードが次の一手を提案',
      en: 'Log events. Dashboard suggests next moves',
      pt: 'Registre eventos. O painel sugere próximos movimentos'
    }
  }
]

export default function HowToUse() {
  const sectionRef = useRef<HTMLElement>(null)
  const { t, language } = useLanguage()

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-fade-in')
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = sectionRef.current?.querySelectorAll('.reveal')
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={sectionRef} id="how" className="py-16 md:py-24 bg-bjj-bg2/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 reveal opacity-0">{t.howToUse.title}</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`card-gradient border border-white/10 rounded-bjj p-6 reveal opacity-0`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <span className="text-bjj-accent font-bold text-2xl">{step.number}</span>
              <h3 className="font-bold mt-2 mb-2">{step.title[language]}</h3>
              <p className="text-bjj-muted text-sm">{step.description[language]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}