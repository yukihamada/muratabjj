'use client'

import { useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'

export default function Supervisor() {
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
    <section ref={sectionRef} id="supervisor" className="py-16 md:py-24 bg-bjj-bg2/50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 reveal opacity-0">
          {t.supervisor.title}
        </h2>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="card-gradient border border-white/10 rounded-bjj p-6 reveal opacity-0">
            <h3 className="text-2xl font-bold mb-4">
              {language === 'ja' ? '村田 良蔵（Ryozo Murata）' : 'Ryozo Murata'}
            </h3>
            <p className="text-lg text-bjj-muted mb-6">
              {language === 'ja' && (
                <>SJJIF Worlds Master 36（= IBJJFのM2相当） 黒帯フェザー級{' '}
                <strong className="text-bjj-text">2018/2019 優勝</strong>。
                2016/2017 準優勝。スポーツ柔術日本連盟（SJJJF）会長。
                YAWARA柔術アカデミー代表、Over Limit札幌 代表取締役。</>
              )}
              {language === 'en' && (
                <>SJJIF Worlds Master 36 (= IBJJF M2 equivalent) Black Belt Featherweight{' '}
                <strong className="text-bjj-text">Champion 2018/2019</strong>.
                Runner-up 2016/2017. President of Sports Jiu-Jitsu Japan Federation (SJJJF).
                Head of YAWARA Jiu-Jitsu Academy, CEO of Over Limit Sapporo.</>
              )}
              {language === 'pt' && (
                <>SJJIF Worlds Master 36 (= IBJJF M2 equivalente) Faixa Preta Peso Pena{' '}
                <strong className="text-bjj-text">Campeão 2018/2019</strong>.
                Vice-campeão 2016/2017. Presidente da Federação Japonesa de Jiu-Jitsu Esportivo (SJJJF).
                Chefe da Academia YAWARA Jiu-Jitsu, CEO da Over Limit Sapporo.</>
              )}
            </p>
            <div className="space-y-3 text-sm text-bjj-muted">
              <div className="flex items-center gap-3">
                <span className="text-bjj-accent">🏆</span>
                <span>SJJIF World Championship Master 36 Black Feather Champion (2018, 2019)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-bjj-accent">🥈</span>
                <span>SJJIF World Championship Master 36 Black Feather Runner-up (2016, 2017)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-bjj-accent">🥋</span>
                <span>
                  {language === 'ja' && 'スポーツ柔術日本連盟（SJJJF）会長'}
                  {language === 'en' && 'President of Sports Jiu-Jitsu Japan Federation (SJJJF)'}
                  {language === 'pt' && 'Presidente da Federação Japonesa de Jiu-Jitsu Esportivo (SJJJF)'}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-bjj-accent">🏢</span>
                <span>YAWARA柔術アカデミー代表 / Over Limit Jiu Jitsu Association</span>
              </div>
            </div>
          </div>
          
          <div className="card-gradient border border-white/10 rounded-bjj p-6 reveal opacity-0 delay-100">
            <h3 className="text-xl font-bold mb-4">
              {language === 'ja' ? 'コメント' : language === 'en' ? 'Comment' : 'Comentário'}
            </h3>
            <blockquote className="text-lg text-bjj-muted italic">
              {language === 'ja' && '「柔術は連携で強くなる。Murata BJJは理解→再現→実戦の循環を設計し、現場の上達速度にこだわりました。」'}
              {language === 'en' && '"Jiu-Jitsu becomes stronger through connections. Murata BJJ is designed with the cycle of understanding → reproduction → practice, focusing on real improvement speed."'}
              {language === 'pt' && '"O Jiu-Jitsu fica mais forte através de conexões. O Murata BJJ foi projetado com o ciclo de compreensão → reprodução → prática, focando na velocidade real de melhoria."'}
            </blockquote>
            
            <div className="mt-6 p-4 bg-white/5 rounded-lg">
              <h4 className="text-sm font-bold mb-2">
                {language === 'ja' ? '支援・提携道場' : language === 'en' ? 'Supporting & Partner Dojos' : 'Dojos de Apoio e Parceiros'}
              </h4>
              <div className="flex gap-4 text-sm text-bjj-muted">
                <span>YAWARA</span>
                <span>•</span>
                <span>Over Limit</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}