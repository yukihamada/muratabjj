'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { uploadVideo, uploadThumbnail, generateVideoThumbnail, getVideoDuration } from '@/lib/supabase/storage'
import { transcribeVideoServerSide, saveTranscription } from '@/lib/whisper/api'
import { Upload, AlertCircle, Info, Video, Loader2, Plus, Mic } from 'lucide-react'
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
  const [techniques, setTechniques] = useState<any[]>([])
  const [flows, setFlows] = useState<any[]>([])
  const [transcribing, setTranscribing] = useState(false)
  const [enableTranscription, setEnableTranscription] = useState(true)
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
    if (!user) {
      router.push('/')
      return
    }
    loadData()
  }, [user])

  async function loadData() {
    // Load techniques
    const { data: techData } = await supabase
      .from('techniques')
      .select('*')
      .order('name_ja')

    if (techData) {
      setTechniques(techData)
    }

    // Load user's flows
    const { data: flowData } = await supabase
      .from('flows')
      .select('*')
      .eq('created_by', user!.id)
      .order('created_at', { ascending: false })

    if (flowData) {
      setFlows(flowData)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (file.type.startsWith('video/')) {
        setVideoFile(file)
      } else {
        toast.error(language === 'ja' ? '動画ファイルを選択してください' : 
                   language === 'en' ? 'Please select a video file' : 
                   'Por favor, selecione um arquivo de vídeo')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !videoFile) return

    setLoading(true)
    setUploadProgress(0)

    try {
      // 1. Upload video with progress tracking
      const { path: videoPath, url: videoUrl } = await uploadVideo(
        videoFile,
        user.id,
        (progress) => setUploadProgress(progress)
      )

      // 2. Generate and upload thumbnail
      const thumbnailBlob = await generateVideoThumbnail(videoFile)
      const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' })
      const { url: thumbnailUrl } = await uploadThumbnail(thumbnailFile, videoPath)

      // 3. Get video duration
      const duration = await getVideoDuration(videoFile)

      // 4. Save to database
      const { data: videoData, error: dbError } = await supabase
        .from('videos')
        .insert({
          title_ja: formData.title_ja || formData.title_en,
          title_en: formData.title_en || formData.title_ja,
          title_pt: formData.title_pt || formData.title_en || formData.title_ja,
          description_ja: formData.description_ja,
          description_en: formData.description_en,
          description_pt: formData.description_pt,
          url: videoUrl,
          thumbnail_url: thumbnailUrl,
          duration,
          technique_id: formData.technique_id || null,
          instructor_id: user.id,
          belt_requirement: formData.belt_requirement || null,
          is_premium: formData.is_premium,
          is_published: true,
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
          
          // Update transcription status
          await supabase
            .from('videos')
            .update({ transcription_status: 'processing' })
            .eq('id', videoData.id)

          // Call transcription API
          const transcription = await transcribeVideoServerSide(videoUrl, language)
          
          // Save transcription to database
          await saveTranscription(videoData.id, transcription, user.id)
          
          // Update transcription status
          await supabase
            .from('videos')
            .update({ 
              transcription_status: 'completed',
              transcription_completed_at: new Date().toISOString()
            })
            .eq('id', videoData.id)
            
          toast.dismiss()
          toast.success(language === 'ja' ? '音声解析が完了しました' : 
                       language === 'en' ? 'Audio analysis completed' : 
                       'Análise de áudio concluída')
        } catch (transcriptionError) {
          console.error('Transcription error:', transcriptionError)
          toast.dismiss()
          toast.error(language === 'ja' ? '音声解析に失敗しました' : 
                     language === 'en' ? 'Audio analysis failed' : 
                     'Falha na análise de áudio')
          
          // Update transcription status to failed
          await supabase
            .from('videos')
            .update({ transcription_status: 'failed' })
            .eq('id', videoData.id)
        } finally {
          setTranscribing(false)
        }
      }

      // 5. Handle flow integration if requested
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
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(t.uploadError)
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
            <p className="text-bjj-muted">{t.loginRequired}</p>
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
              <div className="border-2 border-dashed border-white/20 rounded-bjj p-8 text-center">
                <Video className="w-12 h-12 mx-auto mb-4 text-bjj-muted" />
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileChange}
                  className="hidden"
                  id="video-upload"
                  required
                  disabled={loading}
                />
                <label
                  htmlFor="video-upload"
                  className="btn-primary cursor-pointer inline-block"
                >
                  {t.selectVideo}
                </label>
                {videoFile && (
                  <p className="mt-4 text-sm text-bjj-muted">
                    {t.selected}: {videoFile.name}
                  </p>
                )}
                {loading && uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="w-full bg-white/10 rounded-full h-2">
                      <div
                        className="bg-bjj-accent h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                    <p className="text-sm text-bjj-muted mt-2">{uploadProgress}%</p>
                  </div>
                )}
              </div>
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
                disabled={loading || !videoFile}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {transcribing ? (language === 'ja' ? '音声解析中...' : 
                                    language === 'en' ? 'Transcribing...' : 
                                    'Transcrevendo...') : 
                     uploadProgress > 0 ? t.uploading : t.analyzing}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {t.upload}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}