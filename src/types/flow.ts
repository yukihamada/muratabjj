// フローエディタ用の型定義
import type { Node, Edge } from 'reactflow'

// 帯レベル
export type Belt = 'white' | 'blue' | 'purple' | 'brown' | 'black'

// ノードの種類
export type NodeKind = 'position' | 'technique' | 'checkpoint' | 'video'

// エッジ（遷移）の種類
export type EdgeKind = 'pass' | 'sweep' | 'submission' | 'escape' | 'transition'

// 動画参照
export type VideoRef = {
  videoId: string        // DB videos.id
  startSec?: number      // 開始秒数
  endSec?: number        // 終了秒数
  note?: string          // メモ
}

// フローノードのデータ
export type FlowNodeData = {
  kind: NodeKind
  label: string
  tags?: string[]        // 'gi','nogi','left','right','lapel'...
  belt?: Belt
  difficulty?: 1 | 2 | 3 | 4 | 5
  video?: VideoRef[]     // ノードに紐づくクリップ
  side?: 'self' | 'opponent'  // 自分側/相手側
  estimatedTime?: number      // 所要時間（秒）
  stats?: {                   // オーバーレイ用（任意）
    attempts?: number         // 試行回数
    successRate?: number      // 成功率 (0..1)
    lastPracticed?: string    // 最終練習日
  }
  notes?: string             // コーチメモ・ノート
}

// フローエッジのデータ
export type FlowEdgeData = {
  kind: EdgeKind
  label?: string
  tags?: string[]           // gi/nogi/side/variation
  expectedPoints?: number   // 試合ルール想定ポイント
  risk?: 1 | 2 | 3 | 4 | 5 // リスクレベル
  video?: VideoRef[]        // 遷移特有のクリップ
  stats?: { 
    attempts?: number 
    successRate?: number 
  }
  srsWeight?: number        // 復習優先度の重み（自動調整）
  conditions?: string[]     // 前提条件（例：「相手の腕が伸びている」）
}

// React Flow用の拡張型
export type FlowNode = Node<FlowNodeData>
export type FlowEdge = Edge<FlowEdgeData>

// フローグラフ全体
export type FlowGraph = {
  id: string
  title: string
  description?: string
  ownerId: string
  dojoId?: string          // 道場限定の場合
  visibility: 'private' | 'dojo' | 'public'
  nodes: FlowNode[]
  edges: FlowEdge[]
  tags?: string[]
  belt?: Belt              // 推奨帯レベル
  createdAt: string
  updatedAt: string
  version: number
  stats?: {
    totalNodes: number
    totalEdges: number
    totalVideos: number
    avgSuccessRate?: number
  }
}

// ドリル生成用
export type DrillItem = {
  id: string
  sequence: Array<{
    nodeId: string
    edgeId?: string
    duration?: number    // 秒
    reps?: number       // 反復回数
  }>
  totalTime: number     // 合計時間
  difficulty: number
}

// SRS（間隔反復学習）用
export type SRSCard = {
  id: string
  flowId: string
  nodeIds: string[]     // 関連ノード
  edgeIds: string[]     // 関連エッジ
  question: string
  answer: string
  difficulty: number
  interval: number      // 次回復習までの日数
  easeFactor: number    // 記憶の定着度
  lastReviewed?: string
  nextReview?: string
}

// グラフ検証結果
export type ValidationResult = {
  isValid: boolean
  errors: ValidationError[]
  warnings: ValidationWarning[]
}

export type ValidationError = {
  type: 'duplicate_edge' | 'self_loop' | 'disconnected' | 'invalid_node' | 'invalid_edge'
  nodeIds?: string[]
  edgeIds?: string[]
  message: string
}

export type ValidationWarning = {
  type: 'cycle_detected' | 'high_complexity' | 'missing_video' | 'unreachable_node'
  nodeIds?: string[]
  edgeIds?: string[]
  message: string
  suggestion?: string
}

// ヒートマップ用の統計データ
export type HeatmapData = {
  nodeId: string
  value: number          // 0-1の正規化された値
  label: string
  color?: string
}

// フィルタ条件
export type FlowFilter = {
  belt?: Belt[]
  tags?: string[]
  nodeKind?: NodeKind[]
  edgeKind?: EdgeKind[]
  hasVideo?: boolean
  minSuccessRate?: number
  maxRisk?: number
}

// ノード/エッジのスタイル定義
export const nodeStyles = {
  position: {
    background: '#4A90E2',
    color: 'white',
    border: '2px solid #2E5FA8',
  },
  technique: {
    background: '#F5A623',
    color: 'white',
    border: '2px solid #D4901E',
  },
  checkpoint: {
    background: '#7ED321',
    color: 'white',
    border: '2px solid #5DA818',
  },
  video: {
    background: '#9013FE',
    color: 'white',
    border: '2px solid #6F0FC6',
  },
} as const

export const edgeStyles = {
  pass: { stroke: '#4A90E2', strokeWidth: 2 },
  sweep: { stroke: '#F5A623', strokeWidth: 2 },
  submission: { stroke: '#D0021B', strokeWidth: 3 },
  escape: { stroke: '#7ED321', strokeWidth: 2 },
  transition: { stroke: '#9B9B9B', strokeWidth: 1, strokeDasharray: '5,5' },
} as const