'use client'

import { useEffect, useRef, FormEvent, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import AuthDialog from './AuthDialog'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Signup() {
  const sectionRef = useRef<HTMLElement>(null)
  const [showAuthDialog, setShowAuthDialog] = useState(false)
  const { user } = useAuth()
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

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const messages = {
      ja: 'ありがとうございます！',
      en: 'Thank you!',
      pt: 'Obrigado!'
    }
    alert(messages[language as keyof typeof messages])
    e.currentTarget.reset()
  }

  return (
    <section ref={sectionRef} id="signup" className="py-16 md:py-24">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card-gradient border border-white/10 rounded-bjj p-6 reveal opacity-0">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">{t.signup.title}</h2>
            {user ? (
              <>
                <p className="text-bjj-muted mb-6">
                  {t.signup.loggedIn.description}
                </p>
                <a href="/dashboard" className="btn-primary inline-block">
                  {t.signup.loggedIn.cta}
                </a>
              </>
            ) : (
              <>
                <p className="text-bjj-muted mb-6">
                  {t.signup.loggedOut.description}
                </p>
                <button
                  onClick={() => setShowAuthDialog(true)}
                  className="btn-primary"
                >
                  {t.signup.loggedOut.cta}
                </button>
              </>
            )}
          </div>
          
          <div className="card-gradient border border-white/10 rounded-bjj p-6 reveal opacity-0 delay-100">
            <h3 className="text-xl font-bold mb-4">What is Murata BJJ?</h3>
            <p className="text-bjj-muted mb-4">
              {language === 'ja' && 'フロー中心のブラジリアン柔術学習プラットフォーム。村田良蔵監修。'}
              {language === 'en' && 'Flow-first learning platform for Brazilian Jiu-Jitsu. Designed & supervised by Ryozo Murata.'}
              {language === 'pt' && 'Plataforma de aprendizado focada em fluxo para Jiu-Jitsu Brasileiro. Projetada e supervisionada por Ryozo Murata.'}
            </p>
            <div className="flex gap-3 flex-wrap">
              {language !== 'en' && <a href="/en" className="btn-ghost">See English</a>}
              {language !== 'ja' && <a href="/" className="btn-ghost">日本語で見る</a>}
              {language !== 'pt' && <a href="/pt" className="btn-ghost">Ver em Português</a>}
            </div>
          </div>
        </div>
      </div>
      
      <AuthDialog
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
      />
    </section>
  )
}