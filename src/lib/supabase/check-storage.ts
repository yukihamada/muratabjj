import { supabase } from './client'

export async function checkAndCreateBuckets() {
  try {
    // Check if buckets exist
    const { data: buckets, error: listError } = await supabase.storage.listBuckets()
    
    if (listError) {
      console.error('Error listing buckets:', listError)
      return false
    }
    
    const existingBuckets = buckets?.map(b => b.name) || []
    const requiredBuckets = ['videos', 'thumbnails', 'avatars']
    
    // Create missing buckets
    for (const bucketName of requiredBuckets) {
      if (!existingBuckets.includes(bucketName)) {
        console.log(`Creating bucket: ${bucketName}`)
        
        const { error: createError } = await supabase.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: bucketName === 'videos' ? 5368709120 : 5242880, // 5GB for videos, 5MB for others
          allowedMimeTypes: bucketName === 'videos' 
            ? ['video/mp4', 'video/quicktime', 'video/x-msvideo']
            : ['image/jpeg', 'image/png', 'image/webp']
        })
        
        if (createError) {
          console.error(`Error creating bucket ${bucketName}:`, createError)
          return false
        }
      }
    }
    
    return true
  } catch (error) {
    console.error('Error in checkAndCreateBuckets:', error)
    return false
  }
}

// Check if user has permission to upload
export async function checkUploadPermission(userId: string) {
  try {
    // Test upload permission by trying to list files in user's directory
    const { error } = await supabase.storage
      .from('videos')
      .list(userId, { limit: 1 })
    
    if (error && error.message.includes('row-level security')) {
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error checking upload permission:', error)
    return false
  }
}