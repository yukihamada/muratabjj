'use client'

import { useState, useEffect, useCallback } from 'react'
import ReactFlow, {
  Node,
  Edge,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Handle,
  Position,
} from 'reactflow'
import 'reactflow/dist/style.css'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { Save, Plus, Trash2, Share2, Lock, Video, PlayCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const nodeTypes = {
  ja: {
    standing: '立技',
    guard: 'ガード',
    mount: 'マウント',
    'side-control': 'サイドコントロール',
    back: 'バック',
    submission: 'サブミッション',
    video: '動画',
  },
  en: {
    standing: 'Standing',
    guard: 'Guard',
    mount: 'Mount',
    'side-control': 'Side Control',
    back: 'Back',
    submission: 'Submission',
    video: 'Video',
  },
  pt: {
    standing: 'Em Pé',
    guard: 'Guarda',
    mount: 'Montada',
    'side-control': 'Controle Lateral',
    back: 'Costas',
    submission: 'Finalização',
    video: 'Vídeo',
  },
}

// Custom Video Node Component
function VideoNode({ data }: { data: any }) {
  return (
    <div className="relative">
      <Handle type="target" position={Position.Top} className="w-3 h-3" />
      <div className="px-4 py-3 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-lg shadow-lg min-w-[120px]">
        <div className="flex items-center gap-2">
          <PlayCircle className="w-4 h-4" />
          <span className="text-sm font-medium">{data.label}</span>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3" />
    </div>
  )
}

const customNodeTypes = {
  video: VideoNode,
}

const initialNodes: Node[] = [
  {
    id: '1',
    type: 'default',
    position: { x: 250, y: 25 },
    data: { label: 'Start', type: 'standing' },
    style: {
      background: '#ea384c',
      color: 'white',
      border: '2px solid #d21f33',
      borderRadius: '8px',
      padding: '10px',
      fontSize: '14px',
      fontWeight: 'bold',
    },
  },
]

const initialEdges: Edge[] = []

export default function FlowEditor() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [flowTitle, setFlowTitle] = useState('')
  const [flowDescription, setFlowDescription] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [savedFlows, setSavedFlows] = useState<any[]>([])
  const [selectedFlow, setSelectedFlow] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [videos, setVideos] = useState<any[]>([])
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<any>(null)
  const [editingNode, setEditingNode] = useState<string | null>(null)
  const [editNodeLabel, setEditNodeLabel] = useState('')

  const labels = nodeTypes[language as keyof typeof nodeTypes]

  useEffect(() => {
    if (user) {
      fetchFlows()
      fetchVideos()
    }
  }, [user])

  const fetchFlows = async () => {
    try {
      const { data, error } = await supabase
        .from('flows')
        .select('*')
        .eq('created_by', user!.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setSavedFlows(data || [])
    } catch (error) {
      console.error('Error fetching flows:', error)
    }
  }

  const fetchVideos = async () => {
    try {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      setVideos(data || [])
    } catch (error) {
      console.error('Error fetching videos:', error)
    }
  }

  const onConnect = useCallback(
    (params: Connection) => {
      if (!params.source || !params.target) return
      
      const edge: Edge = {
        id: `${params.source}-${params.target}`,
        source: params.source,
        target: params.target,
        sourceHandle: params.sourceHandle || undefined,
        targetHandle: params.targetHandle || undefined,
        markerEnd: {
          type: MarkerType.ArrowClosed,
          width: 20,
          height: 20,
          color: '#ea384c',
        },
        style: {
          strokeWidth: 2,
          stroke: '#ea384c',
        },
      }
      setEdges((eds) => addEdge(edge, eds))
    },
    [setEdges]
  )

  const addNode = (type: string = 'standing') => {
    const newNode: Node = {
      id: `node-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: 'default',
      position: { 
        x: 100 + (nodes.length * 50) % 400, 
        y: 100 + Math.floor(nodes.length / 4) * 100 
      },
      data: { label: labels[type as keyof typeof labels] || type, type },
      style: {
        background: '#1a1a1a',
        color: 'white',
        border: '2px solid #333',
        borderRadius: '8px',
        padding: '10px',
        fontSize: '14px',
      },
    }
    setNodes((nds) => [...nds, newNode])
    
    // Show feedback to user
    toast.success(
      language === 'ja' ? `ノード「${newNode.data.label}」を追加しました` :
      language === 'en' ? `Added node "${newNode.data.label}"` :
      `Nó "${newNode.data.label}" adicionado`
    )
  }

  const addVideoNode = () => {
    setShowVideoModal(true)
  }

  const confirmAddVideoNode = () => {
    if (!selectedVideo) return

    const newNode: Node = {
      id: `video-${selectedVideo.id}`,
      type: 'video',
      position: { 
        x: 100 + (nodes.length * 50) % 400, 
        y: 100 + Math.floor(nodes.length / 4) * 100 
      },
      data: { 
        label: selectedVideo[`title_${language}`] || selectedVideo.title_ja,
        type: 'video',
        video_id: selectedVideo.id,
      },
    }
    setNodes((nds) => [...nds, newNode])
    setShowVideoModal(false)
    setSelectedVideo(null)
  }

  const deleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId))
    setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
  }

  const saveFlow = async () => {
    if (!user || !flowTitle) {
      toast.error(
        language === 'ja' ? 'タイトルを入力してください' :
        language === 'en' ? 'Please enter a title' :
        'Por favor, insira um título'
      )
      return
    }

    setLoading(true)
    try {
      const flowData = {
        title: flowTitle,
        description: flowDescription,
        data: { nodes, edges },
        created_by: user.id,
        is_public: isPublic,
      }

      if (selectedFlow) {
        // Update existing flow
        const { error } = await supabase
          .from('flows')
          .update(flowData)
          .eq('id', selectedFlow)

        if (error) throw error
      } else {
        // Create new flow
        const { data, error } = await supabase
          .from('flows')
          .insert(flowData)
          .select()
          .single()

        if (error) throw error
        setSelectedFlow(data.id)
      }

      toast.success(
        language === 'ja' ? 'フローを保存しました' :
        language === 'en' ? 'Flow saved successfully' :
        'Fluxo salvo com sucesso'
      )
      fetchFlows()
    } catch (error) {
      console.error('Error saving flow:', error)
      toast.error(
        language === 'ja' ? 'フローの保存に失敗しました' :
        language === 'en' ? 'Failed to save flow' :
        'Falha ao salvar fluxo'
      )
    } finally {
      setLoading(false)
    }
  }

  const loadFlow = async (flowId: string) => {
    try {
      const { data, error } = await supabase
        .from('flows')
        .select('*')
        .eq('id', flowId)
        .single()

      if (error) throw error

      setSelectedFlow(flowId)
      setFlowTitle(data.title)
      setFlowDescription(data.description || '')
      setIsPublic(data.is_public)
      setNodes(data.data.nodes || [])
      setEdges(data.data.edges || [])
    } catch (error) {
      console.error('Error loading flow:', error)
      toast.error(
        language === 'ja' ? 'フローの読み込みに失敗しました' :
        language === 'en' ? 'Failed to load flow' :
        'Falha ao carregar fluxo'
      )
    }
  }

  const newFlow = () => {
    setSelectedFlow(null)
    setFlowTitle('')
    setFlowDescription('')
    setIsPublic(false)
    setNodes(initialNodes)
    setEdges(initialEdges)
  }

  const onNodeDoubleClick = (event: React.MouseEvent, node: Node) => {
    setEditingNode(node.id)
    setEditNodeLabel(node.data.label)
  }

  const updateNodeLabel = () => {
    if (!editingNode || !editNodeLabel.trim()) return
    
    setNodes((nds) =>
      nds.map((node) =>
        node.id === editingNode
          ? { ...node, data: { ...node.data, label: editNodeLabel.trim() } }
          : node
      )
    )
    setEditingNode(null)
    setEditNodeLabel('')
  }

  const cancelNodeEdit = () => {
    setEditingNode(null)
    setEditNodeLabel('')
  }

  return (
    <div className="flex h-full">
      {/* Sidebar */}
      <div className="w-80 bg-white/5 border-r border-white/10 p-4 overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {language === 'ja' ? 'フローエディタ' : language === 'en' ? 'Flow Editor' : 'Editor de Fluxo'}
        </h2>

        {/* Flow Details */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'ja' ? 'タイトル' : language === 'en' ? 'Title' : 'Título'}
            </label>
            <input
              type="text"
              value={flowTitle}
              onChange={(e) => setFlowTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 focus:border-bjj-accent focus:outline-none"
              placeholder={language === 'ja' ? 'フロー名' : language === 'en' ? 'Flow name' : 'Nome do fluxo'}
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              {language === 'ja' ? '説明' : language === 'en' ? 'Description' : 'Descrição'}
            </label>
            <textarea
              value={flowDescription}
              onChange={(e) => setFlowDescription(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 focus:border-bjj-accent focus:outline-none h-20 resize-none"
              placeholder={language === 'ja' ? '任意' : language === 'en' ? 'Optional' : 'Opcional'}
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="w-4 h-4 rounded border-white/20 bg-white/10 text-bjj-accent focus:ring-bjj-accent"
            />
            <span className="text-sm">
              {language === 'ja' ? '公開' : language === 'en' ? 'Public' : 'Público'}
            </span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={saveFlow}
              disabled={loading}
              className="flex-1 btn-primary py-2 text-sm flex items-center justify-center gap-2"
            >
              <Save className="w-4 h-4" />
              {loading ? (language === 'ja' ? '保存中...' : language === 'en' ? 'Saving...' : 'Salvando...') : 
               (language === 'ja' ? '保存' : language === 'en' ? 'Save' : 'Salvar')}
            </button>
            <button
              onClick={newFlow}
              className="btn-ghost py-2 text-sm"
            >
              {language === 'ja' ? '新規' : language === 'en' ? 'New' : 'Novo'}
            </button>
          </div>
        </div>

        {/* Node Types */}
        <div className="mb-6">
          <h3 className="text-sm font-medium mb-3">
            {language === 'ja' ? 'ノードを追加' : language === 'en' ? 'Add Node' : 'Adicionar Nó'}
          </h3>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(labels)
              .filter(([key]) => key !== 'video')
              .map(([key, label]) => (
              <button
                key={key}
                onClick={() => addNode(key)}
                className="px-3 py-2 text-sm bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
              >
                {label}
              </button>
            ))}
            <button
              onClick={addVideoNode}
              className="px-3 py-2 text-sm bg-purple-600/20 hover:bg-purple-600/30 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              <Video className="w-4 h-4" />
              {labels.video}
            </button>
          </div>
        </div>

        {/* Saved Flows */}
        <div>
          <h3 className="text-sm font-medium mb-3">
            {language === 'ja' ? '保存済みフロー' : language === 'en' ? 'Saved Flows' : 'Fluxos Salvos'}
          </h3>
          <div className="space-y-2">
            {savedFlows.map((flow) => (
              <button
                key={flow.id}
                onClick={() => loadFlow(flow.id)}
                className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                  selectedFlow === flow.id
                    ? 'bg-bjj-accent/20 border border-bjj-accent'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium truncate">{flow.title}</span>
                  {flow.is_public ? (
                    <Share2 className="w-3 h-3 text-bjj-muted" />
                  ) : (
                    <Lock className="w-3 h-3 text-bjj-muted" />
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Flow Canvas */}
      <div className="flex-1 bg-black/50">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onNodeDoubleClick={onNodeDoubleClick}
          nodeTypes={customNodeTypes}
          fitView
          className="bg-bjj-bg"
        >
          <Background color="#333" gap={16} />
          <Controls />
        </ReactFlow>
      </div>

      {/* Video Selection Modal */}
      {showVideoModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-bjj-bg2 rounded-bjj p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {language === 'ja' ? '動画を選択' : language === 'en' ? 'Select Video' : 'Selecionar Vídeo'}
            </h3>
            
            <div className="grid gap-3">
              {videos.map((video) => (
                <button
                  key={video.id}
                  onClick={() => setSelectedVideo(video)}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    selectedVideo?.id === video.id
                      ? 'border-bjj-accent bg-bjj-accent/10'
                      : 'border-white/10 bg-white/5 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {video.thumbnail_url && (
                      <img
                        src={video.thumbnail_url}
                        alt={video[`title_${language}`] || video.title_ja}
                        className="w-20 h-12 object-cover rounded"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-medium">
                        {video[`title_${language}`] || video.title_ja}
                      </h4>
                      {video[`description_${language}`] && (
                        <p className="text-sm text-bjj-muted mt-1">
                          {video[`description_${language}`]}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => {
                  setShowVideoModal(false)
                  setSelectedVideo(null)
                }}
                className="btn-ghost"
              >
                {language === 'ja' ? 'キャンセル' : language === 'en' ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                onClick={confirmAddVideoNode}
                disabled={!selectedVideo}
                className="btn-primary"
              >
                {language === 'ja' ? '追加' : language === 'en' ? 'Add' : 'Adicionar'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Node Edit Modal */}
      {editingNode && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-bjj-bg2 rounded-bjj p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">
              {language === 'ja' ? 'ノードを編集' : language === 'en' ? 'Edit Node' : 'Editar Nó'}
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">
                  {language === 'ja' ? 'ラベル' : language === 'en' ? 'Label' : 'Rótulo'}
                </label>
                <input
                  type="text"
                  value={editNodeLabel}
                  onChange={(e) => setEditNodeLabel(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 focus:border-bjj-accent focus:outline-none"
                  autoFocus
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      updateNodeLabel()
                    } else if (e.key === 'Escape') {
                      cancelNodeEdit()
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={cancelNodeEdit}
                className="btn-ghost"
              >
                {language === 'ja' ? 'キャンセル' : language === 'en' ? 'Cancel' : 'Cancelar'}
              </button>
              <button
                onClick={updateNodeLabel}
                disabled={!editNodeLabel.trim()}
                className="btn-primary"
              >
                {language === 'ja' ? '更新' : language === 'en' ? 'Update' : 'Atualizar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}