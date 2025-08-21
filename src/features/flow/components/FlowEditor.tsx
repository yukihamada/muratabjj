// 改善されたフローエディタコンポーネント
'use client'

import React, { useCallback, useEffect, useState } from 'react'
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  BackgroundVariant,
  ReactFlowProvider,
  SelectionMode,
} from 'reactflow'
import 'reactflow/dist/style.css'

import { useFlowStore } from '../hooks/useFlowStore'
import { useKeyboardShortcuts } from '../hooks/useKeyboardShortcuts'
import { nodeTypes } from './nodes'
import { edgeTypes } from './edges'
import { InspectorPanel } from './InspectorPanel'
import { validateFlowGraph } from '../utils/validators'
import { useLanguage } from '@/contexts/LanguageContext'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

import type { FlowNode, FlowEdge, NodeKind } from '@/types/flow'
import { 
  Save, Plus, Trash2, Share2, Lock, AlertCircle, 
  CheckCircle, Info, Eye, EyeOff, Library, Settings,
  FileJson, FileText, Keyboard
} from 'lucide-react'

// ツールバーコンポーネント
function Toolbar() {
  const { language } = useLanguage()
  const {
    flowTitle,
    isPublic,
    isDirty,
    isSaving,
    showLibrary,
    showInspector,
    showValidation,
    toggleLibrary,
    toggleInspector,
    toggleValidation,
    saveFlow,
    newFlow,
    validateFlow,
  } = useFlowStore()

  const [showShortcuts, setShowShortcuts] = useState(false)

  return (
    <>
      <Panel position="top-left" className="bg-bjj-bg2/90 backdrop-blur p-2 rounded-lg shadow-lg">
        <div className="flex items-center gap-2">
          {/* 新規/保存 */}
          <button
            onClick={newFlow}
            className="btn-ghost px-3 py-1.5 text-sm"
            title={language === 'ja' ? '新規フロー' : language === 'en' ? 'New Flow' : 'Novo Fluxo'}
          >
            <Plus className="w-4 h-4" />
          </button>
          
          <button
            onClick={saveFlow}
            disabled={isSaving || !isDirty}
            className={`px-3 py-1.5 text-sm flex items-center gap-1 rounded-lg transition-colors ${
              isDirty ? 'bg-bjj-accent text-white hover:bg-bjj-accent/80' : 
              'bg-white/10 text-white/50 cursor-not-allowed'
            }`}
            title={language === 'ja' ? '保存 (Cmd+S)' : language === 'en' ? 'Save (Cmd+S)' : 'Salvar (Cmd+S)'}
          >
            <Save className="w-4 h-4" />
            {isSaving ? (
              <span className="text-xs">
                {language === 'ja' ? '保存中...' : language === 'en' ? 'Saving...' : 'Salvando...'}
              </span>
            ) : null}
          </button>

          <div className="w-px h-6 bg-white/20" />

          {/* タイトルと公開設定 */}
          <input
            type="text"
            value={flowTitle}
            onChange={(e) => useFlowStore.getState().setFlowInfo({ title: e.target.value })}
            placeholder={language === 'ja' ? 'フロー名' : language === 'en' ? 'Flow name' : 'Nome do fluxo'}
            className="px-3 py-1.5 bg-white/10 border border-white/10 rounded-lg focus:border-bjj-accent focus:outline-none text-sm w-48"
          />

          <button
            onClick={() => useFlowStore.getState().setFlowInfo({ 
              visibility: isPublic ? 'private' : 'public' 
            })}
            className={`px-3 py-1.5 text-sm flex items-center gap-1 rounded-lg transition-colors ${
              isPublic ? 'bg-green-600/20 text-green-400 hover:bg-green-600/30' : 
              'bg-white/10 text-white/70 hover:bg-white/20'
            }`}
          >
            {isPublic ? <Share2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span className="text-xs">
              {isPublic ? 
                (language === 'ja' ? '公開' : language === 'en' ? 'Public' : 'Público') :
                (language === 'ja' ? '非公開' : language === 'en' ? 'Private' : 'Privado')
              }
            </span>
          </button>

          <div className="w-px h-6 bg-white/20" />

          {/* ツール */}
          <button
            onClick={validateFlow}
            className="btn-ghost px-3 py-1.5 text-sm"
            title={language === 'ja' ? '検証' : language === 'en' ? 'Validate' : 'Validar'}
          >
            <CheckCircle className="w-4 h-4" />
          </button>

          <button
            onClick={() => setShowShortcuts(!showShortcuts)}
            className="btn-ghost px-3 py-1.5 text-sm"
            title={language === 'ja' ? 'キーボードショートカット' : language === 'en' ? 'Keyboard Shortcuts' : 'Atalhos do Teclado'}
          >
            <Keyboard className="w-4 h-4" />
          </button>

          <div className="w-px h-6 bg-white/20" />

          {/* パネル表示切替 */}
          <button
            onClick={toggleLibrary}
            className={`btn-ghost px-3 py-1.5 text-sm ${showLibrary ? 'text-bjj-accent' : ''}`}
            title={language === 'ja' ? 'ライブラリ' : language === 'en' ? 'Library' : 'Biblioteca'}
          >
            <Library className="w-4 h-4" />
          </button>

          <button
            onClick={toggleInspector}
            className={`btn-ghost px-3 py-1.5 text-sm ${showInspector ? 'text-bjj-accent' : ''}`}
            title={language === 'ja' ? 'インスペクター' : language === 'en' ? 'Inspector' : 'Inspetor'}
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </Panel>

      {/* ショートカット一覧 */}
      {showShortcuts && (
        <Panel position="top-center" className="bg-bjj-bg2/95 backdrop-blur p-4 rounded-lg shadow-lg max-w-md">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">
              {language === 'ja' ? 'キーボードショートカット' : 
               language === 'en' ? 'Keyboard Shortcuts' : 
               'Atalhos do Teclado'}
            </h3>
            <button
              onClick={() => setShowShortcuts(false)}
              className="text-white/50 hover:text-white"
            >
              ×
            </button>
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className="flex justify-between">
              <span className="text-white/70">N</span>
              <span>{language === 'ja' ? 'ノード追加' : 'Add Node'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">E</span>
              <span>{language === 'ja' ? 'エッジ作成' : 'Create Edge'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">Delete</span>
              <span>{language === 'ja' ? '削除' : 'Delete'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">⌘/Ctrl + S</span>
              <span>{language === 'ja' ? '保存' : 'Save'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">⌘/Ctrl + C/V</span>
              <span>{language === 'ja' ? 'コピー/貼付' : 'Copy/Paste'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">⌘/Ctrl + Z</span>
              <span>{language === 'ja' ? '元に戻す' : 'Undo'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">1-4</span>
              <span>{language === 'ja' ? 'ノードタイプ' : 'Node Types'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-white/70">V</span>
              <span>{language === 'ja' ? '動画プレビュー' : 'Video Preview'}</span>
            </div>
          </div>
        </Panel>
      )}
    </>
  )
}

// ライブラリパネル
function LibraryPanel() {
  const { language } = useLanguage()
  const { showLibrary, addNode } = useFlowStore()
  
  if (!showLibrary) return null

  const nodeCategories = [
    {
      title: language === 'ja' ? 'ポジション' : language === 'en' ? 'Positions' : 'Posições',
      items: [
        { kind: 'position' as NodeKind, label: language === 'ja' ? 'クローズドガード' : 'Closed Guard' },
        { kind: 'position' as NodeKind, label: language === 'ja' ? 'オープンガード' : 'Open Guard' },
        { kind: 'position' as NodeKind, label: language === 'ja' ? 'ハーフガード' : 'Half Guard' },
        { kind: 'position' as NodeKind, label: language === 'ja' ? 'サイドコントロール' : 'Side Control' },
        { kind: 'position' as NodeKind, label: language === 'ja' ? 'マウント' : 'Mount' },
        { kind: 'position' as NodeKind, label: language === 'ja' ? 'バック' : 'Back' },
      ]
    },
    {
      title: language === 'ja' ? 'テクニック' : language === 'en' ? 'Techniques' : 'Técnicas',
      items: [
        { kind: 'technique' as NodeKind, label: language === 'ja' ? 'アームバー' : 'Armbar' },
        { kind: 'technique' as NodeKind, label: language === 'ja' ? '三角絞め' : 'Triangle' },
        { kind: 'technique' as NodeKind, label: language === 'ja' ? 'スイープ' : 'Sweep' },
        { kind: 'technique' as NodeKind, label: language === 'ja' ? 'パスガード' : 'Pass Guard' },
      ]
    },
    {
      title: language === 'ja' ? 'その他' : language === 'en' ? 'Others' : 'Outros',
      items: [
        { kind: 'checkpoint' as NodeKind, label: language === 'ja' ? 'チェックポイント' : 'Checkpoint' },
        { kind: 'video' as NodeKind, label: language === 'ja' ? '動画' : 'Video' },
      ]
    }
  ]

  const createNode = (kind: NodeKind, label: string) => {
    const id = `${kind}-${Date.now()}`
    const newNode: FlowNode = {
      id,
      type: kind,
      position: { x: 250, y: 250 },
      data: {
        kind,
        label,
        tags: [],
      }
    }
    addNode(newNode)
  }

  return (
    <div className="absolute top-0 left-0 w-64 h-full bg-bjj-bg2 border-r border-white/10 shadow-xl overflow-y-auto">
      <div className="sticky top-0 bg-bjj-bg2 border-b border-white/10 p-4">
        <h3 className="text-lg font-semibold">
          {language === 'ja' ? 'ライブラリ' : language === 'en' ? 'Library' : 'Biblioteca'}
        </h3>
      </div>
      
      <div className="p-4 space-y-4">
        {nodeCategories.map((category, i) => (
          <div key={i}>
            <h4 className="text-sm font-medium mb-2 text-white/70">{category.title}</h4>
            <div className="grid gap-2">
              {category.items.map((item, j) => (
                <button
                  key={j}
                  onClick={() => createNode(item.kind, item.label)}
                  className="text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-lg transition-colors text-sm"
                  draggable
                  onDragStart={(e) => {
                    e.dataTransfer.effectAllowed = 'copy'
                    e.dataTransfer.setData('application/reactflow', JSON.stringify(item))
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// バリデーション結果パネル
function ValidationPanel() {
  const { language } = useLanguage()
  const { nodes, edges, showValidation, toggleValidation } = useFlowStore()
  
  if (!showValidation) return null

  const graph = {
    id: 'temp',
    title: 'temp',
    ownerId: 'temp',
    visibility: 'private' as const,
    nodes,
    edges,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    version: 1,
  }

  const validation = validateFlowGraph(graph)

  return (
    <Panel position="bottom-left" className="bg-bjj-bg2/95 backdrop-blur p-4 rounded-lg shadow-lg max-w-md max-h-64 overflow-y-auto">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold flex items-center gap-2">
          {validation.isValid ? (
            <CheckCircle className="w-5 h-5 text-green-500" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500" />
          )}
          {language === 'ja' ? '検証結果' : language === 'en' ? 'Validation Results' : 'Resultados da Validação'}
        </h3>
        <button
          onClick={toggleValidation}
          className="text-white/50 hover:text-white"
        >
          ×
        </button>
      </div>

      {validation.errors.length === 0 && validation.warnings.length === 0 ? (
        <p className="text-green-400 text-sm">
          {language === 'ja' ? 'エラーはありません' : language === 'en' ? 'No errors found' : 'Nenhum erro encontrado'}
        </p>
      ) : (
        <div className="space-y-3">
          {validation.errors.map((error, i) => (
            <div key={i} className="text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-red-400">{error.message}</p>
                  {error.nodeIds && (
                    <p className="text-white/50 text-xs mt-1">
                      Nodes: {error.nodeIds.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {validation.warnings.map((warning, i) => (
            <div key={i} className="text-sm">
              <div className="flex items-start gap-2">
                <Info className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-yellow-400">{warning.message}</p>
                  {warning.suggestion && (
                    <p className="text-white/50 text-xs mt-1">{warning.suggestion}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  )
}

// メインコンポーネント
function FlowEditorContent() {
  const { user } = useAuth()
  const {
    nodes,
    edges,
    selectedNodeIds,
    addNode,
    addEdge,
    updateNode,
    deleteNodes,
    selectNodes,
    selectEdges,
    clearSelection,
    copy,
    paste,
    saveFlow,
  } = useFlowStore()

  const [reactFlowNodes, setNodes, onNodesChange] = useNodesState(nodes)
  const [reactFlowEdges, setEdges, onEdgesChange] = useEdgesState(edges)

  // Zustand storeとReact Flowの同期
  useEffect(() => {
    setNodes(nodes)
  }, [nodes, setNodes])

  useEffect(() => {
    setEdges(edges)
  }, [edges, setEdges])

  // ノード選択時の処理
  const onSelectionChange = useCallback(({ nodes, edges }: { nodes: any[], edges: any[] }) => {
    if (nodes.length > 0) {
      selectNodes(nodes.map(n => n.id))
    } else if (edges.length > 0) {
      selectEdges(edges.map(e => e.id))
    } else {
      clearSelection()
    }
  }, [selectNodes, selectEdges, clearSelection])

  // エッジ接続時の処理
  const onConnect = useCallback((params: Connection) => {
    if (!params.source || !params.target) return
    
    const edge: FlowEdge = {
      id: `${params.source}-${params.target}-${Date.now()}`,
      source: params.source,
      target: params.target,
      type: 'custom',
      data: {
        kind: 'transition',
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
      },
    }
    
    addEdge(edge)
  }, [addEdge])

  // ドロップ時の処理
  const onDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    
    const reactFlowBounds = event.currentTarget.getBoundingClientRect()
    const data = event.dataTransfer.getData('application/reactflow')
    
    if (data) {
      const { kind, label } = JSON.parse(data)
      const position = {
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      }
      
      const newNode: FlowNode = {
        id: `${kind}-${Date.now()}`,
        type: kind,
        position,
        data: {
          kind,
          label,
          tags: [],
        }
      }
      
      addNode(newNode)
    }
  }, [addNode])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = 'copy'
  }, [])

  // キーボードショートカット
  useKeyboardShortcuts({
    onAddNode: (type) => {
      const nodeKindMap: Record<string, NodeKind> = {
        position: 'position',
        technique: 'technique',
        checkpoint: 'checkpoint',
        video: 'video',
      }
      
      const kind = nodeKindMap[type] || 'position'
      const newNode: FlowNode = {
        id: `${kind}-${Date.now()}`,
        type: kind,
        position: { x: 250, y: 250 },
        data: {
          kind,
          label: kind.charAt(0).toUpperCase() + kind.slice(1),
          tags: [],
        }
      }
      addNode(newNode)
    },
    onDeleteNode: deleteNodes,
    onCopy: copy,
    onPaste: paste,
    onSave: saveFlow,
    selectedNodes: nodes.filter(n => selectedNodeIds.includes(n.id)),
  })

  return (
    <div className="relative w-full h-full bg-bjj-bg">
      <ReactFlow
        nodes={reactFlowNodes}
        edges={reactFlowEdges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onDrop={onDrop}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        className="bg-bjj-bg"
        selectionMode={SelectionMode.Partial}
        selectNodesOnDrag={false}
      >
        <Background 
          color="#333" 
          gap={20} 
          variant={BackgroundVariant.Dots}
        />
        <Controls className="bg-bjj-bg2/90 backdrop-blur rounded-lg shadow-lg" />
        <MiniMap 
          className="bg-bjj-bg2/90 backdrop-blur rounded-lg shadow-lg"
          nodeColor={(node: any) => {
            const colorMap = {
              position: '#3B82F6',
              technique: '#F59E0B',
              checkpoint: '#10B981',
              video: '#8B5CF6',
            }
            return colorMap[node.type as keyof typeof colorMap] || '#6B7280'
          }}
        />
        <Toolbar />
      </ReactFlow>
      
      <LibraryPanel />
      <InspectorPanel />
      <ValidationPanel />
    </div>
  )
}

// メインエクスポート
export default function FlowEditor() {
  return (
    <ReactFlowProvider>
      <FlowEditorContent />
    </ReactFlowProvider>
  )
}