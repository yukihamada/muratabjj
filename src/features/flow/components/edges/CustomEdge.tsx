// カスタムエッジコンポーネント
import React from 'react'
import { 
  BaseEdge, 
  EdgeProps, 
  getBezierPath, 
  EdgeLabelRenderer,
  MarkerType 
} from 'reactflow'
import { AlertTriangle, Star } from 'lucide-react'
import type { FlowEdgeData } from '@/types/flow'

const edgeStyles = {
  pass: { 
    stroke: '#3B82F6', 
    strokeWidth: 2,
    strokeDasharray: undefined,
    markerColor: '#3B82F6',
    bgColor: 'bg-blue-500',
  },
  sweep: { 
    stroke: '#F59E0B', 
    strokeWidth: 2,
    strokeDasharray: undefined,
    markerColor: '#F59E0B',
    bgColor: 'bg-orange-500',
  },
  submission: { 
    stroke: '#EF4444', 
    strokeWidth: 3,
    strokeDasharray: undefined,
    markerColor: '#EF4444',
    bgColor: 'bg-red-500',
  },
  escape: { 
    stroke: '#10B981', 
    strokeWidth: 2,
    strokeDasharray: undefined,
    markerColor: '#10B981',
    bgColor: 'bg-green-500',
  },
  transition: { 
    stroke: '#6B7280', 
    strokeWidth: 1,
    strokeDasharray: '5,5',
    markerColor: '#6B7280',
    bgColor: 'bg-gray-500',
  },
} as const

export function CustomEdge({ 
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<FlowEdgeData>) {
  const edgeKind = data?.kind || 'transition'
  const style = edgeStyles[edgeKind]
  
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  // 成功率に基づくエッジの透明度
  const opacity = data?.stats?.successRate !== undefined 
    ? 0.4 + (data.stats.successRate * 0.6) 
    : 1

  return (
    <>
      <BaseEdge 
        id={id}
        path={edgePath}
        style={{
          stroke: style.stroke,
          strokeWidth: selected ? style.strokeWidth + 1 : style.strokeWidth,
          strokeDasharray: style.strokeDasharray,
          opacity,
        }}
        markerEnd={MarkerType.ArrowClosed}
      />
      
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
          {/* メインラベル */}
          <div className={`
            px-2 py-1 rounded text-xs font-medium text-white shadow-lg
            flex items-center gap-1 ${style.bgColor}
            ${selected ? 'ring-2 ring-white' : ''}
          `}>
            {/* リスクインジケーター */}
            {data?.risk && data.risk >= 4 && (
              <AlertTriangle className="w-3 h-3 text-yellow-300" />
            )}
            
            {/* ラベル */}
            {data?.label || edgeKind}
            
            {/* ポイント表示 */}
            {data?.expectedPoints && (
              <span className="ml-1 font-bold">+{data.expectedPoints}</span>
            )}
          </div>

          {/* 統計情報（選択時に表示） */}
          {selected && data?.stats && (
            <div className="absolute top-full mt-1 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
              試行: {data.stats.attempts || 0}回 | 
              成功率: {Math.round((data.stats.successRate || 0) * 100)}%
            </div>
          )}

          {/* タグ表示 */}
          {data?.tags && data.tags.length > 0 && (
            <div className="absolute -top-5 left-1/2 -translate-x-1/2 flex gap-1">
              {data.tags.map((tag, i) => (
                <span 
                  key={i}
                  className="text-xs bg-black/60 text-white px-1.5 py-0.5 rounded"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* SRS重み表示（高い場合） */}
          {data?.srsWeight && data.srsWeight > 1.5 && (
            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2">
              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
            </div>
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}