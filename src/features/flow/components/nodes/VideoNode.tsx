// ビデオノードコンポーネント
import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { PlayCircle, Clock } from 'lucide-react'
import type { FlowNodeData } from '@/types/flow'

export function VideoNode({ data, selected }: NodeProps<FlowNodeData>) {
  const { label, video } = data
  
  // 動画の長さを計算（複数クリップの場合は合計）
  const totalDuration = video?.reduce((total, v) => {
    const start = v.startSec || 0
    const end = v.endSec || 0
    return total + (end - start)
  }, 0) || 0

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div 
      className={`relative group transition-all ${
        selected ? 'ring-2 ring-purple-400' : ''
      }`}
    >
      <Handle 
        type="target" 
        position={Position.Top} 
        className="w-3 h-3 bg-purple-500 border-2 border-white" 
      />
      
      <div className="px-4 py-3 bg-gradient-to-br from-purple-600 to-purple-700 text-white rounded-lg shadow-lg min-w-[140px]">
        <div className="flex items-center gap-2">
          <PlayCircle className="w-4 h-4" />
          <span className="text-sm font-semibold">{label}</span>
        </div>
        
        {/* クリップ情報 */}
        {video && video.length > 0 && (
          <div className="mt-1 flex items-center gap-2 text-xs">
            <span>クリップ: {video.length}</span>
            {totalDuration > 0 && (
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDuration(totalDuration)}</span>
              </div>
            )}
          </div>
        )}

        {/* タイムスタンプ（ホバー時に表示） */}
        {video && video.length > 0 && (
          <div className="absolute -bottom-auto top-full mt-1 left-1/2 -translate-x-1/2 bg-black/80 text-white text-xs px-3 py-2 rounded opacity-0 group-hover:opacity-100 transition-opacity max-w-[200px] whitespace-normal z-10">
            {video.map((v, i) => (
              <div key={i} className="mb-1 last:mb-0">
                {v.startSec && v.endSec && (
                  <span>{formatDuration(v.startSec)} - {formatDuration(v.endSec)}</span>
                )}
                {v.note && <span className="ml-2 text-gray-300">{v.note}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
      
      <Handle 
        type="source" 
        position={Position.Bottom} 
        className="w-3 h-3 bg-purple-500 border-2 border-white" 
      />
      
      {/* 再生ボタン（クリックで動画再生） */}
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
        <PlayCircle className="w-4 h-4 text-purple-600" />
      </div>
    </div>
  )
}