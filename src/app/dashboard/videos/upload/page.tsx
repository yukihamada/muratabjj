'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { uploadVideo, uploadThumbnail, generateVideoThumbnail, getVideoDuration } from '@/lib/supabase/storage'
import { transcribeVideoServerSide, saveTranscription } from '@/lib/whisper/api'
import { Upload, AlertCircle, Info, Video, Loader2, Plus, Mic, Brain, Trash2, Save } from 'lucide-react'
import Link from 'next/link'
import { useLanguage } from '@/contexts/LanguageContext'
import DashboardNav from '@/components/DashboardNav'
import toast from 'react-hot-toast'

const translations = {
  ja: {
    title: '動画アップロード',
    videoFile: '動画ファイル',
    selectVideo: '動画を選択',
    selected: '選択済み',
    basicInfo: '基本情報',
    videoTitle: 'タイトル',
    description: '説明',
    technique: '技術',
    selectTechnique: '技術を選択',
    beltRequirement: '推奨帯',
    noBeltRequirement: '指定なし',
    premium: 'プレミアムコンテンツ',
    enableAIAnalysis: 'AI自動分析を有効にする',
    aiAnalysisDesc: '動画をアップロード後にAIで技術を自動分析します',
    flowIntegration: 'フロー統合',
    addToFlow: '既存のフローに追加',
    selectFlow: 'フローを選択',
    createNewFlow: '新しいフローを作成',
    analyzing: '動画を分析中...',
    uploading: 'アップロード中...',
    upload: 'アップロード',
    cancel: 'キャンセル',
    uploadSuccess: '動画をアップロードしました',
    uploadError: 'アップロードに失敗しました',
    loginRequired: 'ログインが必要です',
    white: '白帯',
    blue: '青帯',
    purple: '紫帯',
    brown: '茶帯',
    black: '黒帯',
  },
  en: {
    title: 'Video Upload',
    videoFile: 'Video File',
    selectVideo: 'Select Video',
    selected: 'Selected',
    basicInfo: 'Basic Information',
    videoTitle: 'Title',
    description: 'Description',
    technique: 'Technique',
    selectTechnique: 'Select Technique',
    beltRequirement: 'Belt Requirement',
    noBeltRequirement: 'No requirement',
    premium: 'Premium Content',
    enableAIAnalysis: 'Enable AI Auto-Analysis',
    aiAnalysisDesc: 'Automatically analyze video techniques with AI after upload',
    flowIntegration: 'Flow Integration',
    addToFlow: 'Add to existing flow',
    selectFlow: 'Select flow',
    createNewFlow: 'Create new flow',
    analyzing: 'Analyzing video...',
    uploading: 'Uploading...',
    upload: 'Upload',
    cancel: 'Cancel',
    uploadSuccess: 'Video uploaded successfully',
    uploadError: 'Upload failed',
    loginRequired: 'Login required',
    white: 'White Belt',
    blue: 'Blue Belt',
    purple: 'Purple Belt',
    brown: 'Brown Belt',
    black: 'Black Belt',
  },
  pt: {
    title: 'Upload de Vídeo',
    videoFile: 'Arquivo de Vídeo',
    selectVideo: 'Selecionar Vídeo',
    selected: 'Selecionado',
    basicInfo: 'Informações Básicas',
    videoTitle: 'Título',
    description: 'Descrição',
    technique: 'Técnica',
    selectTechnique: 'Selecionar técnica',
    beltRequirement: 'Faixa Recomendada',
    noBeltRequirement: 'Sem requisito',
    premium: 'Conteúdo Premium',
    enableAIAnalysis: 'Habilitar Análise Automática por IA',
    aiAnalysisDesc: 'Analisar automaticamente as técnicas do vídeo com IA após upload',
    flowIntegration: 'Integração com Fluxo',
    addToFlow: 'Adicionar ao fluxo existente',
    selectFlow: 'Selecionar fluxo',
    createNewFlow: 'Criar novo fluxo',
    analyzing: 'Analisando vídeo...',
    uploading: 'Enviando...',
    upload: 'Enviar',
    cancel: 'Cancelar',
    uploadSuccess: 'Vídeo enviado com sucesso',
    uploadError: 'Falha no envio',
    loginRequired: 'Login necessário',
    white: 'Faixa Branca',
    blue: 'Faixa Azul',
    purple: 'Faixa Roxa',
    brown: 'Faixa Marrom',
    black: 'Faixa Preta',
  },
}

const belts = [
  { value: 'white', color: 'bg-white' },
  { value: 'blue', color: 'bg-blue-600' },
  { value: 'purple', color: 'bg-purple-600' },
  { value: 'brown', color: 'bg-amber-700' },
  { value: 'black', color: 'bg-black' },
]

export default function VideoUploadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations]
  const [loading, setLoading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadedVideoData, setUploadedVideoData] = useState<any>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [techniques, setTechniques] = useState<any[]>([])
  const [flows, setFlows] = useState<any[]>([])
  const [transcribing, setTranscribing] = useState(false)
  const [enableTranscription, setEnableTranscription] = useState(true)
  const [enableAIAnalysis, setEnableAIAnalysis] = useState(true)
  const [debugMode, setDebugMode] = useState(false)
  const [formData, setFormData] = useState({
    title_ja: '',
    title_en: '',
    title_pt: '',
    description_ja: '',
    description_en: '',
    description_pt: '',
    technique_id: '',
    belt_requirement: '',
    is_premium: false,
    // Flow integration
    add_to_flow: false,
    flow_id: '',
    create_new_flow: false,
    new_flow_name: '',
  })

  useEffect(() => {
    loadData()
    
    // Check for debug mode in URL
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('debug') === 'true') {
      setDebugMode(true)
    }
  }, [])

  async function loadData() {
    // Load techniques
    const { data: techData } = await supabase
      .from('techniques')
      .select('*')
      .order('name_ja')

    if (techData) {
      setTechniques(techData)
    }

    // Load user's flows (if logged in)
    if (user) {
      const { data: flowData } = await supabase
        .from('flows')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

      if (flowData) {
        setFlows(flowData)
      }
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (!file.type.startsWith('video/')) {
        toast.error(language === 'ja' ? '動画ファイルを選択してください' : 
                   language === 'en' ? 'Please select a video file' : 
                   'Por favor, selecione um arquivo de vídeo')
        return
      }
      
      setVideoFile(file)
      
      // ユーザーがログインしていない場合はエラー
      if (!user) {
        toast.error(t.loginRequired)
        return
      }
      
      // 即座にアップロードを開始
      await uploadVideoFile(file)
    }
  }

  // 動画ファイルのアップロードのみを行う関数
  const uploadVideoFile = async (file: File) => {
    if (!user) return
    
    setIsUploading(true)
    setUploadProgress(0)
    
    try {
      // ストレージチェックをスキップし、直接アップロードを試行
      
      // 動画のアップロード
      const { path: videoPath, url: videoUrl } = await uploadVideo(
        file,
        user.id,
        (progress) => setUploadProgress(progress)
      )
      
      // サムネイルの生成とアップロード
      toast.loading(language === 'ja' ? 'サムネイルを生成中...' : 
                   language === 'en' ? 'Generating thumbnail...' : 
                   'Gerando miniatura...')
      
      const thumbnailBlob = await generateVideoThumbnail(file)
      const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' })
      const { url: thumbnailUrl } = await uploadThumbnail(thumbnailFile, videoPath)
      
      // 動画の長さを取得
      const duration = await getVideoDuration(file)
      
      toast.dismiss()
      
      // アップロード成功時の処理
      setUploadedVideoData({
        videoPath,
        videoUrl,
        thumbnailUrl,
        duration,
        fileName: file.name,
        fileSize: file.size
      })
      
      toast.success(
        language === 'ja' ? '動画のアップロードが完了しました。詳細情報を入力してください。' :
        language === 'en' ? 'Video uploaded successfully. Please enter the details.' :
        'Vídeo enviado com sucesso. Por favor, insira os detalhes.'
      )
      
      // タイトルに動画ファイル名をセット（拡張子を除く）
      const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
      setFormData(prev => ({
        ...prev,
        title_ja: prev.title_ja || fileNameWithoutExt,
        title_en: prev.title_en || fileNameWithoutExt,
        title_pt: prev.title_pt || fileNameWithoutExt
      }))
      
    } catch (error: any) {
      
      let errorMessage = t.uploadError
      
      if (error.message) {
        // ストレージライブラリからの日本語メッセージはそのまま使用
        if (error.message.includes('アクセス権限の問題') || 
            error.message.includes('認証エラー') || 
            error.message.includes('ストレージが利用できません') ||
            error.message.includes('ファイルサイズが大きすぎます') ||
            error.message.includes('サポートされていない')) {
          errorMessage = error.message
        } else if (error.message.includes('File size exceeds') || error.message.includes('size')) {
          errorMessage = language === 'ja' ? 'ファイルサイズが大きすぎます（最大500MB）' : 
                        language === 'en' ? 'File size too large (max 500MB)' : 
                        'Arquivo muito grande (máx 500MB)'
        } else if (error.message.includes('Invalid file type') || error.message.includes('mime')) {
          errorMessage = language === 'ja' ? 'サポートされていないファイル形式です（MP4、MOV、AVIのみ）' : 
                        language === 'en' ? 'Unsupported file type (MP4, MOV, AVI only)' : 
                        'Tipo de arquivo não suportado (apenas MP4, MOV, AVI)'
        } else if (error.message.includes('authorization') || error.message.includes('JWT') || error.message.includes('auth')) {
          errorMessage = language === 'ja' ? '認証エラーです。ページを再読み込みしてから再度お試しください。' :
                        language === 'en' ? 'Authentication error. Please refresh the page and try again.' :
                        'Erro de autenticação. Recarregue a página e tente novamente.'
        } else {
          errorMessage = error.message
        }
      }
      
      toast.error(errorMessage)
      setVideoFile(null)
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // アップロード済みのデータがない場合はエラー
    if (!uploadedVideoData) {
      toast.error(
        language === 'ja' ? '動画をアップロードしてください' :
        language === 'en' ? 'Please upload a video' :
        'Por favor, envie um vídeo'
      )
      return
    }

    // ユーザーがログインしていない場合はエラー
    if (!user) {
      toast.error(t.loginRequired)
      return
    }

    setLoading(true)

    try {

      // Save to database using uploaded video data (mapped to current table structure)
      const { data: videoData, error: dbError } = await supabase
        .from('videos')
        .insert({
          // 実際のカラムに合わせたマッピング
          title: formData.title_ja || formData.title_en || formData.title_pt || uploadedVideoData.fileName,
          description: formData.description_ja || formData.description_en || formData.description_pt || '',
          filename: uploadedVideoData.fileName,
          file_size: uploadedVideoData.fileSize || 0,
          video_url: uploadedVideoData.videoUrl,
          thumbnail_url: uploadedVideoData.thumbnailUrl,
          duration: uploadedVideoData.duration,
          user_id: user.id,
          category: formData.technique_id ? 'technique' : 'general',
          difficulty_level: formData.belt_requirement || 'beginner',
          is_free: !formData.is_premium,
          is_published: true,
          approval_status: 'pending',
          analysis_status: 'pending',
        })
        .select()
        .single()

      if (dbError) throw dbError

      // 5. Transcribe video if enabled
      if (enableTranscription && videoData) {
        try {
          setTranscribing(true)
          toast.loading(language === 'ja' ? '音声を解析中...' : 
                       language === 'en' ? 'Analyzing audio...' : 
                       'Analisando áudio...')
          
          // Call transcription API
          const transcription = await transcribeVideoServerSide(uploadedVideoData.videoUrl, language)
          
          // Save transcription to current table structure
          await supabase
            .from('videos')
            .update({ 
              transcription: transcription,
              analysis_status: 'transcribed',
              analyzed_at: new Date().toISOString()
            })
            .eq('id', videoData.id)
            
          toast.dismiss()
          toast.success(language === 'ja' ? '音声解析が完了しました' : 
                       language === 'en' ? 'Audio analysis completed' : 
                       'Análise de áudio concluída')
        } catch (transcriptionError: any) {
          toast.dismiss()
          console.error('Transcription error:', transcriptionError)
          
          // より詳細なエラーメッセージ
          let errorMsg = language === 'ja' ? '音声解析に失敗しました' : 
                        language === 'en' ? 'Audio analysis failed' : 
                        'Falha na análise de áudio'
          
          if (transcriptionError.message?.includes('OpenAI API key')) {
            errorMsg = language === 'ja' ? 
              '音声解析機能は現在利用できません（APIキー未設定）' :
              language === 'en' ? 
              'Transcription unavailable (API key not configured)' :
              'Transcrição indisponível (chave API não configurada)'
          }
          
          toast.error(errorMsg)
          
          // Update status in database (current table structure)
          await supabase
            .from('videos')
            .update({ 
              analysis_status: 'error',
              analysis_error: transcriptionError.message 
            })
            .eq('id', videoData.id)
        } finally {
          setTranscribing(false)
        }
      }

      // 5. Trigger AI analysis if enabled
      if (enableAIAnalysis && videoData) {
        try {
          toast.loading(language === 'ja' ? 'AI分析を開始中...' : 
                       language === 'en' ? 'Starting AI analysis...' : 
                       'Iniciando análise de IA...')
          
          await fetch('/api/ai/auto-analyze-on-upload', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
              video_id: videoData.id,
              trigger_analysis: true,
              background: true
            })
          })
          
          toast.dismiss()
          toast.success(language === 'ja' ? 'AI分析がスケジュールされました' : 
                       language === 'en' ? 'AI analysis scheduled' : 
                       'Análise de IA agendada')
        } catch (aiError) {
          toast.dismiss()
        }
      }

      // 6. Handle flow integration if requested
      if (formData.add_to_flow && videoData) {
        let flowId = formData.flow_id

        // Create new flow if requested
        if (formData.create_new_flow && formData.new_flow_name) {
          const { data: newFlow, error: flowError } = await supabase
            .from('flows')
            .insert({
              title: formData.new_flow_name,
              description: '',
              data: { nodes: [], edges: [] },
              created_by: user.id,
              is_public: false,
            })
            .select()
            .single()

          if (flowError) throw flowError
          flowId = newFlow.id
        }

        // Add video to flow
        if (flowId) {
          // Get existing flow data
          const { data: flowData } = await supabase
            .from('flows')
            .select('data')
            .eq('id', flowId)
            .single()

          if (flowData) {
            const currentData = flowData.data || { nodes: [], edges: [] }
            
            // Add video node
            const newNode = {
              id: `video-${videoData.id}`,
              type: 'video',
              data: {
                label: formData[`title_${language}` as keyof typeof formData] || formData.title_ja,
                video_id: videoData.id,
                technique_id: formData.technique_id,
              },
              position: { x: 100 + currentData.nodes.length * 150, y: 100 },
            }

            // Update flow with new node
            await supabase
              .from('flows')
              .update({
                data: {
                  nodes: [...currentData.nodes, newNode],
                  edges: currentData.edges,
                },
              })
              .eq('id', flowId)
          }
        }
      }

      toast.success(t.uploadSuccess)
      router.push('/dashboard/videos')
    } catch (error: any) {
      
      // More specific error messages
      let errorMessage = t.uploadError
      
      if (error.message) {
        if (error.message.includes('File size exceeds')) {
          errorMessage = language === 'ja' ? 'ファイルサイズが大きすぎます（最大5GB）' : 
                        language === 'en' ? 'File size too large (max 5GB)' : 
                        'Arquivo muito grande (máx 5GB)'
        } else if (error.message.includes('Invalid file type')) {
          errorMessage = language === 'ja' ? 'サポートされていないファイル形式です（MP4、MOV、AVIのみ）' : 
                        language === 'en' ? 'Unsupported file type (MP4, MOV, AVI only)' : 
                        'Tipo de arquivo não suportado (apenas MP4, MOV, AVI)'
        } else if (error.message.includes('storage')) {
          errorMessage = language === 'ja' ? 'ストレージエラー: 管理者にお問い合わせください' : 
                        language === 'en' ? 'Storage error: Please contact administrator' : 
                        'Erro de armazenamento: Entre em contato com o administrador'
        } else if (error.message.includes('row-level security')) {
          errorMessage = language === 'ja' ? 'アクセス権限がありません' : 
                        language === 'en' ? 'Access denied' : 
                        'Acesso negado'
        } else {
          errorMessage = `${t.uploadError}: ${error.message}`
        }
      }
      
      toast.error(errorMessage)
    } finally {
      setLoading(false)
      setUploadProgress(0)
    }
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-bjj-bg">
        <DashboardNav />
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card-gradient rounded-bjj p-8 border border-white/10">
              <h1 className="text-2xl font-bold mb-4">{t.loginRequired}</h1>
              <p className="text-bjj-muted mb-6">
                {language === 'ja' ? '動画を投稿するにはログインが必要です' :
                 language === 'en' ? 'Please login to upload videos' :
                 'Faça login para enviar vídeos'}
              </p>
              <Link 
                href="/login" 
                className="btn-primary inline-block"
              >
                {language === 'ja' ? 'ログインする' :
                 language === 'en' ? 'Login' :
                 'Fazer login'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-bjj-bg">
      <DashboardNav />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{t.title}</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Video File Selection */}
            <div className="card-gradient rounded-bjj p-6 border border-white/10">
              <label className="block text-sm font-medium mb-4">
                {t.videoFile} <span className="text-bjj-accent">*</span>
              </label>
              
              {/* アップロード前の状態 */}
              {!uploadedVideoData && !isUploading && (
                <div className="border-2 border-dashed border-white/20 rounded-bjj p-8 text-center">
                  <Video className="w-12 h-12 mx-auto mb-4 text-bjj-muted" />
                  <input
                    type="file"
                    accept="video/*"
                    onChange={handleFileChange}
                    className="hidden"
                    id="video-upload"
                    required
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="video-upload"
                    className="btn-primary cursor-pointer inline-block"
                  >
                    {t.selectVideo}
                  </label>
                  <p className="mt-4 text-sm text-bjj-muted">
                    {language === 'ja' ? '動画を選択すると自動的にアップロードが始まります' :
                     language === 'en' ? 'Upload will start automatically after selection' :
                     'O upload começará automaticamente após a seleção'}
                  </p>
                </div>
              )}
              
              {/* アップロード中の状態 */}
              {isUploading && (
                <div className="border-2 border-dashed border-white/20 rounded-bjj p-8 text-center">
                  <Loader2 className="w-12 h-12 mx-auto mb-4 text-bjj-accent animate-spin" />
                  <p className="text-sm font-medium mb-2">
                    {language === 'ja' ? 'アップロード中...' :
                     language === 'en' ? 'Uploading...' :
                     'Enviando...'}
                  </p>
                  {videoFile && (
                    <p className="text-sm text-bjj-muted mb-4">
                      {videoFile.name}
                    </p>
                  )}
                  <div className="w-full bg-white/10 rounded-full h-2">
                    <div
                      className="bg-bjj-accent h-2 rounded-full transition-all"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p className="text-sm text-bjj-muted mt-2">{uploadProgress}%</p>
                </div>
              )}
              
              {/* アップロード完了後の状態 */}
              {uploadedVideoData && !isUploading && (
                <div className="bg-bjj-bg2 rounded-bjj p-6">
                  <div className="flex items-start gap-4">
                    <div className="relative w-32 h-24 bg-black rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={uploadedVideoData.thumbnailUrl}
                        alt="Video thumbnail"
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black/60 rounded-full p-2">
                          <Video className="w-6 h-6 text-white" />
                        </div>
                      </div>
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-bjj-text">{uploadedVideoData.fileName}</p>
                      <p className="text-sm text-bjj-muted mt-1">
                        {language === 'ja' ? '長さ' : language === 'en' ? 'Duration' : 'Duração'}: {Math.floor(uploadedVideoData.duration / 60)}:{(uploadedVideoData.duration % 60).toString().padStart(2, '0')}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1 text-green-400">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-xs">
                            {language === 'ja' ? 'アップロード完了' :
                             language === 'en' ? 'Upload complete' :
                             'Upload concluído'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setUploadedVideoData(null)
                        setVideoFile(null)
                        setFormData({
                          title_ja: '',
                          title_en: '',
                          title_pt: '',
                          description_ja: '',
                          description_en: '',
                          description_pt: '',
                          technique_id: '',
                          belt_requirement: '',
                          is_premium: false,
                          add_to_flow: false,
                          flow_id: '',
                          create_new_flow: false,
                          new_flow_name: '',
                        })
                      }}
                      className="text-bjj-muted hover:text-bjj-accent"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <p className="text-sm text-yellow-400 mt-4">
                    {language === 'ja' ? '以下の情報を入力して「保存」をクリックしてください' :
                     language === 'en' ? 'Please fill in the information below and click "Save"' :
                     'Por favor, preencha as informações abaixo e clique em "Salvar"'}
                  </p>
                </div>
              )}
            </div>

            {/* Basic Information */}
            <div className="card-gradient rounded-bjj p-6 border border-white/10 space-y-4">
              <h2 className="text-xl font-bold mb-4">{t.basicInfo}</h2>
              
              {/* Title fields for each language */}
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.videoTitle} (日本語) <span className="text-bjj-accent">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.title_ja}
                    onChange={(e) => setFormData({ ...formData, title_ja: e.target.value })}
                    className="w-full px-4 py-2 bg-bjj-bg border border-white/10 rounded-bjj focus:border-bjj-accent focus:outline-none"
                    required={language === 'ja'}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.videoTitle} (English)
                  </label>
                  <input
                    type="text"
                    value={formData.title_en}
                    onChange={(e) => setFormData({ ...formData, title_en: e.target.value })}
                    className="w-full px-4 py-2 bg-bjj-bg border border-white/10 rounded-bjj focus:border-bjj-accent focus:outline-none"
                    required={language === 'en'}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.videoTitle} (Português)
                  </label>
                  <input
                    type="text"
                    value={formData.title_pt}
                    onChange={(e) => setFormData({ ...formData, title_pt: e.target.value })}
                    className="w-full px-4 py-2 bg-bjj-bg border border-white/10 rounded-bjj focus:border-bjj-accent focus:outline-none"
                    required={language === 'pt'}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Description fields */}
              <div className="grid gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.description} (日本語)
                  </label>
                  <textarea
                    value={formData.description_ja}
                    onChange={(e) => setFormData({ ...formData, description_ja: e.target.value })}
                    className="w-full px-4 py-2 bg-bjj-bg border border-white/10 rounded-bjj focus:border-bjj-accent focus:outline-none"
                    rows={3}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.description} (English)
                  </label>
                  <textarea
                    value={formData.description_en}
                    onChange={(e) => setFormData({ ...formData, description_en: e.target.value })}
                    className="w-full px-4 py-2 bg-bjj-bg border border-white/10 rounded-bjj focus:border-bjj-accent focus:outline-none"
                    rows={3}
                    disabled={loading}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.description} (Português)
                  </label>
                  <textarea
                    value={formData.description_pt}
                    onChange={(e) => setFormData({ ...formData, description_pt: e.target.value })}
                    className="w-full px-4 py-2 bg-bjj-bg border border-white/10 rounded-bjj focus:border-bjj-accent focus:outline-none"
                    rows={3}
                    disabled={loading}
                  />
                </div>
              </div>

              {/* Technique and Belt */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.technique}
                  </label>
                  <select
                    value={formData.technique_id}
                    onChange={(e) => setFormData({ ...formData, technique_id: e.target.value })}
                    className="w-full px-4 py-2 bg-bjj-bg border border-white/10 rounded-bjj focus:border-bjj-accent focus:outline-none"
                    disabled={loading}
                  >
                    <option value="">{t.selectTechnique}</option>
                    {techniques.map(tech => (
                      <option key={tech.id} value={tech.id}>
                        {tech[`name_${language}`] || tech.name_ja}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    {t.beltRequirement}
                  </label>
                  <select
                    value={formData.belt_requirement}
                    onChange={(e) => setFormData({ ...formData, belt_requirement: e.target.value })}
                    className="w-full px-4 py-2 bg-bjj-bg border border-white/10 rounded-bjj focus:border-bjj-accent focus:outline-none"
                    disabled={loading}
                  >
                    <option value="">{t.noBeltRequirement}</option>
                    {belts.map(belt => (
                      <option key={belt.value} value={belt.value}>
                        {t[belt.value as keyof typeof t]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Premium Content */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.is_premium}
                  onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                  className="rounded border-white/20"
                  disabled={loading}
                />
                <span className="text-sm">{t.premium}</span>
              </label>
              
              {/* Audio Transcription */}
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableTranscription}
                  onChange={(e) => setEnableTranscription(e.target.checked)}
                  className="rounded border-white/20"
                  disabled={loading}
                />
                <Mic className="w-4 h-4" />
                <span className="text-sm">
                  {language === 'ja' ? '音声を自動文字起こし (Whisper API)' : 
                   language === 'en' ? 'Auto-transcribe audio (Whisper API)' : 
                   'Transcrever áudio automaticamente (Whisper API)'}
                </span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableAIAnalysis}
                  onChange={(e) => setEnableAIAnalysis(e.target.checked)}
                  className="rounded border-white/20"
                  disabled={loading}
                />
                <Brain className="w-4 h-4" />
                <div className="flex flex-col">
                  <span className="text-sm">
                    {t.enableAIAnalysis}
                  </span>
                  <span className="text-xs text-bjj-muted">
                    {t.aiAnalysisDesc}
                  </span>
                </div>
              </label>
            </div>

            {/* Flow Integration */}
            <div className="card-gradient rounded-bjj p-6 border border-white/10 space-y-4">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5" />
                {t.flowIntegration}
              </h2>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.add_to_flow}
                  onChange={(e) => setFormData({ ...formData, add_to_flow: e.target.checked })}
                  className="rounded border-white/20"
                  disabled={loading}
                />
                <span className="text-sm">{t.addToFlow}</span>
              </label>

              {formData.add_to_flow && (
                <div className="space-y-4 ml-6">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {t.selectFlow}
                    </label>
                    <select
                      value={formData.flow_id}
                      onChange={(e) => setFormData({ ...formData, flow_id: e.target.value })}
                      className="w-full px-4 py-2 bg-bjj-bg border border-white/10 rounded-bjj focus:border-bjj-accent focus:outline-none"
                      disabled={loading || formData.create_new_flow}
                    >
                      <option value="">-- {t.selectFlow} --</option>
                      {flows.map(flow => (
                        <option key={flow.id} value={flow.id}>
                          {flow.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.create_new_flow}
                      onChange={(e) => setFormData({ ...formData, create_new_flow: e.target.checked })}
                      className="rounded border-white/20"
                      disabled={loading}
                    />
                    <span className="text-sm">{t.createNewFlow}</span>
                  </div>

                  {formData.create_new_flow && (
                    <input
                      type="text"
                      value={formData.new_flow_name}
                      onChange={(e) => setFormData({ ...formData, new_flow_name: e.target.value })}
                      placeholder="Flow name"
                      className="w-full px-4 py-2 bg-bjj-bg border border-white/10 rounded-bjj focus:border-bjj-accent focus:outline-none"
                      disabled={loading}
                    />
                  )}
                </div>
              )}

              <div className="p-4 bg-bjj-accent/10 border border-bjj-accent/30 rounded-bjj">
                <p className="text-sm flex items-start gap-2">
                  <Info className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  {language === 'ja' 
                    ? 'アップロードした動画を既存のフローに追加したり、新しいフローを作成できます。' 
                    : language === 'en'
                    ? 'You can add the uploaded video to an existing flow or create a new flow.'
                    : 'Você pode adicionar o vídeo enviado a um fluxo existente ou criar um novo fluxo.'}
                </p>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn-ghost"
                disabled={loading}
              >
                {t.cancel}
              </button>
              <button
                type="submit"
                className="btn-primary flex items-center gap-2"
                disabled={loading || !uploadedVideoData}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {transcribing ? (language === 'ja' ? '音声解析中...' : 
                                    language === 'en' ? 'Transcribing...' : 
                                    'Transcrevendo...') : 
                     language === 'ja' ? '保存中...' : language === 'en' ? 'Saving...' : 'Salvando...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    {language === 'ja' ? '保存' : language === 'en' ? 'Save' : 'Salvar'}
                  </>
                )}
              </button>
            </div>
          </form>
          
          {/* Debug Mode Information */}
          {debugMode && (
            <div className="mt-8 card-gradient rounded-bjj p-6 border border-yellow-500/30">
              <h3 className="text-lg font-bold text-yellow-400 mb-4">Debug Information</h3>
              <div className="space-y-2 text-sm font-mono text-yellow-200">
                <p>User ID: {user?.id || 'Not logged in'}</p>
                <p>User Email: {user?.email || 'Not logged in'}</p>
                <p>File Selected: {videoFile ? `${videoFile.name} (${(videoFile.size / 1024 / 1024).toFixed(2)} MB)` : 'No file'}</p>
                <p>File Type: {videoFile?.type || 'N/A'}</p>
                <p>Upload Status: {uploadedVideoData ? 'Uploaded' : isUploading ? 'Uploading...' : 'Not uploaded'}</p>
                {uploadedVideoData && (
                  <>
                    <p>Video URL: {uploadedVideoData.videoUrl}</p>
                    <p>Thumbnail URL: {uploadedVideoData.thumbnailUrl}</p>
                    <p>Duration: {uploadedVideoData.duration}s</p>
                  </>
                )}
                <p>Supabase URL: {process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not set'}</p>
                <p>Storage Buckets Check: Click upload to test</p>
                <div className="mt-4 p-3 bg-black/50 rounded overflow-x-auto">
                  <p className="text-xs">Troubleshooting:</p>
                  <p className="text-xs">1. Check browser console for detailed errors</p>
                  <p className="text-xs">2. Verify storage buckets exist in Supabase dashboard</p>
                  <p className="text-xs">3. Check RLS policies on storage.objects table</p>
                  <p className="text-xs">4. Run migration: /supabase/migrations/017_create_storage_buckets.sql</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}