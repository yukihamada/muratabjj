'use client'

import { useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface Feature {
  title: { [key: string]: string }
  description: { [key: string]: string }
  icon: string
}

const features: Feature[] = [
  {
    title: {
      ja: '動画カタログ',
      en: 'Video Catalog',
      pt: 'Catálogo de Vídeos'
    },
    description: {
      ja: '帯 / ポジション / テクニック系で整理。チャプター & 要点、再生速度、自動文字起こし。',
      en: 'Organized by belt / position / technique. Chapters & key points, playback speed, automatic transcription.',
      pt: 'Organizado por faixa / posição / técnica. Capítulos e pontos-chave, velocidade de reprodução, transcrição automática.'
    },
    icon: 'video'
  },
  {
    title: {
      ja: 'フローエディタ',
      en: 'Flow Editor',
      pt: 'Editor de Fluxo'
    },
    description: {
      ja: 'ノード（技/体勢）とエッジ（遷移）で連携を可視化。分岐や代替ルートに対応。',
      en: 'Visualize connections with nodes (techniques/positions) and edges (transitions). Supports branches and alternative routes.',
      pt: 'Visualize conexões com nós (técnicas/posições) e arestas (transições). Suporta ramificações e rotas alternativas.'
    },
    icon: 'flow'
  },
  {
    title: {
      ja: '習得度トラッカー',
      en: 'Progress Tracker',
      pt: 'Rastreador de Progresso'
    },
    description: {
      ja: '理解→手順→再現→実戦→復習（定着）の5段階。弱点と次の一手を提示。',
      en: '5 stages: Understanding → Steps → Reproduction → Application → Review. Shows weaknesses and next moves.',
      pt: '5 estágios: Compreensão → Passos → Reprodução → Aplicação → Revisão. Mostra pontos fracos e próximos movimentos.'
    },
    icon: 'chart'
  },
  {
    title: {
      ja: 'スパーログ',
      en: 'Sparring Log',
      pt: 'Diário de Sparring'
    },
    description: {
      ja: '開始体勢/イベント（パス/スイープ/サブミット）を時系列で記録。',
      en: 'Record starting positions/events (pass/sweep/submit) in chronological order.',
      pt: 'Registre posições iniciais/eventos (passagem/raspagem/finalização) em ordem cronológica.'
    },
    icon: 'log'
  },
  {
    title: {
      ja: 'アダプティブ復習',
      en: 'Adaptive Review',
      pt: 'Revisão Adaptativa'
    },
    description: {
      ja: '忘却曲線に合わせて出題間隔を最適化。詰まりやすい遷移を重点練習。',
      en: 'Optimize review intervals based on forgetting curve. Focus practice on difficult transitions.',
      pt: 'Otimize intervalos de revisão com base na curva de esquecimento. Pratique transições difíceis.'
    },
    icon: 'brain'
  },
  {
    title: {
      ja: 'コーチ/道場向け',
      en: 'For Coaches/Dojos',
      pt: 'Para Treinadores/Dojos'
    },
    description: {
      ja: 'カリキュラム配信、帯別課題、評価レポート、非公開スペース。',
      en: 'Curriculum delivery, belt-specific assignments, evaluation reports, private spaces.',
      pt: 'Entrega de currículo, tarefas por faixa, relatórios de avaliação, espaços privados.'
    },
    icon: 'dojo'
  }
]

export default function Features() {
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
    <section ref={sectionRef} id="features" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 reveal opacity-0">{t.features.title}</h2>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`card-gradient border border-white/10 rounded-bjj p-6 reveal opacity-0`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="mb-4">
                {feature.icon === 'video' && (
                  <svg className="w-8 h-8 text-bjj-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                )}
                {feature.icon === 'flow' && (
                  <svg className="w-8 h-8 text-bjj-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                )}
                {feature.icon === 'chart' && (
                  <svg className="w-8 h-8 text-bjj-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                )}
                {feature.icon === 'log' && (
                  <svg className="w-8 h-8 text-bjj-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                )}
                {feature.icon === 'brain' && (
                  <svg className="w-8 h-8 text-bjj-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                )}
                {feature.icon === 'dojo' && (
                  <svg className="w-8 h-8 text-bjj-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                )}
              </div>
              <h3 className="text-xl font-semibold mb-3 text-bjj-text">{feature.title[language]}</h3>
              <p className="text-bjj-text/70 leading-relaxed">{feature.description[language]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}