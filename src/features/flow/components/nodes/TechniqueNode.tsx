// テクニックノードコンポーネント
import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Zap, Clock, Video } from 'lucide-react'
import type { FlowNodeData } from '@/types/flow'

export function TechniqueNode({ data, selected }: NodeProps<FlowNodeData>) {
  const { label, tags, difficulty, estimatedTime, video, stats } = data

  return (
    <div 
      className={`relative group transition-all ${
        selected ? 'ring-2 ring-orange-400' : ''
      }`}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-orange-500 border-2 border-white" 
      />
      
      <div className="px-4 py-3 bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg min-w-[160px]">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4" />
          <span className="text-sm font-semibold">{label}</span>
        </div>
        
        {/* 難易度表示 */}
        {difficulty && (
          <div className="mt-1 flex items-center gap-1">
            <span className="text-xs">難易度:</span>
            {[...Array(5)].map((_, i) => (
              <span 
                key={i} 
                className={`text-xs ${i < difficulty ? 'text-yellow-300' : 'text-white/30'}`}
              >
                ★
              </span>
            ))}
          </div>
        )}

        {/* タグと所要時間 */}
        <div className="mt-1 flex items-center gap-2 text-xs">
          {estimatedTime && (
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <span>{estimatedTime}秒</span>
            </div>
          )}
          {video && video.length > 0 && (
            <div className="flex items-center gap-1">
              <Video className="w-3 h-3" />
              <span>{video.length}</span>
            </div>
          )}
        </div>

        {/* 統計情報（ホバー時に表示） */}
        {stats && (
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            試行: {stats.attempts || 0}回 | 成功率: {Math.round((stats.successRate || 0) * 100)}%
          </div>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-orange-500 border-2 border-white" 
      />
      
      {/* 側表示（自分/相手） */}
      {data.side && (
        <div className={`absolute -top-2 -left-2 px-1.5 py-0.5 text-xs rounded ${
          data.side === 'self' ? 'bg-green-600' : 'bg-red-600'
        } text-white font-bold`}>
          {data.side === 'self' ? '自' : '相'}
        </div>
      )}
    </div>
  )
}