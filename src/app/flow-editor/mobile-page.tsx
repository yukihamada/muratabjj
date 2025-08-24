'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Info, Grid3X3, List } from 'lucide-react'
import DashboardNav from '@/components/DashboardNav'
import { useAuth } from '@/hooks/useAuth'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

// モバイル用の簡易フロービューア
export default function MobileFlowEditorPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const { language } = useLanguage()
  const [publicFlows, setPublicFlows] = useState<any[]>([])
  const [selectedFlow, setSelectedFlow] = useState<any>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    if (!loading && !user) {
      const errorMsg = {
        ja: 'フローエディタを使用するにはログインが必要です',
        en: 'Login required to use the flow editor',
        pt: 'Login necessário para usar o editor de fluxo'
      }
      toast.error(errorMsg[language as keyof typeof errorMsg])
      router.push('/')
    }
  }, [user, loading, router, language])

  // 公開フローを取得
  useEffect(() => {
    const fetchPublicFlows = async () => {
      const { data, error } = await supabase
        .from('flows')
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
      
      if (!error && data) {
        setPublicFlows(data)
      }
    }
    
    fetchPublicFlows()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-bjj-accent"></div>
      </div>
    )
  }

  const FlowCard = ({ flow }: { flow: any }) => (
    <div
      onClick={() => setSelectedFlow(flow)}
      className="bg-bjj-bg2 border border-white/10 rounded-lg p-4 cursor-pointer hover:border-bjj-accent transition-colors"
    >
      <h3 className="font-semibold text-bjj-text mb-2">{flow.name}</h3>
      {flow.nodes && (
        <div className="text-sm text-bjj-muted">
          {flow.nodes.length} {language === 'ja' ? 'ノード' : 'nodes'}
        </div>
      )}
    </div>
  )

  const FlowDetail = ({ flow }: { flow: any }) => (
    <div className="fixed inset-0 z-50 bg-bjj-bg">
      <div className="sticky top-0 bg-bjj-bg2 border-b border-white/10 p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setSelectedFlow(null)}
            className="flex items-center gap-2 text-bjj-accent"
          >
            <ArrowLeft className="w-4 h-4" />
            {language === 'ja' ? '戻る' : 'Back'}
          </button>
          <h2 className="font-semibold text-bjj-text">{flow.name}</h2>
        </div>
      </div>
      
      <div className="p-4 space-y-4 pb-20">
        {flow.nodes?.map((node: any, index: number) => (
          <div
            key={node.id}
            className="bg-bjj-bg2 border border-white/10 rounded-lg p-4"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-bjj-accent rounded-full flex items-center justify-center text-sm font-bold">
                {index + 1}
              </div>
              <h3 className="font-semibold text-bjj-text">{node.data?.label || 'Node'}</h3>
            </div>
            
            {/* 次のノードへの接続を表示 */}
            {flow.edges?.filter((edge: any) => edge.source === node.id).map((edge: any) => {
              const targetNode = flow.nodes.find((n: any) => n.id === edge.target)
              return targetNode ? (
                <div key={edge.id} className="ml-10 mt-2 text-sm text-bjj-muted">
                  → {targetNode.data?.label}
                </div>
              ) : null
            })}
          </div>
        ))}
      </div>
    </div>
  )

  return (
    <main className="min-h-screen bg-bjj-bg pb-20">
      <DashboardNav />
      
      {/* モバイル用ヘッダー */}
      <div className="sticky top-16 bg-bjj-bg2 border-b border-white/10 p-4 z-30">
        <h1 className="text-xl font-bold text-bjj-text mb-2">
          {language === 'ja' ? 'フローエディタ' : language === 'en' ? 'Flow Editor' : 'Editor de Fluxo'}
        </h1>
        
        {/* モバイル専用の情報 */}
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-3">
          <div className="flex items-start gap-2">
            <Info className="w-4 h-4 text-yellow-400 mt-0.5" />
            <div className="text-xs text-yellow-200">
              {language === 'ja' 
                ? 'モバイルでは閲覧のみ可能です。編集はPCからアクセスしてください。' 
                : language === 'en'
                ? 'View-only on mobile. Please use a PC for editing.'
                : 'Apenas visualização no celular. Use um PC para editar.'}
            </div>
          </div>
        </div>

        {/* ビューモード切り替え */}
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('grid')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              viewMode === 'grid' 
                ? 'bg-bjj-accent text-white' 
                : 'bg-bjj-bg border border-white/10 text-bjj-muted'
            }`}
          >
            <Grid3X3 className="w-4 h-4" />
            {language === 'ja' ? 'グリッド' : 'Grid'}
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-colors ${
              viewMode === 'list' 
                ? 'bg-bjj-accent text-white' 
                : 'bg-bjj-bg border border-white/10 text-bjj-muted'
            }`}
          >
            <List className="w-4 h-4" />
            {language === 'ja' ? 'リスト' : 'List'}
          </button>
        </div>
      </div>

      {/* フローリスト */}
      <div className="p-4">
        {publicFlows.length === 0 ? (
          <div className="text-center py-8 text-bjj-muted">
            {language === 'ja' 
              ? '公開フローがありません' 
              : language === 'en'
              ? 'No public flows available'
              : 'Nenhum fluxo público disponível'}
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 gap-3">
            {publicFlows.map((flow) => (
              <FlowCard key={flow.id} flow={flow} />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {publicFlows.map((flow) => (
              <div
                key={flow.id}
                onClick={() => setSelectedFlow(flow)}
                className="bg-bjj-bg2 border border-white/10 rounded-lg p-4 cursor-pointer hover:border-bjj-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-bjj-text">{flow.name}</h3>
                  <div className="text-sm text-bjj-muted">
                    {flow.nodes?.length || 0} {language === 'ja' ? 'ノード' : 'nodes'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* フロー詳細モーダル */}
      {selectedFlow && <FlowDetail flow={selectedFlow} />}
    </main>
  )
}