// チェックポイントノードコンポーネント
import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Flag, AlertCircle } from 'lucide-react'
import type { FlowNodeData } from '@/types/flow'

export function CheckpointNode({ data, selected }: NodeProps<FlowNodeData>) {
  const { label, notes, tags } = data

  return (
    <div 
      className={`relative group transition-all ${
        selected ? 'ring-2 ring-green-400' : ''
      }`}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-green-500 border-2 border-white" 
      />
      
      <div className="px-4 py-3 bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg min-w-[120px]">
        <div className="flex items-center gap-2">
          <Flag className="w-4 h-4" />
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

        {/* ノートアイコン（ノートがある場合） */}
        {notes && (
          <div className="absolute -top-2 -right-2">
            <AlertCircle className="w-4 h-4 text-yellow-300" />
          </div>
        )}

        {/* ノート内容（ホバー時に表示） */}
        {notes && (
          <div className="absolute -bottom-16 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity max-w-[200px] whitespace-normal">
            {notes}
          </div>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-green-500 border-2 border-white" 
      />
    </div>
  )
}