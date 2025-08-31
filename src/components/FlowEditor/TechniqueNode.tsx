'use client'

import React from 'react'
import { Handle, Position, NodeProps } from 'reactflow'
import { Video, Info } from 'lucide-react'

const beltColors = {
  white: '#ffffff',
  blue: '#1e40af',
  purple: '#7c3aed',
  brown: '#92400e',
  black: '#000000',
}

export type TechniqueNodeData = {
  label: string
  category?: string
  belt?: string
  difficulty?: number
  videoId?: string
  description?: string
  position?: string
  type?: 'attack' | 'defense' | 'transition' | 'position'
}

export function TechniqueNode({ data, selected }: NodeProps<TechniqueNodeData>) {
  const beltColor = data.belt ? beltColors[data.belt as keyof typeof beltColors] : '#666'
  const typeColors = {
    attack: 'from-red-500 to-red-600',
    defense: 'from-blue-500 to-blue-600',
    transition: 'from-green-500 to-green-600',
    position: 'from-purple-500 to-purple-600',
  }
  const bgGradient = data.type ? typeColors[data.type] : 'from-gray-600 to-gray-700'

  return (
    <div
      className={`relative bg-gradient-to-br ${bgGradient} rounded-xl shadow-lg transition-all duration-200 ${
        selected ? 'ring-4 ring-bjj-accent ring-opacity-50 scale-105' : ''
      } hover:shadow-xl`}
      style={{ minWidth: 200 }}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="w-3 h-3 !bg-bjj-accent border-2 border-white"
      />
      
      {/* Belt indicator */}
      <div
        className="absolute top-0 right-0 w-6 h-6 rounded-bl-xl rounded-tr-xl border-2 border-white/20"
        style={{ backgroundColor: beltColor }}
      />
      
      <div className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-white font-bold text-sm leading-tight flex-1">
            {data.label}
          </h3>
          {data.videoId && (
            <Video className="w-4 h-4 text-white/70 ml-2 flex-shrink-0" />
          )}
        </div>
        
        {data.category && (
          <div className="text-xs text-white/70 mb-1">
            {data.category}
          </div>
        )}
        
        {data.position && (
          <div className="text-xs text-white/60 italic">
            From: {data.position}
          </div>
        )}
        
        {data.difficulty && (
          <div className="flex gap-0.5 mt-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className={`w-1.5 h-1.5 rounded-full ${
                  i < (data.difficulty || 0) ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        )}
      </div>
      
      <Handle
        type="source"
        position={Position.Bottom}
        className="w-3 h-3 !bg-bjj-accent border-2 border-white"
      />
    </div>
  )
}