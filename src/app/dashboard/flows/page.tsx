'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import DashboardNav from '@/components/DashboardNav'
import { useLanguage } from '@/contexts/LanguageContext'
import { Share2, Plus, Trash2, Copy, ExternalLink, Users, Lock, Edit3, Globe, Eye, EyeOff, Star, TrendingUp, Clock, Grid, List, X, Save, Download, Upload, ChevronRight, Sparkles, Layers, GitBranch, Activity } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  MiniMap,
  ReactFlowProvider,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
} from 'reactflow'
import 'reactflow/dist/style.css'

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
    flowName: 'フロー名',
    flowDescription: '説明',
    save: '保存',
    saving: '保存中...',
    cancel: 'キャンセル',
    addNode: 'ノード追加',
    preview: 'プレビュー',
    edit: '編集',
    flowSaved: 'フローを保存しました',
    allFlows: 'すべてのフロー',
    popular: '人気',
    recent: '最近',
    search: '検索...',
    viewMode: '表示モード',
    gridView: 'グリッド',
    listView: 'リスト',
    flowEditor: 'フローエディター',
    closeEditor: 'エディターを閉じる',
    newFlowName: '新しいフロー',
    newFlowDescription: 'クリックして説明を追加',
    techniques: '技術',
    connections: '接続',
    complexity: '複雑度',
    lastUpdated: '最終更新',
    makePublic: '公開する',
    makePrivate: '非公開にする',
    duplicated: '複製されました',
    shareLink: 'リンクをコピー',
    sharedSuccessfully: 'リンクをコピーしました',
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
    flowName: 'Flow Name',
    flowDescription: 'Description',
    save: 'Save',
    saving: 'Saving...',
    cancel: 'Cancel',
    addNode: 'Add Node',
    preview: 'Preview',
    edit: 'Edit',
    flowSaved: 'Flow saved successfully',
    allFlows: 'All Flows',
    popular: 'Popular',
    recent: 'Recent',
    search: 'Search...',
    viewMode: 'View Mode',
    gridView: 'Grid',
    listView: 'List',
    flowEditor: 'Flow Editor',
    closeEditor: 'Close Editor',
    newFlowName: 'New Flow',
    newFlowDescription: 'Click to add description',
    techniques: 'Techniques',
    connections: 'Connections',
    complexity: 'Complexity',
    lastUpdated: 'Last Updated',
    makePublic: 'Make Public',
    makePrivate: 'Make Private',
    duplicated: 'Duplicated',
    shareLink: 'Copy Link',
    sharedSuccessfully: 'Link copied to clipboard',
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
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTab, setSelectedTab] = useState<'all' | 'public' | 'my'>('all')
  const [editingFlow, setEditingFlow] = useState<any>(null)
  const [nodes, setNodes, onNodesChange] = useNodesState([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [flowName, setFlowName] = useState('')
  const [flowDescription, setFlowDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

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

  const onConnect = useCallback((params: Connection) => {
    setEdges((eds) => addEdge(params, eds))
  }, [])

  const handleNewFlow = () => {
    const newFlow = {
      id: 'new',
      name: t.newFlowName,
      description: t.newFlowDescription,
      nodes: [
        {
          id: '1',
          type: 'default',
          position: { x: 250, y: 100 },
          data: { label: 'Start' },
        },
      ],
      edges: [],
      is_public: false,
    }
    setEditingFlow(newFlow)
    setNodes(newFlow.nodes)
    setEdges(newFlow.edges)
    setFlowName(newFlow.name)
    setFlowDescription(newFlow.description)
    setIsPublic(newFlow.is_public)
  }

  const handleEditFlow = (flow: any) => {
    setEditingFlow(flow)
    setNodes(flow.nodes || [])
    setEdges(flow.edges || [])
    setFlowName(flow.name)
    setFlowDescription(flow.description || '')
    setIsPublic(flow.is_public)
  }

  const handleSaveFlow = async () => {
    if (!flowName.trim()) {
      toast.error(t.flowNameRequired)
      return
    }

    setIsSaving(true)
    try {
      const flowData = {
        name: flowName,
        description: flowDescription,
        nodes,
        edges,
        is_public: isPublic,
        user_id: user?.id,
      }

      if (editingFlow.id === 'new') {
        const { data, error } = await supabase
          .from('flows')
          .insert(flowData)
          .select()
          .single()

        if (error) throw error
        toast.success(t.flowSaved)
      } else {
        const { error } = await supabase
          .from('flows')
          .update(flowData)
          .eq('id', editingFlow.id)
          .eq('user_id', user?.id)

        if (error) throw error
        toast.success(t.flowSaved)
      }

      setEditingFlow(null)
      loadFlows()
    } catch (error) {
      console.error('Error saving flow:', error)
      toast.error('Failed to save flow')
    } finally {
      setIsSaving(false)
    }
  }

  const addNode = () => {
    const newNode = {
      id: `${nodes.length + 1}`,
      type: 'default',
      position: { x: Math.random() * 400 + 100, y: Math.random() * 300 + 100 },
      data: { label: `Node ${nodes.length + 1}` },
    }
    setNodes((nds) => nds.concat(newNode))
  }

  const filteredFlows = [...publicFlows, ...myFlows].filter((flow, index, self) => {
    const isDuplicate = self.findIndex(f => f.id === flow.id) !== index
    if (isDuplicate) return false

    if (selectedTab === 'public' && !flow.is_public) return false
    if (selectedTab === 'my' && flow.user_id !== user?.id) return false

    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      return (
        flow.name.toLowerCase().includes(query) ||
        (flow.description && flow.description.toLowerCase().includes(query))
      )
    }
    return true
  })

  if (loading || loadingFlows) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bjj-bg">
        <div className="animate-pulse flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-bjj-accent to-bjj-accent/50 rounded-full animate-spin" />
          <p className="text-bjj-muted">Loading flows...</p>
        </div>
      </div>
    )
  }

  return (
    <ReactFlowProvider>
      <main className="min-h-screen bg-bjj-bg">
        <DashboardNav />
        
        {editingFlow ? (
          // Flow Editor View
          <div className="fixed inset-0 top-14 bg-bjj-bg z-40">
            {/* Editor Header */}
            <div className="bg-bjj-bg2 border-b border-white/10 px-4 py-3">
              <div className="container mx-auto flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setEditingFlow(null)}
                    className="btn-ghost p-2"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <div>
                    <input
                      type="text"
                      value={flowName}
                      onChange={(e) => setFlowName(e.target.value)}
                      className="text-lg font-bold bg-transparent border-b border-transparent hover:border-white/20 focus:border-bjj-accent outline-none transition-colors"
                      placeholder={t.flowName}
                    />
                    <input
                      type="text"
                      value={flowDescription}
                      onChange={(e) => setFlowDescription(e.target.value)}
                      className="block text-sm text-bjj-muted bg-transparent border-b border-transparent hover:border-white/20 focus:border-bjj-accent outline-none transition-colors mt-1"
                      placeholder={t.flowDescription}
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPublic(!isPublic)}
                    className={`btn-ghost px-3 py-1 text-sm ${isPublic ? 'text-green-400' : 'text-bjj-muted'}`}
                  >
                    {isPublic ? <Globe className="w-4 h-4 mr-1" /> : <Lock className="w-4 h-4 mr-1" />}
                    {isPublic ? t.public : t.private}
                  </button>
                  <button
                    onClick={addNode}
                    className="btn-ghost"
                  >
                    <Plus className="w-5 h-5 mr-2" />
                    {t.addNode}
                  </button>
                  <button
                    onClick={handleSaveFlow}
                    disabled={isSaving}
                    className="btn-primary"
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {isSaving ? t.saving : t.save}
                  </button>
                </div>
              </div>
            </div>

            {/* Flow Editor Canvas */}
            <div className="h-[calc(100vh-7rem)]">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                fitView
                attributionPosition="bottom-left"
              >
                <Background />
                <Controls />
                <MiniMap />
              </ReactFlow>
            </div>
          </div>
        ) : (
          // Flow List View
          <div className="container mx-auto px-4 py-8 max-w-7xl">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-bjj-accent to-bjj-accent/70 bg-clip-text text-transparent">
                    {t.title}
                  </h1>
                  <p className="text-bjj-muted text-lg">{t.subtitle}</p>
                </div>
                <button
                  onClick={handleNewFlow}
                  className="btn-primary group"
                >
                  <Sparkles className="w-5 h-5 mr-2 group-hover:animate-pulse" />
                  {t.createNew}
                </button>
              </div>
            </div>

            {/* Controls Bar */}
            <div className="bg-bjj-bg2 rounded-bjj p-4 mb-6 border border-white/10">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Tabs */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedTab('all')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                      selectedTab === 'all'
                        ? 'bg-bjj-accent text-white'
                        : 'bg-white/5 text-bjj-muted hover:bg-white/10'
                    }`}
                  >
                    {t.allFlows}
                  </button>
                  <button
                    onClick={() => setSelectedTab('public')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      selectedTab === 'public'
                        ? 'bg-bjj-accent text-white'
                        : 'bg-white/5 text-bjj-muted hover:bg-white/10'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    {t.publicFlows}
                  </button>
                  <button
                    onClick={() => setSelectedTab('my')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
                      selectedTab === 'my'
                        ? 'bg-bjj-accent text-white'
                        : 'bg-white/5 text-bjj-muted hover:bg-white/10'
                    }`}
                  >
                    <Lock className="w-4 h-4" />
                    {t.myFlows}
                  </button>
                </div>

                {/* Search and View Mode */}
                <div className="flex gap-2 sm:ml-auto">
                  <div className="relative flex-1 sm:w-64">
                    <input
                      type="text"
                      placeholder={t.search}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2 pl-10 focus:border-bjj-accent outline-none transition-colors"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-bjj-muted" />
                  </div>
                  <div className="flex gap-1 bg-white/5 rounded-lg p-1">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'grid'
                          ? 'bg-bjj-accent text-white'
                          : 'text-bjj-muted hover:text-bjj-text'
                      }`}
                    >
                      <Grid className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 rounded transition-colors ${
                        viewMode === 'list'
                          ? 'bg-bjj-accent text-white'
                          : 'text-bjj-muted hover:text-bjj-text'
                      }`}
                    >
                      <List className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Flows Display */}
            {filteredFlows.length === 0 ? (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-white/5 rounded-full mb-4">
                  <Layers className="w-10 h-10 text-bjj-muted" />
                </div>
                <p className="text-bjj-muted text-lg">{t.noFlows}</p>
              </div>
            ) : (
              <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
                {filteredFlows.map((flow) => (
                  viewMode === 'grid' ? (
                    <FlowCard
                      key={flow.id}
                      flow={flow}
                      t={t}
                      isOwner={flow.user_id === user?.id}
                      onEdit={() => handleEditFlow(flow)}
                      onCopy={() => copyFlow(flow)}
                      onDelete={() => deleteFlow(flow.id)}
                    />
                  ) : (
                    <FlowListItem
                      key={flow.id}
                      flow={flow}
                      t={t}
                      isOwner={flow.user_id === user?.id}
                      onEdit={() => handleEditFlow(flow)}
                      onCopy={() => copyFlow(flow)}
                      onDelete={() => deleteFlow(flow.id)}
                    />
                  )
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </ReactFlowProvider>
  )
}

// Flow Card Component
function FlowCard({ flow, t, isOwner, onEdit, onCopy, onDelete }: any) {
  const nodeCount = flow.nodes?.length || 0
  const edgeCount = flow.edges?.length || 0
  const creatorName = flow.user_profiles?.full_name || 'Unknown'
  const complexity = nodeCount > 10 ? 'high' : nodeCount > 5 ? 'medium' : 'low'
  const complexityColor = complexity === 'high' ? 'text-red-400' : complexity === 'medium' ? 'text-yellow-400' : 'text-green-400'

  return (
    <div className="group relative bg-gradient-to-br from-bjj-bg2 to-bjj-bg2/50 rounded-bjj p-6 border border-white/10 hover:border-bjj-accent/50 transition-all duration-300 hover:shadow-xl hover:shadow-bjj-accent/10 hover:-translate-y-1">
      {/* Gradient overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-bjj-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-bjj" />
      
      <div className="relative">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-bold line-clamp-2 group-hover:text-bjj-accent transition-colors">{flow.name}</h3>
          <span className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 ${flow.is_public ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-bjj-muted'}`}>
            {flow.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
            {flow.is_public ? t.public : t.private}
          </span>
        </div>
        
        {flow.description && (
          <p className="text-sm text-bjj-muted mb-4 line-clamp-2">{flow.description}</p>
        )}
        
        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <div className="text-xs text-bjj-muted">{t.nodes}</div>
            <div className="text-sm font-bold">{nodeCount}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <div className="text-xs text-bjj-muted">{t.connections}</div>
            <div className="text-sm font-bold">{edgeCount}</div>
          </div>
          <div className="bg-white/5 rounded-lg p-2 text-center">
            <div className="text-xs text-bjj-muted">{t.complexity}</div>
            <div className={`text-sm font-bold ${complexityColor}`}>
              {complexity === 'high' ? '●●●' : complexity === 'medium' ? '●●○' : '●○○'}
            </div>
          </div>
        </div>
        
        {/* Mini Flow Preview */}
        <div className="h-32 bg-white/5 rounded-lg mb-4 overflow-hidden relative">
          <div className="absolute inset-0 flex items-center justify-center">
            <GitBranch className="w-8 h-8 text-bjj-muted/30" />
          </div>
          {/* TODO: Add actual flow preview */}
        </div>
        
        <div className="text-xs text-bjj-muted mb-4">
          <div className="flex items-center gap-1">
            <User className="w-3 h-3" />
            {creatorName}
          </div>
        </div>
        
        <div className="flex gap-2">
          <button
            onClick={onEdit}
            className="btn-ghost text-sm flex-1 group-hover:bg-bjj-accent group-hover:text-white"
          >
            <Eye className="w-4 h-4 mr-1" />
            {isOwner ? t.edit : t.viewFlow}
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
    </div>
  )
}

// Flow List Item Component
function FlowListItem({ flow, t, isOwner, onEdit, onCopy, onDelete }: any) {
  const nodeCount = flow.nodes?.length || 0
  const edgeCount = flow.edges?.length || 0
  const creatorName = flow.user_profiles?.full_name || 'Unknown'
  const updatedAt = new Date(flow.updated_at || flow.created_at).toLocaleDateString()

  return (
    <div className="group bg-gradient-to-r from-bjj-bg2 to-bjj-bg2/50 rounded-bjj p-4 border border-white/10 hover:border-bjj-accent/50 transition-all duration-300 hover:shadow-lg hover:shadow-bjj-accent/10">
      <div className="flex items-center gap-4">
        {/* Mini Preview */}
        <div className="w-20 h-20 bg-white/5 rounded-lg flex items-center justify-center flex-shrink-0">
          <GitBranch className="w-8 h-8 text-bjj-muted/30" />
        </div>
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <div>
              <h3 className="text-lg font-bold group-hover:text-bjj-accent transition-colors">{flow.name}</h3>
              {flow.description && (
                <p className="text-sm text-bjj-muted line-clamp-1">{flow.description}</p>
              )}
            </div>
            <span className={`text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1 ${flow.is_public ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-bjj-muted'}`}>
              {flow.is_public ? <Globe className="w-3 h-3" /> : <Lock className="w-3 h-3" />}
              {flow.is_public ? t.public : t.private}
            </span>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-bjj-muted">
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {creatorName}
            </span>
            <span className="flex items-center gap-1">
              <Layers className="w-3 h-3" />
              {nodeCount} {t.nodes}
            </span>
            <span className="flex items-center gap-1">
              <GitBranch className="w-3 h-3" />
              {edgeCount} {t.connections}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {updatedAt}
            </span>
          </div>
        </div>
        
        {/* Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onEdit}
            className="btn-primary text-sm"
          >
            {isOwner ? t.edit : t.viewFlow}
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
          
          <div className="flex gap-1">
            <button
              onClick={onCopy}
              className="btn-ghost p-2"
              title={t.copyFlow}
            >
              <Copy className="w-4 h-4" />
            </button>
            
            {isOwner && (
              <button
                onClick={onDelete}
                className="btn-ghost p-2 text-red-400 hover:text-red-300"
                title={t.deleteFlow}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Add missing import
import { Search, User } from 'lucide-react'