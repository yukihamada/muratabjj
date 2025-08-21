'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import DashboardNav from '@/components/DashboardNav'
import { ArrowLeft, Save, Calendar, Clock, Users, MapPin, FileText } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import toast from 'react-hot-toast'
import Link from 'next/link'

const translations = {
  ja: {
    title: 'スパーリングログを作成',
    partner: 'パートナー',
    partnerPlaceholder: 'パートナーの名前',
    date: '日付',
    duration: '時間（分）',
    durationPlaceholder: '例: 5',
    startingPosition: '開始ポジション',
    standing: '立ち',
    closedGuard: 'クローズドガード',
    openGuard: 'オープンガード',
    halfGuard: 'ハーフガード',
    mount: 'マウント',
    backControl: 'バックコントロール',
    sideControl: 'サイドコントロール',
    notes: 'メモ',
    notesPlaceholder: '技術、成功した動き、改善点など',
    save: '保存',
    saving: '保存中...',
    back: '戻る',
    success: 'スパーリングログを保存しました',
    error: '保存に失敗しました',
  },
  en: {
    title: 'Create Sparring Log',
    partner: 'Partner',
    partnerPlaceholder: "Partner's name",
    date: 'Date',
    duration: 'Duration (minutes)',
    durationPlaceholder: 'e.g., 5',
    startingPosition: 'Starting Position',
    standing: 'Standing',
    closedGuard: 'Closed Guard',
    openGuard: 'Open Guard',
    halfGuard: 'Half Guard',
    mount: 'Mount',
    backControl: 'Back Control',
    sideControl: 'Side Control',
    notes: 'Notes',
    notesPlaceholder: 'Techniques, successful moves, areas for improvement, etc.',
    save: 'Save',
    saving: 'Saving...',
    back: 'Back',
    success: 'Sparring log saved',
    error: 'Failed to save',
  },
  pt: {
    title: 'Criar Log de Sparring',
    partner: 'Parceiro',
    partnerPlaceholder: 'Nome do parceiro',
    date: 'Data',
    duration: 'Duração (minutos)',
    durationPlaceholder: 'ex: 5',
    startingPosition: 'Posição Inicial',
    standing: 'Em pé',
    closedGuard: 'Guarda Fechada',
    openGuard: 'Guarda Aberta',
    halfGuard: 'Meia-Guarda',
    mount: 'Montada',
    backControl: 'Controle das Costas',
    sideControl: '100 Kilos',
    notes: 'Notas',
    notesPlaceholder: 'Técnicas, movimentos bem-sucedidos, áreas para melhorar, etc.',
    save: 'Salvar',
    saving: 'Salvando...',
    back: 'Voltar',
    success: 'Log de sparring salvo',
    error: 'Falha ao salvar',
  },
}

const positions = [
  { value: 'standing', key: 'standing' },
  { value: 'closed_guard', key: 'closedGuard' },
  { value: 'open_guard', key: 'openGuard' },
  { value: 'half_guard', key: 'halfGuard' },
  { value: 'mount', key: 'mount' },
  { value: 'back_control', key: 'backControl' },
  { value: 'side_control', key: 'sideControl' },
]

export default function NewSparringLogPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations]
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    partner_name: '',
    date: new Date().toISOString().split('T')[0],
    duration: 5,
    starting_position: 'standing',
    notes: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      const { error } = await supabase.from('sparring_logs').insert({
        user_id: user.id,
        partner_name: formData.partner_name,
        date: formData.date,
        duration: formData.duration * 60, // Convert minutes to seconds
        starting_position: formData.starting_position,
        notes: formData.notes,
      })

      if (error) throw error

      toast.success(t.success)
      router.push('/dashboard/sparring')
    } catch (error) {
      console.error('Error saving sparring log:', error)
      toast.error(t.error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-bjj-bg">
      <DashboardNav />
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/sparring"
            className="inline-flex items-center gap-2 text-bjj-muted hover:text-bjj-text mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            {t.back}
          </Link>
          
          <h1 className="text-2xl md:text-3xl font-bold">{t.title}</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Partner Name */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Users className="w-4 h-4" />
              {t.partner} <span className="text-bjj-accent">*</span>
            </label>
            <input
              type="text"
              value={formData.partner_name}
              onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
              className="w-full px-4 py-3 bg-bjj-bg2 border border-white/10 rounded-lg focus:border-bjj-accent focus:outline-none text-base"
              placeholder={t.partnerPlaceholder}
              required
            />
          </div>

          {/* Date */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Calendar className="w-4 h-4" />
              {t.date}
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-3 bg-bjj-bg2 border border-white/10 rounded-lg focus:border-bjj-accent focus:outline-none text-base"
              required
            />
          </div>

          {/* Duration */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <Clock className="w-4 h-4" />
              {t.duration}
            </label>
            <input
              type="number"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-bjj-bg2 border border-white/10 rounded-lg focus:border-bjj-accent focus:outline-none text-base"
              placeholder={t.durationPlaceholder}
              min="1"
              required
            />
          </div>

          {/* Starting Position */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <MapPin className="w-4 h-4" />
              {t.startingPosition}
            </label>
            <select
              value={formData.starting_position}
              onChange={(e) => setFormData({ ...formData, starting_position: e.target.value })}
              className="w-full px-4 py-3 bg-bjj-bg2 border border-white/10 rounded-lg focus:border-bjj-accent focus:outline-none text-base"
            >
              {positions.map(pos => (
                <option key={pos.value} value={pos.value}>
                  {t[pos.key as keyof typeof t]}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <FileText className="w-4 h-4" />
              {t.notes}
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 bg-bjj-bg2 border border-white/10 rounded-lg focus:border-bjj-accent focus:outline-none text-base resize-none"
              placeholder={t.notesPlaceholder}
              rows={5}
            />
          </div>

          {/* Submit Button */}
          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={loading || !formData.partner_name}
              className="flex-1 btn-primary flex items-center justify-center gap-2 py-4 text-base"
            >
              <Save className="w-5 h-5" />
              {loading ? t.saving : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}