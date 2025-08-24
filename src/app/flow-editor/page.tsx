'use client'

import { useState, useCallback } from 'react'
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  MiniMap,
} from 'reactflow'
import 'reactflow/dist/style.css'
import './mobile-styles.css'
import './mobile-flow-styles.css'
import DashboardNav from '@/components/DashboardNav'
import MobileFlowWrapper from '@/components/MobileFlowWrapper'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Save, Plus, Trash2, Download, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase/client'

const getInitialNodes = (language: string, isMobile: boolean = false): Node[] => {
  const labels = {
    ja: ['クローズドガード', 'アームドラッグ', 'スイープ'],
    en: ['Closed Guard', 'Arm Drag', 'Sweep'],
    pt: ['Guarda Fechada', 'Arm Drag', 'Raspagem'],
    es: ['Guardia Cerrada', 'Arm Drag', 'Barrida'],
    fr: ['Garde Fermée', 'Arm Drag', 'Balayage'],
    ko: ['클로즈드 가드', '암 드래그', '스윕'],
    ru: ['Закрытая гвардия', 'Арм драг', 'Свип'],
  }
  
  const nodeLabels = labels[language as keyof typeof labels] || labels.en
  
  // モバイル用の配置調整
  const positions = isMobile ? [
    { x: 50, y: 50 },    // ノード1: 左上
    { x: 50, y: 200 },   // ノード2: 左下
    { x: 250, y: 200 },  // ノード3: 右下
  ] : [
    { x: 250, y: 100 },  // デスクトップ配置
    { x: 100, y: 250 },
    { x: 400, y: 250 },
  ]
  
  return [
    {
      id: '1',
      type: 'default',
      position: positions[0],
      data: { label: nodeLabels[0] },
      style: {
        background: '#13131a',
        color: '#e9e9ee',
        border: '2px solid #ea384c',
        borderRadius: '14px',
        padding: isMobile ? '8px 12px' : '10px 20px',
        width: isMobile ? 120 : 150,
        textAlign: 'center',
        fontSize: isMobile ? '13px' : '14px',
      },
    },
    {
      id: '2',
      type: 'default',
      position: positions[1],
      data: { label: nodeLabels[1] },
      style: {
        background: '#13131a',
        color: '#e9e9ee',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px',
        padding: isMobile ? '8px 12px' : '10px 20px',
        width: isMobile ? 120 : 150,
        textAlign: 'center',
        fontSize: isMobile ? '13px' : '14px',
      },
    },
    {
      id: '3',
      type: 'default',
      position: positions[2],
      data: { label: nodeLabels[2] },
      style: {
        background: '#13131a',
        color: '#e9e9ee',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px',
        padding: isMobile ? '8px 12px' : '10px 20px',
        width: isMobile ? 120 : 150,
        textAlign: 'center',
        fontSize: isMobile ? '13px' : '14px',
      },
    },
  ]
}

const initialEdges: Edge[] = [
  {
    id: 'e1-2',
    source: '1',
    target: '2',
    animated: true,
    style: { stroke: '#ea384c', strokeWidth: 2 },
  },
  {
    id: 'e1-3',
    source: '1',
    target: '3',
    animated: true,
    style: { stroke: '#ea384c', strokeWidth: 2 },
  },
]

export default function FlowEditorPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { language } = useLanguage()
  
  const [isMobileView, setIsMobileView] = useState(false)
  const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes(language, isMobileView))
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [flowName, setFlowName] = useState('')
  const [showFlowList, setShowFlowList] = useState(false)
  const [publicFlows, setPublicFlows] = useState<any[]>([])
  const [currentFlowId, setCurrentFlowId] = useState<string | null>(null)
  
  const [hasInitialized, setHasInitialized] = useState(false)
  
  useEffect(() => {
    // 初回のみフロー名を設定（言語変更時に上書きしない）
    if (!hasInitialized && flowName === '') {
      if (language === 'ja') setFlowName('新しいフロー')
      else if (language === 'en') setFlowName('New Flow')
      else if (language === 'pt') setFlowName('Novo Fluxo')
      setHasInitialized(true)
    }
    
    // モバイルビューの検出
    const checkMobile = () => {
      const isMobile = window.innerWidth < 768
      setIsMobileView(isMobile)
      
      // モバイルの場合、ノードを再配置
      if (isMobile) {
        setNodes(getInitialNodes(language, true))
      }
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [language, hasInitialized, setNodes])
  
  // 公開フローを取得
  useEffect(() => {
    const fetchPublicFlows = async () => {
      const { data, error } = await supabase
        .from('flows')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      
      if (!error && data && data.length > 0) {
        setPublicFlows(data)
        
        // 初回アクセス時は最初のサンプルフローを自動的に読み込む
        if (flowName === '' && nodes.length === 3 && data[0]) {
          setFlowName(data[0].name)
          if (data[0].nodes) setNodes(data[0].nodes)
          if (data[0].edges) setEdges(data[0].edges)
          setCurrentFlowId(data[0].id)
        }
      }
    }
    
    fetchPublicFlows()
  }, [flowName, nodes.length, setNodes, setEdges])

  useEffect(() => {
    if (!loading && !user) {
      const errorMsg = {
        ja: 'フローエディタを使用するにはログインが必要です',
        en: 'Login required to use the flow editor',
        pt: 'Login necessário para usar o editor de fluxo'
      }
      toast.error(errorMsg[language as keyof typeof errorMsg])
      router.push('/')
    }
  }, [user, loading, router, language])

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        animated: true,
        style: { stroke: '#ea384c', strokeWidth: 2 },
      }
      setEdges((eds) => addEdge(newEdge, eds))
    },
    [setEdges]
  )

  const loadFlow = useCallback((flow: any) => {
    setFlowName(flow.name)
    if (flow.nodes) setNodes(flow.nodes)
    if (flow.edges) setEdges(flow.edges)
    setCurrentFlowId(flow.id)
    setShowFlowList(false)
    toast.success(
      language === 'ja' ? `「${flow.name}」を読み込みました` :
      language === 'en' ? `Loaded "${flow.name}"` :
      `Carregado "${flow.name}"`
    )
  }, [language, setNodes, setEdges])

  const addNode = useCallback(() => {
    const nodeCount = nodes.length + 1
    const newNode: Node = {
      id: `node-${Date.now()}`, // ユニークIDで重複を防ぐ
      type: 'default',
      position: { 
        x: 100 + (nodeCount * 60) % 600, // より予測可能な配置
        y: 100 + Math.floor(nodeCount / 10) * 80 
      },
      data: { 
        label: language === 'ja' ? `技術 ${nodeCount}` : 
               language === 'en' ? `Technique ${nodeCount}` : 
               `Técnica ${nodeCount}` 
      },
      style: {
        background: '#13131a',
        color: '#e9e9ee',
        border: '2px solid #ea384c',
        borderRadius: '14px',
        padding: '10px 20px',
        width: 120,
        textAlign: 'center',
        fontSize: '13px',
        // アニメーション効果を追加
        animation: 'fadeIn 0.3s ease-in-out'
      },
    }
    
    console.log(`[FlowEditor] Adding node ${nodeCount} at position (${newNode.position.x}, ${newNode.position.y})`)
    
    setNodes((nds) => {
      const updatedNodes = [...nds, newNode]
      console.log(`[FlowEditor] Total nodes: ${updatedNodes.length}`)
      return updatedNodes
    })
    
    // より目立つ成功フィードバック
    toast.success(
      language === 'ja' ? `✨ ノード「${newNode.data.label}」を追加しました！` :
      language === 'en' ? `✨ Added node "${newNode.data.label}"!` :
      `✨ Nó "${newNode.data.label}" adicionado!`,
      { 
        duration: 2000,
        style: {
          background: 'linear-gradient(135deg, #1a1a23 0%, #2a2a33 100%)',
          color: '#fff',
          border: '1px solid #ea384c',
        },
        icon: '🎯'
      }
    )
  }, [nodes, language, setNodes])

  const saveFlow = async () => {
    if (!flowName.trim()) {
      toast.error(
        language === 'ja' ? 'フロー名を入力してください' :
        language === 'en' ? 'Please enter a flow name' :
        'Por favor, insira um nome para o fluxo'
      )
      return
    }

    if (nodes.length === 0) {
      toast.error(
        language === 'ja' ? 'ノードを追加してください' :
        language === 'en' ? 'Please add nodes' :
        'Por favor, adicione nós'
      )
      return
    }

    if (!user) {
      toast.error(
        language === 'ja' ? 'ログインが必要です' :
        language === 'en' ? 'Login required' :
        'Login necessário'
      )
      return
    }

    try {
      // Supabaseに保存を試みる
      const { data, error } = await supabase
        .from('flows')
        .insert({
          user_id: user.id,
          name: flowName,
          nodes,
          edges,
          is_public: false,
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving flow:', error)
        
        // 認証エラーの場合の処理
        if (error.message?.includes('authorization') || error.message?.includes('JWT') || error.message?.includes('auth')) {
          toast.error(
            language === 'ja' ? 'ログインが必要です。再度ログインしてください。' :
            language === 'en' ? 'Please log in again to save flows.' :
            'Por favor, faça login novamente para salvar fluxos.'
          )
          return
        }
        
        // テーブルが存在しない場合はLocalStorageに保存
        if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          const flowData = {
            name: flowName,
            nodes,
            edges,
            createdAt: new Date().toISOString(),
          }
          
          const savedFlows = JSON.parse(localStorage.getItem('bjj-flows') || '[]')
          savedFlows.push(flowData)
          localStorage.setItem('bjj-flows', JSON.stringify(savedFlows))
          
          toast.success(
            language === 'ja' ? 'フローをローカルに保存しました（データベース準備中）' :
            language === 'en' ? 'Flow saved locally (Database setup pending)' :
            'Fluxo salvo localmente (Banco de dados pendente)',
            {
              icon: '💾',
              duration: 4000,
            }
          )
          return
        }
        
        throw error
      }

      toast.success(
        language === 'ja' ? 'フローを保存しました' :
        language === 'en' ? 'Flow saved successfully' :
        'Fluxo salvo com sucesso',
        {
          icon: '✓',
          style: {
            background: 'linear-gradient(135deg, #1a1a23 0%, #2a2a33 100%)',
            color: '#fff',
            border: '1px solid #4ade80',
          },
          duration: 3000,
        }
      )
    } catch (error: any) {
      console.error('Save error:', error)
      toast.error(
        language === 'ja' ? `保存エラー: ${error.message}` :
        language === 'en' ? `Save error: ${error.message}` :
        `Erro ao salvar: ${error.message}`
      )
    }
  }

  const exportFlow = () => {
    const flowData = {
      name: flowName,
      nodes,
      edges,
    }
    
    const dataStr = JSON.stringify(flowData, null, 2)
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr)
    
    const exportFileDefaultName = `${flowName.replace(/\s+/g, '_')}.json`
    
    const linkElement = document.createElement('a')
    linkElement.setAttribute('href', dataUri)
    linkElement.setAttribute('download', exportFileDefaultName)
    linkElement.click()
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-bjj-accent"></div>
      </div>
    )
  }

  return (
    <MobileFlowWrapper>
      <main className="min-h-screen bg-bjj-bg">
        <DashboardNav />
      
      
      <div className={`${isMobileView ? 'flow-editor-mobile-container' : 'h-[calc(100vh-120px)]'} relative`}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodesDraggable={true}
          nodesConnectable={true}
          elementsSelectable={true}
          fitView
          attributionPosition="bottom-left"
        >
          <Background color="#2a2a33" gap={16} />
          <Controls className="bg-bjj-bg2 border-white/10" />
          <MiniMap
            nodeColor="#ea384c"
            maskColor="#0f0f12ee"
            className="bg-bjj-bg2 border-white/10"
          />
          
          <div className="absolute top-2 left-2 sm:top-4 sm:left-4 bg-bjj-bg2/90 backdrop-blur-sm border border-white/10 rounded-lg sm:rounded-bjj p-2 sm:p-4 max-w-[90%] sm:max-w-none">
            <div className="mb-2 sm:mb-4">
              <div className="flex items-center gap-2 sm:gap-4">
                <input
                  type="text"
                  value={flowName}
                  onChange={(e) => {
                    setFlowName(e.target.value)
                    setCurrentFlowId(null) // 名前を変更したらカスタムフローとして扱う
                  }}
                  autoComplete="off"
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  className="px-2 py-1 sm:px-3 sm:py-2 bg-bjj-bg border border-white/10 rounded-lg text-sm sm:text-base text-bjj-text focus:border-bjj-accent focus:outline-none w-full max-w-[150px] sm:max-w-none"
                  placeholder={language === 'ja' ? 'フロー名' : language === 'en' ? 'Flow Name' : 'Nome do Fluxo'}
                />
                {currentFlowId && (
                  <button
                    onClick={() => {
                      setFlowName('')
                      setNodes(getInitialNodes(language, isMobileView))
                      setEdges(initialEdges)
                      setCurrentFlowId(null)
                      toast.success(
                        language === 'ja' ? '新規フローを開始' :
                        language === 'en' ? 'Started new flow' :
                        'Novo fluxo iniciado'
                      )
                    }}
                    className="text-xs text-bjj-muted hover:text-bjj-accent"
                    title={language === 'ja' ? '新規作成' : 'New'}
                  >
                    ✕
                  </button>
                )}
              </div>
            </div>
            
            <div className="flex gap-1 sm:gap-2 flex-wrap">
              <button
                onClick={(e) => {
                  e.preventDefault()
                  // Add node button clicked
                  addNode()
                }}
                className="btn-ghost text-xs sm:text-sm flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-2"
                type="button"
              >
                <Plus className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{language === 'ja' ? 'ノード追加' : language === 'en' ? 'Add Node' : 'Adicionar Nó'}</span>
                <span className="sm:hidden">+</span>
              </button>
              
              <button
                onClick={saveFlow}
                className="btn-ghost text-xs sm:text-sm flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-2"
              >
                <Save className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{language === 'ja' ? '保存' : language === 'en' ? 'Save' : 'Salvar'}</span>
              </button>
              
              <button
                onClick={exportFlow}
                className="btn-ghost text-xs sm:text-sm flex items-center gap-1 sm:gap-2 px-2 py-1 sm:px-3 sm:py-2"
              >
                <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">{language === 'ja' ? 'エクスポート' : language === 'en' ? 'Export' : 'Exportar'}</span>
              </button>
            </div>
            
            {/* サンプルフローを表示（PC・モバイル共通） */}
            {publicFlows.length > 0 && (
              <div className="mt-2">
                <button
                  onClick={() => setShowFlowList(!showFlowList)}
                  className="text-xs sm:text-sm text-bjj-accent hover:text-bjj-accent/80 transition-colors"
                >
                  {showFlowList ? (
                    language === 'ja' ? '閉じる' : language === 'en' ? 'Close' : 'Fechar'
                  ) : (
                    language === 'ja' ? 'サンプルフローを見る' : language === 'en' ? 'View Sample Flows' : 'Ver Fluxos de Exemplo'
                  )}
                </button>
                {showFlowList && (
                  <div className="mt-2 space-y-1 max-h-48 overflow-y-auto bg-bjj-bg/50 rounded-lg p-2">
                    {publicFlows.map((flow) => (
                      <button
                        key={flow.id}
                        onClick={() => loadFlow(flow)}
                        className={`block w-full text-left text-xs sm:text-sm p-2 rounded transition-colors ${
                          currentFlowId === flow.id 
                            ? 'bg-bjj-accent/20 border-l-2 border-bjj-accent' 
                            : 'hover:bg-bjj-bg2'
                        }`}
                      >
                        {flow.name}
                        {currentFlowId === flow.id && (
                          <span className="ml-2 text-bjj-accent">✓</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* フローリストパネル（デスクトップ） */}
          <div className="hidden lg:block absolute top-4 right-4 w-64 max-h-[calc(100vh-200px)] bg-bjj-bg2/90 backdrop-blur-sm border border-white/10 rounded-bjj overflow-hidden">
            <div className="p-4">
              <h3 className="text-sm font-bold text-bjj-text mb-3">
                {language === 'ja' ? 'フローライブラリ' : language === 'en' ? 'Flow Library' : 'Biblioteca de Fluxos'}
              </h3>
              {publicFlows.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {publicFlows.map((flow) => (
                    <button
                      key={flow.id}
                      onClick={() => loadFlow(flow)}
                      className={`w-full text-left p-3 rounded-lg border transition-all ${
                        currentFlowId === flow.id
                          ? 'bg-bjj-accent/10 border-bjj-accent/50 ring-1 ring-bjj-accent/30'
                          : 'bg-bjj-bg hover:bg-bjj-bg/80 border-white/5 hover:border-bjj-accent/30'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <h4 className="text-sm font-semibold text-bjj-text">{flow.name}</h4>
                        {currentFlowId === flow.id && (
                          <span className="text-bjj-accent text-xs">●</span>
                        )}
                      </div>
                      {flow.description && (
                        <p className="text-xs text-bjj-muted mt-1 line-clamp-2">{flow.description}</p>
                      )}
                      <div className="text-xs text-bjj-muted mt-2">
                        {flow.nodes?.length || 0} {language === 'ja' ? 'ノード' : 'nodes'}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-bjj-muted">
                  {language === 'ja' ? 'フローがありません' : language === 'en' ? 'No flows available' : 'Nenhum fluxo disponível'}
                </p>
              )}
            </div>
            
            <div className="border-t border-white/10 p-4 mt-4">
              <h4 className="text-xs font-bold text-bjj-muted mb-2">
                {language === 'ja' ? '操作方法' : language === 'en' ? 'Controls' : 'Controles'}
              </h4>
              <ul className="space-y-1 text-xs text-bjj-muted">
                {language === 'ja' && (
                  <>
                    <li>• ドラッグ: ノードを移動</li>
                    <li>• ノードをドラッグ: 接続を作成</li>
                    <li>• ダブルクリック: ノードを編集</li>
                    <li>• Delete: 選択を削除</li>
                  </>
                )}
                {language === 'en' && (
                  <>
                    <li>• Drag: Move nodes</li>
                    <li>• Drag from node: Create connection</li>
                    <li>• Double click: Edit node</li>
                    <li>• Delete: Remove selection</li>
                  </>
                )}
                {language === 'pt' && (
                  <>
                    <li>• Arrastar: Mover nós</li>
                    <li>• Arrastar do nó: Criar conexão</li>
                    <li>• Duplo clique: Editar nó</li>
                    <li>• Delete: Remover seleção</li>
                  </>
                )}
              </ul>
            </div>
          </div>
        </ReactFlow>
      </div>
    </main>
    </MobileFlowWrapper>
  )
}