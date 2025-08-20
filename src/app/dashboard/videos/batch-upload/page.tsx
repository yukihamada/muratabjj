'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth'
import { supabase } from '@/lib/supabase/client'
import { uploadVideo, uploadThumbnail, generateVideoThumbnail, getVideoDuration } from '@/lib/supabase/storage'
import { transcribeVideoServerSide, saveTranscription } from '@/lib/whisper/api'
import { Upload, AlertCircle, Info, Video, Loader2, Plus, Mic, FileVideo } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import DashboardNav from '@/components/DashboardNav'
import toast from 'react-hot-toast'

const translations = {
  ja: {
    title: '動画一括アップロード',
    dragDrop: 'ここに動画ファイルをドラッグ＆ドロップ',
    or: 'または',
    selectFiles: '動画を選択',
    selectedFiles: '選択されたファイル',
    uploading: 'アップロード中...',
    processing: '処理中...',
    transcribing: '音声解析中...',
    completed: '完了',
    failed: '失敗',
    uploadAll: '全てアップロード',
    cancel: 'キャンセル',
    enableTranscription: '音声を自動文字起こし (Whisper API)',
    uploadSuccess: '全ての動画をアップロードしました',
    uploadError: 'いくつかのアップロードに失敗しました',
  },
  en: {
    title: 'Batch Video Upload',
    dragDrop: 'Drag and drop video files here',
    or: 'or',
    selectFiles: 'Select Videos',
    selectedFiles: 'Selected Files',
    uploading: 'Uploading...',
    processing: 'Processing...',
    transcribing: 'Transcribing...',
    completed: 'Completed',
    failed: 'Failed',
    uploadAll: 'Upload All',
    cancel: 'Cancel',
    enableTranscription: 'Auto-transcribe audio (Whisper API)',
    uploadSuccess: 'All videos uploaded successfully',
    uploadError: 'Some uploads failed',
  },
  pt: {
    title: 'Upload em Lote de Vídeos',
    dragDrop: 'Arraste e solte arquivos de vídeo aqui',
    or: 'ou',
    selectFiles: 'Selecionar Vídeos',
    selectedFiles: 'Arquivos Selecionados',
    uploading: 'Enviando...',
    processing: 'Processando...',
    transcribing: 'Transcrevendo...',
    completed: 'Concluído',
    failed: 'Falhou',
    uploadAll: 'Enviar Todos',
    cancel: 'Cancelar',
    enableTranscription: 'Transcrever áudio automaticamente (Whisper API)',
    uploadSuccess: 'Todos os vídeos foram enviados com sucesso',
    uploadError: 'Alguns uploads falharam',
  },
}

interface VideoUploadStatus {
  file: File
  status: 'pending' | 'uploading' | 'processing' | 'transcribing' | 'completed' | 'failed'
  progress: number
  error?: string
  videoId?: string
}

export default function BatchVideoUploadPage() {
  const router = useRouter()
  const { user } = useAuth()
  const { language } = useLanguage()
  const t = translations[language as keyof typeof translations]
  const [loading, setLoading] = useState(false)
  const [enableTranscription, setEnableTranscription] = useState(true)
  const [videoFiles, setVideoFiles] = useState<VideoUploadStatus[]>([])
  const [dragActive, setDragActive] = useState(false)

  useEffect(() => {
    if (!user) {
      router.push('/')
    }
  }, [user, router])

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const files = Array.from(e.dataTransfer.files)
    handleFiles(files)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files)
      handleFiles(files)
    }
  }

  const handleFiles = (files: File[]) => {
    const videoFiles = files.filter(file => file.type.startsWith('video/'))
    const newVideoStatuses: VideoUploadStatus[] = videoFiles.map(file => ({
      file,
      status: 'pending' as const,
      progress: 0,
    }))
    setVideoFiles(prev => [...prev, ...newVideoStatuses])
  }

  const uploadSingleVideo = async (videoStatus: VideoUploadStatus, index: number) => {
    if (!user) return

    try {
      // Update status to uploading
      updateVideoStatus(index, { status: 'uploading' })

      // 1. Upload video
      const { path: videoPath, url: videoUrl } = await uploadVideo(
        videoStatus.file,
        user.id,
        (progress) => updateVideoStatus(index, { progress })
      )

      // Update status to processing
      updateVideoStatus(index, { status: 'processing', progress: 100 })

      // 2. Generate and upload thumbnail
      const thumbnailBlob = await generateVideoThumbnail(videoStatus.file)
      const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' })
      const { url: thumbnailUrl } = await uploadThumbnail(thumbnailFile, videoPath)

      // 3. Get video duration
      const duration = await getVideoDuration(videoStatus.file)

      // 4. Extract title from filename
      const fileName = videoStatus.file.name
      const title = fileName.replace(/\.[^/.]+$/, "") // Remove extension

      // 5. Save to database
      const { data: videoData, error: dbError } = await supabase
        .from('videos')
        .insert({
          title_ja: title,
          title_en: title,
          title_pt: title,
          url: videoUrl,
          thumbnail_url: thumbnailUrl,
          duration,
          instructor_id: user.id,
          is_published: true,
          transcription_status: enableTranscription ? 'pending' : null,
        })
        .select()
        .single()

      if (dbError) throw dbError

      // 6. Transcribe if enabled
      if (enableTranscription && videoData) {
        updateVideoStatus(index, { status: 'transcribing' })

        try {
          await supabase
            .from('videos')
            .update({ transcription_status: 'processing' })
            .eq('id', videoData.id)

          const transcription = await transcribeVideoServerSide(videoUrl, language)
          await saveTranscription(videoData.id, transcription, user.id)
          
          await supabase
            .from('videos')
            .update({ 
              transcription_status: 'completed',
              transcription_completed_at: new Date().toISOString()
            })
            .eq('id', videoData.id)
        } catch (transcriptionError) {
          console.error('Transcription error:', transcriptionError)
          await supabase
            .from('videos')
            .update({ transcription_status: 'failed' })
            .eq('id', videoData.id)
        }
      }

      updateVideoStatus(index, { status: 'completed', videoId: videoData.id })
    } catch (error) {
      console.error('Upload error:', error)
      updateVideoStatus(index, { 
        status: 'failed', 
        error: error instanceof Error ? error.message : 'Upload failed' 
      })
    }
  }

  const updateVideoStatus = (index: number, updates: Partial<VideoUploadStatus>) => {
    setVideoFiles(prev => prev.map((item, i) => 
      i === index ? { ...item, ...updates } : item
    ))
  }

  const handleUploadAll = async () => {
    setLoading(true)
    
    // Upload videos sequentially to avoid overwhelming the server
    for (let i = 0; i < videoFiles.length; i++) {
      if (videoFiles[i].status === 'pending') {
        await uploadSingleVideo(videoFiles[i], i)
      }
    }

    setLoading(false)

    const failedCount = videoFiles.filter(v => v.status === 'failed').length
    if (failedCount === 0) {
      toast.success(t.uploadSuccess)
      setTimeout(() => router.push('/dashboard/videos'), 2000)
    } else {
      toast.error(t.uploadError)
    }
  }

  const getStatusColor = (status: VideoUploadStatus['status']) => {
    switch (status) {
      case 'pending': return 'text-gray-500'
      case 'uploading': return 'text-blue-500'
      case 'processing': return 'text-yellow-500'
      case 'transcribing': return 'text-purple-500'
      case 'completed': return 'text-green-500'
      case 'failed': return 'text-red-500'
    }
  }

  const getStatusText = (status: VideoUploadStatus['status']) => {
    switch (status) {
      case 'uploading': return t.uploading
      case 'processing': return t.processing
      case 'transcribing': return t.transcribing
      case 'completed': return t.completed
      case 'failed': return t.failed
      default: return ''
    }
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-bjj-bg">
      <DashboardNav />
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">{t.title}</h1>

          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-bjj p-12 text-center transition-colors ${
              dragActive ? 'border-bjj-accent bg-bjj-accent/10' : 'border-white/20'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <FileVideo className="w-16 h-16 mx-auto mb-4 text-bjj-muted" />
            <p className="text-lg mb-2">{t.dragDrop}</p>
            <p className="text-bjj-muted mb-4">{t.or}</p>
            <input
              type="file"
              accept="video/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
              id="video-batch-upload"
              disabled={loading}
            />
            <label
              htmlFor="video-batch-upload"
              className="btn-primary cursor-pointer inline-block"
            >
              {t.selectFiles}
            </label>
          </div>

          {/* Options */}
          {videoFiles.length > 0 && (
            <div className="mt-6 card-gradient rounded-bjj p-6 border border-white/10">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableTranscription}
                  onChange={(e) => setEnableTranscription(e.target.checked)}
                  className="rounded border-white/20"
                  disabled={loading}
                />
                <Mic className="w-4 h-4" />
                <span className="text-sm">{t.enableTranscription}</span>
              </label>
            </div>
          )}

          {/* File List */}
          {videoFiles.length > 0 && (
            <div className="mt-6 space-y-4">
              <h2 className="text-xl font-semibold">{t.selectedFiles}</h2>
              {videoFiles.map((videoStatus, index) => (
                <div
                  key={index}
                  className="card-gradient rounded-bjj p-4 border border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Video className="w-5 h-5 text-bjj-muted" />
                      <div>
                        <p className="font-medium">{videoStatus.file.name}</p>
                        <p className="text-sm text-bjj-muted">
                          {(videoStatus.file.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-sm font-medium ${getStatusColor(videoStatus.status)}`}>
                        {getStatusText(videoStatus.status)}
                      </p>
                      {videoStatus.status === 'uploading' && (
                        <div className="mt-2 w-32">
                          <div className="w-full bg-white/10 rounded-full h-2">
                            <div
                              className="bg-bjj-accent h-2 rounded-full transition-all"
                              style={{ width: `${videoStatus.progress}%` }}
                            />
                          </div>
                        </div>
                      )}
                      {videoStatus.error && (
                        <p className="text-xs text-red-500 mt-1">{videoStatus.error}</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          {videoFiles.length > 0 && (
            <div className="mt-8 flex justify-end gap-4">
              <button
                onClick={() => router.back()}
                className="btn-ghost"
                disabled={loading}
              >
                {t.cancel}
              </button>
              <button
                onClick={handleUploadAll}
                className="btn-primary flex items-center gap-2"
                disabled={loading || videoFiles.length === 0}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t.uploading}
                  </>
                ) : (
                  <>
                    <Upload className="w-4 h-4" />
                    {t.uploadAll}
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}