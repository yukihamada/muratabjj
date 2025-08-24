'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import DashboardNav from '@/components/DashboardNav'
import { useLanguage } from '@/contexts/LanguageContext'
import { Share2, Plus, Trash2, Copy, ExternalLink, Users, Lock } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

const translations = {
  ja: {
    title: '技術フロー',
    subtitle: 'BJJ技術の連携と流れを視覚的に学習',
    publicFlows: '公開フロー',
    myFlows: 'マイフロー',
    createNew: '新しいフローを作成',
    viewFlow: 'フローを見る',
    editFlow: '編集',
    deleteFlow: '削除',
    copyFlow: 'コピー',
    shareFlow: '共有',
    noFlows: 'フローがありません',
    noPublicFlows: '公開フローがありません',
    noMyFlows: 'まだフローを作成していません',
    createdBy: '作成者',
    nodes: 'ノード',
    edges: '接続',
    public: '公開',
    private: '非公開',
    deleteConfirm: 'このフローを削除しますか？',
    copySuccess: 'フローをコピーしました',
    deleteSuccess: 'フローを削除しました',
  },
  en: {
    title: 'Technique Flows',
    subtitle: 'Learn BJJ technique connections and flows visually',
    publicFlows: 'Public Flows',
    myFlows: 'My Flows',
    createNew: 'Create New Flow',
    viewFlow: 'View Flow',
    editFlow: 'Edit',
    deleteFlow: 'Delete',
    copyFlow: 'Copy',
    shareFlow: 'Share',
    noFlows: 'No flows available',
    noPublicFlows: 'No public flows available',
    noMyFlows: 'You haven\'t created any flows yet',
    createdBy: 'Created by',
    nodes: 'nodes',
    edges: 'connections',
    public: 'Public',
    private: 'Private',
    deleteConfirm: 'Delete this flow?',
    copySuccess: 'Flow copied',
    deleteSuccess: 'Flow deleted',
  },
  pt: {
    title: 'Fluxos de Técnicas',
    subtitle: 'Aprenda conexões e fluxos de técnicas de BJJ visualmente',
    publicFlows: 'Fluxos Públicos',
    myFlows: 'Meus Fluxos',
    createNew: 'Criar Novo Fluxo',
    viewFlow: 'Ver Fluxo',
    editFlow: 'Editar',
    deleteFlow: 'Excluir',
    copyFlow: 'Copiar',
    shareFlow: 'Compartilhar',
    noFlows: 'Nenhum fluxo disponível',
    noPublicFlows: 'Nenhum fluxo público disponível',
    noMyFlows: 'Você ainda não criou nenhum fluxo',
    createdBy: 'Criado por',
    nodes: 'nós',
    edges: 'conexões',
    public: 'Público',
    private: 'Privado',
    deleteConfirm: 'Excluir este fluxo?',
    copySuccess: 'Fluxo copiado',
    deleteSuccess: 'Fluxo excluído',
  },
}

export default function FlowsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations]

  const [publicFlows, setPublicFlows] = useState<any[]>([])
  const [myFlows, setMyFlows] = useState<any[]>([])
  const [loadingFlows, setLoadingFlows] = useState(true)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/')
      return
    }

    if (user) {
      loadFlows()
    }
  }, [user, loading, router])

  async function loadFlows() {
    try {
      // 公開フローを取得
      const { data: publicData, error: publicError } = await supabase
        .from('flows')
        .select(`
          *,
          user_profiles!flows_user_id_fkey (
            full_name
          )
        `)
        .eq('is_public', true)
        .order('created_at', { ascending: false })

      if (publicError) {
        console.error('Error loading public flows:', publicError)
      } else {
        setPublicFlows(publicData || [])
      }

      // 自分のフローを取得
      const { data: myData, error: myError } = await supabase
        .from('flows')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (myError) {
        console.error('Error loading my flows:', myError)
      } else {
        setMyFlows(myData || [])
      }
    } catch (error) {
      console.error('Error loading flows:', error)
    } finally {
      setLoadingFlows(false)
    }
  }

  async function copyFlow(flow: any) {
    try {
      const { data, error } = await supabase
        .from('flows')
        .insert({
          name: `${flow.name} (Copy)`,
          description: flow.description,
          nodes: flow.nodes,
          edges: flow.edges,
          user_id: user?.id,
          is_public: false,
        })
        .select()
        .single()

      if (error) throw error

      toast.success(t.copySuccess)
      loadFlows()
    } catch (error) {
      console.error('Error copying flow:', error)
      toast.error('Failed to copy flow')
    }
  }

  async function deleteFlow(flowId: string) {
    if (!confirm(t.deleteConfirm)) return

    try {
      const { error } = await supabase
        .from('flows')
        .delete()
        .eq('id', flowId)
        .eq('user_id', user?.id)

      if (error) throw error

      toast.success(t.deleteSuccess)
      loadFlows()
    } catch (error) {
      console.error('Error deleting flow:', error)
      toast.error('Failed to delete flow')
    }
  }

  if (loading || loadingFlows) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bjj-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent"></div>
      </div>
    )
  }

  return (
    <main className="min-h-screen bg-bjj-bg">
      <DashboardNav />
      
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
          <p className="text-bjj-muted">{t.subtitle}</p>
        </div>

        {/* Create New Button */}
        <div className="mb-8">
          <Link href="/flow-editor">
            <button className="btn-primary">
              <Plus className="w-5 h-5 mr-2" />
              {t.createNew}
            </button>
          </Link>
        </div>

        {/* Public Flows */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Users className="w-6 h-6 text-bjj-accent" />
            {t.publicFlows}
          </h2>
          
          {publicFlows.length === 0 ? (
            <p className="text-bjj-muted text-center py-8">{t.noPublicFlows}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {publicFlows.map((flow) => (
                <FlowCard
                  key={flow.id}
                  flow={flow}
                  t={t}
                  isOwner={false}
                  onCopy={() => copyFlow(flow)}
                  onDelete={() => {}}
                />
              ))}
            </div>
          )}
        </section>

        {/* My Flows */}
        <section>
          <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
            <Lock className="w-6 h-6 text-bjj-accent" />
            {t.myFlows}
          </h2>
          
          {myFlows.length === 0 ? (
            <p className="text-bjj-muted text-center py-8">{t.noMyFlows}</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myFlows.map((flow) => (
                <FlowCard
                  key={flow.id}
                  flow={flow}
                  t={t}
                  isOwner={true}
                  onCopy={() => copyFlow(flow)}
                  onDelete={() => deleteFlow(flow.id)}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  )
}

// Flow Card Component
function FlowCard({ flow, t, isOwner, onCopy, onDelete }: any) {
  const router = useRouter()
  
  const nodeCount = flow.nodes?.length || 0
  const edgeCount = flow.edges?.length || 0
  const creatorName = flow.user_profiles?.full_name || 'Unknown'

  return (
    <div className="card-gradient rounded-bjj p-6 border border-white/10 hover:border-bjj-accent/50 transition-all">
      <div className="flex justify-between items-start mb-4">
        <h3 className="text-lg font-bold line-clamp-2">{flow.name}</h3>
        <span className={`text-xs px-2 py-1 rounded-full ${flow.is_public ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'}`}>
          {flow.is_public ? t.public : t.private}
        </span>
      </div>
      
      {flow.description && (
        <p className="text-sm text-bjj-muted mb-4 line-clamp-2">{flow.description}</p>
      )}
      
      <div className="text-xs text-bjj-muted mb-4">
        <div>{t.createdBy}: {creatorName}</div>
        <div>{nodeCount} {t.nodes} • {edgeCount} {t.edges}</div>
      </div>
      
      <div className="flex gap-2">
        <button
          onClick={() => router.push(`/flow-editor?id=${flow.id}`)}
          className="btn-ghost text-sm flex-1"
        >
          <ExternalLink className="w-4 h-4 mr-1" />
          {t.viewFlow}
        </button>
        
        <button
          onClick={onCopy}
          className="btn-ghost text-sm p-2"
          title={t.copyFlow}
        >
          <Copy className="w-4 h-4" />
        </button>
        
        {isOwner && (
          <button
            onClick={onDelete}
            className="btn-ghost text-sm p-2 text-red-400 hover:text-red-300"
            title={t.deleteFlow}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}