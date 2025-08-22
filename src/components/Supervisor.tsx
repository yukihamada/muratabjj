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
            <div className="mb-6">
              <p className="text-sm text-bjj-accent mb-2">
                {language === 'ja' && 'グレイシー直系 黒帯'}
                {language === 'en' && 'Gracie Lineage Black Belt'}
                {language === 'pt' && 'Faixa Preta Linhagem Gracie'}
                {(language === 'es' || language === 'fr' || language === 'ko' || language === 'ru') && 'Gracie Lineage Black Belt'}
              </p>
              <p className="text-lg text-bjj-muted">
                {language === 'ja' && (
                  <>SJJIF世界選手権マスター2黒帯フェザー級{' '}
                  <strong className="text-bjj-text">2018年・2019年 二年連続優勝</strong></>
                )}
                {language === 'en' && (
                  <>SJJIF World Championship Master 2 Black Belt Featherweight{' '}
                  <strong className="text-bjj-text">Two-time Champion 2018 & 2019</strong></>
                )}
                {language === 'pt' && (
                  <>Campeonato Mundial SJJIF Master 2 Faixa Preta Peso Pena{' '}
                  <strong className="text-bjj-text">Bicampeão 2018 & 2019</strong></>
                )}
                {(language === 'es' || language === 'fr' || language === 'ko' || language === 'ru') && (
                  <>SJJIF World Championship Master 2 Black Belt Featherweight{' '}
                  <strong className="text-bjj-text">Two-time Champion 2018 & 2019</strong></>
                )}
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-bold text-bjj-accent mb-2">
                  {language === 'ja' && '柔術の肩書'}
                  {language === 'en' && 'BJJ Titles'}
                  {language === 'pt' && 'Títulos no BJJ'}
                  {(language === 'es' || language === 'fr' || language === 'ko' || language === 'ru') && 'BJJ Titles'}
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• {language === 'ja' ? 'グレイシー直系 黒帯' : 'Gracie Lineage Black Belt'}</li>
                  <li>• {language === 'ja' ? 'SJJIF世界選手権マスター2フェザー級 2018年・2019年 二年連続優勝' : 'SJJIF World Championship Master 2 Featherweight Champion 2018 & 2019'}</li>
                  <li>• {language === 'ja' ? 'SJJIF世界選手権マスター2フェザー級 2016年・2017年 準優勝' : 'SJJIF World Championship Master 2 Featherweight Runner-up 2016 & 2017'}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-bjj-accent mb-2">
                  {language === 'ja' && '組織運営者・経営者'}
                  {language === 'en' && 'Organization Leader & Business Owner'}
                  {language === 'pt' && 'Líder Organizacional e Empresário'}
                  {(language === 'es' || language === 'fr' || language === 'ko' || language === 'ru') && 'Organization Leader & Business Owner'}
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• {language === 'ja' ? 'オーバーリミット札幌道場 運営' : 'Over Limit Sapporo Dojo Manager'}</li>
                  <li>• {language === 'ja' ? 'ヨガスタジオ 経営' : 'Yoga Studio Owner'}</li>
                  <li>• {language === 'ja' ? 'YAWARA柔術アカデミー 代表' : 'YAWARA Jiu-Jitsu Academy Representative'}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-bjj-accent mb-2">
                  {language === 'ja' && 'NPO代表'}
                  {language === 'en' && 'NPO Representative'}
                  {language === 'pt' && 'Representante de ONG'}
                  {(language === 'es' || language === 'fr' || language === 'ko' || language === 'ru') && 'NPO Representative'}
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• {language === 'ja' ? 'スポーツ柔術日本連盟（SJJJF）代表理事および会長' : 'Sports Jiu-Jitsu Japan Federation (SJJJF) President & Representative Director'}</li>
                </ul>
              </div>
              
              <div>
                <h4 className="text-sm font-bold text-bjj-accent mb-2">
                  {language === 'ja' && 'ヨガインストラクター'}
                  {language === 'en' && 'Yoga Instructor'}
                  {language === 'pt' && 'Instrutor de Yoga'}
                  {(language === 'es' || language === 'fr' || language === 'ko' || language === 'ru') && 'Yoga Instructor'}
                </h4>
                <ul className="space-y-2 text-sm">
                  <li>• {language === 'ja' ? 'ヨガのマスター／インストラクターとしての活動' : 'Active as Yoga Master/Instructor'}</li>
                </ul>
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