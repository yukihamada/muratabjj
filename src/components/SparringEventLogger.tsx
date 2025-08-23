'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { Plus, Trophy, ArrowRight, Target, Users, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

interface SparringEventLoggerProps {
  sparringLogId: string
  onEventAdded?: () => void
}

const eventTypes = {
  ja: {
    'guard-pass': 'パスガード',
    sweep: 'スイープ',
    submission: 'サブミッション',
    'submission-attempt': 'サブミッション試み',
    takedown: 'テイクダウン',
    'position-change': 'ポジション変更',
  },
  en: {
    'guard-pass': 'Guard Pass',
    sweep: 'Sweep',
    submission: 'Submission',
    'submission-attempt': 'Submission Attempt',
    takedown: 'Takedown',
    'position-change': 'Position Change',
  },
  pt: {
    'guard-pass': 'Passagem de Guarda',
    sweep: 'Raspagem',
    submission: 'Finalização',
    'submission-attempt': 'Tentativa de Finalização',
    takedown: 'Queda',
    'position-change': 'Mudança de Posição',
  },
}

const positions = {
  ja: {
    standing: '立技',
    guard: 'ガード',
    mount: 'マウント',
    'side-control': 'サイドコントロール',
    back: 'バック',
    turtle: 'タートル',
    'half-guard': 'ハーフガード',
  },
  en: {
    standing: 'Standing',
    guard: 'Guard',
    mount: 'Mount',
    'side-control': 'Side Control',
    back: 'Back',
    turtle: 'Turtle',
    'half-guard': 'Half Guard',
  },
  pt: {
    standing: 'Em Pé',
    guard: 'Guarda',
    mount: 'Montada',
    'side-control': 'Controle Lateral',
    back: 'Costas',
    turtle: 'Tartaruga',
    'half-guard': 'Meia-Guarda',
  },
}

export default function SparringEventLogger({ sparringLogId, onEventAdded }: SparringEventLoggerProps) {
  const { language } = useLanguage()
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    timestamp: 0,
    event_type: 'guard-pass',
    position_from: '',
    position_to: '',
    technique_used: '',
    success: true,
    notes: '',
  })

  const eventLabels = eventTypes[language as keyof typeof eventTypes]
  const positionLabels = positions[language as keyof typeof positions]

  const handleSubmit = async () => {
    try {
      const response = await fetch('/api/sparring/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sparring_log_id: sparringLogId,
          timestamp: formData.timestamp,
          event_type: formData.event_type,
          position_from: formData.position_from || null,
          position_to: formData.position_to || null,
          technique_used: formData.technique_used || null,
          success: formData.success,
          notes: formData.notes || null,
        }),
      })
      
      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.message || 'Failed to add event')
      }

      toast.success(
        language === 'ja' ? 'イベントを追加しました' :
        language === 'en' ? 'Event added' :
        'Evento adicionado'
      )

      setShowForm(false)
      setFormData({
        timestamp: 0,
        event_type: 'guard-pass',
        position_from: '',
        position_to: '',
        technique_used: '',
        success: true,
        notes: '',
      })

      if (onEventAdded) {
        onEventAdded()
      }
    } catch (error: any) {
      console.error('Error adding event:', error)
      toast.error(
        language === 'ja' ? 'イベントの追加に失敗しました: ' + (error.message || '') :
        language === 'en' ? 'Failed to add event: ' + (error.message || '') :
        'Falha ao adicionar evento: ' + (error.message || '')
      )
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="bg-white/5 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">
          {language === 'ja' ? 'イベント記録' : language === 'en' ? 'Event Logger' : 'Registro de Eventos'}
        </h3>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-ghost px-3 py-1 text-sm"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {showForm && (
        <div className="space-y-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {language === 'ja' ? 'タイムスタンプ（秒）' : language === 'en' ? 'Timestamp (seconds)' : 'Timestamp (segundos)'}
              </label>
              <input
                type="number"
                value={formData.timestamp}
                onChange={(e) => setFormData({ ...formData, timestamp: parseInt(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 focus:border-bjj-accent focus:outline-none text-sm"
                min="0"
              />
              <p className="text-xs text-bjj-muted mt-1">{formatTime(formData.timestamp)}</p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                {language === 'ja' ? 'イベントタイプ' : language === 'en' ? 'Event Type' : 'Tipo de Evento'}
              </label>
              <select
                value={formData.event_type}
                onChange={(e) => setFormData({ ...formData, event_type: e.target.value })}
                className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 focus:border-bjj-accent focus:outline-none text-sm"
              >
                {Object.entries(eventLabels).map(([key, label]) => (
                  <option key={key} value={key} className="bg-bjj-bg">
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {formData.event_type === 'position-change' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === 'ja' ? '開始ポジション' : language === 'en' ? 'From Position' : 'Posição Inicial'}
                </label>
                <select
                  value={formData.position_from}
                  onChange={(e) => setFormData({ ...formData, position_from: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 focus:border-bjj-accent focus:outline-none text-sm"
                >
                  <option value="" className="bg-bjj-bg">-</option>
                  {Object.entries(positionLabels).map(([key, label]) => (
                    <option key={key} value={key} className="bg-bjj-bg">
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {language === 'ja' ? '終了ポジション' : language === 'en' ? 'To Position' : 'Posição Final'}
                </label>
                <select
                  value={formData.position_to}
                  onChange={(e) => setFormData({ ...formData, position_to: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 focus:border-bjj-accent focus:outline-none text-sm"
                >
                  <option value="" className="bg-bjj-bg">-</option>
                  {Object.entries(positionLabels).map(([key, label]) => (
                    <option key={key} value={key} className="bg-bjj-bg">
                      {label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">
              {language === 'ja' ? '使用技術' : language === 'en' ? 'Technique Used' : 'Técnica Utilizada'}
            </label>
            <input
              type="text"
              value={formData.technique_used}
              onChange={(e) => setFormData({ ...formData, technique_used: e.target.value })}
              className="w-full px-3 py-2 rounded-lg bg-white/10 border border-white/10 focus:border-bjj-accent focus:outline-none text-sm"
              placeholder={language === 'ja' ? '例：アームバー' : language === 'en' ? 'e.g., Armbar' : 'ex: Armbar'}
            />
          </div>

          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.success}
                onChange={(e) => setFormData({ ...formData, success: e.target.checked })}
                className="w-4 h-4 rounded border-white/20 bg-white/10 text-bjj-accent focus:ring-bjj-accent"
              />
              <span className="text-sm">
                {language === 'ja' ? '成功' : language === 'en' ? 'Success' : 'Sucesso'}
              </span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSubmit}
              className="flex-1 btn-primary py-2 text-sm"
            >
              {language === 'ja' ? '追加' : language === 'en' ? 'Add' : 'Adicionar'}
            </button>
            <button
              onClick={() => setShowForm(false)}
              className="flex-1 btn-ghost py-2 text-sm"
            >
              {language === 'ja' ? 'キャンセル' : language === 'en' ? 'Cancel' : 'Cancelar'}
            </button>
          </div>
        </div>
      )}

      {/* Quick Event Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => {
            setFormData({ ...formData, event_type: 'submission', success: true })
            setShowForm(true)
          }}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-green-500/20 hover:bg-green-500/30 rounded-lg text-sm transition-colors"
        >
          <Trophy className="w-4 h-4" />
          {language === 'ja' ? 'サブミッション' : language === 'en' ? 'Submission' : 'Finalização'}
        </button>

        <button
          onClick={() => {
            setFormData({ ...formData, event_type: 'sweep', success: true })
            setShowForm(true)
          }}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg text-sm transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          {language === 'ja' ? 'スイープ' : language === 'en' ? 'Sweep' : 'Raspagem'}
        </button>

        <button
          onClick={() => {
            setFormData({ ...formData, event_type: 'guard-pass', success: true })
            setShowForm(true)
          }}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 rounded-lg text-sm transition-colors"
        >
          <Target className="w-4 h-4" />
          {language === 'ja' ? 'パスガード' : language === 'en' ? 'Guard Pass' : 'Passagem'}
        </button>

        <button
          onClick={() => {
            setFormData({ ...formData, event_type: 'takedown', success: true })
            setShowForm(true)
          }}
          className="flex items-center justify-center gap-2 px-3 py-2 bg-orange-500/20 hover:bg-orange-500/30 rounded-lg text-sm transition-colors"
        >
          <Users className="w-4 h-4" />
          {language === 'ja' ? 'テイクダウン' : language === 'en' ? 'Takedown' : 'Queda'}
        </button>
      </div>
    </div>
  )
}