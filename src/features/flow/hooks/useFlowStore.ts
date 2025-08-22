// フローエディタの状態管理（Zustand）
import { create } from 'zustand'
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
      addNode: (node: FlowNode) => set((state) => ({
        nodes: [...state.nodes, node],
        isDirty: true,
      })),

      updateNode: (nodeId: string, data: Partial<FlowNode>) => set((state) => ({
        nodes: state.nodes.map((n: FlowNode) => 
          n.id === nodeId ? { ...n, ...data } : n
        ),
        isDirty: true,
      })),

      deleteNodes: (nodeIds: string[]) => set((state) => {
        const nodeIdSet = new Set(nodeIds)
        return {
          nodes: state.nodes.filter((n: FlowNode) => !nodeIdSet.has(n.id)),
          edges: state.edges.filter((e: FlowEdge) => 
            !nodeIdSet.has(e.source) && !nodeIdSet.has(e.target)
          ),
          selectedNodeIds: state.selectedNodeIds.filter((id: string) => !nodeIdSet.has(id)),
          isDirty: true,
        }
      }),

      // エッジ操作
      addEdge: (edge: FlowEdge) => set((state) => ({
        edges: [...state.edges, edge],
        isDirty: true,
      })),

      updateEdge: (edgeId: string, data: Partial<FlowEdge>) => set((state) => ({
        edges: state.edges.map((e: FlowEdge) => 
          e.id === edgeId ? { ...e, ...data } : e
        ),
        isDirty: true,
      })),

      deleteEdges: (edgeIds: string[]) => set((state) => {
        const edgeIdSet = new Set(edgeIds)
        return {
          edges: state.edges.filter((e: FlowEdge) => !edgeIdSet.has(e.id)),
          selectedEdgeIds: state.selectedEdgeIds.filter((id: string) => !edgeIdSet.has(id)),
          isDirty: true,
        }
      }),

      // 選択操作
      selectNodes: (nodeIds: string[]) => set({ 
        selectedNodeIds: nodeIds,
        selectedEdgeIds: [], // ノード選択時はエッジ選択をクリア
      }),

      selectEdges: (edgeIds: string[]) => set({ 
        selectedEdgeIds: edgeIds,
        selectedNodeIds: [], // エッジ選択時はノード選択をクリア
      }),

      clearSelection: () => set({ 
        selectedNodeIds: [],
        selectedEdgeIds: [],
      }),

      // フロー操作
      loadFlow: (flow: FlowGraph) => set({
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
          // フローの保存処理はここに実装
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

      setFlowInfo: (info: Partial<Pick<FlowGraph, 'title' | 'description' | 'visibility'>>) => set((state) => ({
        flowTitle: info.title ?? state.flowTitle,
        flowDescription: info.description ?? state.flowDescription,
        isPublic: info.visibility ? info.visibility === 'public' : state.isPublic,
        isDirty: true,
      })),

      // UI操作
      toggleEdgeCreationMode: () => set((state: FlowState) => ({ 
        isEdgeCreationMode: !state.isEdgeCreationMode 
      })),

      toggleInspector: () => set((state: FlowState) => ({ 
        showInspector: !state.showInspector 
      })),

      toggleLibrary: () => set((state: FlowState) => ({ 
        showLibrary: !state.showLibrary 
      })),

      toggleVideoModal: () => set((state: FlowState) => ({ 
        showVideoModal: !state.showVideoModal 
      })),

      toggleValidation: () => set((state: FlowState) => ({ 
        showValidation: !state.showValidation 
      })),

      // クリップボード操作
      copy: () => {
        const state = get()
        const selectedNodes = state.nodes.filter((n: FlowNode) => 
          state.selectedNodeIds.includes(n.id)
        )
        const selectedNodeIdSet = new Set(state.selectedNodeIds)
        const selectedEdges = state.edges.filter((e: FlowEdge) => 
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
        const newNodes = state.clipboard.nodes.map((node: FlowNode, index: number) => {
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
        const newEdges = state.clipboard.edges.map((edge: FlowEdge, index: number) => ({
          ...edge,
          id: `${edge.id}-${timestamp}-${index}`,
          source: idMapping.get(edge.source) || edge.source,
          target: idMapping.get(edge.target) || edge.target,
        } as FlowEdge))

        set((state) => ({
          nodes: [...state.nodes, ...newNodes],
          edges: [...state.edges, ...newEdges],
          selectedNodeIds: newNodes.map((n: FlowNode) => n.id),
          isDirty: true,
        }))
      },

      // フィルタ操作
      setFilter: (filter: Partial<FlowFilter>) => set((state) => ({
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