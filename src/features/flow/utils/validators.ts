// フローグラフの検証ロジック
import type { FlowGraph, FlowNode, FlowEdge, ValidationResult, ValidationError, ValidationWarning } from '@/types/flow'

/**
 * フローグラフ全体の検証
 */
export function validateFlowGraph(graph: FlowGraph): ValidationResult {
  const errors: ValidationError[] = []
  const warnings: ValidationWarning[] = []

  // 重複エッジのチェック
  const duplicateEdges = findDuplicateEdges(graph.edges)
  if (duplicateEdges.length > 0) {
    errors.push({
      type: 'duplicate_edge',
      edgeIds: duplicateEdges,
      message: '同じノード間に重複するエッジがあります',
    })
  }

  // 自己ループのチェック
  const selfLoops = findSelfLoops(graph.edges)
  if (selfLoops.length > 0) {
    errors.push({
      type: 'self_loop',
      edgeIds: selfLoops,
      message: '自己ループが検出されました',
    })
  }

  // 到達不可能なノードのチェック
  const unreachableNodes = findUnreachableNodes(graph.nodes, graph.edges)
  if (unreachableNodes.length > 0) {
    warnings.push({
      type: 'unreachable_node',
      nodeIds: unreachableNodes,
      message: '他のノードから到達できないノードがあります',
      suggestion: 'これらのノードへの接続を追加するか、削除を検討してください',
    })
  }

  // 循環の検出（SRS用の警告）
  const cycles = detectCycles(graph.nodes, graph.edges)
  if (cycles.length > 0) {
    warnings.push({
      type: 'cycle_detected',
      nodeIds: cycles,
      message: 'グラフに循環が含まれています',
      suggestion: 'SRS（復習システム）で使用する場合は、循環を解消することを推奨します',
    })
  }

  // 動画がないノードの警告
  const nodesWithoutVideo = graph.nodes.filter(
    node => node.data.kind !== 'position' && (!node.data.video || node.data.video.length === 0)
  )
  if (nodesWithoutVideo.length > 0) {
    warnings.push({
      type: 'missing_video',
      nodeIds: nodesWithoutVideo.map(n => n.id),
      message: '動画が設定されていないテクニックノードがあります',
    })
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * 重複エッジの検出
 */
function findDuplicateEdges(edges: FlowEdge[]): string[] {
  const edgeMap = new Map<string, string[]>()
  
  edges.forEach(edge => {
    const key = `${edge.source}-${edge.target}-${edge.data?.kind || 'default'}`
    if (!edgeMap.has(key)) {
      edgeMap.set(key, [])
    }
    edgeMap.get(key)!.push(edge.id)
  })

  const duplicates: string[] = []
  edgeMap.forEach(edgeIds => {
    if (edgeIds.length > 1) {
      duplicates.push(...edgeIds.slice(1)) // 最初の1つ以外を重複として扱う
    }
  })

  return duplicates
}

/**
 * 自己ループの検出
 */
function findSelfLoops(edges: FlowEdge[]): string[] {
  return edges
    .filter(edge => edge.source === edge.target)
    .map(edge => edge.id)
}

/**
 * 到達不可能なノードの検出
 */
function findUnreachableNodes(nodes: FlowNode[], edges: FlowEdge[]): string[] {
  if (nodes.length === 0) return []

  // 隣接リストを構築
  const adjacencyList = new Map<string, Set<string>>()
  nodes.forEach(node => adjacencyList.set(node.id, new Set()))
  
  edges.forEach(edge => {
    adjacencyList.get(edge.source)?.add(edge.target)
    // 無向グラフとして扱う（どちらの方向からも到達可能）
    adjacencyList.get(edge.target)?.add(edge.source)
  })

  // すべてのノードから探索を開始して、到達可能なノードを収集
  const allReachable = new Set<string>()
  
  nodes.forEach(startNode => {
    const visited = new Set<string>()
    const queue = [startNode.id]
    
    while (queue.length > 0) {
      const current = queue.shift()!
      if (visited.has(current)) continue
      
      visited.add(current)
      allReachable.add(current)
      
      const neighbors = adjacencyList.get(current) || new Set()
      neighbors.forEach(neighbor => {
        if (!visited.has(neighbor)) {
          queue.push(neighbor)
        }
      })
    }
  })

  // 孤立したノード（どこからも到達できない）を検出
  const unreachable: string[] = []
  nodes.forEach(node => {
    const inDegree = edges.filter(e => e.target === node.id).length
    const outDegree = edges.filter(e => e.source === node.id).length
    
    if (inDegree === 0 && outDegree === 0) {
      unreachable.push(node.id)
    }
  })

  return unreachable
}

/**
 * 循環の検出（DFSベース）
 */
function detectCycles(nodes: FlowNode[], edges: FlowEdge[]): string[] {
  const adjacencyList = new Map<string, string[]>()
  nodes.forEach(node => adjacencyList.set(node.id, []))
  edges.forEach(edge => {
    adjacencyList.get(edge.source)?.push(edge.target)
  })

  const visited = new Set<string>()
  const recursionStack = new Set<string>()
  const cycleNodes = new Set<string>()

  function dfs(nodeId: string): boolean {
    visited.add(nodeId)
    recursionStack.add(nodeId)

    const neighbors = adjacencyList.get(nodeId) || []
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) {
          cycleNodes.add(nodeId)
          return true
        }
      } else if (recursionStack.has(neighbor)) {
        cycleNodes.add(nodeId)
        cycleNodes.add(neighbor)
        return true
      }
    }

    recursionStack.delete(nodeId)
    return false
  }

  nodes.forEach(node => {
    if (!visited.has(node.id)) {
      dfs(node.id)
    }
  })

  return Array.from(cycleNodes)
}

/**
 * SRS用のDAG（非循環有向グラフ）抽出
 */
export function extractDAGForSRS(graph: FlowGraph): FlowGraph {
  const cycles = detectCycles(graph.nodes, graph.edges)
  
  if (cycles.length === 0) {
    return graph // すでにDAG
  }

  // 循環を形成するエッジを除外
  const dagEdges = graph.edges.filter(edge => {
    // 循環に含まれるノード間のエッジを除外
    return !(cycles.includes(edge.source) && cycles.includes(edge.target))
  })

  return {
    ...graph,
    edges: dagEdges,
  }
}

/**
 * ボトルネック遷移の検出（失敗率が高い箇所）
 */
export function findBottleneckTransitions(
  edges: FlowEdge[], 
  threshold: number = 0.3 // 成功率30%以下をボトルネックとする
): string[] {
  return edges
    .filter(edge => {
      const successRate = edge.data?.stats?.successRate
      return successRate !== undefined && successRate < threshold
    })
    .map(edge => edge.id)
}

/**
 * グラフの複雑度計算
 */
export function calculateGraphComplexity(graph: FlowGraph): {
  nodeCount: number
  edgeCount: number
  avgDegree: number
  maxDegree: number
  density: number
} {
  const nodeCount = graph.nodes.length
  const edgeCount = graph.edges.length
  
  // 各ノードの次数を計算
  const degrees = new Map<string, number>()
  graph.nodes.forEach(node => degrees.set(node.id, 0))
  
  graph.edges.forEach(edge => {
    degrees.set(edge.source, (degrees.get(edge.source) || 0) + 1)
    degrees.set(edge.target, (degrees.get(edge.target) || 0) + 1)
  })
  
  const degreeValues = Array.from(degrees.values())
  const avgDegree = degreeValues.reduce((a, b) => a + b, 0) / nodeCount || 0
  const maxDegree = Math.max(...degreeValues, 0)
  
  // グラフ密度（0-1）
  const maxPossibleEdges = nodeCount * (nodeCount - 1) / 2
  const density = maxPossibleEdges > 0 ? edgeCount / maxPossibleEdges : 0
  
  return {
    nodeCount,
    edgeCount,
    avgDegree,
    maxDegree,
    density,
  }
}