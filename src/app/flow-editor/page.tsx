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
} from 'react-flow-renderer'
import DashboardNav from '@/components/DashboardNav'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Save, Plus, Trash2, Download, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '@/contexts/LanguageContext'

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    position: { x: 250, y: 100 },
    data: { label: 'クローズドガード' },
    style: {
      background: '#13131a',
      color: '#e9e9ee',
      border: '2px solid #ea384c',
      borderRadius: '14px',
      padding: '10px 20px',
    },
  },
  {
    id: '2',
    position: { x: 100, y: 250 },
    data: { label: 'アームドラッグ' },
    style: {
      background: '#13131a',
      color: '#e9e9ee',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '14px',
      padding: '10px 20px',
    },
  },
  {
    id: '3',
    position: { x: 400, y: 250 },
    data: { label: 'スイープ' },
    style: {
      background: '#13131a',
      color: '#e9e9ee',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: '14px',
      padding: '10px 20px',
    },
  },
]

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
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [flowName, setFlowName] = useState('')
  const [isMobileView, setIsMobileView] = useState(false)
  const { user, loading } = useAuth()
  const router = useRouter()
  const { language } = useLanguage()
  
  useEffect(() => {
    // 初回のみフロー名を設定
    if (flowName === '') {
      if (language === 'ja') setFlowName('新しいフロー')
      else if (language === 'en') setFlowName('New Flow')
      else if (language === 'pt') setFlowName('Novo Fluxo')
    }
    
    // モバイルビューの検出
    const checkMobile = () => {
      setIsMobileView(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [language])

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

  const addNode = () => {
    const newNode: Node = {
      id: `${nodes.length + 1}`,
      type: 'default',
      position: { x: 250 + nodes.length * 50, y: 100 + nodes.length * 50 },
      data: { label: language === 'ja' ? `新しい技術 ${nodes.length + 1}` : language === 'en' ? `New Technique ${nodes.length + 1}` : `Nova Técnica ${nodes.length + 1}` },
      style: {
        background: '#13131a',
        color: '#e9e9ee',
        border: '2px solid #ea384c',
        borderRadius: '14px',
        padding: '10px 20px',
        width: 150,
        textAlign: 'center',
        animation: 'bounce-in 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55)',
      },
    }
    console.log('[FlowEditor] Adding new node:', newNode)
    setNodes((nds) => {
      const updatedNodes = [...nds, newNode]
      console.log('[FlowEditor] Updated nodes:', updatedNodes)
      return updatedNodes
    })
    
    // 成功フィードバック
    toast.success(
      language === 'ja' ? 'ノードを追加しました' :
      language === 'en' ? 'Node added' :
      'Nó adicionado',
      { duration: 2000 }
    )
  }

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

    const flowData = {
      name: flowName,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
    }
    
    // LocalStorageに保存（Supabaseのflows tableが準備できるまでの暫定対応）
    const savedFlows = JSON.parse(localStorage.getItem('bjj-flows') || '[]')
    savedFlows.push(flowData)
    localStorage.setItem('bjj-flows', JSON.stringify(savedFlows))
    
    const successMsg = {
      ja: 'フローをローカルに保存しました',
      en: 'Flow saved locally',
      pt: 'Fluxo salvo com sucesso'
    }
    toast.success(successMsg[language as keyof typeof successMsg], {
      icon: '✓',
      style: {
        background: 'linear-gradient(135deg, #1a1a23 0%, #2a2a33 100%)',
        color: '#fff',
        border: '1px solid #ea384c',
      },
      duration: 3000,
    })
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
    <main className="min-h-screen bg-bjj-bg">
      <DashboardNav />
      
      {/* Beta Banner */}
      <div className="p-4 bg-yellow-500/10 border-b border-yellow-500/20">
        <div className="container mx-auto">
          <div className="flex items-center gap-2">
            <span className="text-yellow-400 font-semibold">
              {language === 'ja' ? '🚧 ベータ版機能' : language === 'en' ? '🚧 Beta Feature' : '🚧 Recurso Beta'}
            </span>
          </div>
          <p className="text-sm text-yellow-200 mt-1">
            {language === 'ja' 
              ? 'フローエディタは現在開発中です。保存機能は一部制限されており、予期しない動作が発生する可能性があります。' 
              : language === 'en'
              ? 'The Flow Editor is currently under development. Save functionality is limited and unexpected behavior may occur.'
              : 'O Editor de Fluxo está atualmente em desenvolvimento. A funcionalidade de salvamento é limitada e comportamentos inesperados podem ocorrer.'}
          </p>
          {isMobileView && (
            <p className="text-xs text-yellow-200 mt-2">
              {language === 'ja' 
                ? '📱 モバイルでは閲覧モードです。編集はPCをご利用ください。' 
                : language === 'en'
                ? '📱 View-only mode on mobile. Please use a PC for editing.'
                : '📱 Modo somente visualização no celular. Use um PC para editar.'}
            </p>
          )}
        </div>
      </div>
      
      <div className="h-[calc(100vh-120px)] relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={isMobileView ? undefined : onNodesChange}
          onEdgesChange={isMobileView ? undefined : onEdgesChange}
          onConnect={isMobileView ? undefined : onConnect}
          nodesDraggable={!isMobileView}
          nodesConnectable={!isMobileView}
          elementsSelectable={!isMobileView}
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
          
          <div className="absolute top-4 left-4 bg-bjj-bg2/90 backdrop-blur-sm border border-white/10 rounded-bjj p-4">
            <div className="flex items-center gap-4 mb-4">
              <input
                type="text"
                value={flowName}
                onChange={(e) => setFlowName(e.target.value)}
                autoComplete="off"
                autoCapitalize="off"
                autoCorrect="off"
                spellCheck="false"
                className="px-3 py-2 bg-bjj-bg border border-white/10 rounded-lg text-bjj-text focus:border-bjj-accent focus:outline-none"
                placeholder={language === 'ja' ? 'フロー名' : language === 'en' ? 'Flow Name' : 'Nome do Fluxo'}
              />
            </div>
            
            {!isMobileView && (
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={addNode}
                  className="btn-ghost text-sm flex items-center gap-2"
                >
                  <Plus size={16} />
                  {language === 'ja' ? 'ノード追加' : language === 'en' ? 'Add Node' : 'Adicionar Nó'}
                </button>
                
                <button
                  onClick={saveFlow}
                  className="btn-ghost text-sm flex items-center gap-2"
                >
                  <Save size={16} />
                  {language === 'ja' ? '保存' : language === 'en' ? 'Save' : 'Salvar'}
                </button>
                
                <button
                  onClick={exportFlow}
                  className="btn-ghost text-sm flex items-center gap-2"
                >
                  <Download size={16} />
                  {language === 'ja' ? 'エクスポート' : language === 'en' ? 'Export' : 'Exportar'}
                </button>
              </div>
            )}
          </div>
          
          <div className="absolute top-4 right-4 bg-bjj-bg2/90 backdrop-blur-sm border border-white/10 rounded-bjj p-4">
            <div className="text-sm space-y-2">
              <p className="text-bjj-muted">
                {language === 'ja' ? '操作方法：' : language === 'en' ? 'Controls:' : 'Controles:'}
              </p>
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
  )
}