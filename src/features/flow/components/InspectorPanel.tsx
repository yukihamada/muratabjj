// インスペクターパネルコンポーネント
import React, { useState } from 'react'
import { X, ChevronDown, ChevronUp, Video, Tag, AlertCircle, Clock } from 'lucide-react'
import { useFlowStore } from '../hooks/useFlowStore'
import { useLanguage } from '@/contexts/LanguageContext'
import type { FlowNodeData, FlowEdgeData, NodeKind, EdgeKind, Belt } from '@/types/flow'

const nodeKindLabels = {
  ja: {
    position: 'ポジション',
    technique: 'テクニック',
    checkpoint: 'チェックポイント',
    video: '動画',
  },
  en: {
    position: 'Position',
    technique: 'Technique',
    checkpoint: 'Checkpoint',
    video: 'Video',
  },
  pt: {
    position: 'Posição',
    technique: 'Técnica',
    checkpoint: 'Ponto de Verificação',
    video: 'Vídeo',
  },
}

const edgeKindLabels = {
  ja: {
    pass: 'パス',
    sweep: 'スイープ',
    submission: 'サブミッション',
    escape: 'エスケープ',
    transition: '移行',
  },
  en: {
    pass: 'Pass',
    sweep: 'Sweep',
    submission: 'Submission',
    escape: 'Escape',
    transition: 'Transition',
  },
  pt: {
    pass: 'Passagem',
    sweep: 'Raspagem',
    submission: 'Finalização',
    escape: 'Escape',
    transition: 'Transição',
  },
}

export function InspectorPanel() {
  const { language } = useLanguage()
  const { 
    nodes, 
    edges, 
    selectedNodeIds, 
    selectedEdgeIds,
    updateNode,
    updateEdge,
    showInspector,
    toggleInspector,
  } = useFlowStore()

  const [expandedSections, setExpandedSections] = useState({
    basic: true,
    video: true,
    stats: false,
    advanced: false,
  })

  const selectedNodes = nodes.filter((n: any) => selectedNodeIds.includes(n.id))
  const selectedEdges = edges.filter((e: any) => selectedEdgeIds.includes(e.id))
  const hasSelection = selectedNodes.length > 0 || selectedEdges.length > 0

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }))
  }

  if (!showInspector) return null

  return (
    <div className="absolute top-0 right-0 w-80 h-full bg-bjj-bg2 border-l border-white/10 shadow-xl overflow-y-auto">
      {/* ヘッダー */}
      <div className="sticky top-0 bg-bjj-bg2 border-b border-white/10 p-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">
          {language === 'ja' ? 'インスペクター' : 
           language === 'en' ? 'Inspector' : 
           'Inspetor'}
        </h3>
        <button
          onClick={toggleInspector}
          className="p-1 hover:bg-white/10 rounded transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!hasSelection ? (
        <div className="p-4 text-center text-bjj-muted">
          {language === 'ja' ? 'ノードまたはエッジを選択してください' :
           language === 'en' ? 'Select a node or edge' :
           'Selecione um nó ou aresta'}
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* ノード情報 */}
          {selectedNodes.length > 0 && (
            <>
              {selectedNodes.map(node => (
                <NodeInspector
                  key={node.id}
                  node={node}
                  onUpdate={(data) => updateNode(node.id, { data })}
                  language={language}
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                />
              ))}
            </>
          )}

          {/* エッジ情報 */}
          {selectedEdges.length > 0 && (
            <>
              {selectedEdges.map(edge => (
                <EdgeInspector
                  key={edge.id}
                  edge={edge}
                  onUpdate={(data) => updateEdge(edge.id, { data })}
                  language={language}
                  expandedSections={expandedSections}
                  toggleSection={toggleSection}
                />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ノードインスペクター
function NodeInspector({ 
  node, 
  onUpdate, 
  language,
  expandedSections,
  toggleSection,
}: {
  node: any
  onUpdate: (data: FlowNodeData) => void
  language: string
  expandedSections: any
  toggleSection: (section: any) => void
}) {
  const nodeKindLabel = nodeKindLabels[language as keyof typeof nodeKindLabels]
  
  return (
    <div className="space-y-3">
      {/* 基本情報 */}
      <Section
        title={language === 'ja' ? '基本情報' : language === 'en' ? 'Basic Info' : 'Informações Básicas'}
        expanded={expandedSections.basic}
        onToggle={() => toggleSection('basic')}
      >
        <div className="space-y-2">
          <Input
            label={language === 'ja' ? 'ラベル' : language === 'en' ? 'Label' : 'Rótulo'}
            value={node.data.label}
            onChange={(value) => onUpdate({ ...node.data, label: value })}
          />
          
          <Select
            label={language === 'ja' ? 'タイプ' : language === 'en' ? 'Type' : 'Tipo'}
            value={node.data.kind}
            options={Object.entries(nodeKindLabel).map(([key, label]) => ({ value: key, label }))}
            onChange={(value) => onUpdate({ ...node.data, kind: value as NodeKind })}
          />

          {node.data.kind !== 'video' && (
            <>
              <Select
                label={language === 'ja' ? '帯' : language === 'en' ? 'Belt' : 'Faixa'}
                value={node.data.belt || ''}
                options={[
                  { value: '', label: '-' },
                  { value: 'white', label: language === 'ja' ? '白帯' : language === 'en' ? 'White' : 'Branca' },
                  { value: 'blue', label: language === 'ja' ? '青帯' : language === 'en' ? 'Blue' : 'Azul' },
                  { value: 'purple', label: language === 'ja' ? '紫帯' : language === 'en' ? 'Purple' : 'Roxa' },
                  { value: 'brown', label: language === 'ja' ? '茶帯' : language === 'en' ? 'Brown' : 'Marrom' },
                  { value: 'black', label: language === 'ja' ? '黒帯' : language === 'en' ? 'Black' : 'Preta' },
                ]}
                onChange={(value) => onUpdate({ ...node.data, belt: value as Belt })}
              />

              <NumberInput
                label={language === 'ja' ? '難易度' : language === 'en' ? 'Difficulty' : 'Dificuldade'}
                value={node.data.difficulty || 3}
                min={1}
                max={5}
                onChange={(value) => onUpdate({ ...node.data, difficulty: value as 1|2|3|4|5 })}
              />
            </>
          )}

          <TagInput
            label={language === 'ja' ? 'タグ' : language === 'en' ? 'Tags' : 'Tags'}
            value={node.data.tags || []}
            onChange={(tags) => onUpdate({ ...node.data, tags })}
          />
        </div>
      </Section>

      {/* ノート */}
      {node.data.kind === 'checkpoint' && (
        <Section
          title={language === 'ja' ? 'ノート' : language === 'en' ? 'Notes' : 'Notas'}
          expanded={expandedSections.advanced}
          onToggle={() => toggleSection('advanced')}
        >
          <Textarea
            value={node.data.notes || ''}
            onChange={(value) => onUpdate({ ...node.data, notes: value })}
            placeholder={language === 'ja' ? 'メモを入力...' : language === 'en' ? 'Enter notes...' : 'Digite notas...'}
          />
        </Section>
      )}
    </div>
  )
}

// エッジインスペクター
function EdgeInspector({ 
  edge, 
  onUpdate, 
  language,
  expandedSections,
  toggleSection,
}: {
  edge: any
  onUpdate: (data: FlowEdgeData) => void
  language: string
  expandedSections: any
  toggleSection: (section: any) => void
}) {
  const edgeKindLabel = edgeKindLabels[language as keyof typeof edgeKindLabels]
  
  return (
    <div className="space-y-3">
      {/* 基本情報 */}
      <Section
        title={language === 'ja' ? '遷移情報' : language === 'en' ? 'Transition Info' : 'Informações de Transição'}
        expanded={expandedSections.basic}
        onToggle={() => toggleSection('basic')}
      >
        <div className="space-y-2">
          <Input
            label={language === 'ja' ? 'ラベル' : language === 'en' ? 'Label' : 'Rótulo'}
            value={edge.data?.label || ''}
            onChange={(value) => onUpdate({ ...edge.data, label: value })}
          />
          
          <Select
            label={language === 'ja' ? 'タイプ' : language === 'en' ? 'Type' : 'Tipo'}
            value={edge.data?.kind || 'transition'}
            options={Object.entries(edgeKindLabel).map(([key, label]) => ({ value: key, label }))}
            onChange={(value) => onUpdate({ ...edge.data, kind: value as EdgeKind })}
          />

          <NumberInput
            label={language === 'ja' ? 'リスク' : language === 'en' ? 'Risk' : 'Risco'}
            value={edge.data?.risk || 1}
            min={1}
            max={5}
            onChange={(value) => onUpdate({ ...edge.data, risk: value as 1|2|3|4|5 })}
          />

          <NumberInput
            label={language === 'ja' ? 'ポイント' : language === 'en' ? 'Points' : 'Pontos'}
            value={edge.data?.expectedPoints || 0}
            min={0}
            max={10}
            onChange={(value) => onUpdate({ ...edge.data, expectedPoints: value })}
          />
        </div>
      </Section>
    </div>
  )
}

// セクションコンポーネント
function Section({ 
  title, 
  children, 
  expanded, 
  onToggle 
}: {
  title: string
  children: React.ReactNode
  expanded: boolean
  onToggle: () => void
}) {
  return (
    <div className="border border-white/10 rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full px-3 py-2 bg-white/5 flex items-center justify-between hover:bg-white/10 transition-colors"
      >
        <span className="text-sm font-medium">{title}</span>
        {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>
      {expanded && (
        <div className="p-3">
          {children}
        </div>
      )}
    </div>
  )
}

// 入力コンポーネント
function Input({ 
  label, 
  value, 
  onChange 
}: {
  label: string
  value: string
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1">{label}</label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 rounded bg-white/10 border border-white/10 focus:border-bjj-accent focus:outline-none text-sm"
      />
    </div>
  )
}

function NumberInput({ 
  label, 
  value, 
  onChange,
  min,
  max
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1">{label}</label>
      <input
        type="number"
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        min={min}
        max={max}
        className="w-full px-2 py-1 rounded bg-white/10 border border-white/10 focus:border-bjj-accent focus:outline-none text-sm"
      />
    </div>
  )
}

function Select({ 
  label, 
  value, 
  options,
  onChange 
}: {
  label: string
  value: string
  options: Array<{ value: string; label: string }>
  onChange: (value: string) => void
}) {
  return (
    <div>
      <label className="block text-xs font-medium mb-1">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-2 py-1 rounded bg-white/10 border border-white/10 focus:border-bjj-accent focus:outline-none text-sm"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

function Textarea({ 
  value, 
  onChange,
  placeholder
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-2 py-1 rounded bg-white/10 border border-white/10 focus:border-bjj-accent focus:outline-none text-sm h-20 resize-none"
    />
  )
}

function TagInput({ 
  label,
  value, 
  onChange 
}: {
  label: string
  value: string[]
  onChange: (tags: string[]) => void
}) {
  const [inputValue, setInputValue] = useState('')

  const addTag = () => {
    if (inputValue && !value.includes(inputValue)) {
      onChange([...value, inputValue])
      setInputValue('')
    }
  }

  const removeTag = (tag: string) => {
    onChange(value.filter(t => t !== tag))
  }

  return (
    <div>
      <label className="block text-xs font-medium mb-1">{label}</label>
      <div className="flex flex-wrap gap-1 mb-2">
        {value.map(tag => (
          <span 
            key={tag}
            className="text-xs bg-bjj-accent/20 text-bjj-accent px-2 py-0.5 rounded flex items-center gap-1"
          >
            {tag}
            <button
              onClick={() => removeTag(tag)}
              className="hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTag()}
          className="flex-1 px-2 py-1 rounded bg-white/10 border border-white/10 focus:border-bjj-accent focus:outline-none text-sm"
          placeholder="gi, nogi, left..."
        />
        <button
          onClick={addTag}
          className="px-3 py-1 bg-bjj-accent text-white rounded text-sm hover:bg-bjj-accent/80 transition-colors"
        >
          <Tag className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}