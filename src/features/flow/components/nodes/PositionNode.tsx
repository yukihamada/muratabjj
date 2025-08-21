// ポジションノードコンポーネント
import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Shield } from 'lucide-react'
import type { FlowNodeData } from '@/types/flow'

export function PositionNode({ data, selected }: NodeProps<FlowNodeData>) {
  const { label, tags, belt, stats } = data

  return (
    <div 
      className={`relative group transition-all ${
        selected ? 'ring-2 ring-blue-400' : ''
      }`}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-blue-500 border-2 border-white" 
      />
      
      <div className="px-4 py-3 bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg min-w-[140px]">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span className="text-sm font-semibold">{label}</span>
        </div>
        
        {/* タグ表示 */}
        {tags && tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {tags.map((tag, i) => (
              <span 
                key={i} 
                className="text-xs bg-white/20 px-1.5 py-0.5 rounded"
              >
                {tag}
              </span>
            ))}
          </div>
        )}

        {/* 統計情報（ホバー時に表示） */}
        {stats && (
          <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            成功率: {Math.round((stats.successRate || 0) * 100)}%
          </div>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-blue-500 border-2 border-white" 
      />
      
      {/* 帯レベル表示 */}
      {belt && (
        <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
          belt === 'white' ? 'bg-white text-gray-800' :
          belt === 'blue' ? 'bg-blue-700 text-white' :
          belt === 'purple' ? 'bg-purple-700 text-white' :
          belt === 'brown' ? 'bg-amber-800 text-white' :
          'bg-black text-white'
        }`}>
          {belt[0].toUpperCase()}
        </div>
      )}
    </div>
  )
}