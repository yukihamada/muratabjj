'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Play, Clock, Search, Filter, Plus, Upload } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { supabase } from '@/lib/supabase/client'
import { useAuth } from '@/hooks/useAuth'
import DashboardNav from '@/components/DashboardNav'

const translations = {
  ja: {
    videos: '動画カタログ',
    uploadVideo: '動画をアップロード',
    batchUpload: '一括アップロード',
    searchPlaceholder: '動画を検索...',
    allCategories: 'すべてのカテゴリ',
    allBelts: 'すべての帯',
    all: 'すべて',
    freeOnly: '無料のみ',
    premiumOnly: 'プレミアムのみ',
    noVideos: '動画が見つかりません',
    premium: 'プレミアム',
    technique: '技術',
    flow: 'フロー',
    drill: 'ドリル',
    sparring: 'スパーリング',
    competition: '試合',
    views: '回視聴',
    white: '白帯',
    blue: '青帯',
    purple: '紫帯',
    brown: '茶帯',
    black: '黒帯',
  },
  en: {
    videos: 'Video Catalog',
    uploadVideo: 'Upload Video',
    batchUpload: 'Batch Upload',
    searchPlaceholder: 'Search videos...',
    allCategories: 'All Categories',
    allBelts: 'All Belts',
    all: 'All',
    freeOnly: 'Free Only',
    premiumOnly: 'Premium Only',
    noVideos: 'No videos found',
    premium: 'Premium',
    technique: 'Technique',
    flow: 'Flow',
    drill: 'Drill',
    sparring: 'Sparring',
    competition: 'Competition',
    views: 'views',
    white: 'White Belt',
    blue: 'Blue Belt',
    purple: 'Purple Belt',
    brown: 'Brown Belt',
    black: 'Black Belt',
  },
  pt: {
    videos: 'Catálogo de Vídeos',
    uploadVideo: 'Enviar Vídeo',
    batchUpload: 'Upload em Lote',
    searchPlaceholder: 'Pesquisar vídeos...',
    allCategories: 'Todas as Categorias',
    allBelts: 'Todas as Faixas',
    all: 'Todos',
    freeOnly: 'Apenas Gratuitos',
    premiumOnly: 'Apenas Premium',
    noVideos: 'Nenhum vídeo encontrado',
    premium: 'Premium',
    technique: 'Técnica',
    flow: 'Fluxo',
    drill: 'Treino',
    sparring: 'Sparring',
    competition: 'Competição',
    views: 'visualizações',
    white: 'Faixa Branca',
    blue: 'Faixa Azul',
    purple: 'Faixa Roxa',
    brown: 'Faixa Marrom',
    black: 'Faixa Preta',
  },
}

export default function VideosPage() {
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations]
  const router = useRouter()
  const { user } = useAuth()
  
  const [videos, setVideos] = useState<any[]>([])
  const [filteredVideos, setFilteredVideos] = useState<any[]>([])
  const [isCoach, setIsCoach] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState('')
  const [beltFilter, setBeltFilter] = useState('')

  useEffect(() => {
    if (!user) {
      router.push('/')
      return
    }
    loadData()
  }, [user])

  useEffect(() => {
    filterVideos()
  }, [searchQuery, categoryFilter, beltFilter, videos])

  async function loadData() {
    try {
      // Check if user is a coach or admin
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_coach')
        .eq('id', user!.id)
        .single()
      
      if (profile?.is_coach) {
        setIsCoach(true)
      }

      // Load videos - include free videos for all users, premium videos only for pro/dojo subscribers
      const { data: videosData } = await supabase
        .from('videos')
        .select('*')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
      
      if (videosData) {
        setVideos(videosData)
        setFilteredVideos(videosData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  function filterVideos() {
    let filtered = [...videos]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(video => 
        video.title?.toLowerCase().includes(query) ||
        video.description?.toLowerCase().includes(query)
      )
    }

    // Category filter
    if (categoryFilter) {
      filtered = filtered.filter(video => video.category === categoryFilter)
    }

    // Belt filter
    if (beltFilter) {
      filtered = filtered.filter(video => 
        video.recommended_belts?.includes(beltFilter)
      )
    }

    setFilteredVideos(filtered)
  }

  function formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bjj-bg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bjj-accent"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bjj-bg">
      <DashboardNav />
      <div className="py-12">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">{t.videos}</h1>
            {isCoach && (
              <div className="flex gap-3">
                <Link href="/dashboard/videos/batch-upload" className="btn-ghost">
                  <Upload className="w-4 h-4 mr-2" />
                  {t.batchUpload}
                </Link>
                <Link href="/dashboard/videos/upload" className="btn-primary">
                  <Plus className="w-4 h-4 mr-2" />
                  {t.uploadVideo}
                </Link>
              </div>
            )}
          </div>

          {/* Filters */}
          <div className="card-gradient border border-white/10 rounded-bjj p-6 mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Search */}
              <div className="relative md:col-span-2 lg:col-span-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-bjj-muted w-5 h-5" />
                <input
                  type="text"
                  placeholder={t.searchPlaceholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 md:py-2 rounded-lg bg-white/10 border border-white/10 focus:border-bjj-accent focus:outline-none text-base"
                />
              </div>

              {/* Category Filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-4 py-3 md:py-2 rounded-lg bg-white/10 border border-white/10 focus:border-bjj-accent focus:outline-none text-base"
              >
                <option value="" className="bg-bjj-bg">{t.allCategories}</option>
                <option value="technique" className="bg-bjj-bg">{t.technique}</option>
                <option value="flow" className="bg-bjj-bg">{t.flow}</option>
                <option value="drill" className="bg-bjj-bg">{t.drill}</option>
                <option value="sparring" className="bg-bjj-bg">{t.sparring}</option>
                <option value="competition" className="bg-bjj-bg">{t.competition}</option>
              </select>

              {/* Belt Filter */}
              <select
                value={beltFilter}
                onChange={(e) => setBeltFilter(e.target.value)}
                className="px-4 py-3 md:py-2 rounded-lg bg-white/10 border border-white/10 focus:border-bjj-accent focus:outline-none text-base"
              >
                <option value="" className="bg-bjj-bg">{t.allBelts}</option>
                <option value="white" className="bg-bjj-bg">{t.white}</option>
                <option value="blue" className="bg-bjj-bg">{t.blue}</option>
                <option value="purple" className="bg-bjj-bg">{t.purple}</option>
                <option value="brown" className="bg-bjj-bg">{t.brown}</option>
                <option value="black" className="bg-bjj-bg">{t.black}</option>
              </select>
            </div>
          </div>

          {/* Video Grid */}
          {filteredVideos.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-bjj-muted">{t.noVideos}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video) => (
                <Link
                  key={video.id}
                  href={`/videos/${video.id}`}
                  className="group card-gradient border border-white/10 rounded-bjj overflow-hidden hover:border-bjj-accent/50 transition-all"
                >
                  {/* Thumbnail */}
                  <div className="relative aspect-video bg-black/20">
                    {video.thumbnail_url ? (
                      <img
                        src={video.thumbnail_url}
                        alt={video.title || 'Video thumbnail'}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Play className="w-12 h-12 text-bjj-muted" />
                      </div>
                    )}
                    
                    {/* Duration */}
                    {video.duration && (
                      <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
                        {formatDuration(video.duration)}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4">
                    <h3 className="font-semibold mb-2 line-clamp-2 group-hover:text-bjj-accent transition-colors">
                      {video.title}
                    </h3>
                    
                    {video.category && (
                      <p className="text-sm text-bjj-muted mb-2">
                        {t[video.category as keyof typeof t] || video.category}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs text-bjj-muted">
                      <span>{video.recommended_belts?.map((b: string) => t[b as keyof typeof t]).join(', ') || '-'}</span>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-3 h-3" />
                        <span>{video.view_count || 0} {t.views}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}