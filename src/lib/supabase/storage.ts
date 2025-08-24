import { supabase } from './client'

// Storage bucket names
export const STORAGE_BUCKETS = {
  VIDEOS: 'videos',
  THUMBNAILS: 'thumbnails',
  AVATARS: 'avatars',
} as const

// Maximum file sizes in bytes
export const MAX_FILE_SIZES = {
  VIDEO: 500 * 1024 * 1024, // 500MB (ブラウザアップロードに現実的なサイズ)
  THUMBNAIL: 5 * 1024 * 1024, // 5MB
  AVATAR: 2 * 1024 * 1024, // 2MB
} as const

console.log('[MAX_FILE_SIZES] Current limits:', {
  VIDEO: MAX_FILE_SIZES.VIDEO,
  VIDEO_GB: MAX_FILE_SIZES.VIDEO / 1024 / 1024 / 1024,
  THUMBNAIL: MAX_FILE_SIZES.THUMBNAIL,
  AVATAR: MAX_FILE_SIZES.AVATAR
})

// Allowed file types
export const ALLOWED_VIDEO_TYPES = [
  'video/mp4', 
  'video/quicktime',  // .mov
  'video/x-msvideo',  // .avi
  'video/mov',        // 追加のMOV形式
  'video/avi'         // 追加のAVI形式
]
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp']

// Upload video to Supabase Storage
export async function uploadVideo(
  file: File,
  userId: string,
  onProgress?: (progress: number) => void
) {
  // Validate file
  console.log(`[uploadVideo] File validation:`, {
    name: file.name,
    type: file.type,
    size: file.size,
    sizeInMB: Math.round(file.size / 1024 / 1024),
    maxAllowed: MAX_FILE_SIZES.VIDEO,
    maxAllowedInMB: MAX_FILE_SIZES.VIDEO / 1024 / 1024
  })
  
  // ファイル拡張子ベースでの追加チェック（MIMEタイプが正しく検出されない場合のフォールバック）
  const fileExt = file.name.split('.').pop()?.toLowerCase()
  const allowedExtensions = ['mp4', 'mov', 'avi', 'webm']
  
  if (!ALLOWED_VIDEO_TYPES.includes(file.type) && !allowedExtensions.includes(fileExt || '')) {
    throw new Error(`Invalid file type: ${file.type}. Only MP4, MOV, AVI, and WebM are allowed.`)
  }
  
  if (file.size > MAX_FILE_SIZES.VIDEO) {
    throw new Error(`File size exceeds ${MAX_FILE_SIZES.VIDEO / 1024 / 1024}MB limit. Your file is ${Math.round(file.size / 1024 / 1024)}MB.`)
  }
  
  // Generate unique filename
  const timestamp = Date.now()
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}/${timestamp}.${fileExt}`
  
  // Upload with progress tracking
  // Starting upload
  
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.VIDEOS)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
      duplex: 'half', // 大きなファイル用の設定
      onUploadProgress: (progress: any) => {
        if (onProgress) {
          const percentage = (progress.loaded / progress.total) * 100
          onProgress(Math.round(percentage))
        }
      },
    })
  
  if (error) {
    // Upload error occurred
    
    // Provide more helpful error messages
    let friendlyError = error.message
    
    if (error.message.includes('row-level security') || error.message.includes('policy') || error.message.includes('permission')) {
      friendlyError = 'アクセス権限の問題です。ページを再読み込みしてから再度お試しください。'
    } else if (error.message.includes('exceeded') || error.message.includes('size')) {
      friendlyError = 'ファイルサイズが大きすぎます。500MB以下のファイルをアップロードしてください。'
    } else if (error.message.includes('mime') || error.message.includes('type')) {
      friendlyError = 'サポートされていないファイル形式です。MP4、MOV、AVI形式のファイルをアップロードしてください。'
    } else if (error.message.includes('bucket') || error.message.includes('not found')) {
      friendlyError = 'ストレージが利用できません。管理者にお問い合わせください。'
    } else if (error.message.includes('authorization') || error.message.includes('JWT') || error.message.includes('auth')) {
      friendlyError = '認証エラーです。ページを再読み込みしてから再度お試しください。'
    }
    
    throw new Error(friendlyError)
  }
  
  // Upload successful
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKETS.VIDEOS)
    .getPublicUrl(data.path)
  
  return {
    path: data.path,
    url: publicUrl,
  }
}

// Upload thumbnail to Supabase Storage
export async function uploadThumbnail(file: File, videoPath: string) {
  // Validate file
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    throw new Error('Invalid file type. Only JPEG, PNG, and WebP are allowed.')
  }
  
  if (file.size > MAX_FILE_SIZES.THUMBNAIL) {
    throw new Error('File size exceeds 5MB limit.')
  }
  
  // Generate filename based on video path
  const videoName = videoPath.split('/').pop()?.split('.')[0]
  const fileExt = file.name.split('.').pop()
  const fileName = `${videoPath.split('/')[0]}/${videoName}_thumb.${fileExt}`
  
  const { data, error } = await supabase.storage
    .from(STORAGE_BUCKETS.THUMBNAILS)
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: true,
    })
  
  if (error) throw error
  
  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from(STORAGE_BUCKETS.THUMBNAILS)
    .getPublicUrl(data.path)
  
  return {
    path: data.path,
    url: publicUrl,
  }
}

// Delete video from storage
export async function deleteVideo(path: string) {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.VIDEOS)
    .remove([path])
  
  if (error) throw error
}

// Delete thumbnail from storage
export async function deleteThumbnail(path: string) {
  const { error } = await supabase.storage
    .from(STORAGE_BUCKETS.THUMBNAILS)
    .remove([path])
  
  if (error) throw error
}

// Generate video thumbnail (client-side)
export function generateVideoThumbnail(videoFile: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    
    if (!ctx) {
      reject(new Error('Could not get canvas context'))
      return
    }
    
    video.onloadedmetadata = () => {
      video.currentTime = video.duration * 0.1 // 10% into the video
    }
    
    video.onseeked = () => {
      canvas.width = video.videoWidth
      canvas.height = video.videoHeight
      ctx.drawImage(video, 0, 0)
      
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob)
        } else {
          reject(new Error('Could not generate thumbnail'))
        }
        // Clean up
        URL.revokeObjectURL(video.src)
      }, 'image/jpeg', 0.8)
    }
    
    video.onerror = () => {
      reject(new Error('Could not load video'))
      URL.revokeObjectURL(video.src)
    }
    
    video.src = URL.createObjectURL(videoFile)
  })
}

// Get video duration
export function getVideoDuration(videoFile: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video')
    
    video.onloadedmetadata = () => {
      resolve(Math.round(video.duration))
      URL.revokeObjectURL(video.src)
    }
    
    video.onerror = () => {
      reject(new Error('Could not load video'))
      URL.revokeObjectURL(video.src)
    }
    
    video.src = URL.createObjectURL(videoFile)
  })
}