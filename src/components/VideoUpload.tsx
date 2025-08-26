'use client'

import React, { useState, useRef, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Upload, X, FileVideo, AlertCircle } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { uploadVideo, uploadThumbnail, generateVideoThumbnail, getVideoDuration, ALLOWED_VIDEO_TYPES, MAX_FILE_SIZES } from '@/lib/supabase/storage'
import { getTechniques } from '@/lib/supabase/helpers'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface VideoMetadata {
  title_ja: string
  title_en: string
  title_pt: string
  description_ja: string
  description_en: string
  description_pt: string
  technique_id: string
  belt_requirement: string
  is_premium: boolean
}

const translations: Record<string, {
  uploadVideo: string
  dragDrop: string
  or: string
  browse: string
  allowedFormats: string
  uploading: string
  processing: string
  cancel: string
  metadata: string
  titleJa: string
  titleEn: string
  titlePt: string
  descriptionJa: string
  descriptionEn: string
  descriptionPt: string
  technique: string
  selectTechnique: string
  beltRequirement: string
  white: string
  blue: string
  purple: string
  brown: string
  black: string
  isPremium: string
  upload: string
  error: string
  success: string
  videoUploaded: string
}> = {
  ja: {
    uploadVideo: '動画をアップロード',
    dragDrop: 'ここにドラッグ＆ドロップ',
    or: 'または',
    browse: 'ファイルを選択',
    allowedFormats: '対応形式：MP4、MOV、AVI（最大500MB）',
    uploading: 'アップロード中...',
    processing: '処理中...',
    cancel: 'キャンセル',
    metadata: '動画情報',
    titleJa: 'タイトル（日本語）',
    titleEn: 'タイトル（英語）',
    titlePt: 'タイトル（ポルトガル語）',
    descriptionJa: '説明（日本語）',
    descriptionEn: '説明（英語）',
    descriptionPt: '説明（ポルトガル語）',
    technique: '技術',
    selectTechnique: '技術を選択',
    beltRequirement: '必要帯',
    white: '白帯',
    blue: '青帯',
    purple: '紫帯',
    brown: '茶帯',
    black: '黒帯',
    isPremium: 'プレミアムコンテンツ',
    upload: 'アップロード',
    error: 'エラー',
    success: '成功',
    videoUploaded: '動画がアップロードされました',
  },
  en: {
    uploadVideo: 'Upload Video',
    dragDrop: 'Drag & drop here',
    or: 'or',
    browse: 'Browse files',
    allowedFormats: 'Allowed: MP4, MOV, AVI (max 500MB)',
    uploading: 'Uploading...',
    processing: 'Processing...',
    cancel: 'Cancel',
    metadata: 'Video Information',
    titleJa: 'Title (Japanese)',
    titleEn: 'Title (English)',
    titlePt: 'Title (Portuguese)',
    descriptionJa: 'Description (Japanese)',
    descriptionEn: 'Description (English)',
    descriptionPt: 'Description (Portuguese)',
    technique: 'Technique',
    selectTechnique: 'Select technique',
    beltRequirement: 'Belt Requirement',
    white: 'White Belt',
    blue: 'Blue Belt',
    purple: 'Purple Belt',
    brown: 'Brown Belt',
    black: 'Black Belt',
    isPremium: 'Premium Content',
    upload: 'Upload',
    error: 'Error',
    success: 'Success',
    videoUploaded: 'Video uploaded successfully',
  },
  pt: {
    uploadVideo: 'Enviar Vídeo',
    dragDrop: 'Arraste e solte aqui',
    or: 'ou',
    browse: 'Escolher arquivo',
    allowedFormats: 'Permitido: MP4, MOV, AVI (máx 500MB)',
    uploading: 'Enviando...',
    processing: 'Processando...',
    cancel: 'Cancelar',
    metadata: 'Informações do Vídeo',
    titleJa: 'Título (Japonês)',
    titleEn: 'Título (Inglês)',
    titlePt: 'Título (Português)',
    descriptionJa: 'Descrição (Japonês)',
    descriptionEn: 'Descrição (Inglês)',
    descriptionPt: 'Descrição (Português)',
    technique: 'Técnica',
    selectTechnique: 'Selecionar técnica',
    beltRequirement: 'Faixa Necessária',
    white: 'Faixa Branca',
    blue: 'Faixa Azul',
    purple: 'Faixa Roxa',
    brown: 'Faixa Marrom',
    black: 'Faixa Preta',
    isPremium: 'Conteúdo Premium',
    upload: 'Enviar',
    error: 'Erro',
    success: 'Sucesso',
    videoUploaded: 'Vídeo enviado com sucesso',
  },
  es: {
    uploadVideo: 'Subir Video',
    dragDrop: 'Arrastra y suelta aquí',
    or: 'o',
    browse: 'Seleccionar archivo',
    allowedFormats: 'Permitido: MP4, MOV, AVI (máx 500MB)',
    uploading: 'Subiendo...',
    processing: 'Procesando...',
    cancel: 'Cancelar',
    metadata: 'Información del Video',
    titleJa: 'Título (Japonés)',
    titleEn: 'Título (Inglés)',
    titlePt: 'Título (Portugués)',
    descriptionJa: 'Descripción (Japonés)',
    descriptionEn: 'Descripción (Inglés)',
    descriptionPt: 'Descripción (Portugués)',
    technique: 'Técnica',
    selectTechnique: 'Seleccionar técnica',
    beltRequirement: 'Cinturón Requerido',
    white: 'Cinturón Blanco',
    blue: 'Cinturón Azul',
    purple: 'Cinturón Morado',
    brown: 'Cinturón Marrón',
    black: 'Cinturón Negro',
    isPremium: 'Contenido Premium',
    upload: 'Subir',
    error: 'Error',
    success: 'Éxito',
    videoUploaded: 'Video subido exitosamente',
  },
  fr: {
    uploadVideo: 'Télécharger Vidéo',
    dragDrop: 'Glissez et déposez ici',
    or: 'ou',
    browse: 'Parcourir les fichiers',
    allowedFormats: 'Autorisé: MP4, MOV, AVI (max 500MB)',
    uploading: 'Téléchargement...',
    processing: 'Traitement...',
    cancel: 'Annuler',
    metadata: 'Informations Vidéo',
    titleJa: 'Titre (Japonais)',
    titleEn: 'Titre (Anglais)',
    titlePt: 'Titre (Portugais)',
    descriptionJa: 'Description (Japonais)',
    descriptionEn: 'Description (Anglais)',
    descriptionPt: 'Description (Portugais)',
    technique: 'Technique',
    selectTechnique: 'Sélectionner technique',
    beltRequirement: 'Ceinture Requise',
    white: 'Ceinture Blanche',
    blue: 'Ceinture Bleue',
    purple: 'Ceinture Violette',
    brown: 'Ceinture Marron',
    black: 'Ceinture Noire',
    isPremium: 'Contenu Premium',
    upload: 'Télécharger',
    error: 'Erreur',
    success: 'Succès',
    videoUploaded: 'Vidéo téléchargée avec succès',
  },
  ko: {
    uploadVideo: '비디오 업로드',
    dragDrop: '여기에 드래그 앤 드롭',
    or: '또는',
    browse: '파일 선택',
    allowedFormats: '허용: MP4, MOV, AVI (최대 500MB)',
    uploading: '업로드 중...',
    processing: '처리 중...',
    cancel: '취소',
    metadata: '비디오 정보',
    titleJa: '제목 (일본어)',
    titleEn: '제목 (영어)',
    titlePt: '제목 (포르투갈어)',
    descriptionJa: '설명 (일본어)',
    descriptionEn: '설명 (영어)',
    descriptionPt: '설명 (포르투갈어)',
    technique: '기술',
    selectTechnique: '기술 선택',
    beltRequirement: '필요 벨트',
    white: '화이트 벨트',
    blue: '블루 벨트',
    purple: '퍼플 벨트',
    brown: '브라운 벨트',
    black: '블랙 벨트',
    isPremium: '프리미엄 콘텐츠',
    upload: '업로드',
    error: '오류',
    success: '성공',
    videoUploaded: '비디오가 성공적으로 업로드되었습니다',
  },
  ru: {
    uploadVideo: 'Загрузить видео',
    dragDrop: 'Перетащите сюда',
    or: 'или',
    browse: 'Выбрать файл',
    allowedFormats: 'Разрешено: MP4, MOV, AVI (макс 500MB)',
    uploading: 'Загрузка...',
    processing: 'Обработка...',
    cancel: 'Отмена',
    metadata: 'Информация о видео',
    titleJa: 'Название (Японский)',
    titleEn: 'Название (Английский)',
    titlePt: 'Название (Португальский)',
    descriptionJa: 'Описание (Японский)',
    descriptionEn: 'Описание (Английский)',
    descriptionPt: 'Описание (Португальский)',
    technique: 'Техника',
    selectTechnique: 'Выбрать технику',
    beltRequirement: 'Требуемый пояс',
    white: 'Белый пояс',
    blue: 'Синий пояс',
    purple: 'Фиолетовый пояс',
    brown: 'Коричневый пояс',
    black: 'Чёрный пояс',
    isPremium: 'Премиум контент',
    upload: 'Загрузить',
    error: 'Ошибка',
    success: 'Успех',
    videoUploaded: 'Видео успешно загружено',
  },
  zh: {
    uploadVideo: '上传视频',
    dragDrop: '拖放到这里',
    or: '或',
    browse: '浏览文件',
    allowedFormats: '允许：MP4、MOV、AVI（最大500MB）',
    uploading: '上传中...',
    processing: '处理中...',
    cancel: '取消',
    metadata: '视频信息',
    titleJa: '标题（日语）',
    titleEn: '标题（英语）',
    titlePt: '标题（葡萄牙语）',
    descriptionJa: '描述（日语）',
    descriptionEn: '描述（英语）',
    descriptionPt: '描述（葡萄牙语）',
    technique: '技术',
    selectTechnique: '选择技术',
    beltRequirement: '所需腰带',
    white: '白带',
    blue: '蓝带',
    purple: '紫带',
    brown: '棕带',
    black: '黑带',
    isPremium: '高级内容',
    upload: '上传',
    error: '错误',
    success: '成功',
    videoUploaded: '视频上传成功',
  },
  de: {
    uploadVideo: 'Video hochladen',
    dragDrop: 'Hier ablegen',
    or: 'oder',
    browse: 'Dateien durchsuchen',
    allowedFormats: 'Erlaubt: MP4, MOV, AVI (max 500MB)',
    uploading: 'Hochladen...',
    processing: 'Verarbeitung...',
    cancel: 'Abbrechen',
    metadata: 'Video-Informationen',
    titleJa: 'Titel (Japanisch)',
    titleEn: 'Titel (Englisch)',
    titlePt: 'Titel (Portugiesisch)',
    descriptionJa: 'Beschreibung (Japanisch)',
    descriptionEn: 'Beschreibung (Englisch)',
    descriptionPt: 'Beschreibung (Portugiesisch)',
    technique: 'Technik',
    selectTechnique: 'Technik auswählen',
    beltRequirement: 'Erforderlicher Gürtel',
    white: 'Weißer Gürtel',
    blue: 'Blauer Gürtel',
    purple: 'Lila Gürtel',
    brown: 'Brauner Gürtel',
    black: 'Schwarzer Gürtel',
    isPremium: 'Premium-Inhalt',
    upload: 'Hochladen',
    error: 'Fehler',
    success: 'Erfolg',
    videoUploaded: 'Video erfolgreich hochgeladen',
  },
  it: {
    uploadVideo: 'Carica Video',
    dragDrop: 'Trascina qui',
    or: 'o',
    browse: 'Sfoglia file',
    allowedFormats: 'Consentiti: MP4, MOV, AVI (max 500MB)',
    uploading: 'Caricamento...',
    processing: 'Elaborazione...',
    cancel: 'Annulla',
    metadata: 'Informazioni Video',
    titleJa: 'Titolo (Giapponese)',
    titleEn: 'Titolo (Inglese)',
    titlePt: 'Titolo (Portoghese)',
    descriptionJa: 'Descrizione (Giapponese)',
    descriptionEn: 'Descrizione (Inglese)',
    descriptionPt: 'Descrizione (Portoghese)',
    technique: 'Tecnica',
    selectTechnique: 'Seleziona tecnica',
    beltRequirement: 'Cintura Richiesta',
    white: 'Cintura Bianca',
    blue: 'Cintura Blu',
    purple: 'Cintura Viola',
    brown: 'Cintura Marrone',
    black: 'Cintura Nera',
    isPremium: 'Contenuto Premium',
    upload: 'Carica',
    error: 'Errore',
    success: 'Successo',
    videoUploaded: 'Video caricato con successo',
  },
}

export default function VideoUpload() {
  const { locale } = useLanguage()
  const t = translations[locale]
  const router = useRouter()
  
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [techniques, setTechniques] = useState<any[]>([])
  const [metadata, setMetadata] = useState<VideoMetadata>({
    title_ja: '',
    title_en: '',
    title_pt: '',
    description_ja: '',
    description_en: '',
    description_pt: '',
    technique_id: '',
    belt_requirement: 'white',
    is_premium: false,
  })
  
  // Load techniques on mount
  React.useEffect(() => {
    async function loadTechniques() {
      const { data, error } = await getTechniques()
      if (data && !error) {
        setTechniques(data)
      }
    }
    loadTechniques()
  }, [])
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Validate file type
      if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
        setError(t.error + ': Invalid file type')
        return
      }
      
      // Validate file size
      if (file.size > MAX_FILE_SIZES.VIDEO) {
        setError(t.error + ': File too large')
        return
      }
      
      setVideoFile(file)
      setError(null)
    }
  }, [t])
  
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'video/*': ['.mp4', '.mov', '.avi'],
    },
    maxFiles: 1,
    maxSize: MAX_FILE_SIZES.VIDEO,
  })
  
  const handleUpload = async () => {
    if (!videoFile || !metadata.title_ja || !metadata.title_en || !metadata.title_pt) {
      setError('Please fill in all required fields')
      return
    }
    
    setIsUploading(true)
    setError(null)
    
    try {
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')
      
      // Upload video
      const videoResult = await uploadVideo(
        videoFile,
        user.id,
        (progress) => setUploadProgress(progress)
      )
      
      // Generate and upload thumbnail
      setUploadProgress(100)
      const thumbnailBlob = await generateVideoThumbnail(videoFile)
      const thumbnailFile = new File([thumbnailBlob], 'thumbnail.jpg', { type: 'image/jpeg' })
      const thumbnailResult = await uploadThumbnail(thumbnailFile, videoResult.path)
      
      // Get video duration
      const duration = await getVideoDuration(videoFile)
      
      // Save video metadata to database
      const { data: newVideo, error: dbError } = await supabase
        .from('videos')
        .insert({
          ...metadata,
          url: videoResult.url,
          thumbnail_url: thumbnailResult.url,
          duration,
          instructor_id: user.id,
        })
        .select()
        .single()
      
      if (dbError) throw dbError
      
      // Success - redirect to video page
      router.push(`/videos/${newVideo.id}`)
    } catch (err) {
      console.error('Upload error:', err)
      setError(err instanceof Error ? err.message : 'Upload failed')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }
  
  const handleMetadataChange = (field: keyof VideoMetadata, value: any) => {
    setMetadata(prev => ({ ...prev, [field]: value }))
  }
  
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8">{t.uploadVideo}</h1>
      
      {/* Upload Area */}
      {!videoFile && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-purple-500 bg-purple-50' : 'border-gray-300 hover:border-purple-400'
          }`}
        >
          <input {...getInputProps()} />
          <FileVideo className="w-16 h-16 mx-auto mb-4 text-gray-400" />
          <p className="text-lg mb-2">{t.dragDrop}</p>
          <p className="text-sm text-gray-500 mb-4">{t.or}</p>
          <button className="btn-primary">{t.browse}</button>
          <p className="text-xs text-gray-500 mt-4">{t.allowedFormats}</p>
        </div>
      )}
      
      {/* Selected File */}
      {videoFile && !isUploading && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <FileVideo className="w-12 h-12 text-purple-600" />
              <div>
                <p className="font-medium">{videoFile.name}</p>
                <p className="text-sm text-gray-500">
                  {(videoFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                setVideoFile(null)
                setMetadata({
                  title_ja: '',
                  title_en: '',
                  title_pt: '',
                  description_ja: '',
                  description_en: '',
                  description_pt: '',
                  technique_id: '',
                  belt_requirement: 'white',
                  is_premium: false,
                })
              }}
              className="text-gray-500 hover:text-red-500"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
      
      {/* Upload Progress */}
      {isUploading && (
        <div className="bg-gray-50 rounded-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">
              {uploadProgress < 100 ? t.uploading : t.processing}
            </span>
            <span className="text-sm text-gray-500">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-purple-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Metadata Form */}
      {videoFile && !isUploading && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">{t.metadata}</h2>
          
          {/* Titles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t.titleJa} *</label>
              <input
                type="text"
                value={metadata.title_ja}
                onChange={(e) => handleMetadataChange('title_ja', e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t.titleEn} *</label>
              <input
                type="text"
                value={metadata.title_en}
                onChange={(e) => handleMetadataChange('title_en', e.target.value)}
                className="input"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t.titlePt} *</label>
              <input
                type="text"
                value={metadata.title_pt}
                onChange={(e) => handleMetadataChange('title_pt', e.target.value)}
                className="input"
                required
              />
            </div>
          </div>
          
          {/* Descriptions */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t.descriptionJa}</label>
              <textarea
                value={metadata.description_ja}
                onChange={(e) => handleMetadataChange('description_ja', e.target.value)}
                className="input"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t.descriptionEn}</label>
              <textarea
                value={metadata.description_en}
                onChange={(e) => handleMetadataChange('description_en', e.target.value)}
                className="input"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">{t.descriptionPt}</label>
              <textarea
                value={metadata.description_pt}
                onChange={(e) => handleMetadataChange('description_pt', e.target.value)}
                className="input"
                rows={3}
              />
            </div>
          </div>
          
          {/* Other fields */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">{t.technique}</label>
              <select
                value={metadata.technique_id}
                onChange={(e) => handleMetadataChange('technique_id', e.target.value)}
                className="input"
              >
                <option value="">{t.selectTechnique}</option>
                {techniques.map((technique) => (
                  <option key={technique.id} value={technique.id}>
                    {technique[`name_${locale}`]}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">{t.beltRequirement}</label>
              <select
                value={metadata.belt_requirement}
                onChange={(e) => handleMetadataChange('belt_requirement', e.target.value)}
                className="input"
              >
                <option value="white">{t.white}</option>
                <option value="blue">{t.blue}</option>
                <option value="purple">{t.purple}</option>
                <option value="brown">{t.brown}</option>
                <option value="black">{t.black}</option>
              </select>
            </div>
            
            <div className="flex items-center">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={metadata.is_premium}
                  onChange={(e) => handleMetadataChange('is_premium', e.target.checked)}
                  className="w-4 h-4 text-purple-600 rounded"
                />
                <span className="text-sm font-medium">{t.isPremium}</span>
              </label>
            </div>
          </div>
          
          {/* Error message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          
          {/* Upload button */}
          <div className="flex justify-end">
            <button
              onClick={handleUpload}
              disabled={isUploading}
              className="btn-primary"
            >
              <Upload className="w-4 h-4 mr-2" />
              {t.upload}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}