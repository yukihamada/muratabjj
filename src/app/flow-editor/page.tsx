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
import DashboardNav from '@/components/DashboardNav'
import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Save, Plus, Trash2, Download, Upload } from 'lucide-react'
import toast from 'react-hot-toast'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase/client'

const getInitialNodes = (language: string): Node[] => {
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
  
  return [
    {
      id: '1',
      type: 'default',
      position: { x: 250, y: 100 },
      data: { label: nodeLabels[0] },
      style: {
        background: '#13131a',
        color: '#e9e9ee',
        border: '2px solid #ea384c',
        borderRadius: '14px',
        padding: '10px 20px',
        width: 150,
        textAlign: 'center',
      },
    },
    {
      id: '2',
      position: { x: 100, y: 250 },
      data: { label: nodeLabels[1] },
      style: {
        background: '#13131a',
        color: '#e9e9ee',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px',
        padding: '10px 20px',
        width: 150,
        textAlign: 'center',
      },
    },
    {
      id: '3',
      position: { x: 400, y: 250 },
      data: { label: nodeLabels[2] },
      style: {
        background: '#13131a',
        color: '#e9e9ee',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px',
        padding: '10px 20px',
        width: 150,
        textAlign: 'center',
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
  
  const [nodes, setNodes, onNodesChange] = useNodesState(getInitialNodes(language))
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [flowName, setFlowName] = useState('')
  const [isMobileView, setIsMobileView] = useState(false)
  
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
      setIsMobileView(window.innerWidth < 768)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [language, hasInitialized])

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
          nodes: nodes,
          edges: edges,
          is_public: false,
        })
        .select()
        .single()

      if (error) {
        console.error('Error saving flow:', error)
        
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
                  onClick={(e) => {
                    e.preventDefault()
                    // Add node button clicked
                    addNode()
                  }}
                  className="btn-ghost text-sm flex items-center gap-2"
                  type="button"
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