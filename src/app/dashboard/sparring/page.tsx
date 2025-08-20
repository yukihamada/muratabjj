'use client'

import { useState, useEffect, useRef } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { useLanguage } from '@/contexts/LanguageContext'
import { Plus, Calendar, Clock, Trophy, TrendingUp, Users, X, Play, Pause, RotateCcw } from 'lucide-react'
import toast from 'react-hot-toast'
import DashboardNav from '@/components/DashboardNav'
import SparringEventLogger from '@/components/SparringEventLogger'

interface SparringLog {
  id: string
  partner_name: string | null
  duration: number
  starting_position: string | null
  notes: string | null
  date: string
  created_at: string
  events?: SparringEvent[]
}

interface SparringEvent {
  id: string
  timestamp: number
  event_type: string
  position_from: string | null
  position_to: string | null
  technique_used: string | null
  success: boolean
  notes: string | null
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

export default function SparringPage() {
  const { user } = useAuth()
  const { language } = useLanguage()
  const [logs, setLogs] = useState<SparringLog[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewLog, setShowNewLog] = useState(false)
  const [selectedLog, setSelectedLog] = useState<SparringLog | null>(null)
  const [stats, setStats] = useState({
    totalSessions: 0,
    totalDuration: 0,
    submissionRate: 0,
    sweepRate: 0,
  })

  // Timer state
  const [isTimerRunning, setIsTimerRunning] = useState(false)
  const [timerSeconds, setTimerSeconds] = useState(0)
  const [activeLogId, setActiveLogId] = useState<string | null>(null)
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // New log form state
  const [formData, setFormData] = useState({
    partner_name: '',
    duration: 300, // 5 minutes default
    starting_position: 'standing',
    date: new Date().toISOString().split('T')[0],
    notes: '',
  })

  useEffect(() => {
    if (user) {
      fetchSparringLogs()
    }
  }, [user])

  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) {
        clearInterval(timerIntervalRef.current)
      }
    }
  }, [])

  const fetchSparringLogs = async () => {
    try {
      // Use Supabase client directly for now
      const { data, error } = await supabase
        .from('sparring_logs')
        .select(`
          *,
          events:sparring_events(*)
        `)
        .eq('user_id', user!.id)
        .order('date', { ascending: false })

      if (error) {
        console.error('Supabase error:', error)
        // Check if it's because the table is empty
        if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
          setLogs([])
          calculateStats([])
          return
        }
        throw error
      }

      setLogs(data || [])
      calculateStats(data || [])
    } catch (error) {
      console.error('Error fetching sparring logs:', error)
      // Only show error if it's not an empty table issue
      if (!(error as any).message?.includes('relation') && !(error as any).message?.includes('does not exist')) {
        toast.error(
          language === 'ja' ? 'スパーログの取得に失敗しました' :
          language === 'en' ? 'Failed to fetch sparring logs' :
          'Falha ao buscar registros de sparring'
        )
      }
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (logs: SparringLog[]) => {
    const totalSessions = logs.length
    const totalDuration = logs.reduce((sum, log) => sum + log.duration, 0)
    
    let totalSubmissions = 0
    let totalSweeps = 0
    let totalEvents = 0

    logs.forEach(log => {
      if (log.events) {
        log.events.forEach(event => {
          if (event.success) {
            totalEvents++
            if (event.event_type === 'submission') totalSubmissions++
            if (event.event_type === 'sweep') totalSweeps++
          }
        })
      }
    })

    setStats({
      totalSessions,
      totalDuration,
      submissionRate: totalEvents > 0 ? (totalSubmissions / totalEvents) * 100 : 0,
      sweepRate: totalEvents > 0 ? (totalSweeps / totalEvents) * 100 : 0,
    })
  }

  const startTimer = () => {
    setIsTimerRunning(true)
    timerIntervalRef.current = setInterval(() => {
      setTimerSeconds(prev => prev + 1)
    }, 1000)
  }

  const pauseTimer = () => {
    setIsTimerRunning(false)
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
  }

  const resetTimer = () => {
    setIsTimerRunning(false)
    setTimerSeconds(0)
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current)
    }
  }

  const startLiveSession = async () => {
    try {
      const { data, error } = await supabase
        .from('sparring_logs')
        .insert({
          user_id: user!.id,
          partner_name: 'Live Session',
          duration: 0,
          starting_position: 'standing',
          date: new Date().toISOString(),
          notes: 'Live recording session',
        })
        .select()
        .single()

      if (error) throw error

      setActiveLogId(data.id)
      setSelectedLog(data)
      startTimer()
      
      toast.success(
        language === 'ja' ? 'ライブセッションを開始しました' :
        language === 'en' ? 'Live session started' :
        'Sessão ao vivo iniciada'
      )
    } catch (error) {
      console.error('Error starting live session:', error)
      toast.error(
        language === 'ja' ? 'セッションの開始に失敗しました' :
        language === 'en' ? 'Failed to start session' :
        'Falha ao iniciar sessão'
      )
    }
  }

  const endLiveSession = async () => {
    if (!activeLogId) return

    pauseTimer()
    
    try {
      await supabase
        .from('sparring_logs')
        .update({ duration: timerSeconds })
        .eq('id', activeLogId)

      toast.success(
        language === 'ja' ? 'セッションを終了しました' :
        language === 'en' ? 'Session ended' :
        'Sessão finalizada'
      )
      
      setActiveLogId(null)
      resetTimer()
      fetchSparringLogs()
    } catch (error) {
      console.error('Error ending session:', error)
      toast.error(
        language === 'ja' ? 'セッションの終了に失敗しました' :
        language === 'en' ? 'Failed to end session' :
        'Falha ao finalizar sessão'
      )
    }
  }

  const createSparringLog = async () => {
    try {
      // Use Supabase client directly
      const { data, error } = await supabase
        .from('sparring_logs')
        .insert({
          user_id: user!.id,
          ...formData,
          date: new Date(formData.date).toISOString(),
        })
        .select()
        .single()

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      toast.success(
        language === 'ja' ? 'スパーログを作成しました' :
        language === 'en' ? 'Sparring log created successfully' :
        'Registro de sparring criado com sucesso'
      )
      setShowNewLog(false)
      setFormData({
        partner_name: '',
        duration: 300,
        starting_position: 'standing',
        date: new Date().toISOString().split('T')[0],
        notes: '',
      })
      fetchSparringLogs()
    } catch (error) {
      console.error('Error creating sparring log:', error)
      toast.error(
        language === 'ja' ? 'スパーログの作成に失敗しました' :
        language === 'en' ? 'Failed to create sparring log' :
        'Falha ao criar registro de sparring'
      )
    }
  }

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}時間${minutes}分`
    } else if (minutes > 0) {
      return `${minutes}分${secs > 0 ? `${secs}秒` : ''}`
    } else {
      return `${secs}秒`
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-bjj-bg">
        <DashboardNav />
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent"></div>
        </div>
      </div>
    )
  }

  const positionLabels = positions[language as keyof typeof positions]
  const eventLabels = eventTypes[language as keyof typeof eventTypes]

  return (
    <div className="min-h-screen bg-bjj-bg">
      <DashboardNav />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">
              {language === 'ja' ? 'スパーリングログ' : language === 'en' ? 'Sparring Logs' : 'Registros de Sparring'}
            </h1>
            <p className="text-bjj-muted">
              {language === 'ja' ? 'スパーリングの記録と分析' : 
               language === 'en' ? 'Track and analyze your sparring sessions' :
               'Acompanhe e analise suas sessões de sparring'}
            </p>
          </div>
          <div className="flex gap-4">
            {!activeLogId ? (
              <button
                onClick={startLiveSession}
                className="btn-primary flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                {language === 'ja' ? 'ライブセッション' : language === 'en' ? 'Live Session' : 'Sessão ao Vivo'}
              </button>
            ) : (
              <button
                onClick={endLiveSession}
                className="btn-primary bg-red-500 hover:bg-red-600 flex items-center gap-2"
              >
                <X className="w-5 h-5" />
                {language === 'ja' ? 'セッション終了' : language === 'en' ? 'End Session' : 'Finalizar Sessão'}
              </button>
            )}
            <button
              onClick={() => setShowNewLog(true)}
              className="btn-ghost flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              {language === 'ja' ? '新規記録' : language === 'en' ? 'New Log' : 'Novo Registro'}
            </button>
          </div>
        </div>

        {/* Live Timer */}
        {activeLogId && (
          <div className="bg-bjj-accent/20 border border-bjj-accent rounded-bjj p-6 mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">
                  {language === 'ja' ? 'ライブセッション進行中' : 
                   language === 'en' ? 'Live Session in Progress' : 
                   'Sessão ao Vivo em Andamento'}
                </h2>
                <div className="text-4xl font-mono font-bold text-bjj-accent">
                  {formatDuration(timerSeconds)}
                </div>
              </div>
              <div className="flex gap-2">
                {isTimerRunning ? (
                  <button
                    onClick={pauseTimer}
                    className="btn-ghost p-3"
                  >
                    <Pause className="w-6 h-6" />
                  </button>
                ) : (
                  <button
                    onClick={startTimer}
                    className="btn-ghost p-3"
                  >
                    <Play className="w-6 h-6" />
                  </button>
                )}
                <button
                  onClick={resetTimer}
                  className="btn-ghost p-3"
                >
                  <RotateCcw className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            {/* Event Logger */}
            {selectedLog && (
              <div className="mt-6">
                <SparringEventLogger 
                  sparringLogId={activeLogId}
                  onEventAdded={() => fetchSparringLogs()}
                />
              </div>
            )}
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <div className="flex items-center justify-between mb-2">
              <Users className="w-8 h-8 text-bjj-accent" />
              <span className="text-2xl font-bold">{stats.totalSessions}</span>
            </div>
            <p className="text-sm text-bjj-muted">
              {language === 'ja' ? '総セッション数' : language === 'en' ? 'Total Sessions' : 'Total de Sessões'}
            </p>
          </div>

          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <div className="flex items-center justify-between mb-2">
              <Clock className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold">{formatDuration(stats.totalDuration)}</span>
            </div>
            <p className="text-sm text-bjj-muted">
              {language === 'ja' ? '総練習時間' : language === 'en' ? 'Total Time' : 'Tempo Total'}
            </p>
          </div>

          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <div className="flex items-center justify-between mb-2">
              <Trophy className="w-8 h-8 text-green-500" />
              <span className="text-2xl font-bold">{stats.submissionRate.toFixed(0)}%</span>
            </div>
            <p className="text-sm text-bjj-muted">
              {language === 'ja' ? 'サブミッション率' : language === 'en' ? 'Submission Rate' : 'Taxa de Finalização'}
            </p>
          </div>

          <div className="card-gradient border border-white/10 rounded-bjj p-6">
            <div className="flex items-center justify-between mb-2">
              <TrendingUp className="w-8 h-8 text-purple-500" />
              <span className="text-2xl font-bold">{stats.sweepRate.toFixed(0)}%</span>
            </div>
            <p className="text-sm text-bjj-muted">
              {language === 'ja' ? 'スイープ率' : language === 'en' ? 'Sweep Rate' : 'Taxa de Raspagem'}
            </p>
          </div>
        </div>

        {/* Logs List */}
        <div className="space-y-4">
          {logs.map((log) => (
            <div 
              key={log.id} 
              className="card-gradient border border-white/10 rounded-bjj p-6 cursor-pointer hover:border-bjj-accent/50 transition-all"
              onClick={() => setSelectedLog(log)}
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    {new Date(log.date).toLocaleDateString(
                      language === 'ja' ? 'ja-JP' : language === 'pt' ? 'pt-BR' : 'en-US'
                    )} - {log.partner_name || 'Anonymous'}
                  </h3>
                  <div className="flex flex-wrap gap-4 text-sm text-bjj-muted">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {formatDuration(log.duration)}
                    </span>
                    {log.starting_position && (
                      <span>
                        {language === 'ja' ? '開始:' : language === 'en' ? 'Started:' : 'Iniciado:'} {
                          positionLabels[log.starting_position as keyof typeof positionLabels] || log.starting_position
                        }
                      </span>
                    )}
                    {log.events && log.events.length > 0 && (
                      <span>
                        {log.events.length} {language === 'ja' ? 'イベント' : language === 'en' ? 'events' : 'eventos'}
                      </span>
                    )}
                  </div>
                  {log.notes && (
                    <p className="mt-2 text-sm text-bjj-muted line-clamp-2">{log.notes}</p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {logs.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-bjj-muted mx-auto mb-4" />
            <p className="text-xl text-bjj-muted mb-2">
              {language === 'ja' ? 'まだスパーリングログがありません' :
               language === 'en' ? 'No sparring logs yet' :
               'Ainda não há registros de sparring'}
            </p>
            <p className="text-bjj-muted">
              {language === 'ja' ? '最初の記録を作成しましょう！' :
               language === 'en' ? 'Create your first log!' :
               'Crie seu primeiro registro!'}
            </p>
          </div>
        )}

        {/* New Log Modal */}
        {showNewLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-bjj-bg2 border border-white/10 rounded-bjj p-6 w-full max-w-md">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {language === 'ja' ? '新規スパーリングログ' : language === 'en' ? 'New Sparring Log' : 'Novo Registro de Sparring'}
                </h2>
                <button onClick={() => setShowNewLog(false)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ja' ? 'パートナー名' : language === 'en' ? 'Partner Name' : 'Nome do Parceiro'}
                  </label>
                  <input
                    type="text"
                    value={formData.partner_name}
                    onChange={(e) => setFormData({ ...formData, partner_name: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/10 focus:border-bjj-accent focus:outline-none"
                    placeholder={language === 'ja' ? '任意' : language === 'en' ? 'Optional' : 'Opcional'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ja' ? '日付' : language === 'en' ? 'Date' : 'Data'}
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/10 focus:border-bjj-accent focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ja' ? '時間（分）' : language === 'en' ? 'Duration (minutes)' : 'Duração (minutos)'}
                  </label>
                  <input
                    type="number"
                    value={Math.floor(formData.duration / 60)}
                    onChange={(e) => setFormData({ ...formData, duration: parseInt(e.target.value) * 60 })}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/10 focus:border-bjj-accent focus:outline-none"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ja' ? '開始ポジション' : language === 'en' ? 'Starting Position' : 'Posição Inicial'}
                  </label>
                  <select
                    value={formData.starting_position}
                    onChange={(e) => setFormData({ ...formData, starting_position: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/10 focus:border-bjj-accent focus:outline-none"
                  >
                    {Object.entries(positionLabels).map(([key, label]) => (
                      <option key={key} value={key} className="bg-bjj-bg">
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {language === 'ja' ? 'メモ' : language === 'en' ? 'Notes' : 'Notas'}
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/10 focus:border-bjj-accent focus:outline-none h-24 resize-none"
                    placeholder={language === 'ja' ? '任意のメモ' : language === 'en' ? 'Optional notes' : 'Notas opcionais'}
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={createSparringLog}
                    className="flex-1 btn-primary"
                  >
                    {language === 'ja' ? '作成' : language === 'en' ? 'Create' : 'Criar'}
                  </button>
                  <button
                    onClick={() => setShowNewLog(false)}
                    className="flex-1 btn-ghost"
                  >
                    {language === 'ja' ? 'キャンセル' : language === 'en' ? 'Cancel' : 'Cancelar'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Log Detail Modal */}
        {selectedLog && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
            <div className="bg-bjj-bg2 border border-white/10 rounded-bjj p-6 w-full max-w-2xl max-h-[80vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">
                  {language === 'ja' ? 'スパーリング詳細' : language === 'en' ? 'Sparring Details' : 'Detalhes do Sparring'}
                </h2>
                <button onClick={() => setSelectedLog(null)}>
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-bjj-muted">
                      {language === 'ja' ? '日付' : language === 'en' ? 'Date' : 'Data'}
                    </p>
                    <p className="font-medium">
                      {new Date(selectedLog.date).toLocaleDateString(
                        language === 'ja' ? 'ja-JP' : language === 'pt' ? 'pt-BR' : 'en-US'
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-bjj-muted">
                      {language === 'ja' ? 'パートナー' : language === 'en' ? 'Partner' : 'Parceiro'}
                    </p>
                    <p className="font-medium">{selectedLog.partner_name || 'Anonymous'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-bjj-muted">
                      {language === 'ja' ? '時間' : language === 'en' ? 'Duration' : 'Duração'}
                    </p>
                    <p className="font-medium">{formatDuration(selectedLog.duration)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-bjj-muted">
                      {language === 'ja' ? '開始ポジション' : language === 'en' ? 'Starting Position' : 'Posição Inicial'}
                    </p>
                    <p className="font-medium">
                      {selectedLog.starting_position && 
                        (positionLabels[selectedLog.starting_position as keyof typeof positionLabels] || selectedLog.starting_position)
                      }
                    </p>
                  </div>
                </div>

                {selectedLog.notes && (
                  <div>
                    <p className="text-sm text-bjj-muted mb-2">
                      {language === 'ja' ? 'メモ' : language === 'en' ? 'Notes' : 'Notas'}
                    </p>
                    <p className="text-sm">{selectedLog.notes}</p>
                  </div>
                )}

                {selectedLog.events && selectedLog.events.length > 0 && (
                  <div>
                    <p className="text-sm text-bjj-muted mb-2">
                      {language === 'ja' ? 'イベント' : language === 'en' ? 'Events' : 'Eventos'}
                    </p>
                    <div className="space-y-2">
                      {selectedLog.events.map((event) => (
                        <div key={event.id} className="bg-white/5 rounded-lg p-3">
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {eventLabels[event.event_type as keyof typeof eventLabels] || event.event_type}
                            </span>
                            <span className="text-sm text-bjj-muted">
                              {Math.floor(event.timestamp / 60)}:{(event.timestamp % 60).toString().padStart(2, '0')}
                            </span>
                          </div>
                          {event.technique_used && (
                            <p className="text-sm text-bjj-muted mt-1">{event.technique_used}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}