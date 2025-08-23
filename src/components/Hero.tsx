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

  // Early return if translations aren't loaded
  if (!t || !t.hero) {
    return null
  }

  return (
    <section ref={heroRef} className="container mx-auto px-4 py-16 md:py-24">
      <div className="grid lg:grid-cols-2 gap-8">
        <div className="card-gradient border border-white/10 rounded-bjj p-6 reveal opacity-0">
          <div className="inline-flex items-center gap-2 mb-6">
            <span className="text-xs uppercase tracking-wider text-bjj-accent font-medium">
              {t.hero.badge}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6">
            <span className="text-bjj-text/90">{t.hero.title1}</span>
            <br />
            <span className="text-bjj-text">{t.hero.title2}</span>
            <span className="text-bjj-accent block mt-2">{t.hero.titleHighlight}</span>
          </h1>
          
          <p className="text-bjj-text/70 text-lg mb-6 leading-relaxed">
            {t.hero.description}
          </p>
          <div className="flex flex-wrap gap-3 mb-6">
            <span className="px-3 py-1 bg-bjj-accent/10 text-bjj-accent rounded-full text-sm font-medium">
              {t.hero.descriptionPoints[0]}
            </span>
            <span className="px-3 py-1 bg-bjj-accent/10 text-bjj-accent rounded-full text-sm font-medium">
              {t.hero.descriptionPoints[1]}
            </span>
            <span className="px-3 py-1 bg-bjj-accent/10 text-bjj-accent rounded-full text-sm font-medium">
              {t.hero.descriptionPoints[2]}
            </span>
            <span className="px-3 py-1 bg-bjj-accent/10 text-bjj-accent rounded-full text-sm font-medium">
              {t.hero.descriptionPoints[3]}
            </span>
          </div>
          
          <p className="text-sm text-bjj-muted mb-8 flex items-center gap-2">
            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {t.hero.healthNote}
          </p>
          
          <div className="flex gap-4 flex-wrap mb-6">
            <Link href="/signup" className="btn-primary" prefetch={false}>
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