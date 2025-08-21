'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import DashboardNav from '@/components/DashboardNav'
import { useLanguage } from '@/contexts/LanguageContext'
import { Users, Video, Target, TrendingUp } from 'lucide-react'
import Link from 'next/link'

export default function CoachDashboard() {
  const { user, loading, isCoach, isAdmin } = useAuth()
  const router = useRouter()
  const { language } = useLanguage()
  
  useEffect(() => {
    if (!loading && (!user || (!isCoach && !isAdmin))) {
      router.push('/dashboard')
    }
  }, [user, loading, isCoach, isAdmin, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-bjj-accent"></div>
      </div>
    )
  }

  if (!isCoach && !isAdmin) {
    return null
  }

  const features = [
    {
      icon: Users,
      title: language === 'ja' ? '生徒管理' : language === 'en' ? 'Student Management' : 'Gestão de Alunos',
      description: language === 'ja' ? '生徒の進捗確認とフィードバック' : language === 'en' ? 'Track student progress and provide feedback' : 'Acompanhe o progresso dos alunos e forneça feedback',
      href: '/coach/students',
      color: 'from-blue-500 to-blue-600',
    },
    {
      icon: Video,
      title: language === 'ja' ? 'カリキュラム作成' : language === 'en' ? 'Curriculum Creation' : 'Criação de Currículo',
      description: language === 'ja' ? '動画とフローを組み合わせたカリキュラム' : language === 'en' ? 'Create curriculum with videos and flows' : 'Crie currículo com vídeos e fluxos',
      href: '/coach/curriculum',
      color: 'from-purple-500 to-purple-600',
    },
    {
      icon: Target,
      title: language === 'ja' ? '課題設定' : language === 'en' ? 'Assignment Setting' : 'Definição de Tarefas',
      description: language === 'ja' ? '帯別・個人別の課題を設定' : language === 'en' ? 'Set assignments by belt and individual' : 'Defina tarefas por faixa e individual',
      href: '/coach/assignments',
      color: 'from-green-500 to-green-600',
    },
    {
      icon: TrendingUp,
      title: language === 'ja' ? '統計分析' : language === 'en' ? 'Analytics' : 'Análise',
      description: language === 'ja' ? '道場全体の統計と個人分析' : language === 'en' ? 'Dojo-wide statistics and individual analysis' : 'Estatísticas do dojo e análise individual',
      href: '/coach/analytics',
      color: 'from-red-500 to-red-600',
    },
  ]

  return (
    <main className="min-h-screen bg-bjj-bg">
      <DashboardNav />
      
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">
            {language === 'ja' ? 'コーチダッシュボード' : language === 'en' ? 'Coach Dashboard' : 'Painel do Treinador'}
          </h1>
          <p className="text-bjj-muted">
            {language === 'ja' ? '生徒の成長をサポートする機能' : language === 'en' ? 'Tools to support student growth' : 'Ferramentas para apoiar o crescimento dos alunos'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature) => {
            const Icon = feature.icon
            return (
              <Link
                key={feature.href}
                href={feature.href}
                className="card-gradient rounded-bjj p-6 hover:scale-105 transition-transform duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${feature.color}`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                    <p className="text-bjj-muted text-sm">{feature.description}</p>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Coming Soon Notice */}
        <div className="mt-12 p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-bjj">
          <h3 className="text-lg font-semibold text-yellow-400 mb-2">
            {language === 'ja' ? '🚧 開発中' : language === 'en' ? '🚧 Under Development' : '🚧 Em Desenvolvimento'}
          </h3>
          <p className="text-yellow-200">
            {language === 'ja' 
              ? 'コーチ機能は現在開発中です。生徒管理、カリキュラム作成、課題設定などの機能を順次追加予定です。' 
              : language === 'en'
              ? 'Coach features are currently under development. We plan to add student management, curriculum creation, and assignment features.'
              : 'Os recursos do treinador estão atualmente em desenvolvimento. Planejamos adicionar gerenciamento de alunos, criação de currículo e recursos de tarefas.'}
          </p>
        </div>
      </div>
    </main>
  )
}