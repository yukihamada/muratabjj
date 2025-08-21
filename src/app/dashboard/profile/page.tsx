'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { User, Award, Mail, Calendar, Save, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardNav from '@/components/DashboardNav'
import SubscriptionManager from '@/components/SubscriptionManager'

const belts = ['white', 'blue', 'purple', 'brown', 'black', 'coral', 'red']

const beltColors = {
  white: 'bg-white',
  blue: 'bg-blue-600',
  purple: 'bg-purple-600',
  brown: 'bg-amber-700',
  black: 'bg-black',
  coral: 'bg-gradient-to-r from-red-600 to-white',
  red: 'bg-red-600',
}

const translations = {
  ja: {
    profile: 'プロフィール',
    editProfile: 'プロフィール編集',
    fullName: '氏名',
    email: 'メールアドレス',
    belt: '帯',
    stripes: 'ストライプ',
    memberSince: '登録日',
    role: '権限',
    save: '保存',
    saving: '保存中...',
    cancel: 'キャンセル',
    profileUpdated: 'プロフィールを更新しました',
    updateFailed: 'プロフィールの更新に失敗しました',
    white: '白帯',
    blue: '青帯',
    purple: '紫帯',
    brown: '茶帯',
    black: '黒帯',
    coral: '珊瑚帯',
    red: '赤帯',
    user: 'ユーザー',
    admin: '管理者',
    coach: 'コーチ',
    statistics: '統計情報',
    totalVideosWatched: '視聴した動画数',
    techniquesLearned: '習得した技術',
    sparringSessions: 'スパーリング回数',
    averageProgress: '平均習得度',
    uploadPhoto: '写真をアップロード',
  },
  en: {
    profile: 'Profile',
    editProfile: 'Edit Profile',
    fullName: 'Full Name',
    email: 'Email',
    belt: 'Belt',
    stripes: 'Stripes',
    memberSince: 'Member Since',
    role: 'Role',
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    profileUpdated: 'Profile updated successfully',
    updateFailed: 'Failed to update profile',
    white: 'White Belt',
    blue: 'Blue Belt',
    purple: 'Purple Belt',
    brown: 'Brown Belt',
    black: 'Black Belt',
    coral: 'Coral Belt',
    red: 'Red Belt',
    user: 'User',
    admin: 'Admin',
    coach: 'Coach',
    statistics: 'Statistics',
    totalVideosWatched: 'Total Videos Watched',
    techniquesLearned: 'Techniques Learned',
    sparringSessions: 'Sparring Sessions',
    averageProgress: 'Average Progress',
    uploadPhoto: 'Upload Photo',
  },
  pt: {
    profile: 'Perfil',
    editProfile: 'Editar Perfil',
    fullName: 'Nome Completo',
    email: 'Email',
    belt: 'Faixa',
    stripes: 'Graus',
    memberSince: 'Membro Desde',
    role: 'Função',
    save: 'Salvar',
    saving: 'Salvando...',
    cancel: 'Cancelar',
    profileUpdated: 'Perfil atualizado com sucesso',
    updateFailed: 'Falha ao atualizar perfil',
    white: 'Faixa Branca',
    blue: 'Faixa Azul',
    purple: 'Faixa Roxa',
    brown: 'Faixa Marrom',
    black: 'Faixa Preta',
    coral: 'Faixa Coral',
    red: 'Faixa Vermelha',
    user: 'Usuário',
    admin: 'Administrador',
    coach: 'Professor',
    statistics: 'Estatísticas',
    totalVideosWatched: 'Total de Vídeos Assistidos',
    techniquesLearned: 'Técnicas Aprendidas',
    sparringSessions: 'Sessões de Sparring',
    averageProgress: 'Progresso Médio',
    uploadPhoto: 'Enviar Foto',
  },
}

export default function ProfilePage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations]
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [profile, setProfile] = useState<any>(null)
  const [stats, setStats] = useState({
    videosWatched: 0,
    techniquesLearned: 0,
    sparringSessions: 0,
    averageProgress: 0,
  })

  const [formData, setFormData] = useState({
    full_name: '',
    belt: 'white',
    stripes: 0,
  })

  useEffect(() => {
    if (user) {
      fetchProfile()
      fetchStats()
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      console.log('[Profile] Fetching profile for user:', user?.id)
      
      const { data, error } = await supabase
        .from('users_profile')
        .select('*')
        .eq('user_id', user!.id)
        .single()

      if (error) {
        console.log('[Profile] Error fetching profile:', error)
        
        // プロファイルが存在しない場合は作成
        if (error.code === 'PGRST116') {
          console.log('[Profile] Profile not found, creating new profile...')
          const { data: newProfile, error: createError } = await supabase
            .from('users_profile')
            .insert({
              user_id: user!.id,
              full_name: '',
              belt_rank: 'white',
              stripes: 0,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select()
            .single()
          
          if (createError) {
            console.error('[Profile] Error creating profile:', createError)
            throw createError
          }
          
          if (newProfile) {
            console.log('[Profile] New profile created:', newProfile)
            setProfile(newProfile)
            setFormData({
              full_name: newProfile.full_name || '',
              belt: newProfile.belt_rank || 'white',
              stripes: newProfile.stripes || 0,
            })
          }
          return
        }
        throw error
      }

      if (data) {
        console.log('[Profile] Profile loaded:', data)
        setProfile(data)
        setFormData({
          full_name: data.full_name || '',
          belt: data.belt_rank || 'white',
          stripes: data.stripes || 0,
        })
      }
    } catch (error) {
      console.error('[Profile] Error fetching profile:', error)
      // エラーが発生してもローディングを終了し、デフォルトフォームを表示
      setFormData({
        full_name: '',
        belt: 'white',
        stripes: 0,
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      const [progressData, sparringData] = await Promise.all([
        supabase
          .from('progress_tracking')
          .select('progress_level')
          .eq('user_id', user!.id),
        supabase
          .from('sparring_logs')
          .select('id')
          .eq('user_id', user!.id),
      ])

      const videosWatched = progressData.data?.length || 0
      const techniquesLearned = progressData.data?.filter((p: any) => p.progress_level >= 3).length || 0
      const sparringSessions = sparringData.data?.length || 0
      const averageProgress = videosWatched > 0
        ? progressData.data!.reduce((sum: number, p: any) => sum + p.progress_level, 0) / videosWatched
        : 0

      setStats({
        videosWatched,
        techniquesLearned,
        sparringSessions,
        averageProgress,
      })
    } catch (error) {
      console.error('Error fetching stats:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase
        .from('users_profile')
        .update({
          full_name: formData.full_name,
          belt_rank: formData.belt,
          stripes: formData.stripes,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user!.id)

      if (error) throw error

      toast.success(t.profileUpdated)
      fetchProfile()
    } catch (error) {
      console.error('Error updating profile:', error)
      toast.error(t.updateFailed)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bjj-bg">
        <DashboardNav />
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <h1 className="text-3xl font-bold mb-8">{t.profile}</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Profile Info Skeleton */}
            <div className="md:col-span-2">
              <div className="card-gradient border border-white/10 rounded-bjj p-6 animate-pulse">
                <div className="h-6 w-32 bg-white/10 rounded mb-6"></div>
                
                <div className="space-y-6">
                  <div>
                    <div className="h-4 w-20 bg-white/10 rounded mb-2"></div>
                    <div className="h-10 w-full bg-white/10 rounded"></div>
                  </div>
                  
                  <div>
                    <div className="h-4 w-16 bg-white/10 rounded mb-2"></div>
                    <div className="h-10 w-full bg-white/10 rounded"></div>
                  </div>
                  
                  <div>
                    <div className="h-4 w-24 bg-white/10 rounded mb-2"></div>
                    <div className="h-10 w-full bg-white/10 rounded"></div>
                  </div>
                  
                  <div className="h-12 w-full bg-bjj-accent/20 rounded-lg"></div>
                </div>
              </div>
            </div>
            
            {/* Stats Skeleton */}
            <div className="space-y-4">
              <div className="card-gradient border border-white/10 rounded-bjj p-6 animate-pulse">
                <div className="h-6 w-24 bg-white/10 rounded mb-4"></div>
                <div className="space-y-2">
                  <div className="h-4 w-full bg-white/10 rounded"></div>
                  <div className="h-4 w-3/4 bg-white/10 rounded"></div>
                  <div className="h-4 w-5/6 bg-white/10 rounded"></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Loading text */}
          <div className="text-center mt-8">
            <p className="text-bjj-muted animate-pulse">
              {language === 'ja' ? 'プロフィールを読み込んでいます...' :
               language === 'en' ? 'Loading profile...' :
               'Carregando perfil...'}
            </p>
            <div className="flex justify-center mt-4">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-bjj-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-bjj-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-bjj-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bjj-bg">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">{t.profile}</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Profile Info */}
          <div className="md:col-span-2">
            <div className="card-gradient border border-white/10 rounded-bjj p-6">
              <h2 className="text-xl font-semibold mb-6">{t.editProfile}</h2>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">{t.fullName}</label>
                  <input
                    type="text"
                    value={formData.full_name}
                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-bjj-accent focus:outline-none"
                    placeholder={t.fullName}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">{t.email}</label>
                  <input
                    type="email"
                    value={user?.email || ''}
                    disabled
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 opacity-50 cursor-not-allowed"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">{t.belt}</label>
                    <select
                      value={formData.belt}
                      onChange={(e) => setFormData({ ...formData, belt: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-bjj-accent focus:outline-none"
                    >
                      {belts.map((belt) => (
                        <option key={belt} value={belt} className="bg-bjj-bg">
                          {t[belt as keyof typeof t]}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">{t.stripes}</label>
                    <select
                      value={formData.stripes}
                      onChange={(e) => setFormData({ ...formData, stripes: parseInt(e.target.value) })}
                      className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 focus:border-bjj-accent focus:outline-none"
                    >
                      {[0, 1, 2, 3, 4].map((num) => (
                        <option key={num} value={num} className="bg-bjj-bg">
                          {num}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={saving}
                    className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saving ? t.saving : t.save}
                  </button>
                </div>
              </form>
            </div>

            {/* Statistics */}
            <div className="card-gradient border border-white/10 rounded-bjj p-6 mt-6">
              <h2 className="text-xl font-semibold mb-6">{t.statistics}</h2>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-bjj-muted">{t.totalVideosWatched}</p>
                  <p className="text-2xl font-bold">{stats.videosWatched}</p>
                </div>
                <div>
                  <p className="text-sm text-bjj-muted">{t.techniquesLearned}</p>
                  <p className="text-2xl font-bold">{stats.techniquesLearned}</p>
                </div>
                <div>
                  <p className="text-sm text-bjj-muted">{t.sparringSessions}</p>
                  <p className="text-2xl font-bold">{stats.sparringSessions}</p>
                </div>
                <div>
                  <p className="text-sm text-bjj-muted">{t.averageProgress}</p>
                  <p className="text-2xl font-bold">{stats.averageProgress.toFixed(1)}/5</p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Belt Display */}
            <div className="card-gradient border border-white/10 rounded-bjj p-6 text-center">
              <div className={`w-32 h-32 mx-auto rounded-full ${beltColors[formData.belt as keyof typeof beltColors]} flex items-center justify-center mb-4`}>
                <Award className="w-16 h-16 text-white" />
              </div>
              <h3 className="text-lg font-semibold mb-2">{t[formData.belt as keyof typeof t]}</h3>
              <div className="flex justify-center gap-1">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-8 ${
                      i < formData.stripes ? 'bg-white' : 'bg-white/20'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Profile Meta */}
            <div className="card-gradient border border-white/10 rounded-bjj p-6">
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-bjj-muted">{t.memberSince}</p>
                  <p className="font-medium">
                    {new Date(profile?.created_at || '').toLocaleDateString(
                      language === 'ja' ? 'ja-JP' : language === 'pt' ? 'pt-BR' : 'en-US'
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-bjj-muted">{t.role}</p>
                  <p className="font-medium">{profile?.is_coach ? t.coach : (profile?.is_admin ? t.admin : t.user)}</p>
                </div>
              </div>
            </div>

            {/* Subscription Manager */}
            <SubscriptionManager />
          </div>
        </div>
      </div>
    </div>
  )
}