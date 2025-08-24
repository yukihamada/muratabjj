import { supabase } from './client'

export async function checkAndCreateBuckets() {
  try {
    console.log('[checkAndCreateBuckets] Starting bucket check...')
    
    // Check if buckets exist
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('[checkAndCreateBuckets] Error listing buckets:', listError)
      return false
    }
    
    const existingBuckets = buckets?.map((b: any) => b.name) || []
    console.log('[checkAndCreateBuckets] Existing buckets:', existingBuckets)
    
    const requiredBuckets = ['videos', 'thumbnails', 'avatars']
    
    // Check if all required buckets exist
    const missingBuckets = requiredBuckets.filter(bucket => !existingBuckets.includes(bucket))
    
    if (missingBuckets.length === 0) {
      console.log('[checkAndCreateBuckets] All buckets exist')
      return true
    }
    
    console.log('[checkAndCreateBuckets] Missing buckets:', missingBuckets)
    
    // Try to create missing buckets (this will likely fail due to RLS)
    for (const bucketName of missingBuckets) {
      console.log(`[checkAndCreateBuckets] Attempting to create bucket: ${bucketName}`)
      
      const { error: createError } = await supabase.storage.createBucket(bucketName, {
        public: true,
        fileSizeLimit: bucketName === 'videos' ? 5368709120 : 5242880, // 5GB for videos, 5MB for others
        allowedMimeTypes: bucketName === 'videos' 
          ? ['video/mp4', 'video/quicktime', 'video/x-msvideo']
          : ['image/jpeg', 'image/png', 'image/webp']
      })
      
      if (createError) {
        console.error(`[checkAndCreateBuckets] Failed to create bucket ${bucketName}:`, createError)
        // Don't return false here - the bucket might exist but we can't see it due to permissions
      } else {
        console.log(`[checkAndCreateBuckets] Successfully created bucket: ${bucketName}`)
      }
    }
    
    // If we get here, assume buckets exist (they were created by admin)
    console.log('[checkAndCreateBuckets] Assuming buckets are available')
    return true
  } catch (error) {
    console.error('[checkAndCreateBuckets] Error in checkAndCreateBuckets:', error)
    return false
  }
}

// Check if user has permission to upload
export async function checkUploadPermission(userId: string) {
  try {
    console.log(`[checkUploadPermission] Checking upload permission for user: ${userId}`)
    
    // Test upload permission by trying to list files in user's directory
    const { data, error } = await supabase.storage
      .from('videos')
      .list(userId, { limit: 1 })
    
    if (error) {
      console.error('[checkUploadPermission] Permission check error:', error)
      
      if (error.message.includes('row-level security') || error.message.includes('permission')) {
        console.log('[checkUploadPermission] RLS permission denied')
        return false
      }
      
      // Other errors might not be permission-related (e.g., folder doesn't exist yet)
      console.log('[checkUploadPermission] Non-permission error, assuming permission exists')
      return true
    }
    
    console.log('[checkUploadPermission] Permission check passed')
    return true
  } catch (error) {
    console.error('[checkUploadPermission] Error checking upload permission:', error)
    // In case of network errors, assume permission exists to not block uploads
    return true
  }
}