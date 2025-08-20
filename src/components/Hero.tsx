'use client'

import Link from 'next/link'
import { useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import FlowVisualization from './FlowVisualization'

export default function Hero() {
  const heroRef = useRef<HTMLDivElement>(null)
  const { t } = useLanguage()

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

    const elements = heroRef.current?.querySelectorAll('.reveal')
    elements?.forEach((el) => observer.observe(el))

    return () => observer.disconnect()
  }, [])

  return (
    <section ref={heroRef} className="container mx-auto px-4 py-16 md:py-24">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card-gradient border border-white/10 rounded-bjj p-6 reveal opacity-0">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-2 h-2 rounded-full bg-bjj-accent"></span>
            <span className="text-sm px-3 py-1 border border-white/20 rounded-full">
              {t.hero.badge}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-4">
            {t.hero.title1}
            <br />
            {t.hero.title2}<span className="text-gradient">{t.hero.titleHighlight}</span>。
          </h1>
          
          <p className="text-bjj-muted text-lg mb-4">
            {t.hero.description}
            <strong className="text-bjj-text">{t.hero.descriptionPoints[0]}</strong>・
            <strong className="text-bjj-text">{t.hero.descriptionPoints[1]}</strong>・
            <strong className="text-bjj-text">{t.hero.descriptionPoints[2]}</strong>・
            <strong className="text-bjj-text">{t.hero.descriptionPoints[3]}</strong>
            {t.hero.descriptionEnd}
          </p>
          
          <p className="text-sm text-green-400 mb-6 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span>
            {t.hero.healthNote}
          </p>
          
          <div className="flex gap-4 flex-wrap mb-6">
            <Link href="/signup" className="btn-primary">
              {t.hero.cta.start}
            </Link>
            <Link href="#features" className="btn-ghost">
              {t.hero.cta.features}
            </Link>
          </div>
          
        </div>
        
        <div className="reveal opacity-0 delay-100 h-full min-h-[400px]">
          <FlowVisualization />
        </div>
      </div>
    </section>
  )
}