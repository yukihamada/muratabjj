// フローデータの変換・入出力ユーティリティ
import type { FlowGraph, FlowNode, FlowEdge, SRSCard, DrillItem } from '@/types/flow'

/**
 * フローグラフをJSONとして出力
 */
export function exportFlowAsJSON(graph: FlowGraph): string {
  return JSON.stringify(graph, null, 2)
}

/**
 * JSONからフローグラフをインポート
 */
export function importFlowFromJSON(json: string): FlowGraph {
  try {
    const data = JSON.parse(json)
    
    // 必須フィールドの検証
    if (!data.id || !data.title || !data.nodes || !data.edges || !data.ownerId) {
      throw new Error('Invalid flow JSON: missing required fields')
    }
    
    // バージョン互換性チェック
    if (data.version && data.version > 1) {
      console.warn('Flow was created with a newer version, some features may not work correctly')
    }
    
    return data as FlowGraph
  } catch (error) {
    throw new Error(`Failed to parse flow JSON: ${error}`)
  }
}

/**
 * フローからSRSカードを生成
 */
export function extractSRSCards(graph: FlowGraph): SRSCard[] {
  const cards: SRSCard[] = []
  
  // 各エッジから基本的なカードを生成
  graph.edges.forEach(edge => {
    const sourceNode = graph.nodes.find(n => n.id === edge.source)
    const targetNode = graph.nodes.find(n => n.id === edge.target)
    
    if (!sourceNode || !targetNode) return
    
    // エッジの種類に基づいて質問を生成
    const question = generateQuestionForEdge(sourceNode, targetNode, edge)
    const answer = generateAnswerForEdge(sourceNode, targetNode, edge)
    
    cards.push({
      id: `srs-${edge.id}`,
      flowId: graph.id,
      nodeIds: [sourceNode.id, targetNode.id],
      edgeIds: [edge.id],
      question,
      answer,
      difficulty: edge.data?.risk || 3,
      interval: 1, // 初回は1日後
      easeFactor: 2.5, // デフォルトの記憶係数
    })
  })
  
  // ボトルネック遷移は追加カードを生成
  const bottleneckEdges = graph.edges.filter(
    edge => edge.data?.stats?.successRate && edge.data.stats.successRate < 0.3
  )
  
  bottleneckEdges.forEach(edge => {
    const sourceNode = graph.nodes.find(n => n.id === edge.source)
    const targetNode = graph.nodes.find(n => n.id === edge.target)
    
    if (!sourceNode || !targetNode) return
    
    cards.push({
      id: `srs-bottleneck-${edge.id}`,
      flowId: graph.id,
      nodeIds: [sourceNode.id, targetNode.id],
      edgeIds: [edge.id],
      question: `【要注意】${sourceNode.data.label}から${targetNode.data.label}への遷移で重要なポイントは？`,
      answer: `成功率が低い遷移です。${edge.data?.conditions?.join('、') || '条件を確認してください'}`,
      difficulty: 5, // 高難度として設定
      interval: 1,
      easeFactor: 1.3, // より頻繁に復習
    })
  })
  
  return cards
}

/**
 * エッジから質問を生成
 */
function generateQuestionForEdge(
  sourceNode: FlowNode,
  targetNode: FlowNode,
  edge: FlowEdge
): string {
  const edgeType = edge.data?.kind || 'transition'
  const sourceLabel = sourceNode.data.label
  const targetLabel = targetNode.data.label
  
  const questionTemplates = {
    pass: `${sourceLabel}から${targetLabel}にパスする方法は？`,
    sweep: `${sourceLabel}から${targetLabel}へのスイープ手順は？`,
    submission: `${sourceLabel}から${targetLabel}（極め）への移行は？`,
    escape: `${sourceLabel}から${targetLabel}へエスケープする方法は？`,
    transition: `${sourceLabel}から${targetLabel}への移行方法は？`,
  }
  
  return questionTemplates[edgeType] || questionTemplates.transition
}

/**
 * エッジから回答を生成
 */
function generateAnswerForEdge(
  sourceNode: FlowNode,
  targetNode: FlowNode,
  edge: FlowEdge
): string {
  const parts: string[] = []
  
  // 基本的な遷移説明
  parts.push(`${sourceNode.data.label} → ${targetNode.data.label}`)
  
  // エッジのラベルがあれば追加
  if (edge.data?.label) {
    parts.push(`技術: ${edge.data.label}`)
  }
  
  // 条件があれば追加
  if (edge.data?.conditions && edge.data.conditions.length > 0) {
    parts.push(`条件: ${edge.data.conditions.join('、')}`)
  }
  
  // リスクレベル
  if (edge.data?.risk) {
    parts.push(`リスク: ${'★'.repeat(edge.data.risk)}`)
  }
  
  // ポイント
  if (edge.data?.expectedPoints) {
    parts.push(`ポイント: ${edge.data.expectedPoints}`)
  }
  
  return parts.join('\n')
}

/**
 * 選択したパスからドリルを生成
 */
export function generateDrillFromPath(
  nodes: FlowNode[],
  edges: FlowEdge[],
  path: string[] // ノードIDの配列
): DrillItem {
  const sequence = []
  let totalTime = 0
  
  for (let i = 0; i < path.length; i++) {
    const nodeId = path[i]
    const node = nodes.find(n => n.id === nodeId)
    
    if (!node) continue
    
    // ノードの推定時間
    const nodeDuration = node.data.estimatedTime || 30 // デフォルト30秒
    
    const item: any = {
      nodeId,
      duration: nodeDuration,
      reps: 3, // デフォルト3回
    }
    
    // エッジも含める
    if (i < path.length - 1) {
      const nextNodeId = path[i + 1]
      const edge = edges.find(
        e => e.source === nodeId && e.target === nextNodeId
      )
      
      if (edge) {
        item.edgeId = edge.id
      }
    }
    
    sequence.push(item)
    totalTime += nodeDuration * 3 // 3回分
  }
  
  // 難易度は経路の平均値
  const avgDifficulty = sequence.reduce((sum, item) => {
    const node = nodes.find(n => n.id === item.nodeId)
    return sum + (node?.data.difficulty || 3)
  }, 0) / sequence.length
  
  return {
    id: `drill-${Date.now()}`,
    sequence,
    totalTime,
    difficulty: Math.round(avgDifficulty),
  }
}

/**
 * フローグラフをMarkdown形式でエクスポート
 */
export function exportFlowAsMarkdown(graph: FlowGraph): string {
  const lines: string[] = []
  
  // ヘッダー
  lines.push(`# ${graph.title}`)
  if (graph.description) {
    lines.push(`\n${graph.description}`)
  }
  lines.push('\n---\n')
  
  // ノード一覧
  lines.push('## ポジション・技術')
  
  const nodesByKind = new Map<string, FlowNode[]>()
  graph.nodes.forEach(node => {
    const kind = node.data.kind
    if (!nodesByKind.has(kind)) {
      nodesByKind.set(kind, [])
    }
    nodesByKind.get(kind)!.push(node)
  })
  
  nodesByKind.forEach((nodes, kind) => {
    lines.push(`\n### ${kind}`)
    nodes.forEach(node => {
      lines.push(`- **${node.data.label}**`)
      if (node.data.tags && node.data.tags.length > 0) {
        lines.push(`  - タグ: ${node.data.tags.join(', ')}`)
      }
      if (node.data.difficulty) {
        lines.push(`  - 難易度: ${'★'.repeat(node.data.difficulty)}`)
      }
    })
  })
  
  // 遷移一覧
  lines.push('\n## 遷移・連携')
  
  const edgesByKind = new Map<string, FlowEdge[]>()
  graph.edges.forEach(edge => {
    const kind = edge.data?.kind || 'transition'
    if (!edgesByKind.has(kind)) {
      edgesByKind.set(kind, [])
    }
    edgesByKind.get(kind)!.push(edge)
  })
  
  edgesByKind.forEach((edges, kind) => {
    lines.push(`\n### ${kind}`)
    edges.forEach(edge => {
      const source = graph.nodes.find(n => n.id === edge.source)
      const target = graph.nodes.find(n => n.id === edge.target)
      
      if (source && target) {
        lines.push(`- ${source.data.label} → ${target.data.label}`)
        if (edge.data?.label) {
          lines.push(`  - ${edge.data.label}`)
        }
        if (edge.data?.conditions && edge.data.conditions.length > 0) {
          lines.push(`  - 条件: ${edge.data.conditions.join('、')}`)
        }
      }
    })
  })
  
  return lines.join('\n')
}

/**
 * CSVエクスポート（スプレッドシート用）
 */
export function exportFlowAsCSV(graph: FlowGraph): string {
  const rows: string[][] = []
  
  // ヘッダー
  rows.push([
    'Type',
    'Source',
    'Target',
    'Label',
    'Kind',
    'Difficulty',
    'Tags',
    'Success Rate'
  ])
  
  // ノード
  graph.nodes.forEach(node => {
    rows.push([
      'Node',
      node.id,
      '',
      node.data.label,
      node.data.kind,
      String(node.data.difficulty || ''),
      (node.data.tags || []).join(';'),
      String(node.data.stats?.successRate || ''),
    ])
  })
  
  // エッジ
  graph.edges.forEach(edge => {
    const source = graph.nodes.find(n => n.id === edge.source)
    const target = graph.nodes.find(n => n.id === edge.target)
    
    rows.push([
      'Edge',
      source?.data.label || edge.source,
      target?.data.label || edge.target,
      edge.data?.label || '',
      edge.data?.kind || 'transition',
      String(edge.data?.risk || ''),
      (edge.data?.tags || []).join(';'),
      String(edge.data?.stats?.successRate || ''),
    ])
  })
  
  // CSVフォーマットに変換
  return rows.map(row => 
    row.map(cell => {
      // セル内にカンマや改行が含まれる場合は引用符で囲む
      if (cell.includes(',') || cell.includes('\n') || cell.includes('"')) {
        return `"${cell.replace(/"/g, '""')}"`
      }
      return cell
    }).join(',')
  ).join('\n')
}