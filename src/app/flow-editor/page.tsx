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
  const { user, loading } = useAuth()
  const router = useRouter()
  const { language } = useLanguage()
  
  useEffect(() => {
    if (language === 'ja') setFlowName('新しいフロー')
    else if (language === 'en') setFlowName('New Flow')
    else if (language === 'pt') setFlowName('Novo Fluxo')
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
      position: { x: Math.random() * 500, y: Math.random() * 400 },
      data: { label: language === 'ja' ? `新しい技術 ${nodes.length + 1}` : language === 'en' ? `New Technique ${nodes.length + 1}` : `Nova Técnica ${nodes.length + 1}` },
      style: {
        background: '#13131a',
        color: '#e9e9ee',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '14px',
        padding: '10px 20px',
      },
    }
    setNodes((nds) => [...nds, newNode])
  }

  const saveFlow = () => {
    const flowData = {
      name: flowName,
      nodes,
      edges,
      createdAt: new Date().toISOString(),
    }
    
    // LocalStorageに保存（実際はSupabaseに保存）
    const savedFlows = JSON.parse(localStorage.getItem('bjj-flows') || '[]')
    savedFlows.push(flowData)
    localStorage.setItem('bjj-flows', JSON.stringify(savedFlows))
    
    const successMsg = {
      ja: 'フローを保存しました',
      en: 'Flow saved successfully',
      pt: 'Fluxo salvo com sucesso'
    }
    toast.success(successMsg[language as keyof typeof successMsg])
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
      
      <div className="h-[calc(100vh-64px)] relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
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
                className="px-3 py-2 bg-bjj-bg border border-white/10 rounded-lg text-bjj-text focus:border-bjj-accent focus:outline-none"
                placeholder={language === 'ja' ? 'フロー名' : language === 'en' ? 'Flow Name' : 'Nome do Fluxo'}
              />
            </div>
            
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