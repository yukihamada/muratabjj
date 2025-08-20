'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import DashboardNav from '@/components/DashboardNav'
import { Users, BookOpen, BarChart3, Plus, Settings, Crown } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const translations = {
  ja: {
    title: '道場管理',
    createDojo: '新しい道場を作成',
    dojoName: '道場名',
    description: '説明',
    create: '作成',
    cancel: 'キャンセル',
    members: 'メンバー',
    curriculums: 'カリキュラム',
    reports: 'レポート',
    settings: '設定',
    owner: 'オーナー',
    admin: '管理者',
    student: '生徒',
    active: 'アクティブ',
    inactive: '非アクティブ',
    noDojos: '道場がありません',
    createFirst: '最初の道場を作成してください',
    onlyCoaches: 'コーチのみが道場を作成できます',
  },
  en: {
    title: 'Dojo Management',
    createDojo: 'Create New Dojo',
    dojoName: 'Dojo Name',
    description: 'Description',
    create: 'Create',
    cancel: 'Cancel',
    members: 'Members',
    curriculums: 'Curriculums',
    reports: 'Reports',
    settings: 'Settings',
    owner: 'Owner',
    admin: 'Admin',
    student: 'Student',
    active: 'Active',
    inactive: 'Inactive',
    noDojos: 'No dojos found',
    createFirst: 'Create your first dojo',
    onlyCoaches: 'Only coaches can create dojos',
  },
  pt: {
    title: 'Gestão de Dojo',
    createDojo: 'Criar Novo Dojo',
    dojoName: 'Nome do Dojo',
    description: 'Descrição',
    create: 'Criar',
    cancel: 'Cancelar',
    members: 'Membros',
    curriculums: 'Currículos',
    reports: 'Relatórios',
    settings: 'Configurações',
    owner: 'Proprietário',
    admin: 'Admin',
    student: 'Aluno',
    active: 'Ativo',
    inactive: 'Inativo',
    noDojos: 'Nenhum dojo encontrado',
    createFirst: 'Crie seu primeiro dojo',
    onlyCoaches: 'Apenas treinadores podem criar dojos',
  },
}

export default function DojoManagementPage() {
  const { user, profile } = useAuth()
  const { language } = useLanguage()
  const router = useRouter()
  const t = translations[language as keyof typeof translations]
  
  const [dojos, setDojos] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  })

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    fetchDojos()
  }, [user])

  async function fetchDojos() {
    try {
      // Get dojos where user is a member
      const { data: memberData, error: memberError } = await supabase
        .from('dojo_members')
        .select(`
          role,
          dojos (
            id,
            name,
            description,
            owner_id,
            is_active,
            created_at
          )
        `)
        .eq('user_id', user!.id)

      if (memberError) throw memberError

      const dojoList = memberData?.map(m => ({
        ...m.dojos,
        role: m.role,
      })) || []

      setDojos(dojoList)
    } catch (error) {
      console.error('Error fetching dojos:', error)
      toast.error(language === 'ja' ? 'エラーが発生しました' : 
                  language === 'en' ? 'An error occurred' : 
                  'Ocorreu um erro')
    } finally {
      setLoading(false)
    }
  }

  async function createDojo(e: React.FormEvent) {
    e.preventDefault()
    
    if (!profile?.is_coach) {
      toast.error(t.onlyCoaches)
      return
    }

    try {
      // Create dojo
      const { data: dojo, error: dojoError } = await supabase
        .from('dojos')
        .insert({
          name: formData.name,
          description: formData.description,
          owner_id: user!.id,
          is_active: true,
          max_members: 50,
        })
        .select()
        .single()

      if (dojoError) throw dojoError

      // Add owner as admin member
      const { error: memberError } = await supabase
        .from('dojo_members')
        .insert({
          dojo_id: dojo.id,
          user_id: user!.id,
          role: 'admin',
        })

      if (memberError) throw memberError

      toast.success(language === 'ja' ? '道場を作成しました' : 
                   language === 'en' ? 'Dojo created successfully' : 
                   'Dojo criado com sucesso')
      
      setShowCreateModal(false)
      setFormData({ name: '', description: '' })
      fetchDojos()
    } catch (error) {
      console.error('Error creating dojo:', error)
      toast.error(language === 'ja' ? '作成に失敗しました' : 
                  language === 'en' ? 'Failed to create dojo' : 
                  'Falha ao criar dojo')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bjj-bg">
        <DashboardNav />
        <div className="flex-1 p-8">
          <div className="max-w-7xl mx-auto">
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bjj-bg">
      <DashboardNav />
      <div className="flex-1 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">{t.title}</h1>
            {profile?.is_coach && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                {t.createDojo}
              </button>
            )}
          </div>

          {dojos.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-bjj-muted mx-auto mb-4" />
              <p className="text-xl text-bjj-muted mb-2">{t.noDojos}</p>
              {profile?.is_coach && (
                <p className="text-bjj-muted">{t.createFirst}</p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {dojos.map((dojo) => (
                <div
                  key={dojo.id}
                  className="card-gradient border border-white/10 rounded-bjj p-6 hover:border-bjj-accent/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold">{dojo.name}</h3>
                    {dojo.role === 'admin' && (
                      <Crown className="w-5 h-5 text-yellow-500" />
                    )}
                  </div>
                  
                  {dojo.description && (
                    <p className="text-bjj-muted mb-4">{dojo.description}</p>
                  )}

                  <div className="flex items-center justify-between mb-4">
                    <span className={`text-sm px-2 py-1 rounded ${
                      dojo.is_active 
                        ? 'bg-green-500/20 text-green-500' 
                        : 'bg-red-500/20 text-red-500'
                    }`}>
                      {dojo.is_active ? t.active : t.inactive}
                    </span>
                    <span className="text-sm text-bjj-muted">
                      {t[dojo.role as keyof typeof t] || dojo.role}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <Link
                      href={`/dashboard/dojo/${dojo.id}/members`}
                      className="btn-ghost text-sm py-2 flex items-center justify-center gap-2"
                    >
                      <Users className="w-4 h-4" />
                      {t.members}
                    </Link>
                    <Link
                      href={`/dashboard/dojo/${dojo.id}/curriculum`}
                      className="btn-ghost text-sm py-2 flex items-center justify-center gap-2"
                    >
                      <BookOpen className="w-4 h-4" />
                      {t.curriculums}
                    </Link>
                    <Link
                      href={`/dashboard/dojo/${dojo.id}/reports`}
                      className="btn-ghost text-sm py-2 flex items-center justify-center gap-2"
                    >
                      <BarChart3 className="w-4 h-4" />
                      {t.reports}
                    </Link>
                    {dojo.role === 'admin' && (
                      <Link
                        href={`/dashboard/dojo/${dojo.id}/settings`}
                        className="btn-ghost text-sm py-2 flex items-center justify-center gap-2"
                      >
                        <Settings className="w-4 h-4" />
                        {t.settings}
                      </Link>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Create Dojo Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-bjj-bg2 rounded-bjj p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">{t.createDojo}</h2>
            
            <form onSubmit={createDojo} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.dojoName} <span className="text-bjj-accent">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 bg-bjj-bg border border-white/10 rounded-bjj focus:border-bjj-accent focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">
                  {t.description}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 bg-bjj-bg border border-white/10 rounded-bjj focus:border-bjj-accent focus:outline-none"
                  rows={3}
                />
              </div>

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false)
                    setFormData({ name: '', description: '' })
                  }}
                  className="btn-ghost"
                >
                  {t.cancel}
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {t.create}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}