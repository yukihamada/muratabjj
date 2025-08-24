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
  es: {
    title: 'Flujos de Técnicas',
    subtitle: 'Aprende conexiones y flujos de técnicas de BJJ visualmente',
    publicFlows: 'Flujos Públicos',
    myFlows: 'Mis Flujos',
    createNew: 'Crear Nuevo Flujo',
    viewFlow: 'Ver Flujo',
    editFlow: 'Editar',
    deleteFlow: 'Eliminar',
    copyFlow: 'Copiar',
    shareFlow: 'Compartir',
    noFlows: 'No hay flujos disponibles',
    noPublicFlows: 'No hay flujos públicos disponibles',
    noMyFlows: 'Aún no has creado ningún flujo',
    createdBy: 'Creado por',
    nodes: 'nodos',
    edges: 'conexiones',
    public: 'Público',
    private: 'Privado',
    deleteConfirm: '¿Eliminar este flujo?',
    copySuccess: 'Flujo copiado',
    deleteSuccess: 'Flujo eliminado',
  },
  fr: {
    title: 'Flux de Techniques',
    subtitle: 'Apprenez visuellement les connexions et flux de techniques BJJ',
    publicFlows: 'Flux Publics',
    myFlows: 'Mes Flux',
    createNew: 'Créer un Nouveau Flux',
    viewFlow: 'Voir le Flux',
    editFlow: 'Modifier',
    deleteFlow: 'Supprimer',
    copyFlow: 'Copier',
    shareFlow: 'Partager',
    noFlows: 'Aucun flux disponible',
    noPublicFlows: 'Aucun flux public disponible',
    noMyFlows: 'Vous n\'avez créé aucun flux pour le moment',
    createdBy: 'Créé par',
    nodes: 'nœuds',
    edges: 'connexions',
    public: 'Public',
    private: 'Privé',
    deleteConfirm: 'Supprimer ce flux ?',
    copySuccess: 'Flux copié',
    deleteSuccess: 'Flux supprimé',
  },
  ko: {
    title: '기술 플로우',
    subtitle: 'BJJ 기술 연결과 플로우를 시각적으로 학습',
    publicFlows: '공개 플로우',
    myFlows: '내 플로우',
    createNew: '새 플로우 만들기',
    viewFlow: '플로우 보기',
    editFlow: '편집',
    deleteFlow: '삭제',
    copyFlow: '복사',
    shareFlow: '공유',
    noFlows: '사용 가능한 플로우가 없습니다',
    noPublicFlows: '공개 플로우가 없습니다',
    noMyFlows: '아직 플로우를 만들지 않았습니다',
    createdBy: '만든 사람',
    nodes: '노드',
    edges: '연결',
    public: '공개',
    private: '비공개',
    deleteConfirm: '이 플로우를 삭제하시겠습니까?',
    copySuccess: '플로우 복사됨',
    deleteSuccess: '플로우 삭제됨',
  },
  ru: {
    title: 'Потоки Техник',
    subtitle: 'Изучайте связи и потоки техник BJJ визуально',
    publicFlows: 'Публичные Потоки',
    myFlows: 'Мои Потоки',
    createNew: 'Создать Новый Поток',
    viewFlow: 'Посмотреть Поток',
    editFlow: 'Редактировать',
    deleteFlow: 'Удалить',
    copyFlow: 'Копировать',
    shareFlow: 'Поделиться',
    noFlows: 'Нет доступных потоков',
    noPublicFlows: 'Нет публичных потоков',
    noMyFlows: 'Вы еще не создали ни одного потока',
    createdBy: 'Создано',
    nodes: 'узлы',
    edges: 'связи',
    public: 'Публичный',
    private: 'Частный',
    deleteConfirm: 'Удалить этот поток?',
    copySuccess: 'Поток скопирован',
    deleteSuccess: 'Поток удален',
  },
  zh: {
    title: '技术流程',
    subtitle: '直观地学习BJJ技术连接和流程',
    publicFlows: '公开流程',
    myFlows: '我的流程',
    createNew: '创建新流程',
    viewFlow: '查看流程',
    editFlow: '编辑',
    deleteFlow: '删除',
    copyFlow: '复制',
    shareFlow: '分享',
    noFlows: '没有可用的流程',
    noPublicFlows: '没有公开的流程',
    noMyFlows: '您还没有创建任何流程',
    createdBy: '创建者',
    nodes: '节点',
    edges: '连接',
    public: '公开',
    private: '私有',
    deleteConfirm: '删除此流程？',
    copySuccess: '流程已复制',
    deleteSuccess: '流程已删除',
  },
  de: {
    title: 'Technik-Abläufe',
    subtitle: 'Lernen Sie BJJ-Technik-Verbindungen und -Abläufe visuell',
    publicFlows: 'Öffentliche Abläufe',
    myFlows: 'Meine Abläufe',
    createNew: 'Neuen Ablauf Erstellen',
    viewFlow: 'Ablauf Ansehen',
    editFlow: 'Bearbeiten',
    deleteFlow: 'Löschen',
    copyFlow: 'Kopieren',
    shareFlow: 'Teilen',
    noFlows: 'Keine Abläufe verfügbar',
    noPublicFlows: 'Keine öffentlichen Abläufe verfügbar',
    noMyFlows: 'Sie haben noch keine Abläufe erstellt',
    createdBy: 'Erstellt von',
    nodes: 'Knoten',
    edges: 'Verbindungen',
    public: 'Öffentlich',
    private: 'Privat',
    deleteConfirm: 'Diesen Ablauf löschen?',
    copySuccess: 'Ablauf kopiert',
    deleteSuccess: 'Ablauf gelöscht',
  },
  it: {
    title: 'Flussi di Tecniche',
    subtitle: 'Impara visivamente connessioni e flussi di tecniche BJJ',
    publicFlows: 'Flussi Pubblici',
    myFlows: 'I Miei Flussi',
    createNew: 'Crea Nuovo Flusso',
    viewFlow: 'Visualizza Flusso',
    editFlow: 'Modifica',
    deleteFlow: 'Elimina',
    copyFlow: 'Copia',
    shareFlow: 'Condividi',
    noFlows: 'Nessun flusso disponibile',
    noPublicFlows: 'Nessun flusso pubblico disponibile',
    noMyFlows: 'Non hai ancora creato nessun flusso',
    createdBy: 'Creato da',
    nodes: 'nodi',
    edges: 'connessioni',
    public: 'Pubblico',
    private: 'Privato',
    deleteConfirm: 'Eliminare questo flusso?',
    copySuccess: 'Flusso copiato',
    deleteSuccess: 'Flusso eliminato',
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