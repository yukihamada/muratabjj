'use client'

import { useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

interface Plan {
  name: { [key: string]: string }
  price: { [key: string]: string }
  priceYearly?: { [key: string]: string }
  features: { [key: string]: string }[]
  limits: { [key: string]: string }[]
  badge: { [key: string]: string }
  popular?: boolean
}

const plans: Plan[] = [
  {
    name: { ja: '個人 Free', en: 'Personal Free', pt: 'Pessoal Gratuito' },
    price: { ja: '¥0', en: '$0', pt: 'R$0' },
    features: [
      { ja: '動画（基本）', en: 'Videos (Basic)', pt: 'Vídeos (Básico)' },
      { ja: 'ドリル・スパーログ', en: 'Drills & Sparring Log', pt: 'Exercícios e Diário de Sparring' },
      { ja: '習得度（基本）', en: 'Progress Tracking (Basic)', pt: 'Acompanhamento de Progresso (Básico)' }
    ],
    limits: [
      { ja: '保存フロー 3', en: 'Save 3 Flows', pt: 'Salvar 3 Fluxos' },
      { ja: 'スパーログ 50件/月', en: 'Sparring Log 50/month', pt: 'Diário de Sparring 50/mês' },
      { ja: '動画ブックマーク 30', en: 'Video Bookmarks 30', pt: 'Favoritos de Vídeo 30' }
    ],
    badge: { ja: '個人', en: 'Personal', pt: 'Pessoal' }
  },
  {
    name: { ja: 'Pro', en: 'Pro', pt: 'Pro' },
    price: { ja: '¥1,200/月', en: '$12/month', pt: 'R$60/mês' },
    priceYearly: { ja: '¥1,080/月', en: '$10.80/month', pt: 'R$54/mês' },
    features: [
      { ja: 'フローエディタ', en: 'Flow Editor', pt: 'Editor de Fluxo' },
      { ja: 'アダプティブ復習', en: 'Adaptive Review', pt: 'Revisão Adaptativa' },
      { ja: '詳細レポート', en: 'Detailed Reports', pt: 'Relatórios Detalhados' }
    ],
    limits: [
      { ja: '保存フロー 無制限', en: 'Unlimited Flow Saves', pt: 'Fluxos Ilimitados' },
      { ja: 'スパーログ 無制限', en: 'Unlimited Sparring Log', pt: 'Diário de Sparring Ilimitado' },
      { ja: '動画ブックマーク 無制限', en: 'Unlimited Video Bookmarks', pt: 'Favoritos de Vídeo Ilimitados' },
      { ja: 'CSVエクスポート', en: 'CSV Export', pt: 'Exportação CSV' }
    ],
    badge: { ja: 'Pro', en: 'Pro', pt: 'Pro' },
    popular: true
  },
  {
    name: { ja: '道場', en: 'Dojo', pt: 'Dojo' },
    price: { ja: '¥6,000/月〜', en: '$60/month+', pt: 'R$300/mês+' },
    features: [
      { ja: 'カリキュラム配信/宿題', en: 'Curriculum Delivery/Assignments', pt: 'Entrega de Currículo/Tarefas' },
      { ja: '非公開スペース', en: 'Private Spaces', pt: 'Espaços Privados' },
      { ja: 'コーチ評価', en: 'Coach Evaluations', pt: 'Avaliações do Treinador' },
      { ja: '受講レポート（道場単位）', en: 'Class Reports (Dojo-wide)', pt: 'Relatórios de Aula (Todo o Dojo)' }
    ],
    limits: [
      { ja: '複数ユーザー管理', en: 'Multi-user Management', pt: 'Gerenciamento de Múltiplos Usuários' },
      { ja: '帯別の課題設定', en: 'Belt-specific Assignments', pt: 'Tarefas por Faixa' },
      { ja: 'コーチメモ（選手単位）', en: 'Coach Notes (per student)', pt: 'Notas do Treinador (por aluno)' },
      { ja: '出欠連動', en: 'Attendance Integration', pt: 'Integração de Presença' }
    ],
    badge: { ja: '道場', en: 'Dojo', pt: 'Dojo' }
  }
]

export default function Pricing() {
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
    <section ref={sectionRef} id="pricing" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 reveal opacity-0">{t.pricing.title}</h2>
        
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`card-gradient border ${plan.popular ? 'border-bjj-accent' : 'border-white/10'} rounded-bjj p-6 reveal opacity-0 relative`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {plan.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-bjj-accent text-white px-3 py-1 rounded-full text-sm">
                  {language === 'ja' ? '人気' : language === 'en' ? 'Popular' : 'Popular'}
                </span>
              )}
              <span className="text-sm px-3 py-1 border border-white/20 rounded-full inline-block mb-4">
                {plan.badge[language]}
              </span>
              <h3 className="text-xl font-bold mb-2">{plan.name[language]}</h3>
              <div className="mb-4">
                <p className="text-2xl font-bold">{plan.price[language]}</p>
                {plan.priceYearly && (
                  <p className="text-sm text-bjj-muted">
                    {language === 'ja' ? `年払いで${plan.priceYearly[language]}` : 
                     language === 'en' ? `${plan.priceYearly[language]} billed yearly` : 
                     `${plan.priceYearly[language]} anualmente`}
                  </p>
                )}
              </div>
              
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-semibold mb-2">
                    {language === 'ja' ? '機能' : language === 'en' ? 'Features' : 'Recursos'}
                  </p>
                  <ul className="space-y-1">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-bjj-accent mt-1">✓</span>
                        <span className="text-sm text-bjj-muted">{feature[language]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                
                <div>
                  <p className="text-sm font-semibold mb-2">
                    {language === 'ja' ? '上限' : language === 'en' ? 'Limits' : 'Limites'}
                  </p>
                  <ul className="space-y-1">
                    {plan.limits.map((limit, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <span className="text-bjj-muted mt-1">•</span>
                        <span className="text-sm text-bjj-muted">{limit[language]}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}