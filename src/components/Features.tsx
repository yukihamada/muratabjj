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
    icon: '🎥'
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
    icon: '🔄'
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
    icon: '📊'
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
    icon: '📝'
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
    icon: '🧠'
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
    icon: '🥋'
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
              <span className="text-3xl mb-4 block">{feature.icon}</span>
              <h3 className="text-xl font-bold mb-2">{feature.title[language]}</h3>
              <p className="text-bjj-muted">{feature.description[language]}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}