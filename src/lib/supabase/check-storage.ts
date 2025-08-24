import { supabase } from './client'

export async function checkAndCreateBuckets() {
  // バケット作成機能を完全に無効化
  // バケットは既に管理者により手動で作成済み
  console.log('[checkAndCreateBuckets] Skipping bucket creation - buckets are pre-configured')
  return true
}

// Check if user has permission to upload
export async function checkUploadPermission(userId: string) {
  // 権限チェック機能を無効化 - 直接アップロードを試行
  console.log(`[checkUploadPermission] Skipping permission check for user: ${userId}`)
  return true
}