// フローエディタの状態管理（Zustand）
import create from 'zustand'
import type { FlowNode, FlowEdge, FlowGraph, FlowFilter } from '@/types/flow'
import { Node, Edge } from 'reactflow'

interface FlowState {
  // 基本状態
  nodes: FlowNode[]
  edges: FlowEdge[]
  selectedNodeIds: string[]
  selectedEdgeIds: string[]
  
  // フロー情報
  flowId: string | null
  flowTitle: string
  flowDescription: string
  isPublic: boolean
  isDirty: boolean
  
  // UI状態
  isLoading: boolean
  isSaving: boolean
  isEdgeCreationMode: boolean
  showInspector: boolean
  showLibrary: boolean
  showVideoModal: boolean
  showValidation: boolean
  
  // フィルタ
  filter: FlowFilter
  
  // クリップボード
  clipboard: {
    nodes: FlowNode[]
    edges: FlowEdge[]
  } | null
}

interface FlowActions {
  // ノード操作
  addNode: (node: FlowNode) => void
  updateNode: (nodeId: string, data: Partial<FlowNode>) => void
  deleteNodes: (nodeIds: string[]) => void
  
  // エッジ操作
  addEdge: (edge: FlowEdge) => void
  updateEdge: (edgeId: string, data: Partial<FlowEdge>) => void
  deleteEdges: (edgeIds: string[]) => void
  
  // 選択操作
  selectNodes: (nodeIds: string[]) => void
  selectEdges: (edgeIds: string[]) => void
  clearSelection: () => void
  
  // フロー操作
  loadFlow: (flow: FlowGraph) => void
  saveFlow: () => Promise<void>
  newFlow: () => void
  setFlowInfo: (info: Partial<Pick<FlowGraph, 'title' | 'description' | 'visibility'>>) => void
  
  // UI操作
  toggleEdgeCreationMode: () => void
  toggleInspector: () => void
  toggleLibrary: () => void
  toggleVideoModal: () => void
  toggleValidation: () => void
  
  // クリップボード操作
  copy: () => void
  paste: (position?: { x: number; y: number }) => void
  
  // フィルタ操作
  setFilter: (filter: Partial<FlowFilter>) => void
  clearFilter: () => void
  
  // 整合性チェック
  validateFlow: () => void
}

export const useFlowStore = create<FlowState & FlowActions>((set, get) => ({
      // 初期状態
      nodes: [],
      edges: [],
      selectedNodeIds: [],
      selectedEdgeIds: [],
      flowId: null,
      flowTitle: '',
      flowDescription: '',
      isPublic: false,
      isDirty: false,
      isLoading: false,
      isSaving: false,
      isEdgeCreationMode: false,
      showInspector: true,
      showLibrary: true,
      showVideoModal: false,
      showValidation: false,
      filter: {},
      clipboard: null,

      // ノード操作
      addNode: (node) => set((state) => ({
        nodes: [...state.nodes, node],
        isDirty: true,
      })),

      updateNode: (nodeId, data) => set((state) => ({
        nodes: state.nodes.map(n => 
          n.id === nodeId ? { ...n, ...data } : n
        ),
        isDirty: true,
      })),

      deleteNodes: (nodeIds) => set((state) => {
        const nodeIdSet = new Set(nodeIds)
        return {
          nodes: state.nodes.filter(n => !nodeIdSet.has(n.id)),
          edges: state.edges.filter(e => 
            !nodeIdSet.has(e.source) && !nodeIdSet.has(e.target)
          ),
          selectedNodeIds: state.selectedNodeIds.filter(id => !nodeIdSet.has(id)),
          isDirty: true,
        }
      }),

      // エッジ操作
      addEdge: (edge) => set((state) => ({
        edges: [...state.edges, edge],
        isDirty: true,
      })),

      updateEdge: (edgeId, data) => set((state) => ({
        edges: state.edges.map(e => 
          e.id === edgeId ? { ...e, ...data } : e
        ),
        isDirty: true,
      })),

      deleteEdges: (edgeIds) => set((state) => {
        const edgeIdSet = new Set(edgeIds)
        return {
          edges: state.edges.filter(e => !edgeIdSet.has(e.id)),
          selectedEdgeIds: state.selectedEdgeIds.filter(id => !edgeIdSet.has(id)),
          isDirty: true,
        }
      }),

      // 選択操作
      selectNodes: (nodeIds) => set({ 
        selectedNodeIds: nodeIds,
        selectedEdgeIds: [], // ノード選択時はエッジ選択をクリア
      }),

      selectEdges: (edgeIds) => set({ 
        selectedEdgeIds: edgeIds,
        selectedNodeIds: [], // エッジ選択時はノード選択をクリア
      }),

      clearSelection: () => set({ 
        selectedNodeIds: [],
        selectedEdgeIds: [],
      }),

      // フロー操作
      loadFlow: (flow) => set({
        flowId: flow.id,
        flowTitle: flow.title,
        flowDescription: flow.description || '',
        isPublic: flow.visibility === 'public',
        nodes: flow.nodes,
        edges: flow.edges,
        isDirty: false,
        selectedNodeIds: [],
        selectedEdgeIds: [],
      }),

      saveFlow: async () => {
        set({ isSaving: true })
        try {
          const state = get()
          // TODO: 実際の保存処理を実装
          console.log('Saving flow:', {
            id: state.flowId,
            title: state.flowTitle,
            nodes: state.nodes,
            edges: state.edges,
          })
          set({ isDirty: false })
        } finally {
          set({ isSaving: false })
        }
      },

      newFlow: () => set({
        flowId: null,
        flowTitle: '',
        flowDescription: '',
        isPublic: false,
        nodes: [],
        edges: [],
        isDirty: false,
        selectedNodeIds: [],
        selectedEdgeIds: [],
      }),

      setFlowInfo: (info) => set((state) => ({
        flowTitle: info.title ?? state.flowTitle,
        flowDescription: info.description ?? state.flowDescription,
        isPublic: info.visibility ? info.visibility === 'public' : state.isPublic,
        isDirty: true,
      })),

      // UI操作
      toggleEdgeCreationMode: () => set((state) => ({ 
        isEdgeCreationMode: !state.isEdgeCreationMode 
      })),

      toggleInspector: () => set((state) => ({ 
        showInspector: !state.showInspector 
      })),

      toggleLibrary: () => set((state) => ({ 
        showLibrary: !state.showLibrary 
      })),

      toggleVideoModal: () => set((state) => ({ 
        showVideoModal: !state.showVideoModal 
      })),

      toggleValidation: () => set((state) => ({ 
        showValidation: !state.showValidation 
      })),

      // クリップボード操作
      copy: () => {
        const state = get()
        const selectedNodes = state.nodes.filter(n => 
          state.selectedNodeIds.includes(n.id)
        )
        const selectedNodeIdSet = new Set(state.selectedNodeIds)
        const selectedEdges = state.edges.filter(e => 
          selectedNodeIdSet.has(e.source) && selectedNodeIdSet.has(e.target)
        )
        
        set({
          clipboard: {
            nodes: selectedNodes,
            edges: selectedEdges,
          }
        })
      },

      paste: (position = { x: 100, y: 100 }) => {
        const state = get()
        if (!state.clipboard) return

        // 新しいIDマッピング
        const idMapping = new Map<string, string>()
        const timestamp = Date.now()

        // ノードをコピー
        const newNodes = state.clipboard.nodes.map((node, index) => {
          const newId = `${node.id}-${timestamp}-${index}`
          idMapping.set(node.id, newId)
          
          return {
            ...node,
            id: newId,
            position: {
              x: node.position.x + position.x,
              y: node.position.y + position.y,
            }
          } as FlowNode
        })

        // エッジをコピー（新しいIDに更新）
        const newEdges = state.clipboard.edges.map((edge, index) => ({
          ...edge,
          id: `${edge.id}-${timestamp}-${index}`,
          source: idMapping.get(edge.source) || edge.source,
          target: idMapping.get(edge.target) || edge.target,
        } as FlowEdge))

        set((state) => ({
          nodes: [...state.nodes, ...newNodes],
          edges: [...state.edges, ...newEdges],
          selectedNodeIds: newNodes.map(n => n.id),
          isDirty: true,
        }))
      },

      // フィルタ操作
      setFilter: (filter) => set((state) => ({
        filter: { ...state.filter, ...filter }
      })),

      clearFilter: () => set({ filter: {} }),

      // 整合性チェック
      validateFlow: () => {
        // TODO: validators.tsを使用した検証処理
        set({ showValidation: true })
      },
    })
)